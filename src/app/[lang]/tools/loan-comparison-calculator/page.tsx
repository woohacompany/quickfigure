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

interface LoanInput {
  name: string;
  amount: string;
  rate: string;
  termYears: string;
  method: "equal-payment" | "equal-principal" | "bullet";
}

interface LoanResult {
  name: string;
  monthlyPaymentFirst: number;
  monthlyPaymentLast: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  method: string;
}

const COLORS = [
  { border: "border-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
  { border: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { border: "border-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", bar: "bg-purple-500" },
];

function createDefaultLoan(index: number, isKo: boolean): LoanInput {
  const labels = isKo
    ? ["대출 A", "대출 B", "대출 C"]
    : ["Loan A", "Loan B", "Loan C"];
  return {
    name: labels[index] || `Loan ${index + 1}`,
    amount: "",
    rate: "",
    termYears: "",
    method: "equal-payment",
  };
}

export default function LoanComparisonCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("loan-comparison-calculator");
  const isKo = locale === "ko";

  const title = isKo ? "대출 이자 비교 계산기" : "Loan Comparison Calculator";
  const description = isKo
    ? "최대 3개 대출 조건을 나란히 비교하세요. 월 상환액, 총 이자, 총 상환액을 한눈에 확인합니다."
    : "Compare up to 3 loan options side by side. Calculate monthly payments, total interest, and total cost for different rates and terms.";

  const [currency, setCurrency] = useState<Currency>(isKo ? "KRW" : "USD");
  const sym = getCurrencySymbol(currency);
  const fmt = (v: number) => formatCurrency(v, currency);
  const unitHint = (v: number) => (currency === "KRW" ? formatKRW(v) : formatUSD(v));

  const [loans, setLoans] = useState<LoanInput[]>([
    createDefaultLoan(0, isKo),
    createDefaultLoan(1, isKo),
  ]);
  const [results, setResults] = useState<LoanResult[] | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function updateLoan(index: number, field: keyof LoanInput, value: string) {
    setLoans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addLoan() {
    if (loans.length >= 3) return;
    setLoans((prev) => [...prev, createDefaultLoan(prev.length, isKo)]);
  }

  function removeLoan(index: number) {
    if (loans.length <= 2) return;
    setLoans((prev) => prev.filter((_, i) => i !== index));
    setResults(null);
  }

  function calculate() {
    const computed: LoanResult[] = [];

    for (const loan of loans) {
      const P = parseFloat(loan.amount) || 0;
      const annualRate = parseFloat(loan.rate) || 0;
      const y = parseFloat(loan.termYears) || 0;
      if (P <= 0 || annualRate <= 0 || y <= 0) return;

      const r = annualRate / 100 / 12;
      const n = y * 12;

      let monthlyPaymentFirst = 0;
      let monthlyPaymentLast = 0;
      let totalInterest = 0;
      let totalPayment = 0;

      if (loan.method === "equal-payment") {
        // 원리금균등상환 (PMT)
        const M = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        monthlyPaymentFirst = M;
        monthlyPaymentLast = M;
        totalPayment = M * n;
        totalInterest = totalPayment - P;
      } else if (loan.method === "equal-principal") {
        // 원금균등상환
        const monthlyPrincipal = P / n;
        monthlyPaymentFirst = monthlyPrincipal + P * r;
        monthlyPaymentLast = monthlyPrincipal + monthlyPrincipal * r;
        // Total interest = sum of (remaining balance * r) for each month
        // = r * P * (n+1) / 2
        totalInterest = r * P * (n + 1) / 2;
        totalPayment = P + totalInterest;
      } else {
        // 만기일시상환 (Bullet / Interest Only)
        monthlyPaymentFirst = P * r;
        monthlyPaymentLast = P + P * r;
        totalInterest = P * r * n;
        totalPayment = P + totalInterest;
      }

      const methodLabel = loan.method === "equal-payment"
        ? (isKo ? "원리금균등" : "Equal Payment")
        : loan.method === "equal-principal"
        ? (isKo ? "원금균등" : "Equal Principal")
        : (isKo ? "만기일시" : "Interest Only");

      computed.push({
        name: loan.name || `Loan ${computed.length + 1}`,
        monthlyPaymentFirst,
        monthlyPaymentLast,
        totalInterest,
        totalPayment,
        principal: P,
        method: methodLabel,
      });
    }

    setResults(computed);
  }

  const bestIndex = results
    ? results.reduce((best, cur, i, arr) => (cur.totalInterest < arr[best].totalInterest ? i : best), 0)
    : -1;

  const maxTotalPayment = results ? Math.max(...results.map((r) => r.totalPayment)) : 0;
  const maxTotalInterest = results ? Math.max(...results.map((r) => r.totalInterest)) : 0;

  const methodOptions = [
    { value: "equal-payment", label: isKo ? "원리금균등상환" : "Equal Payment (PMT)" },
    { value: "equal-principal", label: isKo ? "원금균등상환" : "Equal Principal" },
    { value: "bullet", label: isKo ? "만기일시상환" : "Interest Only (Bullet)" },
  ];

  const faqItems = isKo
    ? [
        {
          q: "원리금균등상환과 원금균등상환의 차이점은?",
          a: "원리금균등상환은 매월 동일한 금액(원금+이자)을 납부합니다. 원금균등상환은 매월 동일한 원금을 납부하고 이자는 남은 잔액에 따라 점차 줄어듭니다. 총 이자는 원금균등상환이 더 적지만, 초기 월 납부액은 더 높습니다.",
        },
        {
          q: "만기일시상환이란 무엇인가요?",
          a: "만기일시상환은 대출 기간 동안 매월 이자만 납부하고, 원금은 대출 만기일에 한꺼번에 상환하는 방식입니다. 월 부담은 가장 적지만, 총 이자 비용은 세 가지 방식 중 가장 높습니다.",
        },
        {
          q: "어떤 상환 방식이 가장 유리한가요?",
          a: "총 이자 비용 기준으로는 원금균등 < 원리금균등 < 만기일시 순으로 유리합니다. 반면 초기 월 부담 기준으로는 만기일시 < 원리금균등 < 원금균등 순입니다. 본인의 재정 상황에 맞는 방식을 선택하세요.",
        },
        {
          q: "기존 대출 계산기와 차이점은 무엇인가요?",
          a: "기존 대출 계산기는 단일 대출의 상세 상환 스케줄을 분석합니다. 이 대출 비교 계산기는 최대 3개의 서로 다른 대출 조건(금리, 기간, 상환방식)을 동시에 비교하여 가장 유리한 옵션을 찾는 데 특화되어 있습니다.",
        },
        {
          q: "변동금리 대출도 비교할 수 있나요?",
          a: "이 계산기는 고정금리를 기준으로 계산합니다. 변동금리 대출은 금리가 변경될 때마다 실제 이자가 달라지므로, 비교 시 현재 금리를 기준으로 참고용으로 활용하시기 바랍니다.",
        },
      ]
    : [
        {
          q: "What is the difference between Equal Payment and Equal Principal?",
          a: "Equal Payment (PMT) keeps your monthly payment the same throughout the loan term — a mix of principal and interest that stays constant. Equal Principal keeps the principal portion constant each month while interest decreases as the balance drops. Equal Principal results in lower total interest but higher initial payments.",
        },
        {
          q: "What is Interest Only (Bullet) repayment?",
          a: "With Interest Only (Bullet) repayment, you pay only the interest each month and repay the full principal at the end of the loan term. Monthly payments are the lowest, but total interest paid is the highest of all three methods.",
        },
        {
          q: "Which repayment method is the most economical?",
          a: "By total interest cost: Equal Principal < Equal Payment < Interest Only (Bullet). By initial monthly burden: Interest Only < Equal Payment < Equal Principal. Choose the method that best fits your cash flow situation.",
        },
        {
          q: "How is this different from the regular Loan Calculator?",
          a: "The regular Loan Calculator analyzes a single loan in detail with a full amortization schedule. This Loan Comparison Calculator lets you compare up to 3 different loan options (different rates, terms, or repayment methods) side by side to find the best deal.",
        },
        {
          q: "Can I compare variable-rate loans?",
          a: "This calculator assumes fixed interest rates. For variable-rate loans, the actual interest will change over time. You can use the current rate as a reference point for comparison purposes.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "통화(₩/$)를 선택하고, 비교할 대출 조건을 2~3개 입력합니다.",
        "각 대출에 대해 대출명, 대출금액, 연이율, 대출기간을 입력합니다.",
        "각 대출의 상환 방식(원리금균등, 원금균등, 만기일시)을 선택합니다.",
        "'비교하기' 버튼을 클릭하면 결과가 표시됩니다.",
        "비교 결과에서 총 이자, 총 상환액, 월 납부액을 한눈에 확인하고 가장 유리한 옵션을 선택하세요.",
      ]
    : [
        "Select your currency (₩/$) and enter 2 or 3 loan conditions to compare.",
        "For each loan, enter a label, loan amount, annual interest rate, and loan term in years.",
        "Choose the repayment method for each loan: Equal Payment, Equal Principal, or Interest Only.",
        "Click the 'Compare' button to see the results.",
        "Review the comparison results — total interest, total payment, and monthly payments — to pick the best option.",
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      {/* Tool UI */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Currency selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">{isKo ? "통화" : "Currency"}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="KRW">₩ KRW</option>
            <option value="USD">$ USD</option>
          </select>
        </div>

        {/* Loan input columns */}
        <div className={`grid gap-4 ${loans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {loans.map((loan, idx) => (
            <div
              key={idx}
              className={`rounded-lg border-2 ${COLORS[idx].border} ${COLORS[idx].bg} p-4 space-y-4 relative`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className={`text-sm font-bold ${COLORS[idx].text}`}>
                  {isKo ? `대출 ${String.fromCharCode(65 + idx)}` : `Loan ${String.fromCharCode(65 + idx)}`}
                </div>
                {loans.length > 2 && (
                  <button
                    onClick={() => removeLoan(idx)}
                    className="text-neutral-400 hover:text-red-500 text-lg leading-none"
                    title={isKo ? "삭제" : "Remove"}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Loan Name */}
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "대출명" : "Loan Name"}</label>
                <input
                  type="text"
                  value={loan.name}
                  onChange={(e) => updateLoan(idx, "name", e.target.value)}
                  placeholder={isKo ? "예: 은행 A" : "e.g. Bank A"}
                  className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "대출 금액" : "Loan Amount"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{sym}</span>
                  <input
                    type="number"
                    value={loan.amount}
                    onChange={(e) => updateLoan(idx, "amount", e.target.value)}
                    placeholder={currency === "KRW" ? "300000000" : "300000"}
                    className="w-full p-2 pl-7 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {loan.amount && parseFloat(loan.amount) > 0 && (
                  <p className="text-xs text-neutral-400 mt-0.5">{unitHint(parseFloat(loan.amount))}</p>
                )}
              </div>

              {/* Interest Rate */}
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "연 이자율 (%)" : "Annual Rate (%)"}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={loan.rate}
                    onChange={(e) => updateLoan(idx, "rate", e.target.value)}
                    placeholder="5"
                    step="0.1"
                    className="w-full p-2 pr-7 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                </div>
              </div>

              {/* Term (Years) */}
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "대출 기간 (년)" : "Term (Years)"}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={loan.termYears}
                    onChange={(e) => updateLoan(idx, "termYears", e.target.value)}
                    placeholder="30"
                    className="w-full p-2 pr-10 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                    {isKo ? "년" : "yr"}
                  </span>
                </div>
              </div>

              {/* Repayment Method */}
              <div>
                <label className="text-xs font-medium block mb-1">{isKo ? "상환 방식" : "Repayment Method"}</label>
                <select
                  value={loan.method}
                  onChange={(e) => updateLoan(idx, "method", e.target.value as LoanInput["method"])}
                  className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {methodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Add loan button */}
        {loans.length < 3 && (
          <button
            onClick={addLoan}
            className="w-full py-2 rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 text-sm font-medium hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer"
          >
            + {isKo ? "대출 추가 (최대 3개)" : "Add Loan (max 3)"}
          </button>
        )}

        {/* Compare button */}
        <button
          onClick={calculate}
          className="w-full py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "비교하기" : "Compare Loans"}
        </button>

        {/* Results */}
        {results && (
          <>
          <div ref={resultRef} className="space-y-6 mt-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <h2 className="text-lg font-semibold">{isKo ? "비교 결과" : "Comparison Results"}</h2>

            {/* Result cards */}
            <div className={`grid gap-4 ${results.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-4 space-y-3 ${
                    idx === bestIndex
                      ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                      : `${COLORS[idx].border} ${COLORS[idx].bg}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm ${idx === bestIndex ? "text-green-600 dark:text-green-400" : COLORS[idx].text}`}>
                      {r.name}
                    </h3>
                    {idx === bestIndex && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {isKo ? "최적" : "Best"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{r.method}</p>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isKo ? "월 납부액" : "Monthly Payment"}
                        {r.monthlyPaymentFirst !== r.monthlyPaymentLast
                          ? ` (${isKo ? "첫/마지막" : "first/last"})`
                          : ""}
                      </p>
                      <p className="text-lg font-semibold">{fmt(r.monthlyPaymentFirst)}</p>
                      {r.monthlyPaymentFirst !== r.monthlyPaymentLast && (
                        <p className="text-sm text-neutral-500">~ {fmt(r.monthlyPaymentLast)}</p>
                      )}
                      <p className="text-xs text-neutral-400">{unitHint(r.monthlyPaymentFirst)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isKo ? "총 이자" : "Total Interest"}
                      </p>
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">{fmt(r.totalInterest)}</p>
                      <p className="text-xs text-neutral-400">{unitHint(r.totalInterest)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isKo ? "총 상환액" : "Total Payment"}
                      </p>
                      <p className="text-lg font-semibold">{fmt(r.totalPayment)}</p>
                      <p className="text-xs text-neutral-400">{unitHint(r.totalPayment)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual bar comparison - Total Payment */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isKo ? "총 상환액 비교" : "Total Payment Comparison"}</h3>
              {results.map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${idx === bestIndex ? "text-green-600 dark:text-green-400" : COLORS[idx].text}`}>
                      {r.name}
                    </span>
                    <span className="text-neutral-500">{fmt(r.totalPayment)}</span>
                  </div>
                  <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${idx === bestIndex ? "bg-green-500" : COLORS[idx].bar}`}
                      style={{ width: maxTotalPayment > 0 ? `${(r.totalPayment / maxTotalPayment) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Visual bar comparison - Total Interest */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isKo ? "총 이자 비교" : "Total Interest Comparison"}</h3>
              {results.map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${idx === bestIndex ? "text-green-600 dark:text-green-400" : COLORS[idx].text}`}>
                      {r.name}
                    </span>
                    <span className="text-neutral-500">{fmt(r.totalInterest)}</span>
                  </div>
                  <div className="h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${idx === bestIndex ? "bg-green-500" : COLORS[idx].bar}`}
                      style={{ width: maxTotalInterest > 0 ? `${(r.totalInterest / maxTotalInterest) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary comparison table */}
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="text-left p-3 font-medium">{isKo ? "항목" : "Item"}</th>
                    {results.map((r, idx) => (
                      <th key={idx} className={`text-right p-3 font-medium ${idx === bestIndex ? "text-green-600 dark:text-green-400" : COLORS[idx].text}`}>
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "대출 원금" : "Principal"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className="p-3 text-right">{fmt(r.principal)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "상환 방식" : "Method"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className="p-3 text-right text-xs">{r.method}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "월 납부액 (첫 달)" : "Monthly (1st)"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className="p-3 text-right">{fmt(r.monthlyPaymentFirst)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "월 납부액 (마지막)" : "Monthly (Last)"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className="p-3 text-right">{fmt(r.monthlyPaymentLast)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400 font-medium">{isKo ? "총 이자" : "Total Interest"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className={`p-3 text-right font-medium ${idx === bestIndex ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {fmt(r.totalInterest)}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-neutral-200 dark:border-neutral-700">
                    <td className="p-3 text-neutral-600 dark:text-neutral-400 font-medium">{isKo ? "총 상환액" : "Total Payment"}</td>
                    {results.map((r, idx) => (
                      <td key={idx} className={`p-3 text-right font-medium ${idx === bestIndex ? "text-green-600 dark:text-green-400" : ""}`}>
                        {fmt(r.totalPayment)}
                      </td>
                    ))}
                  </tr>
                  {results.length > 1 && (
                    <tr className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400 text-xs">
                        {isKo ? "최적 대비 이자 차이" : "Interest Diff vs Best"}
                      </td>
                      {results.map((r, idx) => {
                        const diff = r.totalInterest - results[bestIndex].totalInterest;
                        return (
                          <td key={idx} className={`p-3 text-right text-xs ${idx === bestIndex ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                            {idx === bestIndex ? "-" : `+${fmt(diff)}`}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <SaveResultImage targetRef={resultRef} toolName={title} slug="loan-comparison-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

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
          <Link
            href={`/${lang}/tools/mortgage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.mortgage}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.mortgageDesc}
            </p>
          </Link>
        </div>
      </section>

      {/* Share & Embed */}
      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="loan-comparison-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="loan-comparison-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {/* Related Posts */}
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
