import Link from "next/link";

const posts = [
  {
    slug: "hello-world",
    title: "Hello, World — Why I Started This Blog",
    excerpt:
      "A first post about my journey into systems programming and why I decided to start writing about it.",
    date: "2026-03-14",
    readTime: "3 min read",
    tag: "General",
  },
  {
    slug: "building-a-cpu-from-scratch",
    title: "Building a Virtual CPU From Scratch",
    excerpt:
      "What I learned by implementing a virtual CPU in Python and then rewriting it in C — registers, instruction sets, and all.",
    date: "2026-03-14",
    readTime: "8 min read",
    tag: "Systems",
  },
  {
    slug: "c-memory-management",
    title: "C Memory Management: Lessons From the Trenches",
    excerpt:
      "Everything I wish I knew about malloc, free, and Valgrind before I started writing C. A practical guide to not leaking memory.",
    date: "2026-03-14",
    readTime: "6 min read",
    tag: "C",
  },
];

export default function Blog() {
  return (
    <section id="blog" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-400 font-mono mb-4">
            Blog
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight">
            Thoughts &amp; learnings.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-full">
                  {post.tag}
                </span>
                <span className="text-xs text-zinc-600">{post.readTime}</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3 group-hover:text-violet-300 transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <time className="text-xs text-zinc-600">{post.date}</time>
                <span className="text-sm text-violet-400 group-hover:translate-x-1 transition-transform duration-200">
                  Read &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
