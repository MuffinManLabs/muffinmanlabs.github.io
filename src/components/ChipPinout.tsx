"use client";

import { useEffect, useRef, useState } from "react";
import ScrambleText from "./ScrambleText";

type Cat = "power" | "gpio" | "comm" | "debug" | "special";

interface PinDef {
  label: string;
  cat: Cat;
  desc: string;
}

interface PinDetail {
  register: string;
  address: string;
  altFuncs: string[];
  type: string;
  voltage: string;
}

interface ExtComp {
  kind: "resistor" | "capacitor" | "led" | "header" | "pullup";
  value?: string;
  label?: string;
}

const LEFT_PINS: PinDef[] = [
  { label: "PA0", cat: "gpio", desc: "GPIO Port A, Pin 0" },
  { label: "PA1", cat: "gpio", desc: "GPIO Port A, Pin 1" },
  { label: "PA2", cat: "gpio", desc: "GPIO Port A, Pin 2" },
  { label: "PA3", cat: "gpio", desc: "GPIO Port A, Pin 3" },
  { label: "SCK", cat: "comm", desc: "SPI Serial Clock" },
  { label: "MOSI", cat: "comm", desc: "SPI Master Out" },
  { label: "MISO", cat: "comm", desc: "SPI Master In" },
  { label: "ADC0", cat: "special", desc: "Analog-to-Digital Ch0" },
  { label: "BOOT", cat: "special", desc: "Boot Mode Select" },
  { label: "GND", cat: "power", desc: "Ground (0V)" },
];

const RIGHT_PINS: PinDef[] = [
  { label: "VCC", cat: "power", desc: "3.3V Power Supply" },
  { label: "NRST", cat: "special", desc: "System Reset (active low)" },
  { label: "SWDIO", cat: "debug", desc: "Serial Wire Debug I/O" },
  { label: "SWCLK", cat: "debug", desc: "Serial Wire Debug Clock" },
  { label: "TX", cat: "comm", desc: "UART Transmit" },
  { label: "RX", cat: "comm", desc: "UART Receive" },
  { label: "SDA", cat: "comm", desc: "I\u00B2C Data Line" },
  { label: "SCL", cat: "comm", desc: "I\u00B2C Clock Line" },
  { label: "TIM1", cat: "special", desc: "Timer / PWM Output" },
  { label: "LED", cat: "gpio", desc: "User LED (PB5)" },
];

const COLORS: Record<Cat, string> = {
  power: "#ff6b6b",
  gpio: "#00ff41",
  comm: "#00d4ff",
  debug: "#a855f7",
  special: "#febc2e",
};

const CAT_LABELS: Record<Cat, string> = {
  power: "Power",
  gpio: "GPIO",
  comm: "Comms",
  debug: "Debug",
  special: "System",
};

const BAR_ANIM: Record<string, string> = {
  VCC: "chip-power-pulse",
  GND: "chip-power-pulse",
  LED: "chip-led-blink",
};

const BAR_DELAY: Record<string, string> = {
  VCC: "0s",
  GND: "0.5s",
  LED: "0s",
};

const PIN_DETAILS: Record<string, PinDetail> = {
  PA0: { register: "GPIOA->ODR", address: "0x40020014", altFuncs: ["TIM2_CH1", "TIM5_CH1"], type: "Push-pull / Open-drain", voltage: "3.3V, 25mA" },
  PA1: { register: "GPIOA->ODR", address: "0x40020014", altFuncs: ["TIM2_CH2", "TIM5_CH2"], type: "Push-pull / Open-drain", voltage: "3.3V, 25mA" },
  PA2: { register: "GPIOA->ODR", address: "0x40020014", altFuncs: ["TIM2_CH3", "USART2_TX"], type: "Push-pull / Open-drain", voltage: "3.3V, 25mA" },
  PA3: { register: "GPIOA->ODR", address: "0x40020014", altFuncs: ["TIM2_CH4", "USART2_RX"], type: "Push-pull / Open-drain", voltage: "3.3V, 25mA" },
  SCK: { register: "GPIOA->AFR[0]", address: "0x40020020", altFuncs: ["AF5=SPI1_SCK", "AF6=SPI3_SCK"], type: "Push-pull", voltage: "3.3V, 50MHz" },
  MOSI: { register: "GPIOA->AFR[0]", address: "0x40020020", altFuncs: ["AF5=SPI1_MOSI", "AF6=SPI3_MOSI"], type: "Push-pull", voltage: "3.3V, 50MHz" },
  MISO: { register: "GPIOA->AFR[0]", address: "0x40020020", altFuncs: ["AF5=SPI1_MISO", "AF6=SPI3_MISO"], type: "Input / Push-pull", voltage: "3.3V" },
  ADC0: { register: "ADC1->DR", address: "0x40012040", altFuncs: ["ADC1_IN0", "ADC2_IN0"], type: "Analog Input", voltage: "0\u20133.3V, 12-bit" },
  BOOT: { register: "SYSCFG->MEMRMP", address: "0x40013800", altFuncs: ["BOOT0"], type: "Input (pull-down)", voltage: "3.3V" },
  GND: { register: "\u2014", address: "\u2014", altFuncs: ["VSS"], type: "Power Ground", voltage: "0V" },
  VCC: { register: "\u2014", address: "\u2014", altFuncs: ["VDD"], type: "Power Supply", voltage: "3.3V \u00B1 10%" },
  NRST: { register: "RCC->CSR", address: "0x40023874", altFuncs: ["System Reset"], type: "Input (pull-up)", voltage: "3.3V" },
  SWDIO: { register: "GPIOA->AFR[1]", address: "0x40020024", altFuncs: ["AF0=SWD_IO", "JTMS"], type: "Bidirectional", voltage: "3.3V" },
  SWCLK: { register: "GPIOA->AFR[1]", address: "0x40020024", altFuncs: ["AF0=SWD_CLK", "JTCK"], type: "Input", voltage: "3.3V" },
  TX: { register: "USART1->DR", address: "0x40011004", altFuncs: ["AF7=USART1_TX", "AF8=USART6_TX"], type: "Push-pull", voltage: "3.3V" },
  RX: { register: "USART1->DR", address: "0x40011004", altFuncs: ["AF7=USART1_RX", "AF8=USART6_RX"], type: "Input (floating)", voltage: "3.3V" },
  SDA: { register: "GPIOB->AFR[0]", address: "0x40020420", altFuncs: ["AF4=I2C1_SDA", "AF9=I2C2_SDA"], type: "Open-drain", voltage: "3.3V" },
  SCL: { register: "GPIOB->AFR[0]", address: "0x40020420", altFuncs: ["AF4=I2C1_SCL", "AF9=I2C2_SCL"], type: "Open-drain", voltage: "3.3V" },
  TIM1: { register: "TIM1->CCR1", address: "0x40010034", altFuncs: ["AF1=TIM1_CH1", "AF3=TIM8_CH1"], type: "Push-pull", voltage: "3.3V, PWM" },
  LED: { register: "GPIOB->ODR", address: "0x40020414", altFuncs: ["GPIO Output"], type: "Push-pull", voltage: "3.3V, 330\u03A9" },
};

const PIN_COMPS: Record<string, ExtComp[]> = {
  LED: [{ kind: "resistor", value: "330\u03A9" }, { kind: "led" }],
  TX: [{ kind: "header", label: "UART" }],
  RX: [{ kind: "header", label: "UART" }],
  SDA: [{ kind: "pullup", value: "4.7k\u03A9" }],
  SCL: [{ kind: "pullup", value: "4.7k\u03A9" }],
  VCC: [{ kind: "capacitor", value: "100nF" }],
  SCK: [{ kind: "header", label: "SPI" }],
  MOSI: [{ kind: "header", label: "SPI" }],
  MISO: [{ kind: "header", label: "SPI" }],
};

interface FlowCfg {
  keyframe: string;
  duration: number;
  delay: number;
}

function getFlow(label: string, side: "left" | "right"): FlowCfg | null {
  const defs: Record<string, { dir: "out" | "in" | "clock"; dur: number; del: number }> = {
    SCK: { dir: "clock", dur: 0.6, del: 0 },
    MOSI: { dir: "out", dur: 1.6, del: 0.2 },
    MISO: { dir: "in", dur: 1.4, del: 0.5 },
    TX: { dir: "out", dur: 1.5, del: 0 },
    RX: { dir: "in", dur: 1.8, del: 0.3 },
    SDA: { dir: "out", dur: 2.0, del: 0.1 },
    SCL: { dir: "clock", dur: 0.8, del: 0 },
  };
  const d = defs[label];
  if (!d) return null;

  let kf: string;
  if (d.dir === "clock") {
    kf = side === "left" ? "chipDotRtoL" : "chipDotLtoR";
  } else if (d.dir === "out") {
    kf = side === "left" ? "chipDotRtoL" : "chipDotLtoR";
  } else {
    kf = side === "left" ? "chipDotLtoR" : "chipDotRtoL";
  }
  return { keyframe: kf, duration: d.dur, delay: d.del };
}

const MOUNTING_POSITIONS = [
  "top-3 left-3",
  "top-3 right-3",
  "bottom-3 left-3",
  "bottom-3 right-3",
];

export default function ChipPinout() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [hovered, setHovered] = useState<{ pin: PinDef; num: number } | null>(null);
  const [selected, setSelected] = useState<{ pin: PinDef; num: number } | null>(null);
  const [showComps, setShowComps] = useState(false);

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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const delay = setTimeout(() => {
      let n = 0;
      interval = setInterval(() => {
        n++;
        setLitCount(n);
        if (n >= 10 && interval) clearInterval(interval);
      }, 100);
    }, 400);
    return () => {
      clearTimeout(delay);
      if (interval) clearInterval(interval);
    };
  }, [visible]);

  const allLit = litCount >= 10;

  useEffect(() => {
    if (!allLit) return;
    const t = setTimeout(() => setShowComps(true), 600);
    return () => clearTimeout(t);
  }, [allLit]);

  const handlePinClick = (pin: PinDef, num: number) => {
    if (selected?.num === num) {
      setSelected(null);
    } else {
      setSelected({ pin, num });
    }
  };

  const renderComp = (c: ExtComp, color: string) => {
    switch (c.kind) {
      case "resistor":
        return (
          <span
            className="text-[7px] font-mono px-0.5 border"
            style={{ borderColor: `${color}25`, color: `${color}70` }}
          >
            {c.value}
          </span>
        );
      case "capacitor":
        return (
          <div className="flex items-center">
            <div className="w-[1px] h-2" style={{ backgroundColor: `${color}35` }} />
            <div className="w-[2px]" />
            <div className="w-[1px] h-2" style={{ backgroundColor: `${color}35` }} />
            <span className="text-[7px] font-mono ml-1" style={{ color: `${color}50` }}>
              {c.value}
            </span>
          </div>
        );
      case "led":
        return (
          <div
            className="w-2 h-2 rounded-full chip-led-indicator"
            style={{ backgroundColor: "#00ff41", "--pin-glow": "#00ff4180" } as React.CSSProperties}
          />
        );
      case "header":
        return (
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 border" style={{ borderColor: `${color}35` }} />
            {c.label && (
              <span className="text-[7px] font-mono" style={{ color: `${color}40` }}>
                {c.label}
              </span>
            )}
          </div>
        );
      case "pullup":
        return (
          <div className="flex items-center gap-0.5">
            <span
              className="text-[7px] font-mono px-0.5 border"
              style={{ borderColor: `${color}25`, color: `${color}60` }}
            >
              {c.value}
            </span>
            <span className="text-[7px] font-mono" style={{ color: "#ff6b6b40" }}>
              {"\u2191"}VCC
            </span>
          </div>
        );
    }
  };

  const renderPin = (pin: PinDef, idx: number, side: "left" | "right") => {
    const lit = idx < litCount;
    const color = COLORS[pin.cat];
    const num = side === "left" ? idx + 1 : 20 - idx;
    const isSelected = selected?.num === num;
    const barAnim = allLit ? BAR_ANIM[pin.label] || "" : "";
    const barDelay = BAR_DELAY[pin.label] || "0s";
    const flow = getFlow(pin.label, side);
    const comps = PIN_COMPS[pin.label];

    const labelEl = (
      <span
        className={`font-mono text-[10px] tracking-wider transition-all duration-300 shrink-0 ${
          side === "left" ? "text-right w-11" : "text-left w-11"
        }`}
        style={{
          color: lit ? (isSelected ? "#fff" : color) : "transparent",
          textShadow: isSelected
            ? `0 0 12px ${color}60`
            : lit
              ? `0 0 8px ${color}25`
              : "none",
        }}
      >
        {pin.label}
      </span>
    );

    const numberEl = (
      <span
        className={`font-mono text-[8px] shrink-0 transition-all duration-300 ${
          side === "left" ? "text-right w-3 mr-1" : "text-left w-3 ml-1"
        }`}
        style={{ color: lit ? (isSelected ? "#666" : "#333") : "transparent" }}
      >
        {num}
      </span>
    );

    // Metallic pin leg touching chip body
    const pinLeg = (
      <div
        className="w-[4px] h-[10px] shrink-0 transition-all duration-500"
        style={{
          background: lit
            ? "linear-gradient(180deg, #c8c8c8 0%, #999 40%, #888 60%, #bbb 100%)"
            : "#1a1a1a",
          boxShadow: lit ? "0 0 2px rgba(200,200,200,0.15)" : "none",
          transitionDelay: `${idx * 80}ms`,
        }}
      />
    );

    // PCB trace — flex-1 so it always reaches the pin leg
    const traceEl = (
      <div
        className={`relative h-[2px] shrink-0 transition-all duration-500 min-w-6 flex-1 ${barAnim}`}
        style={
          {
            backgroundColor: lit ? color : "#1a1a1a",
            boxShadow: lit
              ? isSelected
                ? `0 0 8px ${color}80, 0 0 16px ${color}40`
                : `0 0 4px ${color}40`
              : "none",
            transitionDelay: `${idx * 80}ms`,
            "--pin-glow": `${color}70`,
            animationDelay: barDelay,
          } as React.CSSProperties
        }
      >
        {allLit && flow && (
          <div
            className="absolute w-1.5 h-1.5 rounded-full -top-[2px]"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}, 0 0 8px ${color}80`,
              animation: `${flow.keyframe} ${flow.duration}s ease-in-out infinite`,
              animationDelay: `${flow.delay}s`,
            }}
          />
        )}
      </div>
    );

    const compTrace =
      showComps && comps ? (
        <div
          className="flex items-center shrink-0 transition-all duration-500"
          style={{ opacity: 0.7 }}
        >
          <div className="w-3 h-[1px]" style={{ backgroundColor: `${color}30` }} />
          {comps.map((c, ci) => (
            <div key={ci} className="flex items-center gap-0.5">
              {ci > 0 && (
                <div className="w-2 h-[1px]" style={{ backgroundColor: `${color}30` }} />
              )}
              {renderComp(c, color)}
            </div>
          ))}
        </div>
      ) : null;

    return (
      <div
        key={idx}
        className={`flex items-center h-[28px] cursor-pointer transition-all duration-200 ${
          isSelected ? "bg-white/[0.02] rounded" : ""
        }`}
        onMouseEnter={() => setHovered({ pin, num })}
        onMouseLeave={() => setHovered(null)}
        onClick={() => handlePinClick(pin, num)}
      >
        {side === "left" ? (
          <>
            {compTrace}
            {labelEl}
            <div className="w-1.5 shrink-0" />
            {numberEl}
            {traceEl}
            {pinLeg}
          </>
        ) : (
          <>
            {pinLeg}
            {traceEl}
            {numberEl}
            <div className="w-1.5 shrink-0" />
            {labelEl}
            {compTrace}
          </>
        )}
      </div>
    );
  };

  const detail = selected ? PIN_DETAILS[selected.pin.label] : null;
  const detailColor = selected ? COLORS[selected.pin.cat] : "#00ff41";

  return (
    <section id="hardware" className="relative py-20 px-8">
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className="mb-16">
          <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
            // hardware
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
            style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
          >
            <ScrambleText text="The Chip" />
          </h2>
        </div>

        {/* Chip diagram */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          {/* PCB Board backdrop */}
          <div
            className="relative mx-auto max-w-2xl rounded-lg overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, #070e07 0%, #050905 50%, #040804 100%)",
              border: "1px solid #0d1a0d",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,255,65,0.02), inset 0 0 40px rgba(0,0,0,0.3)",
              padding: "28px 20px",
            }}
          >
            {/* PCB texture */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(0,255,65,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,255,65,0.02) 0%, transparent 50%)",
              }}
            />

            {/* Mounting holes */}
            {MOUNTING_POSITIONS.map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-2.5 h-2.5 rounded-full`}
                style={{
                  border: "1px solid #152515",
                  background:
                    "radial-gradient(circle, #020402 40%, #081208 100%)",
                  boxShadow: "inset 0 0 2px rgba(0,255,65,0.05)",
                }}
              />
            ))}

            {/* Silkscreen labels */}
            <span
              className="absolute top-3.5 left-8 font-mono text-[8px] select-none"
              style={{ color: "#15251a" }}
            >
              U1
            </span>
            <span
              className="absolute bottom-3.5 right-8 font-mono text-[7px] select-none"
              style={{ color: "#12201a" }}
            >
              MML-2024
            </span>

            {/* Chip layout */}
            <div className="flex justify-center relative">
              <div className="flex items-stretch">
                {/* Left pins */}
                <div className="flex flex-col justify-between py-3 -mr-[2px] relative z-10">
                  {LEFT_PINS.map((pin, i) => renderPin(pin, i, "left"))}
                </div>

                {/* Chip body */}
                <div
                  className="relative w-28 sm:w-36 rounded-[3px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #1f1f1f 0%, #171717 15%, #131313 50%, #0f0f0f 85%, #0c0c0c 100%)",
                    border: "2px solid #363636",
                    boxShadow: allLit
                      ? `
                        0 0 40px rgba(0,255,65,0.05),
                        0 6px 20px rgba(0,0,0,0.7),
                        inset 0 1px 0 rgba(255,255,255,0.08),
                        inset 0 -1px 0 rgba(0,0,0,0.5),
                        inset 0 0 30px rgba(0,0,0,0.4)
                      `
                      : `
                        0 6px 20px rgba(0,0,0,0.7),
                        inset 0 1px 0 rgba(255,255,255,0.08),
                        inset 0 -1px 0 rgba(0,0,0,0.5),
                        inset 0 0 30px rgba(0,0,0,0.4)
                      `,
                  }}
                >
                  {/* Epoxy texture */}
                  <div
                    className="absolute inset-0 rounded-[2px] pointer-events-none"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.006) 3px, rgba(255,255,255,0.006) 6px)",
                      opacity: 0.5,
                    }}
                  />

                  {/* Notch */}
                  <div
                    className="absolute top-[-2px] left-1/2 -translate-x-1/2 w-7 h-3.5 rounded-b-full z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% -20%, #1a1a1a 0%, #080808 100%)",
                      border: "2px solid #363636",
                      borderTop: "none",
                      boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.6)",
                    }}
                  />

                  {/* Pin 1 dot */}
                  <div
                    className="absolute top-6 left-3 w-2 h-2 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor:
                        litCount > 0 ? "#00ff41" : "#1a1a1a",
                      boxShadow:
                        litCount > 0
                          ? "0 0 6px #00ff4140, 0 0 12px #00ff4120, inset 0 0 2px rgba(255,255,255,0.15)"
                          : "none",
                    }}
                  />

                  {/* Die outline */}
                  <div
                    className="absolute inset-4 sm:inset-5 border border-dashed rounded-[1px] transition-all duration-1000 pointer-events-none"
                    style={{
                      borderColor: allLit
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.02)",
                    }}
                  />

                  {/* On-chip LED */}
                  <div
                    className={`absolute bottom-4 right-3 w-2 h-2 rounded-full transition-all duration-500 ${
                      allLit ? "chip-led-indicator" : ""
                    }`}
                    style={
                      {
                        backgroundColor: allLit ? "#00ff41" : "#1a1a1a",
                        boxShadow: allLit
                          ? "0 0 4px #00ff4140"
                          : "none",
                        "--pin-glow": "#00ff4180",
                      } as React.CSSProperties
                    }
                  />

                  {/* IC markings */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                    <span
                      className="font-mono text-base sm:text-lg font-bold tracking-[0.35em] transition-all duration-1000"
                      style={{
                        color: allLit ? "#00ff41" : "#161616",
                        textShadow: allLit
                          ? "0 0 15px #00ff4120, 0 0 30px #00ff4108"
                          : "none",
                      }}
                    >
                      MML
                    </span>
                    <span
                      className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] mt-1 transition-all duration-1000"
                      style={{
                        color: allLit ? "#555" : "#181818",
                      }}
                    >
                      ARM-F446RE
                    </span>
                    <span
                      className="font-mono text-[7px] tracking-[0.15em] mt-0.5 transition-all duration-1000"
                      style={{
                        color: allLit ? "#2a2a2a" : "#151515",
                      }}
                    >
                      REV.B 2024
                    </span>
                  </div>
                </div>

                {/* Right pins */}
                <div className="flex flex-col justify-between py-3 -ml-[2px] relative z-10">
                  {RIGHT_PINS.map((pin, i) => renderPin(pin, i, "right"))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && detail && (
          <div
            className="mt-8 max-w-sm mx-auto border bg-[#0d0d0d]/90 p-4 rounded-sm transition-all duration-300"
            style={{
              borderColor: `${detailColor}20`,
              boxShadow: `0 0 20px ${detailColor}08`,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs">
                <span className="text-[#555]">PIN {selected.num}</span>
                <span className="ml-2" style={{ color: detailColor }}>
                  [{selected.pin.label}]
                </span>
                <span className="text-[#666] ml-2">
                  {selected.pin.desc}
                </span>
              </span>
              <button
                onClick={() => setSelected(null)}
                className="font-mono text-[10px] text-[#555] hover:text-[#00ff41] transition-colors cursor-pointer"
              >
                [x]
              </button>
            </div>
            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 font-mono text-[10px]">
              <span className="text-[#444]">Register</span>
              <span style={{ color: detailColor }}>{detail.register}</span>
              <span className="text-[#444]">Address</span>
              <span className="text-[#00ff41]/70">{detail.address}</span>
              <span className="text-[#444]">Alt Funcs</span>
              <span className="text-[#888]">
                {detail.altFuncs.join(", ")}
              </span>
              <span className="text-[#444]">Type</span>
              <span className="text-[#888]">{detail.type}</span>
              <span className="text-[#444]">Voltage</span>
              <span className="text-[#888]">{detail.voltage}</span>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div
          className="mt-8 text-center font-mono text-xs transition-all duration-500"
          style={{ opacity: allLit ? 1 : 0 }}
        >
          {!selected &&
            (hovered ? (
              <span>
                <span className="text-[#444]">
                  &gt; PIN {hovered.num}
                </span>
                <span
                  className="ml-2"
                  style={{ color: COLORS[hovered.pin.cat] }}
                >
                  [{hovered.pin.label}]
                </span>
                <span className="text-[#333] ml-2">::</span>
                <span className="text-[#666] ml-2">
                  {hovered.pin.desc}
                </span>
                <span className="text-[#333] ml-2">::</span>
                <span
                  className="ml-2 opacity-50"
                  style={{ color: COLORS[hovered.pin.cat] }}
                >
                  {CAT_LABELS[hovered.pin.cat]}
                </span>
              </span>
            ) : (
              <span className="text-[#333]">
                &gt; MML-ARM-F446RE :: 20 pins active ::{" "}
                <span className="text-[#00ff41]/40">READY</span>
                <span className="text-[#333] ml-2">
                  :: click a pin for details
                </span>
              </span>
            ))}
        </div>

        {/* Legend */}
        <div
          className="mt-4 flex justify-center gap-4 sm:gap-6 flex-wrap transition-all duration-700"
          style={{ opacity: allLit ? 0.5 : 0 }}
        >
          {(Object.keys(COLORS) as Cat[]).map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: COLORS[cat],
                  boxShadow: `0 0 3px ${COLORS[cat]}40`,
                }}
              />
              <span className="font-mono text-[10px] text-[#555]">
                {CAT_LABELS[cat]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
