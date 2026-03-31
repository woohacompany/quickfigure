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
import { formatKRW } from "@/lib/currencyFormat";

/* ── Constants ── */
const A_VALUE = 3193511; // 2026 national average monthly income
const INCOME_MIN = 400000;
const INCOME_MAX = 6370000;
const SPOUSE_ANNUAL = 300330;
const CHILD_PARENT_ANNUAL = 200160;
const AVG_LIFE_EXPECTANCY = 83;

/* ── Calculation ── */
interface PensionResult {
  aValue: number;
  bValue: number;
  basicPensionAmount: number;
  contributionMonths: number;
  paymentRate: number;
  earlyDeferredPct: number;
  dependentAnnual: number;
  monthlyBenefit: number;
  annualBenefit: number;
}

function calculatePension(
  monthlyIncome: number,
  totalYears: number,
  claimingAge: number,
  hasSpouse: boolean,
  childParentCount: number
): PensionResult {
  const B = Math.min(Math.max(monthlyIncome, INCOME_MIN), INCOME_MAX);
  const totalMonths = totalYears * 12;

  // Basic pension amount
  let basicPensionAmount: number;
  if (totalYears <= 20) {
    basicPensionAmount = 1.29 * (A_VALUE + B) * (totalMonths / 240);
  } else {
    const excessMonths = totalMonths - 240;
    basicPensionAmount = 1.29 * (A_VALUE + B) * (1 + 0.05 * excessMonths / 12);
  }

  // Payment rate: 10yr=50%, each additional year +5%, max 100% at 20yr+
  let paymentRate: number;
  if (totalYears >= 20) {
    paymentRate = 1.0;
  } else {
    paymentRate = 0.5 + (totalYears - 10) * 0.05;
  }
  if (paymentRate < 0.5) paymentRate = 0.5;

  // Early/deferred adjustment
  let earlyDeferredPct = 0;
  if (claimingAge < 65) {
    earlyDeferredPct = -(65 - claimingAge) * 6; // -6% per year
  } else if (claimingAge > 65) {
    earlyDeferredPct = (claimingAge - 65) * 7.2; // +7.2% per year
  }
  const adjustmentMultiplier = 1 + earlyDeferredPct / 100;

  // Dependent family pension
  let dependentAnnual = 0;
  if (hasSpouse) dependentAnnual += SPOUSE_ANNUAL;
  dependentAnnual += childParentCount * CHILD_PARENT_ANNUAL;

  // Final calculation
  const annualBasicAfterAdj = basicPensionAmount * paymentRate * adjustmentMultiplier;
  const annualBenefit = annualBasicAfterAdj + dependentAnnual;
  const monthlyBenefit = annualBenefit / 12;

  return {
    aValue: A_VALUE,
    bValue: B,
    basicPensionAmount: Math.round(basicPensionAmount),
    contributionMonths: totalMonths,
    paymentRate,
    earlyDeferredPct,
    dependentAnnual: Math.round(dependentAnnual),
    monthlyBenefit: Math.round(monthlyBenefit),
    annualBenefit: Math.round(annualBenefit),
  };
}

function calcMonthly(income: number, years: number, age: number): number {
  return calculatePension(income, years, age, false, 0).monthlyBenefit;
}

/* ── Birth year pension start age table ── */
const BIRTH_YEAR_TABLE = [
  { range: "1953~1956", age: 61 },
  { range: "1957~1960", age: 62 },
  { range: "1961~1964", age: 63 },
  { range: "1965~1968", age: 64 },
  { range: "1969~", age: 65 },
];

export default function NationalPensionCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.nationalPensionCalc;
  const relatedPosts = getPostsByTool("national-pension-calculator");

  const fmt = (v: number) => "₩" + Math.round(v).toLocaleString("ko-KR");
  const fmtMan = (v: number) => formatKRW(v);

  const [currentAge, setCurrentAge] = useState("35");
  const [monthlyIncome, setMonthlyIncome] = useState("3000000");
  const [currentContrib, setCurrentContrib] = useState("5");
  const [totalContrib, setTotalContrib] = useState("25");
  const [claimingAge, setClaimingAge] = useState("65");
  const [hasSpouse, setHasSpouse] = useState(false);
  const [childParentCount, setChildParentCount] = useState("0");

  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<PensionResult | null>(null);

  function calculate() {
    const income = parseFloat(monthlyIncome) || 0;
    const years = parseInt(totalContrib) || 0;
    const age = parseInt(claimingAge) || 65;
    if (income <= 0 || years < 10) return;

    const res = calculatePension(
      income,
      years,
      age,
      hasSpouse,
      parseInt(childParentCount) || 0
    );
    setResult(res);
  }

  // Comparison data
  const compPeriods = [10, 15, 20, 25, 30];
  const compIncomes = [2000000, 3000000, 4000000, 5000000, 6370000];
  const compAges = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];

  const currentIncome = parseFloat(monthlyIncome) || 3000000;
  const currentTotalYears = parseInt(totalContrib) || 25;
  const currentClaimAge = parseInt(claimingAge) || 65;

  // Bar chart helper
  const maxBarVal = Math.max(
    calcMonthly(currentIncome, currentTotalYears, 60),
    calcMonthly(currentIncome, currentTotalYears, 65),
    calcMonthly(currentIncome, currentTotalYears, 70)
  );

  // Lifetime total
  const lifetimeMonths = result ? (AVG_LIFE_EXPECTANCY - (parseInt(claimingAge) || 65)) * 12 : 0;
  const lifetimeTotal = result ? result.monthlyBenefit * lifetimeMonths : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="national-pension-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Current Age */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.currentAge}</label>
          <input
            type="number"
            min="18"
            max="70"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Monthly Income */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.monthlyIncome}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₩</span>
            <input
              type="number"
              min={INCOME_MIN}
              max={INCOME_MAX}
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="3,000,000"
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">{t.monthlyIncomeHint}</p>
          {monthlyIncome && parseFloat(monthlyIncome) > 0 && (
            <p className="text-sm text-neutral-500 mt-1">{fmtMan(parseFloat(monthlyIncome))}</p>
          )}
          <input
            type="range"
            min={INCOME_MIN}
            max={INCOME_MAX}
            step={10000}
            value={monthlyIncome || INCOME_MIN}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full mt-2 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>40{locale === "ko" ? "만" : "0K"}</span>
            <span>637{locale === "ko" ? "만" : "0K"}</span>
          </div>
        </div>

        {/* Current Contribution Period */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.currentContribution}</label>
          <select
            value={currentContrib}
            onChange={(e) => setCurrentContrib(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 41 }, (_, i) => (
              <option key={i} value={i}>
                {i}{locale === "ko" ? "년" : " year" + (i !== 1 ? "s" : "")}
              </option>
            ))}
          </select>
        </div>

        {/* Total Contribution Period */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.totalContribution}</label>
          <select
            value={totalContrib}
            onChange={(e) => setTotalContrib(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 36 }, (_, i) => i + 10).map((y) => (
              <option key={y} value={y}>
                {y}{locale === "ko" ? "년" : " year" + (y !== 1 ? "s" : "")}
              </option>
            ))}
          </select>
        </div>

        {/* Claiming Age */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.claimingAge}</label>
          <select
            value={claimingAge}
            onChange={(e) => setClaimingAge(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label={t.earlyLabel}>
              <option value="60">{locale === "ko" ? "만 60세 (-30% 감액)" : "Age 60 (-30%)"}</option>
              <option value="61">{locale === "ko" ? "만 61세 (-24% 감액)" : "Age 61 (-24%)"}</option>
              <option value="62">{locale === "ko" ? "만 62세 (-18% 감액)" : "Age 62 (-18%)"}</option>
              <option value="63">{locale === "ko" ? "만 63세 (-12% 감액)" : "Age 63 (-12%)"}</option>
              <option value="64">{locale === "ko" ? "만 64세 (-6% 감액)" : "Age 64 (-6%)"}</option>
            </optgroup>
            <optgroup label={t.normalLabel}>
              <option value="65">{locale === "ko" ? "만 65세 (정상수령)" : "Age 65 (Normal)"}</option>
            </optgroup>
            <optgroup label={t.deferredLabel}>
              <option value="66">{locale === "ko" ? "만 66세 (+7.2% 증액)" : "Age 66 (+7.2%)"}</option>
              <option value="67">{locale === "ko" ? "만 67세 (+14.4% 증액)" : "Age 67 (+14.4%)"}</option>
              <option value="68">{locale === "ko" ? "만 68세 (+21.6% 증액)" : "Age 68 (+21.6%)"}</option>
              <option value="69">{locale === "ko" ? "만 69세 (+28.8% 증액)" : "Age 69 (+28.8%)"}</option>
              <option value="70">{locale === "ko" ? "만 70세 (+36% 증액)" : "Age 70 (+36%)"}</option>
            </optgroup>
          </select>
        </div>

        {/* Dependents */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.dependentsSection}</label>
          <div className="space-y-3 pl-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpouse}
                onChange={(e) => setHasSpouse(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{t.spouse} ({locale === "ko" ? "연" : "annual"} {fmt(SPOUSE_ANNUAL)})</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                {t.childParent} ({locale === "ko" ? "1인당 연" : "per person annual"} {fmt(CHILD_PARENT_ANNUAL)})
              </label>
              <select
                value={childParentCount}
                onChange={(e) => setChildParentCount(e.target.value)}
                className="p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}{t.person}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {/* ── Results ── */}
        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* Main Result Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {fmt(result.monthlyBenefit)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{fmtMan(result.monthlyBenefit)}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.estimatedMonthly}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {fmt(result.annualBenefit)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">{fmtMan(result.annualBenefit)}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.estimatedAnnual}</p>
                </div>
              </div>

              {/* Detail Table */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                      <th className="text-left p-3 font-medium">{t.detailTitle}</th>
                      <th className="text-right p-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.aValue}</td>
                      <td className="p-3 text-right">{fmt(result.aValue)}</td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.bValue}</td>
                      <td className="p-3 text-right">{fmt(result.bValue)}</td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.basicPension}</td>
                      <td className="p-3 text-right">{fmt(result.basicPensionAmount)}</td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.contributionPeriod}</td>
                      <td className="p-3 text-right">
                        {Math.floor(result.contributionMonths / 12)}{t.yearsMonths.replace("{months}", String(result.contributionMonths))}
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.paymentRate}</td>
                      <td className="p-3 text-right">{(result.paymentRate * 100).toFixed(0)}%</td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.earlyDeferredAdj}</td>
                      <td className="p-3 text-right">
                        <span className={result.earlyDeferredPct > 0 ? "text-green-600 dark:text-green-400" : result.earlyDeferredPct < 0 ? "text-red-600 dark:text-red-400" : ""}>
                          {result.earlyDeferredPct > 0 ? "+" : ""}{result.earlyDeferredPct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{t.dependentPension}</td>
                      <td className="p-3 text-right">{fmt(result.dependentAnnual)}{locale === "ko" ? "/년" : "/yr"}</td>
                    </tr>
                    <tr className="border-t-2 border-neutral-300 dark:border-neutral-600 font-semibold">
                      <td className="p-3">{t.finalMonthly}</td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400">{fmt(result.monthlyBenefit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── Comparison Tables ── */}
              {/* 1. By Contribution Period */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <h3 className="bg-neutral-50 dark:bg-neutral-800/50 p-3 font-medium text-sm">{t.compByPeriod}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                      <th className="text-left p-3 font-medium">{t.contributionPeriod}</th>
                      <th className="text-right p-3 font-medium">{t.estimatedMonthly}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compPeriods.map((y) => {
                      const m = calcMonthly(currentIncome, y, currentClaimAge);
                      const isActive = y === currentTotalYears;
                      return (
                        <tr
                          key={y}
                          className={`border-t border-neutral-200 dark:border-neutral-700 ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <td className="p-3">{locale === "ko" ? t.periodYears.replace("{n}", String(y)) : `${y} years`}</td>
                          <td className="p-3 text-right font-medium">{fmt(m)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 2. By Income */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <h3 className="bg-neutral-50 dark:bg-neutral-800/50 p-3 font-medium text-sm">{t.compByIncome}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                      <th className="text-left p-3 font-medium">{t.monthlyIncome}</th>
                      <th className="text-right p-3 font-medium">{t.estimatedMonthly}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compIncomes.map((inc) => {
                      const m = calcMonthly(inc, currentTotalYears, currentClaimAge);
                      const isActive = inc === Math.min(Math.max(currentIncome, INCOME_MIN), INCOME_MAX);
                      return (
                        <tr
                          key={inc}
                          className={`border-t border-neutral-200 dark:border-neutral-700 ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <td className="p-3">
                            {locale === "ko"
                              ? t.incomeWon.replace("{n}", String(inc / 10000))
                              : `₩${(inc / 10000).toLocaleString()}0K`}
                          </td>
                          <td className="p-3 text-right font-medium">{fmt(m)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 3. By Claiming Age */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <h3 className="bg-neutral-50 dark:bg-neutral-800/50 p-3 font-medium text-sm">{t.compByAge}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                      <th className="text-left p-3 font-medium">{t.claimingAge}</th>
                      <th className="text-left p-3 font-medium">{t.earlyDeferredAdj}</th>
                      <th className="text-right p-3 font-medium">{t.estimatedMonthly}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compAges.map((age) => {
                      const m = calcMonthly(currentIncome, currentTotalYears, age);
                      const adj = age < 65 ? -(65 - age) * 6 : age > 65 ? (age - 65) * 7.2 : 0;
                      const isActive = age === currentClaimAge;
                      return (
                        <tr
                          key={age}
                          className={`border-t border-neutral-200 dark:border-neutral-700 ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <td className="p-3">{locale === "ko" ? `만 ${age}세` : `Age ${age}`}</td>
                          <td className="p-3">
                            <span className={adj > 0 ? "text-green-600 dark:text-green-400" : adj < 0 ? "text-red-600 dark:text-red-400" : ""}>
                              {adj > 0 ? "+" : ""}{adj.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">{fmt(m)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Bar Visualization: Early vs Normal vs Deferred ── */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 space-y-3">
                <h3 className="font-medium text-sm">{t.earlyVsNormalVsDeferred}</h3>
                {[
                  { age: 60, label: locale === "ko" ? t.earlyClaim.replace("{age}", "60") : `Early (Age 60)`, color: "bg-red-400" },
                  { age: 65, label: locale === "ko" ? t.normalClaim : `Normal (Age 65)`, color: "bg-blue-500" },
                  { age: 70, label: locale === "ko" ? t.deferredClaim.replace("{age}", "70") : `Deferred (Age 70)`, color: "bg-green-500" },
                ].map((item) => {
                  const m = calcMonthly(currentIncome, currentTotalYears, item.age);
                  const pct = maxBarVal > 0 ? (m / maxBarVal) * 100 : 0;
                  return (
                    <div key={item.age}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium">{fmt(m)}</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-4">
                        <div
                          className={`${item.color} h-4 rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lifetime Estimate */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{t.lifetimeEstimate}</p>
                <p className="text-2xl font-semibold tracking-tight mt-1">{fmt(lifetimeTotal)}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{fmtMan(lifetimeTotal)}</p>
                <p className="text-xs text-neutral-500 mt-1">{t.lifetimeNote}</p>
              </div>

              {/* Tips */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <h3 className="font-medium mb-3">{t.tipsTitle}</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {t.tips.map((tip: string, i: number) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ol>
              </div>
            </div>

            <SaveResultImage targetRef={resultRef} toolName={t.title} slug="national-pension-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <section className="mt-8 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
        <h3 className="font-medium text-amber-800 dark:text-amber-300">{t.disclaimerTitle}</h3>
        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
          {t.disclaimerText}{" "}
          <a
            href="https://www.nps.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-900 dark:hover:text-amber-200"
          >
            nps.or.kr
          </a>
        </p>
      </section>

      {/* ── Birth Year Table ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.birthYearTable}</h2>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left p-3 font-medium">{t.birthYear}</th>
                <th className="text-right p-3 font-medium">{t.pensionStartAge}</th>
              </tr>
            </thead>
            <tbody>
              {BIRTH_YEAR_TABLE.map((row) => (
                <tr key={row.range} className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3">{row.range}</td>
                  <td className="p-3 text-right">{locale === "ko" ? `만 ${row.age}세` : `Age ${row.age}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Premium Rate Changes ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.premiumRateTitle}</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.premiumRateText}</p>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left p-3 font-medium">{locale === "ko" ? "연도" : "Year"}</th>
                <th className="text-right p-3 font-medium">{locale === "ko" ? "보험료율" : "Premium Rate"}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { year: 2026, rate: "9.5%" },
                { year: 2027, rate: "10.0%" },
                { year: 2028, rate: "10.5%" },
                { year: 2029, rate: "11.0%" },
                { year: 2030, rate: "11.5%" },
                { year: 2031, rate: "12.0%" },
                { year: 2032, rate: "12.5%" },
                { year: 2033, rate: "13.0%" },
              ].map((row) => (
                <tr
                  key={row.year}
                  className={`border-t border-neutral-200 dark:border-neutral-700 ${row.year === 2026 ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  <td className="p-3">{row.year}</td>
                  <td className="p-3 text-right font-medium">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ── */}
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

      {/* ── JSON-LD FAQPage ── */}
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

      {/* ── Related Tools ── */}
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
          <Link
            href={`/${lang}/tools/income-tax-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.incomeTaxCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.incomeTaxCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/retirement-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.retirement}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.retirementDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="national-pension-calculator" locale={locale} />
      <ToolDisclaimer slug="national-pension-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="national-pension-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="national-pension-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {/* ── Related Blog Posts ── */}
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
