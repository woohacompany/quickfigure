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
    ? "상속세 계산기 - 2026년 세율 기준 자동 계산 | QuickFigure"
    : "Korea Inheritance Tax Calculator - 2026 Tax Rates | QuickFigure";
  const metaDescription = isKo
    ? "총 상속재산, 배우자공제, 일괄공제를 입력하면 상속세를 자동 계산합니다. 2026년 현행 세율표 적용. 무료 온라인 상속세 계산기."
    : "Calculate Korean inheritance tax automatically. Enter total inherited assets, spouse deduction, and lump-sum deduction. Based on 2026 tax brackets.";
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${lang}/tools/inheritance-tax-calculator`,
      languages: { en: "/en/tools/inheritance-tax-calculator", ko: "/ko/tools/inheritance-tax-calculator", "x-default": "/en/tools/inheritance-tax-calculator" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
  };
}

export default function InheritanceTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
