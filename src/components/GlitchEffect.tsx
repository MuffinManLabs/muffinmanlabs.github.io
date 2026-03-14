"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function GlitchEffect() {
  const [glitching, setGlitching] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const injectChaos = useCallback(() => {
    // Inject a <style> that applies glitch animation to ALL text on the page
    const style = document.createElement("style");
    style.textContent = `
      @keyframes _g_skew {
        0% { transform: skewX(0deg) skewY(0deg); }
        10% { transform: skewX(-8deg) skewY(2deg); }
        20% { transform: skewX(12deg) skewY(-1deg); }
        30% { transform: skewX(-4deg) skewY(3deg); }
        40% { transform: skewX(6deg) skewY(-2deg); }
        50% { transform: skewX(-10deg) skewY(1deg); }
        60% { transform: skewX(8deg) skewY(-3deg); }
        70% { transform: skewX(-6deg) skewY(2deg); }
        80% { transform: skewX(14deg) skewY(-1deg); }
        90% { transform: skewX(-12deg) skewY(3deg); }
        100% { transform: skewX(0deg) skewY(0deg); }
      }
      @keyframes _g_color {
        0% { filter: none; }
        15% { filter: hue-rotate(90deg) saturate(3) brightness(1.5); }
        30% { filter: hue-rotate(-60deg) saturate(2) brightness(0.8); }
        45% { filter: invert(1) hue-rotate(180deg); }
        60% { filter: hue-rotate(120deg) saturate(4) brightness(1.3); }
        75% { filter: hue-rotate(-90deg) contrast(2); }
        90% { filter: saturate(5) brightness(1.8); }
        100% { filter: none; }
      }
      @keyframes _g_jitter {
        0% { transform: translate(0, 0); }
        10% { transform: translate(-3px, 2px); }
        20% { transform: translate(4px, -1px); }
        30% { transform: translate(-2px, -3px); }
        40% { transform: translate(5px, 1px); }
        50% { transform: translate(-4px, 3px); }
        60% { transform: translate(2px, -4px); }
        70% { transform: translate(-5px, 2px); }
        80% { transform: translate(3px, -2px); }
        90% { transform: translate(-1px, 4px); }
        100% { transform: translate(0, 0); }
      }
      body._glitching * {
        animation: _g_jitter 0.05s steps(2) infinite !important;
      }
      body._glitching {
        animation: _g_skew 0.1s steps(3) infinite !important;
      }
      body._glitching main {
        animation: _g_color 0.15s steps(4) infinite !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
    document.body.classList.add("_glitching");
  }, []);

  const removeChaos = useCallback(() => {
    document.body.classList.remove("_glitching");
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleGlitch() {
      const delay = 20000;
      timeout = setTimeout(() => {
        setGlitching(true);
        injectChaos();

        // Flicker the chaos on/off rapidly for extra intensity
        let ticks = 0;
        intervalRef.current = setInterval(() => {
          if (ticks % 2 === 0) {
            removeChaos();
          } else {
            injectChaos();
          }
          ticks++;
        }, 80);

        setTimeout(() => {
          clearInterval(intervalRef.current);
          removeChaos();
          setGlitching(false);
          scheduleGlitch();
        }, 800 + Math.random() * 400);
      }, delay);
    }

    scheduleGlitch();
    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
      removeChaos();
    };
  }, [injectChaos, removeChaos]);

  if (!glitching) return null;

  return (
    <div className="fixed inset-0 z-[9997] pointer-events-none overflow-hidden">
      {/* RGB split — red and cyan offset layers */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255, 0, 0, 0.06)",
          animation: "_g_jitter 0.04s steps(2) infinite",
          mixBlendMode: "screen",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 255, 255, 0.04)",
          animation: "_g_jitter 0.06s steps(3) infinite reverse",
          mixBlendMode: "screen",
        }}
      />

      {/* Heavy scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 3px)",
          animation: "_g_jitter 0.03s steps(2) infinite",
        }}
      />

      {/* Random horizontal tear slices */}
      {Array.from({ length: 6 }).map((_, i) => {
        const top = Math.random() * 85;
        const height = 1 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute left-0 right-0"
            style={{
              top: `${top}%`,
              height: `${height}%`,
              transform: `translateX(${(Math.random() - 0.5) * 40}px)`,
              background: `rgba(0, 255, 65, ${0.04 + Math.random() * 0.06})`,
              borderTop: "1px solid rgba(0, 255, 65, 0.15)",
              borderBottom: "1px solid rgba(0, 255, 65, 0.15)",
            }}
          />
        );
      })}

      {/* White flash */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          animation: "_g_color 0.08s steps(2) infinite",
        }}
      />
    </div>
  );
}
