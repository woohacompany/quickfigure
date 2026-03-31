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

interface TaxBracketResult {
  bracket: string;
  rate: string;
  amount: number;
}

const KO_BRACKETS = [
  { min: 0, max: 14000000, rate: 0.06, base: 0, label: "~1,400만" },
  { min: 14000000, max: 50000000, rate: 0.15, base: 840000, label: "1,400만~5,000만" },
  { min: 50000000, max: 88000000, rate: 0.24, base: 6240000, label: "5,000만~8,800만" },
  { min: 88000000, max: 150000000, rate: 0.35, base: 15360000, label: "8,800만~1.5억" },
  { min: 150000000, max: 300000000, rate: 0.38, base: 37060000, label: "1.5억~3억" },
  { min: 300000000, max: 500000000, rate: 0.40, base: 94060000, label: "3억~5억" },
  { min: 500000000, max: 1000000000, rate: 0.42, base: 174060000, label: "5억~10억" },
  { min: 1000000000, max: Infinity, rate: 0.45, base: 384060000, label: "10억 초과" },
];

const US_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10, base: 0, label: "$0 - $11,600" },
  { min: 11600, max: 47150, rate: 0.12, base: 1160, label: "$11,600 - $47,150" },
  { min: 47150, max: 100525, rate: 0.22, base: 5426, label: "$47,150 - $100,525" },
  { min: 100525, max: 191950, rate: 0.24, base: 17168.50, label: "$100,525 - $191,950" },
  { min: 191950, max: 243725, rate: 0.32, base: 39110.50, label: "$191,950 - $243,725" },
  { min: 243725, max: 609350, rate: 0.35, base: 55678.50, label: "$243,725 - $609,350" },
  { min: 609350, max: Infinity, rate: 0.37, base: 183647.25, label: "$609,350+" },
];

function calculateTax(taxableIncome: number, brackets: typeof KO_BRACKETS): { tax: number; bracketResults: TaxBracketResult[]; appliedRate: string } {
  if (taxableIncome <= 0) return { tax: 0, bracketResults: [], appliedRate: "0%" };

  const bracketResults: TaxBracketResult[] = [];
  let appliedRate = "0%";

  for (const b of brackets) {
    if (taxableIncome <= b.min) {
      bracketResults.push({ bracket: b.label, rate: `${b.rate * 100}%`, amount: 0 });
      continue;
    }
    const taxableInBracket = Math.min(taxableIncome, b.max) - b.min;
    const taxInBracket = taxableInBracket * b.rate;
    bracketResults.push({ bracket: b.label, rate: `${b.rate * 100}%`, amount: taxInBracket });
    if (taxableIncome > b.min) appliedRate = `${b.rate * 100}%`;
  }

  // Use cumulative formula
  let tax = 0;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      tax = brackets[i].base + (taxableIncome - brackets[i].min) * brackets[i].rate;
      break;
    }
  }

  return { tax: Math.max(0, tax), bracketResults, appliedRate };
}

export default function IncomeTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("income-tax-calculator");

  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [taxCredits, setTaxCredits] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    grossIncome: number;
    totalDeductions: number;
    taxableIncome: number;
    calculatedTax: number;
    taxCreditsAmount: number;
    determinedTax: number;
    localTax: number;
    totalTax: number;
    effectiveRate: number;
    appliedRate: string;
    bracketResults: TaxBracketResult[];
  } | null>(null);

  function calculate() {
    const gross = parseFloat(income) || 0;
    const deduct = parseFloat(deductions) || 0;
    const credits = parseFloat(taxCredits) || 0;
    if (gross <= 0) return;

    const brackets = isKo ? KO_BRACKETS : US_BRACKETS;
    const taxableIncome = Math.max(0, gross - deduct);
    const { tax, bracketResults, appliedRate } = calculateTax(taxableIncome, brackets);

    const determinedTax = Math.max(0, tax - credits);
    const localTax = determinedTax * 0.1;
    const totalTax = determinedTax + localTax;
    const effectiveRate = gross > 0 ? (totalTax / gross) * 100 : 0;

    setResult({
      grossIncome: gross,
      totalDeductions: deduct,
      taxableIncome,
      calculatedTax: tax,
      taxCreditsAmount: credits,
      determinedTax,
      localTax,
      totalTax,
      effectiveRate,
      appliedRate,
      bracketResults,
    });
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  const title = isKo ? "종합소득세 계산기" : "Income Tax Calculator";
  const description = isKo
    ? "2026년 소득세율 구간으로 종합소득세를 자동 계산합니다. 소득공제, 세액공제를 적용하여 산출세액, 결정세액, 지방소득세를 확인하세요."
    : "Calculate your income tax with 2026 tax brackets. Enter income, deductions, and credits to see your tax liability and effective rate.";
  const sym = isKo ? "₩" : "$";

  const faqItems = isKo
    ? [
        { q: "종합소득세와 프리랜서 세금 계산기의 차이점은?", a: "프리랜서 세금 계산기는 3.3% 원천징수 분석에 특화되어 있습니다. 종합소득세 계산기는 모든 소득 유형(사업, 임대, 프리랜서 등)에 대해 소득공제와 세액공제를 적용한 종합적인 세금 계산을 제공합니다." },
        { q: "종합소득세 신고 대상은?", a: "사업소득, 임대소득, 프리랜서 수입이 있거나, 급여 외 소득이 있는 경우, 금융소득이 2,000만 원을 초과하는 경우에 종합소득세 신고가 필요합니다." },
        { q: "소득공제와 세액공제의 차이는?", a: "소득공제는 과세표준(세금을 매기는 기준 금액)을 줄여주고, 세액공제는 계산된 세금 자체를 줄여줍니다. 세액공제가 더 직접적인 절세 효과가 있습니다." },
        { q: "지방소득세는 별도로 내나요?", a: "네. 지방소득세는 결정세액의 10%이며, 종합소득세와 별도로 지방자치단체에 납부합니다." },
        { q: "신고 기한은 언제인가요?", a: "매년 5월 1일~31일이 종합소득세 신고 기간입니다. 기한 내 미납 시 20% 가산세 + 하루 0.025% 납부불성실가산세가 부과됩니다." },
      ]
    : [
        { q: "What's the difference between this and the Freelancer Tax Calculator?", a: "The Freelancer Tax Calculator focuses on 3.3% Korean withholding tax analysis. This Income Tax Calculator provides comprehensive calculation for all income types with detailed deduction and credit options." },
        { q: "Who needs to file income tax?", a: "Anyone with business income, rental income, freelance earnings, or multiple income sources. Also required if financial income (interest + dividends) exceeds certain thresholds." },
        { q: "What's the difference between deductions and tax credits?", a: "Deductions reduce your taxable income (the base amount for tax calculation). Tax credits directly reduce the calculated tax amount. Credits provide more direct tax savings." },
        { q: "What is local income tax?", a: "Local income tax is 10% of your determined federal/national tax and is paid separately to your local government." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="income-tax-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "연간 총소득금액" : "Annual Gross Income"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder={isKo ? "50,000,000" : "80,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "소득공제 합계" : "Total Deductions"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                placeholder="0"
                className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isKo ? "기본공제, 국민연금, 건강보험 등" : "Standard deduction, pension, insurance, etc."}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "세액공제 합계" : "Tax Credits"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
              <input
                type="number"
                value={taxCredits}
                onChange={(e) => setTaxCredits(e.target.value)}
                placeholder="0"
                className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {isKo ? "근로소득세액공제, 기부금, 교육비 등" : "Earned income credit, donations, education, etc."}
            </p>
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "계산하기" : "Calculate"}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {sym}{fmt(result.taxableIncome)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "과세표준" : "Taxable Income"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                    {sym}{fmt(result.totalTax)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "총 납부세액" : "Total Tax"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {result.effectiveRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "실효세율" : "Effective Rate"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "총소득금액" : "Gross Income"}</td>
                      <td className="p-3 text-right">{sym}{fmt(result.grossIncome)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "소득공제" : "Deductions"}</td>
                      <td className="p-3 text-right">-{sym}{fmt(result.totalDeductions)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "과세표준" : "Taxable Income"}</td>
                      <td className="p-3 text-right">{sym}{fmt(result.taxableIncome)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "적용 최고세율" : "Top Bracket Rate"}</td>
                      <td className="p-3 text-right">{result.appliedRate}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "산출세액" : "Calculated Tax"}</td>
                      <td className="p-3 text-right">{sym}{fmt(result.calculatedTax)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "세액공제" : "Tax Credits"}</td>
                      <td className="p-3 text-right">-{sym}{fmt(result.taxCreditsAmount)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "결정세액" : "Determined Tax"}</td>
                      <td className="p-3 text-right">{sym}{fmt(result.determinedTax)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "지방소득세 (10%)" : "Local Tax (10%)"}</td>
                      <td className="p-3 text-right">{sym}{fmt(result.localTax)}</td>
                    </tr>
                    <tr className="font-semibold bg-red-50 dark:bg-red-950/30">
                      <td className="p-3">{isKo ? "총 납부세액" : "Total Tax Payable"}</td>
                      <td className="p-3 text-right text-red-600 dark:text-red-400">{sym}{fmt(result.totalTax)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-800 p-3">
                  <p className="text-sm font-medium">{isKo ? "구간별 세금 내역" : "Tax by Bracket"}</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="p-3 text-left font-medium">{isKo ? "구간" : "Bracket"}</th>
                      <th className="p-3 text-center font-medium">{isKo ? "세율" : "Rate"}</th>
                      <th className="p-3 text-right font-medium">{isKo ? "세액" : "Tax"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.bracketResults.map((br, i) => (
                      <tr key={i} className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{br.bracket}</td>
                        <td className="p-3 text-center">{br.rate}</td>
                        <td className="p-3 text-right">{sym}{fmt(br.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="income-tax-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "연간 총소득금액을 입력하세요.",
                "소득공제 합계를 입력하세요 (기본공제, 국민연금, 건강보험 등).",
                "세액공제 합계를 입력하세요 (근로소득세액공제, 기부금, 교육비 등).",
                "계산하기 버튼을 클릭하여 종합소득세를 확인하세요.",
              ]
            : [
                "Enter your annual gross income.",
                "Enter total deductions (standard deduction, pension, insurance, etc.).",
                "Enter total tax credits (earned income credit, donations, education, etc.).",
                "Click Calculate to see your income tax breakdown.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
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
            mainEntity: faqItems.map((item) => ({
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
          <Link href={`/${lang}/tools/freelancer-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.freelancerTax}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.freelancerTaxDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/salary-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.salaryCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.salaryCalcDesc}</p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="income-tax-calculator" locale={locale} />
      <ToolDisclaimer slug="income-tax-calculator" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="income-tax-calculator" labels={dict.share} />
      <EmbedCodeButton slug="income-tax-calculator" lang={lang} labels={dict.embed} />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tr.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{tr.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
