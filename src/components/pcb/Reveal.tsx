"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades a block in the first time it scrolls into view.
 *
 * The hidden state lives in CSS, and `@media (scripting: none)` in globals.css
 * keeps it visible for anyone without JavaScript — so a crawler or a reader
 * with scripts off gets the content rather than a page of invisible divs.
 */
export default function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // no observer (very old browsers) — just show it on the next frame
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "shown" : ""}`}>
      {children}
    </div>
  );
}
