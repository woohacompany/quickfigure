import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).qrCode;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/qr-code-generator`,
      languages: { en: "/en/tools/qr-code-generator", ko: "/ko/tools/qr-code-generator", "x-default": "/en/tools/qr-code-generator" },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: "website" },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
