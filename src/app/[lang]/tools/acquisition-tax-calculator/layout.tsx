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
    ? "취득세 계산기 - 2026년 부동산 주택 취득세 자동 계산 | QuickFigure"
    : "Acquisition Tax Calculator - Property Transfer Tax | QuickFigure";
  const metaDescription = isKo
    ? "2026년 기준 부동산 주택 취득세를 자동 계산합니다. 주택 수, 면적, 조정지역 여부에 따른 취득세, 지방교육세, 농어촌특별세, 생애최초 감면까지 한번에 확인하세요."
    : "Calculate Korean property acquisition tax automatically. Check acquisition tax, local education tax, rural special tax, and first-time homebuyer discount based on price, houses owned, area, and region.";
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/${lang}/tools/acquisition-tax-calculator`,
      languages: { en: "/en/tools/acquisition-tax-calculator", ko: "/ko/tools/acquisition-tax-calculator" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
  };
}

export default function AcquisitionTaxCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
