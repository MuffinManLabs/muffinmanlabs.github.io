"use client";

import { useEffect, useRef, useState } from "react";
import ScrambleText from "./ScrambleText";

export default function MemoryMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="memory-map" className="relative py-20 px-8">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="mb-10">
          <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
            // interactive
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
            style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            <ScrambleText text="Memory Map Explorer" />
          </h2>
          <p className="font-mono text-xs text-[#555] mt-3">
            STM32F407VGT6 &mdash; ARM Cortex-M4 &mdash; 4GB address space
          </p>
        </div>

        <div
          className="transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              border: "1px solid #0d1a0d",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.3)",
            }}
          >
            <iframe
              src="https://claude.site/public/artifacts/f231b72f-03d2-4eb5-b490-b458690871b9/embed"
              title="STM32F407 Memory Map Explorer"
              width="100%"
              height="700"
              frameBorder="0"
              allow="clipboard-write"
              allowFullScreen
              className="block"
              style={{ background: "#0a0a0a" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
