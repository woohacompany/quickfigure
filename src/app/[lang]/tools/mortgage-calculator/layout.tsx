import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).mortgage;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/mortgage-calculator`,
      languages: { en: "/en/tools/mortgage-calculator", ko: "/ko/tools/mortgage-calculator", "x-default": "/en/tools/mortgage-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function MortgageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
