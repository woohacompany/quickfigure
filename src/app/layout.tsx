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
        <script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nk" crossOrigin="anonymous" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__KAKAO_INIT__ = function() {
                if (window.Kakao && !window.Kakao.isInitialized() && "${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}") {
                  window.Kakao.init("${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ""}");
                }
              };
              if (document.readyState === "complete") window.__KAKAO_INIT__();
              else window.addEventListener("load", window.__KAKAO_INIT__);
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
