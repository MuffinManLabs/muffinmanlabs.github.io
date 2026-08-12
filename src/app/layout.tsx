import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  // real display cuts at large sizes instead of the default middle setting
  axes: ["SOFT", "WONK", "opsz"],
});

const TITLE = "MuffinByteLabs — KiCad PCB Design";
const DESCRIPTION =
  "Premium KiCad PCB design. Native KiCad 8–10 boards, pre-fab design reviews, and revisions — delivered as JLCPCB/PCBWay-ready packages with datasheet-grade documentation and a money-back guarantee.";
const SITE = "https://muffinbytelabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "KiCad PCB design",
    "PCB layout",
    "JLCPCB",
    "PCBWay",
    "ESP32 PCB",
    "schematic capture",
    "Gerber",
    "PCB design freelancer",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "MuffinByteLabs",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MuffinByteLabs — KiCad PCB design" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0c11",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} antialiased bg-[#0d0c11] text-[#d6d3cd]`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html:
              "<!-- You found the debug port. Nice. -->",
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
