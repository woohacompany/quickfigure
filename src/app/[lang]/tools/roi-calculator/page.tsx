"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface CompareItem {
  id: string;
  label: string;
  invested: string;
  finalValue: string;
  years: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return n.toFixed(2);
}

export default function RoiCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("roi-calculator");

  // ── Basic ROI ──
  const [invested, setInvested] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [years, setYears] = useState("");
  const [inflation, setInflation] = useState("");

  // ── Reverse mode ──
  const [targetRoi, setTargetRoi] = useState("");

  // ── Compare mode ──
  const [mode, setMode] = useState<"basic" | "reverse" | "compare">("basic");
  const [compareItems, setCompareItems] = useState<CompareItem[]>([
    { id: "A", label: isKo ? "옵션 A" : "Option A", invested: "", finalValue: "", years: "" },
    { id: "B", label: isKo ? "옵션 B" : "Option B", invested: "", finalValue: "", years: "" },
  ]);

  const title = isKo
    ? "투자 수익률(ROI) 계산기 - 투자 수익 분석"
    : "ROI Calculator - Return on Investment Calculator";
  const description = isKo
    ? "투자금 대비 수익률을 계산하세요. 연환산 수익률, 인플레이션 조정, 투자 옵션 비교까지. 100% 무료."
    : "Calculate your return on investment. Annualized ROI, inflation adjustment, and side-by-side comparison. 100% free.";

  // ── Basic calculations ──
  const basicResult = useMemo(() => {
    const inv = parseFloat(invested);
    const fin = parseFloat(finalValue);
    if (!inv || inv <= 0 || !fin || fin < 0) return null;

    const gain = fin - inv;
    const roi = (gain / inv) * 100;
    const yrs = parseFloat(years);

    let annualized: number | null = null;
    if (yrs && yrs > 0) {
      annualized = (Math.pow(fin / inv, 1 / yrs) - 1) * 100;
    }

    let realReturn: number | null = null;
    const inf = parseFloat(inflation);
    if (inf !== undefined && !isNaN(inf) && inf >= 0 && annualized !== null) {
      realReturn =
        ((1 + annualized / 100) / (1 + inf / 100) - 1) * 100;
    }

    const investedPct = inv / fin * 100;
    const gainPct = gain / fin * 100;

    return { inv, fin, gain, roi, annualized, realReturn, yrs: yrs || 0, investedPct, gainPct };
  }, [invested, finalValue, years, inflation]);

  // ── Reverse calculation ──
  const reverseResult = useMemo(() => {
    const inv = parseFloat(invested);
    const target = parseFloat(targetRoi);
    if (!inv || inv <= 0 || isNaN(target)) return null;

    const needed = inv * (1 + target / 100);
    const gain = needed - inv;
    return { inv, needed, gain, roi: target };
  }, [invested, targetRoi]);

  // ── Compare calculations ──
  const compareResults = useMemo(() => {
    return compareItems.map((item) => {
      const inv = parseFloat(item.invested);
      const fin = parseFloat(item.finalValue);
      const yrs = parseFloat(item.years);
      if (!inv || inv <= 0 || !fin || fin < 0) return null;

      const gain = fin - inv;
      const roi = (gain / inv) * 100;
      let annualized: number | null = null;
      if (yrs && yrs > 0) {
        annualized = (Math.pow(fin / inv, 1 / yrs) - 1) * 100;
      }
      return { label: item.label, inv, fin, gain, roi, annualized, yrs: yrs || 0 };
    });
  }, [compareItems]);

  const updateCompareItem = useCallback(
    (index: number, field: keyof CompareItem, value: string) => {
      setCompareItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
      });
    },
    []
  );

  const addCompareItem = useCallback(() => {
    if (compareItems.length >= 5) return;
    const labels = ["C", "D", "E"];
    const nextLabel = labels[compareItems.length - 2] || String(compareItems.length + 1);
    setCompareItems((prev) => [
      ...prev,
      {
        id: nextLabel,
        label: isKo ? `옵션 ${nextLabel}` : `Option ${nextLabel}`,
        invested: "",
        finalValue: "",
        years: "",
      },
    ]);
  }, [compareItems.length, isKo]);

  const removeCompareItem = useCallback(
    (index: number) => {
      if (compareItems.length <= 2) return;
      setCompareItems((prev) => prev.filter((_, i) => i !== index));
    },
    [compareItems.length]
  );

  // Find best compare result
  const bestCompareIdx = useMemo(() => {
    let bestIdx = -1;
    let bestVal = -Infinity;
    compareResults.forEach((r, i) => {
      if (r) {
        const val = r.annualized ?? r.roi;
        if (val > bestVal) {
          bestVal = val;
          bestIdx = i;
        }
      }
    });
    return bestIdx;
  }, [compareResults]);

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500";

  const faqItems = isKo
    ? [
        {
          q: "ROI란 무엇인가요?",
          a: "ROI(Return on Investment)는 투자한 금액 대비 얼마나 이익을 얻었는지를 퍼센트로 나타내는 지표입니다. ROI = (수익 - 투자금) / 투자금 × 100으로 계산합니다. 예를 들어, 1000만원을 투자해서 1300만원이 되었다면 ROI는 30%입니다.",
        },
        {
          q: "연환산 수익률(Annualized ROI)이 왜 중요한가요?",
          a: "같은 30% 수익이라도 1년 만에 달성한 것과 5년에 걸쳐 달성한 것은 전혀 다릅니다. 연환산 수익률은 투자 기간을 고려하여 1년 기준으로 환산한 수익률이므로, 기간이 다른 투자를 공정하게 비교할 수 있습니다.",
        },
        {
          q: "실질수익률이란 무엇인가요?",
          a: "실질수익률은 인플레이션(물가 상승률)을 차감한 수익률입니다. 명목수익률이 8%이고 인플레이션이 3%라면, 실질수익률은 약 4.85%입니다. 실제 구매력 기준으로 얼마나 이득인지를 보여주는 더 정확한 지표입니다.",
        },
        {
          q: "ROI와 CAGR의 차이는 무엇인가요?",
          a: "ROI는 전체 기간의 총 수익률이고, CAGR(연평균 성장률)은 복리 기준으로 연환산한 수익률입니다. 이 계산기의 '연환산 수익률'이 바로 CAGR과 같은 개념입니다.",
        },
        {
          q: "투자 비교 기능은 어떻게 사용하나요?",
          a: "'비교 모드' 탭을 선택하면 최대 5개의 투자 옵션을 나란히 비교할 수 있습니다. 각 옵션의 투자금, 최종금액, 기간을 입력하면 ROI와 연환산 수익률이 자동 계산되어 가장 수익률이 높은 옵션이 강조 표시됩니다.",
        },
      ]
    : [
        {
          q: "What is ROI?",
          a: "ROI (Return on Investment) measures the percentage return relative to your investment cost. ROI = (Final Value - Investment) / Investment × 100. For example, if you invest $10,000 and it grows to $13,000, your ROI is 30%.",
        },
        {
          q: "Why is Annualized ROI important?",
          a: "A 30% return in 1 year is very different from 30% over 5 years. Annualized ROI converts the total return to an equivalent annual rate, allowing fair comparison between investments with different holding periods.",
        },
        {
          q: "What is real (inflation-adjusted) return?",
          a: "Real return subtracts the inflation rate from your nominal return. If your nominal return is 8% and inflation is 3%, your real return is approximately 4.85%. It shows how much your purchasing power actually grew.",
        },
        {
          q: "What's the difference between ROI and CAGR?",
          a: "ROI is the total return over the entire period. CAGR (Compound Annual Growth Rate) is the annualized return assuming compound growth. The 'Annualized ROI' in this calculator is equivalent to CAGR.",
        },
        {
          q: "How do I use the comparison feature?",
          a: "Select the 'Compare' tab to compare up to 5 investment options side by side. Enter each option's investment amount, final value, and holding period. ROI and annualized ROI are auto-calculated, and the best-performing option is highlighted.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "투자 수익률(ROI) 계산기" : "ROI Calculator"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {(
            [
              { key: "basic", label: isKo ? "기본 계산" : "Basic" },
              { key: "reverse", label: isKo ? "역방향 계산" : "Reverse" },
              { key: "compare", label: isKo ? "비교 모드" : "Compare" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors cursor-pointer ${
                mode === tab.key
                  ? "bg-white dark:bg-neutral-900 font-medium shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Basic Mode ── */}
        {mode === "basic" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "투자 금액" : "Investment Amount"}
                </label>
                <input
                  type="number"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                  placeholder={isKo ? "예: 10000000" : "e.g. 10000"}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "최종 금액" : "Final Value"}
                </label>
                <input
                  type="number"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  placeholder={isKo ? "예: 13000000" : "e.g. 15000"}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "투자 기간 (년)" : "Holding Period (years)"}
                  <span className="text-neutral-400 font-normal ml-1">
                    {isKo ? "(선택)" : "(optional)"}
                  </span>
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder={isKo ? "예: 3" : "e.g. 3"}
                  min="0.1"
                  step="0.1"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "인플레이션율 (%)" : "Inflation Rate (%)"}
                  <span className="text-neutral-400 font-normal ml-1">
                    {isKo ? "(선택)" : "(optional)"}
                  </span>
                </label>
                <input
                  type="number"
                  value={inflation}
                  onChange={(e) => setInflation(e.target.value)}
                  placeholder={isKo ? "예: 3" : "e.g. 3"}
                  min="0"
                  step="0.1"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Basic Result */}
            {basicResult && (
              <div className="mt-6 space-y-4">
                {/* Donut-style visual */}
                <div className="flex items-center gap-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.91"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                        className="dark:stroke-neutral-700"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.91"
                        fill="none"
                        stroke={basicResult.gain >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth="3"
                        strokeDasharray={`${Math.min(Math.abs(basicResult.gainPct), 100)} ${100 - Math.min(Math.abs(basicResult.gainPct), 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-lg font-bold ${
                          basicResult.roi >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {basicResult.roi >= 0 ? "+" : ""}
                        {fmtPct(basicResult.roi)}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600 inline-block" />
                      <span className="text-neutral-500">
                        {isKo ? "투자금" : "Invested"}: {fmt(basicResult.inv)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full inline-block ${
                          basicResult.gain >= 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span
                        className={
                          basicResult.gain >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {isKo ? "수익" : "Gain"}: {basicResult.gain >= 0 ? "+" : ""}
                        {fmt(basicResult.gain)}
                      </span>
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-300 font-medium">
                      {isKo ? "최종" : "Final"}: {fmt(basicResult.fin)}
                    </div>
                  </div>
                </div>

                {/* Detailed results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                    <p className="text-xs text-neutral-400 mb-1">
                      {isKo ? "총 ROI" : "Total ROI"}
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        basicResult.roi >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {basicResult.roi >= 0 ? "+" : ""}
                      {fmtPct(basicResult.roi)}%
                    </p>
                  </div>
                  {basicResult.annualized !== null && (
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                      <p className="text-xs text-neutral-400 mb-1">
                        {isKo ? "연환산 수익률 (CAGR)" : "Annualized ROI (CAGR)"}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          basicResult.annualized >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {basicResult.annualized >= 0 ? "+" : ""}
                        {fmtPct(basicResult.annualized)}%
                        <span className="text-sm font-normal text-neutral-400 ml-1">
                          / {isKo ? "년" : "yr"}
                        </span>
                      </p>
                    </div>
                  )}
                  {basicResult.realReturn !== null && (
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                      <p className="text-xs text-neutral-400 mb-1">
                        {isKo ? "실질수익률 (인플레이션 조정)" : "Real Return (inflation-adjusted)"}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          basicResult.realReturn >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {basicResult.realReturn >= 0 ? "+" : ""}
                        {fmtPct(basicResult.realReturn)}%
                        <span className="text-sm font-normal text-neutral-400 ml-1">
                          / {isKo ? "년" : "yr"}
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                    <p className="text-xs text-neutral-400 mb-1">
                      {isKo ? "순수익" : "Net Gain"}
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        basicResult.gain >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {basicResult.gain >= 0 ? "+" : ""}
                      {fmt(basicResult.gain)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reverse Mode ── */}
        {mode === "reverse" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "목표 수익률을 입력하면 필요한 최종 금액을 계산합니다."
                : "Enter your target ROI to calculate the required final value."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "투자 금액" : "Investment Amount"}
                </label>
                <input
                  type="number"
                  value={invested}
                  onChange={(e) => setInvested(e.target.value)}
                  placeholder={isKo ? "예: 10000000" : "e.g. 10000"}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {isKo ? "목표 ROI (%)" : "Target ROI (%)"}
                </label>
                <input
                  type="number"
                  value={targetRoi}
                  onChange={(e) => setTargetRoi(e.target.value)}
                  placeholder={isKo ? "예: 30" : "e.g. 30"}
                  className={inputClass}
                />
              </div>
            </div>

            {reverseResult && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                  <p className="text-xs text-neutral-400 mb-1">
                    {isKo ? "투자 금액" : "Invested"}
                  </p>
                  <p className="text-lg font-bold">{fmt(reverseResult.inv)}</p>
                </div>
                <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-3">
                  <p className="text-xs text-blue-500 mb-1">
                    {isKo ? "필요한 최종 금액" : "Required Final Value"}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {fmt(reverseResult.needed)}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                  <p className="text-xs text-neutral-400 mb-1">
                    {isKo ? "필요 수익" : "Required Gain"}
                  </p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    +{fmt(reverseResult.gain)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Compare Mode ── */}
        {mode === "compare" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "여러 투자 옵션을 나란히 비교하세요."
                : "Compare multiple investment options side by side."}
            </p>

            {compareItems.map((item, idx) => (
              <div
                key={item.id}
                className={`rounded-lg border p-4 space-y-3 ${
                  bestCompareIdx === idx && compareResults[idx]
                    ? "border-green-400 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      updateCompareItem(idx, "label", e.target.value)
                    }
                    className="text-sm font-medium bg-transparent border-none focus:outline-none w-40"
                  />
                  {compareItems.length > 2 && (
                    <button
                      onClick={() => removeCompareItem(idx)}
                      className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      {isKo ? "삭제" : "Remove"}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">
                      {isKo ? "투자금" : "Invested"}
                    </label>
                    <input
                      type="number"
                      value={item.invested}
                      onChange={(e) =>
                        updateCompareItem(idx, "invested", e.target.value)
                      }
                      className="w-full p-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">
                      {isKo ? "최종금액" : "Final"}
                    </label>
                    <input
                      type="number"
                      value={item.finalValue}
                      onChange={(e) =>
                        updateCompareItem(idx, "finalValue", e.target.value)
                      }
                      className="w-full p-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">
                      {isKo ? "기간(년)" : "Years"}
                    </label>
                    <input
                      type="number"
                      value={item.years}
                      onChange={(e) =>
                        updateCompareItem(idx, "years", e.target.value)
                      }
                      min="0.1"
                      step="0.1"
                      className="w-full p-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                {/* Result row */}
                {compareResults[idx] && (
                  <div className="flex gap-4 text-sm pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>
                      ROI:{" "}
                      <span
                        className={`font-medium ${
                          compareResults[idx]!.roi >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {compareResults[idx]!.roi >= 0 ? "+" : ""}
                        {fmtPct(compareResults[idx]!.roi)}%
                      </span>
                    </span>
                    {compareResults[idx]!.annualized !== null && (
                      <span>
                        {isKo ? "연환산" : "Annual"}:{" "}
                        <span
                          className={`font-medium ${
                            compareResults[idx]!.annualized! >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {compareResults[idx]!.annualized! >= 0 ? "+" : ""}
                          {fmtPct(compareResults[idx]!.annualized!)}%/
                          {isKo ? "년" : "yr"}
                        </span>
                      </span>
                    )}
                    <span>
                      {isKo ? "수익" : "Gain"}:{" "}
                      <span className="font-medium">
                        {fmt(compareResults[idx]!.gain)}
                      </span>
                    </span>
                    {bestCompareIdx === idx && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ★ {isKo ? "최고" : "Best"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {compareItems.length < 5 && (
              <button
                onClick={addCompareItem}
                className="w-full py-2 rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer text-sm"
              >
                + {isKo ? "옵션 추가" : "Add Option"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Formula reference */}
      <div className="mt-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
        <p className="font-medium text-neutral-600 dark:text-neutral-300 mb-2">
          {isKo ? "계산 공식" : "Formulas"}
        </p>
        <p>ROI = ((Final − Investment) / Investment) × 100</p>
        <p>
          {isKo ? "연환산 ROI" : "Annualized ROI"} = ((Final / Investment)^(1/
          {isKo ? "년수" : "years"}) − 1) × 100
        </p>
        <p>
          {isKo ? "실질수익률" : "Real Return"} = ((1 + {isKo ? "명목수익률" : "nominal"})
          / (1 + {isKo ? "인플레이션" : "inflation"}) − 1) × 100
        </p>
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "기본 계산: 투자 금액과 최종 금액을 입력하면 ROI가 자동 계산됩니다.",
                "투자 기간(년)을 입력하면 연환산 수익률(CAGR)도 확인할 수 있습니다.",
                "인플레이션율을 입력하면 실질수익률이 추가로 표시됩니다.",
                "역방향 계산: 목표 수익률을 입력하면 필요한 최종 금액을 알려줍니다.",
                "비교 모드: 최대 5개 투자 옵션의 수익률을 나란히 비교하세요.",
              ]
            : [
                "Basic: Enter investment amount and final value to auto-calculate ROI.",
                "Add holding period (years) to see annualized ROI (CAGR).",
                "Add inflation rate to see your real (inflation-adjusted) return.",
                "Reverse: Enter a target ROI to find the required final value.",
                "Compare: Compare up to 5 investment options side by side.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer p-4 font-medium">
                {item.q}
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                {item.a}
              </p>
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            description,
            url: `https://quickfigure.net/${lang}/tools/roi-calculator`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {dict.blog.quickTools}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Link
            href={`/${lang}/tools/loan-comparison-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.loanComparisonCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.loanComparisonCalcDesc}
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
          <Link
            href={`/${lang}/tools/percentage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.percentageCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.percentageCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="roi-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton slug="roi-calculator" lang={lang} labels={dict.embed} />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">
            {dict.relatedArticles}
          </h2>
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
