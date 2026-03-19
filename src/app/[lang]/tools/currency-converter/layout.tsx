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
    ? "환율 계산기 - 실시간 환율 변환 | QuickFigure"
    : "Currency Converter - Real-Time Exchange Rates | QuickFigure";
  const metaDescription = isKo
    ? "실시간 환율로 통화를 변환하세요. 달러, 엔화, 유로 등 30개+ 통화 지원. 100% 무료."
    : "Convert currencies with real-time exchange rates. 30+ currencies supported. USD, EUR, JPY, KRW and more. 100% free.";
  const keywords = isKo
    ? ["환율", "환율 계산", "달러 원화", "엔화 환율", "환율 계산기", "달러 환율", "유로 환율", "환전", "오늘 환율", "실시간 환율", "원달러 환율"]
    : ["currency converter", "exchange rate", "USD to KRW", "currency calculator", "forex", "money converter"];
  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: `/${lang}/tools/currency-converter`,
      languages: { en: "/en/tools/currency-converter", ko: "/ko/tools/currency-converter" },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      url: `https://quickfigure.net/${lang}/tools/currency-converter`,
    },
  };
}

export default function CurrencyConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
