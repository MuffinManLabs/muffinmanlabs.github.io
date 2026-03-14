const skills = [
  { category: "Languages", items: ["C", "Python", "TypeScript"] },
  { category: "Focus Areas", items: ["Systems Programming", "OS Development", "Compiler Design"] },
  { category: "Interests", items: ["Binary Security", "Reverse Engineering", "Low-Level Tools"] },
];

export default function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left column */}
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-violet-400 font-mono mb-4">
              About
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-8 tracking-tight">
              Close to the
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                metal.
              </span>
            </h2>
            <p className="text-zinc-400 leading-relaxed text-lg mb-6">
              I&apos;m passionate about understanding how computers actually work
              &mdash; not through layers of abstraction, but by building things
              from scratch. From virtual CPUs to memory allocators, I believe the
              best way to learn is to build.
            </p>
            <p className="text-zinc-500 leading-relaxed">
              Currently deep in systems programming with C, working my way toward
              OS development, compiler design, and binary security research. Every
              project is a step closer to mastering the machine.
            </p>
          </div>

          {/* Right column - Skills */}
          <div className="space-y-8">
            {skills.map((group) => (
              <div key={group.category}>
                <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4 font-mono">
                  {group.category}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:border-violet-500/50 hover:text-violet-300 transition-all duration-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "7+", label: "Projects" },
                { value: "3", label: "Languages" },
                { value: "∞", label: "Curiosity" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
                >
                  <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
