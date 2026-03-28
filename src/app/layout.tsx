import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

export const metadata: Metadata = {
  title: "wörtl",
  description: "Das deutsche Wordle – errate das Wort in sechs Versuchen.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c4dff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/woertl/manifest.json" />
        <link rel="icon" href="/woertl/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/woertl/favicon.svg" />
        <link rel="apple-touch-icon" href="/woertl/apple-touch-icon.png" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
