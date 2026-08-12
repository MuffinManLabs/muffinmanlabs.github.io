import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // strip the YAML frontmatter block so it isn't rendered as page content
    // (string form: Turbopack requires serializable plugin references)
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
  },
});

export default withMDX(nextConfig);
