import Reveal from "./Reveal";
import GitHubMark from "./GitHubMark";
import { REPO, REPO_TREE, REPO_READS, REPO_HIGHLIGHTS } from "./pcbData";

/* ════════════════════════════════════════════════════════════════════════
   Open source — the evidence section.

   Every other claim on this page asks to be believed. This one does not:
   the whole PCB 1 project is public, including the exact package that was
   uploaded to the fab and the review records that caught things before it
   was. It is the single most persuasive thing on the site, so it gets a
   section of its own rather than a link in the footer — and the documents
   a client can actually read in a browser are deep-linked one by one,
   because "it's in there somewhere" persuades nobody.

   Server-rendered: static prose and outbound links.
   ════════════════════════════════════════════════════════════════════════ */

export default function OpenSource() {
  return (
    <section id="open-source" className="px-6 pb-24 sm:pb-32">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <span className="eyebrow">Open source</span>
          <h2 className="display mt-3 text-4xl sm:text-5xl" style={{ color: "var(--text)" }}>
            The whole board, in public
          </h2>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-8" style={{ color: "var(--text-2)" }}>
            You do not have to take any of the above on trust. PCB 1 is
            published in full &mdash; the KiCad project, the exact package that
            was uploaded to JLCPCB, the written design document, and the review
            records that caught two real problems before boards were built with
            them. Read the work before you hire the person who did it.
          </p>
        </Reveal>

        <Reveal>
          <div className="card mt-9 sm:mt-11 overflow-hidden">
            {/* ── the repo itself ──────────────────────────────────────── */}
            <div
              className="px-6 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span style={{ color: "var(--text)" }}>
                  <GitHubMark size={22} />
                </span>
                <span
                  className="font-mono text-[14px] sm:text-[15px] truncate"
                  style={{ color: "var(--text)" }}
                >
                  <span style={{ color: "var(--text-3)" }}>{REPO.owner}/</span>
                  {REPO.name}
                </span>
              </div>

              <a
                href={REPO.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-[13.5px] px-5 py-2.5 rounded-full shrink-0"
                style={{
                  background: "var(--text)",
                  color: "var(--bg)",
                  boxShadow: "0 8px 26px -12px rgba(0,0,0,0.9)",
                }}
              >
                <GitHubMark size={15} />
                View the repository
                <span aria-hidden>&rarr;</span>
              </a>
            </div>

            {/* ── what is in it ────────────────────────────────────────── */}
            <div className="px-6 sm:px-8 py-7" style={{ background: "var(--bg-alt)" }}>
              <ul className="m-0 p-0 list-none space-y-0">
                {REPO_TREE.map((d, i) => (
                  <li
                    key={d.path}
                    className="py-4 grid sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)] gap-x-6 gap-y-1"
                    style={i > 0 ? { borderTop: "1px solid var(--border-soft)" } : undefined}
                  >
                    <a
                      href={`${REPO.url}/tree/main/${d.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[13.5px] link-quiet self-start"
                      style={{ color: "var(--accent)" }}
                    >
                      {d.name}
                    </a>
                    <p className="text-[13.5px] leading-7 m-0" style={{ color: "var(--text-2)" }}>
                      {d.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── read it in the browser — the ten-second version ──────── */}
            <div className="px-6 sm:px-8 py-7" style={{ borderTop: "1px solid var(--border-soft)" }}>
              {/* a real heading (styled by the eyebrow class, so visually
                  identical) — heading navigation should land on the site's
                  strongest evidence, not skip past it */}
              <h3 className="eyebrow">Read it in the browser</h3>
              <p
                className="mt-3 text-[13.5px] leading-7 max-w-[70ch] m-0"
                style={{ color: "var(--text-2)" }}
              >
                No KiCad install, no download &mdash; each opens as a page and
                takes about ten seconds to judge. The first two are the reviews
                this board passed through before it was ordered; a review from
                me arrives in the same shape &mdash; findings, severities, and
                what to do about each.
              </p>

              <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 m-0 p-0 list-none">
                {REPO_READS.map((r) => (
                  <li
                    key={r.path}
                    className="py-3"
                    style={{ borderTop: "1px solid var(--border-soft)" }}
                  >
                    <a
                      href={`${REPO.url}/${r.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-quiet inline-flex items-center gap-2 text-[13.5px] font-medium leading-6"
                      style={{ color: "var(--accent)" }}
                    >
                      {r.label}
                      <span aria-hidden style={{ color: "var(--text-3)" }}>
                        &rarr;
                      </span>
                    </a>
                    <span
                      className="block text-[12.5px] leading-5"
                      style={{ color: "var(--text-3)" }}
                    >
                      {r.note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── the paperwork, which is the actual differentiator ────── */}
            <div className="px-6 sm:px-8 py-7" style={{ borderTop: "1px solid var(--border-soft)" }}>
              <h3 className="eyebrow">Also in there</h3>
              <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 m-0 p-0 list-none">
                {REPO_HIGHLIGHTS.map((h) => (
                  <li
                    key={h.label}
                    className="py-3"
                    style={{ borderTop: "1px solid var(--border-soft)" }}
                  >
                    <span
                      className="block text-[13.5px] font-medium leading-6"
                      style={{ color: "var(--text)" }}
                    >
                      {h.label}
                    </span>
                    <span
                      className="block text-[12.5px] leading-5"
                      style={{ color: "var(--text-3)" }}
                    >
                      {h.note}
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="mt-6 pt-6 text-[13px] leading-7 max-w-[70ch]"
                style={{ color: "var(--text-3)", borderTop: "1px solid var(--border-soft)" }}
              >
                Published under {REPO.licence} &mdash; a permissive open-hardware
                licence, so you may read it, build it, or lift a block out of it
                for your own board. It is also a fair sample of what your project
                would look like when I hand it over.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
