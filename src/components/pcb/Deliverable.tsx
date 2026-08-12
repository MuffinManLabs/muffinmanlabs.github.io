"use client";

import { useEffect, useRef, useState } from "react";
import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "./SectionHeading";
import { PCB, PACKAGE_TREE, CLEAN_BADGES, type TreeNode } from "./pcbData";
import { useReducedMotion } from "./useReducedMotion";

type Row = { glyph: string; name: string; note?: string; isDir: boolean };

function flatten(node: TreeNode, prefix: string, isLast: boolean, depth: number, out: Row[]) {
  const isDir = !!node.children || node.name.endsWith("/");
  if (depth === 0) {
    out.push({ glyph: node.name, name: node.name, note: node.note, isDir });
  } else {
    out.push({ glyph: prefix + (isLast ? "└── " : "├── ") + node.name, name: node.name, note: node.note, isDir });
  }
  const kids = node.children ?? [];
  kids.forEach((k, i) => {
    const childPrefix = depth === 0 ? "" : prefix + (isLast ? "    " : "│   ");
    flatten(k, childPrefix, i === kids.length - 1, depth + 1, out);
  });
}

export default function Deliverable() {
  const rows: Row[] = [];
  flatten(PACKAGE_TREE, "", true, 0, rows);
  const [active, setActive] = useState<Row | null>(rows.find((r) => r.note) ?? null);

  return (
    <section id="deliverable" className="relative py-20 sm:py-28 px-6">
      <ScrollFadeIn>
       <div className="max-w-5xl mx-auto">
        <SectionHeading eyebrow="The Deliverable" title="The board isn't the product. The package is.">
          Anyone can route a pretty board — the difference shows in the hand-off. Every project ships
          in the same predictable structure, and the tree below is the actual layout, file for file.
          Hover or tap any file to see what the fab does with it.
        </SectionHeading>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* file tree terminal */}
          <div className="border border-[#eae6da]/12 rounded-xl overflow-hidden" style={{ background: "rgba(18,14,26,0.55)" }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#eae6da]/10 bg-[#eae6da]/[0.03]">
              <span className="w-2 h-2 rounded-full bg-[#ff5f57]/60" />
              <span className="w-2 h-2 rounded-full bg-[#febc2e]/60" />
              <span className="w-2 h-2 rounded-full bg-[#28c840]/60" />
              <span className="font-mono text-[11px] text-[#eae6da]/60 ml-2">tree ~/MML-0X-board</span>
            </div>
            <div className="p-4">
              {rows.map((r, i) => (
                <button
                  key={i}
                  onMouseEnter={() => r.note && setActive(r)}
                  onFocus={() => r.note && setActive(r)}
                  onClick={() => r.note && setActive(r)}
                  className="block w-full text-left font-mono text-xs sm:text-[13px] leading-7 transition-colors duration-200 hover:bg-[#d4af37]/[0.06]"
                  style={{ color: active?.glyph === r.glyph ? PCB.enigBright : r.isDir ? PCB.enig : "rgba(214,211,205,0.6)" }}
                >
                  <span style={{ whiteSpace: "pre" }}>{r.glyph}</span>
                  {r.note && <span className="pcb-testpoint inline-block ml-2 align-middle rounded-full"
                    style={{ width: 7, height: 7, background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)` }} />}
                </button>
              ))}
            </div>
          </div>

          {/* probe readout + clean badges */}
          <div className="space-y-6">
            <div className="rounded-xl p-5 min-h-[160px]" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.22)" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: PCB.green, boxShadow: `0 0 8px ${PCB.green}` }} />
                <span className="font-mono text-[11px] tracking-widest" style={{ color: PCB.green }}>PROBE · CONTINUITY OK</span>
              </div>
              <p className="font-mono text-[13px] leading-7 text-[#d6d3cd]/85">
                <span style={{ color: PCB.enig }}>{active?.name ?? "—"}</span>
                <br />
                {active?.note ?? "Hover or tap a test point in the tree to probe it."}
              </p>
            </div>

            <Badges />
          </div>
        </div>
       </div>
      </ScrollFadeIn>
    </section>
  );
}

function Badges() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(reduced);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setLit(true); obs.unobserve(el); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CLEAN_BADGES.map((b, i) => (
        <div
          key={b.label}
          title={b.note}
          className="font-mono text-[11px] tracking-wider px-3 py-2 rounded border text-center transition-all duration-500 motion-reduce:transition-none"
          style={{
            transitionDelay: reduced ? "0ms" : `${i * 80}ms`,
            color: lit ? PCB.green : "#46424c",
            borderColor: lit ? "rgba(61,220,132,0.35)" : "rgba(120,120,130,0.2)",
            boxShadow: lit ? "0 0 12px rgba(61,220,132,0.14)" : "none",
            background: lit ? "rgba(61,220,132,0.05)" : "transparent",
          }}
        >
          {b.label}
        </div>
      ))}
    </div>
  );
}
