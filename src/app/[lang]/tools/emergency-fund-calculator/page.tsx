"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";
import { type Currency, getCurrencySymbol, formatCurrency, formatKRW, formatUSD } from "@/lib/currencyFormat";

const TIER_KEYS = ["threeMonths", "sixMonths", "nineMonths", "twelveMonths"] as const;
const TIER_MONTHS = [3, 6, 9, 12];

export default function EmergencyFundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.emergencyFund;
  const relatedPosts = getPostsByTool("emergency-fund-calculator");

  const [currency, setCurrency] = useState<Currency>(locale === "ko" ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => currency === "KRW" ? formatKRW(v) : formatUSD(v);

  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [calculated, setCalculated] = useState(false);

  const expenses = parseFloat(monthlyExpenses) || 0;
  const savings = parseFloat(currentSavings) || 0;

  function calculate() {
    setCalculated(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
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
          <label className="text-sm font-medium block mb-2">{t.monthlyExpenses}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={monthlyExpenses}
              onChange={(e) => { setMonthlyExpenses(e.target.value); setCalculated(false); }}
              placeholder={currency === "KRW" ? "3,000,000" : "3,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {monthlyExpenses && parseFloat(monthlyExpenses) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(monthlyExpenses))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.currentSavings}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => { setCurrentSavings(e.target.value); setCalculated(false); }}
              placeholder={currency === "KRW" ? "5,000,000" : "5,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {currentSavings && parseFloat(currentSavings) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(currentSavings))}</p>
          )}
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {calculated && expenses > 0 && (
          <>
            <div ref={resultRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {TIER_MONTHS.map((months, i) => {
                const target = expenses * months;
                const needed = Math.max(0, target - savings);
                return (
                  <div
                    key={months}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4"
                  >
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {t[TIER_KEYS[i]]}
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {t.recommendedFund}
                    </p>
                    <p className="text-2xl font-semibold tracking-tight">{fmt(target)}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{unitHint(target)}</p>
                    {needed > 0 && (
                      <p className="text-sm mt-2 text-red-600 dark:text-red-400">
                        {t.amountNeeded}: {fmt(needed)} ({unitHint(needed)})
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <SaveResultImage targetRef={resultRef} toolName={t.title} slug="emergency-fund-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="emergency-fund-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="emergency-fund-calculator"
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
