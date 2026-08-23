import Reveal from "./Reveal";
import {
  SKILL_GROUPS,
  CAPABILITY_INTRO,
  CAPABILITY_LIMITS,
  CAPABILITY_LIMITS_LEAD,
  HANDOFF,
  HANDOFF_NOTE,
} from "./pcbData";

/* ════════════════════════════════════════════════════════════════════════
   Capability — the one section on the page that argues.

   It used to argue about six decisions taken on one board, which read as a
   case study rather than a capability list: a client with a 24 V relay
   board could not tell whether any of it applied to them. Now it argues
   generally — five groups, each led by the rule that governs it, each
   backed by the qualifiers that make a claim checkable — and the board-
   specific detail lives where it belongs, in the public repo and in Field
   Notes.

   Then the limits, then the deliverable, so the visit ends on what
   actually arrives.

   Server-rendered on purpose — it is static prose, so none of it needs to
   reach the browser as JavaScript.
   ════════════════════════════════════════════════════════════════════════ */
export default function Capability() {
  return (
    <section id="capability" className="px-6 pb-24 sm:pb-32">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="display text-4xl sm:text-5xl" style={{ color: "var(--text)" }}>
            Capability
          </h2>
          <p className="mt-4 max-w-[64ch] text-[16px] leading-8" style={{ color: "var(--text-2)" }}>
            {CAPABILITY_INTRO}
          </p>
        </Reveal>

        {/* ── the five groups ──────────────────────────────────────────── */}
        <div className="mt-10 sm:mt-14 space-y-5 sm:space-y-6">
          {SKILL_GROUPS.map((g) => (
            <Reveal key={g.id}>
              <article className="card p-6 sm:p-8">
                <span className="eyebrow">{g.id}</span>

                <h3
                  className="display mt-2.5 text-[1.6rem] sm:text-[1.9rem]"
                  style={{ color: "var(--text)" }}
                >
                  {g.title}
                </h3>

                <p className="mt-2 text-[13px] leading-6" style={{ color: "var(--text-3)" }}>
                  {g.tagline}
                </p>

                {/* the argument leads, and the list below supports it */}
                <div
                  className="mt-5 pt-5 flex gap-3"
                  style={{ borderTop: "1px solid var(--border-soft)" }}
                >
                  <span
                    aria-hidden
                    className="mt-[8px] w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                  <p
                    className="text-[14px] leading-7 max-w-[70ch]"
                    style={{ color: "var(--text-2)" }}
                  >
                    {g.note}
                  </p>
                </div>

                <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 m-0 p-0 list-none">
                  {g.skills.map((s) => (
                    <li
                      key={s.name}
                      className="py-3"
                      style={{ borderTop: "1px solid var(--border-soft)" }}
                    >
                      <span
                        className="block text-[13.5px] font-medium leading-6"
                        style={{ color: "var(--text)" }}
                      >
                        {s.name}
                      </span>
                      {s.detail && (
                        <span
                          className="block text-[12.5px] leading-5"
                          style={{ color: "var(--text-3)" }}
                        >
                          {s.detail}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        {/* ── the edges ────────────────────────────────────────────────── */}
        <Reveal>
          <div className="mt-10 sm:mt-12">
            <p
              className="text-[14px] leading-7 max-w-[70ch]"
              style={{ color: "var(--text-2)" }}
            >
              {CAPABILITY_LIMITS_LEAD}
            </p>

            <ul className="mt-5 grid sm:grid-cols-2 gap-x-8 m-0 p-0 list-none">
              {CAPABILITY_LIMITS.map((l) => (
                <li
                  key={l}
                  className="py-2.5 flex gap-3 text-[13px] leading-6"
                  style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-3)" }}
                >
                  <span aria-hidden className="shrink-0" style={{ color: "var(--text-3)" }}>
                    &times;
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── the deliverable ──────────────────────────────────────────── */}
        <Reveal>
          <div className="card mt-10 sm:mt-12 p-6 sm:p-8">
            <span className="eyebrow">Every board ships with</span>

            <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 m-0 p-0 list-none">
              {HANDOFF.map((d) => (
                <li
                  key={d.name}
                  className="py-3"
                  style={{ borderTop: "1px solid var(--border-soft)" }}
                >
                  <span
                    className="block text-[13.5px] font-medium leading-6"
                    style={{ color: "var(--text)" }}
                  >
                    {d.name}
                  </span>
                  <span className="block text-[12.5px] leading-5" style={{ color: "var(--text-3)" }}>
                    {d.note}
                  </span>
                </li>
              ))}
            </ul>

            <p
              className="mt-6 pt-6 text-[13.5px] leading-7 max-w-[70ch]"
              style={{ color: "var(--text-2)", borderTop: "1px solid var(--border-soft)" }}
            >
              {HANDOFF_NOTE}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a
                href="mailto:muffinbytelabs@gmail.com?subject=PCB%20project"
                className="inline-flex items-center gap-2 text-[13.5px] px-4 py-2.5 rounded-full transition-transform"
                style={{
                  background: "var(--text)",
                  color: "var(--bg)",
                  boxShadow: "0 8px 26px -12px rgba(0,0,0,0.9)",
                }}
              >
                Start a board
                <span aria-hidden>&rarr;</span>
              </a>
              <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
                Fixed quote in 24&nbsp;hours &mdash; scope, price and timeline in writing.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
