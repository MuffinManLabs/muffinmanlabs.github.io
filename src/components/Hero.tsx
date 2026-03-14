export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="animate-fade-up">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 mb-6 font-mono">
            Software Engineering &amp; Systems Programming
          </p>
        </div>

        <h1 className="animate-fade-up-delay-1 text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight mb-8">
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Muffin Man
          </span>
          <br />
          <span className="text-zinc-100">Labs</span>
        </h1>

        <p className="animate-fade-up-delay-2 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Building things from the ground up. Low-level systems, compilers,
          and tools that push the boundaries of what software can do.
        </p>

        <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            className="group relative px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-full text-sm font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/25"
          >
            View Projects
          </a>
          <a
            href="#contact"
            className="px-8 py-3 rounded-full text-sm font-medium text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200 transition-all duration-300"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-zinc-500 rounded-full" />
        </div>
      </div>
    </section>
  );
}
