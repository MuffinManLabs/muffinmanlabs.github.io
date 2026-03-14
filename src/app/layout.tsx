import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Ray Malik | MuffinManLabs",
  description: "Reversing binaries. Hunting malware. Learning in public.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#e0e0e0]`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html:
              "<!-- You know how to inspect element? You might belong here. Reach out: hurayrah92@gmail.com -->",
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
