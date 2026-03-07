import type { Metadata } from "next";
import { getDictionary, isValidLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang).contact;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `/${lang}/contact`,
      languages: { en: "/en/contact", ko: "/ko/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) return null;
  const t = getDictionary(lang).contact;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-3">{t.title}</h1>
      <p className="text-neutral-500 dark:text-neutral-400 mb-10">{t.description}</p>

      {/* Ad placeholder */}
      {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h2 className="text-lg font-semibold mb-2">{t.email}</h2>
        <a
          href={`mailto:${t.emailAddress}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-lg"
        >
          {t.emailAddress}
        </a>
        <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">{t.emailNote}</p>
      </div>
    </div>
  );
}
