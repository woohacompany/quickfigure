"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

export default function PercentageCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.percentageCalc;
  const relatedPosts = getPostsByTool("percentage-calculator");

  // Mode 1: What is X% of Y?
  const [pct1, setPct1] = useState("");
  const [val1, setVal1] = useState("");
  const [res1, setRes1] = useState<string | null>(null);

  // Mode 2: X is what % of Y?
  const [partVal, setPartVal] = useState("");
  const [wholeVal, setWholeVal] = useState("");
  const [res2, setRes2] = useState<string | null>(null);

  // Mode 3: % change from X to Y
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");
  const [res3, setRes3] = useState<{ pct: string; direction: string } | null>(null);

  function calc1() {
    const p = parseFloat(pct1);
    const v = parseFloat(val1);
    if (isNaN(p) || isNaN(v)) return;
    const result = (p / 100) * v;
    setRes1(result.toLocaleString(undefined, { maximumFractionDigits: 4 }));
  }

  function calc2() {
    const part = parseFloat(partVal);
    const whole = parseFloat(wholeVal);
    if (isNaN(part) || isNaN(whole) || whole === 0) return;
    const result = (part / whole) * 100;
    setRes2(result.toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%");
  }

  function calc3() {
    const f = parseFloat(fromVal);
    const tt = parseFloat(toVal);
    if (isNaN(f) || isNaN(tt) || f === 0) return;
    const change = ((tt - f) / Math.abs(f)) * 100;
    setRes3({
      pct: Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%",
      direction: change >= 0 ? t.increase : t.decrease,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="percentage-calculator" locale={locale} />
      </header>

      <div className="space-y-6">
        {/* Mode 1: What is Y% of X? */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t.mode1Title}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder="50"
              className="w-28 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-500 font-medium">{t.of}</span>
            <input
              type="number"
              value={pct1}
              onChange={(e) => setPct1(e.target.value)}
              placeholder="20"
              className="w-24 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-500 font-medium">{t.pctIs}</span>
            <button
              onClick={calc1}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t.calculate}
            </button>
          </div>
          {res1 !== null && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 inline-block">
              <p className="text-2xl font-semibold tracking-tight">{res1}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.result}</p>
            </div>
          )}
        </div>

        {/* Mode 2: X is what % of Y? */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t.mode2Title}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={partVal}
              onChange={(e) => setPartVal(e.target.value)}
              placeholder="50"
              className="w-28 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-500 font-medium">{t.isWhatPctOf1}</span>
            <input
              type="number"
              value={wholeVal}
              onChange={(e) => setWholeVal(e.target.value)}
              placeholder="20"
              className="w-28 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-500 font-medium">{t.isWhatPctOf2}</span>
            <button
              onClick={calc2}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t.calculate}
            </button>
          </div>
          {res2 !== null && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 inline-block">
              <p className="text-2xl font-semibold tracking-tight">{res2}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.result}</p>
            </div>
          )}
        </div>

        {/* Mode 3: % change from X to Y */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold">{t.mode3Title}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-neutral-500 font-medium">{t.from}</span>
            <input
              type="number"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              placeholder="80"
              className="w-28 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-neutral-500 font-medium">{t.to}</span>
            <input
              type="number"
              value={toVal}
              onChange={(e) => setToVal(e.target.value)}
              placeholder="100"
              className="w-28 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={calc3}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t.calculate}
            </button>
          </div>
          {res3 !== null && (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 inline-block">
              <p className={`text-2xl font-semibold tracking-tight ${res3.direction === t.increase ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {res3.direction} {res3.pct}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.percentageChange}</p>
            </div>
          )}
        </div>
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
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

      {/* Related Tools */}
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
            href={`/${lang}/tools/compound-interest-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.compoundInterest}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.compoundInterestDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="percentage-calculator" locale={locale} />
      <ToolDisclaimer slug="percentage-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="percentage-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="percentage-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
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
