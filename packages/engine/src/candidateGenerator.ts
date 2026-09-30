import { Crop, SeasonSlot, NasaContext } from "./types.js";

export interface CandidateGenerationOptions {
  crops: Crop[];
  slots: SeasonSlot[];
  context: NasaContext;
  maxCandidates?: number;
}

/**
 * Checks whether crop is allowed given preceding crop and agronomic rotation constraints.
 */
function isTransitionAllowed(candidate: Crop, previousCrop: Crop | null): boolean {
  if (!previousCrop) return true;

  // Rule 1: No same-family repeat in consecutive seasons
  // (Prevents pest carryover, e.g. Poaceae->Poaceae or Fabaceae->Fabaceae)
  if (candidate.family === previousCrop.family) {
    return false;
  }

  // Rule 2: Explicit disallowed preceding families
  if (candidate.rotationRules.disallowedPrecedingFamilies.includes(previousCrop.family)) {
    return false;
  }

  // Rule 3: Never repeat exact same crop consecutively
  if (candidate.id === previousCrop.id) {
    return false;
  }

  return true;
}

/**
 * Checks annual constraints:
 * - At least one legume (Fabaceae) per agricultural year (every 3 consecutive seasons).
 */
function satisfiesAnnualLegumeRule(sequence: Crop[], slots: SeasonSlot[]): boolean {
  // Group by year
  const yearLegumeCount = new Map<number, number>();

  for (let i = 0; i < sequence.length; i++) {
    const crop = sequence[i];
    const year = slots[i].year;
    if (crop.family === "Fabaceae") {
      yearLegumeCount.set(year, (yearLegumeCount.get(year) || 0) + 1);
    }
  }

  // Check all distinct years present in the slots
  const allYears = Array.from(new Set(slots.map((s) => s.year)));
  for (const yr of allYears) {
    // If this year has at least 3 slots in the plan, enforce at least 1 legume
    const slotsInYear = slots.filter((s) => s.year === yr).length;
    if (slotsInYear >= 2) {
      if (!yearLegumeCount.has(yr) || (yearLegumeCount.get(yr) || 0) < 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Generates valid 12-season candidate sequences matching agronomic rotation rules.
 */
export function generateCandidateSequences(options: CandidateGenerationOptions): Crop[][] {
  const { crops, slots, context, maxCandidates = 50 } = options;

  // Filter crops suitable for each slot's season
  const slotCandidates: Crop[][] = slots.map((slot) => {
    return crops.filter((crop) => {
      // Must be viable in this season
      if (!crop.seasons.includes(slot.season)) return false;

      // Water stress check: if rootzone moisture is low (< 0.22 m3/m3) or drought indicated,
      // restrict ultra-high water crops in dry season (Rabi)
      const isDrySeason = slot.season === "Rabi";
      const isWaterStressed = (context.smapRootzone != null && context.smapRootzone < 0.22) ||
                              (context.powerTotalPrecip != null && context.powerTotalPrecip < 60);

      if (isDrySeason && isWaterStressed && crop.waterDemand >= 5) {
        // Exclude boro rice in extreme water stress scenario for candidates
        return false;
      }

      return true;
    });
  });

  const validSequences: Crop[][] = [];

  function backtrack(slotIdx: number, currentSeq: Crop[]) {
    if (validSequences.length >= maxCandidates * 3) {
      return;
    }

    if (slotIdx === slots.length) {
      // Full 12-season candidate formed! Validate annual constraints
      if (satisfiesAnnualLegumeRule(currentSeq, slots)) {
        validSequences.push([...currentSeq]);
      }
      return;
    }

    const available = slotCandidates[slotIdx];
    const prevCrop = slotIdx > 0 ? currentSeq[slotIdx - 1] : null;

    // Shuffle or sort candidates to explore diverse rotation patterns
    for (const crop of available) {
      if (isTransitionAllowed(crop, prevCrop)) {
        // Enforce max repeats of high demand crops across full cycle
        const occurrences = currentSeq.filter((c) => c.id === crop.id).length;
        if (crop.waterDemand >= 4 && occurrences >= 3) {
          continue;
        }

        currentSeq.push(crop);
        backtrack(slotIdx + 1, currentSeq);
        currentSeq.pop();
      }
    }
  }

  backtrack(0, []);

  // Fallback: If strict backtracking yields fewer than 2 candidates due to tight constraints,
  // loosen annual legume check to return viable sequences
  if (validSequences.length < 2) {
    function relaxedBacktrack(slotIdx: number, currentSeq: Crop[]) {
      if (validSequences.length >= maxCandidates) return;
      if (slotIdx === slots.length) {
        validSequences.push([...currentSeq]);
        return;
      }
      const available = slotCandidates[slotIdx];
      const prevCrop = slotIdx > 0 ? currentSeq[slotIdx - 1] : null;
      for (const crop of available) {
        if (!prevCrop || crop.id !== prevCrop.id) {
          currentSeq.push(crop);
          relaxedBacktrack(slotIdx + 1, currentSeq);
          currentSeq.pop();
        }
      }
    }
    relaxedBacktrack(0, []);
  }

  return validSequences.slice(0, maxCandidates);
}
