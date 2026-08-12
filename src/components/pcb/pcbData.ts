/* ════════════════════════════════════════════════════════════════════════
   PCB DESIGN — single source of truth for every section on the homepage.
   Keep all part numbers / specs technically correct: a PCB-literate client
   will scrutinize them (one pull-up pair per I2C bus, AP2112K over AMS1117,
   IPC-2221 trace widths, creepage on the 24V side, etc.).
   ════════════════════════════════════════════════════════════════════════ */

/* ---- Palette — "Midnight Fab": plum soldermask, ENIG gold, copper, silk ---- */
export const PCB = {
  bg: "#0d0c11",
  green: "#3ddc84", // status mint: powered / alive / DRC-pass ONLY
  greenDim: "#2aa866",
  purple: "#b98aff", // rarely used secondary
  soldermask: "#1f1430", // board surface (passive, midnight plum)
  soldermaskLit: "#2b1c42", // hover / energized board surface
  copper: "#b87333", // at-rest copper traces
  copperBright: "#e8a85c", // energized / current-carrying copper
  enig: "#d4af37", // pads, holes, test points, CTAs, Tier-2 skills
  enigBright: "#f0d488", // pad highlight
  silk: "#eae6da", // silkscreen ink (warm white)
  drill: "#0b0714", // drill / via interiors
  comm: "#5ec8e5", // I2C/SPI/UART buses, net highlight
  error: "#ff6b66", // DRC violation flash (sparingly)
} as const;

/* ---- Hero board-house string + status strip ---- */
export const FAB_STRING = "MML-PCB · REV_A · KICAD 10 NATIVE · 2-LAYER · FR-4 · ENIG";
export const STATUS_OK = "DRC: 0 · ERC: 0";
export const STATUS_SPECS = "KICAD 10 · 2-LAYER · 1.6mm FR-4 · ENIG · JLCPCB";
export const POWER_STATUS = "> board powered :: rails nominal :: DRC clean / ERC clean";
export const DESIGNATOR =
  "KICAD PCB DESIGN SPECIALIST · ESP32 BOARDS · JLCPCB PRODUCTION-READY";

/* ════════════════════════════════════════════════════════════════════════
   ABOUT — the person behind the service
   ════════════════════════════════════════════════════════════════════════ */
export const ABOUT_PARAGRAPHS: string[] = [
  "I'm the person who will actually design your board — not an agency front desk, not a rotating team. You talk to the designer, and the designer does the work.",
  "I specialize narrowly on purpose: KiCad, and boards built around modules like the ESP32-S3. Depth in one toolchain beats shallow coverage of five. It's why my hand-offs are native files you own outright, and why my design rules come from your fab's real capability sheet before I route a single trace.",
  "Every project ends the same way — a complete manufacturing package, documented like a datasheet and organized so the next engineer can pick it up cold. If the delivered work doesn't meet the scope we agreed, you get your money back.",
];

export const ABOUT_CREDENTIALS: { label: string; detail: string }[] = [
  { label: "KiCad 8–10, native", detail: "no Altium, no lossy conversions" },
  { label: "JLCPCB / PCBWay ready", detail: "rules set from the capability sheet" },
  { label: "Documented hand-offs", detail: "README, REV notes, Git history" },
  { label: "Money-back guarantee", detail: "written into every contract" },
];
export const KICAD_NATIVE =
  "native .kicad_pro / .kicad_sch / .kicad_pcb — KiCad 8–10, no Altium, no conversions";

/* ════════════════════════════════════════════════════════════════════════
   SERVICES — shaped around what KiCad clients actually post on Upwork:
   new boards, pre-fab reviews, and fixes to existing KiCad projects.
   ════════════════════════════════════════════════════════════════════════ */
export type Service = {
  id: string;
  title: string;
  desc: string;
  bullets: string[];
  turnaround: string;
};

export const SERVICES: Service[] = [
  {
    id: "SVC-01",
    title: "New board, idea to fab",
    desc: "From a concept, breadboard prototype, or draft schematic to a manufacturing-ready KiCad project.",
    bullets: [
      "Schematic capture + component selection from in-stock LCSC / Digi-Key parts",
      "Clean 2-layer & 4-layer layout — ESP32, sensors, USB-C, power",
      "Full JLCPCB / PCBWay package: Gerbers, drill, BOM with LCSC / Digi-Key part numbers, CPL, PDF schematic, 3D render",
    ],
    turnaround: "small boards in days, not weeks",
  },
  {
    id: "SVC-02",
    title: "Pre-fab design review",
    desc: "A second set of eyes on your board before you spend money at the fab.",
    bullets: [
      "DRC / ERC / DFM check against your fab's real capabilities",
      "Footprint & part sanity pass — stock, lifecycle, polarity, pin-1, keep-outs",
      "Written findings report with prioritized, concrete fixes",
    ],
    turnaround: "most reviews back in 24–48h",
  },
  {
    id: "SVC-03",
    title: "Fix, revise & finish",
    desc: "Work inside your existing KiCad project without breaking what already works.",
    bullets: [
      "Schematic edits, re-routes, and Rev-B board revisions",
      "Power & thermal fixes — pours, thermal vias, trace widths sized to current",
      "DXF / PDF / image redrawn from scratch as a clean native KiCad project",
    ],
    turnaround: "scoped and quoted up front",
  },
];

/* client-comfort points lifted straight from what job posts ask for */
export const TRUST: string[] = [
  "Money-back guarantee in every signed contract",
  "KiCad 8–10 native — no Altium, no conversions",
  "You own every file",
  "NDA-friendly",
  "Weekly written updates",
  "DRC/ERC-clean proof with every delivery",
];

/* ════════════════════════════════════════════════════════════════════════
   THE DELIVERABLE — manufacturing package (the real product)
   ════════════════════════════════════════════════════════════════════════ */
export type TreeNode = {
  name: string;
  note?: string; // "what the fab does with this / what it proves"
  children?: TreeNode[];
};

export const PACKAGE_TREE: TreeNode = {
  name: "MML-0X-board/",
  children: [
    { name: "source/", note: "Editable KiCad project — .kicad_pro / .kicad_sch / .kicad_pcb. The client owns the design, not just the artwork." },
    {
      name: "production/",
      note: "Everything the fab actually consumes. Zip this folder, upload, done.",
      children: [
        { name: "gerbers/", note: "RS-274X copper, soldermask, silkscreen & edge-cuts — one file per layer. This is what becomes the physical board." },
        { name: "drill/", note: "Excellon NPTH + PTH files — every hole position and size for the CNC drill." },
        { name: "BOM.csv", note: "Every line item with a real manufacturer part number (LCSC / Digi-Key) so assembly can actually source it." },
        { name: "CPL.csv", note: "Centroid / pick-and-place file — X/Y/rotation per part for the assembly robot." },
        { name: "schematic.pdf", note: "Human-readable schematic so a reviewer can sanity-check the circuit without opening KiCad." },
      ],
    },
    { name: "docs/", note: "3D render, layout + schematic screenshots, ERC/DRC-clean proof, JLCPCB upload preview, and bring-up photos." },
    { name: "README.md", note: "States the design intent — what the board does, the constraints it was built under, and how to regenerate every output. The first file your next engineer reads." },
    { name: "REV_A_notes.md", note: "Honest list of what I would change in Rev B — so the next spin starts with a plan, not a guess." },
    { name: "CHANGES.md", note: "Revision log across board spins." },
  ],
};

export type Badge = { label: string; note: string };
export const CLEAN_BADGES: Badge[] = [
  { label: "GERBERS", note: "RS-274X, all layers" },
  { label: "DRILL", note: "Excellon NPTH + PTH" },
  { label: "BOM w/ MPN", note: "Sourceable line items" },
  { label: "CPL", note: "Centroid for assembly" },
  { label: "DRC ✓", note: "0 design-rule errors" },
  { label: "ERC ✓", note: "0 electrical-rule errors" },
  { label: "3D RENDER", note: "Mechanical fit verified" },
];

/* ════════════════════════════════════════════════════════════════════════
   THE THREE PORTFOLIO BOARDS
   ════════════════════════════════════════════════════════════════════════ */
export type BoardComponent = { refdes: string; part: string; role: string };

export type Board = {
  id: string; // silkscreen designator e.g. MML-01
  name: string;
  tagline: string;
  problem: string;
  mainSkill: string;
  proves: string;
  firmware: string;
  accent: string;
  specs: { layers: string; mcu: string; power: string; extra: string };
  components: BoardComponent[];
  mfgPack: string[];
  /** bring-up UART log printed when the card is expanded */
  bringup: string[];
};

export const BOARDS: Board[] = [
  {
    id: "MML-01",
    name: "Prototype-to-PCB Sensor Node",
    tagline: "Breadboard mess in, manufacturable board out.",
    problem: "Turn my prototype into a manufacturable board.",
    mainSkill: "Schematic capture + clean 2-layer layout",
    proves:
      "Datasheet-to-schematic capture, shared I2C/SPI buses, a protected analog input, and a tidy 2-layer pour that DRCs clean.",
    firmware: "ESPHome",
    accent: "#f0d488", // ENIG gold — the foundation board
    specs: {
      layers: "2-layer · signal + ground pour",
      mcu: "ESP32-S3-WROOM-1",
      power: "USB-C 5V + LiPo · AP2112K-3.3 rail",
      extra: "One shared I2C pull-up pair · one protected ADC input",
    },
    components: [
      { refdes: "U1", part: "ESP32-S3-WROOM-1", role: "Wi-Fi/BLE MCU module — keep-out under antenna" },
      { refdes: "U2", part: "AP2112K-3.3", role: "3.3V LDO — chosen over AMS1117 (low dropout/Iq)" },
      { refdes: "U3", part: "USBLC6-2SC6", role: "USB-C data-line ESD protection" },
      { refdes: "U4", part: "MCP73831", role: "Single-cell LiPo charger (JST-PH input)" },
      { refdes: "U5", part: "BME280", role: "Temp/humidity/pressure on shared I2C bus" },
      { refdes: "R1,R2", part: "5.1k 0402", role: "USB-C CC1/CC2 pull-downs (sink advertise)" },
    ],
    mfgPack: [
      "Gerbers + drill (NPTH/PTH)",
      "BOM.csv (LCSC/Digi-Key MPNs) + CPL.csv",
      "ERC-clean + DRC-clean screenshots",
      "3D render + JLCPCB upload preview",
      "Bring-up photos + REV_A_notes.md",
    ],
    bringup: [
      "$ esphome run sensor-node.yaml",
      "[boot] ESP32-S3 @ 240MHz  flash 8MB",
      "[i2c] scan bus0 ... 0x76 BME280 OK",
      "[adc] ch3 protected input ... 1.642 V",
      "[wifi] associated  rssi -41 dBm",
      ">> BOARD ALIVE",
    ],
  },
  {
    id: "MML-02",
    name: "WLED High-Current Matrix Driver",
    tagline: "Real amps, real copper, clean 5V data.",
    problem: "ESP32 board that handles real current and LEDs.",
    mainSkill: "High-current layout · copper pours · trace-width math · level shifting",
    proves:
      "Power-path trace-width sizing, wide copper pours, bulk decoupling, and a proper 3.3V→5V data level shift for WS2812B.",
    firmware: "WLED",
    accent: "#e8a85c", // bright copper — the high-current board
    specs: {
      layers: "2-layer · wide power pours + ground",
      mcu: "ESP32-S3-WROOM-1",
      power: "Dedicated 5V high-current input · fuse/polyfuse protected",
      extra: "Onboard WS2812B 8×8 matrix · level-shifted data",
    },
    components: [
      { refdes: "U1", part: "ESP32-S3-WROOM-1", role: "Wi-Fi MCU running the LED engine" },
      { refdes: "U2", part: "74AHCT125", role: "3.3V→5V level shifter on the LED data line" },
      { refdes: "J1", part: "XT30 / screw / barrel", role: "Dedicated high-current 5V input" },
      { refdes: "D1", part: "SMBJ5.0A TVS", role: "Input transient / reverse-polarity protection" },
      { refdes: "C1", part: "Bulk electrolytic", role: "Inrush/ripple reservoir at the input" },
      { refdes: "R1", part: "330R series", role: "Series data resistor — tames ringing/EMI" },
    ],
    mfgPack: [
      "Gerbers + drill (widened power-trace notes)",
      "BOM.csv (MPNs) + CPL.csv centroid",
      "ERC-clean + DRC-clean screenshots",
      "3D render + JLCPCB upload preview",
      "Bring-up photos + REV_A_notes.md",
    ],
    bringup: [
      "$ esptool write_flash WLED.bin",
      "[boot] ESP32-S3  WLED 0.14",
      "[pwr] 5V rail 5.02 V  @ 3.6 A peak",
      "[lvl] 74AHCT125 data 3v3->5v OK",
      "[led] WS2812B 64 px  refresh 60 Hz",
      ">> BOARD ALIVE",
    ],
  },
  {
    id: "MML-03",
    name: "24V Industrial-Style I/O Controller",
    tagline: "Interfaces 12/24V field equipment behind a real isolation gap.",
    problem: "ESP32 board that interfaces 12/24V equipment safely.",
    mainSkill: "Input protection · buck converter · opto-isolation · mixed-signal",
    proves:
      "24V→5V buck with a tight switching loop, reverse-polarity + TVS front-end, and opto-isolated outputs with a real isolation gap / star ground.",
    firmware: "Tasmota / MQTT",
    accent: "#5ec8e5", // comm cyan — the isolated I/O board
    specs: {
      layers: "2-layer · star ground + isolation gap",
      mcu: "ESP32-S3-WROOM-1",
      power: "24V screw input → buck 5V → AP2112K 3.3V",
      extra: "PC817 opto-isolated outputs · optional RS-485",
    },
    components: [
      { refdes: "U1", part: "ESP32-S3-WROOM-1", role: "MQTT / industrial control MCU" },
      { refdes: "U2", part: "24V→5V buck", role: "Step-down with tight switching-node loop" },
      { refdes: "U3", part: "AP2112K-3.3", role: "5V→3.3V LDO for the logic rail" },
      { refdes: "U4", part: "PC817", role: "Opto-isolated digital outputs (across gap)" },
      { refdes: "D1", part: "TVS + Schottky", role: "Surge clamp + reverse-polarity protection" },
      { refdes: "J1", part: "24V screw terminal", role: "Field 12/24V input wiring" },
    ],
    mfgPack: [
      "Gerbers + drill (isolation-gap callouts)",
      "BOM.csv (MPNs) + CPL.csv centroid",
      "ERC-clean + DRC-clean screenshots",
      "3D render + JLCPCB upload preview",
      "Bring-up photos + REV_A_notes.md (scope note: not safety-certified)",
    ],
    bringup: [
      "$ tasmota --mqtt broker.local",
      "[boot] ESP32-S3  Tasmota 13",
      "[pwr] 24.1V in -> buck 5.00V -> 3.30V",
      "[iso] PC817 out1..out4  field side OK",
      "[mqtt] connected  topic mml/io/#",
      ">> BOARD ALIVE",
    ],
  },
];

/* ════════════════════════════════════════════════════════════════════════
   SKILLS — grouped the way a client thinks about a project:
   design the circuit → lay out the board → hand off to the fab.
   ════════════════════════════════════════════════════════════════════════ */
export type SkillGroup = {
  title: string;
  tagline: string;
  skills: { name: string; detail?: string }[];
};

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Schematic & circuit design",
    tagline: "from datasheet to a clean, readable schematic",
    skills: [
      { name: "Schematic capture", detail: "KiCad 8–10" },
      { name: "Datasheet → schematic translation" },
      { name: "Component selection", detail: "LCSC · Digi-Key · Mouser" },
      { name: "ESP32-WROOM module integration", detail: "antenna keep-out" },
      { name: "USB-C done right", detail: "5.1k CC pull-downs + USBLC6 ESD" },
      { name: "LDO & regulator selection", detail: "AP2112K-3.3, not AMS1117" },
      { name: "MOSFET / optocoupler driver stages" },
      { name: "Input protection", detail: "polyfuse · TVS · reverse-polarity" },
      { name: "Power budgeting per rail" },
    ],
  },
  {
    title: "PCB layout",
    tagline: "boards that route clean and run cool",
    skills: [
      { name: "2-layer & 4-layer layout", detail: "FR-4 · 1.6mm" },
      { name: "Ground planes & return paths" },
      { name: "Decoupling placement", detail: "tight to every VDD pin" },
      { name: "I2C / SPI / UART bus routing" },
      { name: "Level shifting 3.3↔5V", detail: "74AHCT125" },
      { name: "Buck converter layout", detail: "tight switching loop" },
      { name: "Trace widths sized to current", detail: "IPC-2221" },
      { name: "DFM to fab rules", detail: "6/6 mil JLCPCB" },
      { name: "Footprints & library management" },
      { name: "Test points, mounting holes & enclosure fit" },
      { name: "3D mechanical fit checks" },
    ],
  },
  {
    title: "Manufacturing hand-off",
    tagline: "the package your fab accepts first try",
    skills: [
      { name: "Gerber generation", detail: "RS-274X" },
      { name: "Drill files", detail: "Excellon NPTH + PTH" },
      { name: "BOM with real part numbers", detail: "LCSC / Digi-Key" },
      { name: "Pick-and-place / CPL files" },
      { name: "DRC + ERC clean, with proof" },
      { name: "JLCPCB workflow end-to-end", detail: "upload → assembly review" },
      { name: "Clear silkscreen & assembly markings" },
      { name: "Datasheet-grade documentation", detail: "README · REV notes · CHANGES" },
      { name: "Git-versioned, organized hand-off" },
    ],
  },
];

/* ════════════════════════════════════════════════════════════════════════
   THE STANDARD — premium differentiators (experience, docs, accountability)
   ════════════════════════════════════════════════════════════════════════ */
export type Pillar = { num: string; title: string; body: string };

export const STANDARD_PILLARS: Pillar[] = [
  {
    num: "01",
    title: "Built for production, not the bench drawer",
    body: "Every layout is routed against the fab's real capability sheet, checked in the 3D viewer for mechanical fit, and shipped DRC- and ERC-clean with the proof included. The goal is a board that works the first time — not one that merely passes.",
  },
  {
    num: "02",
    title: "Documentation that reads like a datasheet",
    body: "Annotated schematics, a README that states the design intent, REV notes that say what changes next, and a CHANGES log for every spin. Your next engineer picks the project up cold.",
  },
  {
    num: "03",
    title: "Organized to the file",
    body: "The same predictable project structure every time — /source, /production, /docs — versioned in Git. You will never hunt for a file or wonder which Gerber is current.",
  },
  {
    num: "04",
    title: "Accountability, in writing",
    body: "A fixed quote before work starts. Weekly written updates while it runs. And a money-back guarantee in every signed contract — if the delivered work doesn't meet the agreed scope, you get your money back.",
  },
];

export const STANDARD_STATS: { value: string; label: string }[] = [
  { value: "0", label: "DRC + ERC errors shipped" },
  { value: "10", label: "KiCad — native, versions 8–10" },
  { value: "24h", label: "fixed-quote turnaround" },
  { value: "100%", label: "money-back guarantee" },
];

/* ════════════════════════════════════════════════════════════════════════
   CONTACT — premium engagement flow
   ════════════════════════════════════════════════════════════════════════ */
export const CONTACT_STEPS: Pillar[] = [
  {
    num: "01",
    title: "Send the brief",
    body: "What the board does, your target fab, and any files you already have — a paragraph is enough to start.",
  },
  {
    num: "02",
    title: "Fixed quote in 24h",
    body: "Scope, price, and timeline in writing. NDA signed first if your project needs one.",
  },
  {
    num: "03",
    title: "Contract, then work",
    body: "A signed contract with the money-back guarantee written in: if delivery misses the agreed scope, you get a refund. Then the board gets built.",
  },
];
