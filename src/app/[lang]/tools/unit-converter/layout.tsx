import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).unitConverter;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/unit-converter`,
      languages: { en: "/en/tools/unit-converter", ko: "/ko/tools/unit-converter", "x-default": "/en/tools/unit-converter" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
