"use client";

import { useState, useEffect, useCallback } from "react";

export default function AccessDenied() {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setShow(true);
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [handleContextMenu]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(pos.x, window.innerWidth - 320),
    top: Math.min(pos.y, window.innerHeight - 60),
    zIndex: 10001,
  };

  return (
    <div
      style={style}
      className="bg-[#0a0a0a] border border-[#00ff41]/40 px-5 py-3 font-mono text-xs text-[#00ff41] shadow-lg shadow-[#00ff41]/5 animate-[fadeInOut_2s_ease-in-out_forwards]"
    >
      <span className="text-[#ff4141] font-bold">ACCESS DENIED</span>
      <span className="text-[#00ff41]/60"> — unauthorized inspection detected</span>
    </div>
  );
}
