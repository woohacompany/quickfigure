"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
    </div>
  );
}

export default function AgeCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.ageCalc;
  const relatedPosts = getPostsByTool("age-calculator");

  const currentYear = new Date().getFullYear();

  // Quick calculator state
  const [quickInput, setQuickInput] = useState("");
  const [quickResult, setQuickResult] = useState<{
    birthYear: number;
    internationalAge: string;
    koreanAge: number;
  } | null>(null);

  // Precise calculator state
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    koreanAge: number;
    daysUntilNext: number;
    totalDays: number;
    totalWeeks: number;
    totalMonths: number;
  } | null>(null);

  function parseQuickYear(input: string): number | null {
    const num = parseInt(input);
    if (isNaN(num)) return null;
    if (num >= 1900 && num <= currentYear) return num;
    if (num >= 0 && num <= 99) {
      const fullYear = num <= (currentYear % 100) ? 2000 + num : 1900 + num;
      return fullYear;
    }
    return null;
  }

  function handleQuickInput(val: string) {
    setQuickInput(val);
    const year = parseQuickYear(val);
    if (!year) {
      setQuickResult(null);
      return;
    }
    const ageMin = currentYear - year - 1;
    const ageMax = currentYear - year;
    const koreanAge = currentYear - year + 1;
    setQuickResult({
      birthYear: year,
      internationalAge: ageMin >= 0 ? `${ageMin}~${ageMax}` : `${ageMax}`,
      koreanAge,
    });
  }

  function handleQuickButton(year: number) {
    setQuickInput(String(year));
    const ageMin = currentYear - year - 1;
    const ageMax = currentYear - year;
    const koreanAge = currentYear - year + 1;
    setQuickResult({
      birthYear: year,
      internationalAge: ageMin >= 0 ? `${ageMin}~${ageMax}` : `${ageMax}`,
      koreanAge,
    });
  }

  function calculatePrecise() {
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

    if (months < 0) {
      years--;
      months += 12;
    }

    const koreanAge = today.getFullYear() - birth.getFullYear() + 1;

    const diffMs = today.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= today) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilNext = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setResult({ years, months, days, koreanAge, daysUntilNext, totalDays, totalWeeks, totalMonths });
  }

  const quickYears = [2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      {/* Quick Age Calculator */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <h2 className="text-lg font-semibold">{t.quickTitle}</h2>
        <div>
          <label className="text-sm font-medium block mb-2">{t.birthYear}</label>
          <input
            type="number"
            value={quickInput}
            onChange={(e) => handleQuickInput(e.target.value)}
            placeholder={locale === "ko" ? "출생연도 입력 (예: 73 또는 1973)" : "Enter birth year (e.g. 73 or 1973)"}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {quickResult && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              {locale === "ko"
                ? `${quickResult.birthYear}년생`
                : `Born in ${quickResult.birthYear}`}
            </p>
            <p className="text-3xl font-bold tracking-tight mt-2">
              {locale === "ko"
                ? `만 ${quickResult.internationalAge}세`
                : `Age ${quickResult.internationalAge}`}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {locale === "ko"
                ? `한국 나이: ${quickResult.koreanAge}세`
                : `Korean age: ${quickResult.koreanAge}`}
            </p>
          </div>
        )}

        {/* Quick Year Buttons */}
        <div>
          <p className="text-sm font-medium mb-2 text-neutral-500 dark:text-neutral-400">{t.popularYears}</p>
          <div className="flex flex-wrap gap-2">
            {quickYears.map((year) => (
              <button
                key={year}
                onClick={() => handleQuickButton(year)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  quickResult?.birthYear === year
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Precise Age Calculator */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5 mt-6">
        <h2 className="text-lg font-semibold">{t.preciseTitle}</h2>
        <div>
          <label className="text-sm font-medium block mb-2">{t.birthDate}</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculatePrecise}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{t.yourAge}</p>
              <p className="text-3xl font-bold tracking-tight">
                {result.years} {t.years}, {result.months} {t.months}, {result.days} {t.days}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                {locale === "ko"
                  ? `한국 나이: ${result.koreanAge}세`
                  : `Korean age: ${result.koreanAge}`}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 p-4">
              <p className="text-lg font-semibold">{result.daysUntilNext} {t.daysUntil}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.nextBirthday}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label={t.totalDays} value={result.totalDays.toLocaleString()} />
              <StatCard label={t.totalWeeks} value={result.totalWeeks.toLocaleString()} />
              <StatCard label={t.totalMonths} value={result.totalMonths.toLocaleString()} />
            </div>
          </div>
        )}
      </div>

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
