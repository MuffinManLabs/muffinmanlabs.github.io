import { PCB } from "../pcb/pcbData";

/* ════════════════════════════════════════════════════════════════════════
   PostArt — generated cover art for a blog post, keyed by its tag.
   Every post gets a distinct, on-theme PCB illustration: no stock photos,
   no external assets, and it scales cleanly from card thumbnail to hero.
   ════════════════════════════════════════════════════════════════════════ */

/* One hue per tag, all inside the palette. Mint is reserved for status, so it
   never appears here; cyan stays exclusive to Signals (the comm/bus role). */
export const TAG_ACCENT: Record<string, string> = {
  Manufacturing: PCB.enigBright,
  KiCad: PCB.purple,
  Power: PCB.enig,
  Layout: PCB.copperBright,
  Signals: PCB.comm,
  "Bring-up": PCB.silk,
  Firmware: PCB.copper,
  Systems: PCB.enig,
  C: PCB.copper,
  General: PCB.silk,
};

export function accentFor(tag: string) {
  return TAG_ACCENT[tag] ?? PCB.enig;
}

export default function PostArt({
  tag,
  className = "",
  seed = 0,
  uid: uidProp,
  fill = false,
}: {
  tag: string;
  className?: string;
  /** shifts the decorative detail so adjacent cards don't look identical */
  seed?: number;
  /** guarantees unique gradient/pattern ids when many render on one page */
  uid?: string;
  /** crop to fill the container instead of letterboxing */
  fill?: boolean;
}) {
  const a = accentFor(tag);
  const uid = `pa-${(uidProp ?? tag).replace(/[^a-z0-9]/gi, "")}-${seed}`;

  return (
    <svg
      viewBox="0 0 320 150"
      className={className}
      width="100%"
      role="img"
      aria-label={`${tag} illustration`}
      preserveAspectRatio={fill ? "xMidYMid slice" : "xMidYMid meet"}
      style={{ display: "block", ...(fill ? { height: "100%" } : null) }}
    >
      <defs>
        <linearGradient id={`${uid}-mask`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PCB.soldermaskLit} />
          <stop offset="60%" stopColor={PCB.soldermask} />
          <stop offset="100%" stopColor="#0f091a" />
        </linearGradient>
        <radialGradient id={`${uid}-enig`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor={PCB.enigBright} />
          <stop offset="60%" stopColor={PCB.enig} />
          <stop offset="100%" stopColor="#a07d1f" />
        </radialGradient>
        <pattern id={`${uid}-hatch`} width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke={PCB.copper} strokeWidth="1" opacity="0.4" />
        </pattern>
        {/* one tiled pattern instead of 136 individual circles per instance */}
        <pattern id={`${uid}-dots`} width="19" height="19" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="12" r="0.8" fill={PCB.copper} opacity="0.16" />
        </pattern>
      </defs>

      {/* substrate */}
      <rect width="320" height="150" fill={`url(#${uid}-mask)`} />
      <rect width="320" height="150" fill={`url(#${uid}-dots)`} />

      <Art tag={tag} uid={uid} accent={a} seed={seed} />

      {/* board-edge silkscreen frame + corner pads */}
      <rect x="5" y="5" width="310" height="140" rx="4" fill="none" stroke={PCB.silk} strokeWidth="0.6" opacity="0.28" />
      {[
        [13, 13], [307, 13], [13, 137], [307, 137],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3.2" fill={`url(#${uid}-enig)`} opacity="0.75" />
          <circle cx={cx} cy={cy} r="1.3" fill={PCB.drill} />
        </g>
      ))}

      {/* tag label, silkscreen style */}
      <text
        x="300"
        y="141"
        fontSize="6.5"
        textAnchor="end"
        fill={PCB.silk}
        opacity="0.45"
        fontFamily="var(--font-geist-mono), monospace"
        letterSpacing="1.2"
      >
        {tag.toUpperCase()}
      </text>
    </svg>
  );
}

function Art({ tag, uid, accent, seed }: { tag: string; uid: string; accent: string; seed: number }) {
  const pad = `url(#${uid}-enig)`;
  const off = (seed % 3) * 6;

  switch (tag) {
    /* ── layered gerber stack + drill hits ─────────────────────────────── */
    case "Manufacturing":
      return (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${86 + i * 12}, ${34 + i * 16})`}>
              <rect width="120" height="46" rx="3" fill={PCB.soldermask} stroke={accent} strokeWidth="0.8" opacity={0.35 + i * 0.18} />
              <line x1="10" y1="12" x2="70" y2="12" stroke={accent} strokeWidth="1.2" opacity={0.5 + i * 0.12} />
              <line x1="10" y1="22" x2="96" y2="22" stroke={accent} strokeWidth="1.2" opacity={0.35 + i * 0.12} />
              <line x1="10" y1="32" x2="52" y2="32" stroke={accent} strokeWidth="1.2" opacity={0.3 + i * 0.12} />
            </g>
          ))}
          {[36, 58, 80].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={110 - i * 8} r="3.4" fill={pad} />
              <circle cx={x} cy={110 - i * 8} r="1.3" fill={PCB.drill} />
            </g>
          ))}
        </g>
      );

    /* ── schematic symbols + nets ──────────────────────────────────────── */
    case "KiCad":
      return (
        <g stroke={accent} fill="none" strokeWidth="1.4" opacity="0.9">
          {/* resistor */}
          <path d="M40 46 H58 l4 -7 l8 14 l8 -14 l8 14 l4 -7 H108" />
          {/* capacitor */}
          <path d="M40 100 H70 M70 92 V108 M78 92 V108 M78 100 H108" />
          {/* IC block */}
          <rect x="150" y="46" width="66" height="58" rx="2" stroke={PCB.silk} opacity="0.75" />
          {[58, 74, 90].map((y, i) => (
            <g key={i}>
              <line x1="140" y1={y} x2="150" y2={y} />
              <line x1="216" y1={y} x2="226" y2={y} />
            </g>
          ))}
          <text x="183" y="80" fontSize="11" fill={PCB.silk} textAnchor="middle" stroke="none" opacity="0.8" fontFamily="var(--font-geist-mono), monospace">U1</text>
          {/* nets joining */}
          <path d="M108 46 H128 V58 H140" />
          <path d="M108 100 H128 V90 H140" />
          <path d="M226 58 H252 V74" />
          <path d="M226 90 H252" />
          <circle cx="128" cy="46" r="2" fill={accent} stroke="none" />
          <circle cx="252" cy="74" r="2" fill={accent} stroke="none" />
        </g>
      );

    /* ── power rail: input → regulator → rail, with current arrows ─────── */
    case "Power":
      return (
        <g>
          <line x1="26" y1="75" x2="294" y2="75" stroke={PCB.copper} strokeWidth="6" strokeLinecap="round" opacity="0.75" />
          <line x1="26" y1="75" x2="294" y2="75" stroke={accent} strokeWidth="2" strokeLinecap="round"
            strokeDasharray="5 14" strokeDashoffset={off} opacity="0.95" />
          {/* regulator body */}
          <rect x="132" y="52" width="58" height="46" rx="3" fill="#15110b" stroke={PCB.silk} strokeWidth="0.9" opacity="0.95" />
          <text x="161" y="79" fontSize="10" fill={PCB.silk} textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" opacity="0.85">U2</text>
          {[52, 98].map((y, i) => (
            <rect key={i} x="146" y={y - 4} width="30" height="5" rx="1" fill={pad} opacity="0.9" />
          ))}
          {/* bulk + decoupling caps */}
          {[{ x: 76, w: 16 }, { x: 226, w: 10 }].map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={52} width={c.w} height="14" rx="1.5" fill={pad} />
              <rect x={c.x} y={84} width={c.w} height="14" rx="1.5" fill={pad} />
              <line x1={c.x + c.w / 2} y1="66" x2={c.x + c.w / 2} y2="70" stroke={PCB.copper} strokeWidth="2" />
              <line x1={c.x + c.w / 2} y1="80" x2={c.x + c.w / 2} y2="84" stroke={PCB.copper} strokeWidth="2" />
            </g>
          ))}
          {/* rail labels */}
          <text x="40" y="42" fontSize="7" fill={PCB.silk} opacity="0.6" fontFamily="var(--font-geist-mono), monospace">VIN</text>
          <text x="252" y="42" fontSize="7" fill={PCB.silk} opacity="0.6" fontFamily="var(--font-geist-mono), monospace">3V3</text>
        </g>
      );

    /* ── routed traces, vias, hatched pour ─────────────────────────────── */
    case "Layout":
      return (
        <g>
          <rect x="24" y="86" width="122" height="46" rx="3" fill={`url(#${uid}-hatch)`} opacity="0.85" />
          {[
            "M30 40 H96 a8 8 0 0 1 8 8 V70 H164",
            "M30 56 H80 a8 8 0 0 1 8 8 V78 H164",
            "M196 70 H244 a8 8 0 0 1 8 8 V112 H292",
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i === 2 ? accent : PCB.copperBright} strokeWidth={i === 2 ? 4 : 2.4}
              strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          ))}
          <rect x="164" y="52" width="32" height="42" rx="2" fill="#15110b" stroke={PCB.silk} strokeWidth="0.8" opacity="0.95" />
          <text x="180" y="77" fontSize="8" fill={PCB.silk} textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" opacity="0.8">U1</text>
          {[[104, 70], [88, 78], [252, 112], [292, 112]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4" fill={pad} />
              <circle cx={cx} cy={cy} r="1.6" fill={PCB.drill} />
            </g>
          ))}
        </g>
      );

    /* ── bus waveforms / data pulses ───────────────────────────────────── */
    case "Signals":
      return (
        <g>
          {[
            { y: 48, d: "M28 48 h22 v-16 h20 v16 h18 v-16 h26 v16 h20 v-16 h22 v16 h26 v-16 h20 v16 h30", label: "SCL" },
            { y: 96, d: "M28 96 h30 v-16 h18 v16 h30 v-16 h22 v16 h18 v-16 h26 v16 h20 v-16 h22 v16 h20", label: "SDA" },
          ].map((w, i) => (
            <g key={i}>
              <text x="18" y={w.y + 3} fontSize="6.5" fill={PCB.silk} opacity="0.55" fontFamily="var(--font-geist-mono), monospace">{w.label}</text>
              <path d={w.d} fill="none" stroke={i === 0 ? accent : PCB.enigBright} strokeWidth="2" strokeLinejoin="round" opacity="0.92" />
            </g>
          ))}
          {/* pull-up pair */}
          <g opacity="0.85">
            <line x1="250" y1="20" x2="250" y2="30" stroke={PCB.copper} strokeWidth="2" />
            <rect x="245" y="30" width="10" height="16" rx="1.5" fill={pad} />
            <line x1="268" y1="20" x2="268" y2="30" stroke={PCB.copper} strokeWidth="2" />
            <rect x="263" y="30" width="10" height="16" rx="1.5" fill={pad} />
            <line x1="238" y1="20" x2="280" y2="20" stroke={PCB.copper} strokeWidth="2" />
            <text x="290" y="24" fontSize="6" fill={PCB.silk} opacity="0.5" fontFamily="var(--font-geist-mono), monospace">3V3</text>
          </g>
        </g>
      );

    /* ── probe on test points, rails coming up ─────────────────────────── */
    case "Bring-up":
      return (
        <g>
          {[44, 68, 92].map((y, i) => (
            <g key={i}>
              <line x1="30" y1={y} x2="180" y2={y} stroke={PCB.copper} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <circle cx={196} cy={y} r="6" fill={pad} />
              <circle cx={196} cy={y} r="2.2" fill={PCB.drill} />
              <text x={212} y={y + 3} fontSize="7" fill={PCB.silk} opacity="0.6" fontFamily="var(--font-geist-mono), monospace">
                TP{i + 1}
              </text>
              <circle cx={22} cy={y} r="3" fill={i === 0 ? accent : PCB.copper} opacity={i === 0 ? 1 : 0.5}
                style={i === 0 ? { filter: `drop-shadow(0 0 4px ${accent})` } : undefined} />
            </g>
          ))}
          {/* probe tip */}
          <g>
            <path d="M196 44 L262 118" stroke={PCB.silk} strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
            <circle cx="196" cy="44" r="3" fill={accent} style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
            <rect x="256" y="112" width="34" height="12" rx="3" fill="#15110b" stroke={PCB.silk} strokeWidth="0.8" opacity="0.9" />
          </g>
          <text x="30" y="126" fontSize="7" fill={accent} opacity="0.9" fontFamily="var(--font-geist-mono), monospace">
            3.30 V &#183; OK
          </text>
        </g>
      );

    /* ── module + UART stream ──────────────────────────────────────────── */
    case "Firmware":
      return (
        <g>
          <rect x="30" y="40" width="96" height="72" rx="3" fill="#15110b" stroke={PCB.silk} strokeWidth="1" opacity="0.95" />
          <rect x="34" y="44" width="88" height="16" rx="1.5" fill="none" stroke={PCB.silk} strokeWidth="0.6"
            strokeDasharray="2 2" opacity="0.55" />
          <circle cx="38" cy="66" r="2" fill={PCB.silk} opacity="0.9" />
          <text x="78" y="86" fontSize="10" fill={PCB.silk} textAnchor="middle" fontWeight="bold" fontFamily="var(--font-geist-mono), monospace">U1</text>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x="22" y={46 + i * 11} width="8" height="6" rx="1" fill={pad} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x="126" y={46 + i * 11} width="8" height="6" rx="1" fill={pad} />
          ))}
          {/* serial stream */}
          {[52, 70, 88].map((y, i) => (
            <g key={i}>
              <line x1="146" y1={y} x2="292" y2={y} stroke={PCB.copper} strokeWidth="1.4" opacity="0.4" />
              <line x1="146" y1={y} x2={196 + i * 32} y2={y} stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.9" />
            </g>
          ))}
          <text x="146" y="112" fontSize="7" fill={PCB.silk} opacity="0.55" fontFamily="var(--font-geist-mono), monospace">
            UART &#183; 115200
          </text>
        </g>
      );

    /* ── default: a clean routed fragment ──────────────────────────────── */
    default:
      return (
        <g>
          {["M34 52 H120 a8 8 0 0 1 8 8 V92 H210", "M34 98 H96 a8 8 0 0 0 8 -8 V60 H210"].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i === 0 ? accent : PCB.copper} strokeWidth="2.6"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          ))}
          <rect x="210" y="52" width="48" height="46" rx="2" fill="#15110b" stroke={PCB.silk} strokeWidth="0.9" opacity="0.95" />
          <text x="234" y="80" fontSize="10" fill={PCB.silk} textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" opacity="0.85">U1</text>
          {[[128, 60], [104, 90], [274, 62], [274, 88]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3.6" fill={pad} />
              <circle cx={cx} cy={cy} r="1.4" fill={PCB.drill} />
            </g>
          ))}
        </g>
      );
  }
}
