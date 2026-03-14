"use client";

import { useEffect, useRef } from "react";

const PE_BYTES = [
  "4D", "5A", "90", "00", "03", "FF", "A8", "B8",
  "40", "50", "45", "0E", "1F", "4C", "01", "CC",
];

interface Particle {
  x: number;
  y: number;
  text: string;
  opacity: number;
  born: number;
}

function randomHex(): string {
  const bytes: string[] = [];
  for (let i = 0; i < 4; i++) {
    bytes.push(
      Math.random() > 0.5
        ? PE_BYTES[Math.floor(Math.random() * PE_BYTES.length)]
        : Math.floor(Math.random() * 256)
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")
    );
  }
  return bytes.join(" ");
}

export default function HexTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const lastSpawn = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawn.current < 60) return;
      lastSpawn.current = now;

      for (let i = 0; i < 2; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 140,
          y: e.clientY + (Math.random() - 0.5) * 90,
          text: randomHex(),
          opacity: 0.08 + Math.random() * 0.06,
          born: now,
        });
      }
    };
    window.addEventListener("mousemove", onMove);

    const LIFE = 2000;
    const draw = () => {
      const now = Date.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "11px monospace";
      ctx.textBaseline = "middle";

      particles.current = particles.current.filter((p) => {
        const age = now - p.born;
        if (age > LIFE) return false;
        ctx.fillStyle = `rgba(0, 255, 65, ${p.opacity * (1 - age / LIFE)})`;
        ctx.fillText(p.text, p.x, p.y);
        return true;
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
