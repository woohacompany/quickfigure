import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "QuickFigure - Free Online Tools",
    template: "%s | QuickFigure",
  },
  description: "Free online tools for text analysis, counting, and more.",
  metadataBase: new URL("https://quickfigure.com"),
  openGraph: {
    type: "website",
    siteName: "QuickFigure",
    title: "QuickFigure - Free Online Tools",
    description: "Free online tools for text analysis, counting, and more.",
    url: "https://quickfigure.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9585100805467973" crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
