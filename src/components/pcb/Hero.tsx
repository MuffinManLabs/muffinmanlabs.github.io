import Image from "next/image";
import { HERO_TERMS, REPO } from "./pcbData";
import GitHubMark from "./GitHubMark";

/* ════════════════════════════════════════════════════════════════════════
   Hero — who I am, what I do, and nothing else. No status readouts, no
   fake terminal, no scrolling marquee. Face, name, specialism, one line.
   ════════════════════════════════════════════════════════════════════════ */
export default function Hero() {
  return (
    <section className="px-6 pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="max-w-2xl mx-auto text-center">
        <Image
          src="/portrait.jpg"
          alt="Ray Malik"
          width={720}
          height={720}
          priority
          className="mx-auto rounded-full object-cover"
          style={{
            width: 200,
            height: 200,
            border: "1px solid var(--border)",
            boxShadow:
              "0 0 0 6px rgba(219,166,75,0.06), 0 2px 4px rgba(0,0,0,0.4), 0 26px 56px -24px rgba(0,0,0,0.9)",
          }}
        />

        <h1 className="display mt-10 text-[3rem] sm:text-[4.25rem]" style={{ color: "var(--text)" }}>
          Ray Malik
        </h1>

        <p
          className="mt-4 text-lg sm:text-xl"
          style={{ color: "var(--text-2)", letterSpacing: "-0.011em" }}
        >
          PCB design engineer &middot; MuffinByteLabs
        </p>

        <p
          className="mt-6 mx-auto max-w-[48ch] text-[16px] sm:text-[17px] leading-8"
          style={{ color: "var(--text-2)" }}
        >
          I turn circuit ideas and breadboard prototypes into boards a factory
          can actually build &mdash; schematic, layout, and the complete
          manufacturing package.
        </p>

        {/* Someone who lands here and wants to hire him had, until now, no
            way to say so above the fold — the only address on the page was in
            the footer. One primary action, one quiet one. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <a
            href="mailto:muffinbytelabs@gmail.com?subject=PCB%20project"
            className="inline-flex items-center gap-2 text-[14px] px-5 py-2.5 rounded-full"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              boxShadow: "0 8px 26px -12px rgba(0,0,0,0.9)",
            }}
          >
            Start a board
            <span aria-hidden>&rarr;</span>
          </a>

          <a
            href="#work"
            className="link-quiet inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--text-3)" }}
          >
            See the work
            <span aria-hidden>&darr;</span>
          </a>

          {/* the repo is the strongest thing on the page; it gets an exit
              from above the fold as well as its own section further down */}
          <a
            href={REPO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--text-3)" }}
          >
            <GitHubMark size={14} />
            Board files on GitHub
          </a>
        </div>

        {/* The three questions every prospective client asks in their first
            message, answered before they have to ask them. */}
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 m-0 p-0 list-none">
          {HERO_TERMS.map((t) => (
            <li key={t.label} className="text-center">
              <span
                className="block text-[13.5px] font-medium leading-6"
                style={{ color: "var(--text)" }}
              >
                {t.label}
              </span>
              <span className="block text-[12px] leading-5" style={{ color: "var(--text-3)" }}>
                {t.note}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
