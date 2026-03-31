"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

/* ── 상속세 세율표 (5단계 초과누진) ── */
const TAX_BRACKETS = [
  { min: 0, max: 100000000, rate: 0.10, deduction: 0, label: "~1억" },
  { min: 100000000, max: 500000000, rate: 0.20, deduction: 10000000, label: "1억~5억" },
  { min: 500000000, max: 1000000000, rate: 0.30, deduction: 60000000, label: "5억~10억" },
  { min: 1000000000, max: 3000000000, rate: 0.40, deduction: 160000000, label: "10억~30억" },
  { min: 3000000000, max: Infinity, rate: 0.50, deduction: 460000000, label: "30억 초과" },
];

type DeductionMethod = "lumpsum" | "individual";

interface MinorChild {
  age: number;
}

interface CalcResult {
  totalAssets: number;
  debtsAndFuneral: number;
  priorGifts: number;
  taxableValue: number;
  basicDeduction: number;
  personalDeduction: number;
  lumpSumDeduction: number;
  appliedDeductionMethod: DeductionMethod;
  appliedBasicPersonalDeduction: number;
  spouseDeduction: number;
  financialAssetDeduction: number;
  totalDeduction: number;
  taxBase: number;
  appliedRate: string;
  appliedBracketLabel: string;
  calculatedTax: number;
  filingDeduction: number;
  finalTax: number;
  effectiveRate: number;
}

function calcInheritanceTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.max) {
      return taxBase * b.rate - b.deduction;
    }
  }
  return taxBase * 0.50 - 460000000;
}

function getAppliedBracket(taxBase: number): { rate: string; label: string } {
  if (taxBase <= 0) return { rate: "0%", label: "-" };
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.max) {
      return { rate: `${(b.rate * 100).toFixed(0)}%`, label: b.label };
    }
  }
  return { rate: "50%", label: "30억 초과" };
}

function calculateSpouseDeduction(
  taxableValue: number,
  hasSpouse: boolean,
  spouseActualAmount: number | null,
  childCount: number,
): number {
  if (!hasSpouse) return 0;
  // 법정상속분 비율: 배우자 1.5 / (1.5 + 자녀수)
  const childN = Math.max(childCount, 0);
  const spouseShareRatio = childN > 0 ? 1.5 / (1.5 + childN) : 1;
  const legalShare = taxableValue * spouseShareRatio;

  let spouseDeductionBase: number;
  if (spouseActualAmount !== null && spouseActualAmount >= 0) {
    // 실제 상속액 기준, 법정상속분 한도
    spouseDeductionBase = Math.min(spouseActualAmount, legalShare);
  } else {
    // 법정상속분 적용
    spouseDeductionBase = legalShare;
  }

  // 최소 5억, 최대 30억
  return Math.min(Math.max(spouseDeductionBase, 500000000), 3000000000);
}

function calculateFinancialAssetDeduction(netFinancialAssets: number): number {
  if (netFinancialAssets <= 0) return 0;
  if (netFinancialAssets <= 20000000) return netFinancialAssets;
  const calc = Math.max(netFinancialAssets * 0.2, 20000000);
  return Math.min(calc, 200000000);
}

function formatNumber(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

function parseFormatted(val: string): number {
  return Number(val.replace(/[^0-9]/g, "")) || 0;
}

export default function InheritanceTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("inheritance-tax-calculator");
  const resultRef = useRef<HTMLDivElement>(null);

  // 입력 상태
  const [totalAssetsStr, setTotalAssetsStr] = useState("");
  const [debtsStr, setDebtsStr] = useState("");
  const [priorGiftsStr, setPriorGiftsStr] = useState("");
  const [hasSpouse, setHasSpouse] = useState(true);
  const [spouseAmountMode, setSpouseAmountMode] = useState<"legal" | "custom">("legal");
  const [spouseCustomAmountStr, setSpouseCustomAmountStr] = useState("");
  const [childCount, setChildCount] = useState(2);
  const [deductionMethod, setDeductionMethod] = useState<DeductionMethod>("lumpsum");
  const [minorChildren, setMinorChildren] = useState<MinorChild[]>([]);
  const [seniorCount, setSeniorCount] = useState(0);
  const [disabledCount, setDisabledCount] = useState(0);
  const [disabledLifeExpectancy, setDisabledLifeExpectancy] = useState(20);
  const [financialAssetsStr, setFinancialAssetsStr] = useState("");
  const [financialDebtsStr, setFinancialDebtsStr] = useState("");
  const [applyFilingDeduction, setApplyFilingDeduction] = useState(true);

  const [result, setResult] = useState<CalcResult | null>(null);

  const calculate = useCallback(() => {
    const totalAssets = parseFormatted(totalAssetsStr);
    if (totalAssets <= 0) {
      setResult(null);
      return;
    }

    const debtsAndFuneral = parseFormatted(debtsStr);
    const priorGifts = parseFormatted(priorGiftsStr);

    // 1. 과세가액
    const taxableValue = Math.max(0, totalAssets + priorGifts - debtsAndFuneral);

    // 2. 공제 계산
    // 기초공제 2억
    const basicDeduction = 200000000;

    // 인적공제
    let personalDeduction = 0;
    // 자녀공제: 1인당 5천만원
    personalDeduction += childCount * 50000000;
    // 미성년자 추가공제: 1천만원 × (19세 - 나이)
    for (const mc of minorChildren) {
      const years = Math.max(0, 19 - mc.age);
      personalDeduction += years * 10000000;
    }
    // 60세이상 직계존속: 1인당 5천만원
    personalDeduction += seniorCount * 50000000;
    // 장애인: 1천만원 × 기대여명
    personalDeduction += disabledCount * disabledLifeExpectancy * 10000000;

    // 일괄공제 5억
    const lumpSumDeduction = 500000000;

    // 적용 공제 방식 결정
    let appliedDeductionMethod: DeductionMethod;
    let appliedBasicPersonalDeduction: number;
    if (deductionMethod === "lumpsum") {
      appliedDeductionMethod = "lumpsum";
      appliedBasicPersonalDeduction = lumpSumDeduction;
    } else {
      // 개별: 기초+인적 vs 일괄 중 큰 것
      const individualTotal = basicDeduction + personalDeduction;
      if (individualTotal >= lumpSumDeduction) {
        appliedDeductionMethod = "individual";
        appliedBasicPersonalDeduction = individualTotal;
      } else {
        appliedDeductionMethod = "lumpsum";
        appliedBasicPersonalDeduction = lumpSumDeduction;
      }
    }

    // 배우자공제
    const spouseActualAmount = spouseAmountMode === "custom" ? parseFormatted(spouseCustomAmountStr) : null;
    const spouseDeduction = calculateSpouseDeduction(taxableValue, hasSpouse, spouseActualAmount, childCount);

    // 금융재산공제
    const netFinancial = parseFormatted(financialAssetsStr) - parseFormatted(financialDebtsStr);
    const financialAssetDeduction = calculateFinancialAssetDeduction(netFinancial);

    // 총 공제
    const totalDeduction = appliedBasicPersonalDeduction + spouseDeduction + financialAssetDeduction;

    // 3. 과세표준
    const taxBase = Math.max(0, taxableValue - totalDeduction);

    // 4. 세율 적용
    const bracket = getAppliedBracket(taxBase);
    const calculatedTax = calcInheritanceTax(taxBase);

    // 5. 신고세액공제
    const filingDeduction = applyFilingDeduction ? Math.round(calculatedTax * 0.03) : 0;

    // 6. 최종 납부세액
    const finalTax = Math.max(0, calculatedTax - filingDeduction);

    // 실효세율
    const effectiveRate = totalAssets > 0 ? (finalTax / totalAssets) * 100 : 0;

    setResult({
      totalAssets,
      debtsAndFuneral,
      priorGifts,
      taxableValue,
      basicDeduction,
      personalDeduction,
      lumpSumDeduction,
      appliedDeductionMethod,
      appliedBasicPersonalDeduction,
      spouseDeduction,
      financialAssetDeduction,
      totalDeduction,
      taxBase,
      appliedRate: bracket.rate,
      appliedBracketLabel: bracket.label,
      calculatedTax,
      filingDeduction,
      finalTax,
      effectiveRate,
    });
  }, [totalAssetsStr, debtsStr, priorGiftsStr, hasSpouse, spouseAmountMode, spouseCustomAmountStr, childCount, deductionMethod, minorChildren, seniorCount, disabledCount, disabledLifeExpectancy, financialAssetsStr, financialDebtsStr, applyFilingDeduction]);

  // 실시간 계산
  useEffect(() => {
    calculate();
  }, [calculate]);

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  const title = isKo ? "상속세 계산기" : "Korea Inheritance Tax Calculator";
  const description = isKo
    ? "총 상속재산, 배우자공제, 일괄공제를 입력하면 상속세를 자동 계산합니다. 2026년 현행 세율표 적용."
    : "Calculate Korean inheritance tax with spouse deduction, lump-sum deduction, and 2026 progressive tax brackets.";

  const inputClass =
    "w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-sm font-medium block mb-2";

  // 미성년자녀 배열 관리
  function handleMinorCountChange(count: number) {
    const c = Math.max(0, Math.min(10, count));
    const arr = [...minorChildren];
    while (arr.length < c) arr.push({ age: 0 });
    setMinorChildren(arr.slice(0, c));
  }

  const faqItems = isKo
    ? [
        { q: "상속세란 무엇인가요?", a: "상속세는 사망한 사람(피상속인)의 재산을 상속받는 사람(상속인)에게 부과되는 세금입니다. 상속재산의 총 가액에서 각종 공제를 차감한 과세표준에 세율을 적용하여 계산합니다." },
        { q: "일괄공제와 기초공제+인적공제 중 어떤 것이 유리한가요?", a: "일괄공제는 5억 원이 일괄적으로 공제됩니다. 기초공제(2억) + 인적공제(자녀·미성년자·고령자·장애인 등)를 합산한 금액이 5억을 초과하면 개별 계산이 유리합니다. 자녀가 많거나 미성년 자녀, 장애인이 있는 경우 개별 계산을 검토해보세요." },
        { q: "배우자공제는 어떻게 계산되나요?", a: "배우자가 실제로 상속받는 금액을 기준으로 하되, 법정상속분을 한도로 합니다. 최소 5억 원, 최대 30억 원까지 공제됩니다. 법정상속분은 배우자 1.5 : 자녀 1의 비율로 계산합니다." },
        { q: "신고세액공제란 무엇인가요?", a: "상속 개시일(사망일)이 속하는 달의 말일부터 6개월 이내에 상속세를 자진 신고·납부하면 산출세액의 3%를 공제받을 수 있습니다." },
        { q: "금융재산공제는 어떻게 적용되나요?", a: "순금융재산(금융재산 - 금융채무)이 2천만 원 이하이면 전액 공제됩니다. 2천만 원 초과 시에는 순금융재산의 20%와 2천만 원 중 큰 금액이 공제되며, 최대 2억 원까지 가능합니다." },
      ]
    : [
        { q: "What is Korean inheritance tax?", a: "Inheritance tax in Korea is levied on the estate of a deceased person. The tax is calculated by applying progressive rates to the taxable base, which is the total estate value minus various deductions." },
        { q: "Which is better: lump-sum deduction or basic + personal deductions?", a: "The lump-sum deduction is a flat 500 million KRW. If the combined basic deduction (200M) plus personal deductions (for children, minors, seniors, disabled persons) exceeds 500M, the individual calculation is more advantageous." },
        { q: "How is the spouse deduction calculated?", a: "The spouse deduction is based on the amount actually inherited by the spouse, capped at the legal inheritance share. It ranges from a minimum of 500 million KRW to a maximum of 3 billion KRW. The legal share ratio is Spouse 1.5 : Child 1." },
        { q: "What is the filing deduction?", a: "If the inheritance tax return is filed and paid within 6 months from the end of the month in which the death occurred, a 3% deduction on the calculated tax amount is applied." },
        { q: "How does the financial asset deduction work?", a: "If net financial assets (financial assets minus financial debts) are 20 million KRW or less, the full amount is deducted. Above 20M, the deduction is the greater of 20% of net financial assets or 20M, up to a maximum of 200M KRW." },
      ];

  // 결과가 있을 때 차트 데이터
  const chartData = result && result.finalTax > 0 ? [
    { label: isKo ? "상속세" : "Tax", value: result.finalTax, color: "#ef4444" },
    { label: isKo ? "공제합계" : "Deductions", value: Math.min(result.totalDeduction, result.taxableValue), color: "#3b82f6" },
    { label: isKo ? "실수령" : "Net", value: Math.max(0, result.totalAssets - result.debtsAndFuneral - result.finalTax), color: "#22c55e" },
  ] : null;

  const chartTotal = chartData ? chartData.reduce((s, d) => s + d.value, 0) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="inheritance-tax-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* 총 상속재산가액 */}
        <div>
          <label className={labelClass}>
            {isKo ? "총 상속재산가액" : "Total Inherited Assets"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="text"
              inputMode="numeric"
              value={totalAssetsStr}
              onChange={(e) => setTotalAssetsStr(formatNumber(e.target.value))}
              placeholder={isKo ? "10억 → 1,000,000,000" : "1,000,000,000"}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isKo ? "부동산, 금융자산, 기타 재산의 합계" : "Total of real estate, financial assets, and other property"}
          </p>
        </div>

        {/* 채무 및 장례비용 */}
        <div>
          <label className={labelClass}>
            {isKo ? "채무 및 장례비용" : "Debts & Funeral Expenses"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="text"
              inputMode="numeric"
              value={debtsStr}
              onChange={(e) => setDebtsStr(formatNumber(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        {/* 사전증여재산 */}
        <div>
          <label className={labelClass}>
            {isKo ? "사전증여재산 (10년 이내)" : "Prior Gifts (within 10 years)"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
            <input
              type="text"
              inputMode="numeric"
              value={priorGiftsStr}
              onChange={(e) => setPriorGiftsStr(formatNumber(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isKo ? "사망일 전 10년 이내 상속인에게 증여한 금액" : "Gifts to heirs within 10 years before death"}
          </p>
        </div>

        {/* 배우자 유무 */}
        <div>
          <label className={labelClass}>
            {isKo ? "배우자 유무" : "Spouse Status"}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spouse"
                checked={hasSpouse}
                onChange={() => setHasSpouse(true)}
                className="accent-blue-600"
              />
              <span className="text-sm">{isKo ? "있음" : "Yes"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spouse"
                checked={!hasSpouse}
                onChange={() => setHasSpouse(false)}
                className="accent-blue-600"
              />
              <span className="text-sm">{isKo ? "없음" : "No"}</span>
            </label>
          </div>
        </div>

        {/* 배우자 실제 상속금액 */}
        {hasSpouse && (
          <div className="ml-4 border-l-2 border-blue-200 dark:border-blue-800 pl-4 space-y-3">
            <label className={labelClass}>
              {isKo ? "배우자 상속금액" : "Spouse Inheritance Amount"}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="spouseAmount"
                  checked={spouseAmountMode === "legal"}
                  onChange={() => setSpouseAmountMode("legal")}
                  className="accent-blue-600"
                />
                <span className="text-sm">{isKo ? "법정상속분 적용" : "Legal share"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="spouseAmount"
                  checked={spouseAmountMode === "custom"}
                  onChange={() => setSpouseAmountMode("custom")}
                  className="accent-blue-600"
                />
                <span className="text-sm">{isKo ? "직접 입력" : "Custom amount"}</span>
              </label>
            </div>
            {spouseAmountMode === "custom" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={spouseCustomAmountStr}
                  onChange={(e) => setSpouseCustomAmountStr(formatNumber(e.target.value))}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}

        {/* 자녀 수 */}
        <div>
          <label className={labelClass}>
            {isKo ? "자녀 수" : "Number of Children"}
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={childCount}
            onChange={(e) => setChildCount(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
            className="w-32 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 공제방식 선택 */}
        <div>
          <label className={labelClass}>
            {isKo ? "공제방식" : "Deduction Method"}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deductionMethod"
                checked={deductionMethod === "lumpsum"}
                onChange={() => setDeductionMethod("lumpsum")}
                className="accent-blue-600"
              />
              <span className="text-sm">{isKo ? "일괄공제 5억" : "Lump-sum 500M"}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deductionMethod"
                checked={deductionMethod === "individual"}
                onChange={() => setDeductionMethod("individual")}
                className="accent-blue-600"
              />
              <span className="text-sm">{isKo ? "기초공제 + 인적공제" : "Basic + Personal"}</span>
            </label>
          </div>
        </div>

        {/* 개별계산 세부 입력 */}
        {deductionMethod === "individual" && (
          <div className="ml-4 border-l-2 border-blue-200 dark:border-blue-800 pl-4 space-y-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "기초공제 2억 + 아래 인적공제를 합산합니다. 합산액이 5억 미만이면 자동으로 일괄공제 5억이 적용됩니다."
                : "Basic deduction 200M + personal deductions below. If total is under 500M, lump-sum 500M is applied automatically."}
            </p>

            {/* 미성년 자녀 */}
            <div>
              <label className={labelClass}>
                {isKo ? "미성년 자녀 수" : "Minor Children"}
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={minorChildren.length}
                onChange={(e) => handleMinorCountChange(parseInt(e.target.value) || 0)}
                className="w-32 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {minorChildren.length > 0 && (
                <div className="mt-2 space-y-2">
                  {minorChildren.map((mc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500 w-20">{isKo ? `${i + 1}번째` : `Child ${i + 1}`}</span>
                      <input
                        type="number"
                        min={0}
                        max={18}
                        value={mc.age}
                        onChange={(e) => {
                          const arr = [...minorChildren];
                          arr[i] = { age: Math.max(0, Math.min(18, parseInt(e.target.value) || 0)) };
                          setMinorChildren(arr);
                        }}
                        className="w-20 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <span className="text-sm text-neutral-400">{isKo ? "세" : "yrs"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 60세 이상 직계존속 */}
            <div>
              <label className={labelClass}>
                {isKo ? "60세 이상 직계존속 수" : "Lineal Ascendants (60+)"}
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={seniorCount}
                onChange={(e) => setSeniorCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 장애인 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {isKo ? "장애인 수" : "Disabled Persons"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={disabledCount}
                  onChange={(e) => setDisabledCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-32 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {disabledCount > 0 && (
                <div>
                  <label className={labelClass}>
                    {isKo ? "기대여명 (평균)" : "Life Expectancy (avg)"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={disabledLifeExpectancy}
                      onChange={(e) => setDisabledLifeExpectancy(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32 p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-neutral-400">{isKo ? "년" : "years"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 금융재산 */}
        <div>
          <label className={labelClass}>
            {isKo ? "금융재산 (선택)" : "Financial Assets (optional)"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
              <input
                type="text"
                inputMode="numeric"
                value={financialAssetsStr}
                onChange={(e) => setFinancialAssetsStr(formatNumber(e.target.value))}
                placeholder={isKo ? "금융재산" : "Financial assets"}
                className={inputClass}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>
              <input
                type="text"
                inputMode="numeric"
                value={financialDebtsStr}
                onChange={(e) => setFinancialDebtsStr(formatNumber(e.target.value))}
                placeholder={isKo ? "금융채무" : "Financial debts"}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isKo ? "예금, 주식, 보험금 등에서 금융채무를 차감한 순금융재산 기준으로 공제" : "Deduction based on net financial assets (deposits, stocks, insurance minus financial debts)"}
          </p>
        </div>

        {/* 신고세액공제 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={applyFilingDeduction}
            onChange={(e) => setApplyFilingDeduction(e.target.checked)}
            className="rounded border-neutral-300 dark:border-neutral-600"
          />
          <span className="text-sm">
            {isKo ? "신고세액공제 적용 (3%)" : "Filing deduction (3%)"}
          </span>
          <span className="text-xs text-neutral-400">
            {isKo ? "6개월 내 자진신고 시" : "For voluntary filing within 6 months"}
          </span>
        </label>

        {/* 결과 */}
        {result && result.totalAssets > 0 && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* 요약 카드 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                    &#8361;{fmt(result.finalTax)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "최종 납부 예상 상속세" : "Estimated Inheritance Tax"}
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
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {result.appliedRate}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "적용세율 구간" : "Tax Bracket"}
                  </p>
                </div>
              </div>

              {/* 시각화: 바 차트 */}
              {chartData && chartTotal > 0 && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3">
                  <p className="text-sm font-medium">{isKo ? "상속재산 구성" : "Estate Breakdown"}</p>
                  <div className="flex h-8 rounded-md overflow-hidden">
                    {chartData.map((d, i) => {
                      const pct = (d.value / chartTotal) * 100;
                      if (pct <= 0) return null;
                      return (
                        <div
                          key={i}
                          style={{ width: `${pct}%`, backgroundColor: d.color }}
                          className="flex items-center justify-center text-xs text-white font-medium min-w-[2rem]"
                          title={`${d.label}: ₩${fmt(d.value)}`}
                        >
                          {pct >= 10 ? `${pct.toFixed(0)}%` : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: d.color }} />
                        <span className="text-neutral-600 dark:text-neutral-400">{d.label}: &#8361;{fmt(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 상세 테이블 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "총 상속재산가액" : "Total Inherited Assets"}</td>
                      <td className="p-3 text-right">&#8361;{fmt(result.totalAssets)}</td>
                    </tr>
                    {result.priorGifts > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "사전증여재산 가산" : "Prior Gifts Added"}</td>
                        <td className="p-3 text-right">+&#8361;{fmt(result.priorGifts)}</td>
                      </tr>
                    )}
                    {result.debtsAndFuneral > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "채무 및 장례비용" : "Debts & Funeral"}</td>
                        <td className="p-3 text-right">-&#8361;{fmt(result.debtsAndFuneral)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "과세가액" : "Taxable Value"}</td>
                      <td className="p-3 text-right">&#8361;{fmt(result.taxableValue)}</td>
                    </tr>

                    {/* 공제 내역 */}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-blue-50 dark:bg-blue-950/20">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 공제 내역" : "─ Deductions"}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400 pl-6">
                        {result.appliedDeductionMethod === "lumpsum"
                          ? (isKo ? "일괄공제" : "Lump-sum Deduction")
                          : (isKo ? `기초공제 (2억) + 인적공제 (${fmt(result.personalDeduction)})` : `Basic (200M) + Personal (${fmt(result.personalDeduction)})`)}
                      </td>
                      <td className="p-3 text-right">-&#8361;{fmt(result.appliedBasicPersonalDeduction)}</td>
                    </tr>
                    {hasSpouse && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400 pl-6">{isKo ? "배우자공제" : "Spouse Deduction"}</td>
                        <td className="p-3 text-right">-&#8361;{fmt(result.spouseDeduction)}</td>
                      </tr>
                    )}
                    {result.financialAssetDeduction > 0 && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400 pl-6">{isKo ? "금융재산공제" : "Financial Asset Deduction"}</td>
                        <td className="p-3 text-right">-&#8361;{fmt(result.financialAssetDeduction)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3 pl-6">{isKo ? "총 공제합계" : "Total Deductions"}</td>
                      <td className="p-3 text-right text-blue-600 dark:text-blue-400">-&#8361;{fmt(result.totalDeduction)}</td>
                    </tr>

                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "과세표준" : "Tax Base"}</td>
                      <td className="p-3 text-right">&#8361;{fmt(result.taxBase)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "적용세율" : "Applied Rate"}</td>
                      <td className="p-3 text-right">{result.appliedRate} ({result.appliedBracketLabel})</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "산출세액" : "Calculated Tax"}</td>
                      <td className="p-3 text-right">&#8361;{fmt(result.calculatedTax)}</td>
                    </tr>
                    {applyFilingDeduction && (
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "신고세액공제 (3%)" : "Filing Deduction (3%)"}</td>
                        <td className="p-3 text-right">-&#8361;{fmt(result.filingDeduction)}</td>
                      </tr>
                    )}
                    <tr className="font-semibold bg-red-50 dark:bg-red-950/30">
                      <td className="p-3">{isKo ? "최종 납부 예상 상속세" : "Final Estimated Inheritance Tax"}</td>
                      <td className="p-3 text-right text-red-600 dark:text-red-400">&#8361;{fmt(result.finalTax)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "실효세율" : "Effective Rate"}</td>
                      <td className="p-3 text-right">{result.effectiveRate.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 세율표 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className="p-3 text-left text-xs font-medium text-neutral-500">{isKo ? "과세표준 구간" : "Tax Bracket"}</th>
                      <th className="p-3 text-right text-xs font-medium text-neutral-500">{isKo ? "세율" : "Rate"}</th>
                      <th className="p-3 text-right text-xs font-medium text-neutral-500">{isKo ? "누진공제" : "Progressive Deduction"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAX_BRACKETS.map((b, i) => {
                      const isActive = result.taxBase > b.min && (i === 0 || result.taxBase > TAX_BRACKETS[i - 1].max);
                      return (
                        <tr
                          key={i}
                          className={`border-t border-neutral-200 dark:border-neutral-700 ${isActive ? "bg-blue-50 dark:bg-blue-950/20 font-medium" : ""}`}
                        >
                          <td className="p-3">{b.label}</td>
                          <td className="p-3 text-right">{(b.rate * 100).toFixed(0)}%</td>
                          <td className="p-3 text-right">&#8361;{fmt(b.deduction)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="inheritance-tax-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      {/* 면책 문구 */}
      <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {isKo
            ? "⚠ 이 계산기는 참고용이며, 실제 상속세 신고 시 세무사 상담을 권장합니다. 세법 개정, 개별 사정에 따라 실제 세액과 차이가 있을 수 있습니다."
            : "⚠ This calculator is for reference only. Please consult a tax professional for actual inheritance tax filing. Actual tax may differ due to tax law amendments and individual circumstances."}
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "총 상속재산가액(부동산, 금융자산, 기타 재산 합계)을 입력하세요.",
                "채무 및 장례비용, 사전증여재산이 있으면 입력하세요.",
                "배우자 유무를 선택하고, 자녀 수를 입력하세요.",
                "공제방식을 선택하세요 (일괄공제 5억 또는 기초+인적공제 개별 계산).",
                "금융재산이 있으면 입력하여 금융재산공제를 적용하세요.",
                "결과에서 공제 내역, 과세표준, 적용세율, 최종 납부 예상 상속세를 확인하세요.",
              ]
            : [
                "Enter the total inherited assets (real estate, financial assets, etc.).",
                "Enter debts, funeral expenses, and prior gifts if applicable.",
                "Select spouse status and enter the number of children.",
                "Choose deduction method (lump-sum 500M or basic + personal deductions).",
                "Enter financial assets for the financial asset deduction if applicable.",
                "Review the deduction details, tax base, applied rate, and final estimated tax.",
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
          <Link href={`/${lang}/tools/capital-gains-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.capitalGainsTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.capitalGainsTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/acquisition-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.acquisitionTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.acquisitionTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/income-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.incomeTaxCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.incomeTaxCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/severance-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.severanceCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.severanceCalcDesc}</p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="inheritance-tax-calculator" locale={locale} />
      <ToolDisclaimer slug="inheritance-tax-calculator" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="inheritance-tax-calculator" labels={dict.share} />
      <EmbedCodeButton slug="inheritance-tax-calculator" lang={lang} labels={dict.embed} />

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
