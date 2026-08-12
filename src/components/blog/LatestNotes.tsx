import Link from "next/link";
import ScrollFadeIn from "../ScrollFadeIn";
import SectionHeading from "../pcb/SectionHeading";
import PostArt, { accentFor } from "./PostArt";
import { PCB } from "../pcb/pcbData";
import { getAllPosts, formatDate } from "@/lib/posts";

export default function LatestNotes() {
  const posts = getAllPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="notes" className="relative py-20 sm:py-28 px-6">
      <ScrollFadeIn>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Field Notes" title="What I write about.">
              Working notes on the decisions that make a board manufacturable — the same reasoning I
              apply to client projects.
            </SectionHeading>
            <Link
              href="/blog"
              className="w-full sm:w-auto -mt-6 mb-10 sm:mt-0 sm:mb-14 font-mono text-xs tracking-widest inline-flex items-center gap-2 transition-transform duration-300 hover:translate-x-1"
              style={{ color: PCB.copperBright }}
            >
              ALL NOTES <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 items-stretch">
            {posts.map((p, i) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="fab-card group flex flex-col overflow-hidden">
                <PostArt tag={p.tag} uid={p.slug} seed={i} />
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 font-mono text-[10px] mb-2">
                    <span style={{ color: accentFor(p.tag) }}>{p.tag}</span>
                    <span className="text-[#d6d3cd]/40">{formatDate(p.date)}</span>
                  </div>
                  <h3
                    className="text-lg font-semibold leading-snug mb-2"
                    style={{ color: PCB.silk, fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[13px] leading-6 text-[#d6d3cd]/65 flex-1">{p.excerpt}</p>
                  <div
                    className="mt-4 pt-3 border-t flex items-center justify-between font-mono text-[10px]"
                    style={{ borderColor: "rgba(234,230,218,0.1)" }}
                  >
                    <span className="text-[#d6d3cd]/45">{p.readTime}</span>
                    <span
                      className="transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: PCB.enigBright }}
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </section>
  );
}
