import { SeasonName, SeasonSlot } from "./types.js";

/**
 * Bangladesh Cropping Seasons:
 * - Rabi: November - February (cool, dry season)
 * - Kharif-1: March - June (pre-monsoon, hot, occasional thundershowers)
 * - Kharif-2: June - October (monsoon, heavy precipitation, flood-prone)
 */
export function getCurrentSeason(date: Date = new Date()): SeasonName {
  const month = date.getMonth() + 1; // 1 - 12

  if (month >= 11 || month <= 2) {
    return "Rabi";
  } else if (month >= 3 && month <= 5) {
    return "Kharif-1";
  } else {
    // 6 to 10
    return "Kharif-2";
  }
}

export function getNextSeason(current: SeasonName): SeasonName {
  switch (current) {
    case "Rabi":
      return "Kharif-1";
    case "Kharif-1":
      return "Kharif-2";
    case "Kharif-2":
      return "Rabi";
  }
}

/**
 * Generate 12 season slots (4 years x 3 seasons) starting from the current or specified date.
 */
export function generateSeasonSlots(startDate: Date = new Date(), count: number = 12): SeasonSlot[] {
  const slots: SeasonSlot[] = [];
  let runningSeason = getCurrentSeason(startDate);

  for (let i = 0; i < count; i++) {
    const yearNumber = Math.floor(i / 3) + 1; // 4 years: Year 1 (0,1,2), Year 2 (3,4,5), Year 3 (6,7,8), Year 4 (9,10,11)
    slots.push({
      year: yearNumber,
      season: runningSeason,
      index: i,
    });

    runningSeason = getNextSeason(runningSeason);
  }

  return slots;
}
