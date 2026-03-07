import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).blog;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/blog`,
      languages: { en: "/en/blog", ko: "/ko/blog" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website" },
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
