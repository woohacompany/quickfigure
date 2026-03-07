"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import { type Currency, getCurrencySymbol, formatCurrency, formatKRW, formatUSD } from "@/lib/currencyFormat";

export default function MortgageCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.mortgage;
  const relatedPosts = getPostsByTool("mortgage-calculator");

  const [currency, setCurrency] = useState<Currency>(locale === "ko" ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => currency === "KRW" ? formatKRW(v) : formatUSD(v);

  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    loanAmount: number;
  } | null>(null);

  function calculate() {
    const price = parseFloat(homePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const annualRate = (parseFloat(interestRate) || 0) / 100;
    const termYears = parseFloat(loanTerm) || 0;

    const loanAmount = price - down;
    const r = annualRate / 12;
    const n = termYears * 12;

    let monthlyPayment: number;
    if (r === 0) {
      monthlyPayment = n > 0 ? loanAmount / n : 0;
    } else {
      const factor = Math.pow(1 + r, n);
      monthlyPayment = loanAmount * (r * factor) / (factor - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - loanAmount;

    setResult({ monthlyPayment, totalPayment, totalInterest, loanAmount });
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
          <label className="text-sm font-medium block mb-2">{t.homePrice}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(e.target.value)}
              placeholder={currency === "KRW" ? "500,000,000" : "400,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {homePrice && parseFloat(homePrice) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(homePrice))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.downPayment}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder={currency === "KRW" ? "100,000,000" : "80,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {downPayment && parseFloat(downPayment) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(downPayment))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.interestRate}</label>
          <div className="relative">
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="6.5"
              step="0.1"
              className="w-full p-3 pr-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.loanTerm}</label>
          <div className="relative">
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="30"
              className="w-full p-3 pr-12 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{locale === "ko" ? "년" : "years"}</span>
          </div>
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
              <p className="text-2xl font-semibold tracking-tight">{fmt(result.monthlyPayment)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.monthlyPayment)}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.monthlyPayment}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">{fmt(result.loanAmount)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.loanAmount)}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.loanAmount}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">{fmt(result.totalPayment)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.totalPayment)}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalPayment}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
              <p className="text-2xl font-semibold tracking-tight">{fmt(result.totalInterest)}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.totalInterest)}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalInterest}</p>
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
