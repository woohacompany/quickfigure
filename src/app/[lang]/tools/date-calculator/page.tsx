"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

type Mode = "diff" | "add" | "business";

interface DiffResult {
  totalDays: number;
  weeks: number;
  remainingDaysAfterWeeks: number;
  totalMonths: number;
  remainingDaysAfterMonths: number;
  years: number;
  monthsAfterYears: number;
  daysAfterYearsMonths: number;
}

interface AddResult {
  resultDate: string;
}

interface BusinessResult {
  businessDays: number;
  weekendDays: number;
  totalCalendarDays: number;
}

export default function DateCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.dateCalc;
  const relatedPosts = getPostsByTool("date-calculator");

  const [mode, setMode] = useState<Mode>("diff");

  // Mode 1: Date Difference
  const [diffDate1, setDiffDate1] = useState("");
  const [diffDate2, setDiffDate2] = useState("");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  // Mode 2: Add/Subtract Days
  const [addDate, setAddDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState("");
  const [addOrSubtract, setAddOrSubtract] = useState<"add" | "subtract">("add");
  const [addResult, setAddResult] = useState<AddResult | null>(null);

  // Mode 3: Business Days
  const [bizDate1, setBizDate1] = useState("");
  const [bizDate2, setBizDate2] = useState("");
  const [bizResult, setBizResult] = useState<BusinessResult | null>(null);

  function formatDateDisplay(date: Date): string {
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  function calculateDiff() {
    if (!diffDate1 || !diffDate2) return;

    const d1 = new Date(diffDate1 + "T00:00:00");
    const d2 = new Date(diffDate2 + "T00:00:00");

    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;

    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const weeks = Math.floor(totalDays / 7);
    const remainingDaysAfterWeeks = totalDays % 7;

    // Calculate months + days
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    const remainingDaysAfterMonths = days;

    setDiffResult({
      totalDays,
      weeks,
      remainingDaysAfterWeeks,
      totalMonths,
      remainingDaysAfterMonths,
      years,
      monthsAfterYears: months,
      daysAfterYearsMonths: days,
    });
  }

  function calculateAdd() {
    if (!addDate || !daysToAdd) return;

    const d = new Date(addDate + "T00:00:00");
    const n = parseInt(daysToAdd);
    if (isNaN(n)) return;

    const offset = addOrSubtract === "add" ? n : -n;
    d.setDate(d.getDate() + offset);

    setAddResult({
      resultDate: formatDateDisplay(d),
    });
  }

  function calculateBusiness() {
    if (!bizDate1 || !bizDate2) return;

    const d1 = new Date(bizDate1 + "T00:00:00");
    const d2 = new Date(bizDate2 + "T00:00:00");

    const start = d1 < d2 ? d1 : d2;
    const end = d1 < d2 ? d2 : d1;

    const diffTime = end.getTime() - start.getTime();
    const totalCalendarDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let businessDays = 0;
    let weekendDays = 0;

    const current = new Date(start);
    while (current < end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    setBizResult({
      businessDays,
      weekendDays,
      totalCalendarDays,
    });
  }

  function handleCalculate() {
    if (mode === "diff") calculateDiff();
    else if (mode === "add") calculateAdd();
    else calculateBusiness();
  }

  const modes: { key: Mode; label: string }[] = [
    { key: "diff", label: t.modeDiff },
    { key: "add", label: t.modeAdd },
    { key: "business", label: t.modeBusiness },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>

        <ToolAbout slug="date-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Mode Selector */}
        <div className="flex gap-2 flex-wrap">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                mode === m.key
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode 1: Date Difference */}
        {mode === "diff" && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.startDate}
              </label>
              <input
                type="date"
                value={diffDate1}
                onChange={(e) => setDiffDate1(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.endDate}
              </label>
              <input
                type="date"
                value={diffDate2}
                onChange={(e) => setDiffDate2(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Mode 2: Add/Subtract Days */}
        {mode === "add" && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.baseDate}
              </label>
              <input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.daysToAdd}
              </label>
              <input
                type="number"
                min="0"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(e.target.value)}
                placeholder="30"
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAddOrSubtract("add")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  addOrSubtract === "add"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {t.add}
              </button>
              <button
                onClick={() => setAddOrSubtract("subtract")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  addOrSubtract === "subtract"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {t.subtract}
              </button>
            </div>
          </>
        )}

        {/* Mode 3: Business Days */}
        {mode === "business" && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.startDate}
              </label>
              <input
                type="date"
                value={bizDate1}
                onChange={(e) => setBizDate1(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {t.endDate}
              </label>
              <input
                type="date"
                value={bizDate2}
                onChange={(e) => setBizDate2(e.target.value)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {/* Results: Date Difference */}
        {mode === "diff" && diffResult && (
          <div className="space-y-4 mt-4">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 text-center">
              <p className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {diffResult.totalDays.toLocaleString()} {t.totalDays}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {t.totalDays}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {diffResult.weeks} {t.totalWeeks} {diffResult.remainingDaysAfterWeeks} {t.totalDays}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {t.weeksAndDays}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {diffResult.totalMonths} {t.totalMonths} {diffResult.remainingDaysAfterMonths} {t.totalDays}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {t.totalMonths}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {diffResult.years} {t.totalYears} {diffResult.monthsAfterYears} {t.totalMonths} {diffResult.daysAfterYearsMonths} {t.totalDays}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {t.totalYears}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results: Add/Subtract */}
        {mode === "add" && addResult && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 text-center mt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
              {t.resultDate}
            </p>
            <p className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {addResult.resultDate}
            </p>
          </div>
        )}

        {/* Results: Business Days */}
        {mode === "business" && bizResult && (
          <div className="space-y-4 mt-4">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 text-center">
              <p className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {bizResult.businessDays.toLocaleString()} {t.businessDays}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {t.businessDays}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {bizResult.weekendDays.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {t.weekendDays}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {bizResult.totalCalendarDays.toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {t.calendarDays}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
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
            mainEntity: t.faqItems.map((item: { q: string; a: string }) => ({
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
            href={`/${lang}/tools/dday-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.ddayCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.ddayCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/age-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.ageCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.ageCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="date-calculator" locale={locale} />
      <ToolDisclaimer slug="date-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="date-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="date-calculator"
        lang={lang}
        labels={dict.embed}
      />

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
