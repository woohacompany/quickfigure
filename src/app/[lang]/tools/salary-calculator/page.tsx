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

function calculateKoreanSalary(annual: number, dep: number, nonTaxableMonthly: number, includeSeverance: boolean) {
  const effectiveAnnual = includeSeverance ? annual * 12 / 13 : annual;
  const monthly = effectiveAnnual / 12;
  const taxableMonthly = Math.max(monthly - nonTaxableMonthly, 0);

  const nationalPension = Math.min(taxableMonthly * 0.045, 248850);
  const healthInsurance = taxableMonthly * 0.03545;
  const longTermCare = healthInsurance * 0.1295;
  const employmentInsurance = taxableMonthly * 0.009;

  let taxBase = effectiveAnnual - (nonTaxableMonthly * 12) - (effectiveAnnual * 0.15) - (1500000 * dep);
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
  const localIncomeTax = monthlyIncomeTax * 0.1;

  const totalDeductions = nationalPension + healthInsurance + longTermCare + employmentInsurance + monthlyIncomeTax + localIncomeTax;
  const netMonthly = monthly - totalDeductions;

  return {
    grossMonthly: monthly,
    totalDeductions,
    netMonthly,
    breakdown: { nationalPension, healthInsurance, longTermCare, employmentInsurance, monthlyIncomeTax, localIncomeTax },
  };
}

const SALARY_TABLE_AMOUNTS = [20000000, 25000000, 30000000, 35000000, 40000000, 45000000, 50000000, 55000000, 60000000, 65000000, 70000000, 75000000, 80000000, 90000000, 100000000];

export default function SalaryCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.salaryCalc;
  const relatedPosts = getPostsByTool("salary-calculator");

  const [currency, setCurrency] = useState<Currency>(locale === "ko" ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => currency === "KRW" ? formatKRW(v) : formatUSD(v);

  const [salary, setSalary] = useState("");
  const [dependents, setDependents] = useState("1");
  const [nonTaxable, setNonTaxable] = useState("200000");
  const [includeSeverance, setIncludeSeverance] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
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
      const dep = parseInt(dependents) || 1;
      const nonTax = parseFloat(nonTaxable) || 0;
      const calc = calculateKoreanSalary(annual, dep, nonTax, includeSeverance);

      setResult({
        grossMonthly: calc.grossMonthly,
        totalDeductions: calc.totalDeductions,
        netMonthly: calc.netMonthly,
        breakdown: [
          { label: t.nationalPension, amount: calc.breakdown.nationalPension },
          { label: t.healthInsurance, amount: calc.breakdown.healthInsurance },
          { label: t.longTermCare, amount: calc.breakdown.longTermCare },
          { label: t.employmentInsurance, amount: calc.breakdown.employmentInsurance },
          { label: t.incomeTax, amount: calc.breakdown.monthlyIncomeTax },
          { label: t.localIncomeTax, amount: calc.breakdown.localIncomeTax },
        ],
      });
    } else {
      const monthly = annual / 12;

      const socialSecurity = Math.min(annual, 168600) * 0.062 / 12;
      const medicare = annual * 0.0145 / 12;
      const additionalMedicare = annual > 200000 ? (annual - 200000) * 0.009 / 12 : 0;

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
          <label className="text-sm font-medium block mb-2">{t.annualSalary}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder={currency === "KRW" ? "50,000,000" : "75,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {salary && parseFloat(salary) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{unitHint(parseFloat(salary))}</p>
          )}
        </div>

        {locale === "ko" && (
          <>
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

            <div>
              <label className="text-sm font-medium block mb-2">{t.nonTaxable}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₩</span>
                <input
                  type="number"
                  value={nonTaxable}
                  onChange={(e) => setNonTaxable(e.target.value)}
                  placeholder="200,000"
                  className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{t.nonTaxableHint}</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">{t.includeSeverance}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setIncludeSeverance(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    !includeSeverance
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {t.severanceSeparate}
                </button>
                <button
                  onClick={() => setIncludeSeverance(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    includeSeverance
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {t.severanceIncluded}
                </button>
              </div>
            </div>
          </>
        )}

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
                <p className="text-2xl font-semibold tracking-tight">{fmt(result.grossMonthly)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.grossMonthly)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.grossMonthly}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                  -{fmt(result.totalDeductions)}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.totalDeductions)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalDeductions}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                  {fmt(result.netMonthly)}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">{unitHint(result.netMonthly)}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.netMonthly}</p>
              </div>
            </div>

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
                      <td className="p-3 text-right">{fmt(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-neutral-300 dark:border-neutral-600 font-semibold">
                    <td className="p-3">{t.totalDeductions}</td>
                    <td className="p-3 text-right">{fmt(result.totalDeductions)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <SaveResultImage targetRef={resultRef} toolName={t.title} slug="salary-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

      {/* Salary Reference Table (Korean only) */}
      {locale === "ko" && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">{t.salaryTable}</h2>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left p-3 font-medium">{t.salaryTableAnnual}</th>
                  <th className="text-right p-3 font-medium">{t.salaryTableDeductions}</th>
                  <th className="text-right p-3 font-medium">{t.salaryTableNet}</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE_AMOUNTS.map((amount) => {
                  const calc = calculateKoreanSalary(amount, 1, 200000, false);
                  return (
                    <tr
                      key={amount}
                      className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 cursor-pointer"
                      onClick={() => {
                        setSalary(String(amount));
                        setDependents("1");
                        setNonTaxable("200000");
                        setIncludeSeverance(false);
                        calculate();
                      }}
                    >
                      <td className="p-3">{(amount / 10000).toLocaleString("ko-KR")}{locale === "ko" ? "만원" : ""}</td>
                      <td className="p-3 text-right text-red-600 dark:text-red-400">
                        {Math.round(calc.totalDeductions).toLocaleString("ko-KR")}원
                      </td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400 font-medium">
                        {Math.round(calc.netMonthly).toLocaleString("ko-KR")}원
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            * {locale === "ko" ? "부양가족 1명, 비과세 20만원, 퇴직금 별도 기준" : "Based on 1 dependent, ₩200,000 non-taxable, severance separate"}
          </p>
        </section>
      )}

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
            href={`/${lang}/tools/severance-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.severanceCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.severanceCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="salary-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="salary-calculator"
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
