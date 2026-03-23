"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HexTrail from "@/components/HexTrail";
import MalwareScanWidget from "@/components/MalwareScanWidget";
import BootSequence from "@/components/BootSequence";
import AccessDenied from "@/components/AccessDenied";
import SecretTerminal from "@/components/SecretTerminal";
import GlitchEffect from "@/components/GlitchEffect";
import CircuitTraces from "@/components/CircuitTraces";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [booted, setBooted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mml-booted") === "true") {
      setBooted(true);
    }
    setReady(true);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
    sessionStorage.setItem("mml-booted", "true");
  }, []);

  return (
    <>
      {/* Black screen until we check sessionStorage */}
      {!ready && (
        <div className="fixed inset-0 z-[10000] bg-[#0a0a0a]" />
      )}
      {ready && !booted && <BootSequence onComplete={handleBootComplete} />}
      <HexTrail />
      <CircuitTraces />
      <Header />
      <main className="relative z-10">{children}</main>
      <Footer />
      {booted && <MalwareScanWidget />}
      {booted && <AccessDenied />}
      {booted && <SecretTerminal />}
      {booted && <GlitchEffect />}
    </>
  );
}
