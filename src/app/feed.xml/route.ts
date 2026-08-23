import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/schema";

/* RSS for Field Notes. A route handler rather than a hand-maintained file:
   the static export writes it to /feed.xml at build time from the same post
   list every other page uses, so it can never drift out of date. */

export const dynamic = "force-static";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const posts = getAllPosts();

  const items = posts
    .map((p) => {
      const url = `${SITE}/blog/${p.slug}`;
      /* a post with a missing or malformed date ships without a pubDate
         rather than shipping "Invalid Date" and failing feed validators */
      const d = new Date(`${p.date}T00:00:00Z`);
      const pubDate = Number.isNaN(d.getTime()) ? "" : `\n      <pubDate>${d.toUTCString()}</pubDate>`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>${pubDate}
      <category>${esc(p.tag)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Field Notes — Ray Malik</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Practical notes on KiCad PCB design: layout, power, manufacturing packages, signal integrity, and board bring-up.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
