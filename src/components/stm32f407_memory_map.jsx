"use client";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   COLORS — bus-consistent families + utility colors
   ══════════════════════════════════════════════════════════════════════════ */
const C = {
  // Top-level region colors
  code:   { bg:"#1a3a5c", border:"#2d6cb4", text:"#8ec5fc", hover:"#1e4a72", tint:"#1a3a5c15" },
  sram:   { bg:"#1a3c2a", border:"#2d8c4e", text:"#7ee8a8", hover:"#1e4c34", tint:"#1a3c2a15" },
  periph_hdr: { bg:"#4a2a1a", border:"#c46830", text:"#f4a870", hover:"#5a3420", tint:"#4a2a1a12" },
  ppb_hdr:{ bg:"#321a4a", border:"#7640b0", text:"#c49cf0", hover:"#3e2260", tint:"#321a4a15" },
  gray:   { bg:"#2a2a2e", border:"#555560", text:"#9090a0", hover:"#333338", tint:"#2a2a2e10" },
  dim:    { bg:"#1e1e22", border:"#333340", text:"#606070", hover:"#1e1e22", tint:"transparent" },
  // Flash / code internals
  flash:  { bg:"#152e4a", border:"#2564a0", text:"#74a8e0", hover:"#1a3652", tint:"#152e4a15" },
  vt:     { bg:"#2e1846", border:"#6a38a4", text:"#b88ae8", hover:"#381e54", tint:"#2e184615" },
  rom:    { bg:"#1a3838", border:"#2d8888", text:"#7ee0e0", hover:"#1e4646", tint:"#1a383815" },
  warn:   { bg:"#4a1a1a", border:"#c43030", text:"#f48080", hover:"#5a2020", tint:"#4a1a1a15" },
  // SRAM internals
  sram_i: { bg:"#163020", border:"#28803c", text:"#70d898", hover:"#1c3a28", tint:"#16302015" },
  ccm:    { bg:"#1a3535", border:"#2a8585", text:"#70d8d8", hover:"#1e4040", tint:"#1a353515" },
  data_s: { bg:"#38381a", border:"#a8a030", text:"#e0d870", hover:"#44441e", tint:"#38381a15" },
  bss_s:  { bg:"#3e2818", border:"#b87028", text:"#f0a860", hover:"#4a3020", tint:"#3e281815" },
  heap_s: { bg:"#381a28", border:"#a83870", text:"#e078b0", hover:"#441e32", tint:"#381a2815" },
  stack_s:{ bg:"#401818", border:"#b82828", text:"#f07070", hover:"#4c1e1e", tint:"#40181815" },
  // APB1 bus family — BLUE
  apb1:   { bg:"#162d48", border:"#2866a6", text:"#78aee6", hover:"#1a3550", tint:"#162d4814" },
  apb1_lt:{ bg:"#1a3350", border:"#3070b0", text:"#84b8f0", hover:"#1e3b58", tint:"#1a335014" },
  apb1_dk:{ bg:"#12253c", border:"#205a98", text:"#6ca0d8", hover:"#162d44", tint:"#12253c14" },
  // APB2 bus family — ROSE
  apb2:   { bg:"#381830", border:"#a63870", text:"#e27eb2", hover:"#421e38", tint:"#38183014" },
  apb2_lt:{ bg:"#3e1c34", border:"#b04078", text:"#e888ba", hover:"#482240", tint:"#3e1c3414" },
  apb2_dk:{ bg:"#30142a", border:"#983068", text:"#da74aa", hover:"#3a1a32", tint:"#30142a14" },
  // AHB1 bus family — AMBER
  ahb1:   { bg:"#362610", border:"#b46e1e", text:"#eea454", hover:"#3e2e14", tint:"#36261014" },
  ahb1_lt:{ bg:"#3c2c16", border:"#bc7624", text:"#f4ac5c", hover:"#44341a", tint:"#3c2c1614" },
  ahb1_em:{ bg:"#402e10", border:"#c88020", text:"#f8b460", hover:"#483618", tint:"#402e1014" },
  // AHB2 bus family — TEAL
  ahb2:   { bg:"#142a30", border:"#1886a0", text:"#5ec6e0", hover:"#183238", tint:"#142a3014" },
  ahb2_lt:{ bg:"#182e34", border:"#208ea8", text:"#66cee8", hover:"#1c363c", tint:"#182e3414" },
  // PPB internals
  ppb:    { bg:"#2a1440", border:"#6434a0", text:"#b484e4", hover:"#341a4e", tint:"#2a144015" },
  scs:    { bg:"#3e1616", border:"#b02828", text:"#ec6c6c", hover:"#4a1c1c", tint:"#3e161615" },
  // Register row
  reg:    { bg:"#1a1a24", border:"#3a3a50", text:"#a8a8c0", hover:"#222230", tint:"#1a1a2410" },
};

const BUS_C = { "ICode + DCode":"#5588cc","System bus":"#cc8855",PPB:"#9966cc","D-bus":"#66aa66",AHB1:"#cc6666",AHB2:"#cc9966",APB1:"#6699cc",APB2:"#cc66aa" };

/* ══════════════════════════════════════════════════════════════════════════
   REGISTER DEFINITIONS
   ══════════════════════════════════════════════════════════════════════════ */
const GPIO_REGS = [
  { name:"MODER",   off:0x00, desc:"Pin mode: input/output/alternate/analog. 2 bits per pin." },
  { name:"OTYPER",  off:0x04, desc:"Output type: push-pull or open-drain." },
  { name:"OSPEEDR", off:0x08, desc:"Output speed: low/medium/fast/high." },
  { name:"PUPDR",   off:0x0C, desc:"Pull-up/pull-down config. 2 bits per pin." },
  { name:"IDR",     off:0x10, desc:"Input data register. Read-only. Current pin states." },
  { name:"ODR",     off:0x14, desc:"Output data register. Write to set pin high/low." },
  { name:"BSRR",    off:0x18, desc:"Bit set/reset. Atomic — no read-modify-write needed." },
  { name:"LCKR",    off:0x1C, desc:"Lock register. Locks pin configuration." },
  { name:"AFRL",    off:0x20, desc:"Alternate function low (pins 0–7). 4 bits per pin." },
  { name:"AFRH",    off:0x24, desc:"Alternate function high (pins 8–15). 4 bits per pin." },
];
const RCC_REGS = [
  { name:"CR",       off:0x00, desc:"Clock control. Enable/disable HSI, HSE, PLL." },
  { name:"PLLCFGR",  off:0x04, desc:"PLL configuration." },
  { name:"CFGR",     off:0x08, desc:"Clock config. System clock switch, prescalers." },
  { name:"AHB1RSTR", off:0x10, desc:"AHB1 peripheral reset register." },
  { name:"AHB1ENR",  off:0x30, desc:"AHB1 clock enable. Bit 0=GPIOA, 1=B, 2=C, 3=D…" },
  { name:"AHB2ENR",  off:0x34, desc:"AHB2 peripheral clock enable." },
  { name:"APB1ENR",  off:0x40, desc:"APB1 clock enable." },
  { name:"APB2ENR",  off:0x44, desc:"APB2 clock enable." },
];
const EXTI_REGS = [
  { name:"IMR",  off:0x00, desc:"Interrupt mask. Enable/disable EXTI lines." },
  { name:"RTSR", off:0x08, desc:"Rising trigger selection." },
  { name:"FTSR", off:0x0C, desc:"Falling trigger selection." },
  { name:"PR",   off:0x14, desc:"Pending register. Write 1 to clear pending interrupt." },
];
const SYSCFG_REGS = [
  { name:"EXTICR1", off:0x08, desc:"EXTI line 0–3 source selection (which port)." },
  { name:"EXTICR2", off:0x0C, desc:"EXTI line 4–7 source selection." },
  { name:"EXTICR3", off:0x10, desc:"EXTI line 8–11 source selection." },
  { name:"EXTICR4", off:0x14, desc:"EXTI line 12–15 source selection." },
];

// TIM2–TIM5 general-purpose timer registers (RM0090 Table 101, Section 18.4)
const TIM_GP_REGS = [
  { name:"CR1",   off:0x00, desc:"Control reg 1. CEN (enable), DIR (direction), CMS (center-aligned), ARPE (preload)." },
  { name:"CR2",   off:0x04, desc:"Control reg 2. MMS (master mode select for TRGO), TI1S, CCDS." },
  { name:"SMCR",  off:0x08, desc:"Slave mode control. SMS (slave mode), TS (trigger select), ETR config." },
  { name:"DIER",  off:0x0C, desc:"DMA/interrupt enable. UIE (update), CC1IE–CC4IE, TIE, UDE, CCxDE." },
  { name:"SR",    off:0x10, desc:"Status register. UIF (update), CC1IF–CC4IF, TIF, CC1OF–CC4OF." },
  { name:"EGR",   off:0x14, desc:"Event generation. UG (force update), CC1G–CC4G, TG." },
  { name:"CCMR1", off:0x18, desc:"Capture/compare mode 1. OC1M/OC2M (output mode) or IC1F/IC2F (input filter)." },
  { name:"CCMR2", off:0x1C, desc:"Capture/compare mode 2. OC3M/OC4M or IC3F/IC4F." },
  { name:"CCER",  off:0x20, desc:"Capture/compare enable. CC1E–CC4E (enable), CC1P–CC4P (polarity)." },
  { name:"CNT",   off:0x24, desc:"Counter value. 32-bit for TIM2/TIM5, 16-bit for TIM3/TIM4." },
  { name:"PSC",   off:0x28, desc:"Prescaler. Divides clock by (PSC+1). 16-bit, so 1 to 65536." },
  { name:"ARR",   off:0x2C, desc:"Auto-reload. Counter resets/wraps when it reaches this value." },
  { name:"CCR1",  off:0x34, desc:"Capture/compare 1. Compare value for OC1 or captured value from IC1." },
  { name:"CCR2",  off:0x38, desc:"Capture/compare 2." },
  { name:"CCR3",  off:0x3C, desc:"Capture/compare 3." },
  { name:"CCR4",  off:0x40, desc:"Capture/compare 4." },
  { name:"DCR",   off:0x48, desc:"DMA control. DBA (base addr) + DBL (burst length) for DMA burst mode." },
  { name:"DMAR",  off:0x4C, desc:"DMA address for full transfer. Access window into registers for DMA burst." },
];

// TIM1/TIM8 advanced-control timer registers (RM0090 Table 97, Section 17.4)
const TIM_ADV_REGS = [
  { name:"CR1",   off:0x00, desc:"Control reg 1. CEN, DIR, CMS, ARPE, CKD (clock division for filters)." },
  { name:"CR2",   off:0x04, desc:"Control reg 2. MMS, CCUS, CCPC, OIS1–OIS4 (idle state)." },
  { name:"SMCR",  off:0x08, desc:"Slave mode control. SMS, TS, ETR config. Same as GP timers." },
  { name:"DIER",  off:0x0C, desc:"DMA/interrupt enable. UIE, CC1IE–CC4IE, COMIE, TIE, BIE, UDE, CCxDE." },
  { name:"SR",    off:0x10, desc:"Status register. UIF, CC1IF–CC4IF, COMIF, TIF, BIF." },
  { name:"EGR",   off:0x14, desc:"Event generation. UG, CC1G–CC4G, COMG, TG, BG (break)." },
  { name:"CCMR1", off:0x18, desc:"Capture/compare mode 1. OC1M/OC2M or IC1F/IC2F." },
  { name:"CCMR2", off:0x1C, desc:"Capture/compare mode 2. OC3M/OC4M or IC3F/IC4F." },
  { name:"CCER",  off:0x20, desc:"Capture/compare enable. CC1E–CC4E, CC1NE–CC3NE (complementary), polarities." },
  { name:"CNT",   off:0x24, desc:"Counter value. 16-bit." },
  { name:"PSC",   off:0x28, desc:"Prescaler. Divides clock by (PSC+1)." },
  { name:"ARR",   off:0x2C, desc:"Auto-reload register." },
  { name:"RCR",   off:0x30, desc:"Repetition counter. Update event only every (RCR+1) overflows. For center-aligned PWM." },
  { name:"CCR1",  off:0x34, desc:"Capture/compare 1." },
  { name:"CCR2",  off:0x38, desc:"Capture/compare 2." },
  { name:"CCR3",  off:0x3C, desc:"Capture/compare 3." },
  { name:"CCR4",  off:0x40, desc:"Capture/compare 4." },
  { name:"BDTR",  off:0x44, desc:"Break and dead-time. MOE (main output enable), BKE (break enable), DTG (dead-time)." },
  { name:"DCR",   off:0x48, desc:"DMA control register." },
  { name:"DMAR",  off:0x4C, desc:"DMA address for full transfer." },
];

// TIM6/TIM7 basic timer registers (RM0090 Section 20.4)
const TIM_BASIC_REGS = [
  { name:"CR1",  off:0x00, desc:"Control reg 1. CEN (enable), UDIS, URS, OPM (one-pulse), ARPE." },
  { name:"CR2",  off:0x04, desc:"Control reg 2. MMS (master mode: TRGO to DAC)." },
  { name:"DIER", off:0x0C, desc:"DMA/interrupt enable. UIE (update interrupt), UDE (update DMA)." },
  { name:"SR",   off:0x10, desc:"Status register. UIF (update interrupt flag)." },
  { name:"EGR",  off:0x14, desc:"Event generation. UG (force update event)." },
  { name:"CNT",  off:0x24, desc:"Counter value. 16-bit." },
  { name:"PSC",  off:0x28, desc:"Prescaler. Divides by (PSC+1)." },
  { name:"ARR",  off:0x2C, desc:"Auto-reload. Counter wraps at this value." },
];

// SPI registers (RM0090 Section 28.5)
const SPI_REGS = [
  { name:"CR1",    off:0x00, desc:"Control 1. CPHA, CPOL, MSTR (master), BR (baud rate), SPE (enable), LSBFIRST, SSI, SSM, DFF (8/16-bit)." },
  { name:"CR2",    off:0x04, desc:"Control 2. TXEIE, RXNEIE, ERRIE, SSOE, TXDMAEN, RXDMAEN." },
  { name:"SR",     off:0x08, desc:"Status. RXNE (rx not empty), TXE (tx empty), BSY (busy), OVR, MODF, CRCERR." },
  { name:"DR",     off:0x0C, desc:"Data register. Write to transmit, read to receive." },
  { name:"CRCPR",  off:0x10, desc:"CRC polynomial register." },
  { name:"RXCRCR", off:0x14, desc:"RX CRC register." },
  { name:"TXCRCR", off:0x18, desc:"TX CRC register." },
  { name:"I2SCFGR",off:0x1C, desc:"I2S configuration register." },
  { name:"I2SPR",  off:0x20, desc:"I2S prescaler register." },
];

// I2C registers (RM0090 Section 27.6)
const I2C_REGS = [
  { name:"CR1",  off:0x00, desc:"Control 1. PE (enable), START, STOP, ACK, SWRST, POS." },
  { name:"CR2",  off:0x04, desc:"Control 2. FREQ (APB1 clock in MHz), ITERREN, ITEVTEN, ITBUFEN, DMAEN." },
  { name:"OAR1", off:0x08, desc:"Own address 1. 7-bit or 10-bit device address." },
  { name:"OAR2", off:0x0C, desc:"Own address 2. Dual addressing mode." },
  { name:"DR",   off:0x10, desc:"Data register. Write to transmit, read to receive." },
  { name:"SR1",  off:0x14, desc:"Status 1. SB (start), ADDR, BTF, TXE, RXNE, STOPF, AF (ack failure)." },
  { name:"SR2",  off:0x18, desc:"Status 2. MSL (master), BUSY, TRA (transmitter). Read after SR1 to clear ADDR." },
  { name:"CCR",  off:0x1C, desc:"Clock control. CCR value sets SCL frequency. F/S (standard/fast mode), DUTY." },
  { name:"TRISE",off:0x20, desc:"Rise time. Max SCL rise time in APB1 clock cycles + 1." },
];

// USART registers (RM0090 Section 30.6)
const USART_REGS = [
  { name:"SR",   off:0x00, desc:"Status. TXE (tx empty), TC (tx complete), RXNE (rx not empty), ORE, IDLE, PE, FE, NF." },
  { name:"DR",   off:0x04, desc:"Data register. Write to transmit, read to receive. 9 bits max." },
  { name:"BRR",  off:0x08, desc:"Baud rate register. DIV_Mantissa + DIV_Fraction. USARTDIV = fck / (8 × (2-OVER8) × baud)." },
  { name:"CR1",  off:0x0C, desc:"Control 1. UE (enable), M (word length), PCE (parity), TE, RE, TXEIE, RXNEIE, OVER8." },
  { name:"CR2",  off:0x10, desc:"Control 2. STOP (stop bits: 1, 0.5, 2, 1.5), CLKEN, CPOL, CPHA, LBDL." },
  { name:"CR3",  off:0x14, desc:"Control 3. DMAT (DMA tx), DMAR (DMA rx), CTSE, RTSE (HW flow ctrl), EIE, ONEBIT." },
  { name:"GTPR", off:0x18, desc:"Guard time and prescaler. For Smartcard and IrDA modes." },
];

// ADC registers (RM0090 Section 13.13) — per-ADC registers
const ADC_REGS = [
  { name:"SR",    off:0x00, desc:"Status. EOC (end of conversion), STRT, OVR (overrun), AWD (analog watchdog)." },
  { name:"CR1",   off:0x04, desc:"Control 1. RES (resolution 12/10/8/6), SCAN, AWDIE, EOCIE, JAWDEN, AWDEN." },
  { name:"CR2",   off:0x08, desc:"Control 2. ADON (enable), CONT, DMA, ALIGN, EXTEN/EXTSEL (trigger), SWSTART." },
  { name:"SMPR1", off:0x0C, desc:"Sample time reg 1. SMP10–SMP18. 3 bits each: 3/15/28/56/84/112/144/480 cycles." },
  { name:"SMPR2", off:0x10, desc:"Sample time reg 2. SMP0–SMP9." },
  { name:"JOFR1", off:0x14, desc:"Injected channel offset 1." },
  { name:"HTR",   off:0x24, desc:"Watchdog higher threshold." },
  { name:"LTR",   off:0x28, desc:"Watchdog lower threshold." },
  { name:"SQR1",  off:0x2C, desc:"Regular sequence reg 1. L (sequence length), SQ13–SQ16." },
  { name:"SQR2",  off:0x30, desc:"Regular sequence reg 2. SQ7–SQ12." },
  { name:"SQR3",  off:0x34, desc:"Regular sequence reg 3. SQ1–SQ6." },
  { name:"JSQR",  off:0x38, desc:"Injected sequence register." },
  { name:"JDR1",  off:0x3C, desc:"Injected data register 1." },
  { name:"DR",    off:0x4C, desc:"Regular data register. Conversion result." },
];

// DMA registers — per-stream (RM0090 Section 10.5)
// DMA has a global register block + per-stream registers. Show key globals + stream 0 as example.
const DMA_REGS = [
  { name:"LISR",   off:0x00, desc:"Low interrupt status. TCIF/HTIF/TEIF/DMEIF/FEIF for streams 0–3." },
  { name:"HISR",   off:0x04, desc:"High interrupt status. Same flags for streams 4–7." },
  { name:"LIFCR",  off:0x08, desc:"Low interrupt flag clear. Write 1 to clear flags for streams 0–3." },
  { name:"HIFCR",  off:0x0C, desc:"High interrupt flag clear. Write 1 to clear flags for streams 4–7." },
  { name:"S0CR",   off:0x10, desc:"Stream 0 config. EN, DIR, CIRC, MINC, PINC, MSIZE, PSIZE, PL (priority), CHSEL." },
  { name:"S0NDTR", off:0x14, desc:"Stream 0 number of data. Items to transfer. Decrements each transfer." },
  { name:"S0PAR",  off:0x18, desc:"Stream 0 peripheral address." },
  { name:"S0M0AR", off:0x1C, desc:"Stream 0 memory 0 address." },
  { name:"S0M1AR", off:0x20, desc:"Stream 0 memory 1 address (double-buffer mode)." },
  { name:"S0FCR",  off:0x24, desc:"Stream 0 FIFO control. FTH (threshold), DMDIS (direct mode disable), FS (FIFO status)." },
];

// DAC registers (RM0090 Section 14.5)
const DAC_REGS = [
  { name:"CR",      off:0x00, desc:"Control. EN1/EN2 (enable), TEN1/TEN2 (trigger enable), TSEL (trigger select), WAVE, MAMP." },
  { name:"SWTRIGR", off:0x04, desc:"Software trigger. SWTRIG1/2." },
  { name:"DHR12R1", off:0x08, desc:"Channel 1 12-bit right-aligned data." },
  { name:"DHR12L1", off:0x0C, desc:"Channel 1 12-bit left-aligned data." },
  { name:"DHR8R1",  off:0x10, desc:"Channel 1 8-bit right-aligned data." },
  { name:"DHR12R2", off:0x14, desc:"Channel 2 12-bit right-aligned data." },
  { name:"DOR1",    off:0x2C, desc:"Channel 1 data output. Read-only. Current DAC output value." },
  { name:"DOR2",    off:0x30, desc:"Channel 2 data output." },
  { name:"SR",      off:0x34, desc:"Status register. DMAUDR1/2 (DMA underrun)." },
];

// PWR registers (RM0090 Section 5.5)
const PWR_REGS = [
  { name:"CR",  off:0x00, desc:"Power control. VOS (voltage scaling), FPDS, DBP (backup domain write), PLS (PVD level), PVDE." },
  { name:"CSR", off:0x04, desc:"Power control/status. PVDO, SBF (standby flag), WUF (wakeup flag), BRE, EWUP." },
];
const SCS_REGS = [
  { name:"ICTR",    off:0x004, desc:"Interrupt Controller Type. Read-only. Number of interrupt lines." },
  { name:"STCSR",   off:0x010, desc:"SysTick Control and Status Register." },
  { name:"STRVR",   off:0x014, desc:"SysTick Reload Value Register." },
  { name:"STCVR",   off:0x018, desc:"SysTick Current Value Register." },
  { name:"STCR",    off:0x01C, desc:"SysTick Calibration Value Register." },
  { name:"ISER0",   off:0x100, desc:"Interrupt Set-Enable Register 0. Write 1 to enable IRQs 0–31." },
  { name:"ISER1",   off:0x104, desc:"Interrupt Set-Enable Register 1. IRQs 32–63." },
  { name:"ISER2",   off:0x108, desc:"Interrupt Set-Enable Register 2. IRQs 64–81." },
  { name:"ICER0",   off:0x180, desc:"Interrupt Clear-Enable Register 0. Write 1 to disable IRQs 0–31." },
  { name:"ICER1",   off:0x184, desc:"Interrupt Clear-Enable Register 1. IRQs 32–63." },
  { name:"ICER2",   off:0x188, desc:"Interrupt Clear-Enable Register 2. IRQs 64–81." },
  { name:"ISPR0",   off:0x200, desc:"Interrupt Set-Pending Register 0." },
  { name:"ICPR0",   off:0x280, desc:"Interrupt Clear-Pending Register 0." },
  { name:"IABR0",   off:0x300, desc:"Interrupt Active Bit Register 0. Read-only." },
  { name:"IPR0",    off:0x400, desc:"Interrupt Priority Register 0. 8 bits per IRQ (only top 4 used)." },
  { name:"CPUID",   off:0xD00, desc:"CPUID Base Register. Read-only. Identifies the processor." },
  { name:"ICSR",    off:0xD04, desc:"Interrupt Control and State. Pending exception info, NMI/PendSV triggers." },
  { name:"VTOR",    off:0xD08, desc:"Vector Table Offset Register. Relocate the vector table." },
  { name:"AIRCR",   off:0xD0C, desc:"Application Interrupt and Reset Control. Priority grouping, system reset." },
  { name:"SCR",     off:0xD10, desc:"System Control Register. Sleep modes (WFI/WFE behavior)." },
  { name:"CCR",     off:0xD14, desc:"Configuration and Control. Stack alignment, div-by-zero trap." },
  { name:"SHPR1",   off:0xD18, desc:"System Handler Priority Register 1. MemManage, BusFault, UsageFault." },
  { name:"SHPR2",   off:0xD1C, desc:"System Handler Priority Register 2. SVCall." },
  { name:"SHPR3",   off:0xD20, desc:"System Handler Priority Register 3. PendSV, SysTick." },
  { name:"SHCSR",   off:0xD24, desc:"System Handler Control and State. Enable/pending fault handlers." },
  { name:"CFSR",    off:0xD28, desc:"Configurable Fault Status. Combines MemManage + BusFault + UsageFault." },
  { name:"HFSR",    off:0xD2C, desc:"HardFault Status Register." },
  { name:"MMAR",    off:0xD34, desc:"MemManage Fault Address Register." },
  { name:"BFAR",    off:0xD38, desc:"BusFault Address Register." },
  { name:"AFSR",    off:0xD3C, desc:"Auxiliary Fault Status Register." },
  { name:"CPACR",   off:0xD88, desc:"Coprocessor Access Control. Enable FPU (bits 20–23)." },
  { name:"DEMCR",   off:0xDFC, desc:"Debug Exception and Monitor Control. Bit 24 (TRCENA) = master trace enable." },
  { name:"STIR",    off:0xF00, desc:"Software Trigger Interrupt Register. Write IRQ number to trigger it." },
];

const hex = (n) => "0x" + n.toString(16).toUpperCase().padStart(8,"0");
const hex4 = (n) => "0x" + n.toString(16).toUpperCase().padStart(2,"0");

/* ══════════════════════════════════════════════════════════════════════════
   DATA TREE — unique IDs, bus-consistent colors, registers, clock, disc
   ══════════════════════════════════════════════════════════════════════════ */
const DATA = {
  root: [
    { id:"code", name:"Code Region", addr:"0x00000000–0x1FFFFFFF", size:"512 MB", color:"code", bus:"ICode + DCode", desc:"Flash, boot ROM, vector table", children:"code" },
    { id:"sram", name:"SRAM Region", addr:"0x20000000–0x3FFFFFFF", size:"512 MB", color:"sram", bus:"System bus", desc:"Working memory, stack, heap, variables", children:"sram" },
    { id:"periph", name:"Peripheral Region", addr:"0x40000000–0x5FFFFFFF", size:"512 MB", color:"periph_hdr", bus:"System bus", xn:true, desc:"GPIO, timers, UART, SPI, I2C, ADC…", children:"periph" },
    { id:"extram", name:"External RAM", addr:"0x60000000–0x9FFFFFFF", size:"1 GB", color:"gray", bus:"System bus", desc:"Nothing connected on Discovery board" },
    { id:"extdev", name:"External Device", addr:"0xA0000000–0xDFFFFFFF", size:"1 GB", color:"gray", bus:"System bus", xn:true, desc:"Nothing connected on Discovery board" },
    { id:"ppb", name:"Private Peripheral Bus", addr:"0xE0000000–0xE00FFFFF", size:"1 MB", color:"ppb_hdr", bus:"PPB", xn:true, desc:"ARM debug/trace: NVIC, SysTick, ITM, DWT", children:"ppb" },
    { id:"vendor", name:"Vendor-specific", addr:"0xE0100000–0xFFFFFFFF", size:"511 MB", color:"gray", bus:"System bus", desc:"Not used" },
  ],
  code: [
    { id:"code.alias", name:"Aliased to Flash", addr:"0x00000000–0x0007FFFF", size:"512 KB", color:"flash", desc:"Mirror of Flash at 0x08000000. Processor reads here on reset.", children:"flash" },
    { id:"code.gap1", name:"Reserved", addr:"0x00080000–0x07FFFFFF", size:"~128 MB", color:"dim" },
    { id:"code.flash", name:"Flash Memory", addr:"0x08000000–0x080FFFFF", size:"1 MB", color:"flash", desc:"Where your program lives. Non-volatile.", children:"flash" },
    { id:"code.gap2a", name:"Reserved", addr:"0x08100000–0x0FFFFFFF", color:"dim" },
    { id:"code.ccm", name:"CCM RAM (mapped here by ST)", addr:"0x10000000–0x1000FFFF", size:"64 KB", color:"ccm", desc:"Address 0x10000000 is technically in the Code region of the ARM memory map, but it's physical RAM. ST placed it here for direct D-bus access with zero wait states. CPU-only — not accessible by DMA." },
    { id:"code.gap2b", name:"Reserved", addr:"0x10010000–0x1FFEFFFF", color:"dim" },
    { id:"code.sysmem", name:"System Memory (ROM)", addr:"0x1FFF0000–0x1FFF7A0F", size:"~31 KB", color:"rom", desc:"Factory bootloader for UART/USB programming. Cannot be erased." },
    { id:"code.opt", name:"Option Bytes", addr:"0x1FFFC000–0x1FFFC00F", size:"16 B", color:"warn", desc:"⚠️ Read Protection Level 2 permanently bricks the chip for development." },
  ],
  flash: [
    { id:"flash.vt", name:"Vector Table", addr:"0x08000000+", size:"~400 B", color:"vt", desc:"Exception/interrupt handler addresses. First thing in Flash.", children:"vt" },
    { id:"flash.text", name:".text (Code)", addr:"after vector table", size:"varies", color:"flash", desc:"Compiled C code — main(), functions, startup. Via ICode bus." },
    { id:"flash.rodata", name:".rodata (Read-Only Data)", addr:"after .text", size:"varies", color:"rom", desc:"String literals, const variables. Via DCode bus." },
    { id:"flash.datainit", name:".data Initial Values", addr:"after .rodata", size:"varies", color:"data_s", desc:"Initial values for initialized globals. Copied to SRAM by Reset Handler." },
    { id:"flash.litpool", name:"Literal Pools", addr:"scattered in .text", size:"varies", color:"gray", desc:"Large constants near functions. Debugger misinterprets as garbage instructions." },
  ],
  vt: [
    { id:"vt.0", name:"Entry 0: Initial SP Value", addr:"0x08000000", size:"4 B", color:"sram_i", desc:"THE ODD ONE OUT — data (an address), not a handler. Loaded into MSP at reset." },
    { id:"vt.1", name:"Entry 1: Reset Handler", addr:"0x08000004", size:"4 B", color:"warn", desc:"First code. copy .data → SRAM, zero .bss, call __libc_init_array(), call main()." },
    { id:"vt.2", name:"Entry 2: NMI Handler", addr:"0x08000008", size:"4 B", color:"vt", desc:"Priority -2 (fixed). Connected to Clock Security System." },
    { id:"vt.3", name:"Entry 3: HardFault Handler", addr:"0x0800000C", size:"4 B", color:"vt", desc:"Priority -1 (fixed). Fires on illegal operations." },
    { id:"vt.415", name:"Entries 4–15: System Exceptions", addr:"0x08000010–0x0800003C", size:"48 B", color:"vt", desc:"MemManage, BusFault, UsageFault, SVCall, PendSV, SysTick…" },
    { id:"vt.16", name:"Entry 16+: IRQ Handlers", addr:"0x08000040+", size:"varies", color:"periph_hdr", desc:"IRQ0=WWDG, IRQ1=PVD… exception number = IRQ + 16" },
  ],
  sram: [
    { id:"sram.bb", name:"Bit-band Region (Actual SRAM)", addr:"0x20000000–0x200FFFFF", size:"1 MB", color:"sram_i", desc:"Your actual SRAM (192 KB) lives here.", children:"sram_layout" },
    { id:"sram.gap1", name:"Unused", addr:"0x20100000–0x21FFFFFF", size:"~31 MB", color:"dim" },
    { id:"sram.alias", name:"Bit-band Alias", addr:"0x22000000–0x23FFFFFF", size:"32 MB", color:"rom", desc:"Each bit → 4-byte alias. 1 MB × 8 × 4 = 32 MB. Write 1/0 to set/clear bit atomically." },
    { id:"sram.gap2", name:"Unused", addr:"0x24000000–0x3FFFFFFF", size:"~480 MB", color:"dim" },
  ],
  sram_layout: [
    { id:"sraml.ccm", name:"CCM (Core Coupled Memory)", addr:"0x10000000–0x1000FFFF", size:"64 KB", color:"ccm", desc:"Address 0x10000000 is technically in the Code region of the ARM memory map, but it's physical RAM. ST placed it here for direct D-bus access with zero wait states. CPU-only — not accessible by DMA." },
    { id:"sraml.main", name:"Main SRAM (SRAM1+SRAM2)", addr:"0x20000000–0x2001FFFF", size:"128 KB", color:"sram_i", desc:"112 KB + 16 KB. Runtime layout inside ↓", children:"sram_runtime" },
  ],
  sram_runtime: [
    { id:"sr.data", name:".data Section", addr:"0x20000000 (bottom)", size:"varies", color:"data_s", desc:"Initialized globals. Copied from Flash by Reset Handler." },
    { id:"sr.bss", name:".bss Section", addr:"after .data", size:"varies", color:"bss_s", desc:"Uninitialized globals. Zeroed by Reset Handler." },
    { id:"sr.heap", name:"Heap ↓ grows UPWARD", addr:"after .bss", size:"varies", color:"heap_s", desc:"malloc() area. Avoided on bare metal." },
    { id:"sr.free", name:"── Free Space ──", addr:"", color:"dim" },
    { id:"sr.stack", name:"Stack ↑ grows DOWNWARD", addr:"→ 0x2001FFFF", size:"varies", color:"stack_s", desc:"Local vars, saved regs, return addrs. Full Descending." },
  ],
  periph: [
    { id:"p.apb1", name:"APB1 Peripherals", addr:"0x40000000–0x40007FFF", size:"42 MHz", color:"apb1", bus:"APB1", desc:"Timers, USART2/3, UART4/5, SPI2/3, I2C, CAN, DAC, PWR", children:"apb1" },
    { id:"p.apb2", name:"APB2 Peripherals", addr:"0x40010000–0x40016BFF", size:"84 MHz", color:"apb2", bus:"APB2", desc:"TIM1/8, USART1/6, ADC, SPI1/4, SYSCFG, EXTI", children:"apb2" },
    { id:"p.ahb1", name:"AHB1 Peripherals", addr:"0x40020000–0x4007FFFF", size:"168 MHz", color:"ahb1", bus:"AHB1", desc:"GPIO, RCC, DMA, Flash interface, Ethernet, USB HS", children:"ahb1" },
    { id:"p.ahb2", name:"AHB2 Peripherals", addr:"0x50000000–0x50060BFF", size:"168 MHz", color:"ahb2", bus:"AHB2", desc:"USB OTG FS, DCMI, CRYP, HASH, RNG", children:"ahb2" },
    { id:"p.ahb3", name:"AHB3", addr:"0xA0000000–0xA0000FFF", size:"168 MHz", color:"gray", desc:"FSMC controller. Nothing connected on Discovery board." },
    { id:"p.bbalias", name:"Peripheral Bit-band Alias", addr:"0x42000000–0x43FFFFFF", size:"32 MB", color:"rom", desc:"Bit-band alias for peripheral region. Same principle as SRAM bit-band." },
  ],
  ahb1: [
    { id:"ahb1.gpioa", name:"GPIOA", addr:"0x40020000–0x400203FF", size:"1 KB", color:"ahb1", baseAddr:0x40020000, registers:GPIO_REGS, clock:"AHB1ENR bit 0", disc:"PA0 = User button (B1)", desc:"Port A. 16 pins." },
    { id:"ahb1.gpiob", name:"GPIOB", addr:"0x40020400–0x400207FF", size:"1 KB", color:"ahb1", baseAddr:0x40020400, registers:GPIO_REGS, clock:"AHB1ENR bit 1", desc:"Port B. 16 pins." },
    { id:"ahb1.gpioc", name:"GPIOC", addr:"0x40020800–0x40020BFF", size:"1 KB", color:"ahb1", baseAddr:0x40020800, registers:GPIO_REGS, clock:"AHB1ENR bit 2", desc:"Port C. 16 pins." },
    { id:"ahb1.gpiod", name:"GPIOD", addr:"0x40020C00–0x40020FFF", size:"1 KB", color:"ahb1_lt", baseAddr:0x40020C00, registers:GPIO_REGS, clock:"AHB1ENR bit 3", disc:"PD12=green, PD13=orange, PD14=red, PD15=blue LED", desc:"Port D. Discovery board LEDs." },
    { id:"ahb1.gpioe", name:"GPIOE", addr:"0x40021000–0x400213FF", size:"1 KB", color:"ahb1", baseAddr:0x40021000, registers:GPIO_REGS, clock:"AHB1ENR bit 4", desc:"Port E. 16 pins." },
    { id:"ahb1.gpiofi", name:"GPIOF–GPIOI", addr:"0x40021400–0x400223FF", size:"4 KB", color:"gray", clock:"AHB1ENR bits 5–8", desc:"Ports F–I. Not all pins on Discovery board." },
    { id:"ahb1.rcc", name:"RCC", addr:"0x40023800–0x40023BFF", size:"1 KB", color:"ahb1_em", baseAddr:0x40023800, registers:RCC_REGS, desc:"Reset & Clock Control. Enable peripheral clocks here first." },
    { id:"ahb1.flashif", name:"Flash Interface", addr:"0x40023C00–0x40023FFF", size:"1 KB", color:"ahb1_lt", desc:"Flash access control, latency, erase/program." },
    { id:"ahb1.dma1", name:"DMA1", addr:"0x40026000–0x400263FF", size:"1 KB", color:"ahb1", baseAddr:0x40026000, registers:DMA_REGS, clock:"AHB1ENR bit 21", desc:"Direct Memory Access. Copies data without CPU. 8 streams, each with configurable channel." },
    { id:"ahb1.dma2", name:"DMA2", addr:"0x40026400–0x400267FF", size:"1 KB", color:"ahb1", baseAddr:0x40026400, registers:DMA_REGS, clock:"AHB1ENR bit 22", desc:"Second DMA controller. 8 streams." },
    { id:"ahb1.eth", name:"Ethernet MAC", addr:"0x40028000–0x400293FF", size:"5 KB", color:"gray", desc:"Ethernet controller." },
    { id:"ahb1.usbhs", name:"USB OTG HS", addr:"0x40040000–0x4007FFFF", size:"256 KB", color:"gray", desc:"USB 2.0 High-Speed." },
  ],
  apb1: [
    { id:"apb1.tim2", name:"TIM2", addr:"0x40000000–0x400003FF", size:"1 KB", color:"apb1", baseAddr:0x40000000, registers:TIM_GP_REGS, clock:"APB1ENR bit 0", desc:"32-bit general-purpose timer." },
    { id:"apb1.tim3", name:"TIM3", addr:"0x40000400–0x400007FF", size:"1 KB", color:"apb1", baseAddr:0x40000400, registers:TIM_GP_REGS, clock:"APB1ENR bit 1", desc:"16-bit general-purpose timer." },
    { id:"apb1.tim4", name:"TIM4", addr:"0x40000800–0x40000BFF", size:"1 KB", color:"apb1", baseAddr:0x40000800, registers:TIM_GP_REGS, clock:"APB1ENR bit 2", desc:"16-bit general-purpose timer." },
    { id:"apb1.tim5", name:"TIM5", addr:"0x40000C00–0x40000FFF", size:"1 KB", color:"apb1", baseAddr:0x40000C00, registers:TIM_GP_REGS, clock:"APB1ENR bit 3", desc:"32-bit general-purpose timer." },
    { id:"apb1.tim67", name:"TIM6, TIM7", addr:"0x40001000–0x400017FF", size:"2 KB", color:"apb1", baseAddr:0x40001000, registers:TIM_BASIC_REGS, clock:"APB1ENR bits 4–5", desc:"Basic timers (DAC trigger)." },
    { id:"apb1.tim121314", name:"TIM12, TIM13, TIM14", addr:"0x40001800–0x40002BFF", color:"apb1_dk", clock:"APB1ENR bits 6–8", desc:"16-bit general-purpose timers." },
    { id:"apb1.spi23", name:"SPI2/I2S2, SPI3/I2S3", addr:"0x40003800–0x40003FFF", size:"2 KB", color:"apb1_lt", baseAddr:0x40003800, registers:SPI_REGS, clock:"APB1ENR bits 14–15", desc:"Serial Peripheral Interface." },
    { id:"apb1.usart23", name:"USART2, USART3", addr:"0x40004400–0x40004BFF", size:"2 KB", color:"apb1_lt", baseAddr:0x40004400, registers:USART_REGS, clock:"APB1ENR bits 17–18", disc_usart2:"Available on Discovery header pins", desc:"USART." },
    { id:"apb1.uart45", name:"UART4, UART5", addr:"0x40004C00–0x400053FF", size:"2 KB", color:"apb1_lt", clock:"APB1ENR bits 19–20", desc:"Asynchronous-only UARTs." },
    { id:"apb1.i2c", name:"I2C1, I2C2, I2C3", addr:"0x40005400–0x40005FFF", color:"apb1_dk", baseAddr:0x40005400, registers:I2C_REGS, clock:"APB1ENR bits 21–23", disc:"I2C1 → onboard accelerometer", desc:"Inter-Integrated Circuit." },
    { id:"apb1.can", name:"CAN1, CAN2", addr:"0x40006400–0x40006BFF", size:"2 KB", color:"apb1_dk", clock:"APB1ENR bits 25–26", desc:"Controller Area Network." },
    { id:"apb1.pwr", name:"PWR", addr:"0x40007000–0x400073FF", size:"1 KB", color:"apb1_dk", baseAddr:0x40007000, registers:PWR_REGS, clock:"APB1ENR bit 28", desc:"Power controller." },
    { id:"apb1.dac", name:"DAC", addr:"0x40007400–0x400077FF", size:"1 KB", color:"apb1_lt", baseAddr:0x40007400, registers:DAC_REGS, clock:"APB1ENR bit 29", disc:"→ onboard CS43L22 audio codec", desc:"DAC. 2 channels, 12-bit." },
  ],
  apb2: [
    { id:"apb2.tim1", name:"TIM1", addr:"0x40010000–0x400103FF", size:"1 KB", color:"apb2", baseAddr:0x40010000, registers:TIM_ADV_REGS, clock:"APB2ENR bit 0", desc:"Advanced-control timer. PWM + complementary outputs." },
    { id:"apb2.tim8", name:"TIM8", addr:"0x40010400–0x400107FF", size:"1 KB", color:"apb2", baseAddr:0x40010400, registers:TIM_ADV_REGS, clock:"APB2ENR bit 1", desc:"Advanced-control timer." },
    { id:"apb2.usart16", name:"USART1, USART6", addr:"0x40011000–0x400117FF", size:"2 KB", color:"apb2_lt", baseAddr:0x40011000, registers:USART_REGS, clock:"APB2ENR bits 4–5", desc:"Fast USARTs on APB2." },
    { id:"apb2.adc", name:"ADC1, ADC2, ADC3", addr:"0x40012000–0x400123FF", size:"1 KB", color:"apb2_lt", baseAddr:0x40012000, registers:ADC_REGS, clock:"APB2ENR bits 8–10", desc:"12-bit ADC, up to 2.4 MSPS." },
    { id:"apb2.sdio", name:"SDIO", addr:"0x40012C00–0x40012FFF", size:"1 KB", color:"gray", clock:"APB2ENR bit 11", desc:"SD/MMC card interface." },
    { id:"apb2.spi14", name:"SPI1, SPI4", addr:"0x40013000–0x400137FF", size:"2 KB", color:"apb2_lt", baseAddr:0x40013000, registers:SPI_REGS, clock:"APB2ENR bits 12–13", disc:"SPI1 → onboard accelerometer", desc:"Fast SPI." },
    { id:"apb2.syscfg", name:"SYSCFG", addr:"0x40013800–0x40013BFF", size:"1 KB", color:"apb2_dk", baseAddr:0x40013800, registers:SYSCFG_REGS, clock:"APB2ENR bit 14", desc:"Memory remap, EXTI line mux." },
    { id:"apb2.exti", name:"EXTI", addr:"0x40013C00–0x40013FFF", size:"1 KB", color:"apb2_dk", baseAddr:0x40013C00, registers:EXTI_REGS, clock:"APB2ENR bit 14 (SYSCFG)", desc:"Extended Interrupts and Events." },
    { id:"apb2.tim91011", name:"TIM9, TIM10, TIM11", addr:"0x40014000–0x40014BFF", color:"apb2", clock:"APB2ENR bits 16–18", desc:"16-bit general-purpose timers." },
  ],
  ahb2: [
    { id:"ahb2.usbfs", name:"USB OTG FS", addr:"0x50000000–0x5003FFFF", size:"256 KB", color:"ahb2", desc:"USB 2.0 Full-Speed." },
    { id:"ahb2.dcmi", name:"DCMI", addr:"0x50050000–0x500503FF", size:"1 KB", color:"gray", desc:"Digital Camera Interface." },
    { id:"ahb2.cryp", name:"CRYP", addr:"0x50060000–0x500603FF", size:"1 KB", color:"ahb2_lt", desc:"AES, DES, TDES accelerator." },
    { id:"ahb2.hash", name:"HASH", addr:"0x50060400–0x500607FF", size:"1 KB", color:"ahb2_lt", desc:"MD5, SHA-1 processor." },
    { id:"ahb2.rng", name:"RNG", addr:"0x50060800–0x50060BFF", size:"1 KB", color:"ahb2_lt", desc:"True Random Number Generator." },
  ],
  ppb: [
    { id:"ppb.itm", name:"ITM", addr:"0xE0000000–0xE0000FFF", size:"4 KB", color:"ppb", baseAddr:0xE0000000, addrEnd:0xE0000FFF, desc:"Instrumentation Trace. printf over SWO." },
    { id:"ppb.dwt", name:"DWT", addr:"0xE0001000–0xE0001FFF", size:"4 KB", color:"ppb", baseAddr:0xE0001000, addrEnd:0xE0001FFF, desc:"Data Watchpoint and Trace. Cycle counter." },
    { id:"ppb.fpb", name:"FPB", addr:"0xE0002000–0xE0002FFF", size:"4 KB", color:"ppb", baseAddr:0xE0002000, addrEnd:0xE0002FFF, desc:"Flash Patch and Breakpoint. HW breakpoints." },
    { id:"ppb.gap", name:"Reserved", addr:"0xE0003000–0xE000DFFF", color:"dim" },
    { id:"ppb.scs", name:"SCS (System Control Space)", addr:"0xE000E000–0xE000EFFF", size:"4 KB", color:"scs", baseAddr:0xE000E000, addrEnd:0xE000EFFF, registers:SCS_REGS, desc:"NVIC, SysTick, SCB. DEMCR bit 24 = trace enable." },
    { id:"ppb.gap2", name:"Reserved", addr:"0xE000F000–0xE003FFFF", color:"dim" },
    { id:"ppb.tpiu", name:"TPIU", addr:"0xE0040000–0xE0040FFF", size:"4 KB", color:"ppb", baseAddr:0xE0040000, addrEnd:0xE0040FFF, desc:"Trace Port Interface. SWO output." },
  ],
};

const NOTES = {
  root:"The processor sees everything as addresses in one flat 4 GB space.",
  code:"512 MB: Flash, boot ROM, reset alias. Instructions via ICode, data via DCode.",
  flash:"Compiled program sections laid out by the linker.",
  vt:"All entries are data (addresses), not instructions. 4 bytes each.",
  sram:"512 MB window. Only 192 KB is real RAM on this chip.",
  sram_layout:"112 KB (SRAM1) + 16 KB (SRAM2) + 64 KB (CCM) = 192 KB. Full Descending stack.",
  sram_runtime:"128 KB main SRAM runtime layout. Stack grows DOWN, heap grows UP.",
  periph:"Peripheral → APBx → bridge → AHB1 → bus matrix → System bus → processor.",
  ahb1:"Each peripheral = 1 KB (0x400). Enable clocks in RCC first!",
  apb1:"Lowest-speed bus (42 MHz). Base 0x40000000 = Peripheral region base.",
  apb2:"84 MHz — double APB1. Advanced timers and fast peripherals.",
  ahb2:"USB Full-Speed, camera, crypto accelerators.",
  ppb:"ARM CoreSight debug via PPB — does NOT go through bus matrix.",
};

/* ══════════════════════════════════════════════════════════════════════════
   SEARCH HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
function findAllExpandable() {
  const ids = [];
  const walk = (gk) => {
    const blocks = DATA[gk]; if(!blocks) return;
    for(const b of blocks) {
      if(b.children && DATA[b.children]) { ids.push(b.id); walk(b.children); }
      if(b.registers || b.clock) ids.push(b.id);
    }
  };
  walk("root"); return ids;
}
const ALL_EXPANDABLE = findAllExpandable();

function parseAddrRange(addrStr) {
  if (!addrStr) return null;
  const parts = addrStr.replace(/\s/g,"").split("–");
  const start = parseInt(parts[0], 16);
  if (isNaN(start)) return null;
  if (parts.length > 1) {
    const end = parseInt(parts[1], 16);
    return isNaN(end) ? null : [start, end];
  }
  // Single address like "0x08000000" — treat as 4-byte entry
  return [start, start + 3];
}

function searchBlocks(query) {
  if (!query || query.length < 2) return { matches: new Set(), toExpand: new Set() };
  const q = query.toLowerCase();
  const matches = new Set();
  const toExpand = new Set();

  // Check if query is a hex address
  const isHexQuery = /^0?x?[0-9a-fA-F]{2,8}$/.test(q.replace(/^0x/i,"").length > 0 ? q : "");
  const queryAddr = parseInt(q.replace(/^0x/i,""), 16);
  const validAddr = isHexQuery && !isNaN(queryAddr) && q.replace(/^0x/i,"").length >= 2;

  const walk = (gk, ancestors) => {
    const blocks = DATA[gk]; if (!blocks) return;
    for (const b of blocks) {
      let matched = false;
      // Text match
      const searchText = `${b.name} ${b.addr||""} ${b.desc||""} ${b.clock||""} ${b.disc||""}`.toLowerCase();
      const regText = (b.registers||[]).map(r=>r.name).join(" ").toLowerCase();
      if (searchText.includes(q) || regText.includes(q)) matched = true;

      // Numeric address range match
      if (!matched && validAddr && b.addr) {
        const range = parseAddrRange(b.addr);
        if (range && queryAddr >= range[0] && queryAddr <= range[1]) matched = true;
      }
      // Also check against baseAddr + register offsets
      if (!matched && validAddr && b.baseAddr !== undefined) {
        const end = b.addrEnd !== undefined ? b.addrEnd : b.baseAddr + 0x3FF;
        if (queryAddr >= b.baseAddr && queryAddr <= end) matched = true;
      }

      if (matched) {
        matches.add(b.id);
        for (const a of ancestors) toExpand.add(a);
        // If address matches a specific register, expand this block too
        if (validAddr && b.registers && b.baseAddr !== undefined) {
          const offset = queryAddr - b.baseAddr;
          if (b.registers.some(r => r.off === offset)) toExpand.add(b.id);
        }
      }
      if (b.children && DATA[b.children]) walk(b.children, [...ancestors, b.id]);
    }
  };
  walk("root", []);
  return { matches, toExpand };
}

/* ══════════════════════════════════════════════════════════════════════════
   ADDRESS CALCULATOR HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
function buildAddrLookup() {
  const entries = [];
  const walk = (gk, region, bus) => {
    const blocks = DATA[gk]; if(!blocks) return;
    for (const b of blocks) {
      if (b.baseAddr !== undefined) {
        const end = b.addrEnd !== undefined ? b.addrEnd : b.baseAddr + 0x3FF;
        entries.push({ name:b.name, base:b.baseAddr, end, bus:bus||b.bus||"", region:region||"", registers:b.registers||[] });
      }
      if (b.children && DATA[b.children]) walk(b.children, region||b.name, bus||b.bus||"");
    }
  };
  walk("root","","");
  entries.sort((a,b) => a.base - b.base);
  return entries;
}
const ADDR_LOOKUP = buildAddrLookup();

function lookupAddress(addrNum) {
  // 1. Check peripherals first (most specific)
  for (const e of ADDR_LOOKUP) {
    if (addrNum >= e.base && addrNum <= e.end) {
      const offset = addrNum - e.base;
      const exactReg = e.registers.find(r => r.off === offset);
      return { region: e.region || regionName(addrNum), bus: e.bus || busName(addrNum), peripheral: e.name, offset, regName: exactReg ? exactReg.name : null };
    }
  }

  // 2. CCM
  if (addrNum >= 0x10000000 && addrNum <= 0x1000FFFF) {
    const off = addrNum - 0x10000000;
    return { region:"Code Region", bus:"D-bus", detail:`CCM (Core Coupled Memory). 64 KB. CPU-only via D-bus, zero wait states. Offset ${hex4(off)} from CCM base.` };
  }

  // 3. Flash
  if (addrNum >= 0x08000000 && addrNum <= 0x080FFFFF) {
    const off = addrNum - 0x08000000;
    let detail = `Flash memory. Offset ${hex4(off)} from Flash base.`;
    if (addrNum === 0x08000000) detail = "Flash base. Vector table entry 0 — Initial Stack Pointer value (data, not a handler).";
    else if (addrNum === 0x08000004) detail = "Vector table entry 1 — Reset Handler address. First code to execute.";
    else if (addrNum === 0x08000008) detail = "Vector table entry 2 — NMI Handler address.";
    else if (addrNum === 0x0800000C) detail = "Vector table entry 3 — HardFault Handler address.";
    else if (addrNum >= 0x08000010 && addrNum <= 0x0800003F) {
      const entry = Math.floor((addrNum - 0x08000000) / 4);
      detail = `Vector table entry ${entry} — system exception handler address.`;
    } else if (addrNum >= 0x08000040 && addrNum <= 0x080001FF) {
      const entry = Math.floor((addrNum - 0x08000000) / 4);
      const irq = entry - 16;
      detail = `Vector table entry ${entry} — IRQ${irq} handler address.`;
    } else {
      detail = `Flash. Program code and data. Offset ${hex4(off)} from base.`;
    }
    return { region:"Code Region", bus:"ICode + DCode", detail };
  }

  // 4. Flash alias
  if (addrNum >= 0x00000000 && addrNum <= 0x0007FFFF) {
    return { region:"Code Region", bus:"ICode + DCode", detail:`Aliased to Flash at ${hex(addrNum + 0x08000000)}. Processor reads here on reset.` };
  }

  // 5. SRAM
  if (addrNum >= 0x20000000 && addrNum <= 0x2001FFFF) {
    let block, blockBase;
    if (addrNum < 0x2001C000) { block = "SRAM1 (112 KB)"; blockBase = 0x20000000; }
    else { block = "SRAM2 (16 KB)"; blockBase = 0x2001C000; }
    const off = addrNum - blockBase;
    let extra = "";
    if (addrNum === 0x20000000) extra = " Start of .data section.";
    return { region:"SRAM Region", bus:"System bus", detail:`${block}. Offset ${hex4(off)} from ${hex(blockBase)}.${extra}` };
  }

  // 6. SRAM bit-band alias → reverse calculate
  if (addrNum >= 0x22000000 && addrNum <= 0x23FFFFFF) {
    const aliasOff = addrNum - 0x22000000;
    const byteOff = Math.floor(aliasOff / 32);
    const bitNum = Math.floor((aliasOff % 32) / 4);
    const realAddr = 0x20000000 + byteOff;
    return { region:"SRAM Region", bus:"System bus", detail:`SRAM bit-band alias. Maps to bit ${bitNum} of byte ${hex(realAddr)}.` };
  }

  // 7. Peripheral bit-band alias → reverse calculate
  if (addrNum >= 0x42000000 && addrNum <= 0x43FFFFFF) {
    const aliasOff = addrNum - 0x42000000;
    const byteOff = Math.floor(aliasOff / 32);
    const bitNum = Math.floor((aliasOff % 32) / 4);
    const realAddr = 0x40000000 + byteOff;
    // Try to identify which peripheral the real address belongs to
    let periphName = "";
    for (const e of ADDR_LOOKUP) {
      if (realAddr >= e.base && realAddr <= e.end) { periphName = ` (${e.name})`; break; }
    }
    return { region:"Peripheral Region", bus:"System bus", detail:`Peripheral bit-band alias. Maps to bit ${bitNum} of byte ${hex(realAddr)}${periphName}.` };
  }

  // 8. System Memory ROM
  if (addrNum >= 0x1FFF0000 && addrNum <= 0x1FFF7A0F) {
    return { region:"Code Region", bus:"ICode + DCode", detail:"System Memory (ROM). Factory bootloader for UART/USB programming." };
  }

  // 9. Option bytes
  if (addrNum >= 0x1FFFC000 && addrNum <= 0x1FFFC00F) {
    return { region:"Code Region", bus:"ICode + DCode", detail:"Option Bytes. Chip configuration. ⚠️ Read Protection Level 2 bricks the chip." };
  }

  // 10. Region-level fallback
  const r = regionName(addrNum);
  const b = busName(addrNum);
  // Known unused gaps
  const gaps = [
    [0x00080000, 0x07FFFFFF], [0x08100000, 0x0FFFFFFF], [0x10010000, 0x1FFEFFFF],
    [0x20020000, 0x21FFFFFF], [0x24000000, 0x3FFFFFFF],
    [0x60000000, 0x9FFFFFFF], [0xA0000000, 0xDFFFFFFF], [0xE0100000, 0xFFFFFFFF],
  ];
  for (const [s, e] of gaps) {
    if (addrNum >= s && addrNum <= e) {
      return { region: r, bus: b, detail:"Unused/reserved address. No memory or peripheral here. Accessing this would cause a BusFault." };
    }
  }
  return { region: r, bus: b, detail: null };
}

function regionName(a) {
  if(a<0x20000000) return "Code Region";
  if(a<0x40000000) return "SRAM Region";
  if(a<0x60000000) return "Peripheral Region";
  if(a<0xA0000000) return "External RAM";
  if(a<0xE0000000) return "External Device";
  if(a<0xE0100000) return "Private Peripheral Bus";
  return "Vendor-specific";
}
function busName(a) {
  if(a<0x20000000) return "ICode + DCode";
  if(a<0x60000000) return "System bus";
  if(a<0xE0000000) return "System bus";
  if(a<0xE0100000) return "PPB";
  return "System bus";
}

/* ══════════════════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */
function BusBadge({bus,small}) {
  if(!bus) return null; const bc=BUS_C[bus]||"#888";
  return <span style={{display:"inline-block",padding:small?"0 4px":"1px 6px",borderRadius:3,fontSize:small?9:10,fontWeight:600,background:bc+"22",color:bc,border:`1px solid ${bc}38`,marginLeft:4,letterSpacing:0.3,whiteSpace:"nowrap",lineHeight:small?"15px":"17px"}}>{bus}</span>;
}
function XNBadge() { return <span style={{display:"inline-block",padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,background:"#cc333320",color:"#ff6666",border:"1px solid #cc333338",marginLeft:4,letterSpacing:0.6,lineHeight:"17px"}}>XN</span>; }
function DiscBadge({text}) { return <span title={text} style={{display:"inline-block",padding:"1px 5px",borderRadius:3,fontSize:9,fontWeight:700,background:"#22884422",color:"#44cc66",border:"1px solid #22884438",marginLeft:4,letterSpacing:0.4,lineHeight:"17px",cursor:"help"}}>DISC</span>; }
function ClockTag({clock}) { if(!clock) return null; return <span style={{display:"inline-block",padding:"0 5px",borderRadius:3,fontSize:8.5,fontWeight:600,background:"#ffffff0a",color:"#888898",border:"1px solid #ffffff10",marginLeft:4,letterSpacing:0.2,lineHeight:"16px",fontFamily:"'JetBrains Mono',monospace"}}>🔑 {clock}</span>; }
function Chevron({open,color}) { return <span style={{display:"inline-block",transition:"transform 200ms ease",transform:open?"rotate(90deg)":"rotate(0deg)",fontSize:10,color:color||"#ffffff45",marginRight:5,flexShrink:0,width:12,textAlign:"center"}}>▶</span>; }
function StarBtn({active,onClick}) { return <span onClick={e=>{e.stopPropagation();onClick();}} style={{cursor:"pointer",fontSize:13,color:active?"#f0c030":"#444458",marginLeft:5,transition:"color 150ms",lineHeight:1}} title={active?"Remove bookmark":"Bookmark"}>{active?"★":"☆"}</span>; }

/* ══════════════════════════════════════════════════════════════════════════
   HOVER TOOLTIP
   ══════════════════════════════════════════════════════════════════════════ */
function Tooltip({block,anchorEl}) {
  const cg = block.children && DATA[block.children];
  const names = cg ? cg.filter(b=>b.color!=="dim").map(b=>b.name) : (block.registers||[]).map(r=>r.name);
  if(!names.length) return null;
  const r=anchorEl.getBoundingClientRect();
  const left=Math.min(Math.max(r.left+r.width/2-100,8),window.innerWidth-230);
  return <div style={{position:"fixed",left,top:r.top-8,transform:"translateY(-100%)",zIndex:9999,background:"#1a1a2a",border:"1px solid #38384e",borderRadius:7,padding:"9px 12px",boxShadow:"0 8px 30px rgba(0,0,0,0.65)",minWidth:130,maxWidth:220,pointerEvents:"none"}}>
    <div style={{fontSize:9,fontWeight:700,color:"#555572",marginBottom:4,letterSpacing:0.8}}>CONTAINS</div>
    {names.map((n,i)=><div key={i} style={{fontSize:11,color:"#bbbbd4",padding:"1px 0",borderBottom:i<names.length-1?"1px solid #24243a":"none"}}>{n}</div>)}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   CLOCK PATH DISPLAY
   ══════════════════════════════════════════════════════════════════════════ */
const CLOCK_PATHS = {
  ahb1: [
    { label:"HSI", freq:"16 MHz", color:"#e8a040" },
    { label:"PLL", freq:"", color:"#c080e0" },
    { label:"SYSCLK", freq:"168 MHz", color:"#60c0f0" },
    { label:"AHB1 /1", freq:"168 MHz", color:"#e08040" },
  ],
  apb1: [
    { label:"HSI", freq:"16 MHz", color:"#e8a040" },
    { label:"PLL", freq:"", color:"#c080e0" },
    { label:"SYSCLK", freq:"168 MHz", color:"#60c0f0" },
    { label:"AHB1 /1", freq:"168 MHz", color:"#e08040" },
    { label:"APB1 /4", freq:"42 MHz", color:"#6090cc" },
  ],
  apb2: [
    { label:"HSI", freq:"16 MHz", color:"#e8a040" },
    { label:"PLL", freq:"", color:"#c080e0" },
    { label:"SYSCLK", freq:"168 MHz", color:"#60c0f0" },
    { label:"AHB1 /1", freq:"168 MHz", color:"#e08040" },
    { label:"APB2 /2", freq:"84 MHz", color:"#cc60a0" },
  ],
};

function ClockPath({busGroup}) {
  const steps = CLOCK_PATHS[busGroup];
  if (!steps) return null;
  return <div style={{padding:"6px 10px",margin:"2px 0 4px",background:"#12121a",borderRadius:5,border:"1px solid #2a2a3e"}}>
    <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap",marginBottom:4}}>
      {steps.map((s,i)=><span key={i} style={{display:"flex",alignItems:"center"}}>
        <span style={{display:"inline-flex",flexDirection:"column",alignItems:"center",padding:"3px 8px",borderRadius:4,background:s.color+"18",border:`1px solid ${s.color}30`}}>
          <span style={{fontSize:10,fontWeight:700,color:s.color,letterSpacing:0.3,lineHeight:1.2}}>{s.label}</span>
          {s.freq&&<span style={{fontSize:9,color:s.color+"bb",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.2}}>{s.freq}</span>}
        </span>
        {i<steps.length-1&&<span style={{color:"#444460",fontSize:12,margin:"0 3px",flexShrink:0}}>→</span>}
      </span>)}
    </div>
    <div style={{fontSize:9,color:"#555570",fontStyle:"italic"}}>Default clock path assuming PLL configured for 168 MHz. Before PLL setup, everything runs on HSI at 16 MHz.</div>
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   REGISTER LIST
   ══════════════════════════════════════════════════════════════════════════ */
function RegisterList({registers,baseAddr}) {
  return <div style={{padding:"4px 0"}}>
    {registers.map((r,i)=>{
      const fullAddr = baseAddr !== undefined ? baseAddr + r.off : null;
      return <div key={i} style={{display:"flex",alignItems:"flex-start",padding:"4px 10px",marginBottom:2,background:C.reg.bg,border:`1px solid ${C.reg.border}`,borderRadius:4,fontSize:11,gap:8}}>
        <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#a0a0c0",minWidth:60,fontWeight:600}}>{r.name}</span>
        <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#666680",minWidth:fullAddr?190:60,fontSize:10}}>
          {fullAddr !== null ? `${hex(baseAddr)} + ${hex4(r.off)} = ${hex(fullAddr)}` : `+${hex4(r.off)}`}
        </span>
        <span style={{color:"#808098",flex:1}}>{r.desc}</span>
      </div>;
    })}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   BIT-BAND CALCULATOR
   ══════════════════════════════════════════════════════════════════════════ */
function BitBandCalc({type}) {
  const [byteAddr,setByteAddr]=useState("");
  const [bitNum,setBitNum]=useState("");
  const baseRegion = type==="sram"?0x20000000:0x40000000;
  const baseAlias = type==="sram"?0x22000000:0x42000000;
  const maxAddr = type==="sram"?0x200FFFFF:0x400FFFFF;

  let result=null, error=null;
  const addr = parseInt(byteAddr,16);
  const bit = parseInt(bitNum);
  if(byteAddr && !isNaN(addr) && bitNum!=="" && !isNaN(bit)) {
    if(addr<baseRegion||addr>maxAddr) error=`Address must be ${hex(baseRegion)}–${hex(maxAddr)}`;
    else if(bit<0||bit>7) error="Bit must be 0–7";
    else result = baseAlias + ((addr-baseRegion)*32) + (bit*4);
  }

  return <div style={{padding:"8px 10px",background:"#12121a",borderRadius:5,border:"1px solid #2a2a3e",margin:"4px 0"}}>
    <div style={{fontSize:10,fontWeight:700,color:"#606078",marginBottom:6,letterSpacing:0.8}}>{type==="sram"?"SRAM":"PERIPHERAL"} BIT-BAND CALCULATOR</div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <label style={{fontSize:10,color:"#8888a0"}}>Byte addr:
        <input value={byteAddr} onChange={e=>setByteAddr(e.target.value)} placeholder={hex(baseRegion)} style={{marginLeft:4,width:100,background:"#1a1a28",border:"1px solid #333348",borderRadius:3,padding:"3px 6px",color:"#c0c0d8",fontSize:11,fontFamily:"'JetBrains Mono',monospace",outline:"none"}} />
      </label>
      <label style={{fontSize:10,color:"#8888a0"}}>Bit (0–7):
        <input value={bitNum} onChange={e=>setBitNum(e.target.value)} placeholder="0" style={{marginLeft:4,width:36,background:"#1a1a28",border:"1px solid #333348",borderRadius:3,padding:"3px 6px",color:"#c0c0d8",fontSize:11,fontFamily:"'JetBrains Mono',monospace",outline:"none"}} />
      </label>
    </div>
    {error && <div style={{fontSize:10,color:"#f07070",marginTop:4}}>{error}</div>}
    {result!==null && <div style={{marginTop:6,fontSize:11,color:"#a0e0b0",fontFamily:"'JetBrains Mono',monospace"}}>
      Alias address: <strong>{hex(result)}</strong>
      <div style={{fontSize:10,color:"#708878",marginTop:2}}>Write 1 to set bit, 0 to clear. Single atomic STR instruction.</div>
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   ANIMATED CHILDREN WRAPPER
   ══════════════════════════════════════════════════════════════════════════ */
function AnimWrap({open,color,children}) {
  const ref=useRef(null);
  const [h,setH]=useState(0);
  const [rendered,setRendered]=useState(open);
  useEffect(()=>{
    if(open){setRendered(true);requestAnimationFrame(()=>{if(ref.current)setH(ref.current.scrollHeight);})}
    else{if(ref.current){setH(ref.current.scrollHeight);requestAnimationFrame(()=>setH(0))}}
  },[open]);
  const onEnd=()=>{if(!open)setRendered(false)};
  useEffect(()=>{if(open&&h>0){const t=setTimeout(()=>setH(-1),240);return()=>clearTimeout(t)}},[open,h]);
  if(!rendered&&!open) return null;
  const col=C[color]||C.gray;
  return <div style={{overflow:h===-1?"visible":"hidden",height:h===-1?"auto":h,opacity:open?1:0,transition:h===-1?"none":"height 220ms ease,opacity 180ms ease",marginLeft:20,paddingLeft:12,borderLeft:`2px solid ${col.border}28`,background:col.tint,borderRadius:"0 0 0 4px"}} onTransitionEnd={onEnd}><div ref={ref}>{children}</div></div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   MEMORY BLOCK
   ══════════════════════════════════════════════════════════════════════════ */
function MemBlock({block,depth,isOpen,onToggle,highlighted,bookmarked,onBookmark}) {
  const [hov,setHov]=useState(false);
  const [showTip,setShowTip]=useState(false);
  const timer=useRef(null);
  const elRef=useRef(null);
  const col=C[block.color]||C.gray;
  const expandable=!!(block.children&&DATA[block.children])||!!block.registers||!!block.clock;
  const isDim=block.color==="dim";
  const vPad=isDim?4:Math.max(6,11-depth*1.5);
  const nfs=isDim?10.5:Math.max(11.5,14-depth*0.8);
  const addrW=Math.max(120,200-depth*15);

  const onEnter=()=>{setHov(true);if(expandable&&!isOpen){timer.current=setTimeout(()=>setShowTip(true),350)}};
  const onLeave=()=>{setHov(false);setShowTip(false);clearTimeout(timer.current)};

  return <>
    <div id={`block-${block.id}`} ref={elRef} onClick={expandable?onToggle:undefined} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{
      display:"flex",alignItems:isDim?"center":"flex-start",
      background:isOpen?col.bg:hov&&expandable?col.hover:col.bg+(isDim?"":"cc"),
      border:highlighted?`2px solid #e0b030`:`1px solid ${isOpen?col.border:isDim?col.border+"50":col.border+"aa"}`,
      borderRadius:5,padding:`${vPad}px 12px`,marginBottom:3,
      cursor:expandable?"pointer":"default",
      transition:"all 180ms ease",opacity:isDim?0.4:1,
      minHeight:isDim?20:Math.max(28,44-depth*4),
      transform:hov&&expandable&&!isOpen?"translateX(2px)":"none",position:"relative",
      boxShadow:highlighted?"0 0 12px #e0b03030":"none",
    }}>
      {expandable&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:col.border,opacity:isOpen?0.9:hov?0.7:0.25,transition:"opacity 180ms ease",borderRadius:"5px 0 0 5px"}}/>}
      {expandable&&<Chevron open={isOpen} color={col.text+"88"}/>}
      <div style={{width:isDim?"auto":addrW,minWidth:isDim?0:addrW*0.8,flexShrink:0,fontFamily:"'JetBrains Mono',monospace",fontSize:isDim?9.5:Math.max(10,11.5-depth*0.3),color:isDim?col.text:col.text+"bb",lineHeight:1.4,paddingLeft:expandable?0:18}}>{block.addr}</div>
      <div style={{flex:1,minWidth:0,paddingRight:6}}>
        <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:2}}>
          <span style={{fontSize:nfs,fontWeight:isDim?400:600,color:isDim?col.text:isOpen?"#ffffff":"#e2e2ee",letterSpacing:0.2}}>{block.name}</span>
          {block.bus&&<BusBadge bus={block.bus} small={depth>1}/>}
          {block.xn&&<XNBadge/>}
          {block.disc&&<DiscBadge text={block.disc}/>}
          {block.disc_usart2&&<DiscBadge text={block.disc_usart2}/>}
          {!isDim&&onBookmark&&<StarBtn active={bookmarked} onClick={onBookmark}/>}
        </div>
        {block.desc&&!isDim&&<div style={{fontSize:Math.max(10.5,11.5-depth*0.3),color:"#8c8caa",marginTop:2,lineHeight:1.5}}>{block.desc}</div>}
        {block.clock&&!isDim&&<ClockTag clock={block.clock}/>}
        {block.disc&&!isDim&&<div style={{fontSize:10,color:"#44cc66",marginTop:1,opacity:0.8}}>{block.disc}</div>}
      </div>
      <div style={{flexShrink:0,fontSize:isDim?9:Math.max(10,11.5-depth*0.3),fontWeight:500,color:col.text,textAlign:"right",minWidth:44,fontFamily:"'JetBrains Mono',monospace"}}>{block.size||""}</div>
    </div>
    {showTip&&elRef.current&&<Tooltip block={block} anchorEl={elRef.current}/>}
  </>;
}

/* ══════════════════════════════════════════════════════════════════════════
   BLOCK TREE (recursive)
   ══════════════════════════════════════════════════════════════════════════ */
function BlockTree({groupKey,depth,expanded,onToggle,matches,bookmarks,onBookmark}) {
  const blocks=DATA[groupKey]; if(!blocks) return null;
  // Determine bus group for clock path display
  const busGroup = (groupKey==="ahb1"||groupKey==="apb1"||groupKey==="apb2") ? groupKey : null;
  return <div>
    {NOTES[groupKey]&&<div style={{fontSize:Math.max(10.5,11.5-depth*0.3),color:"#6a6a8a",lineHeight:1.5,padding:"4px 10px",marginBottom:5,borderLeft:"3px solid #2a2a4048",maxWidth:640}}>{NOTES[groupKey]}</div>}
    {blocks.map(b=>{
      const isOpen=expanded.has(b.id);
      const hl=matches.has(b.id);
      return <div key={b.id}>
        <MemBlock block={b} depth={depth} isOpen={isOpen} onToggle={()=>onToggle(b.id)} highlighted={hl} bookmarked={bookmarks.has(b.id)} onBookmark={()=>onBookmark(b.id)}/>
        {/* Children data group */}
        {b.children&&DATA[b.children]&&<AnimWrap open={isOpen} color={b.color}>
          <BlockTree groupKey={b.children} depth={depth+1} expanded={expanded} onToggle={onToggle} matches={matches} bookmarks={bookmarks} onBookmark={onBookmark}/>
        </AnimWrap>}
        {/* Clock path + Registers for peripherals */}
        {(b.registers||b.clock)&&<AnimWrap open={isOpen} color={b.color}>
          {b.clock&&busGroup&&<ClockPath busGroup={busGroup}/>}
          {b.registers&&<RegisterList registers={b.registers} baseAddr={b.baseAddr}/>}
        </AnimWrap>}
      </div>;
    })}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   MINIMAP
   ══════════════════════════════════════════════════════════════════════════ */
function Minimap({expanded,onJump}) {
  const heights=[48,48,48,26,26,16,16];
  return <div style={{width:42,flexShrink:0,background:"#0e0e14",borderLeft:"1px solid #1c1c2a",display:"flex",flexDirection:"column",padding:"10px 3px",gap:2,alignItems:"center"}}>
    <div style={{fontSize:7,fontWeight:800,color:"#3e3e54",letterSpacing:1.2,marginBottom:4}}>MAP</div>
    {DATA.root.map((b,i)=>{const col=C[b.color]||C.gray;const isOpen=expanded.has(b.id);const has=!!b.children;
      return <div key={b.id} onClick={has?()=>onJump(b.id):undefined} title={b.name} style={{width:26,height:heights[i],borderRadius:3,background:col.bg,border:isOpen?`2px solid ${col.text}`:`1px solid ${col.border}40`,cursor:has?"pointer":"default",opacity:has?(isOpen?1:0.45):0.18,transition:"all 220ms ease",boxShadow:isOpen?`0 0 10px ${col.border}50`:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:6.5,fontWeight:800,color:col.text,opacity:isOpen?1:0.5,userSelect:"none",textAlign:"center",lineHeight:1}}>{b.name.split(/[\s(]/)[0].slice(0,4).toUpperCase()}</span>
      </div>;})}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   ADDRESS CALCULATOR PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function ToolBar({bookmarks,onBookmarkJump,allBlocks}) {
  const [openTool,setOpenTool]=useState(null);
  const toggle=(name)=>setOpenTool(prev=>prev===name?null:name);
  const bmCount=bookmarks.size;

  return <div style={{position:"fixed",bottom:0,left:0,right:42,zIndex:100,display:"flex",flexDirection:"column",alignItems:"stretch",pointerEvents:"none"}}>
    {/* Panel */}
    {openTool&&<div style={{pointerEvents:"auto",margin:"0 12px",marginBottom:0,background:"#14141e",border:"1px solid #2e2e44",borderBottom:"none",borderRadius:"8px 8px 0 0",padding:"14px 16px",boxShadow:"0 -4px 24px rgba(0,0,0,0.5)",maxHeight:340,overflowY:"auto"}}>
      {openTool==="addr"&&<AddrCalcPanel/>}
      {openTool==="bb_sram"&&<BitBandCalc type="sram"/>}
      {openTool==="bb_periph"&&<BitBandCalc type="periph"/>}
      {openTool==="bookmarks"&&<BookmarkPanel bookmarks={bookmarks} onJump={onBookmarkJump} allBlocks={allBlocks}/>}
    </div>}

    {/* Button bar */}
    <div style={{pointerEvents:"auto",display:"flex",gap:4,padding:"6px 12px",background:"#13131b",borderTop:"1px solid #222232",justifyContent:"center",flexWrap:"wrap"}}>
      <ToolBtn icon="📍" label="Address Calc" active={openTool==="addr"} onClick={()=>toggle("addr")}/>
      <ToolBtn icon="🔀" label="SRAM Bit-Band" active={openTool==="bb_sram"} onClick={()=>toggle("bb_sram")}/>
      <ToolBtn icon="🔀" label="Periph Bit-Band" active={openTool==="bb_periph"} onClick={()=>toggle("bb_periph")}/>
      <ToolBtn icon="★" label={bmCount>0?`Bookmarks (${bmCount})`:"Bookmarks"} active={openTool==="bookmarks"} onClick={()=>toggle("bookmarks")} highlight={bmCount>0}/>
    </div>
  </div>;
}

function ToolBtn({icon,label,active,onClick,highlight}) {
  return <button onClick={onClick} style={{background:active?"#252540":"#1a1a2a",border:`1px solid ${active?"#4466aa":"#333348"}`,borderRadius:5,padding:"5px 12px",color:active?"#a0b8e0":highlight?"#f0c030":"#7878a0",fontSize:11,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all 150ms"}}>
    <span style={{fontSize:13}}>{icon}</span>{label}
  </button>;
}

function AddrCalcPanel() {
  const [input,setInput]=useState("");
  const addr=parseInt(input,16);
  const valid=input.length>=3&&!isNaN(addr)&&addr>=0&&addr<=0xFFFFFFFF;
  const info=valid?lookupAddress(addr):null;

  return <div>
    <div style={{fontSize:10,fontWeight:700,color:"#606078",marginBottom:8,letterSpacing:0.8}}>ADDRESS CALCULATOR</div>
    <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Type any hex address, e.g. 0x40020C14" style={{width:"100%",boxSizing:"border-box",background:"#1a1a28",border:"1px solid #333348",borderRadius:4,padding:"7px 10px",color:"#d0d0e0",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none",marginBottom:10}}/>
    {info&&<div style={{fontSize:11.5,lineHeight:1.8}}>
      <div><span style={{color:"#707088"}}>Region:</span> <span style={{color:"#d0d0e8"}}>{info.region}</span></div>
      <div><span style={{color:"#707088"}}>Bus:</span> <span style={{color:BUS_C[info.bus]||"#aaa"}}>{info.bus}</span></div>
      {info.peripheral&&<>
        <div><span style={{color:"#707088"}}>Peripheral:</span> <span style={{color:"#f0c860"}}>{info.peripheral}</span></div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#a0a0b8",background:"#1a1a24",padding:"6px 10px",borderRadius:4,marginTop:4}}>{info.peripheral} + offset {hex4(info.offset)}{info.regName?<span style={{color:"#70d898"}}> = {info.regName}</span>:""}</div>
      </>}
      {!info.peripheral&&info.detail&&<div style={{fontSize:11.5,color:"#b8b8d0",background:"#1a1a24",padding:"8px 10px",borderRadius:4,marginTop:4,lineHeight:1.6}}>{info.detail}</div>}
      {!info.peripheral&&!info.detail&&<div style={{color:"#606078",fontSize:10,marginTop:4}}>No specific info for this address</div>}
    </div>}
    {!valid&&input.length>0&&<div style={{fontSize:10,color:"#606078"}}>Enter a valid hex address (e.g. 0x40020C14)</div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════════════════════
   BOOKMARK PANEL
   ══════════════════════════════════════════════════════════════════════════ */
function BookmarkPanel({bookmarks,onJump,allBlocks}) {
  const items=useMemo(()=>{
    const list=[];
    for(const id of bookmarks) { if(allBlocks[id]) list.push(allBlocks[id]); }
    return list;
  },[bookmarks,allBlocks]);
  if(!items.length) return <div style={{fontSize:10,color:"#505068",padding:8}}>No bookmarks yet — click ☆ on any block</div>;
  return <div>
    <div style={{fontSize:10,fontWeight:700,color:"#606078",marginBottom:8,letterSpacing:0.8}}>BOOKMARKS ({items.length})</div>
    {items.map(b=><div key={b.id} onClick={()=>onJump(b.id)} style={{padding:"6px 10px",marginBottom:3,borderRadius:4,cursor:"pointer",fontSize:11,color:"#c0c0d8",background:"#1a1a24",border:"1px solid #28283a",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background 150ms"}}>
      <span style={{fontWeight:600}}>{b.name}</span>
      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#666680"}}>{(b.addr||"").split("–")[0]}</span>
    </div>)}
  </div>;
}

// Build flat block lookup for bookmarks
function buildBlockMap() {
  const map = {};
  const walk = (gk) => { const blocks=DATA[gk]; if(!blocks) return; for(const b of blocks) { map[b.id]=b; if(b.children&&DATA[b.children]) walk(b.children); } };
  walk("root"); return map;
}
const BLOCK_MAP = buildBlockMap();

/* ══════════════════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════════════════ */
export default function MemoryMapExplorer() {
  const [expanded,setExpanded]=useState(new Set());
  const [bookmarks,setBookmarks]=useState(new Set());
  const [searchQuery,setSearchQuery]=useState("");
  const [preSearchExpanded,setPreSearchExpanded]=useState(null);
  const [matches,setMatches]=useState(new Set());
  const scrollRef=useRef(null);

  // Collapse descendants helper
  const collapseDesc=useCallback((id,set)=>{
    const walk=(blockId)=>{
      for(const gk of Object.keys(DATA)){
        for(const b of DATA[gk]){
          if(b.id===blockId&&b.children&&DATA[b.children]){
            for(const ch of DATA[b.children]){set.delete(ch.id);walk(ch.id)}
          }
        }
      }
    };
    walk(id);
  },[]);

  const toggle=useCallback(id=>{
    setExpanded(prev=>{
      const next=new Set(prev);
      if(next.has(id)){next.delete(id);collapseDesc(id,next)}
      else next.add(id);
      return next;
    });
  },[collapseDesc]);

  const expandAll=useCallback(()=>setExpanded(new Set(ALL_EXPANDABLE)),[]);
  const collapseAll=useCallback(()=>{setExpanded(new Set());setSearchQuery("");setPreSearchExpanded(null);setMatches(new Set())},[]);

  const toggleBookmark=useCallback(id=>{
    setBookmarks(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n});
  },[]);

  // Search only on Enter or clear
  const doSearch=useCallback((q)=>{
    if(q.length>=2){
      if(!preSearchExpanded) setPreSearchExpanded(new Set(expanded));
      const{matches:m,toExpand}=searchBlocks(q);
      setMatches(m);
      setExpanded(prev=>{const n=new Set(prev);for(const id of toExpand) n.add(id);return n});
    } else {
      setMatches(new Set());
      if(preSearchExpanded){setExpanded(preSearchExpanded);setPreSearchExpanded(null)}
    }
  },[expanded,preSearchExpanded]);

  // Minimap jump: toggle + scroll
  const minimapJump=useCallback(id=>{
    setExpanded(prev=>{
      const n=new Set(prev);
      if(n.has(id)){n.delete(id);collapseDesc(id,n)} else n.add(id);
      return n;
    });
    setTimeout(()=>{const el=document.getElementById(`block-${id}`);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})},60);
  },[collapseDesc]);

  // Bookmark jump: expand parents + scroll
  const bookmarkJump=useCallback(id=>{
    // Find ancestors to expand
    const ancestors=[];
    const walk=(gk,anc)=>{
      const blocks=DATA[gk];if(!blocks) return false;
      for(const b of blocks){
        if(b.id===id){ancestors.push(...anc);return true}
        if(b.children&&DATA[b.children]&&walk(b.children,[...anc,b.id])) return true;
      }
      return false;
    };
    walk("root",[]);
    setExpanded(prev=>{const n=new Set(prev);for(const a of ancestors) n.add(a);return n});
    setTimeout(()=>{const el=document.getElementById(`block-${id}`);if(el){el.scrollIntoView({behavior:"smooth",block:"center"});el.style.boxShadow="0 0 20px #e0b03050";setTimeout(()=>{el.style.boxShadow=""},1500)}},80);
  },[]);

  return <div style={{background:"#111118",color:"#e0e0ec",height:"100vh",fontFamily:"'Segoe UI','Helvetica Neue',sans-serif",display:"flex",flexDirection:"column"}}>
    <style>{`::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#111118}::-webkit-scrollbar-thumb{background:#2c2c42;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#40405a}input:focus{border-color:#4466aa !important}`}</style>

    {/* Header */}
    <div style={{padding:"10px 16px 8px",borderBottom:"1px solid #222232",background:"#13131b",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:700,color:"#8ec5fc",letterSpacing:1.5,textTransform:"uppercase"}}>STM32F407VGT6</span>
          <span style={{fontSize:11,color:"#484860"}}>Memory Map Explorer</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <input value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);if(!e.target.value)doSearch("")}} onKeyDown={e=>{if(e.key==="Enter")doSearch(searchQuery)}} placeholder="Search… (press Enter)" style={{width:260,background:"#1a1a28",border:"1px solid #333348",borderRadius:4,padding:"4px 8px",color:"#d0d0e0",fontSize:11,fontFamily:"'Segoe UI',sans-serif",outline:"none"}}/>
          {searchQuery&&<button onClick={()=>{setSearchQuery("");doSearch("")}} style={{background:"#2a2a3a",border:"1px solid #3a3a4e",borderRadius:3,color:"#9898b0",padding:"3px 8px",fontSize:10,cursor:"pointer"}}>✕</button>}
          <button onClick={expandAll} style={{background:"#1e1e30",border:"1px solid #2e2e44",borderRadius:4,color:"#8888aa",padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>Expand All</button>
          <button onClick={collapseAll} style={{background:"#1e1e30",border:"1px solid #2e2e44",borderRadius:4,color:"#8888aa",padding:"3px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>Collapse All</button>
        </div>
      </div>
      {matches.size>0&&<div style={{fontSize:10,color:"#e0b030"}}>{matches.size} match{matches.size!==1?"es":""} found</div>}
    </div>

    {/* Body */}
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"12px 16px 90px"}}>
        <h1 style={{fontSize:17,fontWeight:700,color:"#e2e2f2",margin:"0 0 4px 0"}}>ARM Cortex-M4 — 4 GB Address Space</h1>
        <BlockTree groupKey="root" depth={0} expanded={expanded} onToggle={toggle} matches={matches} bookmarks={bookmarks} onBookmark={toggleBookmark}/>
        {expanded.size===0&&!searchQuery&&<div style={{marginTop:16,padding:"9px 13px",background:"#14141c",borderRadius:5,border:"1px solid #222236"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#505068",marginBottom:5}}>LEGEND</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:11,color:"#7878a0"}}>
            <span>▶ Click to expand</span>
            <span><span style={{color:"#ff6666",fontWeight:700}}>XN</span> = Execute Never</span>
            <span><span style={{color:"#44cc66",fontWeight:700}}>DISC</span> = Wired on Discovery board</span>
            <span>🔑 = RCC clock enable bit</span>
            <span>☆ = Bookmark</span>
            <span>Hover 350ms = peek inside</span>
          </div>
        </div>}
      </div>
      <Minimap expanded={expanded} onJump={minimapJump}/>
    </div>

    <ToolBar bookmarks={bookmarks} onBookmarkJump={bookmarkJump} allBlocks={BLOCK_MAP}/>
  </div>;
}