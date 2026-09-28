import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { getSiteUrl, site } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Search real jobs across Dubai, Abu Dhabi, Sharjah and the rest of the UAE. Listings come from authorized sources and direct employers.",
  applicationName: site.name,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: "Real UAE jobs, aggregated from authorized sources.",
    siteName: site.name,
    locale: "en_AE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
