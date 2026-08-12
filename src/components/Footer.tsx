const links = {
  work: [
    { href: "/#services", label: "Services" },
    { href: "/#boards", label: "Portfolio boards" },
    { href: "/#deliverable", label: "What you receive" },
    { href: "/#skills", label: "Skills" },
  ],
  more: [
    { href: "/blog", label: "Field notes" },
    { href: "/#about", label: "About" },
    { href: "/#standard", label: "The standard" },
    { href: "/memory-map", label: "STM32 memory map" },
  ],
};

export default function Footer() {
  return (
    <footer className="px-6 pb-12 font-mono">
      <div className="max-w-5xl mx-auto terminal-divider mb-10" />

      <div className="max-w-5xl mx-auto grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-10">
        <div className="md:col-span-2">
          <div className="text-sm tracking-wide mb-2" style={{ color: "#eae6da" }}>
            MuffinByteLabs
          </div>
          <p className="text-xs leading-6 text-[#d6d3cd]/55 max-w-xs">
            KiCad PCB design — new boards, pre-fab design reviews, and revisions, delivered as
            fab-ready packages.
          </p>
          <a
            href="mailto:muffinbytelabs@gmail.com?subject=PCB%20project%20brief"
            className="inline-block mt-4 text-xs tracking-wider transition-colors hover:text-[#f6e3a3]"
            style={{ color: "#f0d488" }}
          >
            muffinbytelabs@gmail.com
          </a>
        </div>

        <FooterCol title="Work" items={links.work} />
        <FooterCol title="More" items={links.more} />
      </div>

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t"
        style={{ borderColor: "rgba(234,230,218,0.08)" }}>
        <p className="text-xs text-[#eae6da]/50 tracking-wider">
          &copy; {new Date().getFullYear()} MuffinByteLabs
        </p>
        <p className="text-[11px] text-[#d4af37]/70 tracking-[0.2em]">
          DESIGNED FOR FAB · KICAD NATIVE · ENIG
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.25em] uppercase mb-3" style={{ color: "#d4af37" }}>
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-xs text-[#d6d3cd]/60 hover:text-[#f0d488] transition-colors duration-300"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
