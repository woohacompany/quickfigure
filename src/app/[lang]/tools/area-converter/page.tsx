"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

const PYEONG_TO_SQM = 3.30579;

const COMMON_SIZES = [10, 15, 18, 20, 24, 25, 30, 32, 33, 34, 40, 50, 59, 60];

export default function AreaConverterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.areaConverter;
  const relatedPosts = getPostsByTool("area-converter");

  const [pyeong, setPyeong] = useState("");
  const [sqm, setSqm] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  function handlePyeongChange(value: string) {
    setPyeong(value);
    const num = parseFloat(value);
    if (!isNaN(num) && value !== "") {
      setSqm((num * PYEONG_TO_SQM).toFixed(2));
    } else {
      setSqm("");
    }
  }

  function handleSqmChange(value: string) {
    setSqm(value);
    const num = parseFloat(value);
    if (!isNaN(num) && value !== "") {
      setPyeong((num / PYEONG_TO_SQM).toFixed(2));
    } else {
      setPyeong("");
    }
  }

  function handleClear() {
    setPyeong("");
    setSqm("");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>

        <ToolAbout slug="area-converter" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2">{t.pyeong}</label>
            <input
              type="number"
              value={pyeong}
              onChange={(e) => handlePyeongChange(e.target.value)}
              placeholder="30"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
          <div className="pt-6 text-2xl text-neutral-400">&#8596;</div>
          <div className="flex-1">
            <label className="text-sm font-medium block mb-2">{t.sqm}</label>
            <input
              type="number"
              value={sqm}
              onChange={(e) => handleSqmChange(e.target.value)}
              placeholder="99.17"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          </div>
        </div>

        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          1 {t.pyeongUnit} = {PYEONG_TO_SQM} {t.sqmUnit}
        </div>

        <button
          onClick={handleClear}
          className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {t.clear}
        </button>
      </div>

      {/* Reference Table */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.referenceTable}</h2>
        <div
          ref={resultRef}
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left p-3 font-medium">
                  {t.pyeongUnit}
                </th>
                <th className="text-right p-3 font-medium">{t.sqmUnit}</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_SIZES.map((p) => (
                <tr
                  key={p}
                  className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer"
                  onClick={() => handlePyeongChange(String(p))}
                >
                  <td className="p-3">
                    {p} {t.pyeongUnit}
                  </td>
                  <td className="p-3 text-right">
                    {(p * PYEONG_TO_SQM).toFixed(2)} {t.sqmUnit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SaveResultImage
          targetRef={resultRef}
          toolName={t.title}
          slug="area-converter"
          labels={dict.saveImage}
        />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer p-4 font-medium">
                {item.q}
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: t.faqItems.map((item: { q: string; a: string }) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/unit-converter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.unitConverter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.unitConverterDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/rent-conversion-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.rentConversionCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.rentConversionCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="area-converter" locale={locale} />
      <ToolDisclaimer slug="area-converter" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="area-converter"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="area-converter"
        lang={lang}
        labels={dict.embed}
      />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">
            {dict.relatedArticles}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link
                  key={post.slug}
                  href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
                >
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
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
      )}
    </div>
  );
}
