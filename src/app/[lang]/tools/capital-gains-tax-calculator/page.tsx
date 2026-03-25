"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

const TAX_BRACKETS = [
  { min: 0, max: 14000000, rate: 0.06, deduction: 0, label: "~1,400만" },
  { min: 14000000, max: 50000000, rate: 0.15, deduction: 1260000, label: "1,400만~5,000만" },
  { min: 50000000, max: 88000000, rate: 0.24, deduction: 5760000, label: "5,000만~8,800만" },
  { min: 88000000, max: 150000000, rate: 0.35, deduction: 15440000, label: "8,800만~1.5억" },
  { min: 150000000, max: 300000000, rate: 0.38, deduction: 19940000, label: "1.5억~3억" },
  { min: 300000000, max: 500000000, rate: 0.40, deduction: 25940000, label: "3억~5억" },
  { min: 500000000, max: 1000000000, rate: 0.42, deduction: 35940000, label: "5억~10억" },
  { min: 1000000000, max: Infinity, rate: 0.45, deduction: 65940000, label: "10억 초과" },
];

type HoldingPeriod = "lt1" | "1to2" | "2to3" | "3to5" | "5to10" | "10to15" | "gt15";
type HouseCount = "1" | "2" | "3plus";

function getLongTermDeductionRate(holdingPeriod: HoldingPeriod, isSingleHomeExempt: boolean): number {
  if (isSingleHomeExempt) {
    // 1세대1주택: 3y=24%, 4y=32%, 5y=40%, 6y=48%, 7y=56%, 8y=64%, 9y=72%, 10y+=80%
    const rates: Record<HoldingPeriod, number> = {
      lt1: 0, "1to2": 0, "2to3": 0,
      "3to5": 0.32,
      "5to10": 0.56,
      "10to15": 0.80,
      gt15: 0.80,
    };
    return rates[holdingPeriod];
  }

  // 일반: 3y=6%, 4y=8%, 5y=10%, ... 15y+=30%
  const rates: Record<HoldingPeriod, number> = {
    lt1: 0, "1to2": 0, "2to3": 0,
    "3to5": 0.08,
    "5to10": 0.14,
    "10to15": 0.24,
    gt15: 0.30,
  };
  return rates[holdingPeriod];
}

function getHoldingYearsApprox(holdingPeriod: HoldingPeriod): number {
  const map: Record<HoldingPeriod, number> = {
    lt1: 0.5, "1to2": 1.5, "2to3": 2.5, "3to5": 4, "5to10": 7, "10to15": 12, gt15: 15,
  };
  return map[holdingPeriod];
}

function calcProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.max) {
      return taxBase * b.rate - b.deduction;
    }
  }
  return taxBase * 0.45 - 65940000;
}

function getAppliedRate(taxBase: number): string {
  if (taxBase <= 0) return "0%";
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.max) {
      return `${(b.rate * 100).toFixed(0)}%`;
    }
  }
  return "45%";
}

interface CalcResult {
  salePrice: number;
  acquisitionPrice: number;
  expenses: number;
  capitalGain: number;
  longTermDeductionRate: number;
  longTermDeduction: number;
  taxableGain: number;
  basicDeduction: number;
  taxBase: number;
  appliedRate: string;
  capitalGainsTax: number;
  localTax: number;
  totalTax: number;
  effectiveRate: number;
  isExempt: boolean;
  isShortTerm: boolean;
  shortTermRate: number;
  surchargeRate: number;
}

function calcTaxFromGain(
  salePrice: number, acquisitionPrice: number, expenses: number,
  capitalGain: number, taxableCapitalGain: number,
  holdingPeriod: HoldingPeriod, houseCount: HouseCount,
  isRegulated: boolean, isSingleHomeExempt: boolean,
): CalcResult {
  const isShortTerm = holdingPeriod === "lt1" || holdingPeriod === "1to2";
  let shortTermRate = 0;
  if (holdingPeriod === "lt1") shortTermRate = 0.70;
  else if (holdingPeriod === "1to2") shortTermRate = 0.60;

  let surchargeRate = 0;
  if (isRegulated) {
    if (houseCount === "2") surchargeRate = 0.20;
    else if (houseCount === "3plus") surchargeRate = 0.30;
  }

  let longTermDeductionRate = 0;
  if (!isShortTerm && surchargeRate === 0) {
    longTermDeductionRate = getLongTermDeductionRate(holdingPeriod, isSingleHomeExempt && houseCount === "1");
  }
  const longTermDeduction = taxableCapitalGain * longTermDeductionRate;
  const taxableGain = taxableCapitalGain - longTermDeduction;

  const basicDeductionMax = 2500000;
  const basicDeduction = Math.min(basicDeductionMax, Math.max(0, taxableGain));
  const taxBase = Math.max(0, taxableGain - basicDeductionMax);

  let capitalGainsTax = 0;
  let appliedRate = "0%";

  if (isShortTerm) {
    capitalGainsTax = taxBase * shortTermRate;
    appliedRate = `${(shortTermRate * 100).toFixed(0)}%`;
  } else if (surchargeRate > 0) {
    const baseTax = calcProgressiveTax(taxBase);
    const baseRate = getAppliedRate(taxBase);
    const surchargeAmount = taxBase * surchargeRate;
    capitalGainsTax = baseTax + surchargeAmount;
    appliedRate = `${baseRate} + ${(surchargeRate * 100).toFixed(0)}%p`;
  } else {
    capitalGainsTax = calcProgressiveTax(taxBase);
    appliedRate = getAppliedRate(taxBase);
  }

  capitalGainsTax = Math.max(0, capitalGainsTax);
  const localTax = capitalGainsTax * 0.1;
  const totalTax = capitalGainsTax + localTax;
  const effectiveRate = capitalGain > 0 ? (totalTax / capitalGain) * 100 : 0;

  return {
    salePrice, acquisitionPrice, expenses, capitalGain, longTermDeductionRate,
    longTermDeduction, taxableGain, basicDeduction, taxBase, appliedRate,
    capitalGainsTax, localTax, totalTax, effectiveRate, isExempt: false,
    isShortTerm, shortTermRate, surchargeRate,
  };
}

function calculateCapitalGainsTax(
  acquisitionPrice: number,
  salePrice: number,
  expenses: number,
  holdingPeriod: HoldingPeriod,
  houseCount: HouseCount,
  isRegulated: boolean,
  isSingleHomeExempt: boolean,
): CalcResult {
  const capitalGain = salePrice - acquisitionPrice - expenses;
  if (capitalGain <= 0) {
    return {
      salePrice, acquisitionPrice, expenses, capitalGain: Math.max(0, capitalGain),
      longTermDeductionRate: 0, longTermDeduction: 0, taxableGain: 0,
      basicDeduction: 0, taxBase: 0, appliedRate: "0%",
      capitalGainsTax: 0, localTax: 0, totalTax: 0, effectiveRate: 0,
      isExempt: false, isShortTerm: false, shortTermRate: 0, surchargeRate: 0,
    };
  }

  const holdingYears = getHoldingYearsApprox(holdingPeriod);

  // 1세대 1주택 비과세 판단
  if (isSingleHomeExempt && houseCount === "1" && holdingYears >= 2) {
    if (salePrice <= 1200000000) {
      return {
        salePrice, acquisitionPrice, expenses, capitalGain,
        longTermDeductionRate: 0, longTermDeduction: 0, taxableGain: 0,
        basicDeduction: 0, taxBase: 0, appliedRate: "0%",
        capitalGainsTax: 0, localTax: 0, totalTax: 0, effectiveRate: 0,
        isExempt: true, isShortTerm: false, shortTermRate: 0, surchargeRate: 0,
      };
    }
    // 12억 초과분만 과세
    const taxableCapitalGain = capitalGain * ((salePrice - 1200000000) / salePrice);
    return calcTaxFromGain(
      salePrice, acquisitionPrice, expenses, capitalGain, taxableCapitalGain,
      holdingPeriod, houseCount, isRegulated, true,
    );
  }

  return calcTaxFromGain(
    salePrice, acquisitionPrice, expenses, capitalGain, capitalGain,
    holdingPeriod, houseCount, isRegulated, isSingleHomeExempt,
  );
}

export default function CapitalGainsTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("capital-gains-tax-calculator");
  const resultRef = useRef<HTMLDivElement>(null);

  const [acquisitionPrice, setAcquisitionPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [expenses, setExpenses] = useState("");
  const [holdingPeriod, setHoldingPeriod] = useState<HoldingPeriod>("3to5");
  const [houseCount, setHouseCount] = useState<HouseCount>("1");
  const [isRegulated, setIsRegulated] = useState(false);
  const [isSingleHomeExempt, setIsSingleHomeExempt] = useState(false);

  const [result, setResult] = useState<CalcResult | null>(null);

  function calculate() {
    const acq = parseFloat(acquisitionPrice) || 0;
    const sale = parseFloat(salePrice) || 0;
    const exp = parseFloat(expenses) || 0;
    if (sale <= 0 || acq <= 0) return;

    const res = calculateCapitalGainsTax(acq, sale, exp, holdingPeriod, houseCount, isRegulated, isSingleHomeExempt);
    setResult(res);
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  const title = isKo ? "양도소득세 계산기 - 부동산 양도세 계산" : "Capital Gains Tax Calculator";
  const description = isKo
    ? "양도소득세 자동 계산기. 매도가·매수가·보유기간 입력하면 양도세, 장기보유공제, 실수령액을 계산. 2026년 세법 기준."
    : "Calculate Korean capital gains tax on real estate. Includes long-term holding deductions, single-home exemption, and multi-home surcharges. 2026 tax law.";

  const holdingPeriodOptions: { value: HoldingPeriod; labelKo: string; labelEn: string }[] = [
    { value: "lt1", labelKo: "1년 미만", labelEn: "Less than 1 year" },
    { value: "1to2", labelKo: "1~2년", labelEn: "1-2 years" },
    { value: "2to3", labelKo: "2~3년", labelEn: "2-3 years" },
    { value: "3to5", labelKo: "3~5년", labelEn: "3-5 years" },
    { value: "5to10", labelKo: "5~10년", labelEn: "5-10 years" },
    { value: "10to15", labelKo: "10~15년", labelEn: "10-15 years" },
    { value: "gt15", labelKo: "15년 이상", labelEn: "15+ years" },
  ];

  const houseCountOptions: { value: HouseCount; labelKo: string; labelEn: string }[] = [
    { value: "1", labelKo: "1주택", labelEn: "1 home" },
    { value: "2", labelKo: "2주택", labelEn: "2 homes" },
    { value: "3plus", labelKo: "3주택 이상", labelEn: "3+ homes" },
  ];

  const faqItems = isKo
    ? [
        { q: "양도소득세란 무엇인가요?", a: "양도소득세는 부동산, 주식 등 자산을 매도할 때 발생하는 양도차익(매도가 - 매입가 - 필요경비)에 대해 부과되는 세금입니다. 부동산의 경우 보유기간, 주택 수, 조정대상지역 여부에 따라 세율이 달라집니다." },
        { q: "1세대 1주택 비과세 조건은?", a: "1세대가 1주택만 보유하고, 2년 이상 보유(조정대상지역은 2년 거주 포함)하며, 양도가액이 12억 원 이하인 경우 양도소득세가 전액 비과세됩니다. 12억 원을 초과하는 경우 초과분에 대해서만 과세됩니다." },
        { q: "장기보유특별공제란?", a: "3년 이상 보유한 부동산을 양도할 때 양도차익에서 일정 비율을 공제해주는 제도입니다. 일반적으로 보유기간에 따라 연 2%씩 최대 30%까지 공제되며, 1세대 1주택의 경우 보유+거주 공제를 합산하여 최대 80%까지 공제받을 수 있습니다." },
        { q: "다주택자 중과세율은 얼마인가요?", a: "조정대상지역 내 2주택자는 기본세율에 20%p가 가산되고, 3주택 이상 보유자는 30%p가 가산됩니다. 또한 다주택 중과 대상자는 장기보유특별공제를 받을 수 없습니다." },
        { q: "필요경비에 포함되는 항목은?", a: "중개수수료, 취득세, 법무사 비용, 인테리어/리모델링 비용, 양도 시 수선비 등이 필요경비로 인정됩니다. 필요경비가 클수록 양도차익이 줄어들어 세금 부담이 감소합니다." },
      ]
    : [
        { q: "What is capital gains tax?", a: "Capital gains tax is a tax levied on the profit (capital gain) from selling assets such as real estate or stocks. The gain is calculated as sale price minus acquisition price minus necessary expenses. Tax rates vary based on holding period, number of homes owned, and whether the property is in a regulated area." },
        { q: "What are the conditions for single-home tax exemption?", a: "If a household owns only one home, has held it for 2+ years (including 2 years of residence in regulated areas), and the sale price is 1.2 billion KRW or less, the capital gains tax is fully exempt. If the sale price exceeds 1.2 billion KRW, only the portion above 1.2 billion is taxed." },
        { q: "What is the long-term holding special deduction?", a: "For properties held 3+ years, a percentage of the capital gain is deducted. The general rate is 2% per year up to 30% maximum. For single-home owners, combined holding and residence deductions can reach up to 80%." },
        { q: "What are the multi-home surcharge rates?", a: "In regulated areas, owners of 2 homes face a 20%p surcharge on top of the base rate, while owners of 3+ homes face a 30%p surcharge. Multi-home surcharge taxpayers cannot claim the long-term holding special deduction." },
        { q: "What qualifies as necessary expenses?", a: "Brokerage fees, acquisition tax, legal fees, interior/remodeling costs, and repair costs at the time of sale are recognized as necessary expenses. Higher expenses reduce the capital gain and thus the tax burden." },
      ];

  const toolUrl = `https://quickfigure.net/${lang}/tools/capital-gains-tax-calculator`;
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    description,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* 취득가액 */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "취득가액 (매입가)" : "Acquisition Price"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="number"
              value={acquisitionPrice}
              onChange={(e) => setAcquisitionPrice(e.target.value)}
              placeholder={isKo ? "300,000,000" : "300,000,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 양도가액 */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "양도가액 (매도가)" : "Sale Price"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder={isKo ? "500,000,000" : "500,000,000"}
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 필요경비 */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "필요경비" : "Necessary Expenses"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              placeholder="0"
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isKo ? "중개수수료, 취득세, 리모델링비, 법무사 비용 등" : "Brokerage fees, acquisition tax, remodeling costs, legal fees, etc."}
          </p>
        </div>

        {/* 보유기간 + 주택 수 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "보유기간" : "Holding Period"}
            </label>
            <select
              value={holdingPeriod}
              onChange={(e) => setHoldingPeriod(e.target.value as HoldingPeriod)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {holdingPeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isKo ? opt.labelKo : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "주택 수" : "Number of Homes"}
            </label>
            <select
              value={houseCount}
              onChange={(e) => setHouseCount(e.target.value as HouseCount)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {houseCountOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isKo ? opt.labelKo : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 체크박스 */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRegulated}
              onChange={(e) => setIsRegulated(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-600"
            />
            <span className="text-sm">
              {isKo ? "조정대상지역 소재 주택" : "Property in regulated area"}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSingleHomeExempt}
              onChange={(e) => setIsSingleHomeExempt(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-600"
            />
            <span className="text-sm">
              {isKo ? "1세대 1주택 비과세 적용" : "Apply single-home tax exemption"}
            </span>
            <span className="text-xs text-neutral-400">
              {isKo ? "(2년+ 보유, 1주택)" : "(2+ years, 1 home)"}
            </span>
          </label>
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
              {result.isExempt ? (
                <div className="rounded-lg border-2 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30 p-6 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {isKo ? "비과세 대상" : "Tax Exempt"}
                  </p>
                  <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                    {isKo
                      ? "1세대 1주택 비과세 요건을 충족합니다. 양도가액 12억 원 이하 + 2년 이상 보유로 양도소득세가 면제됩니다."
                      : "Meets single-home exemption requirements. Sale price is 1.2B KRW or less with 2+ years of holding — capital gains tax is fully exempt."}
                  </p>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-white dark:bg-neutral-900 p-4">
                      <p className="text-lg font-semibold">&#8361;{fmt(result.capitalGain)}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isKo ? "양도차익" : "Capital Gain"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-white dark:bg-neutral-900 p-4">
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">&#8361;0</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isKo ? "납부세액" : "Tax Payable"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                      <p className="text-2xl font-semibold tracking-tight">
                        &#8361;{fmt(result.capitalGain)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isKo ? "양도차익" : "Capital Gain"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                      <p className="text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                        &#8361;{fmt(result.totalTax)}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {isKo ? "양도소득세 + 지방소득세" : "Tax + Local Tax"}
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
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "양도가액" : "Sale Price"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.salePrice)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "취득가액" : "Acquisition Price"}</td>
                          <td className="p-3 text-right">-&#8361;{fmt(result.acquisitionPrice)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "필요경비" : "Necessary Expenses"}</td>
                          <td className="p-3 text-right">-&#8361;{fmt(result.expenses)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                          <td className="p-3">{isKo ? "양도차익" : "Capital Gain"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.capitalGain)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {isKo ? `장기보유특별공제 (${(result.longTermDeductionRate * 100).toFixed(0)}%)` : `Long-term Deduction (${(result.longTermDeductionRate * 100).toFixed(0)}%)`}
                          </td>
                          <td className="p-3 text-right">-&#8361;{fmt(result.longTermDeduction)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                          <td className="p-3">{isKo ? "양도소득금액" : "Taxable Gain"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.taxableGain)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "기본공제" : "Basic Deduction"}</td>
                          <td className="p-3 text-right">-&#8361;{fmt(result.basicDeduction)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                          <td className="p-3">{isKo ? "과세표준" : "Tax Base"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.taxBase)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "적용세율" : "Applied Rate"}</td>
                          <td className="p-3 text-right">{result.appliedRate}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "양도소득세" : "Capital Gains Tax"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.capitalGainsTax)}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "지방소득세 (10%)" : "Local Tax (10%)"}</td>
                          <td className="p-3 text-right">&#8361;{fmt(result.localTax)}</td>
                        </tr>
                        <tr className="font-semibold bg-red-50 dark:bg-red-950/30">
                          <td className="p-3">{isKo ? "총 납부세액" : "Total Tax Payable"}</td>
                          <td className="p-3 text-right text-red-600 dark:text-red-400">&#8361;{fmt(result.totalTax)}</td>
                        </tr>
                        <tr className="font-semibold bg-blue-50 dark:bg-blue-950/30">
                          <td className="p-3">{isKo ? "실수령액" : "Net Proceeds"}</td>
                          <td className="p-3 text-right text-blue-600 dark:text-blue-400">&#8361;{fmt(result.salePrice - result.acquisitionPrice - result.expenses - result.totalTax)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <div className="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {isKo
                    ? "⚠️ 본 계산기는 참고용이며, 정확한 세금은 세무사에게 확인하세요. 개별 상황에 따라 실제 세액이 달라질 수 있습니다."
                    : "⚠️ This calculator is for reference only. Please consult a tax professional for accurate calculations. Actual tax may vary based on individual circumstances."}
                </p>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="capital-gains-tax-calculator"
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
                "취득가액(매입가)을 입력하세요.",
                "양도가액(매도가)을 입력하세요.",
                "필요경비(중개수수료, 취득세, 리모델링비 등)를 입력하세요.",
                "보유기간과 주택 수를 선택하고, 조정대상지역 여부와 1세대1주택 비과세 적용 여부를 체크하세요.",
                "계산하기 버튼을 클릭하여 양도소득세를 확인하세요.",
              ]
            : [
                "Enter the acquisition price (purchase price).",
                "Enter the sale price.",
                "Enter necessary expenses (brokerage fees, acquisition tax, remodeling costs, etc.).",
                "Select the holding period and number of homes, then check applicable options for regulated area and single-home exemption.",
                "Click Calculate to see your capital gains tax breakdown.",
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
          <Link href={`/${lang}/tools/acquisition-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.acquisitionTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.acquisitionTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/mortgage-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.mortgage}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.mortgageDesc}</p>
          </Link>
        </div>
      </section>

      <ShareButtons title={title} description={description} lang={lang} slug="capital-gains-tax-calculator" labels={dict.share} />
      <EmbedCodeButton slug="capital-gains-tax-calculator" lang={lang} labels={dict.embed} />

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
