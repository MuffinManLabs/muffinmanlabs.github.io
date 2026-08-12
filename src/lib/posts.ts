import fs from "fs";
import path from "path";
import { cache } from "react";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "src/content");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tag: string;
  excerpt: string;
  draft?: boolean;
};

/**
 * Every published post, newest first. Build-time only (static export).
 * Posts with `draft: true` in their frontmatter are excluded from the site
 * but kept on disk — flip the flag to publish one.
 */
export const getAllPosts = cache((): PostMeta[] => {
  if (!fs.existsSync(contentDir)) return [];

  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = matter(fs.readFileSync(path.join(contentDir, file), "utf-8"));
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        readTime: String(data.readTime ?? ""),
        tag: String(data.tag ?? "General"),
        excerpt: String(data.excerpt ?? ""),
        draft: data.draft === true,
      };
    })
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
});

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** Tags present in the corpus, ordered by post count (desc). */
export function getAllTags(posts: PostMeta[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function formatDate(iso: string): string {
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
