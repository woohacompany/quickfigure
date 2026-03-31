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
    ? "교통사고 합의금 계산기 - 위자료·휴업손해·과실비율 자동 계산 | QuickFigure"
    : "Korea Traffic Accident Settlement Calculator - Estimate Compensation | QuickFigure";
  const metaDescription = isKo
    ? "상해급수, 치료기간, 과실비율을 입력하면 교통사고 합의금을 예상 계산합니다. 위자료, 휴업손해, 향후치료비 항목별 상세 내역까지."
    : "Estimate Korean traffic accident settlement compensation. Calculate consolation money, lost wages, medical costs by injury grade and fault ratio.";
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${lang}/tools/accident-settlement-calculator`,
      languages: { en: "/en/tools/accident-settlement-calculator", ko: "/ko/tools/accident-settlement-calculator", "x-default": "/en/tools/accident-settlement-calculator" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
  };
}

export default function AccidentSettlementCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
