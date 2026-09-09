import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APPLE_TOUCH_ICON_DATA_URI } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Kalorix Fitatu - Licznik Kalorii & Makro",
  description: "Nowoczesna, minimalistyczna aplikacja do liczenia kalorii z asystentem AI i bazą przepisów",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kalorix",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href={APPLE_TOUCH_ICON_DATA_URI} />
        <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/kalorixxxxx/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/kalorixxxxx/icon-192.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="./favicon.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/kalorixxxxx/favicon.png" />
      </head>
      <body className="antialiased select-none bg-zinc-950 text-zinc-100 min-h-[100dvh] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
