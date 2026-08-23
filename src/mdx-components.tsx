import type { MDXComponents } from "mdx/types";

/* Article typography: one family, generous measure, quiet rules. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: () => null,
    h2: ({ children }) => (
      <h2
        className="display text-[1.55rem] sm:text-[1.8rem] mt-14 mb-4"
        style={{ color: "var(--text)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="text-lg sm:text-xl font-semibold mt-10 mb-3 leading-snug tracking-[-0.012em]"
        style={{ color: "var(--text)" }}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-[16px] leading-8 mb-6" style={{ color: "var(--text-2)" }}>
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="underline underline-offset-4"
        style={{ color: "var(--accent)", textDecorationColor: "rgba(219,166,75,0.4)" }}
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code
        className="px-1.5 py-0.5 rounded-md text-[13.5px] font-mono"
        style={{ background: "var(--bg-alt)", color: "var(--text)", border: "1px solid var(--border)" }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        className="rounded-xl p-5 overflow-x-auto mb-7 font-mono text-[13px] leading-6"
        style={{ background: "#0b0a09", color: "#e4ddd0", border: "1px solid var(--border)" }}
      >
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul
        className="list-disc pl-6 text-[16px] leading-8 space-y-2 mb-6"
        style={{ color: "var(--text-2)" }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className="list-decimal pl-6 text-[16px] leading-8 space-y-2 mb-6"
        style={{ color: "var(--text-2)" }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote
        className="my-8 pl-5 py-1 text-[16px] leading-8"
        style={{ borderLeft: "2px solid var(--border)", color: "var(--text)" }}
      >
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold" style={{ color: "var(--text)" }}>
        {children}
      </strong>
    ),
    hr: () => <hr className="my-12 border-0 h-px" style={{ background: "var(--border)" }} />,
    ...components,
  };
}
