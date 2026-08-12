"use client";

import { useEffect, useRef, useState } from "react";
import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "./SectionHeading";
import { PCB, BOARDS, type Board } from "./pcbData";
import { BoardArt, type BoardLayout, type GerberLayer } from "./BoardSVG";
import { useReducedMotion } from "./useReducedMotion";

/* ── per-board SVG layouts (viewBox 0 0 340 190) ───────────────────────── */
const HOLES = [{ x: 12, y: 12 }, { x: 328, y: 12 }, { x: 12, y: 178 }, { x: 328, y: 178 }];

const LAYOUTS: Record<string, BoardLayout> = {
  "MML-01": {
    w: 340, h: 190,
    pours: [{ x: 16, y: 140, w: 150, h: 40 }],
    traces: [
      { d: "M130 95 H196 V135 H252", kind: "bus" },
      { d: "M130 80 H188 V135 H252", kind: "bus" },
      { d: "M170 30 V70", kind: "pwr" },
      { d: "M150 80 H132", kind: "pwr" },
      { d: "M254 70 H300", kind: "sig" },
    ],
    ics: [
      { x: 60, y: 60, w: 70, h: 70, ref: "U1", pins: "castellated", module: true },
      { x: 150, y: 70, w: 26, h: 20, ref: "U2", pins: "lr" },
      { x: 150, y: 110, w: 20, h: 16, ref: "U3", pins: "lr" },
      { x: 228, y: 58, w: 24, h: 18, ref: "U4", pins: "lr" },
      { x: 250, y: 122, w: 26, h: 22, ref: "U5", pins: "lr" },
    ],
    passives: [
      { x: 196, y: 30, ref: "R1", o: "v" },
      { x: 210, y: 30, ref: "R2", o: "v" },
      { x: 120, y: 46, ref: "C1", o: "h" },
    ],
    conns: [
      { x: 150, y: 8, w: 40, h: 16, ref: "J1" },
      { x: 290, y: 30, w: 34, h: 14, ref: "J2" },
    ],
    leds: [{ x: 64, y: 142, ref: "D1", color: PCB.green }],
    vias: [{ x: 196, y: 95 }, { x: 188, y: 80 }, { x: 252, y: 70 }, { x: 132, y: 80 }, { x: 300, y: 70 }],
    holes: HOLES,
  },
  "MML-02": {
    w: 340, h: 190,
    pours: [{ x: 12, y: 120, w: 150, h: 60 }],
    traces: [
      { d: "M54 138 H120 V90 H140", kind: "pwr" },
      { d: "M54 150 H180 V60 H196", kind: "pwr" },
      { d: "M164 70 H196", kind: "sig" },
    ],
    ics: [
      { x: 50, y: 50, w: 64, h: 70, ref: "U1", pins: "castellated", module: true },
      { x: 138, y: 60, w: 26, h: 22, ref: "U2", pins: "lr" },
    ],
    passives: [
      { x: 70, y: 130, ref: "D1", o: "v" },
      { x: 120, y: 132, ref: "R1", o: "h" },
    ],
    conns: [{ x: 8, y: 138, w: 46, h: 18, ref: "J1" }],
    matrix: { x: 196, y: 40, cols: 8, rows: 8, cell: 14 },
    leds: [{ x: 96, y: 132, ref: "C1", color: PCB.copperBright }],
    vias: [{ x: 120, y: 90 }, { x: 180, y: 60 }, { x: 196, y: 70 }, { x: 140, y: 90 }],
    holes: HOLES,
  },
  "MML-03": {
    w: 340, h: 190,
    pours: [{ x: 16, y: 130, w: 150, h: 48 }],
    traces: [
      { d: "M94 90 H120", kind: "sig" },
      { d: "M146 80 H160", kind: "pwr" },
      { d: "M182 78 H200", kind: "pwr" },
      { d: "M276 150 V100", kind: "pwr" },
    ],
    ics: [
      { x: 30, y: 55, w: 64, h: 70, ref: "U1", pins: "castellated", module: true },
      { x: 120, y: 60, w: 26, h: 22, ref: "U2", pins: "lr" },
      { x: 160, y: 64, w: 22, h: 16, ref: "U3", pins: "lr" },
      { x: 248, y: 66, w: 28, h: 34, ref: "U4", pins: "lr" },
    ],
    passives: [
      { x: 132, y: 104, ref: "L1", o: "h" },
      { x: 286, y: 120, ref: "D1", o: "v" },
    ],
    conns: [{ x: 280, y: 150, w: 46, h: 16, ref: "J1" }],
    leds: [{ x: 40, y: 138, ref: "D2", color: PCB.comm }],
    vias: [{ x: 146, y: 80 }, { x: 200, y: 78 }, { x: 120, y: 90 }],
    holes: HOLES,
  },
};

/* IPC-2221 external-layer trace width (mils) for a given current */
function traceWidthMils(currentA: number, copperOz = 2, dTempC = 10) {
  const k = 0.048;
  const areaMils2 = Math.pow(currentA / (k * Math.pow(dTempC, 0.44)), 1 / 0.725);
  return areaMils2 / (copperOz * 1.378);
}

const LAYER_TABS: { key: GerberLayer; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "silk", label: "SILK" },
  { key: "copper", label: "Cu" },
  { key: "mask", label: "MASK" },
  { key: "drill", label: "DRILL" },
];

export default function BoardsGallery() {
  return (
    <section id="boards" className="relative py-20 sm:py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollFadeIn>
          <SectionHeading eyebrow="Portfolio" title="Three boards. Three client problems." gold>
            Three builds covering the briefs clients actually send: a production sensor node, a
            high-current LED driver, and isolated 24V I/O. Toggle the Gerber layers and open the
            bring-up log on any board.
          </SectionHeading>
        </ScrollFadeIn>

        <div className="space-y-6">
          {BOARDS.map((b) => <BoardCard key={b.id} board={b} />)}
        </div>
      </div>
    </section>
  );
}

function BoardCard({ board }: { board: Board }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [powered, setPowered] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [layer, setLayer] = useState<GerberLayer>("all");
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState(3.6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setPowered(true); setScanned(true); obs.unobserve(el); }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const layout = LAYOUTS[board.id];
  const widthMils = traceWidthMils(current);
  const dynSw = Math.min(14, Math.max(1.5, widthMils * 0.12));

  // Board 2: live trace-width decal. Board 3: isolation moat decal.
  let decals: React.ReactNode = null;
  if (board.id === "MML-02") {
    decals = (
      <g>
        <line x1="56" y1="170" x2="190" y2="170" stroke={powered ? PCB.copperBright : PCB.copper}
          strokeWidth={dynSw} strokeLinecap="round" opacity="0.9"
          style={{ transition: "stroke-width 0.12s linear" }} />
        <text x="123" y="186" fontSize="7" fill={PCB.silk} textAnchor="middle" opacity="0.85"
          fontFamily="var(--font-geist-mono), monospace">5V POWER · {widthMils.toFixed(0)} mil @ 2oz</text>
      </g>
    );
  } else if (board.id === "MML-03") {
    decals = (
      <g>
        <line x1="222" y1="20" x2="222" y2="170" stroke={PCB.silk} strokeWidth="0.8"
          strokeDasharray="3 3" opacity="0.75" />
        <rect x="210" y="20" width="24" height="150" fill={PCB.error}
          opacity={powered ? 0.1 : 0.05} />
        <text x="222" y="14" fontSize="6.5" fill={PCB.silk} textAnchor="middle" opacity="0.8"
          fontFamily="var(--font-geist-mono), monospace">ISOLATION</text>
        <text x="120" y="184" fontSize="6.5" fill={PCB.silk} textAnchor="middle" opacity="0.6"
          fontFamily="var(--font-geist-mono), monospace">LOGIC 3V3 · star-gnd</text>
        <text x="285" y="184" fontSize="6.5" fill={PCB.silk} textAnchor="middle" opacity="0.6"
          fontFamily="var(--font-geist-mono), monospace">24V FIELD</text>
      </g>
    );
  }

  return (
    <div
      ref={ref}
      className="fab-card relative overflow-hidden"
      style={{
        borderColor: powered ? `${board.accent}40` : undefined,
        boxShadow: powered ? `0 1px 0 rgba(234,230,218,0.06) inset, 0 18px 40px -24px rgba(0,0,0,0.8), 0 0 30px ${board.accent}12` : undefined,
      }}
    >
      {/* DRC scan-bar sweep on first reveal (unmounts when the sweep finishes) */}
      {scanned && !reduced && (
        <div className="pcb-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-12"
          style={{ background: `linear-gradient(180deg, ${board.accent}22, transparent)` }}
          onAnimationEnd={() => setScanned(false)} />
      )}

      <div className="grid lg:grid-cols-2 gap-0">
        {/* ── left : board art + layer toggle ── */}
        <div className="p-5 pcb-substrate border-b lg:border-b-0 lg:border-r border-black/40">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <span className="font-mono text-xs tracking-widest" style={{ color: PCB.silk }}>{board.id}</span>
            <div className="flex flex-wrap gap-1">
              {LAYER_TABS.map((t) => (
                <button key={t.key} onClick={() => setLayer(t.key)}
                  className="font-mono text-[11px] px-2.5 py-1.5 rounded transition-all duration-200"
                  style={{
                    color: layer === t.key ? "#1a1405" : PCB.silk,
                    background: layer === t.key ? PCB.enig : "rgba(0,0,0,0.35)",
                    opacity: layer === t.key ? 1 : 0.7,
                  }}>{t.label}</button>
              ))}
            </div>
          </div>
          <BoardArt layout={layout} layer={layer} powered={powered} accent={board.accent}
            idns={board.id.toLowerCase()} decals={decals}
            label={`${board.id} — ${board.name} board layout`} />

          {/* Board 2 trace-width calculator */}
          {board.id === "MML-02" && (
            <div className="mt-3 rounded p-3" style={{ background: "rgba(11,7,20,0.55)" }}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between font-mono text-[11px]" style={{ color: PCB.silk }}>
                <span>IPC-2221 trace width</span>
                <span className="tabular-nums" style={{ color: board.accent }}>{current.toFixed(1)} A → {widthMils.toFixed(0)} mil @ 2oz, ΔT 10°C</span>
              </div>
              <input type="range" min={1} max={10} step={0.2} value={current}
                onChange={(e) => setCurrent(parseFloat(e.target.value))}
                className="w-full mt-2" style={{ accentColor: board.accent }} aria-label="LED current" />
            </div>
          )}
        </div>

        {/* ── right : details ── */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="block w-1 h-5 rounded-full" style={{ background: board.accent }} />
            <h3 className="text-xl font-semibold" style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}>{board.name}</h3>
          </div>
          <p className="font-mono text-xs text-[#d6d3cd]/65 mt-1.5">{board.tagline}</p>

          <div className="mt-3 text-[14px] leading-7 text-[#d6d3cd]/80">
            <span className="font-mono text-[11px] tracking-[0.2em] mr-2" style={{ color: PCB.copperBright }}>THE BRIEF</span>
            {board.problem}
          </div>
          <p className="mt-2 text-[13px] leading-7 text-[#d6d3cd]/65">{board.proves}</p>

          {/* specs */}
          <div className="mt-4 grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 font-mono text-[11px] auto-rows-fr">
            {[
              ["LAYERS", board.specs.layers],
              ["MCU", board.specs.mcu],
              ["POWER", board.specs.power],
              ["EXTRA", board.specs.extra],
            ].map(([k, v]) => (
              <div key={k} className="border border-[#eae6da]/12 rounded px-2.5 py-2" style={{ background: "rgba(234,230,218,0.02)" }}>
                <div style={{ color: PCB.enig }} className="opacity-75">{k}</div>
                <div className="text-[#d6d3cd]/75 leading-5 mt-0.5">{v}</div>
              </div>
            ))}
          </div>

          {/* firmware + mfg badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="font-mono text-[11px] px-2 py-1 rounded" style={{ color: PCB.copperBright, border: `1px solid ${PCB.copper}55` }}>
              firmware: {board.firmware}
            </span>
            {board.mfgPack.slice(0, 2).map((m) => (
              <span key={m} className="font-mono text-[11px] px-2 py-1 rounded text-[#d6d3cd]/65 border border-[#eae6da]/8">{m}</span>
            ))}
          </div>

          {/* bring-up log */}
          <button onClick={() => setExpanded((v) => !v)}
            className="mt-4 font-mono text-[11px] tracking-wider transition-colors"
            style={{ color: board.accent }}>
            {expanded ? "▾ hide bring-up log" : "▸ run bring-up log"}
          </button>
          {expanded && <BringUp lines={board.bringup} accent={board.accent} reduced={reduced} />}
        </div>
      </div>
    </div>
  );
}

function BringUp({ lines, accent, reduced }: { lines: string[]; accent: string; reduced: boolean }) {
  const [shown, setShown] = useState<string[]>(reduced ? lines : []);
  useEffect(() => {
    if (reduced) return;
    setShown([]);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(lines.slice(0, i));
      if (i >= lines.length) clearInterval(id);
    }, 260);
    return () => clearInterval(id);
  }, [lines, reduced]);

  return (
    <div className="mt-3 rounded p-3 font-mono text-[11px] leading-6" style={{ background: "rgba(11,7,20,0.6)", border: "1px solid rgba(234,230,218,0.06)" }}>
      {shown.map((l, i) => (
        <div key={i} style={{ color: l.startsWith(">>") ? PCB.green : l.startsWith("$") ? PCB.copperBright : "rgba(214,211,205,0.6)" }}>
          {l}
        </div>
      ))}
      {!reduced && shown.length < lines.length && <span className="pcb-caret" style={{ color: accent }}>_</span>}
    </div>
  );
}
