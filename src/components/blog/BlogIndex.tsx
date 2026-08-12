"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PostArt, { accentFor } from "./PostArt";
import { PCB } from "../pcb/pcbData";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

export default function BlogIndex({
  posts,
  tags,
}: {
  posts: PostMeta[];
  tags: { tag: string; count: number }[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const shown = useMemo(
    () => (active ? posts.filter((p) => p.tag === active) : posts),
    [posts, active]
  );

  // the lead treatment only makes sense for the full corpus — a filtered view
  // with one result shouldn't blow that post up to half a page
  const isAll = active === null;
  const featured = isAll ? shown[0] : undefined;
  const rest = isAll ? shown.slice(1) : shown;

  return (
    <>
      {/* tag filter — stays reachable while scrolling a long index */}
      <div
        className="sticky top-16 z-30 -mx-6 px-6 py-3 mb-10"
        style={{
          background: "rgba(13,12,17,0.88)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(234,230,218,0.08)",
        }}
      >
        <div className="flex flex-wrap gap-2">
          <FilterChip label="All" count={posts.length} active={active === null} onClick={() => setActive(null)} />
          {tags.map((t) => (
            <FilterChip
              key={t.tag}
              label={t.tag}
              count={t.count}
              accent={accentFor(t.tag)}
              active={active === t.tag}
              onClick={() => setActive(active === t.tag ? null : t.tag)}
            />
          ))}
        </div>
      </div>

      {/* featured */}
      {featured && (
        <Link href={`/blog/${featured.slug}`} className="fab-card group block overflow-hidden mb-6">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[200px]">
              <PostArt tag={featured.tag} uid={featured.slug} seed={0} fill className="h-full w-full" />
              <span
                className="absolute top-4 left-4 font-mono text-[10px] tracking-[0.2em] px-2.5 py-1 rounded"
                style={{ background: "rgba(11,7,20,0.75)", color: accentFor(featured.tag), border: `1px solid ${accentFor(featured.tag)}55` }}
              >
                LATEST
              </span>
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 font-mono text-[11px] mb-3">
                <span style={{ color: accentFor(featured.tag) }}>{featured.tag}</span>
                <span className="text-[#d6d3cd]/45">{formatDate(featured.date)}</span>
                <span className="text-[#d6d3cd]/45">{featured.readTime}</span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-semibold leading-tight mb-3 transition-colors"
                style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
              >
                {featured.title}
              </h3>
              <p className="text-sm leading-7 text-[#d6d3cd]/70">{featured.excerpt}</p>
              <span
                className="mt-5 font-mono text-xs tracking-widest inline-flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: PCB.copperBright }}
              >
                READ <span aria-hidden>→</span>
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        {rest.map((p, i) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="fab-card group flex flex-col overflow-hidden">
            <PostArt tag={p.tag} uid={p.slug} seed={i + 1} />
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2.5 font-mono text-[10px] mb-2">
                <span style={{ color: accentFor(p.tag) }}>{p.tag}</span>
                <span className="text-[#d6d3cd]/40">{formatDate(p.date)}</span>
              </div>
              <h3
                className="text-lg font-semibold leading-snug mb-2"
                style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
              >
                {p.title}
              </h3>
              <p className="text-[13px] leading-6 text-[#d6d3cd]/65 flex-1">{p.excerpt}</p>
              <div className="mt-4 pt-3 border-t flex items-center justify-between font-mono text-[10px]"
                style={{ borderColor: "rgba(234,230,218,0.1)" }}>
                <span className="text-[#d6d3cd]/45">{p.readTime}</span>
                <span
                  className="transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: PCB.copperBright }}
                  aria-hidden
                >
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="font-mono text-sm text-[#d6d3cd]/60 py-12 text-center">No posts under that tag yet.</p>
      )}
    </>
  );
}

function FilterChip({
  label,
  count,
  active,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  accent?: string;
  onClick: () => void;
}) {
  const c = accent ?? PCB.enigBright;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors duration-200"
      style={
        active
          ? { color: "#1a1405", background: c, borderColor: c }
          : { color: "rgba(234,230,218,0.7)", borderColor: "rgba(184,115,51,0.3)" }
      }
    >
      {label}
      <span className="ml-1.5 opacity-60">{count}</span>
    </button>
  );
}
