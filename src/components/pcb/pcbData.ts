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
export const FAB_STRING = "REV_A · KICAD 10 NATIVE · 2 & 4-LAYER · FR-4 · ENIG";
export const STATUS_OK = "DRC: 0 · ERC: 0";
export const STATUS_SPECS = "KICAD 10 · 2 & 4-LAYER · FR-4 · JLCPCB · 2 BOARDS ORDERED";
export const POWER_STATUS = "> board powered :: rails nominal :: DRC clean / ERC clean";
export const DESIGNATOR =
  "KICAD PCB DESIGN SPECIALIST · ESP32 BOARDS · JLCPCB PRODUCTION-READY";
/* the hero proof chip — the one claim that has hardware behind it */
export const HERO_PROOF =
  "2 boards designed, ordered and fabricated · PCB 1 built and brought up";

/* ---- Contact — one address, one mailto, declared once ------------------
   The body is a brief template: inbound mail otherwise arrives as "I need
   a PCB" with none of the four facts a quote actually needs. A prefilled
   mailto costs the sender nothing and needs no third-party form endpoint. */
export const CONTACT_EMAIL = "muffinbytelabs@gmail.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "PCB project"
)}&body=${encodeURIComponent(
  [
    "What the board does:",
    "",
    "Target fab and quantity:",
    "",
    "Files you already have (KiCad, PDF, DXF, image):",
    "",
    "Deadline:",
    "",
  ].join("\n")
)}`;

/* The three things a client wants to know before they write the first
   message. Stated at the top rather than buried in a contract page. */
export const HERO_TERMS: { label: string; note: string }[] = [
  { label: "Fixed quote in 24h", note: "scope, price and timeline in writing" },
  { label: "Money-back guarantee", note: "in every signed contract" },
  { label: "You own every file", note: "native KiCad, no conversions" },
];

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
  { label: "4-layer, built and brought up", detail: "PCB 1 measured against every acceptance step" },
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
  /** one link to public evidence of this exact kind of work, where it exists */
  sample?: { label: string; href: string; external?: boolean };
};

/* Ordered the way the work actually arrives: a review is the cheapest way
   to try me, so it leads. Each service points at a piece of public evidence
   — the same honesty bar as everything else on the site. */
export const SERVICES: Service[] = [
  {
    id: "SVC-01",
    title: "Pre-fab design review",
    desc: "A second set of eyes on your board before you spend money at the fab. A review is a document — and you can read the ones my own board went through before you pay for one.",
    bullets: [
      "DRC / ERC / DFM check against your fab's real capability sheet",
      "Footprint & part sanity pass — stock, lifecycle, polarity, pin-1, keep-outs",
      "Written findings ranked by severity, with a concrete recommendation on each",
    ],
    turnaround: "most reviews back in 24–48h",
    sample: {
      label: "Read a real review",
      href: "https://github.com/MuffinByteLabs/esp32s3-plant-monitor/blob/main/docs/reviews/Design_Review_RevA_2026-07-20.md",
      external: true,
    },
  },
  {
    id: "SVC-02",
    title: "Conversion to native KiCad",
    desc: "A design that exists as a PDF, DXF, image or another tool's project, redrawn as a clean KiCad project you own outright.",
    bullets: [
      "Redrawn sheet by sheet with checked symbols and footprints — not auto-traced",
      "ERC-clean, with a parity pass against the original before hand-off",
      "Delivered as the full package: native files, PDF schematic, project-local libraries",
    ],
    turnaround: "quoted per sheet count",
  },
  {
    id: "SVC-03",
    title: "Debug & bring-up help",
    desc: "The board is back from the fab and won't enumerate, keeps resetting, or runs hot. Worked from your files, photos and guided bench measurements.",
    bullets: [
      "A staged bring-up plan — unpowered checks, current-limited first power, rails, buses, firmware",
      "USB enumeration, brownout and reset-loop diagnosis against the schematic",
      "Written findings with the fix — and the Rev-B change if the copper is at fault",
    ],
    turnaround: "first read of your files within a day",
    sample: {
      label: "How I approach it",
      href: "/blog/usb-c-wont-enumerate",
    },
  },
  {
    id: "SVC-04",
    title: "New board, idea to fab",
    desc: "From a concept, breadboard prototype, or draft schematic to a manufacturing-ready KiCad project.",
    bullets: [
      "Schematic capture + component selection from in-stock LCSC / Digi-Key parts",
      "Clean 2-layer & 4-layer layout — ESP32, sensors, USB-C, power",
      "Full JLCPCB / PCBWay package: Gerbers, drill, BOM with LCSC / Digi-Key part numbers, CPL, PDF schematic, 3D render",
    ],
    turnaround: "small boards in days, not weeks",
    sample: {
      label: "A finished one, published in full",
      href: "https://github.com/MuffinByteLabs/esp32s3-plant-monitor",
      external: true,
    },
  },
  {
    id: "SVC-05",
    title: "Fix, revise & finish",
    desc: "Work inside your existing KiCad project without breaking what already works.",
    bullets: [
      "Schematic edits, re-routes, and Rev-B board revisions",
      "Power & thermal fixes — pours, thermal vias, trace widths sized to current",
      "Half-finished projects taken through to a complete manufacturing package",
    ],
    turnaround: "scoped and quoted up front",
    sample: {
      label: "What my Rev-B notes look like",
      href: "https://github.com/MuffinByteLabs/esp32s3-plant-monitor/blob/main/docs/RevB_Upgrade_Plan.md",
      external: true,
    },
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
  name: "PCB-0X-board/",
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
        { name: "paste.gbr + stencil-notes.md", note: "The paste layer and the stencil order — thickness and aperture design reviewed against the fine-pitch and exposed-pad datasheets before the stencil is cut. A stencil is only as good as the apertures behind it." },
      ],
    },
    { name: "docs/", note: "3D render, layout + schematic screenshots, ERC/DRC-clean proof, fab upload preview, and bring-up photos." },
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
   THE PUBLIC REPOSITORY — PCB 1, open sourced.

   The strongest single piece of evidence on the site: not a render, not a
   claim, but the actual KiCad project and the frozen package that was
   uploaded to the fab, with the written design document and the review
   records that produced it. Anyone can read the whole thing, including the
   mistakes that were caught before boards were built.
   ════════════════════════════════════════════════════════════════════════ */
export const REPO = {
  url: "https://github.com/MuffinByteLabs/esp32s3-plant-monitor",
  owner: "MuffinByteLabs",
  name: "esp32s3-plant-monitor",
  board: "PCB 1",
  licence: "CERN-OHL-P v2",
  /* the one-line pitch, used in more than one place */
  blurb:
    "The complete KiCad project for PCB 1 — schematic, layout, the exact package that was uploaded to JLCPCB, and every document that produced it.",
} as const;

export type RepoDir = { path: string; name: string; note: string };

export const REPO_TREE: RepoDir[] = [
  {
    path: "hardware",
    name: "hardware/",
    note: "The KiCad 10 project itself — hierarchical schematic, 4-layer board, and the footprint and symbol libraries it depends on. Open it and edit it; nothing is locked.",
  },
  {
    path: "fabrication",
    name: "fabrication/",
    note: "The frozen manufacturing package, exactly as uploaded: Gerbers, drill, BOM and CPL for the revision that was ordered. Not regenerated for the repo — archived at order time.",
  },
  {
    path: "docs",
    name: "docs/",
    note: "The written design document, the bring-up guide, engineering notes and layout rules. Every part on the board has a paragraph saying why it is there.",
  },
  {
    path: "references",
    name: "references/",
    note: "Every datasheet and reference design the choices were made from, so a reviewer can check the arithmetic without going hunting.",
  },
  {
    path: "firmware",
    name: "firmware/",
    note: "Not written yet — a README stating the duties the hardware hands to the firmware: no Wi-Fi transmit below 3.5 V, deep sleep at 3.0 V, and the soil-probe timing. The layout was done knowing them.",
  },
];

/* ── read it in the browser ────────────────────────────────────────────
   The six documents a client can read in ten seconds with no KiCad
   install. "Go and look" is work, and a visitor deciding whether this is
   a portfolio of renders will not do work — so each one is a deep link,
   not a folder to hunt through. Paths verified against the repo at the
   commit these notes were written. */
export const REPO_READS: { label: string; note: string; path: string }[] = [
  {
    label: "Pre-fab design review",
    note: "findings ranked by severity, and what was done about each",
    path: "blob/main/docs/reviews/Design_Review_RevA_2026-07-20.md",
  },
  {
    label: "Independent second pass",
    note: "a separate review over the same board, before it was ordered",
    path: "blob/main/docs/reviews/Design_Review_RevA_2026-07-22_Netlist_Reextraction.md",
  },
  {
    label: "Schematic — 8 sheets (PDF)",
    note: "the full hierarchical schematic, readable without opening KiCad",
    path: "blob/main/docs/ESP32S3_PlantMonitor_RevA_Schematic.pdf",
  },
  {
    label: "The design document",
    note: "every part on the board has a paragraph saying why it is there",
    path: "blob/main/docs/ESP32S3_Plant_Monitor_Final_Design_Document.md",
  },
  {
    label: "Fab layer plots (PDF)",
    note: "copper, mask and silk, plotted the way the fab sees them",
    path: "blob/main/docs/ESP32S3_PlantMonitor_RevA_FabLayers.pdf",
  },
  {
    label: "Order notes",
    note: "the JLCPCB order as decided — settings, remarks, pre-upload checks",
    path: "blob/main/fabrication/revA/ORDER_NOTES.md",
  },
];

/** What a visitor will actually find if they go and look. */
export const REPO_HIGHLIGHTS: { label: string; note: string }[] = [
  { label: "Five review records", note: "pre-fab, placement, finishing and final layout — findings, severities, fixes" },
  { label: "A footprint check record", note: "every footprint verified against its land pattern before ordering" },
  { label: "The pre-order gate list", note: "DRC / ERC clean, schematic parity, polarity checked against a pin-1 table" },
  { label: "A bring-up guide", note: "staged, with the number each step has to hit" },
  { label: "Rev B notes", note: "an honest list of what I would change next" },
];

/* ════════════════════════════════════════════════════════════════════════
   THE PORTFOLIO BOARDS

   Deliberately thin. A client scrolling a portfolio wants to know what the
   board is, whether it actually exists, and to see it — not to read a
   design review. The engineering detail lives in the repo and in Field
   Notes, where someone who wants it can go looking.

   ── UPDATE POINT ──────────────────────────────────────────────────────
   `status.kind` is the one field that must never run ahead of reality:
   "built" only once bring-up has actually passed.
   ══════════════════════════════════════════════════════════════════════ */

export type BoardStatus = {
  kind: "built" | "fab";
  label: string;
};

export type Board = {
  id: string; // silkscreen designator
  name: string;
  /** one sentence: what it is and who it is for */
  summary: string;
  accent: string;
  status: BoardStatus;
  /** the short spec line under the title */
  specs: string[];
  /** rotatable model exported from KiCad, if one exists yet */
  model?: string;
  /** public repository, where the whole project can be read */
  repo?: { url: string; owner: string; name: string };
  /** board imagery — captioned, and honest about what each one is.
      width/height are the file's real pixel dimensions: a guessed aspect
      ratio reserves the wrong height and the page shifts when the lazy
      image decodes mid-scroll. */
  images?: { src: string; alt: string; tag: string; caption: string; width: number; height: number }[];
};

export const BOARDS: Board[] = [
  {
    id: "PCB 1",
    name: "ESP32-S3 Wi-Fi Plant Monitor",
    summary:
      "A battery-powered Wi-Fi sensor node: temperature, humidity, pressure, light and soil moisture, on four layers with a proper ground plane pair.",
    accent: "#8a5a12",
    status: { kind: "built", label: "Built · bring-up passed" },
    specs: ["62.5 × 44.5 mm", "4-layer", "ESP32-S3", "USB-C + LiPo"],
    model: "/boards/mml01.glb",
    /* one URL, declared once in REPO above — a second literal here is a
       second thing to forget to update */
    repo: { url: REPO.url, owner: REPO.owner, name: REPO.name },
    images: [
      {
        src: "/boards/mml01-3d-top.webp",
        tag: "Populated",
        alt: "KiCad 3D view of PCB 1 fully populated, seen from above: the ESP32-S3 module with its antenna overhanging the top edge, USB-C on the left edge, BOOT and RESET buttons, BME280 and VEML7700 sensors on the right, and battery and soil connectors along the bottom",
        caption: "Every part placed and checked for fit before a single board was ordered.",
        width: 1400,
        height: 951,
      },
      {
        src: "/boards/mml01-3d-iso.webp",
        tag: "Bare board",
        alt: "Angled KiCad 3D view of the bare PCB 1 board showing the routed copper, the module's exposed ground pad with its stitching vias, twelve gold test points and four M3 mounting holes",
        caption: "The same board stripped back to bare copper, test points and mounting holes.",
        width: 1400,
        height: 1064,
      },
      {
        src: "/boards/mml01-3d-bottom.webp",
        tag: "Bottom",
        alt: "KiCad 3D view of the PCB 1 bottom side: light routing over the plane pair, the through-hole UART recovery pads, and a silkscreen ID block reading ESP32-S3 Plant Monitor, Rev A 2026-08, MuffinByteLabs.com, designed by Ray Malik",
        caption: "The back side, with the ID block every board ships with — name, revision, date, and who to ask.",
        width: 1544,
        height: 1152,
      },
    ],
  },

  {
    id: "PCB 2",
    name: "Protected Field I/O Controller",
    summary:
      "A Wi-Fi board that safely reads 24 V equipment signals and switches real equipment — opto-isolated inputs, relay and MOSFET outputs, behind a proper isolation barrier.",
    accent: "#3d6b8a",
    status: { kind: "fab", label: "Ordered · in fabrication" },
    specs: ["110 × 76 mm", "2-layer", "ESP32-S3", "9–36 VDC / 24 VAC"],
  },
];

/* ════════════════════════════════════════════════════════════════════════
   CAPABILITY — what I can design, grouped the way a board gets built:
   the circuit, the power, the field interface, the layout, the hand-off.

   This is the one section on the page that argues, and it stays GENERAL on
   purpose. A client is hiring a practice, not one board. Where a line
   carries a number, that number is a rule held to on every board — not a
   figure lifted off a single project.

   ── UPDATE POINT ──────────────────────────────────────────────────────
   The honesty bar is unchanged: if a line cannot be pointed at in the
   public repo, a design review, or a Field Note, it does not go in here.
   ══════════════════════════════════════════════════════════════════════ */

export type Skill = {
  name: string;
  /** the qualifier that makes the claim checkable — kept short */
  detail?: string;
};

export type SkillGroup = {
  /** silkscreen-style designator for the eyebrow */
  id: string;
  title: string;
  /** one line, lower case, no full stop: what this group is for */
  tagline: string;
  /** the argument — one sentence, general, never naming a board */
  note: string;
  skills: Skill[];
};

export const CAPABILITY_INTRO =
  "Anyone can route a board that looks finished. Below is what sits underneath one — the circuit blocks I design, the layout rules I hold to, and the manufacturing decisions taken long before a file leaves.";

/* NOTE: the `skills` arrays below are no longer rendered. Aug 2026, Ray: keep
   Capability but cut it back to "just the main stuff" — the section is now the
   five titles and the one-line argument each. The detail is kept here rather
   than deleted, the same way the other retired sections are, so bringing a
   group back is a render change and not a rewrite. CAPABILITY_LIMITS and
   CAPABILITY_LIMITS_LEAD came back into service Aug 2026: they render in the
   "What I turn down" card on /services. */
export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "CAP-01",
    title: "Schematic & circuit design",
    tagline: "datasheet in, a schematic another engineer can read",
    note: "A schematic is a document before it is a netlist. If a reviewer cannot follow the circuit without opening the board file, it is not finished.",
    skills: [
      { name: "Schematic capture", detail: "KiCad 8–10, hierarchical sheets, native files" },
      { name: "Datasheet to schematic", detail: "reference design first, justified wherever it changes" },
      { name: "Component selection", detail: "LCSC · Digi-Key · Mouser, stock and lifecycle checked" },
      { name: "Wi-Fi / BLE module integration", detail: "strapping pins, boot mode, a flashing path you can reach" },
      { name: "USB-C device ports", detail: "5.1 kΩ CC pull-downs on both pins, native USB, no bridge chip" },
      { name: "Port ESD protection", detail: "TVS array in copper order — connector before silicon" },
      { name: "I²C, SPI and UART buses", detail: "one pull-up pair per I²C bus, sized against the capacitance on it" },
      { name: "ADC front ends", detail: "range measured on the bench first — an unnecessary divider only adds error" },
      { name: "Level shifting 3.3 → 5 V", detail: "74AHCT125 class — TTL inputs take 3.3 V, outputs swing to 5 V" },
      { name: "Sensor sub-circuits", detail: "addresses, references and enable lines resolved on paper" },
      { name: "Power budgeting per rail", detail: "worst simultaneous draw and a sleep figure, both written down" },
    ],
  },

  {
    id: "CAP-02",
    title: "Power & protection",
    tagline: "rails that hold up, inputs that survive the field",
    note: "Every rail gets a written worst case before a part is chosen, and every input is designed on the assumption that the supply will one day arrive backwards.",
    skills: [
      { name: "LDO selection on dropout", detail: "AP2112K class on a battery rail, not an AMS1117" },
      { name: "Step-down converters to 60 V class", detail: "populated per the datasheet design example, not improvised" },
      { name: "Wide-input front ends", detail: "9–36 VDC or 24 VAC on one terminal, polarity-agnostic" },
      { name: "Bridge rectifier + TVS staging", detail: "43 V standoff against a 24 VAC transformer’s 40 V unloaded peak, so it never clamps in service" },
      { name: "Polyfuse sizing, derated", detail: "hold current at enclosure temperature, not at 25 °C" },
      { name: "Reverse-polarity protection", detail: "P-MOSFET or bridge, chosen to suit the input" },
      { name: "Single-cell LiPo charging", detail: "MCP73831 class, charge rate set deliberately" },
      { name: "Automatic source hand-over", detail: "ideal-diode P-MOSFET pair, gate sized to swap inside the bulk hold-up — 50–100 ms, not a second" },
      { name: "UVLO by EN divider", detail: "referenced to the input, never to the converter's own output" },
      { name: "Bulk capacitance for RF bursts", detail: "a transmit peak comes out of the capacitor, not out of the regulator’s loop" },
      { name: "Dissipation and thermal margin", detail: "worst-case watts against the package, in writing" },
      { name: "Deep-sleep budgets", detail: "the dominant consumer named, not assumed" },
    ],
  },

  {
    id: "CAP-03",
    title: "Field interface & isolation",
    tagline: "reading and switching real equipment without letting it back in",
    note: "The optocouplers and the relay contacts break the path between your equipment and this board. The copper around them is a separate return — drawn as a distance, defended on every layer, bonded at one deliberate point. Naming which of the two is doing the work is the job.",
    skills: [
      { name: "Opto-isolated digital inputs", detail: "PC817 class, on a shared field common" },
      { name: "Series resistance split across parts", detail: "spreads dissipation, doubles the voltage rating" },
      { name: "AC-capable inputs", detail: "anti-parallel diode per LED — reverse protection and half-wave" },
      { name: "Zero-crossing hold", detail: "RC checked against the mains half-period and the receiver’s Vᴵʟ, not assumed" },
      { name: "Relay drive stages", detail: "NPN with a base pull-down — off through boot and reset" },
      { name: "Coil and contact protection", detail: "flyback for the coil, snubber or MOV for the contacts" },
      { name: "Low-side MOSFET outputs", detail: "gate resistor, gate pull-down, flyback to the load rail" },
      { name: "Field and logic returns kept apart", detail: "separate pours, a moat clear on every layer, bonded at one star point" },
      { name: "Creepage and clearance", detail: "drawn as a distance, then verified layer by layer" },
      { name: "Field wiring terminals", detail: "pitch and rating matched to the conductor going into them" },
      { name: "Honest contact ratings", detail: "rated for what the board’s copper and clearances allow, not for what the relay can prints" },
    ],
  },

  {
    id: "CAP-04",
    title: "PCB layout",
    tagline: "2-layer and 4-layer boards that route clean and run cool",
    note: "On four layers the return current has a path directly under the trace that carried it. On two, the pour has to be kept whole enough to give it one. Either way the board is quiet by construction, not by luck.",
    skills: [
      { name: "2-layer and 4-layer stackups", detail: "FR-4, planned against the fab's published stackup" },
      { name: "Signal / GND / GND / signal", detail: "no signals on either inner plane, ever" },
      { name: "Unbroken pours and return paths", detail: "no slot under a fast trace, no return sent the long way" },
      { name: "Decoupling placement", detail: "on four layers, every ground via 1–1.5 mm from the pin it serves" },
      { name: "USB 2.0 differential pairs", detail: "≈90 Ω coupled geometry, length-matched, zero vias" },
      {
        name: "Impedance control, honestly scoped",
        detail:
          "coupled geometry to the fab's stackup calculator for a USB 2.0 pair; multi-gigabit, DDR and RF feedlines I refer out",
      },
      { name: "RF module integration", detail: "antenna off-edge, all-layer keep-out, stitching around never inside" },
      { name: "Switching-converter layout", detail: "hot loop tiny and on one layer, feedback tapped at the output cap" },
      { name: "Trace widths sized to current", detail: "IPC-2221, to a stated temperature rise" },
      { name: "Copper pours, thermal vias, reliefs", detail: "heat out of the part, pads a human can still solder" },
      { name: "Analog and digital separation", detail: "by placement — quiet parts off noisy return paths, not by cutting the pour" },
      { name: "Test points designed in", detail: "including a through-hole UART recovery trio" },
      { name: "Mechanical fit", detail: "holes, connector positions and part heights checked in 3D" },
      { name: "DRC to the fab's live capability sheet", detail: "their numbers in Board Setup, not KiCad's defaults" },
    ],
  },

  {
    id: "CAP-05",
    title: "Manufacture & bring-up",
    tagline: "everything between a finished layout and a working board",
    note: "A board is not finished when it routes. It is finished when someone who has never spoken to me can order it, build it, and prove it works.",
    skills: [
      { name: "Fab rules read before routing", detail: "trace, drill, annular ring, mask dam, silk height" },
      { name: "Footprints checked to the land pattern", detail: "third-party symbols are never trusted on sight" },
      { name: "Project-local libraries", detail: "the project opens on a machine that has never seen mine" },
      { name: "Silkscreen for a human with tweezers", detail: "pin 1, polarity and designators legible at ×10" },
      { name: "Panelisation and edge instructions", detail: "sent with the order — overhang, V-score, tooling stated" },
      { name: "Turnkey PCBA vs in-house build", detail: "quoted both ways; the crossover moves with quantity" },
      { name: "In-house assembly", detail: "stencil, paste, hot-plate reflow, hand-soldered through-hole" },
      { name: "Paste apertures reviewed", detail: "against the fine-pitch and exposed-pad drawings" },
      { name: "Tariff and DDP-aware ordering", detail: "no surprise brokerage invoice after the parcel lands" },
      { name: "Staged bring-up", detail: "unpowered checks, current-limited first power, rails, buses, firmware" },
      { name: "Acceptance criteria with numbers", detail: "each step has a figure to hit; it passes or it does not" },
      { name: "Documentation like a datasheet", detail: "design intent, REV notes, a change log per spin" },
    ],
  },
];

/* ── what I turn down ──────────────────────────────────────────────────
   A capability list with no edges is a sales page. This is the edge, and
   it earns its place for the same reason the numbers above do.
   ────────────────────────────────────────────────────────────────────── */
export const CAPABILITY_LIMITS_LEAD =
  "Knowing where the line sits is part of the service — if your board is on the far side of it, you will hear that in the quote rather than halfway through.";

export const CAPABILITY_LIMITS: string[] = [
  "Mains-voltage design",
  "Antenna design — pre-certified modules laid out to the vendor's rules instead",
  "Controlled impedance beyond a USB 2.0 pair",
  "BGA and HDI — blind and buried vias, via-in-pad",
  "Precision analog — low-noise instrumentation and sub-millivolt front ends",
  "Motor power stages",
  "Medical and avionics",
  "Firmware ownership — enough to bring a board up, not enough to ship your product",
];

/** what leaves my hands at the end of every job */
export const HANDOFF: { name: string; note: string }[] = [
  { name: "Gerbers", note: "RS-274X, one file per layer" },
  { name: "Drill files", note: "Excellon, plated and non-plated" },
  { name: "BOM", note: "real manufacturer part numbers, stock checked" },
  { name: "CPL / centroid", note: "X / Y / rotation per part" },
  { name: "Schematic PDF", note: "reviewable without opening KiCad" },
  { name: "Paste + stencil notes", note: "apertures checked against the datasheets" },
  { name: "DRC + ERC proof", note: "zero errors, screenshots included" },
  { name: "README + REV notes", note: "the design intent, and what changes next" },
  { name: "Native KiCad source", note: "you own the project, not just the artwork" },
];

export const HANDOFF_NOTE =
  "Quoted both ways, every time: turnkey assembly and bare-PCB-plus-stencil are different economics, and the crossover moves with quantity, part count and schedule. Running that comparison against your actual numbers is the part a fab's instant-quote page cannot do for you.";

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
  { value: "2", label: "boards designed, ordered & fabricated" },
  { value: "0", label: "DRC + ERC errors shipped" },
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
