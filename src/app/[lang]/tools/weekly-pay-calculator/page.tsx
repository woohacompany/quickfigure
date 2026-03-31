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

const MINIMUM_WAGE_2026 = 10030;

function formatKRW(v: number): string {
  if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억원`;
  if (v >= 10000) return `${Math.round(v / 10000).toLocaleString()}만원`;
  return `${Math.round(v).toLocaleString()}원`;
}

export default function WeeklyPayCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.weeklyPayCalc;
  const relatedPosts = getPostsByTool("weekly-pay-calculator");

  const [hourlyWage, setHourlyWage] = useState("");
  const [dailyHours, setDailyHours] = useState("");
  const [weeklyDays, setWeeklyDays] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [nightHours, setNightHours] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    basePay: number;
    weeklyHolidayPay: number;
    overtimePay: number;
    nightPay: number;
    totalWeeklyPay: number;
    monthlyEstimate: number;
    hasWeeklyHoliday: boolean;
    isBelowMinimum: boolean;
  } | null>(null);

  function calculate() {
    const wage = parseFloat(hourlyWage) || 0;
    const dHours = parseFloat(dailyHours) || 0;
    const wDays = parseFloat(weeklyDays) || 0;
    const otHours = parseFloat(overtimeHours) || 0;
    const ntHours = parseFloat(nightHours) || 0;

    if (wage <= 0 || dHours <= 0 || wDays <= 0) return;

    const weeklyHours = dHours * wDays;
    const basePay = wage * weeklyHours;

    // Weekly holiday allowance: eligible if 15+ hrs/week
    const hasWeeklyHoliday = weeklyHours >= 15;
    const weeklyHolidayPay = hasWeeklyHoliday
      ? wage * Math.min(weeklyHours / 40, 1) * 8
      : 0;

    // Overtime pay: 1.5x
    const overtimePay = otHours * wage * 1.5;

    // Night shift pay: additional 0.5x (total 1.5x, but base already counted in basePay if overlapping)
    // For simplicity, treat night hours as additional pay at 1.5x rate
    const nightPay = ntHours * wage * 0.5;

    const totalWeeklyPay = basePay + weeklyHolidayPay + overtimePay + nightPay;
    const monthlyEstimate = totalWeeklyPay * 4.345;

    const isBelowMinimum = wage < MINIMUM_WAGE_2026;

    setResult({
      basePay,
      weeklyHolidayPay,
      overtimePay,
      nightPay,
      totalWeeklyPay,
      monthlyEstimate,
      hasWeeklyHoliday,
      isBelowMinimum,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="weekly-pay-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Hourly Wage */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.hourlyWage}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">₩</span>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              placeholder="10,030"
              className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {hourlyWage && parseFloat(hourlyWage) > 0 && parseFloat(hourlyWage) < MINIMUM_WAGE_2026 && (
            <p className="text-sm text-red-500 mt-1">{t.minimumWageWarning}</p>
          )}
        </div>

        {/* Daily Hours + Weekly Days */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t.dailyHours}</label>
            <input
              type="number"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              placeholder="8"
              min="0"
              max="24"
              step="0.5"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">{t.weeklyDays}</label>
            <input
              type="number"
              value={weeklyDays}
              onChange={(e) => setWeeklyDays(e.target.value)}
              placeholder="5"
              min="0"
              max="7"
              step="1"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Overtime + Night hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">{t.overtimeHours}</label>
            <input
              type="number"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">{t.nightHours}</label>
            <input
              type="number"
              value={nightHours}
              onChange={(e) => setNightHours(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <>
            {result.isBelowMinimum && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  {t.minimumWageWarning}
                </p>
              </div>
            )}

            <div ref={resultRef} className="space-y-3 mt-4">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">{Math.round(result.totalWeeklyPay).toLocaleString()}원</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{formatKRW(result.totalWeeklyPay)}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.totalWeeklyPay}</p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">{Math.round(result.monthlyEstimate).toLocaleString()}원</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{formatKRW(result.monthlyEstimate)}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.monthlyEstimate}</p>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{t.basePay}</td>
                      <td className="px-4 py-3 text-right font-medium">{Math.round(result.basePay).toLocaleString()}원</td>
                    </tr>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800">
                      <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                        {t.weeklyHolidayPay}
                        <span className="block text-xs text-neutral-400 mt-0.5">
                          {result.hasWeeklyHoliday ? t.weeklyHolidayNote : t.noWeeklyHoliday}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{Math.round(result.weeklyHolidayPay).toLocaleString()}원</td>
                    </tr>
                    {result.overtimePay > 0 && (
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{t.overtimePay}</td>
                        <td className="px-4 py-3 text-right font-medium">{Math.round(result.overtimePay).toLocaleString()}원</td>
                      </tr>
                    )}
                    {result.nightPay > 0 && (
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{t.nightPay}</td>
                        <td className="px-4 py-3 text-right font-medium">{Math.round(result.nightPay).toLocaleString()}원</td>
                      </tr>
                    )}
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="px-4 py-3 font-semibold">{t.totalWeeklyPay}</td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{Math.round(result.totalWeeklyPay).toLocaleString()}원</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-neutral-400 mt-2">{t.disclaimer}</p>
            </div>

            <SaveResultImage targetRef={resultRef} toolName={t.title} slug="weekly-pay-calculator" labels={dict.saveImage} />
          </>
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
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD */}
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

      {/* WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: t.title,
            description: t.description,
            url: `https://quickfigure.net/${locale}/tools/weekly-pay-calculator`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/hourly-wage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.hourlyWageCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.hourlyWageCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/weekly-holiday-pay-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.weeklyHolidayPayCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.weeklyHolidayPayCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/salary-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.salaryCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.salaryCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="weekly-pay-calculator" locale={locale} />
      <ToolDisclaimer slug="weekly-pay-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="weekly-pay-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="weekly-pay-calculator"
        lang={lang}
        labels={dict.embed}
      />

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
