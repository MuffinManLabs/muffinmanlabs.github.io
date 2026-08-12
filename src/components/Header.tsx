"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/#services", label: "SERVICES" },
  { href: "/#boards", label: "BOARDS" },
  { href: "/#skills", label: "SKILLS" },
  { href: "/#about", label: "ABOUT" },
  { href: "/blog", label: "NOTES" },
  { href: "/#contact", label: "CONTACT" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0d0c11]/85 backdrop-blur-md border-b border-[#eae6da]/8"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/logo-96.png"
            alt="MuffinByteLabs"
            width={30}
            height={30}
            className="rounded"
          />
          <span className="hidden sm:flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-wide text-[#eae6da]">
              MuffinByteLabs
            </span>
            <span className="font-mono text-[11px] tracking-[0.25em] text-[#d4af37]/80">
              KICAD PCB DESIGN
            </span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative font-mono text-[11px] tracking-[0.2em] text-[#eae6da]/55 hover:text-[#f0d488] transition-colors duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f0d488] after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden -mr-2 p-2 font-mono text-[#eae6da]/60 hover:text-[#f0d488] text-xl transition-colors cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0c11]/98 backdrop-blur-md border-b border-[#eae6da]/8">
          <ul className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-xs tracking-[0.2em] text-[#eae6da]/55 hover:text-[#f0d488] transition-colors duration-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
