import Image from "next/image";
import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "./SectionHeading";
import { PCB, ABOUT_PARAGRAPHS, ABOUT_CREDENTIALS } from "./pcbData";

export default function About() {
  return (
    <section id="about" className="relative py-20 sm:py-28 px-6">
      <ScrollFadeIn>
        <div className="max-w-5xl mx-auto">
          {/* heading spans the full column like every other section */}
          <SectionHeading eyebrow="Who you're hiring" title="One designer. Your board, start to finish.">
            {ABOUT_PARAGRAPHS[0]}
          </SectionHeading>

          <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-start">
            {/* ── the photo, mounted like a component ── */}
            <div className="mx-auto md:mx-0 w-full max-w-[300px]">
              <div className="pcb-substrate relative rounded-xl p-4" style={{ border: "1px solid rgba(234,230,218,0.14)" }}>
                {/* corner mounting pads */}
                {[
                  { t: 7, l: 7 }, { t: 7, r: 7 }, { b: 7, l: 7 }, { b: 7, r: 7 },
                ].map((p, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="absolute rounded-full"
                    style={{
                      top: p.t, bottom: p.b, left: p.l, right: p.r, width: 10, height: 10,
                      background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)`,
                      boxShadow: "inset 0 0 0 2px #140d20",
                    }}
                  />
                ))}

                <div
                  className="relative overflow-hidden rounded-lg"
                  style={{ border: `2px solid ${PCB.enig}`, boxShadow: "0 10px 30px -12px rgba(0,0,0,0.9)" }}
                >
                  {/* the grade + edge falloff are baked into the asset itself, so
                      the photo sits in the palette without a CSS overlay dulling it */}
                  <Image
                    src="/profile.jpg"
                    alt="Portrait of the designer behind MuffinByteLabs"
                    width={760}
                    height={760}
                    className="block w-full h-auto"
                    priority
                  />
                </div>

                {/* silkscreen designator (A = assembly, per IEEE 315) */}
                <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.18em]" style={{ color: PCB.silk }}>
                  <span style={{ opacity: 0.75 }}>A1 · DESIGNER</span>
                  <span className="inline-flex items-center gap-1.5" style={{ color: PCB.green }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: PCB.green, boxShadow: `0 0 6px ${PCB.green}` }}
                    />
                    AVAILABLE
                  </span>
                </div>
              </div>
            </div>

            {/* ── the copy ── */}
            <div>
              <div className="space-y-5">
                {ABOUT_PARAGRAPHS.slice(1).map((p) => (
                  <p key={p} className="text-base leading-8 text-[#d6d3cd]/70 max-w-[60ch]">
                    {p}
                  </p>
                ))}
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {ABOUT_CREDENTIALS.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-baseline gap-2.5 rounded-lg px-3.5 py-3"
                    style={{ border: "1px solid rgba(184,115,51,0.28)", background: "rgba(234,230,218,0.02)" }}
                  >
                    <span
                      aria-hidden
                      className="shrink-0 w-1.5 h-1.5 rounded-full translate-y-[-1px]"
                      style={{ background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)` }}
                    />
                    <span className="text-[13px] leading-6">
                      <span style={{ color: PCB.silk }}>{c.label}</span>
                      <span className="text-[#d6d3cd]/60"> — {c.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
