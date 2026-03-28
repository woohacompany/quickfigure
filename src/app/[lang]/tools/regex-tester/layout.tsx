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
  const title = isKo
    ? "정규식 테스터 - 정규표현식 실시간 테스트 & 매칭 | QuickFigure"
    : "Regex Tester - Test Regular Expressions Online | QuickFigure";
  const description = isKo
    ? "정규표현식을 실시간으로 테스트하세요. 매칭 하이라이트, 캡처 그룹, 자주 쓰는 프리셋 제공. 가입 없이 무료."
    : "Test regular expressions in real-time. Match highlighting, capture groups, common presets. Free, no signup needed.";
  return {
    title,
    description,
    keywords: isKo
      ? ["정규식 테스터", "정규표현식 테스트", "regex 테스터", "정규식 검사", "정규표현식 연습", "regex 매칭", "정규식 패턴", "regex 검증"]
      : ["regex tester", "regular expression tester", "regex online", "regex matcher", "regex checker", "regex validator", "test regex", "regex101"],
    alternates: {
      canonical: `/${lang}/tools/regex-tester`,
      languages: { en: "/en/tools/regex-tester", ko: "/ko/tools/regex-tester" },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
