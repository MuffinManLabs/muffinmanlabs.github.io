/* Per-post OG cards for Field Notes — same canvas language as gen-og-image.cjs
   (warm graphite, the gold traces, the mark, the gold baseline bar), with the
   post's own title where the wordmark sits on the site card. Without these,
   every shared Field Note previews as the homepage.

   Run after adding or renaming posts:  node scripts/gen-post-og.cjs
   Output: public/og/<slug>.png — the blog page falls back to /og.png for any
   post this script has not seen yet. */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT = path.join(process.cwd(), "src/content");
const OUT = path.join(process.cwd(), "public/og");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Greedy word wrap on an estimated glyph width — Georgia averages a little
   over half an em. Estimation is fine here: the right margin is generous and
   a slightly short line reads better than a clipped one. */
function wrap(text, fontSize, maxWidth) {
  const charW = fontSize * 0.53;
  const maxChars = Math.floor(maxWidth / charW);
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const tryLine = line ? `${line} ${word}` : word;
    if (tryLine.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = tryLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

(async () => {
  // the mark as warm-white ink, exactly as the site card builds it
  const { data, info } = await sharp("public/logo-mark.png")
    .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    px[i] = 244;
    px[i + 1] = 239;
    px[i + 2] = 230;
    px[i + 3] = data[i + 3];
  }
  const mark = await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
  const markURI = "data:image/png;base64," + mark.toString("base64");

  fs.mkdirSync(OUT, { recursive: true });

  const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith(".mdx"));
  let written = 0;

  /* prune cards whose post was renamed, deleted, or flipped back to draft —
     otherwise the old slug's PNG ships forever */
  const live = new Set(
    files
      .filter((f) => matter(fs.readFileSync(path.join(CONTENT, f), "utf-8")).data.draft !== true)
      .map((f) => f.replace(/\.mdx$/, ".png"))
  );
  for (const png of fs.readdirSync(OUT).filter((f) => f.endsWith(".png"))) {
    if (!live.has(png)) {
      fs.unlinkSync(path.join(OUT, png));
      console.log("pruned stale card:", png);
    }
  }

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const { data: fm } = matter(fs.readFileSync(path.join(CONTENT, file), "utf-8"));
    if (fm.draft === true) continue;

    const title = String(fm.title ?? slug);
    const tag = String(fm.tag ?? "Field Notes");

    // fit: start large, step down until the title holds in four lines
    let fontSize = 64;
    let lines = wrap(title, fontSize, 1010);
    while (lines.length > 4 && fontSize > 40) {
      fontSize -= 8;
      lines = wrap(title, fontSize, 1010);
    }
    const lineHeight = Math.round(fontSize * 1.18);
    const blockH = lines.length * lineHeight;
    const firstBaseline = Math.round(315 - blockH / 2 + fontSize * 0.8);

    const titleText = lines
      .map(
        (l, i) =>
          `<text x="96" y="${firstBaseline + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" fill="#f4efe6">${esc(l)}</text>`
      )
      .join("\n  ");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#15130f"/>
      <stop offset="55%" stop-color="#0f0e0d"/>
      <stop offset="100%" stop-color="#0b0a09"/>
    </linearGradient>
    <radialGradient id="glow" cx="26%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#7e6034" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#7e6034" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- a few copper traces, drawn the way the boards on the site are: 45s only -->
  <g stroke="#dba64b" stroke-opacity="0.18" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M0 560 L120 560 L180 500 L420 500"/>
    <path d="M0 596 L150 596 L226 520 L520 520"/>
    <path d="M1200 96 L1080 96 L1020 156 L760 156"/>
    <path d="M1200 60 L1050 60 L974 136 L700 136"/>
  </g>
  <g fill="#dba64b" fill-opacity="0.5">
    <circle cx="420" cy="500" r="6"/><circle cx="520" cy="520" r="6"/>
    <circle cx="760" cy="156" r="6"/><circle cx="700" cy="136" r="6"/>
  </g>

  <image xlink:href="${markURI}" x="96" y="72" width="64" height="64"/>
  <text x="178" y="114" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" fill="#aca395">MuffinByteLabs &#183; Field Notes</text>

  ${titleText}

  <text x="96" y="540" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24" fill="#8c8372">${esc(tag)} &#183; Ray Malik &#183; muffinbytelabs.com</text>

  <rect x="0" y="622" width="1200" height="8" fill="#dba64b" fill-opacity="0.85"/>
</svg>`;

    await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, `${slug}.png`));
    written++;
  }

  console.log(`${written} post OG cards written to public/og/`);
})();
