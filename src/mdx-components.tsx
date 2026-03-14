import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-zinc-100">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3 text-zinc-200">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-zinc-400 leading-relaxed mb-4">{children}</p>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-zinc-800 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto mb-6">
        {children}
      </pre>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-zinc-400 space-y-2 mb-4">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-violet-500 pl-4 italic text-zinc-500 my-6">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
