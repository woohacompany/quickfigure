import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).compoundInterest;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/compound-interest-calculator`,
      languages: { en: "/en/tools/compound-interest-calculator", ko: "/ko/tools/compound-interest-calculator", "x-default": "/en/tools/compound-interest-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function CompoundInterestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
