import Link from "next/link";
import ScrambleText from "./ScrambleText";
import ScrollFadeIn from "./ScrollFadeIn";

const posts = [
  {
    slug: "hello-world",
    title: "Hello, World — Why I Started This Blog",
    excerpt:
      "A first post about my journey into systems programming and why I decided to start writing about it.",
    date: "2026-03-14",
  },
  {
    slug: "building-a-cpu-from-scratch",
    title: "Building a Virtual CPU From Scratch",
    excerpt:
      "What I learned by implementing a virtual CPU in Python and then rewriting it in C.",
    date: "2026-03-14",
  },
  {
    slug: "c-memory-management",
    title: "C Memory Management: Lessons From the Trenches",
    excerpt:
      "Everything I wish I knew about malloc, free, and Valgrind before I started writing C.",
    date: "2026-03-14",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="relative py-20 px-8">
      <ScrollFadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="font-mono text-xs text-[#a855f7] tracking-widest uppercase mb-3">
              // blog
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[#f0f0f0]"
              style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              <ScrambleText text="Blog" />
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block border border-[#00ff41]/10 hover:border-[#00ff41]/30 p-6 transition-all duration-300 hover:bg-[#00ff41]/[0.02]"
              >
                <time className="font-mono text-[10px] text-[#a855f7]/60 tracking-wider">
                  {post.date}
                </time>
                <h3 className="font-mono text-sm text-[#e0e0e0]/90 mt-2 mb-3 group-hover:text-[#00ff41] transition-colors duration-300 leading-snug">
                  {post.title}
                </h3>
                <p className="font-mono text-xs text-[#e0e0e0]/40 leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
