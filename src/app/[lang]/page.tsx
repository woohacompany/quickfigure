import Link from "next/link";
import type { Metadata } from "next";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { blogPosts, categoryLabels } from "@/lib/blog";

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

  const textTools = [
    { name: t.home.wordCounter, description: t.home.wordCounterDesc, href: `/${lang}/tools/word-counter` },
    { name: t.home.caseConverter, description: t.home.caseConverterDesc, href: `/${lang}/tools/case-converter` },
  ];

  const generatorTools = [
    { name: t.home.loremIpsum, description: t.home.loremIpsumDesc, href: `/${lang}/tools/lorem-ipsum-generator` },
    { name: t.home.passwordGenerator, description: t.home.passwordGeneratorDesc, href: `/${lang}/tools/password-generator` },
  ];

  const devTools = [
    { name: t.home.jsonFormatter, description: t.home.jsonFormatterDesc, href: `/${lang}/tools/json-formatter` },
    { name: t.home.base64, description: t.home.base64Desc, href: `/${lang}/tools/base64-encoder-decoder` },
  ];

  function ToolGrid({ tools }: { tools: { name: string; description: string; href: string }[] }) {
    return (
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
    );
  }

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

      <div className="space-y-12">
        {/* Text Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.textTools}</h2>
          <ToolGrid tools={textTools} />
        </section>

        {/* Generator Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.generatorTools}</h2>
          <ToolGrid tools={generatorTools} />
        </section>

        {/* Developer Tools */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t.home.devTools}</h2>
          <ToolGrid tools={devTools} />
        </section>
      </div>

      {/* Latest Blog Posts */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{t.blog.latestPosts}</h2>
          <Link
            href={`/${lang}/blog`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.blog.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(0, 3).map((post) => {
            const tr = post.translations[lang as Locale];
            return (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                    {categoryLabels[post.category][lang as Locale]}
                  </span>
                  <span className="text-xs text-neutral-400">{post.date}</span>
                </div>
                <h3 className="font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tr.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {tr.summary}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
