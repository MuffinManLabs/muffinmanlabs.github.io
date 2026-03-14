const projects = [
  {
    title: "Virtual CPU Emulator",
    description:
      "A fully functional virtual CPU built from scratch, first in Python then rewritten in C. Executes custom instruction sets with registers, memory, and a stack.",
    tags: ["C", "Python", "Systems"],
    gradient: "from-violet-500/20 to-purple-500/20",
    borderColor: "hover:border-violet-500/50",
  },
  {
    title: "Dynamic Array Library",
    description:
      "A generic, type-safe dynamic array implementation in C with automatic growth, void* storage, and clean memory management. Tested under Valgrind with zero leaks.",
    tags: ["C", "Data Structures", "Memory"],
    gradient: "from-cyan-500/20 to-blue-500/20",
    borderColor: "hover:border-cyan-500/50",
  },
  {
    title: "Hash Map Implementation",
    description:
      "A hash map with string keys and void* values using chained buckets. Features djb2 hashing, proper memory ownership, and comprehensive cleanup.",
    tags: ["C", "Algorithms", "Memory"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    borderColor: "hover:border-emerald-500/50",
  },
  {
    title: "Tiny Language Interpreter",
    description:
      "An interpreter for a custom programming language built in Python. Includes lexing, parsing, and tree-walking evaluation with variables and expressions.",
    tags: ["Python", "Compilers", "PL Theory"],
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "hover:border-amber-500/50",
  },
  {
    title: "Binary File Explorer",
    description:
      "A tool for inspecting and analyzing binary files, displaying hex dumps, identifying file formats, and parsing structured binary data.",
    tags: ["Python", "Binary", "Security"],
    gradient: "from-rose-500/20 to-pink-500/20",
    borderColor: "hover:border-rose-500/50",
  },
  {
    title: "Memory Allocator",
    description:
      "Coming soon — a custom memory allocator implementing malloc, free, and realloc from scratch using system calls. Understanding memory at its deepest level.",
    tags: ["C", "OS", "Memory"],
    gradient: "from-indigo-500/20 to-violet-500/20",
    borderColor: "hover:border-indigo-500/50",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-400 font-mono mb-4">
            Projects
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight">
            Built from scratch.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <article
              key={project.title}
              className={`group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 ${project.borderColor}`}
            >
              {/* Gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-zinc-100 mb-3">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 bg-zinc-800/80 text-zinc-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
