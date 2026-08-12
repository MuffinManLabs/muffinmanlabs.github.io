import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: () => null,
    h2: ({ children }) => (
      <h2
        className="text-2xl sm:text-[28px] font-semibold mt-14 mb-4 leading-snug tracking-[-0.01em]"
        style={{ color: "#eae6da", fontFamily: "var(--font-fraunces), serif" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="text-lg sm:text-xl font-semibold mt-9 mb-3 leading-snug"
        style={{ color: "#eae6da", fontFamily: "var(--font-fraunces), serif" }}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-[15px] sm:text-base leading-8 text-[#d6d3cd]/80 mb-6">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-[#f0d488] hover:text-[#f6e3a3] underline underline-offset-4 decoration-[#d4af37]/40 transition-colors"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code
        className="px-1.5 py-0.5 rounded text-[13px] font-mono"
        style={{ background: "rgba(184,115,51,0.12)", color: "#e8a85c", border: "1px solid rgba(184,115,51,0.25)" }}
      >
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre
        className="rounded-xl p-5 overflow-x-auto mb-7 font-mono text-[13px] leading-6"
        style={{ background: "rgba(11,7,20,0.7)", border: "1px solid rgba(234,230,218,0.1)" }}
      >
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 text-[15px] sm:text-base leading-8 text-[#d6d3cd]/80 space-y-2 mb-6 marker:text-[#d4af37]/70">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 text-[15px] sm:text-base leading-8 text-[#d6d3cd]/80 space-y-2 mb-6 marker:text-[#d4af37]/70">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote
        className="my-8 pl-5 pr-4 py-4 rounded-r-lg text-[15px] sm:text-base leading-8 text-[#eae6da]/90"
        style={{
          borderLeft: "3px solid #d4af37",
          background: "linear-gradient(90deg, rgba(212,175,55,0.08), transparent)",
        }}
      >
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold" style={{ color: "#eae6da" }}>
        {children}
      </strong>
    ),
    hr: () => (
      <hr
        className="my-10 border-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,168,92,0.35), transparent)" }}
      />
    ),
    ...components,
  };
}
