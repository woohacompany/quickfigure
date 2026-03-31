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
    ? "타자 속도 측정 - 무료 온라인 타이핑 테스트 | QuickFigure"
    : "Typing Speed Test - Free Online WPM Test | QuickFigure";
  const metaDescription = isKo
    ? "한국어/영어 타자 속도를 측정하세요. WPM, 정확도, 등급까지 확인. 100% 무료."
    : "Test your typing speed in English or Korean. Measure WPM, accuracy, and get your grade. 100% free online typing test.";
  const keywords = isKo
    ? ["타자 속도", "타자 연습", "타자 속도 측정", "타이핑 테스트", "타자 속도 테스트", "타자 연습 사이트", "한타", "영타"]
    : ["typing speed test", "typing test", "WPM test", "typing practice", "keyboard speed test", "words per minute", "typing speed"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/typing-speed-test`,
      languages: { en: "/en/tools/typing-speed-test", ko: "/ko/tools/typing-speed-test", "x-default": "/en/tools/typing-speed-test" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://quickfigure.net/${lang}/tools/typing-speed-test`,
    },
  };
}

export default function TypingSpeedTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
