"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* Five links. Services earns its slot: two of the job clusters bid on —
   conversion and debug — appear nowhere else on the site. */
const links = [
  { href: "/#work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/#capability", label: "Capability" },
  { href: "/blog", label: "Notes" },
  { href: "/memory-map", label: "Memory Map" },
];

export default function Header() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  /* A sentinel plus one IntersectionObserver, rather than a scroll listener:
     the old version ran a callback on every scroll frame just to compare a
     number. This fires twice — once on the way down, once on the way back. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden
        style={{ position: "absolute", top: 12, left: 0, width: 1, height: 1, pointerEvents: "none" }}
      />
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          background: scrolled ? "var(--header-bg)" : "transparent",
          backdropFilter: scrolled ? "saturate(150%) blur(14px)" : undefined,
          WebkitBackdropFilter: scrolled ? "saturate(150%) blur(14px)" : undefined,
          borderBottom: `1px solid ${scrolled ? "var(--border-soft)" : "transparent"}`,
        }}
      >
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            style={{ color: "var(--text)" }}
            aria-label="MuffinByteLabs — home"
          >
            <span className="logo" aria-hidden style={{ width: 30, height: 30 }} />
            {/* below 640px the wordmark plus three nav items is ~6px wider
                than the viewport and the two collide; the mark carries the
                brand on its own, and the name is in the hero right below */}
            <span className="hidden sm:inline text-[16px] font-medium tracking-[-0.012em]">
              MuffinByteLabs
            </span>
          </Link>
          {/* Five items plus the wordmark overflow a 320px viewport whatever the
              type size, so the list scrolls rather than colliding with the mark.
              At every real width it never actually scrolls. */}
          <ul className="flex items-center gap-4 sm:gap-6 min-w-0 overflow-x-auto no-scrollbar">
            {links.map((l) => {
              const hash = l.href.startsWith("/#");
              /* the anchor links live on the home page, so "here" for them is
                 simply being on it; Notes stays lit across every post */
              const here = hash ? false : path === l.href || path.startsWith(l.href + "/");
              const cls = "link-quiet text-[13px] sm:text-sm whitespace-nowrap";
              const style = here ? { color: "var(--text)" } : undefined;
              const current = here ? ("page" as const) : undefined;
              return (
                <li key={l.href} className="shrink-0">
                  {hash ? (
                    <a href={l.href} className={cls}>
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className={cls} style={style} aria-current={current}>
                      {l.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
    </>
  );
}
