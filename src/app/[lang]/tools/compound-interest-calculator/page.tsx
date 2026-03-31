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
import { type Currency, getCurrencySymbol, formatCurrency, formatKRW, formatUSD } from "@/lib/currencyFormat";

export default function CompoundInterestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.compoundInterest;
  const relatedPosts = getPostsByTool("compound-interest-calculator");

  const [currency, setCurrency] = useState<Currency>(locale === "ko" ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => currency === "KRW" ? formatKRW(v) : formatUSD(v);

  const [principal, setPrincipal] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    futureValue: number;
    totalInterest: number;
    totalDeposited: number;
  } | null>(null);

  function calculate() {
    const P = parseFloat(principal) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const t = parseFloat(years) || 0;

    let n: number;
    if (frequency === "monthly") n = 12;
    else if (frequency === "quarterly") n = 4;
    else n = 1;

    let futureValue: number;
    if (r === 0) {
      futureValue = P + PMT * t * 12;
    } else {
      const rn = r / n;
      const nt = n * t;
      const compoundFactor = Math.pow(1 + rn, nt);
      const principalFV = P * compoundFactor;
      const periodsPerYear = n;
      const PMTperPeriod = PMT * (12 / periodsPerYear);
      const annuityFV = PMTperPeriod * ((compoundFactor - 1) / rn);
      futureValue = principalFV + annuityFV;
    }

    const totalDeposited = P + PMT * t * 12;
    const totalInterest = futureValue - totalDeposited;

    setResult({ futureValue, totalInterest, totalDeposited });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="compound-interest-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{locale === "ko" ? "통화" : "Currency"}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="KRW">₩ KRW</option>
            <option value="USD">$ USD</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.principal}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder={currency === "KRW" ? "10,000,000" : "10,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {principal && parseFloat(principal) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(principal))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.monthlyContribution}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              placeholder={currency === "KRW" ? "500,000" : "500"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {monthlyContribution && parseFloat(monthlyContribution) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(monthlyContribution))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.rate}</label>
          <div className="relative">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="7"
              step="0.1"
              className="w-full p-3 pr-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.years}</label>
          <div className="relative">
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="20"
              className="w-full p-3 pr-12 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{locale === "ko" ? "년" : "years"}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.frequency}</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">{t.monthly}</option>
            <option value="quarterly">{t.quarterly}</option>
            <option value="annually">{t.annually}</option>
          </select>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.futureValue)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.futureValue)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.result}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.totalInterest)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.totalInterest)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalInterest}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.totalDeposited)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.totalDeposited)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalDeposited}</p>
              </div>
            </div>
            <SaveResultImage targetRef={resultRef} toolName={t.title} slug="compound-interest-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

      <ToolHowItWorks slug="compound-interest-calculator" locale={locale} />
      <ToolDisclaimer slug="compound-interest-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="compound-interest-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="compound-interest-calculator"
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
