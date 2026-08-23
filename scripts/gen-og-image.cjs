const sharp = require("sharp");
const fs = require("fs");

(async () => {
  // the mark, as white ink on transparent, so it can be dropped straight in
  const { data, info } = await sharp("public/logo-mark.png")
    .resize(200, 200, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i += 4) {
    px[i] = 244; px[i + 1] = 239; px[i + 2] = 230; px[i + 3] = data[i + 3];
  }
  const mark = await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png().toBuffer();
  const markURI = "data:image/png;base64," + mark.toString("base64");

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

  <image xlink:href="${markURI}" x="96" y="228" width="150" height="150"/>

  <text x="290" y="288" font-family="Georgia, 'Times New Roman', serif" font-size="82" fill="#f4efe6">MuffinByteLabs</text>
  <text x="292" y="344" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="30" fill="#aca395">Ray Malik &#183; PCB design engineer, working in KiCad</text>
  <text x="292" y="398" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24" fill="#8c8372">ESP32 boards &#183; 2 and 4-layer &#183; fab-ready manufacturing packages</text>

  <rect x="0" y="622" width="1200" height="8" fill="#dba64b" fill-opacity="0.85"/>
</svg>`;

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og.png");
  const st = fs.statSync("public/og.png");
  console.log("og.png written,", st.size, "bytes");
})();
