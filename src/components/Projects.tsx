"use client";

import { useEffect, useRef, useState } from "react";
import ScrambleText from "./ScrambleText";

const projects = [
  {
    name: "Memmory_Allocator_C",
    description: "Custom malloc/free implementation with block splitting, coalescing, and a free list — memory management from scratch.",
    tech: ["C", "Systems"],
    url: "https://github.com/MuffinManLabs/Memmory_Allocator_C",
  },
  {
    name: "HashMap-C",
    description: "Hash map with chained buckets, djb2 hashing, string keys, and void* values. Zero leaks under Valgrind.",
    tech: ["C", "Data Structures"],
    url: "https://github.com/MuffinManLabs/HashMap-C",
  },
  {
    name: "dynamic-array-c",
    description: "Generic dynamic array library using void* pointers with automatic growth, clean API, and full memory ownership.",
    tech: ["C", "Data Structures"],
    url: "https://github.com/MuffinManLabs/dynamic-array-c",
  },
  {
    name: "C_cpu_emulator",
    description: "Virtual CPU rewritten in C — fetch/decode/execute cycle, registers, stack, and a custom instruction set.",
    tech: ["C", "Systems"],
    url: "https://github.com/MuffinManLabs/C_cpu_emulator",
  },
  {
    name: "Virtual-CPU-Emulator",
    description: "Virtual CPU emulator in Python — the original prototype with registers, memory, and a custom ISA.",
    tech: ["Python", "Systems"],
    url: "https://github.com/MuffinManLabs/Virtual-CPU-Emulator",
  },
  {
    name: "mini_language_interpreter",
    description: "Interpreter for a tiny programming language — lexer, parser, and tree-walk evaluator built from scratch.",
    tech: ["Python", "Compilers"],
    url: "https://github.com/MuffinManLabs/mini_language_interpreter",
  },
  {
    name: "binary-file-explorer",
    description: "Tool for inspecting binary files — hex dump, header parsing, and structure visualization.",
    tech: ["Python", "Tools"],
    url: "https://github.com/MuffinManLabs/binary-file-explorer",
  },
  {
    name: "safe_filesystem_snapshot",
    description: "File integrity monitor that snapshots directory state and detects modifications, additions, and deletions.",
    tech: ["Python", "Security"],
    url: "https://github.com/MuffinManLabs/safe_filesystem_snapshot",
  },
];

function ProjectCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Terminal window */}
      <div className="relative border border-[#00ff41]/10 group-hover:border-[#00ff41]/60 transition-all duration-300 overflow-hidden project-card">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00ff41]/10 bg-[#00ff41]/[0.02]">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff5f57]/60" />
            <span className="w-2 h-2 rounded-full bg-[#febc2e]/60" />
            <span className="w-2 h-2 rounded-full bg-[#28c840]/60" />
          </div>
          <span className="font-mono text-[10px] text-[#00ff41]/40 ml-2">
            ~/projects/{project.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Project name */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-mono text-sm text-[#00ff41]/80 group-hover:text-[#00ff41] transition-colors duration-300">
              <span className="text-[#a855f7]">$ </span>
              <ScrambleText text={project.name} />
            </h3>
            <span className="text-[#00ff41]/20 group-hover:text-[#00ff41]/60 group-hover:translate-x-1 transition-all duration-300 text-sm">
              &rarr;
            </span>
          </div>

          {/* Description */}
          <p className="font-mono text-xs text-[#e0e0e0]/50 group-hover:text-[#e0e0e0]/70 leading-6 mb-4 transition-colors duration-300">
            {project.description}
          </p>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] font-mono text-[#a855f7]/60 border border-[#a855f7]/15 group-hover:border-[#a855f7]/30 group-hover:text-[#a855f7]/80 transition-all duration-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hover scanline effect */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 project-scanlines" />

        {/* Hover glow */}
        <div className="absolute -inset-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#00ff41]/[0.08] to-transparent" />
      </div>
    </a>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-20 px-8">
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
          {projects.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
