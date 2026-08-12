import Link from "next/link";
import BlogIndex from "@/components/blog/BlogIndex";
import SectionHeading from "@/components/pcb/SectionHeading";
import { PCB } from "@/components/pcb/pcbData";
import { getAllPosts, getAllTags } from "@/lib/posts";

export const metadata = {
  title: "Field Notes — PCB Design Journal | MuffinByteLabs",
  description:
    "Practical notes on KiCad PCB design: layout, power, manufacturing packages, signal integrity, and board bring-up.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags(posts);

  return (
    <section className="relative pt-32 pb-24 sm:pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Field Notes" title="Notes from the bench." gold>
          Practical write-ups on the parts of PCB design that decide whether a board works the first
          time — layout, power, manufacturing packages, and bring-up.
        </SectionHeading>

        {/* masthead strip — coverage at a glance */}
        <div className="-mt-8 mb-10">
          <p
            className="font-mono text-[10px] tracking-[0.2em] pb-3"
            style={{ color: "rgba(234,230,218,0.5)" }}
          >
            {`FIELD NOTES · ${posts.length} ENTRIES · ${tags.map((t) => t.tag.toUpperCase()).join(" / ")}`}
          </p>
          <div className="terminal-divider" />
        </div>

        <BlogIndex posts={posts} tags={tags} />

        {/* close on the offer */}
        <div
          className="mt-16 rounded-xl p-7 sm:p-8 text-center"
          style={{
            border: "1px solid rgba(184,115,51,0.3)",
            background: "linear-gradient(90deg, rgba(184,115,51,0.07), rgba(184,115,51,0.02))",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
          >
            These notes are how I work.
          </h2>
          <p className="text-sm leading-7 text-[#d6d3cd]/75 mb-6 max-w-xl mx-auto">
            Point the same thinking at your board — schematic capture, layout, or a pre-fab review,
            delivered as a fab-ready package with a money-back guarantee in the contract.
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
            SEND THE BRIEF →
          </Link>
        </div>
      </div>
    </section>
  );
}
