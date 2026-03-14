import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-100 mb-4">
            Post not found
          </h1>
          <Link
            href="/#blog"
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            &larr; Back to blog
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic import of the MDX file
  const MDXContent = (await import(`@/content/${slug}.mdx`)).default;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <article className="max-w-3xl mx-auto">
        <Link
          href="/#blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-violet-400 transition-colors mb-8"
        >
          &larr; Back to blog
        </Link>

        <header className="mb-12">
          {post.frontmatter.tag && (
            <span className="text-xs px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-full">
              {post.frontmatter.tag}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mt-4 mb-4 tracking-tight">
            {post.frontmatter.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <time>{post.frontmatter.date}</time>
            {post.frontmatter.readTime && (
              <span>{post.frontmatter.readTime}</span>
            )}
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <MDXContent />
        </div>
      </article>
    </div>
  );
}
