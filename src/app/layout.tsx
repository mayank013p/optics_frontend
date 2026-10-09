import type { Metadata } from "next";
import "./globals.css";

import { ENV } from "@/lib/config";

const siteUrl = ENV.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Optics by Ivors — Modern Work & Project Management",
    template: "%s | Optics by Ivors",
  },
  description: "High-velocity project tracking, Kanban execution, collaborative wikis, and multi-tenant security architecture.",
  applicationName: "Optics",
  keywords: ["project management", "kanban", "sprints", "wiki", "collaboration", "developer tools", "ivors"],
  authors: [{ name: "Ivors Team", url: siteUrl }],
  creator: "Ivors",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Optics by Ivors",
    title: "Optics by Ivors — Modern Work & Project Management",
    description: "High-velocity project tracking, Kanban execution, collaborative wikis, and multi-tenant security architecture.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Optics by Ivors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optics by Ivors — Modern Work & Project Management",
    description: "High-velocity project tracking, Kanban execution, collaborative wikis, and multi-tenant security architecture.",
    images: ["/brand/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" data-theme="warm-cream" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('optics_theme') || localStorage.getItem('theme');
                  var theme = saved || 'warm-cream';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[var(--bg-primary)] text-[var(--text-main)]">
        {children}
      </body>
    </html>
  );
}
