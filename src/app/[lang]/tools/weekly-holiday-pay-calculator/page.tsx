"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

export default function WeeklyHolidayPayCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("weekly-holiday-pay-calculator");

  const [hourlyWage, setHourlyWage] = useState(isKo ? "10320" : "15");
  const [weeklyHours, setWeeklyHours] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    hourlyWage: number;
    weeklyHours: number;
    holidayPay: number;
    weeklyPay: number;
    monthlyPay: number;
    effectiveHourly: number;
    eligible: boolean;
  } | null>(null);

  function calculate() {
    const wage = parseFloat(hourlyWage) || 0;
    const hours = parseFloat(weeklyHours) || 0;
    if (wage <= 0 || hours <= 0) return;

    const eligible = hours >= 15;
    const cappedHours = Math.min(hours, 40);
    const holidayPay = eligible ? wage * (cappedHours / 40) * 8 : 0;
    const weeklyPay = wage * hours + holidayPay;
    const monthlyPay = weeklyPay * (365 / 7) / 12;
    const effectiveHourly = eligible ? weeklyPay / hours : wage;

    setResult({
      hourlyWage: wage,
      weeklyHours: hours,
      holidayPay,
      weeklyPay,
      monthlyPay,
      effectiveHourly,
      eligible,
    });
  }

  const fmt = (v: number) =>
    v.toLocaleString(isKo ? "ko-KR" : "en-US", { maximumFractionDigits: 0 });

  const title = isKo ? "주휴수당 계산기" : "Weekly Holiday Pay Calculator";
  const description = isKo
    ? "시급과 주간 근무시간을 입력하면 주휴수당, 주급, 월급 예상액을 자동 계산합니다. 2026년 최저시급 10,320원 기준."
    : "Calculate weekly holiday pay based on hourly wage and weekly work hours. Includes weekly and monthly pay estimates.";

  const faqItems = isKo
    ? [
        { q: "주휴수당이란 무엇인가요?", a: "주휴수당은 근로기준법 제55조에 따라 1주간 소정근로일을 개근한 근로자에게 유급으로 부여되는 주휴일에 대한 수당입니다. 쉽게 말해 일하지 않는 날에도 하루치 임금을 받는 것입니다." },
        { q: "주휴수당 지급 조건은?", a: "주 15시간 이상 근무하는 근로자가 해당 주의 소정근로일을 모두 개근하면 주휴수당을 받을 수 있습니다. 정규직, 아르바이트, 계약직 등 고용형태와 관계없이 적용됩니다." },
        { q: "주휴수당 계산 공식은?", a: "주휴수당 = 시급 × (주간 근무시간 ÷ 40) × 8시간. 주 40시간 이상 근무 시에는 시급 × 8시간으로 계산합니다." },
        { q: "2026년 최저시급은 얼마인가요?", a: "2026년 최저시급은 10,320원입니다. 주 40시간 풀타임 근무 시 주휴수당 포함 실질 시급은 약 12,384원이 됩니다." },
        { q: "주휴수당을 안 주면 어떻게 하나요?", a: "사업주가 주휴수당을 지급하지 않으면 근로기준법 위반입니다. 관할 지방고용노동청에 진정을 제기할 수 있으며, 미지급 임금의 소멸시효는 3년입니다." },
      ]
    : [
        { q: "What is weekly holiday pay?", a: "Weekly holiday pay (주휴수당) is a paid day off guaranteed by Korean labor law. Workers who complete all scheduled work days in a week receive one day's pay for a rest day." },
        { q: "Who is eligible for weekly holiday pay?", a: "Any worker who works 15 or more hours per week and completes all scheduled work days is eligible, regardless of employment type (full-time, part-time, contract)." },
        { q: "How is weekly holiday pay calculated?", a: "Weekly Holiday Pay = Hourly Wage × (Weekly Work Hours ÷ 40) × 8 hours. For workers doing 40+ hours/week, it's simply Hourly Wage × 8 hours." },
        { q: "What is the 2026 minimum wage in Korea?", a: "The 2026 minimum wage is ₩10,320 per hour. With weekly holiday pay included, the effective hourly rate for full-time workers is approximately ₩12,384." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "시급" : "Hourly Wage"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "₩" : "$"}
              </span>
              <input
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(e.target.value)}
                placeholder={isKo ? "10,320" : "15"}
                className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {isKo && (
              <p className="text-xs text-neutral-400 mt-1">
                2026년 최저시급: 10,320원
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "주간 근무시간" : "Weekly Work Hours"}
            </label>
            <div className="relative">
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                placeholder={isKo ? "40" : "40"}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "시간/주" : "hrs/wk"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "계산하기" : "Calculate"}
        </button>

        {result && (
          <>
            {!result.eligible && (
              <div className="rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  {isKo
                    ? "⚠️ 주 15시간 미만 근무 시 주휴수당이 지급되지 않습니다."
                    : "⚠️ Weekly holiday pay is not applicable for less than 15 hours/week."}
                </p>
              </div>
            )}

            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {isKo ? "₩" : "$"}{fmt(result.holidayPay)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "주휴수당 (주)" : "Weekly Holiday Pay"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {isKo ? "₩" : "$"}{fmt(result.weeklyPay)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "주급 (근무 + 주휴)" : "Weekly Pay (Work + Holiday)"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {isKo ? "₩" : "$"}{fmt(result.monthlyPay)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "월급 예상액" : "Estimated Monthly Pay"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {isKo ? "₩" : "$"}{fmt(result.effectiveHourly)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "실질 시급 (주휴 포함)" : "Effective Hourly Rate"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "시급" : "Hourly Wage"}</td>
                      <td className="p-3 text-right">{isKo ? "₩" : "$"}{fmt(result.hourlyWage)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "주간 근무시간" : "Weekly Hours"}</td>
                      <td className="p-3 text-right">{result.weeklyHours}{isKo ? "시간" : " hours"}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "근무 수입 (주)" : "Work Income (Weekly)"}</td>
                      <td className="p-3 text-right">{isKo ? "₩" : "$"}{fmt(result.hourlyWage * result.weeklyHours)}</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">{isKo ? "주휴수당" : "Holiday Pay"}</td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400">{isKo ? "₩" : "$"}{fmt(result.holidayPay)}</td>
                    </tr>
                    <tr className="font-semibold bg-blue-50 dark:bg-blue-950/30">
                      <td className="p-3">{isKo ? "주급 합계" : "Total Weekly"}</td>
                      <td className="p-3 text-right">{isKo ? "₩" : "$"}{fmt(result.weeklyPay)}</td>
                    </tr>
                    <tr className="font-semibold bg-green-50 dark:bg-green-950/30">
                      <td className="p-3">{isKo ? "월급 예상" : "Est. Monthly"}</td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400">{isKo ? "₩" : "$"}{fmt(result.monthlyPay)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="weekly-holiday-pay-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "시급을 입력하세요 (2026년 최저시급 10,320원 기본 적용).",
                "주간 근무시간을 입력하세요.",
                "계산하기 버튼을 클릭하세요.",
                "주휴수당, 주급, 월급 예상액을 확인하세요.",
              ]
            : [
                "Enter your hourly wage.",
                "Enter your weekly work hours.",
                "Click Calculate.",
                "View your weekly holiday pay, weekly pay, and estimated monthly pay.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
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
            mainEntity: faqItems.map((item) => ({
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

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="weekly-holiday-pay-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="weekly-holiday-pay-calculator"
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
