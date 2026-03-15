"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const bootMessages = [
  "Power-on reset... OK",
  "Initializing HAL...",
  "Configuring GPIO pins...",
  "Starting RTOS scheduler...",
  "Mounting filesystem...",
  "SPI bus initialized... OK",
  "I2C peripherals detected: 3",
  "UART0 @ 115200 baud... OK",
  "Loading firmware v1.0...",
  "",
  "System ready.",
  "Welcome to MuffinManLabs.",
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BootSequence({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [lines, setLines] = useState<string[]>([]);
  const [fading, setFading] = useState(false);
  const [typing, setTyping] = useState(true);
  const cancelledRef = useRef(false);

  const finish = useCallback(() => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    setFading(true);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    cancelledRef.current = false;
    setLines([]);
    setTyping(true);

    async function typeBootSequence() {
      for (const msg of bootMessages) {
        if (cancelledRef.current) return;

        if (msg === "") {
          setLines((prev) => [...prev, ""]);
          await sleep(40);
          continue;
        }

        for (let i = 0; i <= msg.length; i++) {
          if (cancelledRef.current) return;
          const partial = msg.slice(0, i);
          setLines((prev) => {
            if (i === 0) return [...prev, partial];
            const copy = [...prev];
            copy[copy.length - 1] = partial;
            return copy;
          });
          if (i < msg.length) {
            await sleep(6 + Math.random() * 10);
          }
        }

        await sleep(60 + Math.random() * 80);
      }

      if (!cancelledRef.current) {
        setTyping(false);
        await sleep(400);
        if (!cancelledRef.current) {
          finish();
        }
      }
    }

    typeBootSequence();

    return () => {
      cancelledRef.current = true;
    };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#0a0a0a] flex flex-col justify-center px-8 sm:px-16 transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="max-w-2xl font-mono text-sm leading-7">
        {lines.map((line, i) => (
          <div key={i}>
            {line !== "" ? (
              <span className="text-[#00ff41]">
                <span className="text-[#00ff41]/40">&gt; </span>
                {line}
              </span>
            ) : (
              <br />
            )}
          </div>
        ))}
        {typing && <span className="text-[#00ff41] animate-pulse">█</span>}
      </div>

      <button
        onClick={finish}
        className="fixed bottom-6 right-6 text-xs text-[#00ff41]/30 hover:text-[#00ff41]/60 font-mono tracking-widest uppercase transition-colors duration-300"
      >
        [Skip]
      </button>
    </div>
  );
}
