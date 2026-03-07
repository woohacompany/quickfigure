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

export default function EmbedTool({ tool, lang }: { tool: string; lang: Locale }) {
  switch (tool) {
    case "bmi-calculator":
      return <EmbedBmiCalculator lang={lang} />;
    case "age-calculator":
      return <EmbedAgeCalculator lang={lang} />;
    case "compound-interest-calculator":
      return <EmbedCompoundInterestCalculator lang={lang} />;
    default:
      return null;
  }
}
