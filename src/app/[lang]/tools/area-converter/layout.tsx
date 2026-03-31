import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).areaConverter;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/area-converter`,
      languages: { en: "/en/tools/area-converter", ko: "/ko/tools/area-converter", "x-default": "/en/tools/area-converter" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function AreaConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
