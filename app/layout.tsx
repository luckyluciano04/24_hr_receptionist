import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://24hrreceptionist.com");

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase,
  title: "24hr Receptionist — Never Miss Another Call",
  description:
    "AI-powered receptionist that answers every call, captures every lead, and delivers the info straight to you — 24/7, no staff required.",
  openGraph: {
    title: "24hr Receptionist — Never Miss Another Call",
    description:
      "AI-powered receptionist for small businesses. Answers calls, captures leads, delivers info instantly.",
    images: ["/og-image.png"],
    url: "https://24hrreceptionist.com",
    siteName: "24hr Receptionist",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} antialiased bg-[#0A0A0A] text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
