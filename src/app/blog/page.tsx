import BlogIndex from "@/components/blog/BlogIndex";
import { getAllPosts, getAllTags } from "@/lib/posts";

export const metadata = {
  title: "Field Notes — PCB Design Journal | Ray Malik",
  description:
    "Practical notes on KiCad PCB design: layout, power, manufacturing packages, signal integrity, and board bring-up.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags(posts);

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="display text-4xl sm:text-5xl" style={{ color: "var(--text)" }}>
          Field Notes
        </h1>
        <p className="mt-4 text-[16px] leading-8 max-w-[60ch]" style={{ color: "var(--text-2)" }}>
          Write-ups on the parts of PCB design that decide whether a board works the
          first time — layout, power, manufacturing packages, and bring-up.
        </p>
        <div className="mt-12">
          <BlogIndex posts={posts} tags={tags} />
        </div>
      </div>
    </section>
  );
}
