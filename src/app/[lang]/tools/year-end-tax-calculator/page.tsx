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

/* ── Tax brackets 2026 ── */
const TAX_BRACKETS = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
];

function calcEarnedIncomeDeduction(totalSalary: number): number {
  if (totalSalary <= 5_000_000) return totalSalary * 0.70;
  if (totalSalary <= 15_000_000) return 3_500_000 + (totalSalary - 5_000_000) * 0.40;
  if (totalSalary <= 45_000_000) return 7_500_000 + (totalSalary - 15_000_000) * 0.15;
  if (totalSalary <= 100_000_000) return 12_000_000 + (totalSalary - 45_000_000) * 0.05;
  return Math.min(14_750_000, 14_750_000 + (totalSalary - 100_000_000) * 0.02);
}

function calcProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.max) return taxBase * b.rate - b.deduction;
  }
  return taxBase * 0.45 - 65_940_000;
}

function calcCardDeduction(totalSalary: number, credit: number, debit: number, cash: number): number {
  const threshold = totalSalary * 0.25;
  const totalSpending = credit + debit + cash;
  if (totalSpending <= threshold) return 0;

  const excess = totalSpending - threshold;
  // 신용카드 15%, 체크카드/현금영수증 30% 공제율
  // simplified: credit first, then debit+cash
  let deductible = 0;
  const creditExcess = Math.max(0, credit - threshold);
  if (credit >= threshold) {
    deductible = creditExcess * 0.15 + debit * 0.30 + cash * 0.30;
  } else {
    const remainThreshold = threshold - credit;
    if (debit + cash > remainThreshold) {
      deductible = (debit + cash - remainThreshold) * 0.30;
    }
  }

  // 공제 한도
  let limit = 3_000_000;
  if (totalSalary <= 70_000_000) limit = 3_000_000;
  else if (totalSalary <= 120_000_000) limit = 2_500_000;
  else limit = 2_000_000;

  return Math.min(deductible, limit);
}

function calcChildCredit(childrenUnder20: number): number {
  if (childrenUnder20 <= 0) return 0;
  if (childrenUnder20 === 1) return 150_000;
  if (childrenUnder20 === 2) return 350_000;
  return 350_000 + (childrenUnder20 - 2) * 300_000;
}

interface CalcResult {
  totalSalary: number;
  earnedIncomeDeduction: number;
  comprehensiveIncome: number;
  personalDeduction: number;
  cardDeduction: number;
  pensionDeduction: number;
  housingDeduction: number;
  totalIncomeDeduction: number;
  taxBase: number;
  calculatedTax: number;
  childCredit: number;
  pensionCredit: number;
  medicalCredit: number;
  educationCredit: number;
  donationCredit: number;
  rentCredit: number;
  totalTaxCredit: number;
  determinedTax: number;
  localTax: number;
  totalDeterminedTax: number;
  prepaidTax: number;
  refundOrOwed: number;
  isRefund: boolean;
}

export default function YearEndTaxCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("year-end-tax-calculator");
  const resultRef = useRef<HTMLDivElement>(null);

  // Input states
  const [totalSalary, setTotalSalary] = useState("");
  const [prepaidTax, setPrepaidTax] = useState("");
  const [dependents, setDependents] = useState("1");
  const [childrenUnder20, setChildrenUnder20] = useState("0");
  const [creditCard, setCreditCard] = useState("");
  const [debitCard, setDebitCard] = useState("");
  const [cashReceipt, setCashReceipt] = useState("");
  const [medical, setMedical] = useState("");
  const [education, setEducation] = useState("");
  const [donation, setDonation] = useState("");
  const [pensionSavings, setPensionSavings] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [housingSubscription, setHousingSubscription] = useState("");
  const [loanInterest, setLoanInterest] = useState("");

  const [result, setResult] = useState<CalcResult | null>(null);

  function calculate() {
    const salary = parseFloat(totalSalary) || 0;
    const prepaid = parseFloat(prepaidTax) || 0;
    if (salary <= 0) return;

    const deps = parseInt(dependents) || 1;
    const children = parseInt(childrenUnder20) || 0;
    const credit = parseFloat(creditCard) || 0;
    const debit = parseFloat(debitCard) || 0;
    const cash = parseFloat(cashReceipt) || 0;
    const med = parseFloat(medical) || 0;
    const edu = parseFloat(education) || 0;
    const don = parseFloat(donation) || 0;
    const pension = parseFloat(pensionSavings) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const housing = parseFloat(housingSubscription) || 0;
    const loanInt = parseFloat(loanInterest) || 0;

    // 1. 근로소득공제
    const earnedIncomeDeduction = calcEarnedIncomeDeduction(salary);
    const comprehensiveIncome = Math.max(0, salary - earnedIncomeDeduction);

    // 2. 인적공제 (기본공제 1인 150만원)
    const personalDeduction = deps * 1_500_000;

    // 3. 소득공제 항목
    const cardDeduction = calcCardDeduction(salary, credit, debit, cash);

    // 연금저축/IRP 소득공제 (총급여 1억 이하: 최대 400만원, 초과: 300만원)
    const pensionDeductionLimit = salary <= 100_000_000 ? 4_000_000 : 3_000_000;
    const pensionDeduction = Math.min(pension, pensionDeductionLimit);

    // 주택자금 공제 (청약저축 최대 240만원 + 대출이자 최대 1800만원)
    const housingDeduction = Math.min(housing, 2_400_000) + Math.min(loanInt, 18_000_000);

    const totalIncomeDeduction = personalDeduction + cardDeduction + pensionDeduction + housingDeduction;

    // 4. 과세표준
    const taxBase = Math.max(0, comprehensiveIncome - totalIncomeDeduction);

    // 5. 산출세액
    const calculatedTax = calcProgressiveTax(taxBase);

    // 6. 세액공제
    // 자녀 세액공제
    const childCredit = calcChildCredit(children);

    // 연금저축 세액공제 (총급여 5500만 이하: 15%, 초과: 12%)
    const pensionCreditRate = salary <= 55_000_000 ? 0.15 : 0.12;
    const pensionCreditBase = Math.min(pension, salary <= 100_000_000 ? 9_000_000 : 7_000_000);
    const pensionCredit = Math.round(pensionCreditBase * pensionCreditRate);

    // 의료비 세액공제 (총급여 3% 초과분의 15%, 한도 700만원)
    const medThreshold = salary * 0.03;
    const medicalCredit = Math.min(Math.max(0, med - medThreshold) * 0.15, 7_000_000);

    // 교육비 세액공제 (15%, 본인 한도 없음, 자녀 1인 300만원)
    const educationCredit = Math.round(edu * 0.15);

    // 기부금 세액공제 (1000만원 이하 15%, 초과 30%)
    const donationCredit = don <= 10_000_000
      ? Math.round(don * 0.15)
      : Math.round(10_000_000 * 0.15 + (don - 10_000_000) * 0.30);

    // 월세 세액공제 (총급여 7000만 이하: 17%, 5500만 이하: 15%) 최대 750만원
    let rentCredit = 0;
    if (salary <= 70_000_000 && rent > 0) {
      const rentRate = salary <= 55_000_000 ? 0.17 : 0.15;
      rentCredit = Math.min(Math.round(rent * rentRate), 7_500_000);
    }

    const totalTaxCredit = childCredit + pensionCredit + medicalCredit + educationCredit + donationCredit + rentCredit;

    // 7. 결정세액
    const determinedTax = Math.max(0, calculatedTax - totalTaxCredit);
    const localTax = Math.round(determinedTax * 0.1);
    const totalDeterminedTax = determinedTax + localTax;

    // 8. 환급/추납
    const refundOrOwed = prepaid - totalDeterminedTax;

    setResult({
      totalSalary: salary,
      earnedIncomeDeduction,
      comprehensiveIncome,
      personalDeduction,
      cardDeduction,
      pensionDeduction,
      housingDeduction,
      totalIncomeDeduction,
      taxBase,
      calculatedTax,
      childCredit,
      pensionCredit,
      medicalCredit,
      educationCredit,
      donationCredit,
      rentCredit,
      totalTaxCredit,
      determinedTax,
      localTax,
      totalDeterminedTax,
      prepaidTax: prepaid,
      refundOrOwed,
      isRefund: refundOrOwed >= 0,
    });
  }

  const fmt = (v: number) => v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  const title = isKo ? "연말정산 환급금 계산기" : "Year-End Tax Refund Calculator";
  const description = isKo
    ? "연말정산 예상 환급액을 미리 계산하세요. 신용카드, 의료비, 교육비, 연금저축 공제 반영. 2026년 세법 기준."
    : "Estimate your Korean year-end tax refund. Includes card, medical, education, and pension deductions. 2026 tax law.";

  const inputCls = "w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "text-sm font-medium block mb-2";
  const wonIcon = <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">&#8361;</span>;

  const faqItems = isKo
    ? [
        { q: "연말정산이란 무엇인가요?", a: "연말정산은 매달 원천징수된 소득세를 연간 소득·공제를 기반으로 다시 계산하여 차액을 환급받거나 추가 납부하는 절차입니다. 매년 1~2월에 진행되며 '13월의 월급'이라고도 합니다." },
        { q: "소득공제와 세액공제의 차이는?", a: "소득공제는 과세표준(세금을 매기는 기준 금액)을 줄여주고, 세액공제는 산출된 세금에서 직접 차감합니다. 소득이 높을수록 소득공제의 효과가 크고, 소득이 낮으면 세액공제가 유리합니다." },
        { q: "신용카드 공제 한도는 얼마인가요?", a: "총급여의 25%를 초과하는 사용분에 대해 공제합니다. 신용카드 15%, 체크카드/현금영수증 30% 공제율 적용. 총급여 7,000만원 이하 한도 300만원, 1.2억 이하 250만원, 초과 200만원." },
        { q: "연금저축 공제는 어떻게 받나요?", a: "연금저축 + IRP 합산 납입액에 대해 세액공제를 받습니다. 총급여 5,500만원 이하: 15%, 초과: 12%. 공제 대상 한도는 총급여 1억 이하: 900만원, 초과: 700만원." },
        { q: "환급을 더 받으려면 어떻게 해야 하나요?", a: "체크카드/현금영수증 사용 비율을 높이세요(공제율 2배). 연금저축/IRP를 한도까지 납입하세요. 의료비·교육비 영수증을 빠짐없이 등록하세요. 월세 세액공제(총급여 7,000만원 이하)를 확인하세요." },
      ]
    : [
        { q: "What is Korean year-end tax settlement?", a: "Year-end tax settlement (연말정산) recalculates your annual income tax based on actual income and deductions, compared to the tax withheld monthly. The difference is either refunded or collected. It happens every January-February." },
        { q: "What is the difference between income deduction and tax credit?", a: "Income deductions reduce your taxable base (before tax rate is applied). Tax credits directly reduce the calculated tax amount. Higher earners benefit more from income deductions, while lower earners benefit more from tax credits." },
        { q: "What are the card spending deduction limits?", a: "Spending above 25% of total salary qualifies. Credit cards get 15% deduction rate, debit cards and cash receipts get 30%. Limits: 3M KRW for salary ≤70M, 2.5M for ≤120M, 2M for above." },
        { q: "How does pension savings deduction work?", a: "Combined pension savings + IRP contributions receive tax credits: 15% for salary ≤55M, 12% above. Maximum eligible: 9M KRW for salary ≤100M, 7M for above." },
        { q: "How can I maximize my refund?", a: "Use debit cards and cash receipts more (2x deduction rate vs credit cards). Max out pension savings/IRP contributions. Register all medical and education receipts. Claim monthly rent credit if salary is under 70M KRW." },
      ];

  const toolUrl = `https://quickfigure.net/${lang}/tools/year-end-tax-calculator`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url: toolUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    description,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  function InputField({ label, value, onChange, placeholder, hint }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
  }) {
    return (
      <div>
        <label className={labelCls}>{label}</label>
        <div className="relative">
          {wonIcon}
          <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "0"} className={inputCls} />
        </div>
        {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="year-end-tax-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            {isKo ? "기본 정보" : "Basic Info"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label={isKo ? "총급여 (연봉)" : "Total Annual Salary"} value={totalSalary}
              onChange={setTotalSalary} placeholder="40000000" />
            <InputField label={isKo ? "기납부세액 (원천징수 소득세)" : "Prepaid Tax (Withheld)"} value={prepaidTax}
              onChange={setPrepaidTax} placeholder="2000000"
              hint={isKo ? "올해 원천징수된 소득세 합계 (지방소득세 별도)" : "Total income tax withheld this year"} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{isKo ? "부양가족 수 (본인 포함)" : "Dependents (incl. self)"}</label>
              <select value={dependents} onChange={(e) => setDependents(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n}{isKo ? "명" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{isKo ? "20세 이하 자녀 수" : "Children Under 20"}</label>
              <select value={childrenUnder20} onChange={(e) => setChildrenUnder20(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[0,1,2,3,4,5].map((n) => <option key={n} value={n}>{n}{isKo ? "명" : ""}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 카드/현금영수증 */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            {isKo ? "카드 / 현금영수증 사용액" : "Card / Cash Receipt Spending"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label={isKo ? "신용카드" : "Credit Card"} value={creditCard} onChange={setCreditCard}
              hint={isKo ? "공제율 15%" : "15% deduction rate"} />
            <InputField label={isKo ? "체크카드" : "Debit Card"} value={debitCard} onChange={setDebitCard}
              hint={isKo ? "공제율 30%" : "30% deduction rate"} />
            <InputField label={isKo ? "현금영수증" : "Cash Receipt"} value={cashReceipt} onChange={setCashReceipt}
              hint={isKo ? "공제율 30%" : "30% deduction rate"} />
          </div>
        </div>

        {/* 세액공제 항목 */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            {isKo ? "세액공제 항목" : "Tax Credit Items"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label={isKo ? "의료비 지출액" : "Medical Expenses"} value={medical} onChange={setMedical}
              hint={isKo ? "총급여 3% 초과분의 15% 공제" : "15% of amount exceeding 3% of salary"} />
            <InputField label={isKo ? "교육비 지출액" : "Education Expenses"} value={education} onChange={setEducation}
              hint={isKo ? "15% 세액공제" : "15% tax credit"} />
            <InputField label={isKo ? "기부금" : "Donations"} value={donation} onChange={setDonation}
              hint={isKo ? "1,000만원 이하 15%, 초과 30%" : "15% up to 10M, 30% above"} />
            <InputField label={isKo ? "연금저축/IRP 납입액" : "Pension Savings / IRP"} value={pensionSavings} onChange={setPensionSavings}
              hint={isKo ? "세액공제 12~15%, 한도 700~900만원" : "12-15% credit, limit 7-9M KRW"} />
          </div>
        </div>

        {/* 주택자금 */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
            {isKo ? "주택자금 공제" : "Housing Deductions"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label={isKo ? "월세 (연간)" : "Rent (Annual)"} value={monthlyRent} onChange={setMonthlyRent}
              hint={isKo ? "총급여 7,000만 이하 시 세액공제" : "Tax credit if salary ≤70M"} />
            <InputField label={isKo ? "주택청약 (연간)" : "Housing Sub. (Annual)"} value={housingSubscription} onChange={setHousingSubscription}
              hint={isKo ? "한도 240만원" : "Limit 2.4M KRW"} />
            <InputField label={isKo ? "대출이자 (연간)" : "Loan Interest (Annual)"} value={loanInterest} onChange={setLoanInterest}
              hint={isKo ? "한도 1,800만원" : "Limit 18M KRW"} />
          </div>
        </div>

        <button onClick={calculate}
          className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer text-lg">
          {isKo ? "환급액 계산하기" : "Calculate Refund"}
        </button>

        {/* Result */}
        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* Hero result */}
              <div className={`rounded-lg border-2 p-6 text-center ${
                result.isRefund
                  ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30"
                  : "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/30"
              }`}>
                <p className="text-sm text-neutral-500 mb-1">
                  {result.isRefund
                    ? (isKo ? "예상 환급액" : "Estimated Refund")
                    : (isKo ? "추가 납부 예상액" : "Additional Tax Owed")}
                </p>
                <p className={`text-4xl font-bold ${
                  result.isRefund ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {result.isRefund ? "+" : "-"}&#8361;{fmt(Math.abs(result.refundOrOwed))}
                </p>
                <p className="mt-2 text-xs text-neutral-400">
                  {isKo ? "(지방소득세 포함)" : "(Including local income tax)"}
                </p>
              </div>

              {/* Detail table */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      [isKo ? "총급여" : "Total Salary", `₩${fmt(result.totalSalary)}`, false],
                      [isKo ? "근로소득공제" : "Earned Income Deduction", `-₩${fmt(result.earnedIncomeDeduction)}`, false],
                      [isKo ? "종합소득금액" : "Comprehensive Income", `₩${fmt(result.comprehensiveIncome)}`, true],
                      [isKo ? "인적공제" : "Personal Deduction", `-₩${fmt(result.personalDeduction)}`, false],
                      [isKo ? "신용카드 등 공제" : "Card Deduction", `-₩${fmt(result.cardDeduction)}`, false],
                      [isKo ? "연금저축 소득공제" : "Pension Deduction", `-₩${fmt(result.pensionDeduction)}`, false],
                      [isKo ? "주택자금 공제" : "Housing Deduction", `-₩${fmt(result.housingDeduction)}`, false],
                      [isKo ? "과세표준" : "Tax Base", `₩${fmt(result.taxBase)}`, true],
                      [isKo ? "산출세액" : "Calculated Tax", `₩${fmt(result.calculatedTax)}`, true],
                      [isKo ? "자녀 세액공제" : "Child Credit", `-₩${fmt(result.childCredit)}`, false],
                      [isKo ? "연금저축 세액공제" : "Pension Credit", `-₩${fmt(result.pensionCredit)}`, false],
                      [isKo ? "의료비 세액공제" : "Medical Credit", `-₩${fmt(result.medicalCredit)}`, false],
                      [isKo ? "교육비 세액공제" : "Education Credit", `-₩${fmt(result.educationCredit)}`, false],
                      [isKo ? "기부금 세액공제" : "Donation Credit", `-₩${fmt(result.donationCredit)}`, false],
                      [isKo ? "월세 세액공제" : "Rent Credit", `-₩${fmt(result.rentCredit)}`, false],
                      [isKo ? "결정세액" : "Determined Tax", `₩${fmt(result.determinedTax)}`, true],
                      [isKo ? "지방소득세 (10%)" : "Local Tax (10%)", `₩${fmt(result.localTax)}`, false],
                      [isKo ? "총 결정세액" : "Total Determined Tax", `₩${fmt(result.totalDeterminedTax)}`, true],
                      [isKo ? "기납부세액" : "Prepaid Tax", `₩${fmt(result.prepaidTax)}`, false],
                    ].map(([label, value, bold], i) => (
                      <tr key={i} className={`border-b border-neutral-200 dark:border-neutral-700 ${bold ? "font-medium bg-neutral-50 dark:bg-neutral-800/50" : ""}`}>
                        <td className={`p-3 ${bold ? "" : "text-neutral-600 dark:text-neutral-400"}`}>{label as string}</td>
                        <td className="p-3 text-right">{value as string}</td>
                      </tr>
                    ))}
                    <tr className={`font-semibold ${result.isRefund ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}`}>
                      <td className="p-3">{result.isRefund ? (isKo ? "예상 환급액" : "Estimated Refund") : (isKo ? "추가 납부액" : "Additional Tax")}</td>
                      <td className={`p-3 text-right ${result.isRefund ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.isRefund ? "+" : "-"}₩{fmt(Math.abs(result.refundOrOwed))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tips */}
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
                <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                  {isKo ? "💡 더 공제받을 수 있는 팁" : "💡 Tips to Increase Your Refund"}
                </h3>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                  {(isKo ? [
                    "체크카드/현금영수증 비율을 높이면 공제율이 2배(15%→30%)입니다",
                    "연금저축/IRP를 한도까지 납입하면 세액공제를 극대화할 수 있습니다",
                    "안경/콘택트렌즈, 보청기 등도 의료비 공제 대상입니다",
                    "무주택 세대주라면 월세 세액공제를 꼭 확인하세요",
                    "기부금은 1,000만원 초과분이 30%로 공제율이 높아집니다",
                  ] : [
                    "Using debit cards/cash receipts doubles the deduction rate (15%→30%)",
                    "Max out pension savings/IRP contributions to maximize tax credits",
                    "Glasses, contact lenses, and hearing aids also qualify for medical deductions",
                    "If you're a non-homeowner household head, check the rent tax credit",
                    "Donations above 10M KRW get a higher 30% deduction rate",
                  ]).map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {isKo
                    ? "⚠️ 본 계산기는 참고용 예상 계산이며, 정확한 금액은 홈택스(hometax.go.kr)에서 확인하세요. 개인 상황에 따라 실제 환급액이 달라질 수 있습니다."
                    : "⚠️ This calculator provides estimates only. Please verify exact amounts on Hometax (hometax.go.kr). Actual refund may vary based on individual circumstances."}
                </p>
              </div>
            </div>
            <SaveResultImage targetRef={resultRef} toolName={title} slug="year-end-tax-calculator" labels={dict.saveImage} />
          </>
        )}
      </div>

      <ToolHowItWorks slug="year-end-tax-calculator" locale={locale} />
      <ToolDisclaimer slug="year-end-tax-calculator" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="year-end-tax-calculator" labels={dict.share} />
      <EmbedCodeButton slug="year-end-tax-calculator" lang={lang} labels={dict.embed} />

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo ? [
            "총급여(연봉)와 기납부세액(원천징수 소득세)을 입력하세요.",
            "부양가족 수와 20세 이하 자녀 수를 선택하세요.",
            "신용카드, 체크카드, 현금영수증 연간 사용액을 입력하세요.",
            "의료비, 교육비, 기부금, 연금저축/IRP 납입액을 입력하세요.",
            "주택자금(월세, 청약, 대출이자) 연간 금액을 입력하세요.",
            "환급액 계산하기 버튼을 클릭하여 결과를 확인하세요.",
          ] : [
            "Enter your total annual salary and prepaid tax (withheld income tax).",
            "Select the number of dependents and children under 20.",
            "Enter annual spending on credit cards, debit cards, and cash receipts.",
            "Enter medical, education, donation, and pension savings/IRP amounts.",
            "Enter housing-related amounts (rent, housing subscription, loan interest).",
            "Click Calculate Refund to see your estimated result.",
          ]).map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "자주 묻는 질문" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium flex items-center justify-between">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "관련 도구" : "Related Tools"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/${lang}/tools/salary-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {isKo ? "연봉 실수령액 계산기" : "Salary Calculator"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isKo ? "4대보험과 소득세 공제 후 실수령액 계산" : "Calculate take-home pay after taxes"}
            </p>
          </Link>
          <Link href={`/${lang}/tools/income-tax-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {isKo ? "종합소득세 계산기" : "Income Tax Calculator"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isKo ? "종합소득세 구간별 세율 확인" : "Check income tax brackets and rates"}
            </p>
          </Link>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
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
