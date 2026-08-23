import Reveal from "./Reveal";
import { SKILL_GROUPS, CAPABILITY_INTRO, HANDOFF, HANDOFF_NOTE, CONTACT_MAILTO } from "./pcbData";

/* ════════════════════════════════════════════════════════════════════════
   Capability — five lines about what I do, then what actually arrives.

   This section has now been cut twice. It began as six decisions taken on
   one board, which read as a case study rather than a capability; it then
   became five groups of eleven-to-fourteen skills, which read as a wall.
   What survives is the part that argues: five titles, and the one rule
   that governs each. The detail behind them is still in pcbData.ts and
   still checkable — it just lives in the repo and in Field Notes now,
   which is where someone who wants it will go looking.

   Then the deliverable, so the visit ends on what the client receives.

   Server-rendered on purpose — static prose, so none of it needs to reach
   the browser as JavaScript.
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

        {/* ── the five, one line each ──────────────────────────────────── */}
        <Reveal>
          <div className="card mt-9 sm:mt-11 px-6 sm:px-8 py-2">
            <ul className="m-0 p-0 list-none">
              {SKILL_GROUPS.map((g, i) => (
                <li
                  key={g.id}
                  className="py-6 grid sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] gap-x-8 gap-y-2"
                  style={i > 0 ? { borderTop: "1px solid var(--border-soft)" } : undefined}
                >
                  <div>
                    <span className="eyebrow">{g.id}</span>
                    <h3
                      className="display mt-1.5 text-[1.35rem] sm:text-[1.5rem]"
                      style={{ color: "var(--text)" }}
                    >
                      {g.title}
                    </h3>
                  </div>

                  <p
                    className="text-[14px] leading-7 m-0 self-center"
                    style={{ color: "var(--text-2)" }}
                  >
                    {g.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* ── the deliverable ──────────────────────────────────────────── */}
        <Reveal>
          <div className="card mt-5 sm:mt-6 p-6 sm:p-8">
            {/* a real heading, styled by the eyebrow class — visually identical */}
            <h3 className="eyebrow">Every board ships with</h3>

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
                href={CONTACT_MAILTO}
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
