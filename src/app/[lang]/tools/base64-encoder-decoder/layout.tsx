import type { Metadata } from "next";
import { isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const isKo = lang === "ko";
  const metaTitle = isKo
    ? "Base64 인코더 & 디코더 - Base64 인코딩 디코딩 온라인 | QuickFigure"
    : "Base64 Encoder & Decoder - Encode/Decode Text & Images Online | QuickFigure";
  const metaDescription = isKo
    ? "무료 Base64 인코더/디코더. 텍스트·이미지 Base64 변환. 빠르고 안전한 클라이언트 처리. 가입 없이 무료."
    : "Free online Base64 encoder and decoder. Convert text and images to/from Base64. URL-safe mode, drag & drop. 100% client-side.";
  const keywords = isKo
    ? ["Base64 인코딩", "Base64 디코딩", "Base64 변환", "Base64 인코더", "Base64 디코더", "이미지 Base64 변환", "텍스트 Base64", "Base64 온라인"]
    : ["base64 encode", "base64 decode", "base64 encoder", "base64 decoder", "base64 converter", "base64 to text", "text to base64", "image to base64"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/base64-encoder-decoder`,
      languages: { en: "/en/tools/base64-encoder-decoder", ko: "/ko/tools/base64-encoder-decoder", "x-default": "/en/tools/base64-encoder-decoder" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://quickfigure.net/${lang}/tools/base64-encoder-decoder`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
