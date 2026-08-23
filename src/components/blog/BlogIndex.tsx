"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/* A list, not a gallery. Every row is title, one line, and where to find it. */
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

  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-10">
        <button
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className="seg text-[12px] px-2.5 py-1.5"
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t.tag}
            onClick={() => setActive(active === t.tag ? null : t.tag)}
            aria-pressed={active === t.tag}
            className="seg text-[12px] px-2.5 py-1.5"
          >
            {t.tag}
          </button>
        ))}
      </div>

      <ul className="m-0 p-0 list-none">
        {shown.map((p, i) => (
          <li key={p.slug} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-soft)" }}>
            <Link href={`/blog/${p.slug}`} className="group block py-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  {formatDate(p.date)}
                </span>
                <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  {p.tag}
                </span>
                <span className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  {p.readTime}
                </span>
              </div>
              <h2
                className="mt-1.5 text-[1.2rem] sm:text-[1.35rem] font-semibold leading-snug tracking-[-0.018em] group-hover:underline underline-offset-4"
                style={{ color: "var(--text)" }}
              >
                {p.title}
              </h2>
              <p
                className="mt-1.5 text-[14px] leading-7 max-w-[70ch]"
                style={{ color: "var(--text-2)" }}
              >
                {p.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {shown.length === 0 && (
        <p className="py-10 text-[14px]" style={{ color: "var(--text-3)" }}>
          Nothing filed under that yet.
        </p>
      )}
    </>
  );
}
