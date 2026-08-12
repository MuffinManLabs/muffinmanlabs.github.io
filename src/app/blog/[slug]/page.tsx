import type { Metadata } from "next";
import Link from "next/link";
import PostArt, { accentFor } from "@/components/blog/PostArt";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { PCB } from "@/components/pcb/pcbData";
import { getAllPosts, formatDate } from "@/lib/posts";

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
  if (!post) return { title: "Post not found | MuffinByteLabs" };
  return {
    title: `${post.title} | MuffinByteLabs`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
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
  const idx = posts.findIndex((p) => p.slug === slug);
  const post = posts[idx];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1
            className="text-3xl font-semibold mb-4"
            style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
          >
            Post not found
          </h1>
          <Link href="/blog" className="font-mono text-sm" style={{ color: PCB.enigBright }}>
            ← back to field notes
          </Link>
        </div>
      </div>
    );
  }

  const accent = accentFor(post.tag);
  const related = posts.filter((p) => p.tag === post.tag && p.slug !== post.slug).slice(0, 3);
  const MDXContent = (await import(`@/content/${slug}.mdx`)).default;

  return (
    <div className="relative pt-28 pb-24 px-6">
      <ReadingProgress />
      <article className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-[#eae6da]/55 hover:text-[#f0d488] transition-colors duration-300 mb-8"
        >
          <span aria-hidden>←</span> field notes
        </Link>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] mb-4">
          <span
            className="px-2.5 py-1 rounded-full border"
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}10` }}
          >
            {post.tag}
          </span>
          <span className="text-[#d6d3cd]/50">{formatDate(post.date)}</span>
          <span className="text-[#d6d3cd]/50">{post.readTime}</span>
        </div>

        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-[-0.015em] leading-[1.08] mb-5"
          style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
        >
          {post.title}
        </h1>

        <p className="text-lg leading-8 text-[#d6d3cd]/70 mb-8">{post.excerpt}</p>

        {/* hero art */}
        <div className="fab-card overflow-hidden mb-10">
          <PostArt tag={post.tag} uid={post.slug} seed={idx} />
        </div>

        {/* body — a measured column, not the full 3xl, for readable line length */}
        <div className="max-w-[68ch]">
          <MDXContent />
        </div>

        {/* more in this tag */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-5">
              <span aria-hidden className="h-px w-7" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: accent }}>
                More in {post.tag}
              </h2>
            </div>
            <ul className="space-y-1">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="group flex items-baseline gap-3 py-2.5 border-b transition-colors"
                    style={{ borderColor: "rgba(234,230,218,0.08)" }}
                  >
                    <span
                      aria-hidden
                      className="shrink-0 w-1.5 h-1.5 rounded-full translate-y-[-2px]"
                      style={{ background: `radial-gradient(circle at 38% 32%, ${PCB.enigBright}, ${PCB.enig} 60%, #8c6a18)` }}
                    />
                    <span
                      className="flex-1 text-[15px] leading-6 group-hover:text-[#f0d488] transition-colors"
                      style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
                    >
                      {r.title}
                    </span>
                    <span className="font-mono text-[10px] text-[#d6d3cd]/45 shrink-0">{r.readTime}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <div
          className="mt-12 rounded-xl p-6 sm:p-7 text-center"
          style={{
            border: "1px solid rgba(184,115,51,0.3)",
            background: "linear-gradient(90deg, rgba(184,115,51,0.07), rgba(184,115,51,0.02))",
          }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
          >
            Need this done on your board?
          </h2>
          <p className="text-sm leading-7 text-[#d6d3cd]/75 mb-5 max-w-xl mx-auto">
            I design and review KiCad boards, and hand back a complete, fab-ready package with a
            money-back guarantee in the contract.
          </p>
          <Link
            href="/#contact"
            className="pad-cta inline-block font-mono text-[13px] tracking-widest px-6 py-3.5 rounded-lg"
            style={{
              background: `linear-gradient(180deg, ${PCB.enigBright}, ${PCB.enig})`,
              color: "#1a1405",
              boxShadow: "0 4px 14px rgba(212,175,55,0.3)",
            }}
          >
            REQUEST A QUOTE →
          </Link>
        </div>
      </article>
    </div>
  );
}
