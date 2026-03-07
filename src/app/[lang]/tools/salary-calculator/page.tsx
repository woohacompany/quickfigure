"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

export default function SalaryCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.salaryCalc;
  const currencySymbol = locale === "ko" ? "\u20A9" : "$";
  const fmtCurrency = (v: number) => {
    if (locale === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const relatedPosts = getPostsByTool("salary-calculator");

  const [salary, setSalary] = useState("");
  const [dependents, setDependents] = useState("1");
  const [result, setResult] = useState<{
    grossMonthly: number;
    totalDeductions: number;
    netMonthly: number;
    breakdown: { label: string; amount: number }[];
  } | null>(null);

  function calculate() {
    const annual = parseFloat(salary) || 0;
    if (annual <= 0) return;

    if (locale === "ko") {
      // Korean salary calculation: 4대보험 + 소득세 + 지방소득세
      const monthly = annual / 12;
      const nationalPension = Math.min(monthly * 0.045, 248850); // 국민연금 4.5%
      const healthInsurance = monthly * 0.03545; // 건강보험 3.545%
      const longTermCare = healthInsurance * 0.1295; // 장기요양보험 12.95%
      const employmentInsurance = monthly * 0.009; // 고용보험 0.9%

      // Simplified income tax based on annual salary
      const dep = parseInt(dependents) || 1;
      let taxBase = annual - (annual * 0.15) - (1500000 * dep); // 근로소득공제 + 인적공제
      if (taxBase < 0) taxBase = 0;

      let annualTax = 0;
      if (taxBase <= 14000000) annualTax = taxBase * 0.06;
      else if (taxBase <= 50000000) annualTax = 840000 + (taxBase - 14000000) * 0.15;
      else if (taxBase <= 88000000) annualTax = 6240000 + (taxBase - 50000000) * 0.24;
      else if (taxBase <= 150000000) annualTax = 15360000 + (taxBase - 88000000) * 0.35;
      else if (taxBase <= 300000000) annualTax = 37060000 + (taxBase - 150000000) * 0.38;
      else if (taxBase <= 500000000) annualTax = 94060000 + (taxBase - 300000000) * 0.40;
      else if (taxBase <= 1000000000) annualTax = 174060000 + (taxBase - 500000000) * 0.42;
      else annualTax = 384060000 + (taxBase - 1000000000) * 0.45;

      const monthlyIncomeTax = annualTax / 12;
      const localIncomeTax = monthlyIncomeTax * 0.1; // 지방소득세 10%

      const totalDeductions = nationalPension + healthInsurance + longTermCare + employmentInsurance + monthlyIncomeTax + localIncomeTax;
      const netMonthly = monthly - totalDeductions;

      setResult({
        grossMonthly: monthly,
        totalDeductions,
        netMonthly,
        breakdown: [
          { label: t.nationalPension, amount: nationalPension },
          { label: t.healthInsurance, amount: healthInsurance },
          { label: t.longTermCare, amount: longTermCare },
          { label: t.employmentInsurance, amount: employmentInsurance },
          { label: t.incomeTax, amount: monthlyIncomeTax },
          { label: t.localIncomeTax, amount: localIncomeTax },
        ],
      });
    } else {
      // US salary calculation: Federal + FICA
      const monthly = annual / 12;

      // FICA taxes
      const socialSecurity = Math.min(annual, 168600) * 0.062 / 12;
      const medicare = annual * 0.0145 / 12;
      const additionalMedicare = annual > 200000 ? (annual - 200000) * 0.009 / 12 : 0;

      // Federal income tax (2025 single filer, standard deduction $14,600)
      const standardDeduction = 14600;
      let taxableIncome = annual - standardDeduction;
      if (taxableIncome < 0) taxableIncome = 0;

      let annualFedTax = 0;
      if (taxableIncome <= 11600) annualFedTax = taxableIncome * 0.10;
      else if (taxableIncome <= 47150) annualFedTax = 1160 + (taxableIncome - 11600) * 0.12;
      else if (taxableIncome <= 100525) annualFedTax = 5426 + (taxableIncome - 47150) * 0.22;
      else if (taxableIncome <= 191950) annualFedTax = 17168.50 + (taxableIncome - 100525) * 0.24;
      else if (taxableIncome <= 243725) annualFedTax = 39110.50 + (taxableIncome - 191950) * 0.32;
      else if (taxableIncome <= 609350) annualFedTax = 55678.50 + (taxableIncome - 243725) * 0.35;
      else annualFedTax = 183647.25 + (taxableIncome - 609350) * 0.37;

      const monthlyFedTax = annualFedTax / 12;

      const totalDeductions = socialSecurity + medicare + additionalMedicare + monthlyFedTax;
      const netMonthly = monthly - totalDeductions;

      setResult({
        grossMonthly: monthly,
        totalDeductions,
        netMonthly,
        breakdown: [
          { label: t.federalTax, amount: monthlyFedTax },
          { label: t.socialSecurity, amount: socialSecurity },
          { label: t.medicareTax, amount: medicare + additionalMedicare },
        ],
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
        <div>
          <label className="text-sm font-medium block mb-2">{t.annualSalary}</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder={locale === "ko" ? "50000000" : "75000"}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {locale === "ko" && (
          <div>
            <label className="text-sm font-medium block mb-2">{t.dependents}</label>
            <select
              value={dependents}
              onChange={(e) => setDependents(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1{t.person}</option>
              <option value="2">2{t.person}</option>
              <option value="3">3{t.person}</option>
              <option value="4">4{t.person}</option>
              <option value="5">5{t.person}</option>
            </select>
          </div>
        )}

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <div className="space-y-4 mt-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {fmtCurrency(result.grossMonthly)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.grossMonthly}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                  -{fmtCurrency(result.totalDeductions)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalDeductions}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                  {fmtCurrency(result.netMonthly)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.netMonthly}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="text-left p-3 font-medium">{t.deductionItem}</th>
                    <th className="text-right p-3 font-medium">{t.monthlyAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((item, i) => (
                    <tr key={i} className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{item.label}</td>
                      <td className="p-3 text-right">{fmtCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-neutral-300 dark:border-neutral-600 font-semibold">
                    <td className="p-3">{t.totalDeductions}</td>
                    <td className="p-3 text-right">{fmtCurrency(result.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
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

      {/* FAQ Schema Markup */}
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
            href={`/${lang}/tools/freelancer-tax-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.freelancerTax}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.freelancerTaxDesc}
            </p>
          </Link>
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
        </div>
      </section>

      {/* Related Blog Posts */}
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
