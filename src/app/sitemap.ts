import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const SITE = "https://muffinbytelabs.com";

/* Hand-maintained content dates for the static pages. `new Date()` here
   stamped every page as modified-now on every rebuild — a lastmod signal
   search engines learn to distrust, which then also devalues the accurate
   per-post dates below. Bump these when the page's content actually changes. */
const HOME_UPDATED = new Date("2026-08-23T00:00:00Z");
const SERVICES_UPDATED = new Date("2026-08-23T00:00:00Z");
const MEMORY_MAP_UPDATED = new Date("2026-08-23T00:00:00Z");

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  /* A malformed frontmatter date would otherwise reach Next's serializer as
     an Invalid Date and kill the whole build with an opaque RangeError far
     from the actual typo — same guard feed.xml and formatDate carry. */
  const postDate = (iso: string): Date | undefined => {
    const d = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  /* newest post drives the blog index's lastModified */
  const newestPost = posts.length > 0 ? postDate(posts[0].date) : undefined;

  return [
    { url: `${SITE}/`, lastModified: HOME_UPDATED, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/services`, lastModified: SERVICES_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/blog`, lastModified: newestPost, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/memory-map`, lastModified: MEMORY_MAP_UPDATED, changeFrequency: "yearly", priority: 0.4 },
    ...posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: postDate(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
