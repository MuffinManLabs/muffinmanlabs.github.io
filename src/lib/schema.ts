/* ════════════════════════════════════════════════════════════════════════
   JSON-LD — the machine-readable version of who this is and what he does.

   Search engines will not infer "freelance PCB designer, works in KiCad,
   contactable here" from prose, and for a one-person practice that inference
   is the whole point of being indexed at all. Everything below is a fact
   stated elsewhere on the site.

   Deliberately absent: aggregateRating, priceRange, postal address,
   telephone. Structured data is a claim made to a search engine in a format
   built for trust; inventing any of those is worse than omitting them.
   ════════════════════════════════════════════════════════════════════════ */

export const SITE = "https://muffinbytelabs.com";
export const EMAIL = "muffinbytelabs@gmail.com";
export const GITHUB_ORG = "https://github.com/MuffinByteLabs";
export const BOARD_REPO = "https://github.com/MuffinByteLabs/esp32s3-plant-monitor";

const PERSON_ID = `${SITE}/#ray`;
const SERVICE_ID = `${SITE}/#practice`;

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Ray Malik",
  url: SITE,
  email: `mailto:${EMAIL}`,
  image: `${SITE}/face_shot.webp`,
  jobTitle: "PCB Design Engineer",
  sameAs: [GITHUB_ORG],
  description:
    "PCB design engineer working in KiCad — schematic capture, 2 and 4-layer layout, and the complete manufacturing package.",
  knowsAbout: [
    "KiCad",
    "PCB layout",
    "Schematic capture",
    "ESP32",
    "Design for manufacturing",
    "Signal integrity",
    "Power electronics",
    "Embedded systems",
  ],
};

/** Home page: the person, and the practice they run. */
export const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    {
      "@type": "ProfessionalService",
      "@id": SERVICE_ID,
      name: "MuffinByteLabs",
      url: SITE,
      email: `mailto:${EMAIL}`,
      logo: `${SITE}/logo-mark.png`,
      image: `${SITE}/og.png`,
      founder: { "@id": PERSON_ID },
      sameAs: [GITHUB_ORG],
      description:
        "Freelance PCB design: schematic capture, 2 and 4-layer layout in KiCad, and a JLCPCB-ready manufacturing package — Gerbers, drill, BOM with real part numbers, CPL, and DRC/ERC-clean proof.",
      areaServed: "Worldwide — remote",
      serviceType: [
        "PCB design",
        "PCB layout",
        "Schematic capture",
        "Pre-fabrication design review",
        "Schematic conversion to KiCad",
        "PCB debug and bring-up",
        "Manufacturing package preparation",
      ],
    },
    {
      /* The board project itself, published open hardware. Claimed here
         because it is a real artifact at a real URL, not a description. */
      /* Both types: it is source you can build from, and a design work.
         No `programmingLanguage` — KiCad is an EDA tool, not a language, and
         this file does not make claims it cannot stand behind. The licence is
         the specific SPDX identifier, not the CERN OHL family landing page,
         which also covers the W and S variants this project does not use.
         No `isPartOf`: the repository is not part of this website. */
      "@type": ["SoftwareSourceCode", "CreativeWork"],
      "@id": `${SITE}/#pcb1`,
      name: "PCB 1 — ESP32-S3 Wi-Fi Plant Monitor",
      description:
        "Open-hardware KiCad 10 project for a 4-layer ESP32-S3 Wi-Fi sensor board: schematic, layout, the frozen JLCPCB manufacturing package, design document, design reviews and bring-up guide.",
      codeRepository: BOARD_REPO,
      url: BOARD_REPO,
      license: "https://spdx.org/licenses/CERN-OHL-P-2.0.html",
      author: { "@id": PERSON_ID },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "MuffinByteLabs",
      publisher: { "@id": SERVICE_ID },
      inLanguage: "en",
    },
  ],
};

/** A Field Note. `image` is the post's own OG card when one was generated,
    site-relative (e.g. "/og/slug.png"); the shared card is the fallback. */
export function postSchema(
  post: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    tag: string;
  },
  image?: string
) {
  const url = `${SITE}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": url,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.excerpt,
    /* no separate dateModified: the post has one date and pretending it was
       revised later is exactly the kind of small lie this file avoids */
    datePublished: post.date,
    articleSection: post.tag,
    inLanguage: "en",
    image: `${SITE}${image ?? "/og.png"}`,
    /* Minimal inline nodes rather than bare @id references: search engines
       parse each page's structured data standalone, so an @id pointing at a
       node that only exists in the homepage's @graph resolves to nothing and
       the post loses Article eligibility on missing author.name. */
    author: { "@type": "Person", "@id": PERSON_ID, name: "Ray Malik", url: SITE },
    publisher: { "@type": "Organization", "@id": SERVICE_ID, name: "MuffinByteLabs", url: SITE },
    isPartOf: { "@id": `${SITE}/#website` },
  };
}

/** Renders as a <script type="application/ld+json"> payload. */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
