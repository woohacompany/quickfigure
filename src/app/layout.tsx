import type { Metadata } from "next";
import Script from "next/script";
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
  metadataBase: new URL("https://www.quickfigure.net"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "QuickFigure",
    title: "QuickFigure - Free Online Tools",
    description: "Free online tools for text analysis, counting, and more.",
    url: "https://www.quickfigure.net",
  },
  other: {
    "naver-site-verification": "3c02b83df67a4cd6c4ce2016bef7e406bc2418d1",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var APP_KEY = "${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}";
                window.__KAKAO_APP_KEY__ = APP_KEY;
                window.__KAKAO_READY__ = false;

                window.__KAKAO_INIT__ = function() {
                  console.log("[Kakao] init called, key exists:", !!APP_KEY, "SDK loaded:", !!window.Kakao);
                  if (!APP_KEY) { console.warn("[Kakao] NEXT_PUBLIC_KAKAO_APP_KEY is empty"); return false; }
                  if (!window.Kakao) { console.warn("[Kakao] SDK not loaded yet"); return false; }
                  if (window.Kakao.isInitialized()) { console.log("[Kakao] Already initialized"); window.__KAKAO_READY__ = true; return true; }
                  try {
                    window.Kakao.init(APP_KEY);
                    window.__KAKAO_READY__ = window.Kakao.isInitialized();
                    console.log("[Kakao] init success:", window.__KAKAO_READY__);
                  } catch(e) { console.error("[Kakao] init error:", e); }
                  return window.__KAKAO_READY__;
                };

                var s = document.createElement("script");
                s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
                s.crossOrigin = "anonymous";
                s.async = true;
                s.onload = function() {
                  console.log("[Kakao] SDK script loaded");
                  window.__KAKAO_INIT__();
                };
                s.onerror = function() { console.error("[Kakao] SDK script failed to load"); };
                document.head.appendChild(s);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-EVBRPZ64BJ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-EVBRPZ64BJ');`}
        </Script>
      </body>
    </html>
  );
}
