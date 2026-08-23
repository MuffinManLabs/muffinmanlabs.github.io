import MemoryMapExplorer from "@/components/stm32f407_memory_map";

export const metadata = {
  title: "STM32F407 Memory Map Explorer | MuffinByteLabs",
  description:
    "An interactive explorer for the STM32F407VGT6 memory map — the full 4 GB Cortex-M4 address space as one expandable tree, with peripheral registers, clock-enable bits, and address, bit-band and baud-rate calculators.",
  alternates: { canonical: "/memory-map" },
};

/* What the tool actually does, listed so a visitor knows before they click. */
const FEATURES: { name: string; note: string }[] = [
  { name: "Address calculator", note: "paste any hex address, get region, bus, peripheral and register" },
  { name: "Bit-band calculators", note: "SRAM and peripheral aliases, both directions" },
  { name: "Baud-rate calculator", note: "USART BRR mantissa / fraction, with the error percentage" },
  { name: "Register views", note: "offsets and one-line meanings, per peripheral" },
  { name: "Clock paths", note: "HSI → PLL → SYSCLK → bus, and the RCC enable bit each block needs" },
  { name: "Search, bookmarks, minimap", note: "for finding your way back to the block you were on" },
];

export default function MemoryMapPage() {
  return (
    <section className="px-6 pt-28 pb-20 sm:pt-32">
      <div className="max-w-5xl mx-auto">
        {/* ── why this exists ──────────────────────────────────────────── */}
        <span className="eyebrow">Side project &middot; a tool, not a product</span>

        <h1
          className="display mt-3 text-[2.6rem] sm:text-[3.4rem]"
          style={{ color: "var(--text)" }}
        >
          STM32F407 Memory&nbsp;Map Explorer
        </h1>

        <div className="mt-6 max-w-[64ch] space-y-5">
          <p className="text-[16px] leading-8" style={{ color: "var(--text-2)" }}>
            This is a personal tool. I build my own firmware for the boards I
            design, and bare-metal STM32 work means living inside a reference
            manual where the memory map, the register tables and the clock-enable
            bits are hundreds of pages apart. So I built the version I wanted:
            the whole 4&nbsp;GB Cortex-M4 address space as one expandable tree,
            with the registers, the bus each peripheral sits on, and the
            calculators I kept re-doing on paper.
          </p>

          <p className="text-[15px] leading-7" style={{ color: "var(--text-3)" }}>
            It lives on this site because firmware-aware layout is a large part
            of what I actually sell. Knowing which pin can be an ADC input, which
            peripherals share a bus, and what the chip reads at boot is what
            decides where parts go on the board &mdash; and the difference
            between a schematic that routes cleanly and one that fights you.
          </p>
        </div>

        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 m-0 p-0 list-none max-w-4xl">
          {FEATURES.map((f) => (
            <li
              key={f.name}
              className="py-3"
              style={{ borderTop: "1px solid var(--border-soft)" }}
            >
              <span
                className="block text-[13.5px] font-medium leading-6"
                style={{ color: "var(--text)" }}
              >
                {f.name}
              </span>
              <span className="block text-[12.5px] leading-5" style={{ color: "var(--text-3)" }}>
                {f.note}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-7 text-[13px] leading-6 max-w-[70ch]" style={{ color: "var(--text-3)" }}>
          Targets the STM32F407VGT6 as fitted to the Discovery board; addresses
          and register offsets are taken from ST&rsquo;s RM0090 reference manual.
          Blocks tagged <span style={{ color: "#44cc66", fontWeight: 600 }}>DISC</span> are the
          ones actually wired on that board. The colour coding is functional
          &mdash; each bus family keeps its own hue &mdash; so it does not follow
          the rest of the site&rsquo;s palette, only its background.
        </p>

        {/* ── the tool ─────────────────────────────────────────────────── */}
        <div
          className="mt-10 sm:mt-12 overflow-hidden rounded-2xl"
          style={{
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
            height: "min(820px, max(560px, 76vh))",
          }}
        >
          <MemoryMapExplorer />
        </div>

        <p className="mt-4 text-[12.5px] leading-6" style={{ color: "var(--text-3)" }}>
          Best on a wide screen &mdash; it is a memory map, and memory maps are wide.
        </p>
      </div>
    </section>
  );
}
