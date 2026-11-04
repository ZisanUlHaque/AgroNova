import { Droplets, Waves } from "lucide-react";

interface DailyObservation {
  date: string;
  precipitation: number | null;
  et0: number | null;
}

interface PowerTrendChartProps {
  dailySummary: unknown;
  language: "en" | "bn";
  freshness: "fresh" | "stale" | "unknown";
}

function readDailyObservations(value: unknown): DailyObservation[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): DailyObservation[] => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    const rawDate = typeof row.date === "string" ? row.date : "";
    const date = /^\d{8}$/.test(rawDate)
      ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
      : rawDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];

    const rawPrecipitation = row.precipitation ?? row.precip;
    const precipitation =
      typeof rawPrecipitation === "number" && Number.isFinite(rawPrecipitation) && rawPrecipitation >= 0
        ? rawPrecipitation
        : null;
    const et0 =
      typeof row.et0 === "number" && Number.isFinite(row.et0) && row.et0 >= 0
        ? row.et0
        : null;
    if (precipitation === null && et0 === null) return [];
    return [{ date, precipitation, et0 }];
  });
}

export function PowerTrendChart({ dailySummary, language, freshness }: PowerTrendChartProps) {
  const isBengali = language === "bn";
  const observations = readDailyObservations(dailySummary);
  const maximum = Math.max(
    1,
    ...observations.flatMap((day) => [day.precipitation ?? 0, day.et0 ?? 0])
  );
  const xPosition = (index: number) => 28 + (index * 544) / Math.max(1, observations.length - 1);
  const yPosition = (value: number) => 126 - (value / maximum) * 92;
  const et0Segments: string[][] = [];
  observations.forEach((day, index) => {
    if (day.et0 === null) {
      if (et0Segments[et0Segments.length - 1]?.length) et0Segments.push([]);
      return;
    }
    if (!et0Segments.length) et0Segments.push([]);
    et0Segments[et0Segments.length - 1].push(`${xPosition(index)},${yPosition(day.et0)}`);
  });
  const freshnessLabel = freshness === "fresh"
    ? isBengali ? "সাম্প্রতিক তথ্য" : "Fresh data"
    : freshness === "stale"
      ? isBengali ? "পুরোনো সংরক্ষিত তথ্য" : "Stale cached data"
      : isBengali ? "তথ্যের সতেজতা অজানা" : "Freshness unknown";

  return (
    <section
      className="dashboard-panel rounded-2xl border p-4 sm:p-5"
      aria-labelledby="power-trend-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="power-trend-title" className="text-base font-extrabold text-[#193b2c]">
            {isBengali ? "সাম্প্রতিক বৃষ্টি ও ET₀" : "Recent rainfall & ET₀"}
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#61766a]">
            {isBengali
              ? "NASA POWER-এর পাওয়া দৈনিক তথ্য; এটি পূর্বাভাস বা জমির পানির ভারসাম্য নয়।"
              : "Daily values returned by NASA POWER; not a forecast or field water balance."}
          </p>
        </div>
        <span className="rounded-full border border-[#d7e4d0] bg-[#eef4e8] px-3 py-1 text-[11px] font-bold text-[#436249]">
          {freshnessLabel}
        </span>
      </div>

      {observations.length > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#526c5a]">
            <span className="inline-flex items-center gap-2">
              <Droplets size={15} aria-hidden="true" className="text-[#3986a1]" />
              {isBengali ? "বৃষ্টি · mm/day" : "Rain · mm/day"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Waves size={15} aria-hidden="true" className="text-[#bd8341]" />
              {isBengali ? "ET₀ · mm/day (হিসাব)" : "ET₀ · mm/day (calculated)"}
            </span>
          </div>
          <p className="mt-2 text-[10px] font-medium text-[#6e8173]">
            {isBengali
              ? `চার্টের স্কেল: ০–${maximum.toFixed(1)} mm/day`
              : `Chart scale: 0–${maximum.toFixed(1)} mm/day`}
          </p>
          <svg
            className="mt-2 h-auto w-full overflow-visible"
            viewBox="0 0 600 158"
            role="img"
            aria-describedby="power-trend-values"
            aria-label={
              isBengali
                ? `NASA POWER-এর ${observations.length} দিনের বৃষ্টি ও ET₀ তথ্য`
                : `${observations.length} days of NASA POWER rainfall and ET₀ data`
            }
          >
            <line x1="24" y1="126" x2="578" y2="126" stroke="#d9e3d5" strokeWidth="1" />
            <line x1="24" y1="80" x2="578" y2="80" stroke="#e8eee5" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="24" y1="34" x2="578" y2="34" stroke="#e8eee5" strokeWidth="1" strokeDasharray="4 5" />
            {observations.map((day, index) => {
              const x = xPosition(index);
              const rainY = day.precipitation === null ? 126 : yPosition(day.precipitation);
              const rainHeight = day.precipitation === null ? 0 : 126 - rainY;
              return (
                <g key={day.date}>
                  {day.precipitation !== null && (
                    <rect
                      x={x - 5}
                      y={rainY}
                      width="10"
                      height={rainHeight}
                      rx="3"
                      fill="#5794a3"
                      opacity=".78"
                    >
                      <title>{`${day.date}: ${day.precipitation.toFixed(1)} mm rain`}</title>
                    </rect>
                  )}
                  {day.precipitation === null && (
                    <line
                      x1={x - 3}
                      x2={x + 3}
                      y1="126"
                      y2="126"
                      stroke="#9aa99b"
                      strokeWidth="2"
                      strokeDasharray="1 2"
                    />
                  )}
                  {index === 0 || index === Math.floor((observations.length - 1) / 2) || index === observations.length - 1 ? (
                    <text x={x} y="148" textAnchor="middle" fill="#6e8173" fontSize="10">
                      {day.date.slice(5)}
                    </text>
                  ) : null}
                </g>
              );
            })}
            {et0Segments.filter((segment) => segment.length > 1).map((segment, index) => (
              <polyline
                key={`et0-segment-${index}`}
                points={segment.join(" ")}
                fill="none"
                stroke="#bd8341"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {observations.map((day, index) => day.et0 === null ? null : (
              <circle
                key={`${day.date}-et0`}
                cx={xPosition(index)}
                cy={yPosition(day.et0)}
                r="3"
                fill="#bd8341"
              >
                <title>{`${day.date}: ${day.et0.toFixed(2)} mm/day ET₀`}</title>
              </circle>
            ))}
          </svg>
          <ul id="power-trend-values" className="sr-only">
            {observations.map((day) => (
              <li key={`${day.date}-summary`}>
                {day.date}: {isBengali ? "বৃষ্টি" : "rain"}{" "}
                {day.precipitation === null ? (isBengali ? "তথ্য নেই" : "unavailable") : `${day.precipitation} mm`}
                ; ET₀{" "}
                {day.et0 === null ? (isBengali ? "তথ্য নেই" : "unavailable") : `${day.et0} mm/day`}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] leading-4 text-[#6e8173]">
            {isBengali
              ? "ফাঁকা মানগুলো উৎসে পাওয়া যায়নি; সেগুলো পূরণ বা অনুমান করা হয়নি।"
              : "Missing source values are left blank; they are not filled or estimated."}
          </p>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-[#e5dbc0] bg-[#fff9e9] px-4 py-3 text-xs leading-5 text-[#775d2f]">
          {isBengali
            ? "দৈনিক বৃষ্টি বা ET₀ তথ্য পাওয়া যায়নি। বিশ্লেষণ সম্পন্ন হলে উৎসে থাকা মান এখানে দেখা যাবে।"
            : "Daily rainfall and ET₀ values are unavailable. Values returned by the source will appear here after analysis."}
        </p>
      )}
    </section>
  );
}
