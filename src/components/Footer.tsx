import Link from "next/link";
import GitHubMark from "@/components/pcb/GitHubMark";
import { REPO } from "@/components/pcb/pcbData";

/* One line: how to reach me, and where the writing lives. */
export default function Footer() {
  return (
    <footer className="px-6 pb-14 pt-4">
      <div
        className="max-w-5xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: "1px solid var(--border-soft)" }}
      >
        <div className="flex items-center gap-3" style={{ color: "var(--text-2)" }}>
          <span className="logo" aria-hidden style={{ width: 26, height: 26 }} />
          <a
            href="mailto:muffinbytelabs@gmail.com?subject=PCB%20project"
            className="text-sm"
            style={{ color: "var(--accent)" }}
          >
            muffinbytelabs@gmail.com
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <a
            href={REPO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet text-sm inline-flex items-center gap-2"
          >
            <GitHubMark size={14} />
            Board files on GitHub
          </a>
          <Link href="/blog" className="link-quiet text-sm">
            Field Notes
          </Link>
          <Link href="/memory-map" className="link-quiet text-sm">
            Memory Map
          </Link>
          <span className="text-sm" style={{ color: "var(--text-3)" }}>
            &copy; {new Date().getFullYear()} MuffinByteLabs
          </span>
        </div>
      </div>
    </footer>
  );
}
