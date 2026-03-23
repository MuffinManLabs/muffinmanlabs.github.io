"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { href: "/#home", label: "./home" },
  { href: "/#about", label: "./about" },
  { href: "/#hardware", label: "./hardware" },
  { href: "/#projects", label: "./projects" },
  { href: "/#blog", label: "./blog" },
  { href: "/#contact", label: "./contact" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-mono ${
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#00ff41]/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Image
            src="/MuffinManLabsLogo.png"
            alt="MuffinManLabs"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-sm text-[#00ff41] tracking-wider hidden sm:inline">
            MuffinManLabs
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-xs tracking-wider text-[#00ff41]/50 hover:text-[#00ff41] transition-colors duration-300"
              >
                <span className="text-[#a855f7]">&gt; </span>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden font-mono text-[#00ff41]/60 hover:text-[#00ff41] text-sm transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "[x]" : "[=]"}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-md border-b border-[#00ff41]/10">
          <ul className="flex flex-col gap-4 px-6 py-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-wider text-[#00ff41]/50 hover:text-[#00ff41] transition-colors duration-300"
                >
                  <span className="text-[#a855f7]">&gt; </span>
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
