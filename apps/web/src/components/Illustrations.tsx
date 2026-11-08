/* Hand-built SVG illustrations: no external images, so they work offline in the PWA.
   To use real photos instead, drop them in /public/photos and swap with <Image/>. */
const G = "#2F7D4F", Y = "#F2C14E", N = "#12303F", B = "#2E7BD6", SKIN = "#C98B5E";

export function HeroScene() {
  return (
    <svg viewBox="0 0 600 230" className="h-auto w-full" role="img" aria-label="Satellite watching a paddy field while a farmer looks on">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CFE6F5" /><stop offset="1" stopColor="#FBF0CC" /></linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={B} stopOpacity=".35" /><stop offset="1" stopColor={B} stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="600" height="230" fill="url(#sky)" />
      <circle cx="90" cy="70" r="30" fill={Y} /><g stroke={Y} strokeWidth="4" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1={90 + 40 * Math.cos((a * Math.PI) / 180)} y1={70 + 40 * Math.sin((a * Math.PI) / 180)} x2={90 + 50 * Math.cos((a * Math.PI) / 180)} y2={70 + 50 * Math.sin((a * Math.PI) / 180)} />)}</g>
      <path d="M0 140 Q150 100 300 135 T600 125 V230 H0Z" fill="#9FCB8A" />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M0 ${150 + i * 14} Q300 ${132 + i * 14} 600 ${148 + i * 14}`} stroke={i % 2 ? "#5FA35F" : G} strokeWidth="9" fill="none" opacity=".85" />)}
      <path d="M380 0 L430 150 L300 150Z" fill="url(#beam)" />
      <g transform="translate(335 30) rotate(-18)"><rect x="-14" y="-8" width="28" height="16" rx="3" fill={N} /><rect x="-46" y="-6" width="28" height="12" fill={B} /><rect x="18" y="-6" width="28" height="12" fill={B} /><circle cx="0" cy="0" r="4" fill={Y} /></g>
      <g transform="translate(500 120)"><ellipse cx="0" cy="62" rx="26" ry="5" fill="#000" opacity=".12" /><rect x="-13" y="20" width="26" height="42" rx="10" fill={B} /><circle cx="0" cy="12" r="11" fill={SKIN} /><path d="M-24 10 L0 -22 L24 10Z" fill="#D9AE2B" /><path d="M-24 10 H24" stroke="#B88A1A" strokeWidth="3" /></g>
      <g transform="translate(60 160)" fill="#fff" stroke={N} strokeWidth="1.5"><rect width="108" height="32" rx="16" /><text x="54" y="21" textAnchor="middle" fontSize="12" fontWeight="700" fill={N} stroke="none">SMAP · Landsat</text></g>
    </svg>
  );
}

export function StepScene({ kind }: { kind: 1 | 2 | 3 }) {
  return (
    <svg viewBox="0 0 220 140" className="h-auto w-full" aria-hidden>
      <rect width="220" height="140" rx="18" fill={kind === 1 ? "#DCEBF7" : kind === 2 ? "#F7EFD2" : "#E1EFD9"} />
      {kind === 1 && <>
        <g transform="translate(110 28) rotate(-12)"><rect x="-10" y="-6" width="20" height="12" rx="2" fill={N} /><rect x="-34" y="-5" width="22" height="10" fill={B} /><rect x="12" y="-5" width="22" height="10" fill={B} /></g>
        <path d="M110 40 L160 112 H60Z" fill={B} opacity=".18" />
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={64 + c * 24 + r * 3} y={96 + r * 12} width="20" height="9" rx="2" fill={[G, "#7DB04A", Y, G][(r + c) % 4]} />))}</>}
      {kind === 2 && [0, 1, 2].map((i) => <g key={i} transform={`translate(${28 + i * 62} ${i === 1 ? 24 : 36})`}><rect width="54" height={i === 1 ? 84 : 72} rx="10" fill="#fff" stroke={i === 1 ? Y : "#D3DACD"} strokeWidth={i === 1 ? 3 : 1.5} />
        <circle cx="27" cy="22" r="9" fill={["#B07A3C", G, "#D9AE2B"][i]} /><rect x="10" y="40" width="34" height="6" rx="3" fill="#D3DACD" /><rect x="10" y="52" width={[24, 30, 18][i]} height="6" rx="3" fill={B} /></g>)}
      {kind === 3 && <>
        {[70, 150].map((x, i) => <g key={x} transform={`translate(${x} 70)`}><circle cy="-8" r="14" fill={SKIN} /><path d={i ? "M-14 -14 H14 V-22 H-14Z" : "M-22 -12 L0 -38 L22 -12Z"} fill={i ? N : "#D9AE2B"} /><rect x="-16" y="8" width="32" height="42" rx="12" fill={i ? "#fff" : B} stroke="#D3DACD" /></g>)}
        <circle cx="110" cy="36" r="15" fill={G} /><path d="M103 36 l5 5 l9 -10" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" /></>}
    </svg>
  );
}

export function CropArt({ crop }: { crop: "lentil" | "mung" | "aman" | "mustard" }) {
  return (
    <svg viewBox="0 0 90 90" className="h-full w-full" aria-hidden>
      <circle cx="45" cy="45" r="44" fill={{ lentil: "#F3E3CB", mung: "#E6F1D2", aman: "#D8EBDD", mustard: "#FBF0CC" }[crop]} />
      <path d="M45 82 V30" stroke={G} strokeWidth="3" strokeLinecap="round" />
      {crop === "lentil" && [[0, 52], [1, 42], [0, 62]].map(([f, y], i) => <g key={i}><ellipse cx={f ? 56 : 34} cy={y} rx="9" ry="4.5" transform={`rotate(${f ? -25 : 25} ${f ? 56 : 34} ${y})`} fill="#7DB04A" /></g>)}
      {crop === "mung" && [[36, 40], [54, 48], [38, 60], [54, 66]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5" height="16" rx="2.5" fill="#5E8F3A" transform={`rotate(${i % 2 ? 20 : -20} ${x} ${y})`} />)}
      {crop === "aman" && <><path d="M45 82 Q30 50 22 28 M45 82 Q60 50 68 28 M45 82 Q45 45 45 18" stroke={G} strokeWidth="3" fill="none" strokeLinecap="round" />{[[22, 28], [68, 28], [45, 18]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3" ry="8" fill={Y} />)}</>}
      {crop === "mustard" && [[45, 24], [34, 34], [56, 34], [40, 46], [52, 46]].map(([x, y], i) => <g key={i}>{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + 5 * Math.cos((a * Math.PI) / 180)} cy={y + 5 * Math.sin((a * Math.PI) / 180)} r="3.2" fill="#E8B923" />)}</g>)}
    </svg>
  );
}

export function Farmer() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <circle cx="50" cy="50" r="50" fill="#E1EFD9" />
      <rect x="22" y="64" width="56" height="40" rx="20" fill={B} />
      <circle cx="50" cy="48" r="17" fill={SKIN} />
      <path d="M22 44 L50 10 L78 44Z" fill="#D9AE2B" /><path d="M24 44 H76" stroke="#B88A1A" strokeWidth="4" />
      <circle cx="44" cy="50" r="1.8" fill={N} /><circle cx="56" cy="50" r="1.8" fill={N} /><path d="M44 57 Q50 62 56 57" stroke={N} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}