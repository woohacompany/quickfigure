import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).privacy;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/privacy-policy`,
      languages: { en: "/en/privacy-policy", ko: "/ko/privacy-policy", "x-default": "/en/privacy-policy" },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      type: "website",
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) return null;
  const t = getDictionary(lang).privacy;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">{t.title}</h1>
      <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6">{t.lastUpdated}</p>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">{t.intro}</p>

      {/* Ad placeholder */}
      {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      <div className="space-y-8">
        {t.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
            <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
