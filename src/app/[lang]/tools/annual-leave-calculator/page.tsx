"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

interface YearBreakdown {
  year: number;
  days: number;
  label: string;
}

export default function AnnualLeaveCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("annual-leave-calculator");

  const [startDate, setStartDate] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    years: number;
    months: number;
    days: number;
    currentYearLeave: number;
    totalAccumulated: number;
    breakdown: YearBreakdown[];
  } | null>(null);

  function calculate() {
    if (!startDate) return;
    const start = new Date(startDate);
    const today = new Date();
    if (start >= today) return;

    const diffMs = today.getTime() - start.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const completedYears = years;
    const completedMonths = months;

    const breakdown: YearBreakdown[] = [];
    let totalAccumulated = 0;

    if (completedYears < 1) {
      // Less than 1 year: monthly leave
      const monthsWorked = completedYears * 12 + completedMonths;
      const monthlyLeave = Math.min(monthsWorked, 11);
      breakdown.push({
        year: 0,
        days: monthlyLeave,
        label: isKo
          ? `입사 1년차 (월차): ${monthlyLeave}일`
          : `Year 1 (Monthly Leave): ${monthlyLeave} days`,
      });
      totalAccumulated = monthlyLeave;
    } else {
      // First year monthly leave
      breakdown.push({
        year: 0,
        days: 11,
        label: isKo ? "입사 1년차 (월차): 11일" : "Year 1 (Monthly Leave): 11 days",
      });
      totalAccumulated = 11;

      // Subsequent years
      for (let y = 1; y <= completedYears; y++) {
        const leaveDays = Math.min(25, 15 + Math.floor((y - 1) / 2));
        breakdown.push({
          year: y,
          days: leaveDays,
          label: isKo
            ? `${y + 1}년차 연차: ${leaveDays}일`
            : `Year ${y + 1} Annual Leave: ${leaveDays} days`,
        });
        totalAccumulated += leaveDays;
      }
    }

    // Current year leave
    let currentYearLeave: number;
    if (completedYears < 1) {
      currentYearLeave = Math.min(completedYears * 12 + completedMonths, 11);
    } else {
      currentYearLeave = Math.min(25, 15 + Math.floor((completedYears - 1) / 2));
    }

    setResult({
      years,
      months: completedMonths,
      days,
      currentYearLeave,
      totalAccumulated,
      breakdown,
    });
  }

  const title = isKo ? "연차 계산기" : "Annual Leave Calculator";
  const description = isKo
    ? "입사일을 입력하면 현재까지 발생한 연차 일수, 올해 연차, 연도별 상세 내역을 자동 계산합니다."
    : "Enter your employment start date to calculate accrued annual leave days, current year entitlement, and year-by-year breakdown.";

  const faqItems = isKo
    ? [
        { q: "연차는 어떻게 발생하나요?", a: "입사 후 1년 미만은 매월 개근 시 1일의 월차가 발생합니다 (최대 11일). 1년 이상 근무하고 80% 이상 출근하면 15일의 연차가 부여되며, 이후 2년마다 1일씩 가산되어 최대 25일까지 늘어납니다." },
        { q: "1년차 월차를 사용하면 2년차 연차에서 차감되나요?", a: "아닙니다. 2018년 법 개정 이후 1년차 월차(최대 11일)와 2년차 연차(15일)는 별도로 적용됩니다." },
        { q: "미사용 연차는 어떻게 되나요?", a: "사용하지 않은 연차는 금전적으로 보상받을 수 있습니다 (1일 통상임금 × 미사용 일수). 다만 사업주가 연차사용촉진제도를 적법하게 시행한 경우 보상 의무가 면제될 수 있습니다." },
        { q: "파트타임도 연차가 발생하나요?", a: "네. 단시간 근로자는 전일제 근로자의 소정근로시간 비율에 따라 비례하여 연차가 부여됩니다." },
        { q: "퇴사 시 미사용 연차는?", a: "퇴사 시 잔여 연차는 반드시 마지막 급여에서 금전으로 보상받아야 합니다." },
      ]
    : [
        { q: "How does annual leave accrue?", a: "For the first year, you earn 1 day per month of perfect attendance (max 11 days). After 1 year with 80%+ attendance, you get 15 days. Every 2 additional years adds 1 more day, up to a maximum of 25 days." },
        { q: "Does using monthly leave reduce second year's annual leave?", a: "No. Since the 2018 amendment, first-year monthly leave (up to 11 days) and second-year annual leave (15 days) are counted separately." },
        { q: "What happens to unused annual leave?", a: "Unused leave must be compensated financially (daily wage × unused days). However, if the employer properly implements a leave promotion system, compensation may be waived." },
        { q: "Do part-time workers get annual leave?", a: "Yes. Part-time workers receive proportional annual leave based on their work hours compared to full-time equivalents." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "입사일" : "Employment Start Date"}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-neutral-400 mt-1">
            {isKo ? "오늘 날짜 기준으로 자동 계산됩니다." : "Calculated based on today's date."}
          </p>
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "계산하기" : "Calculate"}
        </button>

        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {result.years}{isKo ? "년 " : "y "}
                    {result.months}{isKo ? "개월 " : "m "}
                    {result.days}{isKo ? "일" : "d"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "근속기간" : "Employment Period"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {result.currentYearLeave}{isKo ? "일" : " days"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "올해 연차 일수" : "Current Year Leave"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {result.totalAccumulated}{isKo ? "일" : " days"}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {isKo ? "누적 발생 연차 총합" : "Total Accumulated Leave"}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      <th className="p-3 text-left font-medium">{isKo ? "구분" : "Period"}</th>
                      <th className="p-3 text-right font-medium">{isKo ? "연차 일수" : "Leave Days"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((row, i) => (
                      <tr key={i} className="border-t border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">{row.label}</td>
                        <td className="p-3 text-right font-medium">{row.days}{isKo ? "일" : " days"}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-neutral-200 dark:border-neutral-700 font-semibold bg-green-50 dark:bg-green-950/30">
                      <td className="p-3">{isKo ? "합계" : "Total"}</td>
                      <td className="p-3 text-right text-green-600 dark:text-green-400">{result.totalAccumulated}{isKo ? "일" : " days"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={title}
              slug="annual-leave-calculator"
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
                "입사일을 선택하세요.",
                "계산하기 버튼을 클릭하세요.",
                "오늘 날짜 기준으로 근속기간과 연차 일수가 자동 계산됩니다.",
                "연도별 연차 발생 내역을 확인하세요.",
              ]
            : [
                "Select your employment start date.",
                "Click Calculate.",
                "Your employment period and leave days are calculated based on today's date.",
                "Review the year-by-year leave breakdown.",
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
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
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
          <Link href={`/${lang}/tools/dday-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.ddayCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.ddayCalcDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/salary-calculator`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.salaryCalc}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.salaryCalcDesc}</p>
          </Link>
        </div>
      </section>

      <ShareButtons title={title} description={description} lang={lang} slug="annual-leave-calculator" labels={dict.share} />
      <EmbedCodeButton slug="annual-leave-calculator" lang={lang} labels={dict.embed} />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
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
