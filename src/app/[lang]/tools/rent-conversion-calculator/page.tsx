"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

export default function RentConversionCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.rentConversionCalc;
  const relatedPosts = getPostsByTool("rent-conversion-calculator");

  const [mode, setMode] = useState<"jeonseToMonthly" | "monthlyToJeonse">(
    "jeonseToMonthly"
  );
  const [conversionRate, setConversionRate] = useState("2.5");
  const [jeonseDeposit, setJeonseDeposit] = useState("");
  const [monthlyDeposit, setMonthlyDeposit] = useState("");
  const [rentDeposit, setRentDeposit] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    jeonseAmount: number;
    depositAmount: number;
    monthlyRentAmount: number;
    annualRent: number;
  } | null>(null);

  function calculate() {
    const rate = parseFloat(conversionRate) / 100;
    if (rate <= 0) return;

    if (mode === "jeonseToMonthly") {
      const jeonse = parseFloat(jeonseDeposit) || 0;
      const deposit = parseFloat(monthlyDeposit) || 0;
      if (jeonse <= 0 || deposit >= jeonse) return;
      const monthlyRentCalc = ((jeonse - deposit) * rate) / 12;
      setResult({
        jeonseAmount: jeonse,
        depositAmount: deposit,
        monthlyRentAmount: Math.round(monthlyRentCalc),
        annualRent: Math.round(monthlyRentCalc * 12),
      });
    } else {
      const deposit = parseFloat(rentDeposit) || 0;
      const rent = parseFloat(monthlyRent) || 0;
      if (rent <= 0) return;
      const jeonseCalc = deposit + (rent * 12) / rate;
      setResult({
        jeonseAmount: Math.round(jeonseCalc),
        depositAmount: deposit,
        monthlyRentAmount: rent,
        annualRent: Math.round(rent * 12),
      });
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString(locale === "ko" ? "ko-KR" : "en-US", {
      maximumFractionDigits: 0,
    });

  const sym = locale === "ko" ? "₩" : "$";

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("jeonseToMonthly");
              setResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "jeonseToMonthly"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.modeJeonseToMonthly}
          </button>
          <button
            onClick={() => {
              setMode("monthlyToJeonse");
              setResult(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "monthlyToJeonse"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.modeMonthlyToJeonse}
          </button>
        </div>

        {mode === "jeonseToMonthly" ? (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.jeonseDeposit}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {sym}
                </span>
                <input
                  type="number"
                  value={jeonseDeposit}
                  onChange={(e) => setJeonseDeposit(e.target.value)}
                  placeholder={locale === "ko" ? "300,000,000" : "300,000"}
                  className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.monthlyDeposit}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {sym}
                </span>
                <input
                  type="number"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(e.target.value)}
                  placeholder={locale === "ko" ? "50,000,000" : "50,000"}
                  className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.monthlyDeposit}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {sym}
                </span>
                <input
                  type="number"
                  value={rentDeposit}
                  onChange={(e) => setRentDeposit(e.target.value)}
                  placeholder={locale === "ko" ? "50,000,000" : "50,000"}
                  className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.monthlyRent}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                  {sym}
                </span>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  placeholder={locale === "ko" ? "500,000" : "500"}
                  className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium block mb-2">
            {t.conversionRate}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={conversionRate}
              onChange={(e) => setConversionRate(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              %
            </span>
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {sym}
                    {fmt(result.jeonseAmount)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.resultJeonse}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {sym}
                    {fmt(result.depositAmount)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.resultDeposit}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {sym}
                    {fmt(result.monthlyRentAmount)}
                    {locale === "ko" ? "/월" : "/mo"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.resultMonthlyRent}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.resultJeonse}
                      </td>
                      <td className="p-3 text-right">
                        {sym}
                        {fmt(result.jeonseAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.resultDeposit}
                      </td>
                      <td className="p-3 text-right">
                        {sym}
                        {fmt(result.depositAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.resultMonthlyRent}
                      </td>
                      <td className="p-3 text-right">
                        {sym}
                        {fmt(result.monthlyRentAmount)}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.resultAnnualRent}
                      </td>
                      <td className="p-3 text-right">
                        {sym}
                        {fmt(result.annualRent)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.conversionRate}
                      </td>
                      <td className="p-3 text-right">{conversionRate}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t.conversionRateInfo}
                </p>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={t.title}
              slug="rent-conversion-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

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
            href={`/${lang}/tools/loan-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.loanCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.loanCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/area-converter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.areaConverter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.areaConverterDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="rent-conversion-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="rent-conversion-calculator"
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
