import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/pcb/Reveal";
import {
  SERVICES,
  CONTACT_STEPS,
  CAPABILITY_LIMITS,
  CAPABILITY_LIMITS_LEAD,
  CONTACT_MAILTO,
} from "@/components/pcb/pcbData";

/* ════════════════════════════════════════════════════════════════════════
   Services — the five ways a job actually starts, ordered by how cheap
   they are to try. The review leads because it is the door most clients
   come through: no fab spend, a fixed document at the end, and a real one
   already published to read first.

   The SERVICES and CONTACT_STEPS data waited in pcbData.ts through two
   rounds of homepage cuts; this page is where they belong — a client who
   wants the list goes looking for it, and the homepage stays spare.

   Server-rendered prose; the only client JavaScript is the shared Reveal
   scroll-in that every section on the site uses.
   ════════════════════════════════════════════════════════════════════════ */

const SVC_TITLE = "Services | Ray Malik — PCB Design Engineer";
const SVC_DESCRIPTION =
  "PCB design services in native KiCad: pre-fab design reviews, conversion of PDF/DXF/Altium designs to KiCad, board debug and bring-up, new boards from idea to fab, and Rev-B revisions.";

/* openGraph/twitter spelled out in full — Next does not merge them
   field-by-field with the layout, so leaving them off would share this
   page with the homepage's card (the same trap the blog posts had). */
export const metadata: Metadata = {
  title: SVC_TITLE,
  description: SVC_DESCRIPTION,
  alternates: { canonical: "/services" },
  openGraph: {
    title: SVC_TITLE,
    description: SVC_DESCRIPTION,
    url: "/services",
    siteName: "Ray Malik · MuffinByteLabs",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MuffinByteLabs — KiCad PCB design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SVC_TITLE,
    description: SVC_DESCRIPTION,
    images: ["/og.png"],
  },
};

function ServiceLink({ sample }: { sample: NonNullable<(typeof SERVICES)[number]["sample"]> }) {
  const cls = "link-quiet inline-flex items-center gap-2 text-[13px]";
  const style = { color: "var(--accent)" };
  const arrow = (
    <span aria-hidden style={{ color: "var(--text-3)" }}>
      &rarr;
    </span>
  );
  return sample.external ? (
    <a href={sample.href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
      {sample.label}
      {arrow}
    </a>
  ) : (
    <Link href={sample.href} className={cls} style={style}>
      {sample.label}
      {arrow}
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <section className="px-6 pt-32 pb-24 sm:pb-32">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h1 className="display text-4xl sm:text-5xl" style={{ color: "var(--text)" }}>
            Services
          </h1>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-8" style={{ color: "var(--text-2)" }}>
            Five ways a job starts, ordered by how little it costs to try me.
            Every one ends in writing &mdash; a findings document, or a full
            manufacturing package &mdash; and any design files delivered are
            native KiCad you own outright. Where a claim can be checked against
            something public, the link is right on the card.
          </p>
        </Reveal>

        {/* ── the services, review first ───────────────────────────────── */}
        <Reveal>
          <div className="card mt-9 sm:mt-11 px-6 sm:px-8 py-2">
            <ul className="m-0 p-0 list-none">
              {SERVICES.map((s, i) => (
                <li
                  key={s.id}
                  className="py-7 grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-x-8 gap-y-3"
                  style={i > 0 ? { borderTop: "1px solid var(--border-soft)" } : undefined}
                >
                  <div>
                    <span className="eyebrow">{s.id}</span>
                    <h2
                      className="display mt-1.5 text-[1.35rem] sm:text-[1.5rem]"
                      style={{ color: "var(--text)" }}
                    >
                      {s.title}
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-5 m-0" style={{ color: "var(--text-3)" }}>
                      {s.turnaround}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[14px] leading-7 m-0" style={{ color: "var(--text-2)" }}>
                      {s.desc}
                    </p>
                    <ul className="mt-3 m-0 p-0 list-none space-y-1.5">
                      {s.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex gap-2.5 text-[13.5px] leading-6"
                          style={{ color: "var(--text-2)" }}
                        >
                          <span
                            aria-hidden
                            className="mt-[11px] w-1 h-1 rounded-full shrink-0"
                            style={{ background: "var(--accent)" }}
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                    {s.sample && (
                      <p className="mt-3 m-0">
                        <ServiceLink sample={s.sample} />
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── the edge of the map ──────────────────────────────────────── */}
        <Reveal>
          <div className="card mt-5 sm:mt-6 p-6 sm:p-8">
            {/* real headings (styled by the eyebrow class, visually identical)
                so these cards appear in a screen reader's heading outline */}
            <h2 className="eyebrow">What I turn down</h2>
            <p
              className="mt-3 text-[13.5px] leading-7 max-w-[70ch] m-0"
              style={{ color: "var(--text-2)" }}
            >
              {CAPABILITY_LIMITS_LEAD}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2 m-0 p-0 list-none">
              {CAPABILITY_LIMITS.map((l) => (
                <li
                  key={l}
                  className="text-[12.5px] leading-5 px-3 py-1.5 rounded-full"
                  style={{
                    color: "var(--text-2)",
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── how it starts ────────────────────────────────────────────── */}
        <Reveal>
          <div className="card mt-5 sm:mt-6 p-6 sm:p-8">
            <h2 className="eyebrow">How it starts</h2>
            <ol className="mt-4 grid sm:grid-cols-3 gap-x-8 gap-y-5 m-0 p-0 list-none">
              {CONTACT_STEPS.map((st) => (
                <li key={st.num}>
                  <span
                    className="block font-mono text-[12px]"
                    style={{ color: "var(--accent)" }}
                  >
                    {st.num}
                  </span>
                  <span
                    className="block mt-1.5 text-[14px] font-medium leading-6"
                    style={{ color: "var(--text)" }}
                  >
                    {st.title}
                  </span>
                  <span
                    className="block mt-1 text-[13px] leading-6"
                    style={{ color: "var(--text-2)" }}
                  >
                    {st.body}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href={CONTACT_MAILTO}
                className="inline-flex items-center gap-2 text-[13.5px] px-4 py-2.5 rounded-full"
                style={{
                  background: "var(--text)",
                  color: "var(--bg)",
                  boxShadow: "0 8px 26px -12px rgba(0,0,0,0.9)",
                }}
              >
                Send the brief
                <span aria-hidden>&rarr;</span>
              </a>
              <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
                The email opens with the four questions already in it.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
