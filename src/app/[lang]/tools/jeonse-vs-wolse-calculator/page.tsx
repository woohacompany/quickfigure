"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Helpers ── */
function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}
function fmtWon(n: number): string {
  if (Math.abs(n) >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1)}억원`;
  if (Math.abs(n) >= 1_0000) return `${(n / 1_0000).toFixed(0)}만원`;
  return `${fmt(n)}원`;
}
function parseKoreanNumber(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

/* ── Component ── */
export default function JeonseVsWolsePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("jeonse-vs-wolse-calculator");
  const isKo = locale === "ko";
  const resultRef = useRef<HTMLDivElement>(null);

  // Jeonse inputs
  const [jeonseDeposit, setJeonseDeposit] = useState("30000"); // 만원 단위
  const [selfFundRatio, setSelfFundRatio] = useState(50);
  const [loanRate, setLoanRate] = useState("3.5");

  // Wolse inputs
  const [wolseDeposit, setWolseDeposit] = useState("1000"); // 만원 단위
  const [monthlyRent, setMonthlyRent] = useState("80"); // 만원 단위

  // Common
  const [years, setYears] = useState("2");
  const [investRate, setInvestRate] = useState("3.0");

  const [calculated, setCalculated] = useState(false);

  // ── Calculation ──
  const result = useMemo(() => {
    const jDeposit = parseKoreanNumber(jeonseDeposit) * 10000;
    const selfFund = jDeposit * (selfFundRatio / 100);
    const loanAmount = jDeposit - selfFund;
    const loanRateNum = parseFloat(loanRate) || 0;
    const wDeposit = parseKoreanNumber(wolseDeposit) * 10000;
    const mRent = parseKoreanNumber(monthlyRent) * 10000;
    const yearsNum = parseFloat(years) || 2;
    const investRateNum = parseFloat(investRate) || 0;
    const months = Math.round(yearsNum * 12);

    // Jeonse monthly cost
    const jLoanInterestMonthly = (loanAmount * (loanRateNum / 100)) / 12;
    const jOpportunityCostMonthly = (selfFund * (investRateNum / 100)) / 12;
    const jMonthlyCost = jLoanInterestMonthly + jOpportunityCostMonthly;
    const jTotalCost = jMonthlyCost * months;

    // Wolse monthly cost
    const wOpportunityCostMonthly = (wDeposit * (investRateNum / 100)) / 12;
    const wMonthlyCost = mRent + wOpportunityCostMonthly;
    const wTotalCost = wMonthlyCost * months;

    // Comparison
    const diff = jMonthlyCost - wMonthlyCost;
    const jeonseWins = diff < 0;
    const monthlyDiff = Math.abs(diff);
    const totalDiff = Math.abs(jTotalCost - wTotalCost);

    // Conversion rate (전월세 전환율)
    // (월세 × 12) / (전세보증금 - 월세보증금) × 100
    const depositDiff = jDeposit - wDeposit;
    const conversionRate = depositDiff > 0 ? ((mRent * 12) / depositDiff) * 100 : 0;

    // Legal conversion rate (기준금리 + 2%, 2026 기준 약 5.5%)
    const legalRate = 5.5;

    // Break-even monthly rent
    const breakEvenRent = jMonthlyCost - wOpportunityCostMonthly;

    // Bar chart max
    const maxCost = Math.max(jMonthlyCost, wMonthlyCost);

    return {
      jDeposit, selfFund, loanAmount,
      jLoanInterestMonthly, jOpportunityCostMonthly, jMonthlyCost, jTotalCost,
      wDeposit: wDeposit, wMonthlyCost, wTotalCost, mRent,
      wOpportunityCostMonthly,
      diff, jeonseWins, monthlyDiff, totalDiff,
      conversionRate, legalRate, breakEvenRent,
      maxCost, months, yearsNum,
    };
  }, [jeonseDeposit, selfFundRatio, loanRate, wolseDeposit, monthlyRent, years, investRate]);

  const handleCalculate = useCallback(() => {
    setCalculated(true);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  // Copy result
  const copyResult = useCallback(() => {
    const winner = result.jeonseWins
      ? (isKo ? "전세가 유리" : "Jeonse is better")
      : (isKo ? "월세가 유리" : "Wolse is better");
    const text = isKo
      ? `전세 vs 월세 비교 결과\n${winner} (월 ${fmtWon(result.monthlyDiff)} 절약)\n전세 월비용: ${fmtWon(result.jMonthlyCost)}\n월세 월비용: ${fmtWon(result.wMonthlyCost)}\nhttps://quickfigure.net/ko/tools/jeonse-vs-wolse-calculator`
      : `Jeonse vs Wolse Result\n${winner} (Save ${fmtWon(result.monthlyDiff)}/mo)\nJeonse: ${fmtWon(result.jMonthlyCost)}/mo\nWolse: ${fmtWon(result.wMonthlyCost)}/mo\nhttps://quickfigure.net/en/tools/jeonse-vs-wolse-calculator`;
    navigator.clipboard.writeText(text);
  }, [result, isKo]);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "전세 vs 월세 비교 계산기" : "Jeonse vs Wolse Calculator",
    description: isKo
      ? "전세와 월세 중 어떤 게 유리한지 계산합니다."
      : "Compare Korean Jeonse vs Wolse housing costs.",
    url: `https://quickfigure.net/${lang}/tools/jeonse-vs-wolse-calculator`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        { q: "전세와 월세의 차이는 무엇인가요?", a: "전세는 큰 보증금(전세금)을 맡기고 월세 없이 거주하는 한국 고유의 임대 방식입니다. 월세는 적은 보증금에 매월 월세를 내는 방식입니다. 전세금은 계약 종료 시 전액 반환됩니다." },
        { q: "전월세 전환율이란 무엇인가요?", a: "전세 보증금과 월세 보증금의 차이를 월세로 환산하는 비율입니다. 법정 전환율은 한국은행 기준금리 + 2%로, 2026년 기준 약 5.5%입니다. 전환율이 법정 전환율보다 높으면 월세가 비싼 것입니다." },
        { q: "기회비용은 왜 계산하나요?", a: "전세 자기자금을 투자했다면 얻을 수 있는 수익을 고려하기 위해서입니다. 예를 들어 전세 자기자금 1억원을 3% 수익률로 투자하면 연 300만원(월 25만원)의 수익을 포기하는 셈입니다." },
        { q: "전세대출 이자율은 어떻게 입력하나요?", a: "현재 받고 있거나 받을 예정인 전세대출의 연 이자율을 입력하세요. 2026년 기준 전세대출 금리는 약 3~5% 수준입니다." },
      ]
    : [
        { q: "What is Jeonse?", a: "Jeonse is a unique Korean rental system where tenants pay a large lump-sum deposit (typically 50-80% of property value) instead of monthly rent. The deposit is fully returned when the lease ends." },
        { q: "What is the conversion rate?", a: "The conversion rate calculates the implied return rate when converting between Jeonse and Wolse. The legal maximum rate in Korea is the base rate + 2% (about 5.5% in 2026)." },
        { q: "Why include opportunity cost?", a: "If you tie up a large sum in a Jeonse deposit, you lose the potential investment returns on that money. This calculator factors in what that money could earn elsewhere." },
        { q: "Which is better in 2026?", a: "It depends on your financial situation. Generally, Jeonse is better when interest rates are low and you have savings. Wolse is better when rates are high or you prefer liquidity." },
      ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const jBarWidth = result.maxCost > 0 ? (result.jMonthlyCost / result.maxCost) * 100 : 0;
  const wBarWidth = result.maxCost > 0 ? (result.wMonthlyCost / result.maxCost) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "전세 vs 월세 비교 계산기" : "Jeonse vs Wolse Calculator"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "전세와 월세 중 어떤 게 유리한지 계산합니다. 전세대출 이자, 기회비용, 전월세 전환율까지 반영. 2026년 기준."
            : "Compare Korean Jeonse (lump-sum deposit) vs Wolse (monthly rent). Factor in loan interest, opportunity cost, and conversion rate."}
        </p>

        <ToolAbout slug="jeonse-vs-wolse-calculator" locale={locale} />
      </header>

      {/* ── Jeonse Section ── */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-5 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">
          {isKo ? "전세 조건" : "Jeonse (Lump-Sum Deposit)"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "전세보증금" : "Jeonse Deposit"}
              <span className="text-xs text-neutral-400 ml-1">({isKo ? "만원" : "10K KRW"})</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={jeonseDeposit}
              onChange={(e) => setJeonseDeposit(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {parseKoreanNumber(jeonseDeposit) > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{fmtWon(parseKoreanNumber(jeonseDeposit) * 10000)}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? `자기자금 비율: ${selfFundRatio}%` : `Self-fund Ratio: ${selfFundRatio}%`}
              <span className="text-xs text-neutral-400 ml-1">
                ({isKo ? "나머지는 전세대출" : "rest is loan"})
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={selfFundRatio}
              onChange={(e) => setSelfFundRatio(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>{isKo ? "자기자금" : "Self"}: {fmtWon(parseKoreanNumber(jeonseDeposit) * 10000 * selfFundRatio / 100)}</span>
              <span>{isKo ? "대출" : "Loan"}: {fmtWon(parseKoreanNumber(jeonseDeposit) * 10000 * (100 - selfFundRatio) / 100)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "전세대출 이자율 (연 %)" : "Loan Interest Rate (annual %)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={loanRate}
              onChange={(e) => setLoanRate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Wolse Section ── */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 mb-4">
        <h2 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-400">
          {isKo ? "월세 조건" : "Wolse (Monthly Rent)"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "보증금" : "Deposit"}
              <span className="text-xs text-neutral-400 ml-1">({isKo ? "만원" : "10K KRW"})</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={wolseDeposit}
              onChange={(e) => setWolseDeposit(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {parseKoreanNumber(wolseDeposit) > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{fmtWon(parseKoreanNumber(wolseDeposit) * 10000)}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "월세" : "Monthly Rent"}
              <span className="text-xs text-neutral-400 ml-1">({isKo ? "만원" : "10K KRW"})</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {parseKoreanNumber(monthlyRent) > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{fmtWon(parseKoreanNumber(monthlyRent) * 10000)}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Common Settings ── */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {isKo ? "공통 설정" : "Common Settings"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "거주 기간 (년)" : "Duration (years)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">
              {isKo ? "투자 수익률 (연 %)" : "Investment Return (annual %)"}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={investRate}
              onChange={(e) => setInvestRate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full py-3 rounded-lg bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer mb-8"
      >
        {isKo ? "비교 계산하기" : "Compare Now"}
      </button>

      {/* ── Results ── */}
      {calculated && (
        <div ref={resultRef} className="space-y-6 mb-8">
          {/* Verdict */}
          <div className={`rounded-xl p-6 text-center ${
            result.jeonseWins
              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900"
              : "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900"
          }`}>
            <p className={`text-2xl font-bold ${
              result.jeonseWins
                ? "text-blue-700 dark:text-blue-400"
                : "text-emerald-700 dark:text-emerald-400"
            }`}>
              {result.jeonseWins
                ? (isKo ? "전세가 유리합니다" : "Jeonse is better")
                : (isKo ? "월세가 유리합니다" : "Wolse is better")}
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {isKo
                ? `월 ${fmtWon(result.monthlyDiff)} 절약 (${result.yearsNum}년간 총 ${fmtWon(result.totalDiff)} 차이)`
                : `Save ${fmtWon(result.monthlyDiff)}/mo (${fmtWon(result.totalDiff)} total over ${result.yearsNum} years)`}
            </p>
          </div>

          {/* Monthly Cost Bar Chart */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
            <h3 className="text-sm font-semibold mb-4">
              {isKo ? "월 비용 비교" : "Monthly Cost Comparison"}
            </h3>
            <div className="space-y-4">
              {/* Jeonse bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-blue-600 dark:text-blue-400">{isKo ? "전세" : "Jeonse"}</span>
                  <span className="font-semibold">{fmtWon(result.jMonthlyCost)}{isKo ? "/월" : "/mo"}</span>
                </div>
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-blue-500 dark:bg-blue-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(jBarWidth, 5)}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-neutral-400 mt-1">
                  <span>{isKo ? "대출이자" : "Loan interest"}: {fmtWon(result.jLoanInterestMonthly)}</span>
                  <span>{isKo ? "기회비용" : "Opportunity"}: {fmtWon(result.jOpportunityCostMonthly)}</span>
                </div>
              </div>
              {/* Wolse bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{isKo ? "월세" : "Wolse"}</span>
                  <span className="font-semibold">{fmtWon(result.wMonthlyCost)}{isKo ? "/월" : "/mo"}</span>
                </div>
                <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 dark:bg-emerald-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(wBarWidth, 5)}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-neutral-400 mt-1">
                  <span>{isKo ? "월세" : "Rent"}: {fmtWon(result.mRent)}</span>
                  <span>{isKo ? "기회비용" : "Opportunity"}: {fmtWon(result.wOpportunityCostMonthly)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10 p-4 text-center">
              <p className="text-xs text-neutral-500 mb-1">{isKo ? `전세 총 비용 (${result.yearsNum}년)` : `Jeonse Total (${result.yearsNum}yr)`}</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{fmtWon(result.jTotalCost)}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10 p-4 text-center">
              <p className="text-xs text-neutral-500 mb-1">{isKo ? `월세 총 비용 (${result.yearsNum}년)` : `Wolse Total (${result.yearsNum}yr)`}</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{fmtWon(result.wTotalCost)}</p>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5">
            <h3 className="text-sm font-semibold mb-3">
              {isKo ? "전월세 전환율 분석" : "Conversion Rate Analysis"}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">{isKo ? "실제 전환율" : "Actual Rate"}</p>
                <p className="text-lg font-bold">{result.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-xs text-neutral-500 mb-1">{isKo ? "법정 전환율 (2026)" : "Legal Rate (2026)"}</p>
                <p className="text-lg font-bold">{result.legalRate}%</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {result.conversionRate > result.legalRate
                ? (isKo ? `실제 전환율이 법정 전환율보다 ${(result.conversionRate - result.legalRate).toFixed(1)}%p 높습니다. 월세가 법정 기준보다 비싼 편입니다.`
                   : `Actual rate is ${(result.conversionRate - result.legalRate).toFixed(1)}%p above legal limit. Monthly rent is relatively expensive.`)
                : (isKo ? `실제 전환율이 법정 전환율 이내입니다. 월세가 합리적인 수준입니다.`
                   : `Actual rate is within the legal limit. Monthly rent is reasonably priced.`)}
            </p>
          </div>

          {/* Break-even */}
          {result.breakEvenRent > 0 && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 text-sm text-amber-800 dark:text-amber-300">
              {isKo
                ? `손익분기 월세: 월세가 ${fmtWon(result.breakEvenRent)} 이하이면 월세가 유리합니다.`
                : `Break-even rent: Wolse is better if monthly rent is below ${fmtWon(result.breakEvenRent)}.`}
            </div>
          )}

          {/* Copy button */}
          <button
            onClick={copyResult}
            className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isKo ? "결과 복사" : "Copy Result"}
          </button>
        </div>
      )}

      <ToolHowItWorks slug="jeonse-vs-wolse-calculator" locale={locale} />
      <ToolDisclaimer slug="jeonse-vs-wolse-calculator" locale={locale} />

      <ShareButtons
        title={isKo ? "전세 vs 월세 비교 계산기" : "Jeonse vs Wolse Calculator"}
        description={isKo ? "전세와 월세 중 어떤 게 유리한지 계산합니다." : "Compare Korean housing costs."}
        lang={lang}
        slug="jeonse-vs-wolse-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="jeonse-vs-wolse-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {/* How to Use */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="space-y-3 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "전세보증금과 자기자금 비율을 입력하세요. 나머지는 전세대출로 계산됩니다.",
                "월세 보증금과 월세를 입력하세요.",
                "거주 기간과 투자 수익률(기회비용)을 설정하세요.",
                "\"비교 계산하기\"를 누르면 월 비용, 총 비용, 전환율 분석 결과가 표시됩니다.",
                "결과를 복사하거나 카카오톡으로 공유하세요.",
              ]
            : [
                "Enter Jeonse deposit and self-fund ratio. The rest is calculated as loan.",
                "Enter Wolse (monthly rent) deposit and monthly rent amount.",
                "Set the duration and investment return rate (opportunity cost).",
                "Click \"Compare Now\" to see monthly cost, total cost, and conversion rate analysis.",
                "Copy the result or share via KakaoTalk.",
              ]
          ).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="font-medium mb-2">{item.q}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Articles */}
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
