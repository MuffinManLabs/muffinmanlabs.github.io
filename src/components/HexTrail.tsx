"use client";

import { useEffect, useRef } from "react";

const REGISTER_ADDRS = [
  "0x40021000", "0x40020000", "0x40020400", "0x08000000",
  "0x20000000", "0x40013800", "0x40005400", "0xE000ED00",
];

const REGISTER_NAMES = [
  "GPIOA->ODR", "GPIOA->BSRR", "RCC->AHB1ENR", "GPIOB->MODER",
  "TIM2->CR1", "SPI1->DR", "I2C1->CR1", "USART1->BRR",
];

const HEX_VALUES = [
  "0xDEADBEEF", "0xCAFEBABE", "0x00000001", "0xFFFFFFFF",
  "0x48000400", "0x40004400",
];

interface Particle {
  x: number;
  y: number;
  text: string;
  opacity: number;
  born: number;
}

function randomHex(): string {
  const r = Math.random();
  if (r < 0.35) {
    return REGISTER_ADDRS[Math.floor(Math.random() * REGISTER_ADDRS.length)];
  } else if (r < 0.7) {
    return REGISTER_NAMES[Math.floor(Math.random() * REGISTER_NAMES.length)];
  } else {
    return HEX_VALUES[Math.floor(Math.random() * HEX_VALUES.length)];
  }
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
