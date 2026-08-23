"use client";

import Image from "next/image";
import { useId, useState } from "react";
import Reveal from "./Reveal";
import Board3D from "./Board3D";
import { BOARDS, type Board } from "./pcbData";
import GitHubMark from "./GitHubMark";
import { BoardArt, type BoardLayout, type LayerKey } from "./BoardSVG";
import { Stackup, STACK_2L, STACK_4L, type StackLayer } from "./Stackup";
import { MML01 } from "./layoutMML01";
import { MML02 } from "./layoutMML02";

const ART: Record<string, { layout: BoardLayout; stack: StackLayer[] }> = {
  "MML-01": { layout: MML01, stack: STACK_4L },
  "MML-02": { layout: MML02, stack: STACK_2L },
};

const LAYER_LABEL: Record<LayerKey, string> = {
  all: "All",
  silk: "Silk",
  copper: "Copper",
  plane: "Ground",
  mask: "Mask",
  drill: "Drill",
};

export default function BoardsGallery() {
  return (
    <section id="work" className="px-6 pb-24 sm:pb-32">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="display text-4xl sm:text-5xl mb-10 sm:mb-14" style={{ color: "var(--text)" }}>
            Work
          </h2>
        </Reveal>

        <div className="space-y-10 sm:space-y-14">
          {BOARDS.map((b) => (
            <Reveal key={b.id}>
              <BoardCard board={b} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   One board — what it is, that it exists, and a good look at it.
   ════════════════════════════════════════════════════════════════════════ */
function BoardCard({ board }: { board: Board }) {
  const uid = useId().replace(/:/g, "");
  const [layer, setLayer] = useState<LayerKey>("all");
  const [net, setNet] = useState<string | null>(null);

  const art = ART[board.id];
  const built = board.status.kind === "built";
  const litNet = art.layout.nets?.find((n) => n.key === net) ?? null;

  return (
    <article className="card overflow-hidden min-w-0">
      {/* ── header ─────────────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-7 pb-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">{board.id}</span>
          <span
            className="inline-flex items-center gap-1.5 text-[12px]"
            style={{ color: built ? "var(--ok)" : "var(--pending)" }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: built ? "var(--ok)" : "var(--pending)" }}
            />
            {board.status.label}
          </span>
        </div>

        <h3 className="display mt-2.5 text-[1.9rem] sm:text-[2.25rem]" style={{ color: "var(--text)" }}>
          {board.name}
        </h3>

        <p className="mt-3 text-[15px] leading-7 max-w-[62ch]" style={{ color: "var(--text-2)" }}>
          {board.summary}
        </p>

        {/* the repo belongs to this board, so it is offered here as well as
            in its own section — a visitor who stops at the card still gets it */}
        {board.repo && (
          <a
            href={board.repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2.5 mt-5 text-[13px] px-3.5 py-2 rounded-full"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text)",
            }}
          >
            <GitHubMark size={14} />
            {/* the owner segment is the first thing to go on a narrow phone —
                the repo name is what identifies it, the owner is the site */}
            <span className="font-mono min-w-0 truncate">
              <span className="hidden sm:inline" style={{ color: "var(--text-3)" }}>
                {board.repo.owner}/
              </span>
              {board.repo.name}
            </span>
            <span aria-hidden className="shrink-0" style={{ color: "var(--text-3)" }}>
              &rarr;
            </span>
          </a>
        )}

        <ul className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2 m-0 p-0 list-none">
          {board.specs.map((sp, i) => (
            <li
              key={sp}
              className="flex items-center gap-2.5 text-[12.5px]"
              style={{ color: "var(--text-2)" }}
            >
              {i > 0 && (
                <span
                  aria-hidden
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--text-3)" }}
                />
              )}
              {sp}
            </li>
          ))}
        </ul>
      </div>

      {/* ── the board itself ───────────────────────────────────────────── */}
      <div
        className="px-6 sm:px-8 py-7"
        style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border-soft)" }}
      >
        {board.model && (
          <div className="mb-8">
            <Board3D
              src={board.model}
              poster={board.images?.[0]?.src}
              label={`${board.name} — rotatable 3D model`}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] gap-8 min-w-0">
          {/* layout viewer */}
          <div className="min-w-0">
            <Control
              label="Layer"
              labelId={`${uid}-layer`}
              options={art.layout.layers.map((l) => ({ key: l, label: LAYER_LABEL[l] }))}
              value={layer}
              onChange={(k) => setLayer(k as LayerKey)}
            />
            <div className="mt-4">
              <BoardArt
                layout={art.layout}
                layer={layer}
                powered
                accent={board.accent}
                net={net}
                idns={`${board.id.toLowerCase()}-${uid}`}
                label={`${board.name} — ${art.layout.w} by ${art.layout.h} millimetre board layout`}
              />
            </div>

            <div className="mt-6">
              <Control
                label="Trace a net"
                labelId={`${uid}-net`}
                options={(art.layout.nets ?? []).map((n) => ({
                  key: n.key,
                  label: n.label,
                  dot: n.color,
                }))}
                value={net ?? ""}
                onChange={(k) => setNet((v) => (v === k ? null : k))}
              />
              <div
                className="mt-3 rounded-xl p-4 min-h-[70px]"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p
                  className="text-[12.5px] leading-6"
                  style={{ color: litNet ? "var(--text-2)" : "var(--text-3)" }}
                >
                  {litNet ? litNet.note : "Pick a net to light it through the copper."}
                </p>
              </div>
            </div>
          </div>

          {/* stackup */}
          <div className="min-w-0">
            <Stackup layers={art.stack} />
          </div>
        </div>
      </div>

      {/* ── renders ────────────────────────────────────────────────────── */}
      {board.images && board.images.length > 0 && (
        <div
          className="px-6 sm:px-8 py-7 grid sm:grid-cols-2 gap-6"
          style={{ borderTop: "1px solid var(--border-soft)" }}
        >
          {board.images.map((im) => (
            <figure key={im.src} className="m-0 min-w-0">
              <div
                className="relative overflow-hidden rounded-xl"
                style={{ border: "1px solid var(--border)" }}
              >
                <Image
                  src={im.src}
                  alt={im.alt}
                  width={1400}
                  height={1000}
                  className="block w-full h-auto"
                  sizes="(max-width: 640px) 100vw, 440px"
                />
                <span
                  className="absolute top-3 left-3 text-[10.5px] px-2 py-1 rounded-md"
                  style={{ color: "var(--text)", background: "rgba(10,9,8,0.72)" }}
                >
                  {im.tag}
                </span>
              </div>
              <figcaption className="mt-3 text-[12.5px] leading-5" style={{ color: "var(--text-3)" }}>
                {im.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}

function Control({
  label,
  labelId,
  options,
  value,
  onChange,
}: {
  label: string;
  /** ties the eyebrow to the button group, so a screen reader announces
      "Layer, Copper, pressed" rather than a bare "Copper, pressed" */
  labelId: string;
  options: { key: string; label: string; dot?: string }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <div>
      <span className="eyebrow block mb-2.5" id={labelId}>
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={labelId}>
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            aria-pressed={value === o.key}
            className="seg inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1.5"
          >
            {o.dot && (
              <span
                aria-hidden
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: o.dot }}
              />
            )}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
