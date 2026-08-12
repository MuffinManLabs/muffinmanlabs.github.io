"use client";

import { useEffect, useRef, useState } from "react";
import { PCB } from "./pcbData";
import { useReducedMotion } from "./useReducedMotion";

/**
 * A copper trace running down the left edge of the page. As the visitor
 * scrolls, a gold signal fills the trace; each section is a via that lights
 * when the signal reaches it. The vias double as jump-to-section nav.
 */
const SECTIONS = [
  { id: "board", label: "Board" },
  { id: "services", label: "Services" },
  { id: "boards", label: "Portfolio" },
  { id: "about", label: "About" },
  { id: "deliverable", label: "The Package" },
  { id: "skills", label: "Skills" },
  { id: "notes", label: "Field Notes" },
  { id: "standard", label: "The Standard" },
  { id: "contact", label: "Contact" },
];

type Mark = { id: string; label: string; frac: number };

export default function CircuitRail() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastDocHRef = useRef(0);

  useEffect(() => {
    function measure() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      lastDocHRef.current = docH;
      const next: Mark[] = [];
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        const frac = Math.min(1, Math.max(0, (top - window.innerHeight * 0.35) / docH));
        next.push({ ...s, frac });
      }
      setMarks(next);
      setProgress(Math.min(1, window.scrollY / docH));
    }

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        // page height changes at runtime (expanding bring-up logs) — keep vias in sync
        if (docH !== lastDocHRef.current) {
          measure();
          return;
        }
        setProgress(docH > 0 ? Math.min(1, window.scrollY / docH) : 0);
      });
    }

    measure();
    const t = setTimeout(measure, 1500); // re-measure after fonts/images settle
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="hidden xl:block fixed left-7 top-1/2 -translate-y-1/2 z-40"
      style={{ height: "56vh" }}
    >
      {/* copper track */}
      <div className="relative h-full w-[2px] rounded" style={{ background: "rgba(184,115,51,0.25)" }}>
        {/* gold signal fill */}
        <div
          className="absolute top-0 left-0 w-full rounded"
          style={{
            height: `${progress * 100}%`,
            background: `linear-gradient(180deg, ${PCB.copperBright}, ${PCB.enig})`,
            boxShadow: "0 0 6px rgba(232,168,92,0.45)",
          }}
        />
        {/* signal front */}
        {!reduced && (
          <span
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              top: `${progress * 100}%`,
              background: PCB.enigBright,
              boxShadow: `0 0 8px ${PCB.enigBright}, 0 0 16px rgba(240,212,136,0.5)`,
            }}
          />
        )}
        {/* section vias */}
        {marks.map((m) => {
          const lit = progress >= m.frac;
          return (
            <a
              key={m.id}
              href={`#${m.id}`}
              aria-label={m.label}
              title={m.label}
              className="group absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center p-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0d488]"
              style={{ top: `${m.frac * 100}%` }}
            >
              <span
                className="block w-[9px] h-[9px] rounded-full transition-all duration-500"
                style={{
                  background: lit
                    ? `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)`
                    : "#241a33",
                  border: lit ? "none" : "1px solid rgba(184,115,51,0.45)",
                  boxShadow: lit ? "0 0 0 2px #0d0c11, 0 0 8px rgba(240,212,136,0.4)" : "0 0 0 2px #0d0c11",
                }}
              />
              <span
                className="absolute left-6 whitespace-nowrap font-mono text-[11px] tracking-wider opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-0.5 rounded"
                style={{ color: PCB.enigBright, background: "rgba(13,12,17,0.92)", border: "1px solid rgba(212,175,55,0.3)" }}
              >
                {m.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
