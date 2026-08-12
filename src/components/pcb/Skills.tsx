import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "./SectionHeading";
import { PCB, SKILL_GROUPS } from "./pcbData";

export default function Skills() {
  return (
    <section id="skills" className="relative py-20 sm:py-28 px-6">
      <ScrollFadeIn>
        <div className="max-w-5xl mx-auto">
          <SectionHeading eyebrow="Skills" title="What I bring to your board.">
            The full toolkit, in the order your project will use it — design the circuit, lay out the
            board, and hand your fab a package that works the first time.
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {SKILL_GROUPS.map((group, gi) => (
              <div key={group.title} className="fab-card p-6 sm:p-7">
                <div className="font-mono text-xs mb-1" style={{ color: PCB.copperBright }}>
                  {String(gi + 1).padStart(2, "0")}
                </div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
                >
                  {group.title}
                </h3>
                <p className="font-mono text-[11px] mt-1 mb-5" style={{ color: "rgba(234,230,218,0.6)" }}>
                  {group.tagline}
                </p>

                <ul className="space-y-2.5">
                  {group.skills.map((s) => (
                    <li key={s.name} className="flex gap-2.5 items-baseline">
                      <span
                        aria-hidden
                        className="shrink-0 w-1.5 h-1.5 rounded-full translate-y-[-1px]"
                        style={{ background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)` }}
                      />
                      <span className="text-[13px] leading-6 text-[#d6d3cd]/80">
                        {s.name}
                        {s.detail && (
                          <span className="font-mono text-[11px] ml-2" style={{ color: "rgba(232,168,92,0.8)" }}>
                            {s.detail}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
