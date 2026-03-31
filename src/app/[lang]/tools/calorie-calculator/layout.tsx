import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).calorie;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/calorie-calculator`,
      languages: { en: "/en/tools/calorie-calculator", ko: "/ko/tools/calorie-calculator", "x-default": "/en/tools/calorie-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function CalorieCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
