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

export default function FreelancerTaxPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.freelancerTax;
  const relatedPosts = getPostsByTool("freelancer-tax-calculator");

  const [currency, setCurrency] = useState<Currency>(locale === "ko" ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => currency === "KRW" ? formatKRW(v) : formatUSD(v);

  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    grossIncome: number;
    withholdingTax: number;
    netIncome: number;
    taxableIncome: number;
    estimatedRefund: number;
  } | null>(null);

  function calculate() {
    const gross = parseFloat(income) || 0;
    const exp = parseFloat(expenses) || 0;
    if (gross <= 0) return;

    if (locale === "ko") {
      const withholdingRate = 0.033;
      const withholdingTax = gross * withholdingRate;
      const netIncome = gross - withholdingTax;

      const taxableIncome = gross - exp;
      let actualTax = 0;
      if (taxableIncome <= 14000000) actualTax = taxableIncome * 0.06;
      else if (taxableIncome <= 50000000) actualTax = 840000 + (taxableIncome - 14000000) * 0.15;
      else if (taxableIncome <= 88000000) actualTax = 6240000 + (taxableIncome - 50000000) * 0.24;
      else if (taxableIncome <= 150000000) actualTax = 15360000 + (taxableIncome - 88000000) * 0.35;
      else if (taxableIncome <= 300000000) actualTax = 37060000 + (taxableIncome - 150000000) * 0.38;
      else if (taxableIncome <= 500000000) actualTax = 94060000 + (taxableIncome - 300000000) * 0.40;
      else if (taxableIncome <= 1000000000) actualTax = 174060000 + (taxableIncome - 500000000) * 0.42;
      else actualTax = 384060000 + (taxableIncome - 1000000000) * 0.45;
      if (actualTax < 0) actualTax = 0;

      const estimatedRefund = withholdingTax - actualTax;

      setResult({
        grossIncome: gross,
        withholdingTax,
        netIncome,
        taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
        estimatedRefund,
      });
    } else {
      const selfEmploymentTaxRate = 0.153;
      const selfEmploymentTax = (gross - exp) * selfEmploymentTaxRate;
      const deductibleSETax = selfEmploymentTax * 0.5;
      const taxableIncome = gross - exp - deductibleSETax;

      let federalTax = 0;
      if (taxableIncome <= 11600) federalTax = taxableIncome * 0.10;
      else if (taxableIncome <= 47150) federalTax = 1160 + (taxableIncome - 11600) * 0.12;
      else if (taxableIncome <= 100525) federalTax = 5426 + (taxableIncome - 47150) * 0.22;
      else if (taxableIncome <= 191950) federalTax = 17168.50 + (taxableIncome - 100525) * 0.24;
      else if (taxableIncome <= 243725) federalTax = 39110.50 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome <= 609350) federalTax = 55678.50 + (taxableIncome - 243725) * 0.35;
      else federalTax = 183647.25 + (taxableIncome - 609350) * 0.37;
      if (federalTax < 0) federalTax = 0;

      const totalTax = selfEmploymentTax + federalTax;
      const netIncome = gross - exp - totalTax;

      setResult({
        grossIncome: gross,
        withholdingTax: totalTax,
        netIncome,
        taxableIncome: taxableIncome > 0 ? taxableIncome : 0,
        estimatedRefund: selfEmploymentTax,
      });
    }
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
          <label className="text-sm font-medium block mb-2">{t.grossIncome}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder={currency === "KRW" ? "30,000,000" : "50,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {income && parseFloat(income) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(income))}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.expenses}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder={currency === "KRW" ? "5,000,000" : "10,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {expenses && parseFloat(expenses) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(expenses))}</p>
          )}
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.withholdingTax)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.withholdingTax)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.withholdingTax}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.netIncome)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.netIncome)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.netIncome}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.taxableIncome)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.taxableIncome)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.taxableIncome}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className={`text-2xl font-semibold tracking-tight ${locale === "ko" && result.estimatedRefund > 0 ? "text-green-600 dark:text-green-400" : locale === "ko" && result.estimatedRefund < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {locale === "ko" && result.estimatedRefund > 0 ? "+" : ""}
                  {fmt(Math.abs(result.estimatedRefund))}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(Math.abs(result.estimatedRefund))}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {locale === "ko"
                    ? result.estimatedRefund >= 0
                      ? t.estimatedRefund
                      : t.additionalTax
                    : t.selfEmploymentTax}
                </p>
              </div>
            </div>
            <SaveResultImage targetRef={resultRef} toolName={t.title} slug="freelancer-tax-calculator" labels={dict.saveImage} />
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

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/salary-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.salaryCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.salaryCalcDesc}
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

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="freelancer-tax-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="freelancer-tax-calculator"
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
