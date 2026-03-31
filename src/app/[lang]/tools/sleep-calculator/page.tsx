"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface SleepResult {
  time: string;
  cycles: number;
  duration: string;
  recommended: boolean;
}

function formatTime(hours: number, minutes: number): string {
  const h = ((hours % 24) + 24) % 24;
  const m = ((minutes % 60) + 60) % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatTime24(hours: number, minutes: number): string {
  const h = ((hours % 24) + 24) % 24;
  const m = ((minutes % 60) + 60) % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function SleepCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.sleepCalc;
  const relatedPosts = getPostsByTool("sleep-calculator");

  const [mode, setMode] = useState<"wakeup" | "bedtime">("wakeup");
  const [time, setTime] = useState("07:00");
  const [results, setResults] = useState<SleepResult[] | null>(null);

  const FALL_ASLEEP_MIN = 15;
  const CYCLE_MIN = 90;

  function calculate() {
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    const newResults: SleepResult[] = [];

    if (mode === "wakeup") {
      // Calculate bedtimes for 6, 5, 4 cycles
      for (const cycles of [6, 5, 4]) {
        const totalMin = cycles * CYCLE_MIN + FALL_ASLEEP_MIN;
        let bedH = h;
        let bedM = m - totalMin;
        while (bedM < 0) {
          bedM += 60;
          bedH -= 1;
        }
        bedH = ((bedH % 24) + 24) % 24;
        const durationH = Math.floor((cycles * CYCLE_MIN) / 60);
        const durationM = (cycles * CYCLE_MIN) % 60;
        const durationStr =
          durationM > 0
            ? `${durationH}h ${durationM}m`
            : `${durationH}h`;
        const fmtTime =
          locale === "ko"
            ? formatTime24(bedH, bedM)
            : formatTime(bedH, bedM);
        newResults.push({
          time: fmtTime,
          cycles,
          duration: durationStr,
          recommended: cycles >= 5,
        });
      }
    } else {
      // Calculate wake times for 4, 5, 6 cycles
      for (const cycles of [4, 5, 6]) {
        const totalMin = cycles * CYCLE_MIN + FALL_ASLEEP_MIN;
        let wakeH = h;
        let wakeM = m + totalMin;
        while (wakeM >= 60) {
          wakeM -= 60;
          wakeH += 1;
        }
        wakeH = ((wakeH % 24) + 24) % 24;
        const durationH = Math.floor((cycles * CYCLE_MIN) / 60);
        const durationM = (cycles * CYCLE_MIN) % 60;
        const durationStr =
          durationM > 0
            ? `${durationH}h ${durationM}m`
            : `${durationH}h`;
        const fmtTime =
          locale === "ko"
            ? formatTime24(wakeH, wakeM)
            : formatTime(wakeH, wakeM);
        newResults.push({
          time: fmtTime,
          cycles,
          duration: durationStr,
          recommended: cycles >= 5,
        });
      }
    }

    setResults(newResults);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>

        <ToolAbout slug="sleep-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Mode selector */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode("wakeup");
              setResults(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "wakeup"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.modeWakeup}
          </button>
          <button
            onClick={() => {
              setMode("bedtime");
              setResults(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === "bedtime"
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {t.modeBedtime}
          </button>
        </div>

        {/* Time input */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.time}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Calculate button */}
        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {/* Results */}
        {results && (
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-medium">
              {mode === "wakeup" ? t.suggestedBedtimes : t.suggestedWaketimes}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 ${
                    r.recommended
                      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30"
                      : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  }`}
                >
                  <p className="text-2xl font-semibold tracking-tight">
                    {r.time}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {r.cycles} {t.cycles} · {r.duration}
                  </p>
                  {r.recommended && (
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300">
                      {t.recommended}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
              {t.fallAsleepNote}
            </p>
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

      {/* JSON-LD */}
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
            href={`/${lang}/tools/calorie-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.calorieCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.calorieCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/bmi-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.bmiCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.bmiCalcDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="sleep-calculator" locale={locale} />
      <ToolDisclaimer slug="sleep-calculator" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="sleep-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="sleep-calculator"
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
