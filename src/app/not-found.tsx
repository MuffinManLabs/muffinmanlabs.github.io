import Link from "next/link";

export const metadata = {
  title: "No route to that page | MuffinByteLabs",
  robots: { index: false, follow: true },
};

/* Next's built-in 404 is a bare "This page could not be found" with no way
   out of it. A link in an old proposal or an emailed repo URL can land a
   client here, so it gets the same voice as the rest of the site and, more to
   the point, somewhere to go next. */
export default function NotFound() {
  return (
    <section className="px-6 pt-36 pb-32">
      <div className="max-w-xl mx-auto text-center">
        <span className="eyebrow">Error 404</span>

        <h1 className="display mt-3 text-[2.6rem] sm:text-[3.2rem]" style={{ color: "var(--text)" }}>
          No route to that page
        </h1>

        <p className="mt-5 text-[16px] leading-8" style={{ color: "var(--text-2)" }}>
          The address exists, the page at the end of it does not. It was
          probably renamed in a revision — the board work and the notes are
          both still here.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] px-5 py-2.5 rounded-full"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              boxShadow: "0 8px 26px -12px rgba(0,0,0,0.9)",
            }}
          >
            Back to the work
          </Link>
          <Link href="/blog" className="link-quiet text-sm">
            Field Notes
          </Link>
          <a
            href="mailto:muffinbytelabs@gmail.com?subject=Broken%20link%20on%20muffinbytelabs.com"
            className="link-quiet text-sm"
          >
            Tell me what broke
          </a>
        </div>
      </div>
    </section>
  );
}
