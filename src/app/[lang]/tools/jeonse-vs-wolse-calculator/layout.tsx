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
    ? "전세 vs 월세 비교 계산기 - 2026년 주거비 비교 분석 | QuickFigure"
    : "Jeonse vs Wolse Calculator - Korean Housing Cost Comparison | QuickFigure";
  const metaDescription = isKo
    ? "전세와 월세 중 어떤 게 유리한지 계산합니다. 전세대출 이자, 기회비용, 전월세 전환율까지 반영. 2026년 기준."
    : "Compare Korean Jeonse (lump-sum deposit) vs Wolse (monthly rent). Factor in loan interest, opportunity cost, and legal conversion rate.";
  const keywords = isKo
    ? ["전세 월세 비교", "전세 월세 뭐가 유리", "전세대출 이자 계산", "월세 전환율 계산기", "전월세 전환율", "전세 월세 계산기", "주거비 비교", "부동산 계산기"]
    : ["jeonse vs wolse", "korean housing calculator", "jeonse monthly rent comparison", "korean rent calculator", "housing cost comparison korea"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/jeonse-vs-wolse-calculator`,
      languages: { en: "/en/tools/jeonse-vs-wolse-calculator", ko: "/ko/tools/jeonse-vs-wolse-calculator" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://quickfigure.net/${lang}/tools/jeonse-vs-wolse-calculator`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
