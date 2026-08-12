"use client";

import { useEffect, useRef, useState } from "react";
import { PCB, FAB_STRING, STATUS_OK, STATUS_SPECS, POWER_STATUS, DESIGNATOR, KICAD_NATIVE } from "./pcbData";
import { useReducedMotion } from "./useReducedMotion";

export default function PCBHero() {
  const reduced = useReducedMotion();
  const [powered, setPowered] = useState(false);
  const [typed, setTyped] = useState("");
  const [mm, setMm] = useState<{ x: string; y: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // power-up sequence
  useEffect(() => {
    if (reduced) {
      setPowered(true);
      setTyped(POWER_STATUS);
      return;
    }
    const t = setTimeout(() => setPowered(true), 350);
    return () => clearTimeout(t);
  }, [reduced]);

  // status-line typewriter once powered
  useEffect(() => {
    if (!powered || reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(POWER_STATUS.slice(0, i));
      if (i >= POWER_STATUS.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [powered, reduced]);

  // loupe + mm-coordinate readout follow the cursor over the board
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (loupeRef.current) {
        loupeRef.current.style.background = `radial-gradient(170px circle at ${px}px ${py}px, rgba(240,212,136,0.09), rgba(184,115,51,0.05) 45%, transparent 70%)`;
      }
      setMm({
        x: ((px / rect.width) * 84).toFixed(2),
        y: ((py / rect.height) * 54).toFixed(2),
      });
    });
  }

  function onLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (loupeRef.current) loupeRef.current.style.background = "";
    setMm(null);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="board" className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-5xl mx-auto">
        {/* ── THE BOARD ─────────────────────────────────────────────────── */}
        <div
          ref={panelRef}
          onMouseMove={reduced ? undefined : onMove}
          onMouseLeave={onLeave}
          className="pcb-substrate relative rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(234,230,218,0.18)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
        >
          {/* loupe highlight */}
          <div ref={loupeRef} className="pointer-events-none absolute inset-0 z-20" />

          {/* castellated top edge */}
          <div className="absolute top-0 left-0 right-0 flex justify-between px-8 z-10" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} style={{ width: 6, height: 5, background: PCB.enig, opacity: 0.5, borderRadius: "0 0 2px 2px" }} />
            ))}
          </div>

          {/* corner mounting holes */}
          {[
            { t: 14, l: 14 }, { t: 14, r: 14 }, { b: 14, l: 14 }, { b: 14, r: 14 },
          ].map((p, i) => (
            <span key={i} aria-hidden className="absolute z-10 rounded-full"
              style={{
                top: p.t, bottom: p.b, left: p.l, right: p.r, width: 16, height: 16,
                background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)`,
                boxShadow: "inset 0 0 0 3px #140d20",
              }} />
          ))}

          {/* fab string + barcode */}
          <div className="absolute top-7 left-7 z-10 font-mono text-[10px] tracking-widest" style={{ color: PCB.silk, opacity: 0.55 }}>
            {FAB_STRING}
          </div>
          <div className="absolute top-6 right-7 z-10 flex items-end gap-[2px]" aria-hidden>
            {[3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1].map((wd, i) => (
              <span key={i} style={{ width: wd, height: 14, background: PCB.silk, opacity: 0.45 }} />
            ))}
          </div>

          {/* ── board content ── */}
          <div className="relative z-10 px-6 sm:px-12 pt-14 pb-10 text-center">
            <HeroModule powered={powered} />

            {/* silkscreen name — engraved gold */}
            <h1
              className="mt-6 text-4xl min-[400px]:text-5xl sm:text-6xl md:text-7xl font-bold gold-text"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                letterSpacing: "-0.015em",
                lineHeight: 0.95,
                textShadow: "0 1px 0 rgba(0,0,0,0.5), 0 0 24px rgba(212,175,55,0.15)",
              }}
            >
              MuffinByteLabs
            </h1>

            {/* designator */}
            <p className="mt-5 font-mono text-xs sm:text-[13px] tracking-[0.2em]" style={{ color: PCB.enig }}>
              {DESIGNATOR}
            </p>
            <p className="mt-2 font-mono text-[11px] sm:text-xs" style={{ color: "rgba(234,230,218,0.6)" }}>
              {KICAD_NATIVE}
            </p>

            {/* power-good + status line */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-sm font-mono text-[11px] tracking-widest transition-all duration-700"
                style={{
                  color: powered ? PCB.green : "#46424c",
                  border: `1px solid ${powered ? "rgba(61,220,132,0.4)" : "rgba(120,120,130,0.25)"}`,
                  boxShadow: powered ? "0 0 14px rgba(61,220,132,0.22)" : "none",
                }}
              >
                <span className="w-2 h-2 rounded-full transition-all duration-700"
                  style={{ background: powered ? PCB.green : "#222", boxShadow: powered ? `0 0 8px ${PCB.green}` : "none" }} />
                {powered ? "POWER GOOD" : "POWER —"}
              </span>
              <code className="font-mono text-xs" style={{ color: PCB.green, minHeight: 16 }}>
                {typed}
                {powered && typed.length < POWER_STATUS.length && <span className="pcb-caret">_</span>}
              </code>
            </div>

            {/* ENIG-gold pad CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <PadButton href="#services" primary>VIEW SERVICES</PadButton>
              <PadButton href="#contact">REQUEST A QUOTE</PadButton>
            </div>
          </div>

          {/* KiCad status strip */}
          <div
            className="relative z-10 flex items-center justify-between gap-3 px-6 py-2 font-mono text-[11px] tracking-wider"
            style={{ background: "rgba(11,7,20,0.6)", borderTop: "1px solid rgba(234,230,218,0.12)", color: PCB.silk }}
          >
            <span className="flex items-center gap-3">
              <span style={{ color: PCB.green }}>{STATUS_OK}</span>
              <span className="hidden sm:inline" style={{ opacity: 0.55 }}>{STATUS_SPECS}</span>
            </span>
            <span style={{ opacity: 0.6 }}>{mm ? `X ${mm.x}  Y ${mm.y} mm` : "X --.--  Y --.-- mm"}</span>
          </div>
        </div>

        {/* value prop on near-black substrate (legibility) */}
        <p className="mt-9 mx-auto max-w-[46ch] text-center text-lg sm:text-xl leading-relaxed text-[#d6d3cd]/85">
          I take a circuit idea or prototype and hand back a{" "}
          <span style={{ color: PCB.enig }}>clean, manufacturable production package</span> — native
          KiCad source, Gerbers, drill, BOM with LCSC part numbers, CPL, and DRC/ERC-clean proof —
          documented like a datasheet and organized to the file.
        </p>
        <p className="mt-5 text-center font-mono text-xs tracking-widest" style={{ color: "rgba(232,168,92,0.65)" }}>
          <span className="bob inline-block mr-1.5">▼</span>
          SERVICES · PORTFOLIO · THE PACKAGE · THE STANDARD
        </p>
      </div>
    </section>
  );
}

function PadButton({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a
      href={href}
      className="pad-cta group relative font-mono text-[13px] tracking-widest px-6 py-3.5 rounded-lg"
      style={
        primary
          ? { background: `linear-gradient(180deg, ${PCB.enigBright}, ${PCB.enig})`, color: "#1a1405", boxShadow: "0 4px 14px rgba(212,175,55,0.3)" }
          : { color: PCB.enigBright, border: "1px solid rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.06)" }
      }
    >
      <span className="opacity-60 mr-1.5">{primary ? "▶" : "→"}</span>
      {children}
    </a>
  );
}

/* The ESP32-S3-WROOM-1 module (U1) at board center, traces fanning outward. */
function HeroModule({ powered }: { powered: boolean }) {
  const trace = powered ? PCB.copperBright : PCB.copper;
  const leftTraces = [40, 64, 88].map((y) => `M210 ${y} H120 a6 6 0 0 0 -6 6 V ${y + 25}`);
  const rightTraces = [40, 64, 88].map((y) => `M310 ${y} H400 a6 6 0 0 1 6 6 V ${y + 25}`);
  return (
    <svg viewBox="0 0 520 150" width="100%" className="max-w-3xl mx-auto" role="img" aria-label="ESP32-S3 module footprint">
      <defs>
        <radialGradient id="hero-enig" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={PCB.enigBright} />
          <stop offset="60%" stopColor={PCB.enig} />
          <stop offset="100%" stopColor="#a07d1f" />
        </radialGradient>
      </defs>

      {/* fan-out traces */}
      {[...leftTraces, ...rightTraces].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={trace} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      ))}
      {powered &&
        [...leftTraces, ...rightTraces].map((d, i) => (
          <path key={`p${i}`} className="pcb-pulse" d={d} fill="none" stroke={PCB.enigBright} strokeWidth="1.4"
            strokeDasharray="3 12" strokeLinecap="round" opacity="0.9" />
        ))}

      {/* end pads + vias */}
      {[40, 64, 88].flatMap((y) => [
        { x: 114, y: y + 28 }, { x: 406, y: y + 28 },
      ]).map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.4" fill="url(#hero-enig)" />
          <circle cx={p.x} cy={p.y} r="1.2" fill={PCB.drill} />
        </g>
      ))}

      {/* decoupling caps near the module */}
      {[{ x: 196, y: 24 }, { x: 324, y: 24 }].map((c, i) => (
        <g key={i}>
          <rect x={c.x - 6} y={c.y - 3} width="5" height="6" rx="0.8" fill="url(#hero-enig)" />
          <rect x={c.x + 1} y={c.y - 3} width="5" height="6" rx="0.8" fill="url(#hero-enig)" />
          <text x={c.x} y={c.y - 6} fontSize="6" fill={PCB.silk} textAnchor="middle" opacity="0.7"
            fontFamily="var(--font-geist-mono), monospace">{i === 0 ? "C1" : "C2"}</text>
        </g>
      ))}

      {/* power LED D1 */}
      <g>
        <rect x="150" y="98" width="14" height="9" rx="1" fill="#0c0c0c" stroke={PCB.silk} strokeWidth="0.6" opacity="0.85" />
        <circle cx="157" cy="102.5" r={powered ? 5 : 3} fill={powered ? PCB.green : "#1c1c1c"}
          opacity={powered ? 1 : 0.6} style={powered ? { filter: `drop-shadow(0 0 6px ${PCB.green})` } : undefined} />
        <text x="157" y="119" fontSize="6.5" fill={PCB.silk} textAnchor="middle" opacity="0.8"
          fontFamily="var(--font-geist-mono), monospace">D1 · PWR</text>
      </g>

      {/* module pin pads (castellated, both sides) */}
      {Array.from({ length: 7 }).map((_, i) => {
        const y = 36 + i * 12;
        return (
          <g key={i}>
            <rect x="200" y={y} width="12" height="8" rx="0.8" fill="url(#hero-enig)" />
            <rect x="308" y={y} width="12" height="8" rx="0.8" fill="url(#hero-enig)" />
          </g>
        );
      })}
      {/* bottom castellated pads */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 218 + i * 11.5;
        return <rect key={i} x={x} y="120" width="8" height="10" rx="0.8" fill="url(#hero-enig)" />;
      })}

      {/* module body */}
      <rect x="212" y="30" width="96" height="92" rx="3" fill="#15110b" stroke={PCB.silk} strokeWidth="1" opacity="0.95" />
      {/* shield can lines */}
      <rect x="218" y="36" width="84" height="80" rx="2" fill="none" stroke={PCB.silk} strokeWidth="0.5" opacity="0.35" />
      {/* antenna keep-out */}
      <rect x="216" y="33" width="88" height="14" rx="1.5" fill="none" stroke={PCB.silk} strokeWidth="0.6"
        strokeDasharray="2 2" opacity="0.6" />
      <text x="260" y="43" fontSize="5.5" fill={PCB.silk} textAnchor="middle" opacity="0.6"
        fontFamily="var(--font-geist-mono), monospace">ANTENNA KEEP-OUT</text>
      {/* pin-1 dot */}
      <circle cx="220" cy="54" r="2" fill={PCB.silk} opacity="0.9" />
      <text x="260" y="82" fontSize="11" fill={PCB.silk} textAnchor="middle" fontWeight="bold"
        fontFamily="var(--font-geist-mono), monospace">U1</text>
      <text x="260" y="96" fontSize="6.5" fill={PCB.silk} textAnchor="middle" opacity="0.75"
        fontFamily="var(--font-geist-mono), monospace">ESP32-S3-WROOM-1</text>
    </svg>
  );
}
