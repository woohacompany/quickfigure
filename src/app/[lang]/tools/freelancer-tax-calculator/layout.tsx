import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).freelancerTax;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/tools/freelancer-tax-calculator`,
      languages: { en: "/en/tools/freelancer-tax-calculator", ko: "/ko/tools/freelancer-tax-calculator" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default function FreelancerTaxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
