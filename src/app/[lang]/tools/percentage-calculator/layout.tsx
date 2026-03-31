import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).percentageCalc;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/percentage-calculator`,
      languages: { en: "/en/tools/percentage-calculator", ko: "/ko/tools/percentage-calculator", "x-default": "/en/tools/percentage-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function PercentageCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
