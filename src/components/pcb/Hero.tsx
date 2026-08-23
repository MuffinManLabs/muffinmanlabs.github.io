import Image from "next/image";
import { HERO_TERMS, CONTACT_MAILTO, REPO } from "./pcbData";
import GitHubMark from "./GitHubMark";

/* ════════════════════════════════════════════════════════════════════════
   Hero — who I am, what I do, and nothing else. Two photographs instead of
   a portrait roundel: the person, and the person actually at the bench —
   laid like two prints on a desk, one tucked slightly under the other.
   The tilt and hover-straighten live in globals.css (.hero-photo), where
   the reduced-motion rules can reach them.
   ════════════════════════════════════════════════════════════════════════ */
export default function Hero() {
  return (
    <section className="px-6 pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-start justify-center">
          <div
            className="hero-photo relative overflow-hidden rounded-2xl shrink-0"
            style={{ "--tilt": "-2.5deg", width: "min(37vw, 220px)", zIndex: 2 } as React.CSSProperties}
          >
            <Image
              src="/face_shot.webp"
              alt="Ray Malik at his electronics bench — oscilloscope, finished boards and a KiCad layout on the screen behind him"
              width={440}
              height={587}
              priority
              className="block w-full h-auto"
            />
          </div>
          <div
            className="hero-photo relative overflow-hidden rounded-2xl shrink-0"
            style={
              {
                "--tilt": "2deg",
                width: "min(50vw, 310px)",
                marginLeft: "max(-6vw, -2.5rem)",
                marginTop: "min(14vw, 5rem)",
              } as React.CSSProperties
            }
          >
            <Image
              src="/soldering.webp"
              alt="Ray Malik hand-soldering a circuit board held in a PCB holder at his bench"
              width={620}
              height={465}
              priority
              className="block w-full h-auto"
            />
          </div>
        </div>

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
          manufacturing package. Computer-science degree underneath, so the
          layout is drawn knowing what the firmware will ask of it.
        </p>

        {/* Someone who lands here and wants to hire him had, until now, no
            way to say so above the fold — the only address on the page was in
            the footer. One primary action, one quiet one. */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <a
            href={CONTACT_MAILTO}
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
