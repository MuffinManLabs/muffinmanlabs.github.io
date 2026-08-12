import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "./SectionHeading";
import { PCB, SERVICES, TRUST } from "./pcbData";

export default function Services() {
  return (
    <section id="services" className="relative py-20 sm:py-28 px-6">
      <ScrollFadeIn>
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Services" title="Three ways I can help.">
            I work in <span style={{ color: PCB.enigBright }}>KiCad, and only KiCad</span> — you get
            clean native source files you fully own, never a conversion from another tool. Pick the
            lane that matches where your project is today.
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {SERVICES.map((svc) => (
              <div key={svc.id} className="fab-card flex flex-col p-6 sm:p-7">
                <div className="font-mono text-xs mb-3" style={{ color: PCB.enig }}>{svc.id}</div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
                >
                  {svc.title}
                </h3>
                <p className="text-sm leading-7 text-[#d6d3cd]/70 mb-4">{svc.desc}</p>
                <ul className="space-y-2 mb-5">
                  {svc.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 items-baseline text-[13px] leading-6 text-[#d6d3cd]/80">
                      <span
                        aria-hidden
                        className="shrink-0 w-1.5 h-1.5 rounded-full translate-y-[-1px]"
                        style={{ background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)` }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="mt-auto pt-3 border-t font-mono text-xs"
                  style={{ borderColor: "rgba(234,230,218,0.1)", color: PCB.copperBright }}
                >
                  {svc.turnaround}
                </div>
              </div>
            ))}
          </div>

          {/* client-comfort strip */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {TRUST.map((t, i) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full border"
                style={
                  i === 0
                    ? { color: PCB.enigBright, borderColor: "rgba(212,175,55,0.45)", background: "rgba(212,175,55,0.07)" }
                    : { color: "rgba(234,230,218,0.7)", borderColor: "rgba(184,115,51,0.28)" }
                }
              >
                <span
                  aria-hidden
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: i === 0 ? PCB.enigBright : "rgba(184,115,51,0.7)" }}
                />
                {t}
              </span>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
