import BlogIndex from "@/components/blog/BlogIndex";
import { getAllPosts, getAllTags } from "@/lib/posts";

const TITLE = "Field Notes — PCB Design Journal | Ray Malik";
const DESCRIPTION =
  "Practical notes on KiCad PCB design: layout, power, manufacturing packages, signal integrity, and board bring-up.";

/* openGraph/twitter in full — Next does not merge them field-by-field with
   the layout, so omitting them here shares this page as the homepage's card
   with the homepage's URL. */
export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/blog",
    siteName: "Ray Malik · MuffinByteLabs",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MuffinByteLabs — KiCad PCB design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
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
          first time — layout, power, manufacturing packages, and bring-up.{" "}
          <a href="/feed.xml" style={{ color: "var(--accent)" }}>
            RSS
          </a>
        </p>
        <div className="mt-12">
          <BlogIndex posts={posts} tags={tags} />
        </div>
      </div>
    </section>
  );
}
