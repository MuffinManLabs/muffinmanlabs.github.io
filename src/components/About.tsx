import ScrambleText from "./ScrambleText";
import ScrollFadeIn from "./ScrollFadeIn";

const tools = [
  "C",
  "ARM Assembly",
  "RTOS",
  "STM32",
  "JTAG",
  "SPI",
  "I2C",
  "UART",
  "Python",
  "Linux",
  "Embedded Linux",
  "Bare Metal Programming",
];

export default function About() {
  return (
    <section id="about" className="relative py-20 px-8">
      <ScrollFadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
              // about
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              <ScrambleText text="About Me" />
            </h2>
          </div>

          <div className="space-y-6 font-mono text-sm leading-7 text-[#e0e0e0]/70 max-w-3xl">
            <p>
              I&apos;m an aspiring embedded systems software engineer and firmware
              engineer, working as close to the hardware as possible. I write C,
              talk to peripherals over SPI and I2C, and debug with JTAG probes
              instead of print statements. I believe the best way to learn is by
              building — bare metal drivers, RTOS tasks, and custom firmware from
              scratch. This site is where I document that journey through
              writeups, project breakdowns, and deep dives into low-level
              systems. Everything here is built in public — mistakes,
              breakthroughs, and all.
            </p>
          </div>

          {/* Tools/Skills */}
          <div className="mt-12">
            <p className="font-mono text-xs text-[#00ff41]/40 tracking-widest uppercase mb-4">
              &gt; tools &amp;&amp; skills
            </p>
            <div className="flex flex-wrap gap-3">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="px-4 py-2 text-xs font-mono text-[#00ff41]/70 border border-[#00ff41]/15 hover:border-[#00ff41]/40 hover:text-[#00ff41] transition-all duration-300"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
