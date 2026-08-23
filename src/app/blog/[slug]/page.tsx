import type { Metadata } from "next";
import Link from "next/link";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { getAllPosts, formatDate } from "@/lib/posts";
import { jsonLd, postSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return { title: "Post not found | Ray Malik" };
  /* Next does not merge openGraph field-by-field with the root layout: a page
     that declares `openGraph` and omits `images` ships a card with no image at
     all, and one that omits `twitter` inherits the SITE's title, so every
     shared Field Note used to preview as the homepage. Both blocks are
     therefore spelled out in full. */
  const url = `/blog/${post.slug}`;
  return {
    title: `${post.title} | Field Notes`,
    description: post.excerpt,
    authors: [{ name: "Ray Malik" }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Ray Malik · MuffinByteLabs",
      type: "article",
      publishedTime: post.date,
      authors: ["Ray Malik"],
      locale: "en_US",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "MuffinByteLabs — KiCad PCB design" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/og.png"],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="display text-3xl mb-4" style={{ color: "var(--text)" }}>
            Post not found
          </h1>
          <Link href="/blog" className="text-sm" style={{ color: "var(--accent)" }}>
            Back to Field Notes
          </Link>
        </div>
      </div>
    );
  }

  const related = posts.filter((p) => p.tag === post.tag && p.slug !== post.slug).slice(0, 3);
  const MDXContent = (await import(`@/content/${slug}.mdx`)).default;

  return (
    <div className="px-6 pt-28 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(postSchema(post))} />
      <ReadingProgress />
      <article className="max-w-[42rem] mx-auto">
        <Link href="/blog" className="link-quiet inline-flex items-center gap-2 text-sm mb-10">
          <span aria-hidden>&larr;</span> Field Notes
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] mb-4" style={{ color: "var(--text-3)" }}>
          <span>{formatDate(post.date)}</span>
          <span>{post.tag}</span>
          <span>{post.readTime}</span>
        </div>

        <h1 className="display text-[2.1rem] sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
          {post.title}
        </h1>

        <p className="mt-5 mb-12 text-[17px] leading-8" style={{ color: "var(--text-2)" }}>
          {post.excerpt}
        </p>

        <div style={{ borderTop: "1px solid var(--border-soft)" }} className="pt-10">
          <MDXContent />
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-8" style={{ borderTop: "1px solid var(--border-soft)" }}>
            <h2 className="text-[13px] mb-4" style={{ color: "var(--text-3)" }}>
              More on {post.tag}
            </h2>
            <ul className="m-0 p-0 list-none">
              {related.map((r, i) => (
                <li key={r.slug} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border-soft)" }}>
                  <Link href={`/blog/${r.slug}`} className="group block py-3.5">
                    <span
                      className="text-[15px] leading-6 font-medium group-hover:underline underline-offset-4"
                      style={{ color: "var(--text)" }}
                    >
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
