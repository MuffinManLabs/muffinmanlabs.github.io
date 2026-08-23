# muffinbytelabs.com

Portfolio and bidding site for **MuffinByteLabs** — Ray Malik, freelance PCB design engineer working in native KiCad.

The site makes one argument: every claim on it is checkable. The boards link to the full open-source KiCad project ([MuffinByteLabs/esp32s3-plant-monitor](https://github.com/MuffinByteLabs/esp32s3-plant-monitor)), including the exact manufacturing package that was uploaded to the fab and the design reviews that preceded it.

## Stack

- [Next.js](https://nextjs.org) static export (`output: "export"`) — no server, no third-party requests, no cookies
- Tailwind CSS v4, one design-token palette in `src/app/globals.css` (dark only, warm graphite + ENIG gold)
- MDX for the Field Notes blog (`src/content/*.mdx`, frontmatter drives the index, RSS at `/feed.xml`)
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`

## Working on it

```bash
npm ci
npm run dev     # local dev server
npm run build   # static export into out/
```

Site content — boards, services, capability, repo links — lives in one file: `src/components/pcb/pcbData.ts`. Sections that were cut from the homepage keep their data there so restoring one is a render change, not a rewrite.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/gen-board-layout.py` | Generates the interactive 2D board art from the real KiCad board file |
| `scripts/export-board-3d.sh` | Exports and compresses the rotatable 3D board model (glTF + Draco) |
| `scripts/gen-og-image.cjs` | Renders the site's social-share card to `public/og.png` |
| `scripts/gen-post-og.cjs` | Renders one share card per Field Note into `public/og/` — run after adding a post |
