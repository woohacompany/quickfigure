import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).nationalPensionCalc;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/national-pension-calculator`,
      languages: { en: "/en/tools/national-pension-calculator", ko: "/ko/tools/national-pension-calculator", "x-default": "/en/tools/national-pension-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function NationalPensionCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
