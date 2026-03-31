import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).bmi;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/bmi-calculator`,
      languages: { en: "/en/tools/bmi-calculator", ko: "/ko/tools/bmi-calculator", "x-default": "/en/tools/bmi-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function BmiCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
