"use client";

import { memo, useMemo } from "react";
import { PCB } from "./pcbData";

/* ════════════════════════════════════════════════════════════════════════
   BoardSVG — a small drafting kit for rendering real board layouts as inline
   SVG. Everything is authored in MILLIMETRES, so a layout's numbers are the
   board's numbers: a 62.5 × 44.5 mm board really is `w: 62.5, h: 44.5`, an
   0402 really is 1.0 × 0.5 mm, and a 5.08 mm screw terminal really pitches
   at 5.08. That keeps the drawings honest — nothing here is decorative
   geometry that a PCB-literate client would catch as fake.

   Geometry is grouped into the fabrication layers (mask / copper / plane /
   silk / drill) so a board can be cross-faded into a gerber-viewer look, and
   every trace can carry a `net` id so a net can be highlighted the way a
   layout tool highlights one.
   ════════════════════════════════════════════════════════════════════════ */

/* which fabrication layer is being shown on its own */
export type LayerKey = "all" | "silk" | "copper" | "plane" | "mask" | "drill";

export type Pt = { x: number; y: number };
/** a plated via at its real finished diameter / drill, in mm */
export type Via = { x: number; y: number; d?: number; drill?: number };
export type Zone = { x: number; y: number; w: number; h: number; r?: number };

export type Trace = {
  /** net id — matches a Net.key so the net can be lit */
  net?: string;
  d: string;
  kind?: "sig" | "bus" | "pwr" | "field" | "gnd";
  /** explicit width in mm; otherwise derived from `kind` */
  w?: number;
  /** bottom-layer routing renders darker and dashed, like a gerber viewer */
  layer?: "top" | "bottom";
};

/* ── parts ──────────────────────────────────────────────────────────────
   Box-like parts (module / ic / relay / inductor / bridge / usbc / terminal
   / jst) anchor x,y at the BODY'S TOP-LEFT corner.
   Point-like parts (passive / led / elyt / header / jumper / tp) anchor
   x,y at the part's CENTRE.
   ──────────────────────────────────────────────────────────────────────── */
type Base = {
  ref: string;
  /** top-left of the UNROTATED body; `rot` then spins it about its own centre */
  x: number;
  y: number;
  label?: string;
  net?: string;
  /** placement rotation in degrees, straight out of the board file */
  rot?: number;
  /** do-not-populate — drawn ghosted, because the fab pack says so */
  dnp?: boolean;
};

export type Part =
  /** RF module with a castellated edge and an antenna nose (`ant` mm tall) */
  | ({ kind: "module"; w: number; h: number; ant: number; pad?: boolean } & Base)
  /** SOT/SOP/DIP body with pads down two sides — SOT-23 is pinsL 2 / pinsR 1 */
  | ({ kind: "ic"; w: number; h: number; pins?: number; pinsL?: number; pinsR?: number; quad?: boolean } & Base)
  /** chip resistor / capacitor / diode — `size` is the body length in mm */
  | ({ kind: "passive"; o?: "h" | "v"; size?: number; polar?: boolean } & Base)
  | ({ kind: "led"; color?: string; o?: "h" | "v" } & Base)
  | ({ kind: "usbc"; edge: "left" | "bottom"; w: number; h: number } & Base)
  /** pluggable screw terminal — `ways` positions at `pitch` mm */
  | ({ kind: "terminal"; ways: number; pitch?: number; o?: "h" | "v" } & Base)
  /** SPDT power relay: 2 coil pins one end, 3 contact pins the other */
  | ({ kind: "relay"; w: number; h: number; o?: "h" | "v" } & Base)
  | ({ kind: "inductor"; w: number; h: number } & Base)
  /** radial electrolytic can, `d` mm diameter */
  | ({ kind: "elyt"; d: number } & Base)
  | ({ kind: "bridge"; w: number; h: number } & Base)
  | ({ kind: "header"; ways: number; o?: "h" | "v" } & Base)
  | ({ kind: "jst"; ways: number; w: number; h: number } & Base)
  /** solder jumper — two pads and a hairline bridge */
  | ({ kind: "jumper" } & Base)
  /** SMD tactile switch — BOOT / RESET */
  | ({ kind: "button"; w: number; h: number } & Base)
  /** silkscreen logo mark */
  | ({ kind: "logo"; w: number; h: number } & Base);

export type TestPoint = {
  ref: string;
  x: number;
  y: number;
  /** through-hole test point (the UART recovery trio) rather than an SMD pad */
  th?: boolean;
};

export type SilkNote = {
  x: number;
  y: number;
  text: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  rot?: number;
  /** back-side silkscreen — only shown on the SILK layer, ghosted */
  back?: boolean;
};

/** an isolation moat splitting the board into two named halves */
export type Moat = {
  x: number;
  w: number;
  y0: number;
  y1: number;
  left: string;
  right: string;
  /** where the two side legends sit — default is the moat's midpoint, but a
      board with parts straddling the moat needs them in the clear gap */
  labelY?: number;
};

export type Net = {
  key: string;
  label: string;
  color: string;
  /** one-line engineering note shown under the board when the net is lit */
  note: string;
  /** real net names from the board file; a trace lights if its `net` is in here.
      Omit and traces match on `net === key` instead (hand-authored layouts). */
  nets?: string[];
  /** regions outlined when the net is lit — keep-outs, hot loops, the moat */
  zones?: (Zone & { dash?: boolean; label?: string })[];
  /** refdes highlighted alongside the copper */
  parts?: string[];
  /** ring every test point — for the "where do I put the probe" net */
  tps?: boolean;
};

export type BoardLayout = {
  /** finished board size in mm */
  w: number;
  h: number;
  /** viewBox padding in mm — must clear any overhanging antenna nose */
  pad?: number;
  /** board corner radius in mm */
  radius?: number;
  /** multiplies text + stroke so a big board stays legible in a small column */
  scale?: number;
  /** copper stack — drives the layer tabs and the plane label */
  layers: LayerKey[];
  planeLabel?: string;
  /** the ground plane: solid fill minus its voids */
  plane?: Zone[];
  planeVoids?: Zone[];
  /** hatched top-side pours */
  pours?: Zone[];
  moat?: Moat;
  traces?: Trace[];
  parts?: Part[];
  testpoints?: TestPoint[];
  holes?: Pt[];
  vias?: Via[];
  silk?: SilkNote[];
  nets?: Net[];
};

/* ── layer cross-fade ──────────────────────────────────────────────────── */
function layerOpacity(layer: LayerKey) {
  switch (layer) {
    case "copper": return { mask: 0.3, plane: 0.35, copper: 1, silk: 0.14, drill: 0.85 };
    case "plane": return { mask: 0.3, plane: 1, copper: 0.2, silk: 0.12, drill: 0.8 };
    case "silk": return { mask: 0.42, plane: 0.12, copper: 0.18, silk: 1, drill: 0.5 };
    case "mask": return { mask: 1, plane: 0.25, copper: 0.45, silk: 0.65, drill: 0.6 };
    case "drill": return { mask: 0.26, plane: 0.12, copper: 0.18, silk: 0.2, drill: 1 };
    default: return { mask: 1, plane: 0.45, copper: 1, silk: 1, drill: 1 };
  }
}

const TRACE_W: Record<NonNullable<Trace["kind"]>, number> = {
  sig: 0.4,
  bus: 0.45,
  gnd: 0.6,
  pwr: 0.85,
  field: 1.5,
};

function traceColor(kind: Trace["kind"], powered: boolean) {
  if (kind === "bus") return PCB.comm;
  return powered ? PCB.copperBright : PCB.copper;
}

/* ════════════════════════════════════════════════════════════════════════
   BoardArt
   ════════════════════════════════════════════════════════════════════════ */
/* ── layer cross-fade, as CSS custom properties ────────────────────────────
   The six opacities below used to be React props on eight <g> elements, so
   changing the layer tab re-reconciled the whole board — hundreds of nodes
   for a cross-fade that only ever changes eight numbers. They are now custom
   properties set on the <svg> root, which means switching a layer is a
   handful of style writes and the board itself never re-renders.
   ──────────────────────────────────────────────────────────────────────── */
/* the cross-fade itself is the `.xfade` class in globals.css rather than an
   inline `transition`, because an inline style cannot be switched off by
   `prefers-reduced-motion` — and because it was being repeated on every group
   in the serialised HTML */
const OP_MASK = { opacity: "var(--l-mask)" };
const OP_PLANE = { opacity: "var(--l-plane)" };
const OP_COPPER = { opacity: "var(--l-copper)" };
const OP_SILK = { opacity: "var(--l-silk)" };
const OP_DRILL = { opacity: "var(--l-drill)" };
/* things that live on copper AND silk together — test points, the moat */
const OP_BOTH = { opacity: "var(--l-both)" };

/* ── geometry merging ──────────────────────────────────────────────────────
   MML-01 alone is 415 routed segments and 157 vias. Drawn one element each,
   that is ~890 SVG nodes for something the browser can rasterise from a
   dozen, so segments sharing a stroke are concatenated into a single <path>
   and every via ring of the same size becomes one more. The geometry is
   untouched — each segment keeps its own `M`, so caps and joins render
   exactly as before — but the DOM the browser has to lay out, paint and
   hydrate gets an order of magnitude smaller.
   ──────────────────────────────────────────────────────────────────────── */
type StrokeRun = { stroke: string; w: number; bottom: boolean; d: string };

function mergeTraces(traces: Trace[], s: number, powered: boolean): StrokeRun[] {
  const runs = new Map<string, StrokeRun>();
  for (const t of traces) {
    const stroke = traceColor(t.kind, powered);
    const w = (t.w ?? TRACE_W[t.kind ?? "sig"]) * s;
    const bottom = t.layer === "bottom";
    const key = `${stroke}|${w}|${bottom}`;
    const run = runs.get(key);
    if (run) run.d += ` ${t.d}`;
    else runs.set(key, { stroke, w, bottom, d: t.d });
  }
  return [...runs.values()];
}

/** a circle as path data, so many of them can share one element */
function circleD(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function mergeVias(vias: Via[], radius: (v: Via) => number): [number, string][] {
  const byRadius = new Map<number, string>();
  for (const v of vias) {
    const r = radius(v);
    const d = circleD(v.x, v.y, r);
    const prev = byRadius.get(r);
    byRadius.set(r, prev ? `${prev} ${d}` : d);
  }
  return [...byRadius.entries()];
}

/* ════════════════════════════════════════════════════════════════════════
   BoardArt
   ════════════════════════════════════════════════════════════════════════ */
export function BoardArt({
  layout,
  layer = "all",
  powered = false,
  accent = PCB.enig,
  net = null,
  idns,
  label,
}: {
  layout: BoardLayout;
  layer?: LayerKey;
  powered?: boolean;
  accent?: string;
  /** key of the net currently lit, or null for the plain board */
  net?: string | null;
  /** unique namespace for this instance's <defs> ids */
  idns: string;
  label: string;
}) {
  const { w, h } = layout;
  const pad = layout.pad ?? 6;
  const s = layout.scale ?? 1;
  const op = layerOpacity(layer);
  const lit = layout.nets?.find((n) => n.key === net) ?? null;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      width="100%"
      style={
        {
          display: "block",
          overflow: "visible",
          "--l-mask": op.mask,
          "--l-plane": op.plane,
          "--l-copper": op.copper,
          "--l-silk": op.silk,
          "--l-drill": op.drill,
          "--l-both": Math.max(op.copper, op.silk),
          /* back-side silkscreen only exists on the SILK layer */
          "--l-back": layer === "silk" ? 1 : 0,
          /* when a net is lit everything else recedes so the net reads as
             the subject */
          "--l-dim": lit ? 0.26 : 1,
        } as React.CSSProperties
      }
      role="img"
      aria-label={label}
    >
      <BoardBase layout={layout} powered={powered} accent={accent} idns={idns} />
      {/* ── NET HIGHLIGHT : the lit net, drawn over the receded board ──── */}
      {lit && <NetOverlay layout={layout} net={lit} s={s} />}
    </svg>
  );
}

/* ── the board itself: everything that never changes once it is drawn ─────
   Memoised on purpose. `layout`, `powered`, `accent` and `idns` are all
   stable for the life of a card, so layer and net switching costs nothing
   in here at all. */
const BoardBase = memo(function BoardBase({
  layout,
  powered,
  accent,
  idns,
}: {
  layout: BoardLayout;
  powered: boolean;
  accent: string;
  idns: string;
}) {
  const { w, h } = layout;
  const r = layout.radius ?? 1.6;
  const s = layout.scale ?? 1;
  const enig = `url(#${idns}-enig)`;

  const traces = useMemo(
    () => mergeTraces(layout.traces ?? [], s, powered),
    [layout.traces, s, powered]
  );
  /* the flowing-current overlay only covers the signal + bus copper */
  const flow = useMemo(
    () =>
      powered
        ? mergeTraces(
            (layout.traces ?? []).filter((t) => t.kind === "bus" || t.kind === "sig"),
            s,
            powered
          )
        : [],
    [layout.traces, s, powered]
  );
  const viaPads = useMemo(
    () => mergeVias(layout.vias ?? [], (v) => (v.d ?? 0.6) / 2),
    [layout.vias]
  );
  const viaDrills = useMemo(
    () => mergeVias(layout.vias ?? [], (v) => (v.drill ?? 0.3) / 2),
    [layout.vias]
  );

  return (
    <>
      <defs>
        <radialGradient id={`${idns}-enig`} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor={PCB.enigBright} />
          <stop offset="58%" stopColor={PCB.enig} />
          <stop offset="100%" stopColor="#9c7a1e" />
        </radialGradient>
        <linearGradient id={`${idns}-mask`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={PCB.soldermaskLit} />
          <stop offset="52%" stopColor={PCB.soldermask} />
          <stop offset="100%" stopColor="#100a1c" />
        </linearGradient>
        {/* hatched copper pour, drawn the way KiCad hatches a filled zone */}
        <pattern id={`${idns}-hatch`} width={1.4} height={1.4} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={1.4} stroke={PCB.copper} strokeWidth={0.28} opacity="0.55" />
        </pattern>
        {/* the isolation moat: no copper, hatched warning fill */}
        <pattern id={`${idns}-moat`} width={1.6} height={1.6} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2={1.6} stroke={PCB.error} strokeWidth={0.3} opacity="0.5" />
        </pattern>
        <clipPath id={`${idns}-board`}>
          <rect x="0" y="0" width={w} height={h} rx={r} />
        </clipPath>
        <mask id={`${idns}-plane`}>
          <rect x="0" y="0" width={w} height={h} rx={r} fill="#fff" />
          {(layout.planeVoids ?? []).map((v, i) => (
            <rect key={i} x={v.x} y={v.y} width={v.w} height={v.h} rx={v.r ?? 0.6} fill="#000" />
          ))}
          {layout.moat && (
            <rect x={layout.moat.x} y={layout.moat.y0} width={layout.moat.w}
              height={layout.moat.y1 - layout.moat.y0} fill="#000" />
          )}
        </mask>
      </defs>

      <g className="xfade" style={{ opacity: "var(--l-dim)" }}>
        {/* ── MASK : the soldermask surface itself ─────────────────────── */}
        <g className="xfade" style={OP_MASK}>
          <rect x="0" y="0" width={w} height={h} rx={r}
            fill={`url(#${idns}-mask)`} stroke="#0c0716" strokeWidth={0.35} />
        </g>

        {/* ── PLANE : the ground layer, voided where it must be ────────── */}
        <g className="xfade" style={OP_PLANE} mask={`url(#${idns}-plane)`}>
          {(layout.plane ?? []).map((z, i) => (
            <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} rx={z.r ?? 0.8}
              fill={PCB.copper} opacity={powered ? 0.4 : 0.3} />
          ))}
        </g>

        {/* ── COPPER : hatched pours, traces, pads ─────────────────────── */}
        <g className="xfade" style={OP_COPPER} clipPath={`url(#${idns}-board)`}>
          {(layout.pours ?? []).map((z, i) => (
            <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} rx={z.r ?? 0.8}
              fill={`url(#${idns}-hatch)`} opacity={powered ? 0.95 : 0.65} />
          ))}
          {traces.map((t, i) => (
            <path key={i} d={t.d} fill="none"
              stroke={t.stroke}
              strokeWidth={t.w}
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={t.bottom ? `${0.7 * s} ${0.5 * s}` : undefined}
              opacity={t.bottom ? 0.5 : 0.9} />
          ))}
          {/* current flowing once the board is energized */}
          {flow.map((t, i) => (
            <path key={`f${i}`} className="pcb-pulse" d={t.d} fill="none" stroke={accent}
              strokeWidth={0.28 * s} strokeLinecap="round"
              strokeDasharray={`${0.7 * s} ${2.4 * s}`} opacity="0.85" />
          ))}
          <g>{(layout.parts ?? []).map((p, i) => (
            <Placed key={i} p={p}><Pads p={p} fill={enig} /></Placed>
          ))}</g>
        </g>

        {/* ── moat : an absence of copper, called out in silk ──────────── */}
        {layout.moat && (
          <g className="xfade" style={OP_BOTH}>
            <rect x={layout.moat.x} y={layout.moat.y0} width={layout.moat.w}
              height={layout.moat.y1 - layout.moat.y0} fill={`url(#${idns}-moat)`} opacity="0.5" />
            <line x1={layout.moat.x} y1={layout.moat.y0} x2={layout.moat.x} y2={layout.moat.y1}
              stroke={PCB.silk} strokeWidth={0.18 * s} strokeDasharray={`${0.9 * s} ${0.7 * s}`} opacity="0.7" />
            <line x1={layout.moat.x + layout.moat.w} y1={layout.moat.y0}
              x2={layout.moat.x + layout.moat.w} y2={layout.moat.y1}
              stroke={PCB.silk} strokeWidth={0.18 * s} strokeDasharray={`${0.9 * s} ${0.7 * s}`} opacity="0.7" />
          </g>
        )}

        {/* ── SILK : part bodies, refdes, board frame, legends ─────────── */}
        <g className="xfade" style={OP_SILK} fontFamily="var(--font-geist-mono), monospace">
          {(layout.parts ?? []).map((p, i) => (
            <Placed key={i} p={p}>
              <Body p={p} s={s} powered={powered} accent={accent} />
            </Placed>
          ))}
          {(layout.silk ?? []).map((n, i) => (
            <text key={i} x={n.x} y={n.y} fontSize={(n.size ?? 1.5) * s} fill={PCB.silk}
              textAnchor={n.anchor ?? "middle"}
              style={n.back ? { opacity: "calc(0.32 * var(--l-back))" } : { opacity: 0.75 }}
              transform={n.rot ? `rotate(${n.rot} ${n.x} ${n.y})` : undefined}
              letterSpacing={0.06 * s}>
              {n.text}
            </text>
          ))}
          {layout.moat && <MoatLegend moat={layout.moat} s={s} />}
        </g>

        {/* ── test points sit on copper + silk together ────────────────── */}
        <g className="xfade" style={OP_BOTH} fontFamily="var(--font-geist-mono), monospace">
          {(layout.testpoints ?? []).map((tp, i) => (
            <g key={i}>
              <circle cx={tp.x} cy={tp.y} r={tp.th ? 0.95 : 0.75} fill={enig} />
              {tp.th && <circle cx={tp.x} cy={tp.y} r={0.4} fill={PCB.drill} />}
              <circle cx={tp.x} cy={tp.y} r={tp.th ? 1.35 : 1.15} fill="none"
                stroke={PCB.silk} strokeWidth={0.12 * s} opacity="0.55" />
              <text x={tp.x} y={tp.y - 1.75} fontSize={1.05 * s} fill={PCB.silk}
                textAnchor="middle" opacity="0.7">{tp.ref}</text>
            </g>
          ))}
        </g>

        {/* ── DRILL : plated vias and M3 mounting holes ────────────────── */}
        <g className="xfade" style={OP_DRILL}>
          {viaPads.map(([vr, d]) => (
            <path key={`vp${vr}`} d={d} fill={enig} />
          ))}
          {viaDrills.map(([vr, d]) => (
            <path key={`vd${vr}`} d={d} fill={PCB.drill} />
          ))}
          {/* M3 mounting holes are non-plated — a drilled hole, not a gold pad */}
          {(layout.holes ?? []).map((hole, i) => (
            <g key={i}>
              <circle cx={hole.x} cy={hole.y} r={1.6} fill={PCB.drill} />
              <circle cx={hole.x} cy={hole.y} r={1.6} fill="none"
                stroke={PCB.silk} strokeWidth={0.16 * s} opacity="0.4" />
            </g>
          ))}
        </g>

        {/* board edge — drawn last so the outline always reads */}
        <rect x="0" y="0" width={w} height={h} rx={r} fill="none"
          stroke={PCB.silk} strokeWidth={0.22 * s} opacity="0.45" />
      </g>
    </>
  );
});

/* ── the lit net: halo + core + flowing dashes, plus zone outlines ─────── */
function NetOverlay({ layout, net, s }: { layout: BoardLayout; net: Net; s: number }) {
  const match = net.nets
    ? (t: Trace) => !!t.net && net.nets!.includes(t.net)
    : (t: Trace) => t.net === net.key;
  /* Same merge as the base board, and it matters more here: a lit net drew a
     halo, a core and an ANIMATED path per segment, so tracing the USB pair
     put 41 infinite stroke-dashoffset animations on the page at once. Grouped
     by width, that is three or four. The flowing dashes share one width, so
     they collapse to a single element. */
  const byWidth = useMemo(() => {
    const runs = new Map<number, string>();
    for (const t of (layout.traces ?? []).filter(match)) {
      const w = (t.w ?? TRACE_W[t.kind ?? "sig"]) * s;
      const prev = runs.get(w);
      runs.set(w, prev ? `${prev} ${t.d}` : t.d);
    }
    return [...runs.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.traces, net, s]);
  const allD = useMemo(() => byWidth.map(([, d]) => d).join(" "), [byWidth]);
  const parts = (layout.parts ?? []).filter((p) => net.parts?.includes(p.ref));

  return (
    <g style={{ pointerEvents: "none" }}>
      {(net.zones ?? []).map((z, i) => (
        <g key={`z${i}`}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.r ?? 0.8}
            fill={net.color} opacity="0.12" />
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.r ?? 0.8}
            fill="none" stroke={net.color} strokeWidth={0.28 * s}
            strokeDasharray={z.dash === false ? undefined : `${1 * s} ${0.7 * s}`} opacity="0.95" />
          {z.label && (
            <text x={z.x + z.w / 2} y={z.y - 0.9} fontSize={1.25 * s} fill={net.color}
              textAnchor="middle" fontFamily="var(--font-geist-mono), monospace"
              letterSpacing={0.08 * s}>{z.label}</text>
          )}
        </g>
      ))}

      {byWidth.map(([w, d]) => (
        <path key={`h${w}`} d={d} fill="none" stroke={net.color}
          strokeWidth={w + 1.1 * s}
          strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      ))}
      {byWidth.map(([w, d]) => (
        <path key={`c${w}`} d={d} fill="none" stroke={net.color}
          strokeWidth={w}
          strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
      ))}
      <path className="pcb-flow" d={allD} fill="none" stroke="#fff"
        strokeWidth={0.3 * s} strokeLinecap="round"
        strokeDasharray={`${0.9 * s} ${2.6 * s}`} opacity="0.75" />

      {parts.map((p, i) => {
        const b = bodyBox(p);
        return (
          <rect key={`pt${i}`} x={b.x - 0.5} y={b.y - 0.5} width={b.w + 1} height={b.h + 1}
            rx={0.7} fill="none" stroke={net.color} strokeWidth={0.28 * s} opacity="0.9" />
        );
      })}

      {net.tps && (layout.testpoints ?? []).map((tp, i) => (
        <g key={`t${i}`}>
          <circle cx={tp.x} cy={tp.y} r={tp.th ? 1.9 : 1.6} fill={net.color} opacity="0.16" />
          <circle cx={tp.x} cy={tp.y} r={tp.th ? 1.5 : 1.25} fill="none" stroke={net.color}
            strokeWidth={0.26 * s} opacity="0.95" />
          <text x={tp.x} y={tp.y - 2.1} fontSize={1.1 * s} fill={net.color} textAnchor="middle"
            fontFamily="var(--font-geist-mono), monospace">{tp.ref}</text>
        </g>
      ))}
    </g>
  );
}

/* ── the FIELD SIDE / LOGIC SIDE legend running down the moat ──────────── */
function MoatLegend({ moat, s }: { moat: Moat; s: number }) {
  const cy = moat.labelY ?? (moat.y0 + moat.y1) / 2;
  const lx = moat.x - 1.3;
  const rx = moat.x + moat.w + 1.3;
  return (
    <g>
      <text x={lx} y={cy} fontSize={1.3 * s} fill={PCB.silk} textAnchor="middle"
        opacity="0.85" letterSpacing={0.08 * s} transform={`rotate(-90 ${lx} ${cy})`}>
        {moat.left}
      </text>
      <text x={rx} y={cy} fontSize={1.3 * s} fill={PCB.silk} textAnchor="middle"
        opacity="0.85" letterSpacing={0.08 * s} transform={`rotate(90 ${rx} ${cy})`}>
        {moat.right}
      </text>
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Part geometry — pads (copper) and bodies (silk), kept in separate passes
   so the layer cross-fade can separate them the way a gerber viewer does.
   ════════════════════════════════════════════════════════════════════════ */

/** the silk body box of any part, in board coordinates */
function bodyBox(p: Part): { x: number; y: number; w: number; h: number } {
  switch (p.kind) {
    case "module": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "ic": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "relay": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "inductor": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "bridge": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "usbc": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "jst": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "terminal": {
      const pitch = p.pitch ?? 5.08;
      return p.o === "v"
        ? { x: p.x, y: p.y, w: pitch * 1.55, h: pitch * p.ways }
        : { x: p.x, y: p.y, w: pitch * p.ways, h: pitch * 1.55 };
    }
    case "elyt": return { x: p.x - p.d / 2, y: p.y - p.d / 2, w: p.d, h: p.d };
    case "header": {
      const n = p.ways;
      return p.o === "v"
        ? { x: p.x - 1.27, y: p.y - (n * 2.54) / 2, w: 2.54, h: n * 2.54 }
        : { x: p.x - (n * 2.54) / 2, y: p.y - 1.27, w: n * 2.54, h: 2.54 };
    }
    case "passive": {
      const len = p.size ?? 1.0;
      return p.o === "v"
        ? { x: p.x - 0.32, y: p.y - len / 2, w: 0.64, h: len }
        : { x: p.x - len / 2, y: p.y - 0.32, w: len, h: 0.64 };
    }
    case "led": return { x: p.x - 0.8, y: p.y - 0.5, w: 1.6, h: 1.0 };
    case "jumper": return { x: p.x - 1.1, y: p.y - 0.6, w: 2.2, h: 1.2 };
    case "button": return { x: p.x, y: p.y, w: p.w, h: p.h };
    case "logo": return { x: p.x, y: p.y, w: p.w, h: p.h };
  }
}

/* applies a part's placement rotation about its own body centre, and ghosts
   anything marked do-not-populate */
function Placed({ p, children }: { p: Part; children: React.ReactNode }) {
  const b = bodyBox(p);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const rot = p.rot ?? 0;
  if (!rot && !p.dnp) return <>{children}</>;
  return (
    <g transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined} opacity={p.dnp ? 0.34 : 1}>
      {children}
    </g>
  );
}

/* pad geometry is real millimetres, so it needs no legibility scaling */
function Pads({ p, fill }: { p: Part; fill: string }) {
  switch (p.kind) {
    /* ESP32-S3-WROOM-1: castellated pads down both long sides and the end,
       plus the big exposed thermal/ground pad that sits under the body. */
    case "module": {
      const side = 13;
      const end = 11;
      const top = p.y + p.ant;
      const usable = p.h - p.ant;
      const pads: React.ReactElement[] = [];
      for (let i = 0; i < side; i++) {
        const y = top + (usable / (side + 1)) * (i + 1) - 0.75;
        pads.push(<rect key={`l${i}`} x={p.x - 0.85} y={y} width={1.35} height={1.5} rx={0.15} fill={fill} />);
        pads.push(<rect key={`r${i}`} x={p.x + p.w - 0.5} y={y} width={1.35} height={1.5} rx={0.15} fill={fill} />);
      }
      for (let i = 0; i < end; i++) {
        const x = p.x + (p.w / (end + 1)) * (i + 1) - 0.75;
        pads.push(<rect key={`b${i}`} x={x} y={p.y + p.h - 0.5} width={1.5} height={1.35} rx={0.15} fill={fill} />);
      }
      return (
        <g>
          {p.pad !== false && (
            <rect x={p.x + 2.4} y={p.y + p.ant + 2.4} width={p.w - 4.8} height={usable - 5.2}
              rx={0.4} fill={fill} opacity="0.55" />
          )}
          {pads}
        </g>
      );
    }

    case "ic": {
      const n = p.pins ?? 3;
      const nL = p.pinsL ?? n;
      const nR = p.pinsR ?? n;
      const pads: React.ReactElement[] = [];
      for (let i = 0; i < nL; i++) {
        const y = p.y + (p.h / (nL + 1)) * (i + 1) - 0.22;
        pads.push(<rect key={`l${i}`} x={p.x - 0.5} y={y} width={0.85} height={0.44} rx={0.08} fill={fill} />);
      }
      for (let i = 0; i < nR; i++) {
        const y = p.y + (p.h / (nR + 1)) * (i + 1) - 0.22;
        pads.push(<rect key={`r${i}`} x={p.x + p.w - 0.35} y={y} width={0.85} height={0.44} rx={0.08} fill={fill} />);
      }
      if (p.quad) {
        for (let i = 0; i < n; i++) {
          const x = p.x + (p.w / (n + 1)) * (i + 1) - 0.22;
          pads.push(<rect key={`t${i}`} x={x} y={p.y - 0.5} width={0.44} height={0.85} rx={0.08} fill={fill} />);
          pads.push(<rect key={`b${i}`} x={x} y={p.y + p.h - 0.35} width={0.44} height={0.85} rx={0.08} fill={fill} />);
        }
      }
      return <g>{pads}</g>;
    }

    case "passive":
    case "led": {
      const len = p.kind === "led" ? 1.6 : (p.size ?? 1.0);
      const pw = len * 0.42;
      const ph = p.kind === "led" ? 0.9 : (len === 1.0 ? 0.55 : len * 0.55);
      return p.o === "v" ? (
        <g>
          <rect x={p.x - ph / 2} y={p.y - len / 2 - pw * 0.35} width={ph} height={pw} rx={0.1} fill={fill} />
          <rect x={p.x - ph / 2} y={p.y + len / 2 - pw * 0.65} width={ph} height={pw} rx={0.1} fill={fill} />
        </g>
      ) : (
        <g>
          <rect x={p.x - len / 2 - pw * 0.35} y={p.y - ph / 2} width={pw} height={ph} rx={0.1} fill={fill} />
          <rect x={p.x + len / 2 - pw * 0.65} y={p.y - ph / 2} width={pw} height={ph} rx={0.1} fill={fill} />
        </g>
      );
    }

    /* USB-C receptacle: 4 through-hole shield legs either side of the SMD tongue */
    case "usbc": {
      const legs = p.edge === "bottom"
        ? [{ x: p.x + 0.9, y: p.y + p.h - 2.2 }, { x: p.x + p.w - 0.9, y: p.y + p.h - 2.2 }]
        : [{ x: p.x + p.w - 2.2, y: p.y + 0.9 }, { x: p.x + p.w - 2.2, y: p.y + p.h - 0.9 }];
      return (
        <g>
          <rect x={p.x + 1.2} y={p.y + 1.2} width={p.w - 2.4} height={p.h - 2.4} rx={0.3}
            fill={fill} opacity="0.4" />
          {legs.map((l, i) => (
            <g key={i}>
              <circle cx={l.x} cy={l.y} r={0.8} fill={fill} />
              <circle cx={l.x} cy={l.y} r={0.38} fill={PCB.drill} />
            </g>
          ))}
        </g>
      );
    }

    case "terminal": {
      const pitch = p.pitch ?? 5.08;
      const box = bodyBox(p);
      return (
        <g>
          {Array.from({ length: p.ways }).map((_, i) => {
            const cx = p.o === "v" ? box.x + box.w / 2 : box.x + pitch * (i + 0.5);
            const cy = p.o === "v" ? box.y + pitch * (i + 0.5) : box.y + box.h / 2;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={1.15} fill={fill} />
                <circle cx={cx} cy={cy} r={0.55} fill={PCB.drill} />
              </g>
            );
          })}
        </g>
      );
    }

    /* SPDT relay: 2 coil pins on the logic end, 3 contact pins on the field end */
    case "relay": {
      const box = { x: p.x, y: p.y, w: p.w, h: p.h };
      const coil = [0.3, 0.7].map((f) => ({ x: box.x + 1.6, y: box.y + box.h * f }));
      const cont = [0.2, 0.5, 0.8].map((f) => ({ x: box.x + box.w - 1.6, y: box.y + box.h * f }));
      return (
        <g>
          {[...coil, ...cont].map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={1.0} fill={fill} />
              <circle cx={c.x} cy={c.y} r={0.45} fill={PCB.drill} />
            </g>
          ))}
        </g>
      );
    }

    case "inductor":
      return (
        <g>
          <rect x={p.x - 0.6} y={p.y + p.h * 0.18} width={1.6} height={p.h * 0.64} rx={0.2} fill={fill} />
          <rect x={p.x + p.w - 1.0} y={p.y + p.h * 0.18} width={1.6} height={p.h * 0.64} rx={0.2} fill={fill} />
        </g>
      );

    case "elyt": {
      const off = p.d * 0.22;
      return (
        <g>
          {[-off, off].map((dx, i) => (
            <g key={i}>
              <circle cx={p.x + dx} cy={p.y} r={0.85} fill={fill} />
              <circle cx={p.x + dx} cy={p.y} r={0.4} fill={PCB.drill} />
            </g>
          ))}
        </g>
      );
    }

    case "bridge": {
      const pts = [
        { x: p.x + 1.2, y: p.y + 1.2 }, { x: p.x + p.w - 1.2, y: p.y + 1.2 },
        { x: p.x + 1.2, y: p.y + p.h - 1.2 }, { x: p.x + p.w - 1.2, y: p.y + p.h - 1.2 },
      ];
      return (
        <g>
          {pts.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={0.9} fill={fill} />
              <circle cx={c.x} cy={c.y} r={0.42} fill={PCB.drill} />
            </g>
          ))}
        </g>
      );
    }

    case "header": {
      const box = bodyBox(p);
      return (
        <g>
          {Array.from({ length: p.ways }).map((_, i) => {
            const cx = p.o === "v" ? box.x + box.w / 2 : box.x + 2.54 * (i + 0.5);
            const cy = p.o === "v" ? box.y + 2.54 * (i + 0.5) : box.y + box.h / 2;
            return (
              <g key={i}>
                {/* pin 1 is square, as it should be */}
                {i === 0
                  ? <rect x={cx - 0.85} y={cy - 0.85} width={1.7} height={1.7} rx={0.15} fill={fill} />
                  : <circle cx={cx} cy={cy} r={0.85} fill={fill} />}
                <circle cx={cx} cy={cy} r={0.45} fill={PCB.drill} />
              </g>
            );
          })}
        </g>
      );
    }

    case "jst":
      return (
        <g>
          {Array.from({ length: p.ways }).map((_, i) => {
            const cx = p.x + p.w / 2 + (i - (p.ways - 1) / 2) * 2.0;
            const cy = p.y + p.h - 1.1;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={0.75} fill={fill} />
                <circle cx={cx} cy={cy} r={0.35} fill={PCB.drill} />
              </g>
            );
          })}
        </g>
      );

    case "jumper":
      return (
        <g>
          <rect x={p.x - 1.05} y={p.y - 0.55} width={0.85} height={1.1} rx={0.12} fill={fill} />
          <rect x={p.x + 0.2} y={p.y - 0.55} width={0.85} height={1.1} rx={0.12} fill={fill} />
        </g>
      );

    case "button": {
      const pw = p.w * 0.22;
      const ph = p.h * 0.34;
      return (
        <g>
          {[[p.x - pw * 0.35, p.y + p.h * 0.16], [p.x + p.w - pw * 0.65, p.y + p.h * 0.16],
            [p.x - pw * 0.35, p.y + p.h * 0.5], [p.x + p.w - pw * 0.65, p.y + p.h * 0.5]]
            .map(([bx, by], i) => (
              <rect key={i} x={bx} y={by} width={pw} height={ph} rx={0.15} fill={fill} />
            ))}
        </g>
      );
    }

    case "logo":
      return null;
  }
}

function Body({ p, s, powered, accent }: { p: Part; s: number; powered: boolean; accent: string }) {
  const box = bodyBox(p);
  const ref = (
    <text x={box.x + box.w / 2} y={box.y - 0.55} fontSize={1.15 * s} fill={PCB.silk}
      textAnchor="middle" opacity="0.72">{p.ref}</text>
  );

  switch (p.kind) {
    case "module":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.4} fill="#16120c"
            stroke={PCB.silk} strokeWidth={0.2 * s} opacity="0.96" />
          {/* shield can seam */}
          <rect x={p.x + 0.9} y={p.y + p.ant + 0.6} width={p.w - 1.8} height={p.h - p.ant - 1.5}
            rx={0.25} fill="none" stroke={PCB.silk} strokeWidth={0.12 * s} opacity="0.3" />
          {/* the antenna nose, hatched as an all-layer keep-out */}
          <rect x={p.x} y={p.y} width={p.w} height={p.ant} rx={0.35} fill="none"
            stroke={PCB.silk} strokeWidth={0.16 * s} strokeDasharray={`${0.6 * s} ${0.5 * s}`} opacity="0.65" />
          <text x={p.x + p.w / 2} y={p.y + p.ant * 0.62} fontSize={1.05 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.6" letterSpacing={0.08 * s}>ANT KEEP-OUT</text>
          {/* pin-1 dot */}
          <circle cx={p.x + 1.1} cy={p.y + p.ant + 1.1} r={0.4} fill={PCB.silk} opacity="0.9" />
          <text x={p.x + p.w / 2} y={p.y + p.ant + (p.h - p.ant) * 0.5} fontSize={1.9 * s}
            fill={PCB.silk} textAnchor="middle" fontWeight="bold" opacity="0.9">{p.ref}</text>
          {p.label && (
            <text x={p.x + p.w / 2} y={p.y + p.ant + (p.h - p.ant) * 0.5 + 2.1} fontSize={1.05 * s}
              fill={PCB.silk} textAnchor="middle" opacity="0.62">{p.label}</text>
          )}
        </g>
      );

    case "ic":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.2} fill="#1a1613"
            stroke={PCB.silk} strokeWidth={0.14 * s} opacity="0.92" />
          <circle cx={p.x + 0.5} cy={p.y + 0.5} r={0.22} fill={PCB.silk} opacity="0.85" />
          {ref}
        </g>
      );

    case "passive": {
      const len = p.size ?? 1.0;
      return (
        <g>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={0.1}
            fill={p.polar ? "#2a2320" : "#221d1a"} stroke={PCB.silk} strokeWidth={0.1 * s} opacity="0.85" />
          {/* cathode / polarity band */}
          {p.polar && (p.o === "v"
            ? <rect x={box.x} y={box.y} width={box.w} height={len * 0.24} fill={PCB.silk} opacity="0.75" />
            : <rect x={box.x + box.w - len * 0.24} y={box.y} width={len * 0.24} height={box.h} fill={PCB.silk} opacity="0.75" />)}
          <text x={p.x} y={p.o === "v" ? p.y - len / 2 - 0.4 : p.y - 0.9} fontSize={0.8 * s}
            fill={PCB.silk} textAnchor="middle" opacity="0.45">{p.ref}</text>
        </g>
      );
    }

    case "led": {
      const c = p.color ?? accent;
      return (
        <g>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={0.15} fill="#0d0d0d"
            stroke={PCB.silk} strokeWidth={0.1 * s} opacity="0.85" />
          <circle cx={p.x} cy={p.y} r={powered ? 0.75 : 0.4} fill={powered ? c : "#1d1d1d"}
            opacity={powered ? 1 : 0.6}
            style={powered ? { filter: `drop-shadow(0 0 1.1px ${c})` } : undefined} />
          {p.label && (
            <text x={p.x} y={p.y + 2.1} fontSize={0.95 * s} fill={PCB.silk}
              textAnchor="middle" opacity="0.6">{p.label}</text>
          )}
        </g>
      );
    }

    case "usbc":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.6} fill="#232326"
            stroke={PCB.silk} strokeWidth={0.16 * s} opacity="0.9" />
          {/* the receptacle mouth, facing the board edge */}
          {p.edge === "bottom" ? (
            <rect x={p.x + p.w * 0.18} y={p.y + p.h - 1.5} width={p.w * 0.64} height={0.9} rx={0.45}
              fill="#0a0a0c" stroke={PCB.silk} strokeWidth={0.08 * s} opacity="0.9" />
          ) : (
            <rect x={p.x + 0.6} y={p.y + p.h * 0.18} width={0.9} height={p.h * 0.64} rx={0.45}
              fill="#0a0a0c" stroke={PCB.silk} strokeWidth={0.08 * s} opacity="0.9" />
          )}
          <text x={box.x + box.w / 2} y={p.edge === "bottom" ? p.y - 0.55 : p.y - 0.55}
            fontSize={1.15 * s} fill={PCB.silk} textAnchor="middle" opacity="0.72">{p.ref}</text>
        </g>
      );

    case "terminal": {
      const pitch = p.pitch ?? 5.08;
      return (
        <g>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={0.4} fill="#1d2a1f"
            stroke={PCB.silk} strokeWidth={0.18 * s} opacity="0.92" />
          {Array.from({ length: p.ways }).map((_, i) => {
            const cx = p.o === "v" ? box.x + box.w * 0.36 : box.x + pitch * (i + 0.5);
            const cy = p.o === "v" ? box.y + pitch * (i + 0.5) : box.y + box.h * 0.36;
            return (
              <g key={i}>
                {/* wire entry + screw head */}
                <circle cx={cx} cy={cy} r={pitch * 0.24} fill="#0b0b0d" opacity="0.9" />
                <circle cx={p.o === "v" ? box.x + box.w * 0.74 : cx}
                  cy={p.o === "v" ? cy : box.y + box.h * 0.74} r={pitch * 0.2}
                  fill="#3a3a3f" stroke={PCB.silk} strokeWidth={0.08 * s} opacity="0.8" />
                <line
                  x1={(p.o === "v" ? box.x + box.w * 0.74 : cx) - pitch * 0.14}
                  y1={p.o === "v" ? cy : box.y + box.h * 0.74}
                  x2={(p.o === "v" ? box.x + box.w * 0.74 : cx) + pitch * 0.14}
                  y2={p.o === "v" ? cy : box.y + box.h * 0.74}
                  stroke={PCB.silk} strokeWidth={0.14 * s} opacity="0.7" />
              </g>
            );
          })}
          {ref}
          {p.label && (
            <text x={box.x + box.w / 2} y={box.y + box.h + 1.6} fontSize={1.1 * s} fill={PCB.silk}
              textAnchor="middle" opacity="0.7" letterSpacing={0.06 * s}>{p.label}</text>
          )}
        </g>
      );
    }

    case "relay":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.5} fill="#1b1723"
            stroke={PCB.silk} strokeWidth={0.2 * s} opacity="0.95" />
          <rect x={p.x + 0.8} y={p.y + 0.8} width={p.w - 1.6} height={p.h - 1.6} rx={0.3}
            fill="none" stroke={PCB.silk} strokeWidth={0.1 * s} opacity="0.28" />
          <text x={p.x + p.w / 2} y={p.y + p.h * 0.44} fontSize={1.7 * s} fill={PCB.silk}
            textAnchor="middle" fontWeight="bold" opacity="0.88">{p.ref}</text>
          <text x={p.x + p.w / 2} y={p.y + p.h * 0.72} fontSize={1.0 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.55">{p.label ?? "SPDT 5V"}</text>
          {/* which end is which, in plain English, on the silk */}
          <text x={p.x + 1.7} y={p.y - 0.5} fontSize={0.95 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.6">COIL</text>
          <text x={p.x + p.w - 1.7} y={p.y - 0.5} fontSize={0.95 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.6">NO·C·NC</text>
        </g>
      );

    case "inductor":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.6} fill="#241d17"
            stroke={PCB.silk} strokeWidth={0.16 * s} opacity="0.92" />
          <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={Math.min(p.w, p.h) * 0.3}
            fill="none" stroke={PCB.silk} strokeWidth={0.12 * s} opacity="0.4" />
          {ref}
        </g>
      );

    case "elyt":
      return (
        <g>
          <circle cx={p.x} cy={p.y} r={p.d / 2} fill="#1a1b22" stroke={PCB.silk}
            strokeWidth={0.18 * s} opacity="0.94" />
          {/* the minus stripe — polarity you can see at ×10 */}
          <path d={`M${p.x - p.d / 2} ${p.y} a ${p.d / 2} ${p.d / 2} 0 0 1 ${p.d * 0.28} ${-p.d * 0.42}
                    L ${p.x + p.d * 0.02} ${p.y + p.d * 0.46} a ${p.d / 2} ${p.d / 2} 0 0 1 ${-p.d * 0.52} ${-p.d * 0.46} Z`}
            fill={PCB.silk} opacity="0.16" />
          <text x={p.x - p.d * 0.25} y={p.y + 0.5} fontSize={1.6 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.75">−</text>
          <text x={p.x + p.d * 0.3} y={p.y + 0.5} fontSize={1.4 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.6">+</text>
          <text x={p.x} y={p.y - p.d / 2 - 0.6} fontSize={1.15 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.72">{p.ref}</text>
        </g>
      );

    case "bridge":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.4} fill="#191519"
            stroke={PCB.silk} strokeWidth={0.18 * s} opacity="0.93" />
          <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 0.55} fontSize={1.5 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.8">~ ~</text>
          <text x={p.x + 1.2} y={p.y + p.h - 0.35} fontSize={1.0 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.7">−</text>
          <text x={p.x + p.w - 1.2} y={p.y + 1.35} fontSize={1.0 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.7">+</text>
          {ref}
        </g>
      );

    case "header":
      return (
        <g>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={0.25} fill="#1a1613"
            stroke={PCB.silk} strokeWidth={0.14 * s} opacity="0.9" />
          {ref}
          {p.label && (
            <text x={box.x + box.w / 2} y={box.y + box.h + 1.5} fontSize={1.05 * s} fill={PCB.silk}
              textAnchor="middle" opacity="0.65">{p.label}</text>
          )}
        </g>
      );

    case "jst":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.3} fill="#2a2620"
            stroke={PCB.silk} strokeWidth={0.16 * s} opacity="0.92" />
          <rect x={p.x + 0.5} y={p.y + 0.4} width={p.w - 1.0} height={p.h * 0.4} rx={0.2}
            fill="#0d0b0a" opacity="0.8" />
          {ref}
          {p.label && (
            <text x={p.x + p.w / 2} y={p.y + p.h + 1.5} fontSize={1.05 * s} fill={PCB.silk}
              textAnchor="middle" opacity="0.65">{p.label}</text>
          )}
        </g>
      );

    case "button":
      return (
        <g>
          <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={0.35} fill="#2b2b30"
            stroke={PCB.silk} strokeWidth={0.16 * s} opacity="0.94" />
          <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2} r={Math.min(p.w, p.h) * 0.28}
            fill="#d8d5cd" opacity="0.85" />
          <text x={p.x + p.w / 2} y={p.y + p.h + 1.5} fontSize={1.15 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.8" letterSpacing={0.06 * s}>{p.label ?? p.ref}</text>
        </g>
      );

    /* the cupcake on the real board — drawn, not imported */
    case "logo": {
      const cx = p.x + p.w / 2;
      const base = p.y + p.h * 0.92;
      return (
        <g fill={PCB.silk} opacity="0.6">
          <path d={`M${cx - p.w * 0.3} ${p.y + p.h * 0.46}
                    L${cx - p.w * 0.21} ${base} L${cx + p.w * 0.21} ${base}
                    L${cx + p.w * 0.3} ${p.y + p.h * 0.46} Z`} />
          <path d={`M${cx - p.w * 0.34} ${p.y + p.h * 0.46}
                    a ${p.w * 0.19} ${p.w * 0.19} 0 0 1 ${p.w * 0.2} ${-p.w * 0.2}
                    a ${p.w * 0.2} ${p.w * 0.2} 0 0 1 ${p.w * 0.28} 0
                    a ${p.w * 0.19} ${p.w * 0.19} 0 0 1 ${p.w * 0.2} ${p.w * 0.2} Z`} />
          <circle cx={cx} cy={p.y + p.h * 0.08} r={p.w * 0.07} />
        </g>
      );
    }

    case "jumper":
      return (
        <g>
          <line x1={p.x - 0.6} y1={p.y} x2={p.x + 0.6} y2={p.y} stroke={PCB.copperBright}
            strokeWidth={0.22 * s} opacity="0.9" />
          <text x={p.x} y={p.y - 1.1} fontSize={1.0 * s} fill={PCB.silk}
            textAnchor="middle" opacity="0.7">{p.ref}</text>
          {p.label && (
            <text x={p.x} y={p.y + 1.9} fontSize={0.95 * s} fill={PCB.silk}
              textAnchor="middle" opacity="0.55">{p.label}</text>
          )}
        </g>
      );
  }
}
