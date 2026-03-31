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
    ? "연말정산 환급금 계산기 - 2026년 예상 환급액 미리 계산 | QuickFigure"
    : "Year-End Tax Refund Calculator - Korean Tax Settlement 2026 | QuickFigure";
  const description = isKo
    ? "연말정산 예상 환급액을 미리 계산하세요. 신용카드, 의료비, 교육비, 연금저축 공제 반영. 2026년 세법 기준."
    : "Estimate your Korean year-end tax refund. Includes card, medical, education, and pension deductions. 2026 tax law.";
  return {
    title,
    description,
    keywords: isKo
      ? ["연말정산 계산기", "연말정산 환급금", "연말정산 예상 환급액", "소득공제 계산", "세액공제 계산", "연말정산 미리보기", "13월의 월급", "연말정산 신용카드"]
      : ["korean year end tax settlement", "tax refund calculator korea", "income deduction calculator"],
    alternates: {
      canonical: `/${lang}/tools/year-end-tax-calculator`,
      languages: { en: "/en/tools/year-end-tax-calculator", ko: "/ko/tools/year-end-tax-calculator", "x-default": "/en/tools/year-end-tax-calculator" },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
