import MemoryMapExplorer from "@/components/stm32f407_memory_map";

export const metadata = {
  title: "Memory Map Explorer | MuffinManLabs",
  description: "Interactive STM32F407VGT6 ARM Cortex-M4 memory map explorer",
};

export default function MemoryMapPage() {
  return (
    <>
      <style>{`
        html, body { overflow: hidden !important; height: 100vh !important; }
        .memmap-page > div { height: 100% !important; }
      `}</style>
      <div
        className="memmap-page"
        style={{
          paddingTop: 64,
          height: "100vh",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <MemoryMapExplorer />
      </div>
    </>
  );
}
