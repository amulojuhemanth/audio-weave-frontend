import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoundForge AI — Sound Effect Generator",
  description:
    "Create stunning sound effects from text descriptions. AI-powered sound generation for cinematic, game, and creative audio production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0c0c0e] text-zinc-100">{children}</body>
    </html>
  );
}
