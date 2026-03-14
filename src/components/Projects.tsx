import ScrambleText from "./ScrambleText";
import ScrollFadeIn from "./ScrollFadeIn";

const projects = [
  {
    name: "C_cpu_emulator",
    url: "https://github.com/MuffinManLabs/C_cpu_emulator",
  },
  {
    name: "safe_filesystem_snapshot",
    url: "https://github.com/MuffinManLabs/safe_filesystem_snapshot",
  },
  {
    name: "Virtual-CPU-Emulator",
    url: "https://github.com/MuffinManLabs/Virtual-CPU-Emulator",
  },
  {
    name: "mini_language_interpreter",
    url: "https://github.com/MuffinManLabs/mini_language_interpreter",
  },
  {
    name: "HashMap-C",
    url: "https://github.com/MuffinManLabs/HashMap-C",
  },
  {
    name: "dynamic-array-c",
    url: "https://github.com/MuffinManLabs/dynamic-array-c",
  },
  {
    name: "binary-file-explorer",
    url: "https://github.com/MuffinManLabs/binary-file-explorer",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="relative py-20 px-8">
      <ScrollFadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
              // projects
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              <ScrambleText text="Projects" />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-[#00ff41]/10 hover:border-[#00ff41]/30 p-5 transition-all duration-300 hover:bg-[#00ff41]/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#00ff41]/70 group-hover:text-[#00ff41] transition-colors">
                    <span className="text-[#a855f7]">~/</span>
                    <ScrambleText text={project.name} />
                  </span>
                  <span className="text-[#00ff41]/30 group-hover:text-[#00ff41]/60 group-hover:translate-x-1 transition-all duration-300">
                    &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
