import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

const SITE = "https://muffinbytelabs.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    { url: `${SITE}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/memory-map`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    ...posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: new Date(`${p.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
