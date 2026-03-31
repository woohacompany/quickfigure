import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).severanceCalc;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/severance-calculator`,
      languages: { en: "/en/tools/severance-calculator", ko: "/ko/tools/severance-calculator", "x-default": "/en/tools/severance-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function SeveranceCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
