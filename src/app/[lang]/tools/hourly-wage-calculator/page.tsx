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

export default function HourlyWageCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("hourly-wage-calculator");

  const title = isKo
    ? "시급 계산기 - 2026 최저시급 주휴수당 자동 계산"
    : "Hourly Wage Calculator - Convert Hourly Pay to Salary";
  const description = isKo
    ? "시급을 입력하면 일급, 주급, 월급, 연봉을 자동 계산합니다. 2026년 최저시급 10,320원 적용, 주휴수당 포함."
    : "Calculate daily, weekly, monthly, and annual pay from your hourly wage. Includes Korean weekly holiday allowance calculation.";

  const [hourlyWage, setHourlyWage] = useState(isKo ? "10320" : "15");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const [daysPerWeek, setDaysPerWeek] = useState("5");
  const [includeWeeklyHoliday, setIncludeWeeklyHoliday] = useState(isKo);
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    dailyWage: number;
    weeklyWage: number;
    monthlyWage: number;
    annualSalary: number;
    weeklyHolidayPay: number;
    monthlyHours: number;
  } | null>(null);

  function formatNumber(n: number): string {
    return Math.round(n).toLocaleString(isKo ? "ko-KR" : "en-US");
  }

  function calculate() {
    const wage = parseFloat(hourlyWage) || 0;
    const hpd = parseFloat(hoursPerDay) || 0;
    const dpw = parseFloat(daysPerWeek) || 0;

    if (wage <= 0 || hpd <= 0 || dpw <= 0) return;

    const dailyWage = wage * hpd;
    const weeklyWorkHours = hpd * dpw;

    // Weekly holiday allowance: (weekly hours / 40) * 8 * hourly wage
    // Only for workers working 15+ hours/week
    let weeklyHolidayPay = 0;
    if (includeWeeklyHoliday && weeklyWorkHours >= 15) {
      weeklyHolidayPay = (weeklyWorkHours / 40) * 8 * wage;
    }

    const weeklyWage = dailyWage * dpw + weeklyHolidayPay;

    // Monthly calculation
    let monthlyHours: number;
    let monthlyWage: number;

    if (includeWeeklyHoliday && weeklyWorkHours >= 15) {
      // Standard Korean calculation: 209 hours for 8h/day, 5 days/week
      // Formula: (weekly work hours + weekly holiday hours) * (365/7/12)
      const weeklyHolidayHours = (weeklyWorkHours / 40) * 8;
      const totalWeeklyHours = weeklyWorkHours + weeklyHolidayHours;
      monthlyHours = totalWeeklyHours * (365 / 7 / 12);
      monthlyWage = wage * monthlyHours;
    } else {
      monthlyHours = weeklyWorkHours * (365 / 7 / 12);
      monthlyWage = wage * monthlyHours;
    }

    const annualSalary = monthlyWage * 12;

    setResult({
      dailyWage,
      weeklyWage,
      monthlyWage,
      annualSalary,
      weeklyHolidayPay,
      monthlyHours,
    });
  }

  const faqItems = isKo
    ? [
        {
          q: "주휴수당이란 무엇인가요?",
          a: "주휴수당은 1주 소정근로일을 개근한 근로자에게 유급 주휴일에 대해 지급하는 수당입니다. 사용자는 1주에 평균 1회 이상의 유급휴일을 보장해야 하며, 이때 지급되는 임금이 주휴수당입니다. 계산 공식: (주 소정근로시간 / 40) x 8 x 시급",
        },
        {
          q: "2026년 최저시급은 얼마인가요?",
          a: "2026년 최저시급은 시간당 10,320원입니다. 주 40시간(주 5일, 하루 8시간) 근무 시 주휴수당을 포함한 월급은 약 2,156,880원이며, 연봉으로 환산하면 약 25,882,560원입니다.",
        },
        {
          q: "월급은 어떻게 계산하나요?",
          a: "주휴수당 포함 시 월급 = 시급 x 월 소정근로시간(209시간, 주 40시간 기준)으로 계산합니다. 209시간은 (주 40시간 + 주휴 8시간) x (365일 / 7일 / 12개월)로 산출됩니다. 주휴수당 미포함 시에는 실제 근로시간만으로 계산합니다.",
        },
        {
          q: "주휴수당 지급 대상자는 누구인가요?",
          a: "주 소정근로시간이 15시간 이상인 근로자가 1주 소정근로일을 개근하면 주휴수당을 받을 수 있습니다. 아르바이트, 파트타임, 정규직 등 근로 형태에 관계없이 조건을 충족하면 지급 대상입니다.",
        },
        {
          q: "연장근무(초과근무) 수당은 어떻게 계산하나요?",
          a: "법정 근로시간(1일 8시간, 주 40시간)을 초과하는 근무에 대해서는 통상임금의 50%를 가산하여 지급합니다. 예를 들어 시급 10,320원인 경우, 연장근무 수당은 시간당 15,480원(10,320 x 1.5)입니다.",
        },
      ]
    : [
        {
          q: "What is the Korean Weekly Holiday Allowance (주휴수당)?",
          a: "The Weekly Holiday Allowance (주휴수당) is a legally mandated pay in South Korea for workers who complete all scheduled workdays in a week. Employers must provide at least one paid day off per week. The formula is: (weekly hours / 40) x 8 x hourly wage.",
        },
        {
          q: "What is the 2026 Korean minimum wage?",
          a: "The 2026 Korean minimum wage is 10,320 KRW per hour. For a standard 40-hour work week (5 days, 8 hours/day), the monthly wage including weekly holiday allowance is approximately 2,156,880 KRW, or about 25,882,560 KRW annually.",
        },
        {
          q: "How is the monthly wage calculated?",
          a: "With weekly holiday allowance included, the monthly wage equals the hourly wage multiplied by 209 hours (for a standard 40-hour week). The 209 hours is derived from (40 work hours + 8 holiday hours) x (365 days / 7 days / 12 months). Without weekly holiday allowance, only actual working hours are counted.",
        },
        {
          q: "Who is eligible for the Weekly Holiday Allowance?",
          a: "Any worker who works 15 or more hours per week and has perfect attendance for all scheduled workdays in a week is eligible. This applies regardless of employment type — part-time, full-time, or temporary workers all qualify if they meet the conditions.",
        },
        {
          q: "How is overtime pay calculated in Korea?",
          a: "Work exceeding the legal working hours (8 hours/day or 40 hours/week) must be compensated at 150% of the regular hourly wage. For example, if the hourly wage is 10,320 KRW, overtime pay would be 15,480 KRW per hour (10,320 x 1.5).",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "시급을 입력하세요. 2026년 최저시급(10,320원)이 기본값으로 설정되어 있습니다.",
        "하루 근무시간과 주간 근무일수를 설정하세요.",
        "주휴수당 포함 여부를 선택하세요 (주 15시간 이상 근무 시 해당).",
        "계산하기 버튼을 눌러 일급, 주급, 월급, 연봉을 확인하세요.",
      ]
    : [
        "Enter your hourly wage. The default is set to the 2026 Korean minimum wage (10,320 KRW).",
        "Set your daily working hours and weekly working days.",
        "Choose whether to include the Weekly Holiday Allowance (applicable for 15+ hours/week).",
        "Click Calculate to see your daily, weekly, monthly, and annual pay.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "시급 계산기" : "Hourly Wage Calculator"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="hourly-wage-calculator" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* 2026 Minimum Wage Info */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {isKo
              ? "2026년 최저시급: 10,320원/시간"
              : "2026 Korean Minimum Wage: 10,320 KRW/hour"}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {isKo
              ? "주 40시간 근무 기준 월급(주휴수당 포함): 약 2,156,880원"
              : "Monthly (40h/week, incl. weekly holiday allowance): approx. 2,156,880 KRW"}
          </p>
        </div>

        {/* Hourly Wage */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "시급 (원)" : "Hourly Wage"}
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
        </div>

        {/* Hours per Day */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "1일 근무시간" : "Hours per Day"}
          </label>
          <input
            type="number"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            min="1"
            max="24"
            placeholder="8"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Days per Week */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "주간 근무일수" : "Days per Week"}
          </label>
          <input
            type="number"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            min="1"
            max="7"
            placeholder="5"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Weekly Holiday Allowance Toggle */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "주휴수당 포함" : "Include Weekly Holiday Allowance"}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIncludeWeeklyHoliday(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                includeWeeklyHoliday
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "포함" : "Include"}
            </button>
            <button
              onClick={() => setIncludeWeeklyHoliday(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                !includeWeeklyHoliday
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "미포함" : "Exclude"}
            </button>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            {isKo
              ? "주 15시간 이상 근무 시, 1주 개근한 근로자에게 유급 주휴일 수당이 지급됩니다."
              : "Workers with 15+ hours/week who complete all scheduled workdays receive paid weekly holiday allowance."}
          </p>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {isKo ? "계산하기" : "Calculate"}
        </button>

        {/* Results */}
        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {isKo ? `${formatNumber(result.dailyWage)}원` : `$${formatNumber(result.dailyWage)}`}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "일급" : "Daily Wage"}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {isKo ? `${formatNumber(result.weeklyWage)}원` : `$${formatNumber(result.weeklyWage)}`}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "주급" : "Weekly Wage"}
                    {includeWeeklyHoliday && result.weeklyHolidayPay > 0 && (
                      <span className="text-xs text-blue-500 ml-1">
                        ({isKo ? "주휴수당 포함" : "incl. holiday pay"})
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                    {isKo ? `${formatNumber(result.monthlyWage)}원` : `$${formatNumber(result.monthlyWage)}`}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "월급 (예상)" : "Monthly Wage (est.)"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {isKo
                      ? `월 ${result.monthlyHours.toFixed(1)}시간 기준`
                      : `Based on ${result.monthlyHours.toFixed(1)} hrs/month`}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {isKo ? `${formatNumber(result.annualSalary)}원` : `$${formatNumber(result.annualSalary)}`}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "연봉 (예상)" : "Annual Salary (est.)"}
                  </p>
                </div>
              </div>

              {/* Weekly Holiday Allowance Breakdown */}
              {includeWeeklyHoliday && result.weeklyHolidayPay > 0 && (
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                        <th className="text-left p-3 font-medium">
                          {isKo ? "주휴수당 상세" : "Weekly Holiday Allowance Breakdown"}
                        </th>
                        <th className="text-right p-3 font-medium">
                          {isKo ? "금액" : "Amount"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "주간 소정근로시간" : "Weekly scheduled hours"}
                        </td>
                        <td className="p-3 text-right">
                          {(parseFloat(hoursPerDay) * parseFloat(daysPerWeek)).toFixed(1)}{isKo ? "시간" : "h"}
                        </td>
                      </tr>
                      <tr className="border-t border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "주휴수당 (주당)" : "Weekly holiday pay (per week)"}
                        </td>
                        <td className="p-3 text-right">
                          {isKo
                            ? `${formatNumber(result.weeklyHolidayPay)}원`
                            : `$${formatNumber(result.weeklyHolidayPay)}`}
                        </td>
                      </tr>
                      <tr className="border-t border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "주휴수당 계산식" : "Formula"}
                        </td>
                        <td className="p-3 text-right text-xs text-neutral-500 dark:text-neutral-400">
                          ({(parseFloat(hoursPerDay) * parseFloat(daysPerWeek)).toFixed(0)} / 40) x 8 x {formatNumber(parseFloat(hourlyWage))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={isKo ? "시급 계산기" : "Hourly Wage Calculator"}
              slug="hourly-wage-calculator"
              labels={dict.saveImage}
            />
          </>
        )}
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
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

      {/* JSON-LD FAQPage Schema */}
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

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Link
            href={`/${lang}/tools/freelancer-tax-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.freelancerTax}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.freelancerTaxDesc}
            </p>
          </Link>
        </div>
      </section>

      {/* Share & Embed */}
      <ToolHowItWorks slug="hourly-wage-calculator" locale={locale} />
      <ToolDisclaimer slug="hourly-wage-calculator" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="hourly-wage-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="hourly-wage-calculator"
        lang={lang}
        labels={dict.embed}
      />

      {/* Related Blog Posts */}
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
