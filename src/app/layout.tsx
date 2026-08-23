import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
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

/* one display face, used only for the name and section headings */
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

const TITLE = "Ray Malik — PCB Design Engineer | KiCad";
const DESCRIPTION =
  "PCB design engineer working in KiCad. ESP32 boards — 2 and 4-layer, RF modules, USB, power paths and protected field I/O — taken from schematic capture to a manufacturing package a fab accepts first try.";

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
    "4-layer PCB design",
    "buck converter layout",
    "opto-isolated 24V IO",
    "schematic capture",
    "Gerber",
    "PCB design freelancer",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "Ray Malik · MuffinByteLabs",
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
  themeColor: "#0f0e0d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} antialiased`}
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
