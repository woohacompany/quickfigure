"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

export default function RetirementCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.retirement;
  const currencySymbol = locale === "ko" ? "\u20A9" : "$";
  const fmtCurrency = (v: number) => {
    if (locale === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const relatedPosts = getPostsByTool("retirement-calculator");

  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [result, setResult] = useState<{
    projectedSavings: number;
    totalContributed: number;
    investmentGrowth: number;
    yearsToRetire: number;
  } | null>(null);

  function calculate() {
    const age = parseFloat(currentAge) || 0;
    const retAge = parseFloat(retirementAge) || 0;
    const savings = parseFloat(currentSavings) || 0;
    const monthly = parseFloat(monthlyContribution) || 0;
    const returnRate = (parseFloat(annualReturn) || 0) / 100;

    const yearsToRetire = retAge - age;
    if (yearsToRetire <= 0) return;

    const r = returnRate / 12;
    const n = yearsToRetire * 12;

    let projectedSavings: number;
    if (r === 0) {
      projectedSavings = savings + monthly * n;
    } else {
      const savingsFV = savings * Math.pow(1 + r, n);
      const contributionFV = monthly * ((Math.pow(1 + r, n) - 1) / r);
      projectedSavings = savingsFV + contributionFV;
    }

    const totalContributed = savings + monthly * n;
    const investmentGrowth = projectedSavings - totalContributed;

    setResult({ projectedSavings, totalContributed, investmentGrowth, yearsToRetire });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2">{t.currentAge}</label>
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            placeholder="30"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.retirementAge}</label>
          <input
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(e.target.value)}
            placeholder="65"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.currentSavings}</label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(e.target.value)}
            placeholder="50000"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.monthlyContribution}</label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            placeholder="500"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.annualReturn}</label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            placeholder="7"
            step="0.1"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">
                {fmtCurrency(result.projectedSavings)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.projectedSavings}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">
                {fmtCurrency(result.totalContributed)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalContributed}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">
                {fmtCurrency(result.investmentGrowth)}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalGrowth}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">
                {result.yearsToRetire}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.yearsToRetire}</p>
            </div>
          </div>
        )}
      </div>

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
