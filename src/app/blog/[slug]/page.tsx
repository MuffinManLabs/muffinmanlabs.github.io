import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "src/content");

function getPost(slug: string) {
  const filePath = path.join(contentDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  return { frontmatter: data, content };
}

function getAllSlugs() {
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#e0e0e0] mb-4">
            Post not found
          </h1>
          <a
            href="/#blog"
            className="text-[#00ff41] hover:text-[#00ff41]/80 transition-colors"
          >
            &larr; cd ../blog
          </a>
        </div>
      </div>
    );
  }

  const MDXContent = (await import(`@/content/${slug}.mdx`)).default;

  return (
    <div className="min-h-screen pt-28 pb-24 px-8">
      <article className="max-w-3xl mx-auto">
        <a
          href="/#blog"
          className="inline-flex items-center gap-2 text-sm font-mono text-[#00ff41]/40 hover:text-[#00ff41] transition-colors duration-300 mb-10"
        >
          <span className="text-[#a855f7]">&gt;</span> cd ../blog
        </a>

        <h1
          className="text-3xl sm:text-4xl font-bold text-[#e0e0e0] mb-4 tracking-tight leading-tight"
          style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
        >
          {post.frontmatter.title}
        </h1>

        <time className="block text-xs font-mono text-[#00ff41]/30 mb-10">
          {post.frontmatter.date}
          {post.frontmatter.readTime && ` · ${post.frontmatter.readTime}`}
        </time>

        <div className="terminal-divider mb-10" />

        <div className="prose prose-invert max-w-none">
          <MDXContent />
        </div>
      </article>
    </div>
  );
}
