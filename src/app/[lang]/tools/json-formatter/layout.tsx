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
    ? "JSON 포맷터 - JSON 정리, 유효성 검사, 뷰어 온라인 | QuickFigure"
    : "JSON Formatter - Beautify, Minify, Validate & Tree View Online | QuickFigure";
  const metaDescription = isKo
    ? "무료 온라인 JSON 포맷터. JSON을 보기 좋게 정리하고 유효성 검사까지. 트리 뷰, 구문 강조, 파일 업로드 지원. 가입 없이 무료."
    : "Free online JSON formatter and validator. Beautify, minify, validate JSON with syntax highlighting and tree view. Upload files, download results. No signup needed.";
  const keywords = isKo
    ? ["JSON 포맷터", "JSON 정리", "JSON 유효성 검사", "JSON 뷰어", "JSON beautify", "JSON minify", "JSON 변환", "JSON 포맷"]
    : ["json formatter", "json beautifier", "json validator", "format json online", "pretty print json", "json viewer", "json minifier", "json lint"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/json-formatter`,
      languages: { en: "/en/tools/json-formatter", ko: "/ko/tools/json-formatter", "x-default": "/en/tools/json-formatter" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://quickfigure.net/${lang}/tools/json-formatter`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
