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

type UsageType = "residential" | "general";

interface CalcResult {
  tier: number;
  baseCharge: number;
  tier1Usage: number;
  tier1Charge: number;
  tier2Usage: number;
  tier2Charge: number;
  tier3Usage: number;
  tier3Charge: number;
  usageSubtotal: number;
  subtotal: number;
  vat: number;
  fund: number;
  total: number;
  unitPrice: number;
}

function calculateResidential(kWh: number): CalcResult {
  // 2026 KEPCO progressive rates (residential)
  const BASE_CHARGES = [910, 1600, 7300];
  const USAGE_RATES = [120.0, 214.6, 307.3];

  let tier: number;
  let baseCharge: number;
  if (kWh <= 200) {
    tier = 1;
    baseCharge = BASE_CHARGES[0];
  } else if (kWh <= 400) {
    tier = 2;
    baseCharge = BASE_CHARGES[1];
  } else {
    tier = 3;
    baseCharge = BASE_CHARGES[2];
  }

  const tier1Usage = Math.min(kWh, 200);
  const tier1Charge = Math.round(tier1Usage * USAGE_RATES[0]);

  const tier2Usage = Math.min(Math.max(kWh - 200, 0), 200);
  const tier2Charge = Math.round(tier2Usage * USAGE_RATES[1]);

  const tier3Usage = Math.max(kWh - 400, 0);
  const tier3Charge = Math.round(tier3Usage * USAGE_RATES[2]);

  const usageSubtotal = tier1Charge + tier2Charge + tier3Charge;
  const subtotal = baseCharge + usageSubtotal;

  const vat = Math.round(subtotal * 0.1);
  const fund = Math.round(subtotal * 0.037);
  const total = subtotal + vat + fund;
  const unitPrice = kWh > 0 ? Math.round(total / kWh) : 0;

  return {
    tier,
    baseCharge,
    tier1Usage,
    tier1Charge,
    tier2Usage,
    tier2Charge,
    tier3Usage,
    tier3Charge,
    usageSubtotal,
    subtotal,
    vat,
    fund,
    total,
    unitPrice,
  };
}

function calculateGeneral(kWh: number): CalcResult {
  // Simplified general rate: average unit price ~130 won/kWh + base 6,160 won
  const baseCharge = 6160;
  const avgRate = 130;

  const tier1Usage = kWh;
  const tier1Charge = Math.round(kWh * avgRate);
  const usageSubtotal = tier1Charge;
  const subtotal = baseCharge + usageSubtotal;
  const vat = Math.round(subtotal * 0.1);
  const fund = Math.round(subtotal * 0.037);
  const total = subtotal + vat + fund;
  const unitPrice = kWh > 0 ? Math.round(total / kWh) : 0;

  return {
    tier: 0,
    baseCharge,
    tier1Usage,
    tier1Charge,
    tier2Usage: 0,
    tier2Charge: 0,
    tier3Usage: 0,
    tier3Charge: 0,
    usageSubtotal,
    subtotal,
    vat,
    fund,
    total,
    unitPrice,
  };
}

export default function ElectricityCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("electricity-calculator");
  const isKo = locale === "ko";

  const [usageType, setUsageType] = useState<UsageType>("residential");
  const [kWh, setKWh] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<CalcResult | null>(null);

  const title = isKo
    ? "전기요금 계산기"
    : "Electricity Bill Calculator";
  const description = isKo
    ? "월 사용량을 입력하면 한전 누진세 구간별 전기요금을 자동 계산합니다. 주택용/일반용 지원."
    : "Calculate your Korean electricity bill with KEPCO's progressive rate system. Residential and general rates with detailed breakdown.";
  const metaTitle = isKo
    ? "전기요금 계산기 - 2026년 한전 누진세 전기세 계산 | QuickFigure"
    : "Electricity Bill Calculator - Korean KEPCO Rate Calculator | QuickFigure";

  function calculate() {
    const usage = parseFloat(kWh);
    if (!usage || usage <= 0) return;
    const rounded = Math.round(usage);
    if (usageType === "residential") {
      setResult(calculateResidential(rounded));
    } else {
      setResult(calculateGeneral(rounded));
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US");

  const tierLabel = (n: number) => {
    if (isKo) {
      if (n === 1) return "1구간 (200kWh 이하)";
      if (n === 2) return "2구간 (201~400kWh)";
      return "3구간 (401kWh 이상)";
    }
    if (n === 1) return "Tier 1 (0-200 kWh)";
    if (n === 2) return "Tier 2 (201-400 kWh)";
    return "Tier 3 (401+ kWh)";
  };

  const tierBarPercent = (usage: number) => {
    if (usage <= 0) return [0, 0, 0];
    const t1 = Math.min(usage, 200);
    const t2 = Math.min(Math.max(usage - 200, 0), 200);
    const t3 = Math.max(usage - 400, 0);
    const total = t1 + t2 + t3;
    return [
      Math.round((t1 / total) * 100),
      Math.round((t2 / total) * 100),
      Math.round((t3 / total) * 100),
    ];
  };

  const faqItems = isKo
    ? [
        {
          q: "누진세란 무엇인가요?",
          a: "누진세(누진요금제)는 전기 사용량이 늘어날수록 kWh당 단가가 높아지는 요금 체계입니다. 한전(KEPCO)은 주택용 전기를 3구간으로 나누어 사용량이 많을수록 높은 단가를 적용합니다. 에너지 절약을 유도하기 위한 제도입니다.",
        },
        {
          q: "기본요금이란 무엇인가요?",
          a: "기본요금은 전기를 사용하든 하지 않든 매월 부과되는 고정 요금입니다. 사용량 구간에 따라 1구간(200kWh 이하) 910원, 2구간(201~400kWh) 1,600원, 3구간(401kWh 이상) 7,300원이 적용됩니다.",
        },
        {
          q: "최고 구간(3구간)은 언제 적용되나요?",
          a: "월 전기 사용량이 401kWh 이상일 때 3구간이 적용됩니다. 이 경우 기본요금 7,300원에 더해 401kWh 초과분에 대해 kWh당 307.3원의 높은 단가가 적용됩니다. 여름철 에어컨 사용 시 쉽게 3구간에 도달할 수 있습니다.",
        },
        {
          q: "전기요금을 절약하는 방법은?",
          a: "누진세 구간을 낮추는 것이 핵심입니다. 에어컨 적정 온도(26~28도) 유지, 대기전력 차단(멀티탭 스위치 끄기), LED 조명 교체, 에너지 효율 1등급 가전 사용, 여름/겨울 피크 시간대 사용 줄이기 등이 효과적입니다.",
        },
        {
          q: "부가세와 전력산업기반기금이란?",
          a: "부가세(VAT)는 전기요금의 10%가 부과되며, 전력산업기반기금은 전력산업 발전을 위해 전기요금의 3.7%가 부과됩니다. 두 항목 모두 기본요금과 전력량요금의 합계에 대해 계산됩니다.",
        },
      ]
    : [
        {
          q: "How does Korea's progressive electricity pricing work?",
          a: "Korea's KEPCO uses a progressive (tiered) rate system for residential electricity. Usage is divided into 3 tiers: Tier 1 (0-200 kWh), Tier 2 (201-400 kWh), and Tier 3 (401+ kWh). Each tier has a higher per-kWh rate, encouraging energy conservation.",
        },
        {
          q: "What is the base charge?",
          a: "The base charge is a fixed monthly fee regardless of actual electricity usage. It varies by tier: 910 KRW for Tier 1, 1,600 KRW for Tier 2, and 7,300 KRW for Tier 3. The base charge is determined by your total monthly usage.",
        },
        {
          q: "When does the highest tier apply?",
          a: "Tier 3 applies when your monthly electricity usage exceeds 400 kWh. In this tier, the base charge is 7,300 KRW and the rate for usage above 400 kWh is 307.3 KRW/kWh. Heavy air conditioning use in summer can easily push households into Tier 3.",
        },
        {
          q: "How can I save on my electricity bill?",
          a: "The key is staying within a lower tier. Keep A/C at 26-28°C, turn off standby power using power strips, switch to LED lighting, use energy-efficient (Grade 1) appliances, and reduce usage during peak hours in summer and winter.",
        },
        {
          q: "What are VAT and the electricity industry fund?",
          a: "VAT (10%) and the Electricity Industry Infrastructure Fund (3.7%) are surcharges applied on top of the base charge plus usage charge subtotal. These are mandated by law and apply to all electricity bills in Korea.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "사용 유형을 선택하세요 (주택용 또는 일반용).",
        "월 전기 사용량을 kWh 단위로 입력하세요 (고지서의 '사용량' 항목 참조).",
        "'계산하기' 버튼을 클릭하면 구간별 요금 내역과 총 전기요금이 표시됩니다.",
        "부가세(10%)와 전력산업기반기금(3.7%)이 자동으로 포함됩니다.",
      ]
    : [
        "Select the usage type: Residential or General.",
        "Enter your monthly electricity usage in kWh (check your utility bill).",
        "Click 'Calculate' to see the detailed breakdown with tiered charges.",
        "VAT (10%) and the infrastructure fund (3.7%) are automatically included.",
      ];

  const tips = isKo
    ? [
        { icon: "❄️", text: "에어컨 적정 온도(26~28°C)를 유지하세요" },
        { icon: "🔌", text: "사용하지 않는 가전의 대기전력을 차단하세요" },
        { icon: "💡", text: "LED 조명으로 교체하면 전력 소비를 70% 줄일 수 있습니다" },
        { icon: "🏷️", text: "에너지 효율 1등급 가전제품을 사용하세요" },
        { icon: "⏰", text: "피크 시간대(14~17시) 사용을 줄이세요" },
      ]
    : [
        { icon: "❄️", text: "Keep A/C at 26-28°C for optimal savings" },
        { icon: "🔌", text: "Unplug idle appliances to cut standby power" },
        { icon: "💡", text: "Switch to LED bulbs — saves up to 70% on lighting" },
        { icon: "🏷️", text: "Choose Grade 1 energy-efficient appliances" },
        { icon: "⏰", text: "Reduce usage during peak hours (2-5 PM)" },
      ];

  return (
    <>
      <head>
        <title>{metaTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://quickfigure.net/${locale}/tools/electricity-calculator`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://quickfigure.net/${locale}/tools/electricity-calculator`}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://quickfigure.net/en/tools/electricity-calculator"
        />
        <link
          rel="alternate"
          hrefLang="ko"
          href="https://quickfigure.net/ko/tools/electricity-calculator"
        />
      </head>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {description}
          </p>

          <ToolAbout slug="electricity-calculator" locale={locale} />
        </header>

        {/* Tool UI */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          {/* Usage type selector */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUsageType("residential");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                usageType === "residential"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "주택용" : "Residential"}
            </button>
            <button
              onClick={() => {
                setUsageType("general");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                usageType === "general"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "일반용" : "General"}
            </button>
          </div>

          {/* kWh input */}
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "월 사용량 (kWh)" : "Monthly Usage (kWh)"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={kWh}
                onChange={(e) => setKWh(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && calculate()}
                placeholder={isKo ? "예: 350" : "e.g. 350"}
                min="0"
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                kWh
              </span>
            </div>
          </div>

          {/* Rate info for residential */}
          {usageType === "residential" && (
            <div className="rounded-md bg-neutral-50 dark:bg-neutral-800/50 p-4 text-sm">
              <p className="font-medium mb-2">
                {isKo ? "2026년 주택용 전기요금 기준" : "2026 Residential Rate Structure"}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500 dark:text-neutral-400">
                      <th className="text-left py-1 pr-4">
                        {isKo ? "구간" : "Tier"}
                      </th>
                      <th className="text-right py-1 pr-4">
                        {isKo ? "기본요금" : "Base"}
                      </th>
                      <th className="text-right py-1">
                        {isKo ? "전력량요금 (원/kWh)" : "Rate (KRW/kWh)"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-neutral-600 dark:text-neutral-300">
                    <tr>
                      <td className="py-1 pr-4">
                        {isKo ? "1구간 (0~200kWh)" : "Tier 1 (0-200 kWh)"}
                      </td>
                      <td className="text-right py-1 pr-4">910</td>
                      <td className="text-right py-1">120.0</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4">
                        {isKo ? "2구간 (201~400kWh)" : "Tier 2 (201-400 kWh)"}
                      </td>
                      <td className="text-right py-1 pr-4">1,600</td>
                      <td className="text-right py-1">214.6</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4">
                        {isKo ? "3구간 (401kWh~)" : "Tier 3 (401+ kWh)"}
                      </td>
                      <td className="text-right py-1 pr-4">7,300</td>
                      <td className="text-right py-1">307.3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {isKo ? "계산하기" : "Calculate"}
          </button>

          {/* Results */}
          {result && (
            <>
              <div ref={resultRef} className="space-y-4 mt-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                      {fmt(result.total)}
                      <span className="text-base ml-1">
                        {isKo ? "원" : "KRW"}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "총 전기요금" : "Total Bill"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {fmt(result.unitPrice)}
                      <span className="text-base ml-1">
                        {isKo ? "원/kWh" : "KRW/kWh"}
                      </span>
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "평균 단가" : "Avg. Unit Price"}
                    </p>
                  </div>
                  {usageType === "residential" && (
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                      <p className="text-2xl font-semibold tracking-tight">
                        {result.tier}
                        <span className="text-base ml-1">
                          {isKo ? "구간" : "Tier"}
                        </span>
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isKo ? "적용 구간" : "Applied Tier"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Tier usage bar (residential only) */}
                {usageType === "residential" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {isKo ? "구간별 사용량" : "Usage by Tier"}
                    </p>
                    <div className="flex h-8 rounded-md overflow-hidden">
                      {(() => {
                        const usage = parseInt(kWh) || 0;
                        const percents = tierBarPercent(usage);
                        return (
                          <>
                            {percents[0] > 0 && (
                              <div
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${percents[0]}%` }}
                                title={`Tier 1: ${result.tier1Usage} kWh`}
                              >
                                {result.tier1Usage > 0 && `${result.tier1Usage}`}
                              </div>
                            )}
                            {percents[1] > 0 && (
                              <div
                                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${percents[1]}%` }}
                                title={`Tier 2: ${result.tier2Usage} kWh`}
                              >
                                {result.tier2Usage > 0 && `${result.tier2Usage}`}
                              </div>
                            )}
                            {percents[2] > 0 && (
                              <div
                                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${percents[2]}%` }}
                                title={`Tier 3: ${result.tier3Usage} kWh`}
                              >
                                {result.tier3Usage > 0 && `${result.tier3Usage}`}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-green-500" />
                        {isKo ? "1구간" : "Tier 1"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-yellow-500" />
                        {isKo ? "2구간" : "Tier 2"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-red-500" />
                        {isKo ? "3구간" : "Tier 3"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Breakdown table */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                        <td className="p-3 font-medium" colSpan={2}>
                          {isKo ? "기본요금" : "Base Charge"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {usageType === "residential"
                            ? tierLabel(result.tier)
                            : isKo
                            ? "일반용 기본요금"
                            : "General Base Charge"}
                        </td>
                        <td className="p-3 text-right">
                          {fmt(result.baseCharge)}
                          {isKo ? "원" : " KRW"}
                        </td>
                      </tr>

                      <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                        <td className="p-3 font-medium" colSpan={2}>
                          {isKo ? "전력량요금" : "Usage Charges"}
                        </td>
                      </tr>

                      {usageType === "residential" ? (
                        <>
                          {result.tier1Usage > 0 && (
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                              <td className="p-3 text-neutral-600 dark:text-neutral-400">
                                {isKo
                                  ? `1구간: ${fmt(result.tier1Usage)}kWh × 120.0원`
                                  : `Tier 1: ${fmt(result.tier1Usage)} kWh × 120.0`}
                              </td>
                              <td className="p-3 text-right">
                                {fmt(result.tier1Charge)}
                                {isKo ? "원" : " KRW"}
                              </td>
                            </tr>
                          )}
                          {result.tier2Usage > 0 && (
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                              <td className="p-3 text-neutral-600 dark:text-neutral-400">
                                {isKo
                                  ? `2구간: ${fmt(result.tier2Usage)}kWh × 214.6원`
                                  : `Tier 2: ${fmt(result.tier2Usage)} kWh × 214.6`}
                              </td>
                              <td className="p-3 text-right">
                                {fmt(result.tier2Charge)}
                                {isKo ? "원" : " KRW"}
                              </td>
                            </tr>
                          )}
                          {result.tier3Usage > 0 && (
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                              <td className="p-3 text-neutral-600 dark:text-neutral-400">
                                {isKo
                                  ? `3구간: ${fmt(result.tier3Usage)}kWh × 307.3원`
                                  : `Tier 3: ${fmt(result.tier3Usage)} kWh × 307.3`}
                              </td>
                              <td className="p-3 text-right">
                                {fmt(result.tier3Charge)}
                                {isKo ? "원" : " KRW"}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {isKo
                              ? `${fmt(result.tier1Usage)}kWh × 130원`
                              : `${fmt(result.tier1Usage)} kWh × 130`}
                          </td>
                          <td className="p-3 text-right">
                            {fmt(result.tier1Charge)}
                            {isKo ? "원" : " KRW"}
                          </td>
                        </tr>
                      )}

                      <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                        <td className="p-3 font-medium" colSpan={2}>
                          {isKo ? "부가세 및 기금" : "Tax & Fund"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "소계 (기본요금 + 전력량요금)" : "Subtotal (Base + Usage)"}
                        </td>
                        <td className="p-3 text-right">
                          {fmt(result.subtotal)}
                          {isKo ? "원" : " KRW"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "부가가치세 (10%)" : "VAT (10%)"}
                        </td>
                        <td className="p-3 text-right">
                          {fmt(result.vat)}
                          {isKo ? "원" : " KRW"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo
                            ? "전력산업기반기금 (3.7%)"
                            : "Infrastructure Fund (3.7%)"}
                        </td>
                        <td className="p-3 text-right">
                          {fmt(result.fund)}
                          {isKo ? "원" : " KRW"}
                        </td>
                      </tr>

                      <tr className="font-semibold text-base">
                        <td className="p-3">
                          {isKo ? "총 전기요금" : "Total Electricity Bill"}
                        </td>
                        <td className="p-3 text-right text-blue-600 dark:text-blue-400">
                          {fmt(result.total)}
                          {isKo ? "원" : " KRW"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <SaveResultImage
                targetRef={resultRef}
                toolName={title}
                slug="electricity-calculator"
                labels={dict.saveImage}
              />
            </>
          )}
        </div>

        {/* Electricity saving tips */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {isKo ? "전기요금 절약 팁" : "Tips to Save on Your Electricity Bill"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
              >
                <span className="text-xl flex-shrink-0">{tip.icon}</span>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How to Use */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {isKo ? "사용 방법" : "How to Use"}
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            {howToUseSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {dict.blog.faq}
          </h2>
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

        {/* JSON-LD FAQPage */}
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

        {/* JSON-LD WebApplication */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: title,
              description: description,
              url: `https://quickfigure.net/${locale}/tools/electricity-calculator`,
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
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
              href={`/${lang}/tools/vat-calculator`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {dict.home.vatCalc}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {dict.home.vatCalcDesc}
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

        {/* Share & Embed */}
        <ToolHowItWorks slug="electricity-calculator" locale={locale} />
        <ToolDisclaimer slug="electricity-calculator" locale={locale} />

        <ShareButtons
          title={title}
          description={description}
          lang={lang}
          slug="electricity-calculator"
          labels={dict.share}
        />
        <EmbedCodeButton
          slug="electricity-calculator"
          lang={lang}
          labels={dict.embed}
        />

        {/* Related blog posts */}
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
                    <span className="text-xs text-neutral-400">
                      {post.date}
                    </span>
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
    </>
  );
}
