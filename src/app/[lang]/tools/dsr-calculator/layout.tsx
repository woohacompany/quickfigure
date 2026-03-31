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
    ? "DSR 계산기 - 2026년 스트레스 DSR 기준 대출한도 계산 | QuickFigure"
    : "Korea DSR Calculator (Debt Service Ratio) - 2026 Stress DSR | QuickFigure";
  const metaDescription = isKo
    ? "연소득과 대출 조건 입력으로 DSR(총부채원리금상환비율)을 자동 계산합니다. 2026년 스트레스 DSR 3단계 반영. 은행별 대출 가능 한도까지 확인하세요."
    : "Calculate Korea's DSR (Debt Service Ratio) with 2026 Stress DSR Stage 3 rules. Check your maximum loan amount for banks and non-bank lenders.";
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${lang}/tools/dsr-calculator`,
      languages: { en: "/en/tools/dsr-calculator", ko: "/ko/tools/dsr-calculator", "x-default": "/en/tools/dsr-calculator" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
  };
}

export default function DsrCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
