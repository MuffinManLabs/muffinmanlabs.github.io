import { PCB } from "./pcbData";
import type { BoardLayout, Part, Trace } from "./BoardSVG";

/* ════════════════════════════════════════════════════════════════════════
   MML-02 — ESP32-S3 Protected Field I/O Controller.
   110 × 76 mm, 2-layer 1 oz, unbroken bottom ground under logic + converter.

   The floorplan is the argument: one moat down the middle, logic left,
   field right — and the only two parts allowed to cross it are the ones
   that ARE the barrier. The optocouplers straddle it (LED on the field
   side, phototransistor on the logic side) and the relays straddle it
   (coil on the logic side, dry contacts on the field side).
   ════════════════════════════════════════════════════════════════════════ */

const W = 110;
const H = 76;

/* the four input channels, and where each one lands on both sides */
const CH = [
  { i: 1, optoY: 3.5, termY: 8.54 },
  { i: 2, optoY: 11.5, termY: 13.62 },
  { i: 3, optoY: 19.5, termY: 18.70 },
  { i: 4, optoY: 27.5, termY: 23.78 },
];
/* PC817 body 45.5..53 straddling the 48..52 moat; pads at h/3 spacing */
const anode = (o: number) => o + 1.53;
const cathode = (o: number) => o + 3.07;
/* where each channel's logic-side signal lands on U1's right pad column */
const GPIO_Y = [3.29, 7.46, 11.64, 15.82];

const optoParts: Part[] = CH.map((c) => ({
  kind: "ic",
  ref: `U${4 + c.i}`,
  label: "PC817",
  x: 45.5,
  y: c.optoY,
  w: 7.5,
  h: 4.6,
  pinsL: 2,
  pinsR: 2,
}));

const inputParts: Part[] = CH.flatMap((c): Part[] => {
  const a = anode(c.optoY);
  return [
    /* 4.8 k as two 2.4 k 0805s in series — spreads the dissipation and
       doubles the working voltage */
    { kind: "passive", ref: `R${16 + c.i * 2}`, x: 58.0, y: a, o: "h", size: 2.0 },
    { kind: "passive", ref: `R${17 + c.i * 2}`, x: 62.5, y: a, o: "h", size: 2.0 },
    /* 1N4148 anti-parallel across the opto LED: reverse protection + AC */
    { kind: "passive", ref: `D${10 + c.i}`, x: 55.5, y: a + 0.77, o: "v", size: 2.0, polar: true },
    { kind: "led", ref: `D${c.i}`, label: `IN${c.i}`, x: 42.0, y: a + 0.77, color: PCB.comm },
  ];
});

const inputTraces: Trace[] = CH.flatMap((c, k): Trace[] => {
  const a = anode(c.optoY);
  const cat = cathode(c.optoY);
  const turn = 72.5 - k * 1.6;
  return [
    /* field side: terminal → 2 × 2.4 k → opto LED anode */
    { net: "opto", kind: "field", d: `M103.94 ${c.termY} H${turn} V${a} H63.6` },
    { net: "opto", kind: "field", d: `M61.4 ${a} H59.1` },
    { net: "opto", kind: "field", d: `M56.9 ${a} H53.5` },
    /* the anti-parallel diode, bridging the LED's own two pins */
    { net: "opto", kind: "sig", d: `M53.5 ${a} H55.5 V${a + 0.1}` },
    { net: "opto", kind: "sig", d: `M53.5 ${cat} H55.5 V${cat - 0.1}` },
    /* shared field COM returns every cathode to the terminal */
    { net: "opto", kind: "field", d: `M57.0 ${cat} H53.5` },
    /* logic side: collector → indicator LED → GPIO, fanned in without a crossing */
    { net: "opto", kind: "sig", d: `M45.0 ${a} H43.5 V${a + 0.77} H42.8` },
    {
      net: "opto", kind: "sig",
      d: `M41.2 ${a + 0.77} H33 C29 ${a + 0.77} 28 ${GPIO_Y[k]} 25.85 ${GPIO_Y[k]}`,
    },
  ];
});

export const MML02: BoardLayout = {
  w: W,
  h: H,
  pad: 8,
  radius: 1.5,
  scale: 1.45,
  layers: ["all", "silk", "copper", "plane", "mask", "drill"],
  planeLabel: "B.Cu · unbroken GND under logic + converter",

  /* bottom copper is one ground under the logic side and the converter;
     the field side keeps its own pour, joined at a single star point */
  plane: [{ x: 0, y: 0, w: W, h: H }],
  planeVoids: [{ x: 5.6, y: -0.6, w: 21.4, h: 3.4 }],
  pours: [{ x: 84.0, y: 3.0, w: 14.0, h: 30.0 }],

  moat: { x: 48, w: 4, y0: 0, y1: H, left: "LOGIC SIDE", right: "FIELD SIDE", labelY: 39.6 },

  traces: [
    /* ── USB 2.0 pair, up the far left edge, length-matched, no vias ──── */
    { net: "usb", kind: "sig", d: "M9.5 68.7 V65.65 H8.9" },
    { net: "usb", kind: "sig", d: "M10.9 68.7 V65.0 H8.9" },
    { net: "usb", kind: "sig", d: "M4.0 65.65 H2.6 V14.43 H6.15" },
    {
      net: "usb", kind: "sig",
      d: "M4.0 65.0 H3.8 V44 l1.1 -1.1 l-1.1 -1.1 l1.1 -1.1 l-1.1 -1.1 V15.82 H6.15",
    },

    /* ── field power entry, in copper order ──────────────────────────── */
    { net: "field", kind: "field", d: "M94.54 68.94 H88.6" },
    { net: "field", kind: "field", d: "M85.4 68.94 H84.0 V68.2 H82.3" },
    { net: "field", kind: "field", d: "M99.62 68.94 V74.5 H84.5 V72.3 H82.3" },
    { net: "field", kind: "field", d: "M77.2 68.2 H74.5 V63.5 H79.5 V62.2" },
    { net: "field", kind: "field", d: "M79.5 58.8 V57.0 H87.8" },
    /* the rectified bus crosses the moat once, on its way to the buck */
    { net: "field", kind: "pwr", d: "M79.5 57.0 V39.5 H47.8 V43.5 H45.0" },

    /* ── the buck : hot loop kept tiny, FB tapped at the output cap ──── */
    { net: "buck", kind: "pwr", d: "M43.95 41.8 H42.4" },
    { net: "buck", kind: "pwr", d: "M43.95 45.2 H42.4 V44.5" },
    { net: "buck", kind: "pwr", d: "M38.0 43.9 H35.5", w: 1.1 },
    { net: "buck", kind: "pwr", d: "M30.0 43.9 H27.5" },
    { net: "buck", kind: "sig", d: "M32.1 49.5 H33.4" },
    { net: "buck", kind: "sig", d: "M29.9 49.5 H28.5 V46.5 H27.5" },
    { net: "buck", kind: "sig", d: "M35.6 49.5 H38.6 V46.0 H40.2 V45.8" },
    { net: "buck", kind: "sig", d: "M44.0 48.5 V46.5 H42.4" },

    /* ── 5 V rail out of the buck → LDO → 3V3 under the module ───────── */
    { net: "rail", kind: "pwr", d: "M27.5 42.5 V36.9 H25.9" },
    { net: "rail", kind: "pwr", d: "M21.5 37.4 H13.5 V22.0 H22.0" },
    { net: "rail", kind: "pwr", d: "M22.0 22.0 V20.85" },
    { kind: "sig", d: "M19.5 22.0 V22.8" },
    { kind: "sig", d: "M16.5 22.0 V22.8" },

    /* ── relay drive : GPIO → 680 Ω → NPN → coil, with flyback ───────── */
    { net: "relay", kind: "sig", d: "M25.85 17.21 H30.0 V51.3 H30.4" },
    { net: "relay", kind: "sig", d: "M33.6 51.3 H36.5" },
    { net: "relay", kind: "pwr", d: "M39.7 51.05 H43.6" },
    { net: "relay", kind: "pwr", d: "M41.0 55.0 V56.45 H43.6" },
    { net: "relay", kind: "sig", d: "M25.85 18.60 H31.5 V66.3 H30.4" },
    { net: "relay", kind: "sig", d: "M33.6 66.3 H36.5" },
    { net: "relay", kind: "pwr", d: "M39.7 66.05 H43.6" },
    { net: "relay", kind: "pwr", d: "M41.0 70.0 V71.45 H43.6" },
    /* dry contacts out to their own terminals — monotone, so nothing crosses */
    { net: "relay", kind: "field", d: "M59.9 49.7 H63.5 V43.54 H69.94" },
    { net: "relay", kind: "field", d: "M59.9 53.75 H65.5 V48.62 H69.94" },
    { net: "relay", kind: "field", d: "M59.9 57.8 H67.5 V53.70 H69.94" },
    { net: "relay", kind: "field", d: "M59.9 64.7 H63.5 V60.54 H69.94" },
    { net: "relay", kind: "field", d: "M59.9 68.75 H65.5 V65.62 H69.94" },
    { net: "relay", kind: "field", d: "M59.9 72.8 H67.5 V70.70 H69.94" },

    /* ── low-side MOSFET channels — logic ground, NOT isolated ───────── */
    { net: "mosfet", kind: "sig", d: "M25.85 13.03 H8.6 V52.0" },
    { net: "mosfet", kind: "sig", d: "M11.4 53.3 H12.0" },
    { net: "mosfet", kind: "sig", d: "M14.0 53.3 H15.5" },
    { net: "mosfet", kind: "pwr", d: "M7.0 53.3 H5.0 V64.5 H19.0 V68.0" },
    { net: "mosfet", kind: "sig", d: "M11.4 59.3 H12.0" },
    { net: "mosfet", kind: "sig", d: "M14.0 59.3 H15.5" },
    { net: "mosfet", kind: "pwr", d: "M7.0 59.3 H5.8 V63.5 H24.0 V68.0" },
    { net: "mosfet", kind: "pwr", d: "M21.5 53.3 H24.0 V55.9" },
    { net: "mosfet", kind: "pwr", d: "M24.0 57.1 V61.0 H29.0 V68.0" },

    /* ── the four input channels, generated per channel above ────────── */
    ...inputTraces,
  ],

  parts: [
    /* U1 — same module block as MML-01, zero redesign */
    { kind: "module", ref: "U1", label: "ESP32-S3-WROOM-1", x: 7, y: -5.5, w: 18, h: 25.5, ant: 6 },

    /* USB-C, programming only, on the edge opposite every field terminal */
    { kind: "usbc", ref: "J1", edge: "bottom", x: 6, y: 68.7, w: 9, h: 7.3 },
    { kind: "ic", ref: "U3", label: "USBLC6", x: 4.5, y: 63.7, w: 4.2, h: 2.6, pinsL: 3, pinsR: 3 },
    { kind: "passive", ref: "R1", x: 16.0, y: 66.5, o: "h" },
    { kind: "passive", ref: "R2", x: 16.0, y: 68.5, o: "h" },
    { kind: "passive", ref: "R3", x: 2.6, y: 30.0, o: "v" },
    { kind: "passive", ref: "R4", x: 3.8, y: 33.0, o: "v" },

    /* the buck — the one new hard thing */
    { kind: "passive", ref: "C7", x: 44.5, y: 41.8, o: "v", size: 2.0 },
    { kind: "passive", ref: "C8", x: 44.5, y: 45.2, o: "v", size: 2.0 },
    { kind: "ic", ref: "U4", label: "60V 1.5A", x: 38.0, y: 42.0, w: 4.4, h: 3.8, pinsL: 4, pinsR: 4 },
    { kind: "inductor", ref: "L1", label: "shielded", x: 30.0, y: 41.5, w: 5.5, h: 4.8 },
    { kind: "passive", ref: "C9", x: 27.5, y: 43.5, o: "v", size: 2.0 },
    { kind: "passive", ref: "R5", x: 31.0, y: 49.5, o: "h" },
    { kind: "passive", ref: "R6", x: 34.5, y: 49.5, o: "h" },
    { kind: "passive", ref: "R7", x: 44.0, y: 49.0, o: "h" },
    { kind: "passive", ref: "R8", x: 44.0, y: 51.5, o: "h" },

    /* 3V3 rail + decoupling under the module */
    { kind: "ic", ref: "U2", label: "AP2112K", x: 22.0, y: 36.0, w: 3.4, h: 2.8, pinsL: 3, pinsR: 2 },
    { kind: "passive", ref: "C1", x: 19.5, y: 23.3, o: "v" },
    { kind: "passive", ref: "C2", x: 16.5, y: 23.3, o: "v" },

    /* the isolation barrier itself — optos straddling the moat */
    ...optoParts,
    ...inputParts,

    /* relays straddle the moat too: coil on the logic side, contacts on the field side.
       The silk carries the rating the BOARD is specified for, not the 10 A the relay
       can prints — same rule the design document sets for the physical silkscreen. */
    { kind: "relay", ref: "K1", label: "SPDT · 2 A @ 30 V", x: 42, y: 47, w: 19.5, h: 13.5 },
    { kind: "relay", ref: "K2", label: "SPDT · 2 A @ 30 V", x: 42, y: 62, w: 19.5, h: 13.5 },
    { kind: "ic", ref: "Q1", label: "S8050", x: 36.5, y: 50.0, w: 3.2, h: 2.6, pinsL: 2, pinsR: 1 },
    { kind: "ic", ref: "Q2", label: "S8050", x: 36.5, y: 65.0, w: 3.2, h: 2.6, pinsL: 2, pinsR: 1 },
    { kind: "passive", ref: "R13", x: 32.0, y: 51.3, o: "h" },
    { kind: "passive", ref: "R14", x: 32.0, y: 54.3, o: "h" },
    { kind: "passive", ref: "R15", x: 32.0, y: 66.3, o: "h" },
    { kind: "passive", ref: "R16", x: 32.0, y: 69.3, o: "h" },
    { kind: "passive", ref: "D9", x: 41.0, y: 53.7, o: "v", size: 2.0, polar: true },
    { kind: "passive", ref: "D10", x: 41.0, y: 68.7, o: "v", size: 2.0, polar: true },
    { kind: "led", ref: "D5", label: "RLY1", x: 28.5, y: 51.3, color: PCB.green },
    { kind: "led", ref: "D6", label: "RLY2", x: 28.5, y: 64.2, color: PCB.green },

    /* low-side MOSFET channels */
    { kind: "ic", ref: "Q3", label: "AO3400", x: 7.0, y: 52.0, w: 3.2, h: 2.6, pinsL: 2, pinsR: 1 },
    { kind: "ic", ref: "Q4", label: "AO3400", x: 7.0, y: 58.0, w: 3.2, h: 2.6, pinsL: 2, pinsR: 1 },
    { kind: "passive", ref: "R9", x: 13.0, y: 53.3, o: "h" },
    { kind: "passive", ref: "R10", x: 16.5, y: 53.3, o: "h" },
    { kind: "passive", ref: "R11", x: 13.0, y: 59.3, o: "h" },
    { kind: "passive", ref: "R12", x: 16.5, y: 59.3, o: "h" },
    { kind: "passive", ref: "D7", x: 20.5, y: 53.3, o: "h", size: 2.0, polar: true },
    { kind: "passive", ref: "D8", x: 20.5, y: 59.3, o: "h", size: 2.0, polar: true },
    { kind: "jumper", ref: "JP1", label: "VLOAD", x: 25.5, y: 56.5 },

    /* field terminals — right edge and bottom edge only */
    { kind: "terminal", ref: "J3", x: 100, y: 6, ways: 5, o: "v" },
    { kind: "terminal", ref: "J2", label: "24V IN", x: 92, y: 65.0, ways: 2, o: "h" },
    { kind: "terminal", ref: "J4", x: 66, y: 41, ways: 3, o: "v" },
    { kind: "terminal", ref: "J5", x: 66, y: 58, ways: 3, o: "v" },
    /* MOSFET loads live on the LOGIC side, because they share board ground */
    { kind: "terminal", ref: "J7", label: "PUMP+ · P2+ · VLOAD", x: 18, y: 68, ways: 3, pitch: 3.81, o: "h" },

    /* field power entry chain */
    { kind: "passive", ref: "F1", x: 87.0, y: 68.94, o: "h", size: 3.2 },
    { kind: "bridge", ref: "BR1", x: 76.0, y: 67.0, w: 7.5, h: 6.5 },
    { kind: "passive", ref: "D15", x: 79.5, y: 60.0, o: "v", size: 3.5, polar: true },
    { kind: "elyt", ref: "C10", label: "470µ 63V", x: 90.0, y: 57.0, d: 10 },
  ],

  testpoints: [
    { ref: "VIN", x: 60.0, y: 39.5 },
    { ref: "5V", x: 27.5, y: 39.0 },
    { ref: "3V3", x: 13.5, y: 28.0 },
    { ref: "GND", x: 17.0, y: 31.0 },
    { ref: "GND", x: 35.5, y: 55.5 },
    { ref: "SW", x: 36.5, y: 39.5 },
    { ref: "EN", x: 10.0, y: 30.0 },
    { ref: "IO0", x: 10.0, y: 33.5 },
    { ref: "TX", x: 8.0, y: 44.0, th: true },
    { ref: "RX", x: 11.0, y: 44.0, th: true },
    { ref: "GND", x: 14.0, y: 44.0, th: true },
  ],

  holes: [
    { x: 2.6, y: 2.6 },
    { x: 107.4, y: 2.6 },
    { x: 2.6, y: 73.4 },
    { x: 107.4, y: 73.4 },
  ],

  vias: [
    { x: 19.5, y: 24.7 },
    { x: 16.5, y: 24.7 },
    { x: 44.5, y: 47.0 },
    { x: 27.5, y: 46.0 },
    /* the single star point where the field pour meets logic ground */
    { x: 50.0, y: 41.5 },
    ...[5.0, 8.5, 12.0, 15.5, 19.0, 22.5].map((x) => ({ x, y: 22.6 })),
    ...[4.5, 8.0, 11.5, 15.0, 18.5].map((y) => ({ x: 5.5, y })),
    ...[4.5, 8.0, 11.5, 15.0, 18.5].map((y) => ({ x: 26.4, y })),
  ],

  silk: [
    { x: 86.0, y: 34.5, text: "MML-02 · FIELD I/O", size: 1.2 },
    { x: 86.0, y: 37.6, text: "≤ 2 A @ ≤ 30 V — NOT FOR MAINS", size: 1.0 },
    { x: 24.0, y: 62.5, text: "LOADS SHARE GND · NOT ISOLATED", size: 1.0 },
    { x: 69.94, y: 38.6, text: "VALVE", size: 1.1 },
    { x: 69.94, y: 75.5, text: "AUX", size: 1.1 },
    { x: 97.5, y: 18.7, text: "IN1–IN4 · COM", size: 1.05, rot: -90 },
    { x: 88.0, y: 48.0, text: "9–36 VDC / 24 VAC", size: 1.0 },
    { x: 88.0, y: 44.0, text: "B.SILK ID — MuffinByteLabs · REV A · QR", size: 1.0, back: true },
  ],

  nets: [
    {
      key: "moat",
      label: "Isolation moat",
      color: PCB.error,
      note:
        "A ≥ 2.5 mm moat with no copper on either layer, widened around the relay contacts. The only parts that cross it are the ones that ARE the barrier — the optocouplers and the relays. The field pour joins logic ground at exactly one star point.",
      zones: [
        { x: 48, y: 0, w: 4, h: H, r: 0.4, label: "≥ 2.5 mm · NO COPPER" },
      ],
    },
    {
      key: "buck",
      label: "Buck hot loop",
      color: PCB.copperBright,
      note:
        "CIN → high-side FET → low-side FET → CIN ground, at minimum area and entirely on the top layer. FB is short, routed away from the SW node, and tapped at the output capacitor — not the inductor pad. EN sets UVLO ≈ 7.5 V and is never wired to the buck's own output.",
      zones: [{ x: 37.3, y: 40.6, w: 8.6, h: 7.4, r: 0.5, label: "HOT LOOP" }],
      parts: ["U4", "L1", "C7", "C8", "C9"],
    },
    {
      key: "field",
      label: "Field power entry",
      color: PCB.enigBright,
      note:
        "Polyfuse → bridge rectifier → TVS → bulk electrolytic, in copper order. The bridge is on everything: reverse-wired DC becomes impossible rather than protected-against, and 24 VAC needs it anyway. TVS standoff ≥ 42 V so it never conducts at an unloaded transformer's 40 V peak.",
      parts: ["J2", "F1", "BR1", "D15", "C10"],
    },
    {
      key: "opto",
      label: "Opto inputs ×4",
      color: PCB.comm,
      note:
        "PC817-class on a shared field COM, the way industrial I/O is actually wired. 4.8 k as two 2.4 k 0805s in series, 1N4148 anti-parallel for reverse protection and AC capability, and a 10 k / 1 µF logic side so a 60 Hz half-wave input holds a steady LOW through the zero crossings instead of chattering.",
      parts: ["J3", "U5", "U6", "U7", "U8"],
    },
    {
      key: "relay",
      label: "Relay outputs ×2",
      color: PCB.green,
      note:
        "S8050 driver, 680 Ω base, base pulldown so outputs are OFF through boot and reset, 1N4148 flyback across the coil. COM/NO/NC all reach terminals so each deployment picks its own fail-safe direction — and there are snubber/MOV footprints across the contacts, DNP by default.",
      parts: ["K1", "K2", "Q1", "Q2", "D9", "D10", "J4", "J5"],
    },
    {
      key: "mosfet",
      label: "MOSFET outputs ×2",
      color: PCB.purple,
      note:
        "Low-side AO3400, 100 Ω gate resistor, 100 k gate pulldown, SS14 flyback returned to VLOAD. These loads share board ground — they are NOT isolated, and the README and the silkscreen both say so. JP1 ties VLOAD to 5 V by default; cut it to feed 8–12 V externally.",
      parts: ["Q3", "Q4", "JP1", "J7"],
    },
    {
      key: "usb",
      label: "USB 2.0 pair",
      color: PCB.enig,
      note:
        "The same block as MML-01, reused with zero redesign — coupled pair, length match, 5.1 k CC pulldowns, ESD, polyfuse. USB never powers field loads: a Schottky ORs it into the 5 V rail so the board flashes on the bench with nothing connected, and the buck can never back-feed a laptop.",
      parts: ["J1", "U3", "R3", "R4"],
    },
    {
      key: "tp",
      label: "Test points",
      color: PCB.enigBright,
      note:
        "VIN_RECT, 5V, 3V3, GND ×2 and a small SW pad, plus the EN/IO0/UART trio carried over from MML-01. Probe ripple at the output capacitor, never at FB.",
      tps: true,
    },
  ],
};
