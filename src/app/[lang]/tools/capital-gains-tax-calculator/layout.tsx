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
    ? "양도소득세 계산기 - 2026년 부동산 양도세 자동 계산 | QuickFigure"
    : "Capital Gains Tax Calculator - Korean Property Tax 2026 | QuickFigure";
  const description = isKo
    ? "양도소득세 자동 계산기. 매도가·매수가·보유기간 입력하면 양도세, 장기보유공제, 실수령액을 계산. 2026년 세법 기준."
    : "Calculate Korean capital gains tax on real estate. Includes long-term holding deductions, single-home exemption, and multi-home surcharges. 2026 tax law.";
  return {
    title,
    description,
    keywords: isKo
      ? ["양도소득세 계산기", "양도세 계산", "양도소득세 세율", "부동산 양도세", "1세대 1주택 비과세", "장기보유특별공제", "양도소득세 신고", "다주택 양도세"]
      : ["capital gains tax calculator", "property tax korea", "capital gains tax rate", "real estate tax calculator korea"],
    alternates: {
      canonical: `/${lang}/tools/capital-gains-tax-calculator`,
      languages: { en: "/en/tools/capital-gains-tax-calculator", ko: "/ko/tools/capital-gains-tax-calculator" },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
