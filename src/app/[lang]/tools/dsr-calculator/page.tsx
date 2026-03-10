"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

/* ── 타입 ── */
type RepayMethod = "equal-payment" | "equal-principal" | "bullet";
type RateType = "variable" | "mixed" | "periodic" | "fixed";
type Region = "capital" | "non-capital";
type LenderType = "bank" | "non-bank";

interface ExistingLoan {
  type: string;
  balance: string;
  rate: string;
  remainYears: string;
  method: RepayMethod;
}

interface DsrResult {
  dsr: number;
  newAnnualPayment: number;
  existingAnnualPayment: number;
  totalAnnualPayment: number;
  annualIncome: number;
  stressRate: number;
  appliedStressRate: number;
  actualRate: number;
  reviewRate: number;
  maxLoanBank: number;
  maxLoanNonBank: number;
  maxLoanNoStress: number;
  existingBreakdown: { label: string; annual: number }[];
}

/* ── 유틸 함수 ── */
function formatNumber(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("ko-KR");
}

function parseFormatted(val: string): number {
  return Number(val.replace(/[^0-9]/g, "")) || 0;
}

function formatKrw(v: number): string {
  if (v <= 0) return "0원";
  const eok = Math.floor(v / 10000_0000);
  const man = Math.floor((v % 10000_0000) / 10000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man > 0) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (parts.length === 0) return `${v.toLocaleString("ko-KR")}원`;
  return parts.join(" ") + "원";
}

/** PMT 공식: 월 원리금균등 상환액 */
function calcPMT(principal: number, annualRate: number, years: number): number {
  if (annualRate <= 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** 원금균등 첫해 기준 월 상환액 */
function calcEqualPrincipalMonthly(principal: number, annualRate: number, years: number): number {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  const monthlyPrincipal = principal / n;
  return monthlyPrincipal + principal * r;
}

/** 만기일시 월 이자 */
function calcBulletMonthly(principal: number, annualRate: number): number {
  return principal * (annualRate / 100) / 12;
}

function calcAnnualPayment(principal: number, annualRate: number, years: number, method: RepayMethod): number {
  if (principal <= 0 || years <= 0) return 0;
  switch (method) {
    case "equal-payment":
      return calcPMT(principal, annualRate, years) * 12;
    case "equal-principal":
      return calcEqualPrincipalMonthly(principal, annualRate, years) * 12;
    case "bullet":
      return calcBulletMonthly(principal, annualRate) * 12;
  }
}

/** DSR 기준으로 최대 대출 가능액 역산 */
function reverseMaxLoan(
  dsrLimit: number,
  annualIncome: number,
  existingAnnualPayment: number,
  annualRate: number,
  years: number,
  method: RepayMethod,
): number {
  const maxAnnual = annualIncome * (dsrLimit / 100) - existingAnnualPayment;
  if (maxAnnual <= 0) return 0;

  if (method === "bullet") {
    return maxAnnual / (annualRate / 100);
  }

  if (annualRate <= 0) return maxAnnual * years;

  const r = annualRate / 100 / 12;
  const n = years * 12;

  if (method === "equal-payment") {
    const monthlyMax = maxAnnual / 12;
    return monthlyMax * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  }

  // equal-principal: maxAnnual = 12 * (P/n + P*r) => P = maxAnnual / (12*(1/n + r))
  const monthlyMax = maxAnnual / 12;
  return monthlyMax / (1 / n + r);
}

/* ── 스트레스 금리 계산 ── */
function getStressRate(region: Region): number {
  // 2026년 3단계 기준
  if (region === "capital") return 3.0; // 수도권 상한 3.0%
  return 0.75; // 비수도권 유예 0.75% (2026.6.30까지)
}

function getStressApplyRatio(rateType: RateType): number {
  switch (rateType) {
    case "variable": return 1.0;    // 100%
    case "mixed": return 0.6;       // 60%
    case "periodic": return 0.4;    // 40%
    case "fixed": return 0;         // 0%
  }
}

/* ── 컴포넌트 ── */
export default function DsrCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("dsr-calculator");
  const resultRef = useRef<HTMLDivElement>(null);

  const title = isKo ? "DSR 계산기" : "Korea DSR Calculator (Debt Service Ratio)";
  const description = isKo
    ? "연소득과 대출 조건 입력으로 DSR(총부채원리금상환비율)을 자동 계산합니다. 2026년 스트레스 DSR 3단계 반영. 은행별 대출 가능 한도까지 확인하세요."
    : "Calculate Korea's DSR (Debt Service Ratio) with 2026 Stress DSR Stage 3 rules. Check your maximum loan amount for banks and non-bank lenders.";

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "text-sm font-medium block mb-2";

  // 입력 상태 - 소득
  const [incomeStr, setIncomeStr] = useState("5,000");

  // 신규 대출
  const [newLoanStr, setNewLoanStr] = useState("");
  const [newRate, setNewRate] = useState("4.5");
  const [newTerm, setNewTerm] = useState("30");
  const [newMethod, setNewMethod] = useState<RepayMethod>("equal-payment");
  const [rateType, setRateType] = useState<RateType>("variable");
  const [region, setRegion] = useState<Region>("capital");
  const [lender, setLender] = useState<LenderType>("bank");

  // 기존 대출
  const [existingLoans, setExistingLoans] = useState<ExistingLoan[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const [result, setResult] = useState<DsrResult | null>(null);

  const loanTypeOptions = isKo
    ? [
        { value: "mortgage", label: "주택담보대출" },
        { value: "credit", label: "신용대출" },
        { value: "auto", label: "자동차할부" },
        { value: "student", label: "학자금대출" },
        { value: "card", label: "카드론" },
        { value: "other", label: "기타" },
      ]
    : [
        { value: "mortgage", label: "Mortgage" },
        { value: "credit", label: "Personal Loan" },
        { value: "auto", label: "Auto Loan" },
        { value: "student", label: "Student Loan" },
        { value: "card", label: "Card Loan" },
        { value: "other", label: "Other" },
      ];

  const termOptions = [10, 15, 20, 25, 30, 35, 40];

  function addExistingLoan() {
    if (existingLoans.length >= 5) return;
    setExistingLoans((prev) => [
      ...prev,
      { type: "mortgage", balance: "", rate: "5", remainYears: "20", method: "equal-payment" },
    ]);
  }

  function removeExistingLoan(idx: number) {
    setExistingLoans((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateExistingLoan(idx: number, field: keyof ExistingLoan, value: string) {
    setExistingLoans((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  const calculate = useCallback(() => {
    const annualIncome = parseFormatted(incomeStr) * 10000; // 만원 → 원
    const newLoanAmount = parseFormatted(newLoanStr) * 10000;
    const newRateNum = parseFloat(newRate) || 0;
    const newTermNum = parseInt(newTerm) || 30;

    if (annualIncome <= 0) {
      setResult(null);
      return;
    }

    // 스트레스 금리 계산
    const stressRate = getStressRate(region);
    const applyRatio = getStressApplyRatio(rateType);
    const appliedStressRate = stressRate * applyRatio;
    const reviewRate = newRateNum + appliedStressRate;

    // 신규 대출 연간 원리금
    const newAnnualPayment = newLoanAmount > 0
      ? calcAnnualPayment(newLoanAmount, reviewRate, newTermNum, newMethod)
      : 0;

    // 기존 대출 연간 원리금
    const existingBreakdown: { label: string; annual: number }[] = [];
    let existingAnnualPayment = 0;
    for (const loan of existingLoans) {
      const balance = parseFormatted(loan.balance) * 10000;
      const rate = parseFloat(loan.rate) || 0;
      const years = parseFloat(loan.remainYears) || 0;
      if (balance > 0 && years > 0) {
        const annual = calcAnnualPayment(balance, rate, years, loan.method);
        existingAnnualPayment += annual;
        const typeLabel = loanTypeOptions.find((o) => o.value === loan.type)?.label || loan.type;
        existingBreakdown.push({ label: typeLabel, annual });
      }
    }

    const totalAnnualPayment = newAnnualPayment + existingAnnualPayment;
    const dsr = annualIncome > 0 ? (totalAnnualPayment / annualIncome) * 100 : 0;

    // 대출 가능 한도 역산
    const maxLoanBank = reverseMaxLoan(40, annualIncome, existingAnnualPayment, reviewRate, newTermNum, newMethod);
    const maxLoanNonBank = reverseMaxLoan(50, annualIncome, existingAnnualPayment, reviewRate, newTermNum, newMethod);
    const maxLoanNoStress = reverseMaxLoan(40, annualIncome, existingAnnualPayment, newRateNum, newTermNum, newMethod);

    setResult({
      dsr,
      newAnnualPayment,
      existingAnnualPayment,
      totalAnnualPayment,
      annualIncome,
      stressRate,
      appliedStressRate,
      actualRate: newRateNum,
      reviewRate,
      maxLoanBank: Math.max(0, maxLoanBank),
      maxLoanNonBank: Math.max(0, maxLoanNonBank),
      maxLoanNoStress: Math.max(0, maxLoanNoStress),
      existingBreakdown,
    });
  }, [incomeStr, newLoanStr, newRate, newTerm, newMethod, rateType, region, existingLoans, loanTypeOptions]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const fmt = (v: number) => v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  function getDsrColor(dsr: number): string {
    if (dsr <= 30) return "text-green-600 dark:text-green-400";
    if (dsr <= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  function getDsrBgColor(dsr: number): string {
    if (dsr <= 30) return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    if (dsr <= 40) return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
    return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
  }

  function getDsrStatus(dsr: number): string {
    if (dsr <= 30) return isKo ? "안전" : "Safe";
    if (dsr <= 40) return isKo ? "주의 (1금융권 한도 내)" : "Caution (within bank limit)";
    if (dsr <= 50) return isKo ? "1금융권 초과 / 2금융권 한도 내" : "Exceeds bank limit / within non-bank";
    return isKo ? "한도 초과" : "Over limit";
  }

  const methodOptions: { value: RepayMethod; label: string }[] = [
    { value: "equal-payment", label: isKo ? "원리금균등상환" : "Equal Payment (PMT)" },
    { value: "equal-principal", label: isKo ? "원금균등상환" : "Equal Principal" },
    { value: "bullet", label: isKo ? "만기일시상환" : "Interest Only (Bullet)" },
  ];

  const rateTypeOptions: { value: RateType; label: string }[] = [
    { value: "variable", label: isKo ? "변동금리" : "Variable Rate" },
    { value: "mixed", label: isKo ? "혼합형 (5년 고정)" : "Mixed (5yr fixed)" },
    { value: "periodic", label: isKo ? "주기형 (5년 주기)" : "Periodic (5yr cycle)" },
    { value: "fixed", label: isKo ? "고정금리" : "Fixed Rate" },
  ];

  const faqItems = isKo
    ? [
        {
          q: "DSR이란 무엇인가요?",
          a: "DSR(Debt Service Ratio, 총부채원리금상환비율)은 대출자의 연간 소득 대비 모든 대출의 연간 원리금 상환액 비율을 뜻합니다. 기존 DTI(총부채상환비율)가 주택담보대출의 원리금만 반영한 것과 달리, DSR은 신용대출, 자동차할부, 학자금대출 등 모든 대출의 원리금을 포함합니다.",
        },
        {
          q: "DSR과 DTI의 차이점은?",
          a: "DTI는 주택담보대출의 원리금 + 기타대출 이자만 포함합니다. 반면 DSR은 모든 대출의 원금+이자를 모두 반영하여 더 엄격한 지표입니다. 2021년부터 DSR 규제가 본격 도입되어 현재는 DSR이 주요 대출 심사 기준입니다.",
        },
        {
          q: "스트레스 DSR이란?",
          a: "스트레스 DSR은 향후 금리 상승 가능성을 미리 반영하여 대출 심사 시 실제 금리보다 높은 금리(스트레스 금리)를 적용하는 제도입니다. 2026년 3단계 기준으로 수도권 주담대는 최대 3.0%, 비수도권은 0.75%(유예)가 추가 적용됩니다.",
        },
        {
          q: "DSR 예외 대출은 무엇인가요?",
          a: "전세자금대출, 중도금대출(분양), 300만원 이하 소액 신용대출, 서민금융상품(햇살론, 새희망홀씨), 정책 모기지(디딤돌, 보금자리) 등은 DSR 규제에서 제외되거나 완화 적용됩니다.",
        },
        {
          q: "대출 한도를 늘리려면?",
          a: "고정금리를 선택하면 스트레스 금리가 0% 적용되어 유리합니다. 대출 기간을 늘리면 연간 원리금이 줄어듭니다. 기존 대출을 정리하거나, 소득 증빙을 추가(부업, 임대소득 등)하는 것도 방법입니다.",
        },
      ]
    : [
        {
          q: "What is DSR (Debt Service Ratio)?",
          a: "DSR is the ratio of a borrower's total annual principal and interest payments on all debts to their annual income. Unlike DTI which only counts mortgage principal and interest of other loans, DSR includes all loan repayments: personal loans, auto loans, student loans, etc.",
        },
        {
          q: "What is the difference between DSR and DTI?",
          a: "DTI counts mortgage principal & interest plus only the interest on other loans. DSR counts both principal and interest on ALL debts, making it a stricter measure. Since 2021, DSR has become the primary loan screening criterion in Korea.",
        },
        {
          q: "What is Stress DSR?",
          a: "Stress DSR adds an extra interest rate buffer (stress rate) on top of the actual loan rate to account for potential future rate increases. Under 2026 Stage 3 rules, capital region mortgages get up to 3.0% added, while non-capital regions get 0.75% (grace period).",
        },
        {
          q: "Which loans are exempt from DSR?",
          a: "Jeonse (lump-sum deposit) loans, interim payment loans (new construction), small credit loans under 3 million KRW, government-backed loans (Didimdol, Bogeumjari), and social finance products are either exempt or subject to relaxed DSR rules.",
        },
        {
          q: "How can I increase my loan limit?",
          a: "Choose a fixed rate (0% stress rate applied). Extend the loan term to reduce annual payments. Pay off existing debts. Add income documentation (side jobs, rental income). Consider non-capital region properties for lower stress rates.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "연소득(만원)을 입력합니다.",
        "신규 대출 금액, 금리, 기간, 상환방식, 금리유형을 설정합니다.",
        "대출 지역(수도권/비수도권)과 금융권(은행/비은행)을 선택합니다.",
        "기존 대출이 있으면 '기존 대출 추가' 버튼으로 입력합니다.",
        "결과에서 DSR 비율, 대출 가능 한도, 스트레스 금리 적용 내역을 확인합니다.",
      ]
    : [
        "Enter your annual income (in 10,000 KRW units).",
        "Set new loan amount, rate, term, repayment method, and rate type.",
        "Select loan region (capital/non-capital) and lender type (bank/non-bank).",
        "Add existing loans using the 'Add Existing Loan' button if applicable.",
        "Review your DSR ratio, max loan amount, and stress rate details in the results.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* ── 소득 정보 ── */}
        <div>
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            {isKo ? "소득 정보" : "Income"}
          </h2>
          <label className={labelClass}>{isKo ? "연소득 (만원)" : "Annual Income (10K KRW)"}</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={incomeStr}
              onChange={(e) => setIncomeStr(formatNumber(e.target.value))}
              placeholder="5,000"
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              {isKo ? "만원" : "×10K"}
            </span>
          </div>
          {parseFormatted(incomeStr) > 0 && (
            <p className="text-xs text-neutral-400 mt-1">{formatKrw(parseFormatted(incomeStr) * 10000)}</p>
          )}
          <input
            type="range"
            min={1000}
            max={30000}
            step={100}
            value={parseFormatted(incomeStr) || 5000}
            onChange={(e) => setIncomeStr(Number(e.target.value).toLocaleString("ko-KR"))}
            className="w-full mt-2 accent-blue-600"
          />
          <div className="flex justify-between text-xs text-neutral-400">
            <span>1,000{isKo ? "만" : ""}</span>
            <span>30,000{isKo ? "만" : ""}</span>
          </div>
        </div>

        {/* ── 신규 대출 정보 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">{isKo ? "신규 대출 정보" : "New Loan Details"}</h2>

          {/* 대출 금액 */}
          <div className="mb-4">
            <label className={labelClass}>{isKo ? "대출 금액 (만원)" : "Loan Amount (10K KRW)"}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={newLoanStr}
                onChange={(e) => setNewLoanStr(formatNumber(e.target.value))}
                placeholder={isKo ? "30,000" : "30,000"}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "만원" : "×10K"}
              </span>
            </div>
            {parseFormatted(newLoanStr) > 0 && (
              <p className="text-xs text-neutral-400 mt-1">{formatKrw(parseFormatted(newLoanStr) * 10000)}</p>
            )}
          </div>

          {/* 금리 + 기간 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>{isKo ? "대출 금리 (%)" : "Interest Rate (%)"}</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="4.5"
                  className={`${inputClass} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>{isKo ? "대출 기간" : "Loan Term"}</label>
              <select
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className={inputClass}
              >
                {termOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}{isKo ? "년" : " years"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 상환방식 */}
          <div className="mb-4">
            <label className={labelClass}>{isKo ? "상환방식" : "Repayment Method"}</label>
            <div className="flex flex-wrap gap-3">
              {methodOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="newMethod"
                    checked={newMethod === opt.value}
                    onChange={() => setNewMethod(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 금리유형 */}
          <div className="mb-4">
            <label className={`${labelClass} flex items-center gap-1`}>
              {isKo ? "금리유형" : "Rate Type"}
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs leading-none hover:bg-neutral-300 dark:hover:bg-neutral-600 cursor-pointer"
              >
                ?
              </button>
            </label>
            {showTooltip && (
              <div className="mb-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <p>{isKo ? "스트레스 금리 적용비율:" : "Stress rate application ratio:"}</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>{isKo ? "변동금리: 100% 적용" : "Variable: 100% applied"}</li>
                  <li>{isKo ? "혼합형(5년 고정): 60% 적용" : "Mixed (5yr fixed): 60% applied"}</li>
                  <li>{isKo ? "주기형(5년 주기): 40% 적용" : "Periodic (5yr cycle): 40% applied"}</li>
                  <li>{isKo ? "고정금리: 0% (스트레스 미적용)" : "Fixed: 0% (no stress)"}</li>
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {rateTypeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rateType"
                    checked={rateType === opt.value}
                    onChange={() => setRateType(opt.value)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 지역 + 금융권 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isKo ? "대출 지역" : "Loan Region"}</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    checked={region === "capital"}
                    onChange={() => setRegion("capital")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{isKo ? "수도권" : "Capital Region"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="region"
                    checked={region === "non-capital"}
                    onChange={() => setRegion("non-capital")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{isKo ? "비수도권" : "Non-capital"}</span>
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>{isKo ? "금융권" : "Lender Type"}</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lender"
                    checked={lender === "bank"}
                    onChange={() => setLender("bank")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{isKo ? "은행 (1금융)" : "Bank"}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lender"
                    checked={lender === "non-bank"}
                    onChange={() => setLender("non-bank")}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">{isKo ? "비은행 (2금융)" : "Non-bank"}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ── 기존 대출 ── */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
          <h2 className="text-base font-semibold mb-4">
            {isKo ? "기존 대출 정보 (선택)" : "Existing Loans (optional)"}
          </h2>

          {existingLoans.map((loan, idx) => (
            <div key={idx} className="mb-4 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {isKo ? `기존 대출 ${idx + 1}` : `Existing Loan ${idx + 1}`}
                </span>
                <button
                  onClick={() => removeExistingLoan(idx)}
                  className="text-neutral-400 hover:text-red-500 text-lg leading-none cursor-pointer"
                  title={isKo ? "삭제" : "Remove"}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium block mb-1">{isKo ? "대출 종류" : "Loan Type"}</label>
                  <select
                    value={loan.type}
                    onChange={(e) => updateExistingLoan(idx, "type", e.target.value)}
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {loanTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{isKo ? "잔액 (만원)" : "Balance (10K KRW)"}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={loan.balance}
                    onChange={(e) => updateExistingLoan(idx, "balance", formatNumber(e.target.value))}
                    placeholder="10,000"
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{isKo ? "금리 (%)" : "Rate (%)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loan.rate}
                    onChange={(e) => updateExistingLoan(idx, "rate", e.target.value)}
                    placeholder="5"
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">{isKo ? "잔여 기간 (년)" : "Remaining (years)"}</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={loan.remainYears}
                    onChange={(e) => updateExistingLoan(idx, "remainYears", e.target.value)}
                    placeholder="20"
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "상환방식" : "Repayment"}</label>
                <select
                  value={loan.method}
                  onChange={(e) => updateExistingLoan(idx, "method", e.target.value as RepayMethod)}
                  className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {methodOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {existingLoans.length < 5 && (
            <button
              onClick={addExistingLoan}
              className="w-full py-2 rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer"
            >
              + {isKo ? `기존 대출 추가 (${existingLoans.length}/5)` : `Add Existing Loan (${existingLoans.length}/5)`}
            </button>
          )}
        </div>

        {/* ── 결과 ── */}
        {result && result.annualIncome > 0 && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* 메인 DSR 카드 */}
              <div className={`rounded-lg border-2 p-6 text-center ${getDsrBgColor(result.dsr)}`}>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  {isKo ? "현재 DSR" : "Current DSR"}
                </p>
                <p className={`text-5xl font-bold tracking-tight ${getDsrColor(result.dsr)}`}>
                  {result.dsr.toFixed(1)}%
                </p>
                <p className={`text-sm font-medium mt-2 ${getDsrColor(result.dsr)}`}>
                  {getDsrStatus(result.dsr)}
                </p>
                <div className="mt-3 flex justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{isKo ? "은행 기준: 40%" : "Bank limit: 40%"}</span>
                  <span>{isKo ? "비은행 기준: 50%" : "Non-bank limit: 50%"}</span>
                </div>
              </div>

              {/* 게이지 차트 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-sm font-medium mb-3">{isKo ? "DSR 비율 게이지" : "DSR Gauge"}</p>
                <div className="relative h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  {/* 녹색 구간 0-30 */}
                  <div className="absolute left-0 top-0 h-full bg-green-200 dark:bg-green-900/50" style={{ width: `${(30 / 60) * 100}%` }} />
                  {/* 노란 구간 30-40 */}
                  <div className="absolute top-0 h-full bg-yellow-200 dark:bg-yellow-900/50" style={{ left: `${(30 / 60) * 100}%`, width: `${(10 / 60) * 100}%` }} />
                  {/* 빨간 구간 40-60 */}
                  <div className="absolute top-0 h-full bg-red-200 dark:bg-red-900/50" style={{ left: `${(40 / 60) * 100}%`, width: `${(20 / 60) * 100}%` }} />
                  {/* 현재 위치 마커 */}
                  <div
                    className="absolute top-0 h-full w-1 bg-neutral-800 dark:bg-white transition-all"
                    style={{ left: `${Math.min((result.dsr / 60) * 100, 100)}%` }}
                  />
                  {/* 40% 라인 */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-red-500 opacity-60"
                    style={{ left: `${(40 / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>0%</span>
                  <span>30%</span>
                  <span className="text-red-500">40%</span>
                  <span>50%</span>
                  <span>60%</span>
                </div>
              </div>

              {/* 파이 차트 - 연소득 구성 */}
              {result.totalAnnualPayment > 0 && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm font-medium mb-3">{isKo ? "연소득 대비 상환 비율" : "Income vs Repayment"}</p>
                  <div className="flex h-8 rounded-md overflow-hidden">
                    <div
                      className="bg-red-500 flex items-center justify-center text-xs text-white font-medium min-w-[2rem]"
                      style={{ width: `${Math.min(result.dsr, 100)}%` }}
                      title={isKo ? "대출 상환" : "Loan Repayment"}
                    >
                      {result.dsr >= 10 ? `${result.dsr.toFixed(0)}%` : ""}
                    </div>
                    <div
                      className="bg-green-500 flex items-center justify-center text-xs text-white font-medium min-w-[2rem]"
                      style={{ width: `${Math.max(100 - result.dsr, 0)}%` }}
                      title={isKo ? "나머지 소득" : "Remaining Income"}
                    >
                      {100 - result.dsr >= 10 ? `${(100 - result.dsr).toFixed(0)}%` : ""}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs mt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {isKo ? "연간 상환액" : "Annual Repayment"}: {formatKrw(result.totalAnnualPayment)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {isKo ? "나머지" : "Remaining"}: {formatKrw(Math.max(0, result.annualIncome - result.totalAnnualPayment))}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* 바 차트 - 대출별 연간 원리금 */}
              {(result.newAnnualPayment > 0 || result.existingBreakdown.length > 0) && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-sm font-medium mb-3">{isKo ? "대출별 연간 원리금" : "Annual Payments by Loan"}</p>
                  <div className="space-y-3">
                    {result.newAnnualPayment > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-blue-600 dark:text-blue-400">
                            {isKo ? "신규 대출" : "New Loan"}
                          </span>
                          <span className="text-neutral-500">{formatKrw(result.newAnnualPayment)}</span>
                        </div>
                        <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${
                                result.totalAnnualPayment > 0
                                  ? (result.newAnnualPayment / result.totalAnnualPayment) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {result.existingBreakdown.map((item, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-neutral-600 dark:text-neutral-400">{item.label}</span>
                          <span className="text-neutral-500">{formatKrw(item.annual)}</span>
                        </div>
                        <div className="h-5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500"
                            style={{
                              width: `${
                                result.totalAnnualPayment > 0
                                  ? (item.annual / result.totalAnnualPayment) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 상세 결과 테이블 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 상환액 내역" : "─ Payment Details"}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "신규 대출 연간 원리금" : "New Loan Annual Payment"}
                      </td>
                      <td className="p-3 text-right">{formatKrw(result.newAnnualPayment)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "기존 대출 연간 원리금 합계" : "Existing Loans Annual Total"}
                      </td>
                      <td className="p-3 text-right">{formatKrw(result.existingAnnualPayment)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "총 연간 원리금 상환액" : "Total Annual Payment"}</td>
                      <td className="p-3 text-right">{formatKrw(result.totalAnnualPayment)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "연소득" : "Annual Income"}</td>
                      <td className="p-3 text-right">{formatKrw(result.annualIncome)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-semibold">
                      <td className="p-3">{isKo ? "DSR" : "DSR"}</td>
                      <td className={`p-3 text-right ${getDsrColor(result.dsr)}`}>{result.dsr.toFixed(2)}%</td>
                    </tr>

                    <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                      <td colSpan={2} className="p-3 text-xs font-medium text-blue-600 dark:text-blue-400">
                        {isKo ? "─ 스트레스 금리 적용" : "─ Stress Rate Details"}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "실제 금리" : "Actual Rate"}</td>
                      <td className="p-3 text-right">{result.actualRate.toFixed(1)}%</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "스트레스 금리 (기본)" : "Stress Rate (base)"}
                      </td>
                      <td className="p-3 text-right">{result.stressRate.toFixed(2)}%</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {isKo ? "적용 스트레스 금리" : "Applied Stress Rate"}
                      </td>
                      <td className="p-3 text-right">+{result.appliedStressRate.toFixed(2)}%</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700 font-medium">
                      <td className="p-3">{isKo ? "심사 금리" : "Review Rate"}</td>
                      <td className="p-3 text-right">{result.reviewRate.toFixed(2)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 대출 가능 한도 */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3">
                <p className="text-sm font-medium">{isKo ? "대출 가능 한도" : "Maximum Loan Amount"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`rounded-lg border p-3 ${lender === "bank" ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20" : "border-neutral-200 dark:border-neutral-700"}`}>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      {isKo ? "1금융권 (DSR 40%)" : "Bank (DSR 40%)"}
                    </p>
                    <p className="text-lg font-semibold">{formatKrw(result.maxLoanBank)}</p>
                  </div>
                  <div className={`rounded-lg border p-3 ${lender === "non-bank" ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20" : "border-neutral-200 dark:border-neutral-700"}`}>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      {isKo ? "2금융권 (DSR 50%)" : "Non-bank (DSR 50%)"}
                    </p>
                    <p className="text-lg font-semibold">{formatKrw(result.maxLoanNonBank)}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                      {isKo ? "스트레스 미적용 시 (참고)" : "Without Stress (ref)"}
                    </p>
                    <p className="text-lg font-semibold text-neutral-500">{formatKrw(result.maxLoanNoStress)}</p>
                  </div>
                </div>
              </div>
            </div>

            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="dsr-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      {/* 면책 문구 */}
      <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          {isKo
            ? "⚠ 이 계산기는 참고용이며, 실제 DSR은 금융기관 전산으로 조회해야 정확합니다. 소득 인정 기준, 대출 종류별 세부 규정에 따라 실제 결과와 차이가 있을 수 있습니다."
            : "⚠ This calculator is for reference only. Actual DSR is determined by the financial institution's system. Results may differ based on income verification criteria and specific loan regulations."}
        </p>
      </div>

      {/* 하단 설명 섹션 */}
      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "DSR이란?" : "What is DSR?"}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
            {isKo
              ? "DSR(Debt Service Ratio, 총부채원리금상환비율)은 대출 신청자의 연간 소득 대비 모든 금융권 대출의 연간 원리금 상환액 비율입니다. 주택담보대출뿐 아니라 신용대출, 자동차할부, 학자금대출, 카드론 등 모든 대출의 원금과 이자를 합산하여 계산합니다. 은행(1금융권)은 DSR 40%, 비은행(2금융권)은 DSR 50%가 한도입니다."
              : "DSR (Debt Service Ratio) is the ratio of a borrower's total annual principal and interest payments on all financial institution loans to their annual income. It includes not only mortgages but also personal loans, auto loans, student loans, and card loans. Banks are limited to DSR 40%, while non-bank lenders are limited to DSR 50%."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "DSR vs DTI 차이점" : "DSR vs DTI"}</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm border border-neutral-200 dark:border-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="p-3 text-left font-medium">{isKo ? "구분" : "Category"}</th>
                  <th className="p-3 text-left font-medium">DTI</th>
                  <th className="p-3 text-left font-medium">DSR</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "주담대" : "Mortgage"}</td>
                  <td className="p-3">{isKo ? "원금 + 이자" : "Principal + Interest"}</td>
                  <td className="p-3">{isKo ? "원금 + 이자" : "Principal + Interest"}</td>
                </tr>
                <tr className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "기타 대출" : "Other Loans"}</td>
                  <td className="p-3">{isKo ? "이자만" : "Interest Only"}</td>
                  <td className="p-3 font-medium">{isKo ? "원금 + 이자" : "Principal + Interest"}</td>
                </tr>
                <tr className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "엄격도" : "Strictness"}</td>
                  <td className="p-3">{isKo ? "느슨" : "Looser"}</td>
                  <td className="p-3 font-medium">{isKo ? "엄격" : "Stricter"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "스트레스 DSR 3단계 (2026년)" : "Stress DSR Stage 3 (2026)"}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-3">
            {isKo
              ? "스트레스 DSR은 향후 금리 상승 시 상환 부담을 미리 반영하는 제도입니다. 실제 대출 금리에 스트레스 금리를 가산하여 심사합니다."
              : "Stress DSR preemptively reflects potential future rate increases. A stress rate is added to the actual loan rate for screening purposes."}
          </p>
          <div className="overflow-auto">
            <table className="w-full text-sm border border-neutral-200 dark:border-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="p-3 text-left font-medium">{isKo ? "지역" : "Region"}</th>
                  <th className="p-3 text-right font-medium">{isKo ? "스트레스 금리" : "Stress Rate"}</th>
                  <th className="p-3 text-left font-medium">{isKo ? "비고" : "Note"}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3">{isKo ? "수도권 (서울·경기·인천)" : "Capital (Seoul/Gyeonggi/Incheon)"}</td>
                  <td className="p-3 text-right font-medium">3.0%</td>
                  <td className="p-3 text-neutral-500 text-xs">{isKo ? "상한 적용" : "Upper limit"}</td>
                </tr>
                <tr className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3">{isKo ? "비수도권" : "Non-capital"}</td>
                  <td className="p-3 text-right font-medium">0.75%</td>
                  <td className="p-3 text-neutral-500 text-xs">{isKo ? "2026.6.30까지 유예" : "Grace until 2026.6.30"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "DSR 예외 대출" : "DSR Exempt Loans"}</h2>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {(isKo
              ? [
                  "전세자금대출",
                  "중도금대출 (분양 아파트)",
                  "300만원 이하 소액 신용대출",
                  "서민금융상품 (햇살론, 새희망홀씨 등)",
                  "정책 모기지 (디딤돌, 보금자리론)",
                  "주택도시기금 대출",
                ]
              : [
                  "Jeonse (lump-sum deposit) loans",
                  "Interim payment loans (new apartment construction)",
                  "Small credit loans under 3 million KRW",
                  "Government social finance products",
                  "Policy mortgages (Didimdol, Bogeumjari)",
                  "Housing & Urban Fund loans",
                ]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">{isKo ? "대출 한도 늘리는 팁" : "Tips to Increase Your Loan Limit"}</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {(isKo
              ? [
                  "고정금리 선택 → 스트레스 금리 0% 적용으로 심사 금리 낮아짐",
                  "대출 기간 늘리기 → 연간 원리금 줄어들어 DSR 낮아짐",
                  "기존 대출 정리 → 소액 대출, 카드론 먼저 상환",
                  "소득 증빙 추가 → 부업, 임대소득, 연금 등 소득 항목 추가",
                  "비수도권 물건 검토 → 스트레스 금리 0.75%로 낮음",
                  "원리금균등상환 선택 → 만기일시 대비 연간 원리금 적어 유리",
                ]
              : [
                  "Choose fixed rate → 0% stress rate makes the review rate lower",
                  "Extend loan term → Lower annual payment reduces DSR",
                  "Pay off existing debts → Clear small loans and card loans first",
                  "Add income sources → Side jobs, rental income, pensions",
                  "Consider non-capital region → Lower stress rate (0.75%)",
                  "Use equal payment method → Lower annual repayment vs interest-only",
                ]
            ).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
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

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/${lang}/tools/loan-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.loanCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.loanCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/loan-comparison-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.loanComparisonCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.loanComparisonCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/mortgage-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.mortgage}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.mortgageDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/rent-conversion-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.rentConversionCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.rentConversionCalcDesc}</p>
          </Link>
        </div>
      </section>

      {/* Share & Embed */}
      <ShareButtons title={title} description={description} lang={lang} slug="dsr-calculator" labels={dict.share} />
      <EmbedCodeButton slug="dsr-calculator" lang={lang} labels={dict.embed} />

      {/* Related Posts */}
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
