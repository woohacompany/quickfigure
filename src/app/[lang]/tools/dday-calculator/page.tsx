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

export default function DdayCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.ddayCalc;
  const relatedPosts = getPostsByTool("dday-calculator");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    daysDiff: number;
    isPast: boolean;
    milestones: { days: number; date: string }[];
  } | null>(null);

  function formatDate(date: Date): string {
    return date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  function addDays(base: Date, days: number): Date {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d;
  }

  function calculate() {
    if (!startDate || !targetDate) return;

    const start = new Date(startDate + "T00:00:00");
    const target = new Date(targetDate + "T00:00:00");
    const diffTime = target.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isPast = diffDays < 0;

    const milestoneDays = [100, 200, 300, 365, 500, 1000];
    const milestones = milestoneDays.map((days) => ({
      days,
      date: formatDate(addDays(start, days)),
    }));

    setResult({
      daysDiff: Math.abs(diffDays),
      isPast,
      milestones,
    });
  }

  function applyPreset(preset: "suneung" | "christmas" | "newyear") {
    const now = new Date();
    let target: Date;

    if (preset === "suneung") {
      // 수능: 2026-11-19 (annually mid-November Thursday)
      target = new Date(2026, 10, 19);
      if (now > target) {
        target = new Date(2027, 10, 18);
      }
    } else if (preset === "christmas") {
      target = new Date(now.getFullYear(), 11, 25);
      if (now > target) {
        target = new Date(now.getFullYear() + 1, 11, 25);
      }
    } else {
      // newyear
      target = new Date(now.getFullYear() + 1, 0, 1);
    }

    const tStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;
    setStartDate(todayStr);
    setTargetDate(tStr);
    setResult(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>

        <ToolAbout slug="dday-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Quick presets */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.presets}
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => applyPreset("suneung")}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {locale === "ko" ? "수능" : "CSAT Exam"}
            </button>
            <button
              onClick={() => applyPreset("christmas")}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {t.presetChristmas}
            </button>
            <button
              onClick={() => applyPreset("newyear")}
              className="px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {t.presetNewYear}
            </button>
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.startDate}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Target date */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.targetDate}
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              {/* D-Day result */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 text-center">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  {result.isPast ? t.daysPassed : t.daysRemaining}
                </p>
                <p className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {result.isPast ? `D+${result.daysDiff}` : result.daysDiff === 0 ? "D-Day" : `D-${result.daysDiff}`}
                </p>
              </div>

              {/* Milestones table */}
              <div>
                <h3 className="text-sm font-medium mb-2">{t.milestones}</h3>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                        <th className="p-3 text-left text-neutral-600 dark:text-neutral-400 font-medium">
                          {t.milestoneDays}
                        </th>
                        <th className="p-3 text-right text-neutral-600 dark:text-neutral-400 font-medium">
                          {t.milestoneDate}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.milestones.map((m, i) => (
                        <tr
                          key={m.days}
                          className={
                            i < result.milestones.length - 1
                              ? "border-b border-neutral-200 dark:border-neutral-700"
                              : ""
                          }
                        >
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {m.days}{locale === "ko" ? "일" : " days"}
                          </td>
                          <td className="p-3 text-right">{m.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={t.title}
              slug="dday-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

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

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Link
            href={`/${lang}/tools/percentage-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.percentageCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.percentageCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="dday-calculator" locale={locale} />
      <ToolDisclaimer slug="dday-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="dday-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="dday-calculator"
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
