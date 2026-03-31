import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).loremIpsum;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/lorem-ipsum-generator`,
      languages: { en: "/en/tools/lorem-ipsum-generator", ko: "/ko/tools/lorem-ipsum-generator", "x-default": "/en/tools/lorem-ipsum-generator" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
