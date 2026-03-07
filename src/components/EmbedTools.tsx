"use client";

import { useState } from "react";
import type { Locale } from "@/lib/dictionaries";
import { getDictionary } from "@/lib/dictionaries";

function EmbedBmiCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).bmi;
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<{ bmi: number; categoryKey: string } | null>(null);

  function calculate() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const categoryKey = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese";
    setResult({ bmi, categoryKey });
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">{t.height}</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.weight}</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="flex items-center gap-4 p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
          <div>
            <p className="text-2xl font-semibold">{result.bmi.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">{t.yourBmi}</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{t[result.categoryKey as keyof typeof t]}</p>
            <p className="text-xs text-neutral-500">{t.category}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmbedAgeCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).ageCalc;
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{ years: number; months: number; days: number } | null>(null);

  function calculate() {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birth >= today) return;

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }
    setResult({ years, months, days });
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div>
        <label className="text-xs font-medium block mb-1">{t.birthDate}</label>
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
          className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
          <p className="text-xs text-neutral-500 mb-1">{t.yourAge}</p>
          <p className="text-2xl font-bold">
            {result.years} {t.years}, {result.months} {t.months}, {result.days} {t.days}
          </p>
        </div>
      )}
    </div>
  );
}

function EmbedCompoundInterestCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).compoundInterest;
  const currencySymbol = lang === "ko" ? "\u20A9" : "$";
  const [principal, setPrincipal] = useState("");
  const [monthly, setMonthly] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{ futureValue: number; totalInterest: number } | null>(null);

  function calculate() {
    const P = parseFloat(principal) || 0;
    const PMT = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseFloat(years) || 0;
    if (r === 0) {
      const fv = P + PMT * y * 12;
      setResult({ futureValue: fv, totalInterest: 0 });
      return;
    }
    const rn = r / 12;
    const nt = 12 * y;
    const cf = Math.pow(1 + rn, nt);
    const fv = P * cf + PMT * ((cf - 1) / rn);
    const deposited = P + PMT * y * 12;
    setResult({ futureValue: fv, totalInterest: fv - deposited });
  }

  const fmt = (v: number) => {
    if (lang === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">{t.principal}</label>
          <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder={lang === "ko" ? "10000000" : "10000"}
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.monthlyContribution}</label>
          <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder={lang === "ko" ? "500000" : "500"}
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.rate}</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="7" step="0.1"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.years}</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="20"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.futureValue)}</p>
            <p className="text-xs text-neutral-500">{t.result}</p>
          </div>
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.totalInterest)}</p>
            <p className="text-xs text-neutral-500">{t.totalInterest}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmbedFreelancerTaxCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).freelancerTax;
  const currencySymbol = lang === "ko" ? "\u20A9" : "$";
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [result, setResult] = useState<{ tax: number; net: number } | null>(null);

  function calculate() {
    const gross = parseFloat(income) || 0;
    const exp = parseFloat(expenses) || 0;
    if (gross <= 0) return;
    if (lang === "ko") {
      const tax = gross * 0.033;
      setResult({ tax, net: gross - tax });
    } else {
      const net = gross - exp;
      const seTax = net * 0.153;
      setResult({ tax: seTax, net: gross - exp - seTax });
    }
  }

  const fmt = (v: number) => {
    if (lang === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">{t.grossIncome}</label>
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder={lang === "ko" ? "30000000" : "50000"}
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.expenses}</label>
          <input type="number" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder={lang === "ko" ? "5000000" : "10000"}
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.tax)}</p>
            <p className="text-xs text-neutral-500">{t.withholdingTax}</p>
          </div>
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.net)}</p>
            <p className="text-xs text-neutral-500">{t.netIncome}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmbedPercentageCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).percentageCalc;
  const [pct, setPct] = useState("");
  const [val, setVal] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const p = parseFloat(pct);
    const v = parseFloat(val);
    if (isNaN(p) || isNaN(v)) return;
    setResult(((p / 100) * v).toLocaleString(undefined, { maximumFractionDigits: 4 }));
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        <input type="number" value={pct} onChange={(e) => setPct(e.target.value)} placeholder="25"
          className="w-20 p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-sm text-neutral-500">% {t.of}</span>
        <input type="number" value={val} onChange={(e) => setVal(e.target.value)} placeholder="200"
          className="w-24 p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={calculate}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
          =
        </button>
        {result !== null && <span className="text-xl font-bold">{result}</span>}
      </div>
    </div>
  );
}

function EmbedUnitConverter({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).unitConverter;
  const [fromVal, setFromVal] = useState("");
  const [result, setResult] = useState("");

  function convert(val: string) {
    setFromVal(val);
    const v = parseFloat(val);
    if (isNaN(v)) { setResult(""); return; }
    // Default: km to mi
    setResult((v / 1.609344).toLocaleString(undefined, { maximumFractionDigits: 4 }));
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">{t.units.km}</label>
          <input type="number" value={fromVal} onChange={(e) => convert(e.target.value)} placeholder="100"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.units.mi}</label>
          <div className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-sm min-h-[40px] font-semibold">
            {result || "0"}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmbedLoanCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).loanCalc;
  const currencySymbol = lang === "ko" ? "\u20A9" : "$";
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<{ monthly: number; totalInterest: number } | null>(null);

  function calculate() {
    const P = parseFloat(amount) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;
    if (P <= 0 || r <= 0 || n <= 0) return;
    const monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setResult({ monthly, totalInterest: monthly * n - P });
  }

  const fmt = (v: number) => {
    if (lang === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium block mb-1">{t.loanAmount}</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={lang === "ko" ? "100000000" : "250000"}
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.interestRate}</label>
          <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="5.5" step="0.1"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.loanTerm}</label>
          <input type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="30"
            className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.monthly)}</p>
            <p className="text-xs text-neutral-500">{t.monthlyPayment}</p>
          </div>
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-xl font-semibold">{fmt(result.totalInterest)}</p>
            <p className="text-xs text-neutral-500">{t.totalInterest}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmbedSalaryCalculator({ lang }: { lang: Locale }) {
  const t = getDictionary(lang).salaryCalc;
  const currencySymbol = lang === "ko" ? "\u20A9" : "$";
  const [salary, setSalary] = useState("");
  const [result, setResult] = useState<{ gross: number; deductions: number; net: number } | null>(null);

  function calculate() {
    const annual = parseFloat(salary) || 0;
    if (annual <= 0) return;
    if (lang === "ko") {
      const monthly = annual / 12;
      const insurance = monthly * (0.045 + 0.03545 + 0.03545 * 0.1295 + 0.009);
      const taxBase = Math.max(annual - annual * 0.15 - 1500000, 0);
      let tax = 0;
      if (taxBase <= 14000000) tax = taxBase * 0.06;
      else if (taxBase <= 50000000) tax = 840000 + (taxBase - 14000000) * 0.15;
      else tax = 6240000 + (taxBase - 50000000) * 0.24;
      const monthlyTax = tax / 12 * 1.1;
      const deductions = insurance + monthlyTax;
      setResult({ gross: monthly, deductions, net: monthly - deductions });
    } else {
      const monthly = annual / 12;
      const fica = (Math.min(annual, 168600) * 0.062 + annual * 0.0145) / 12;
      const taxable = Math.max(annual - 14600, 0);
      let fed = 0;
      if (taxable <= 11600) fed = taxable * 0.10;
      else if (taxable <= 47150) fed = 1160 + (taxable - 11600) * 0.12;
      else fed = 5426 + (taxable - 47150) * 0.22;
      const monthlyFed = fed / 12;
      const deductions = fica + monthlyFed;
      setResult({ gross: monthly, deductions, net: monthly - deductions });
    }
  }

  const fmt = (v: number) => {
    if (lang === "ko") return currencySymbol + Math.round(v).toLocaleString();
    return currencySymbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      <h3 className="font-semibold text-lg">{t.title}</h3>
      <div>
        <label className="text-xs font-medium block mb-1">{t.annualSalary}</label>
        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder={lang === "ko" ? "50000000" : "75000"}
          className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={calculate}
        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
        {t.calculate}
      </button>
      {result && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-lg font-semibold">{fmt(result.gross)}</p>
            <p className="text-xs text-neutral-500">{t.grossMonthly}</p>
          </div>
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">-{fmt(result.deductions)}</p>
            <p className="text-xs text-neutral-500">{t.totalDeductions}</p>
          </div>
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{fmt(result.net)}</p>
            <p className="text-xs text-neutral-500">{t.netMonthly}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmbedTool({ tool, lang }: { tool: string; lang: Locale }) {
  switch (tool) {
    case "bmi-calculator":
      return <EmbedBmiCalculator lang={lang} />;
    case "age-calculator":
      return <EmbedAgeCalculator lang={lang} />;
    case "compound-interest-calculator":
      return <EmbedCompoundInterestCalculator lang={lang} />;
    case "freelancer-tax-calculator":
      return <EmbedFreelancerTaxCalculator lang={lang} />;
    case "salary-calculator":
      return <EmbedSalaryCalculator lang={lang} />;
    case "loan-calculator":
      return <EmbedLoanCalculator lang={lang} />;
    case "unit-converter":
      return <EmbedUnitConverter lang={lang} />;
    case "percentage-calculator":
      return <EmbedPercentageCalculator lang={lang} />;
    default:
      return null;
  }
}
