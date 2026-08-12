"use client";

import { useEffect, useRef, useState } from "react";

/** A thin copper→gold fill under the header that tracks reading position. */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        setPct(docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-16 left-0 right-0 z-40 h-px"
      style={{ background: "rgba(184,115,51,0.18)" }}
    >
      <div
        className="h-full origin-left"
        style={{
          width: `${pct * 100}%`,
          background: "linear-gradient(90deg, #b87333, #f0d488)",
          boxShadow: pct > 0.01 ? "0 0 8px rgba(240,212,136,0.45)" : "none",
        }}
      />
    </div>
  );
}
