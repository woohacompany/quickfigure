import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: `QuickFigure - ${t.home.hero}`,
    description: t.siteDescription,
    alternates: {
      canonical: `/${lang}`,
      languages: { en: "/en", ko: "/ko" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) return null;
  const t = getDictionary(lang);

  const tools = [
    {
      name: t.home.wordCounter,
      description: t.home.wordCounterDesc,
      href: `/${lang}/tools/word-counter`,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <section className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight">{t.home.hero}</h1>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">
          {t.home.heroSub}
        </p>
      </section>

      {/* Ad placeholder */}
      {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      {/* Text Tools */}
      <section>
        <h2 className="text-xl font-semibold mb-4">{t.home.textTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-neutral-400 dark:text-neutral-500">
          {t.home.moreToolsComing}
        </p>
      </section>
    </div>
  );
}
