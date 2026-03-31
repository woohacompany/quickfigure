import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).weeklyPayCalc;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/weekly-pay-calculator`,
      languages: { en: "/en/tools/weekly-pay-calculator", ko: "/ko/tools/weekly-pay-calculator", "x-default": "/en/tools/weekly-pay-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function WeeklyPayCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
