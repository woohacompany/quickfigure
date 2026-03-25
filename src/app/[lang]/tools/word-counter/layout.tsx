import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).wordCounter;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    keywords: lang === "ko"
      ? ["글자수 세기", "글자수 카운터", "글자수 계산", "단어수 세기", "바이트 계산", "문자수 세기", "텍스트 분석", "SNS 글자수"]
      : ["word counter", "character counter", "word count", "letter counter", "text counter", "character count online", "word count tool"],
    alternates: {
      canonical: `/${lang}/tools/word-counter`,
      languages: { en: "/en/tools/word-counter", ko: "/ko/tools/word-counter" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function WordCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
