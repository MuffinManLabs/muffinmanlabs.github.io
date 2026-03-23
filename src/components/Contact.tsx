import ScrambleText from "./ScrambleText";
import ScrollFadeIn from "./ScrollFadeIn";

export default function Contact() {
  return (
    <section id="contact" className="relative py-20 px-8">
      <ScrollFadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
              // contact
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              <ScrambleText text="Contact" />
            </h2>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <a
              href="https://github.com/muffinmanlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[#00ff41]/60 hover:text-[#00ff41] transition-colors duration-300"
            >
              <span className="text-[#a855f7]">&gt;</span>
              <span>github.com/muffinmanlabs</span>
            </a>
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
