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

export default function UnemploymentCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("unemployment-calculator");

  const title = isKo
    ? "실업급여 계산기 - 2026년 수급액 자동 계산"
    : "Unemployment Benefits Calculator - Estimate Your Benefits";
  const description = isKo
    ? "나이, 고용보험 가입기간, 퇴직 전 3개월 평균임금을 입력하면 실업급여 1일 수급액, 수급기간, 총 수급액을 자동 계산합니다."
    : "Enter your age, employment insurance period, and average monthly wage to calculate daily benefits, benefit duration, and total unemployment benefits.";
  const metaTitle = isKo
    ? "실업급여 계산기 - 2026년 수급액 자동 계산 | QuickFigure"
    : "Unemployment Benefits Calculator - Estimate Benefits | QuickFigure";

  const [age, setAge] = useState("");
  const [insuranceYears, setInsuranceYears] = useState("");
  const [monthlyWage, setMonthlyWage] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const [result, setResult] = useState<{
    dailyBenefit: number;
    benefitDays: number;
    monthlyBenefit: number;
    totalBenefit: number;
    avgDailyWage: number;
    rawDailyBenefit: number;
  } | null>(null);

  function getBenefitDays(ageNum: number, yearsNum: number, disabled: boolean): number {
    const isOver50OrDisabled = ageNum >= 50 || disabled;

    if (yearsNum < 1) return 120;
    if (yearsNum < 3) return isOver50OrDisabled ? 180 : 150;
    if (yearsNum < 5) return isOver50OrDisabled ? 210 : 180;
    if (yearsNum < 10) return isOver50OrDisabled ? 240 : 210;
    return isOver50OrDisabled ? 270 : 240;
  }

  function calculate() {
    const ageNum = parseFloat(age) || 0;
    const yearsNum = parseFloat(insuranceYears) || 0;
    const wage = parseFloat(monthlyWage) || 0;

    if (ageNum <= 0 || yearsNum < 0 || wage <= 0) return;

    const UPPER_LIMIT = 66000;
    const LOWER_LIMIT = 63104;

    // 1일 평균임금 = 퇴직 전 3개월 평균임금 / 90일 * 3개월
    const avgDailyWage = (wage * 3) / 90;
    // 1일 수급액 = 1일 평균임금 * 60%
    const rawDailyBenefit = avgDailyWage * 0.6;
    // 상한액/하한액 적용
    const dailyBenefit = Math.min(UPPER_LIMIT, Math.max(LOWER_LIMIT, rawDailyBenefit));

    const benefitDays = getBenefitDays(ageNum, yearsNum, isDisabled);
    const monthlyBenefit = dailyBenefit * 30;
    const totalBenefit = dailyBenefit * benefitDays;

    setResult({
      dailyBenefit,
      benefitDays,
      monthlyBenefit,
      totalBenefit,
      avgDailyWage,
      rawDailyBenefit,
    });
  }

  function fmt(v: number): string {
    return Math.round(v).toLocaleString(isKo ? "ko-KR" : "en-US");
  }

  const faqItems = isKo
    ? [
        {
          q: "실업급여를 받을 수 있는 조건은?",
          a: "이직일 이전 18개월 중 고용보험 가입기간이 180일 이상이어야 합니다. 또한 비자발적 이직(권고사직, 계약만료 등)이어야 하며, 재취업 의사와 능력이 있어야 합니다. 자발적 퇴사는 원칙적으로 수급 대상에서 제외되지만, 정당한 사유가 있는 경우 인정됩니다.",
        },
        {
          q: "2026년 실업급여 상한액과 하한액은?",
          a: "2026년 실업급여 1일 상한액은 66,000원이며, 하한액은 63,104원입니다. 하한액은 최저임금의 80%에 1일 소정근로시간(8시간)을 곱한 금액을 기준으로 산정됩니다.",
        },
        {
          q: "실업급여 수급기간은 어떻게 결정되나요?",
          a: "수급기간은 이직 당시 나이와 고용보험 가입기간에 따라 120일~270일로 결정됩니다. 50세 이상이거나 장애인인 경우 같은 가입기간에서 더 긴 수급기간이 적용됩니다.",
        },
        {
          q: "실업급여 신청 절차는?",
          a: "퇴직 후 워크넷(www.work.go.kr)에서 구직등록을 한 뒤, 관할 고용센터에 방문하여 수급자격 인정 신청을 합니다. 이후 취업활동을 하면서 4주마다 실업인정을 받으면 실업급여가 지급됩니다.",
        },
        {
          q: "자발적 퇴사도 실업급여를 받을 수 있나요?",
          a: "원칙적으로 자발적 퇴사는 실업급여 수급 대상이 아닙니다. 다만 임금체불, 직장내 괴롭힘, 통근 곤란(회사 이전), 건강 악화 등 정당한 사유가 인정되면 수급이 가능합니다.",
        },
      ]
    : [
        {
          q: "Who is eligible for unemployment benefits in Korea?",
          a: "You must have been enrolled in employment insurance for at least 180 days within 18 months before separation. The separation must be involuntary (layoff, contract expiration, etc.), and you must be willing and able to seek reemployment. Voluntary resignation is generally excluded, but exceptions exist for valid reasons.",
        },
        {
          q: "What are the 2026 daily benefit limits?",
          a: "The daily upper limit is KRW 66,000 and the lower limit is KRW 63,104. The lower limit is calculated based on 80% of the minimum wage multiplied by 8 hours of prescribed daily working hours.",
        },
        {
          q: "How is the benefit duration determined?",
          a: "The benefit duration ranges from 120 to 270 days, depending on your age at separation and employment insurance enrollment period. Workers aged 50 or older, or those with disabilities, receive longer benefit periods for the same enrollment duration.",
        },
        {
          q: "How do I apply for unemployment benefits?",
          a: "After separation, register as a job seeker on WorkNet (www.work.go.kr), then visit your local Employment Center to apply for benefit eligibility. After approval, you must report job-seeking activities every 4 weeks to continue receiving benefits.",
        },
        {
          q: "Can I receive benefits if I resigned voluntarily?",
          a: "Generally, voluntary resignation does not qualify for unemployment benefits. However, if you resigned due to valid reasons such as unpaid wages, workplace harassment, unreasonable commute due to company relocation, or health deterioration, you may still be eligible.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "퇴직 당시 나이를 입력하세요.",
        "고용보험 가입기간(년)을 입력하세요.",
        "퇴직 전 3개월 평균 월급(세전)을 입력하세요.",
        "50세 이상이거나 장애인인 경우 해당 체크박스를 선택하세요.",
        "계산하기 버튼을 클릭하여 실업급여 예상 수급액을 확인하세요.",
      ]
    : [
        "Enter your age at the time of separation.",
        "Enter your employment insurance enrollment period in years.",
        "Enter your average monthly wage (pre-tax) for the 3 months before separation.",
        "Check the box if you are aged 50+ or have a disability.",
        "Click Calculate to see your estimated unemployment benefits.",
      ];

  return (
    <>
      <head>
        <title>{metaTitle}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://quickfigure.net/${locale}/tools/unemployment-calculator`}
        />
        <meta property="og:type" content="website" />
        <link
          rel="canonical"
          href={`https://quickfigure.net/${locale}/tools/unemployment-calculator`}
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://quickfigure.net/en/tools/unemployment-calculator"
        />
        <link
          rel="alternate"
          hrefLang="ko"
          href="https://quickfigure.net/ko/tools/unemployment-calculator"
        />
      </head>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {description}
          </p>

          <ToolAbout slug="unemployment-calculator" locale={locale} />
        </header>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "퇴직 당시 나이" : "Age at Separation"}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={isKo ? "예: 35" : "e.g. 35"}
                min="18"
                max="100"
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "고용보험 가입기간 (년)" : "Insurance Period (years)"}
              </label>
              <input
                type="number"
                value={insuranceYears}
                onChange={(e) => setInsuranceYears(e.target.value)}
                placeholder={isKo ? "예: 5" : "e.g. 5"}
                min="0"
                step="0.5"
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo
                ? "퇴직 전 3개월 월평균 임금 (세전)"
                : "Average Monthly Wage (Last 3 Months, Pre-tax)"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                {isKo ? "\u20A9" : "$"}
              </span>
              <input
                type="number"
                value={monthlyWage}
                onChange={(e) => setMonthlyWage(e.target.value)}
                placeholder={isKo ? "3,000,000" : "3,000"}
                className="w-full p-3 pl-8 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isDisabled}
              onChange={(e) => setIsDisabled(e.target.checked)}
              className="rounded border-neutral-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500"
            />
            {isKo
              ? "50\uC138 \uC774\uC0C1 \uB610\uB294 \uC7A5\uC560\uC778"
              : "Aged 50+ or Person with Disability"}
          </label>

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
                      {isKo ? "\u20A9" : "KRW "}
                      {fmt(result.dailyBenefit)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "1일 수급액" : "Daily Benefit"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {fmt(result.benefitDays)}
                      {isKo ? "일" : " days"}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "수급기간" : "Benefit Duration"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {isKo ? "\u20A9" : "KRW "}
                      {fmt(result.monthlyBenefit)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "월 예상 수급액" : "Monthly Estimate"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                      {isKo ? "\u20A9" : "KRW "}
                      {fmt(result.totalBenefit)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {isKo ? "총 수급액" : "Total Benefits"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "1일 평균임금" : "Daily Average Wage"}
                        </td>
                        <td className="p-3 text-right">
                          {isKo ? "\u20A9" : "KRW "}
                          {fmt(result.avgDailyWage)}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "1일 수급액 (60%)" : "Daily Benefit (60%)"}
                        </td>
                        <td className="p-3 text-right">
                          {isKo ? "\u20A9" : "KRW "}
                          {fmt(result.rawDailyBenefit)}
                          {result.rawDailyBenefit !== result.dailyBenefit && (
                            <span className="text-xs text-neutral-400 ml-1">
                              {result.rawDailyBenefit > result.dailyBenefit
                                ? isKo
                                  ? "(상한 적용)"
                                  : "(upper limit applied)"
                                : isKo
                                ? "(하한 적용)"
                                : "(lower limit applied)"}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "적용 1일 수급액" : "Applied Daily Benefit"}
                        </td>
                        <td className="p-3 text-right">
                          {isKo ? "\u20A9" : "KRW "}
                          {fmt(result.dailyBenefit)}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "수급기간" : "Benefit Duration"}
                        </td>
                        <td className="p-3 text-right">
                          {fmt(result.benefitDays)}
                          {isKo ? "일" : " days"}
                        </td>
                      </tr>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <td className="p-3 text-neutral-600 dark:text-neutral-400">
                          {isKo ? "월 예상 수급액 (30일)" : "Monthly Estimate (30 days)"}
                        </td>
                        <td className="p-3 text-right">
                          {isKo ? "\u20A9" : "KRW "}
                          {fmt(result.monthlyBenefit)}
                        </td>
                      </tr>
                      <tr className="font-semibold bg-green-50 dark:bg-green-950/30">
                        <td className="p-3">
                          {isKo ? "총 수급액" : "Total Benefits"}
                        </td>
                        <td className="p-3 text-right text-green-600 dark:text-green-400">
                          {isKo ? "\u20A9" : "KRW "}
                          {fmt(result.totalBenefit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Benefit duration reference table */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm font-medium">
                      {isKo
                        ? "수급기간 참고표 (2026년 기준)"
                        : "Benefit Duration Reference (2026)"}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30">
                          <th className="p-2 text-left font-medium">
                            {isKo ? "가입기간" : "Insurance Period"}
                          </th>
                          <th className="p-2 text-center font-medium">
                            {isKo ? "50세 미만" : "Under 50"}
                          </th>
                          <th className="p-2 text-center font-medium">
                            {isKo ? "50세 이상/장애인" : "50+/Disabled"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-2 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "1년 미만" : "< 1 year"}
                          </td>
                          <td className="p-2 text-center">120{isKo ? "일" : " days"}</td>
                          <td className="p-2 text-center">120{isKo ? "일" : " days"}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-2 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "1~3년" : "1-3 years"}
                          </td>
                          <td className="p-2 text-center">150{isKo ? "일" : " days"}</td>
                          <td className="p-2 text-center">180{isKo ? "일" : " days"}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-2 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "3~5년" : "3-5 years"}
                          </td>
                          <td className="p-2 text-center">180{isKo ? "일" : " days"}</td>
                          <td className="p-2 text-center">210{isKo ? "일" : " days"}</td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-2 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "5~10년" : "5-10 years"}
                          </td>
                          <td className="p-2 text-center">210{isKo ? "일" : " days"}</td>
                          <td className="p-2 text-center">240{isKo ? "일" : " days"}</td>
                        </tr>
                        <tr>
                          <td className="p-2 text-neutral-600 dark:text-neutral-400">
                            {isKo ? "10년 이상" : "10+ years"}
                          </td>
                          <td className="p-2 text-center">240{isKo ? "일" : " days"}</td>
                          <td className="p-2 text-center">270{isKo ? "일" : " days"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <SaveResultImage
                targetRef={resultRef}
                toolName={title}
                slug="unemployment-calculator"
                labels={dict.saveImage}
              />
            </>
          )}
        </div>

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
              href={`/${lang}/tools/severance-calculator`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {dict.home.severanceCalc}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {dict.home.severanceCalcDesc}
              </p>
            </Link>
          </div>
        </section>

        <ToolHowItWorks slug="unemployment-calculator" locale={locale} />
        <ToolDisclaimer slug="unemployment-calculator" locale={locale} />

        <ShareButtons
          title={title}
          description={description}
          lang={lang}
          slug="unemployment-calculator"
          labels={dict.share}
        />
        <EmbedCodeButton
          slug="unemployment-calculator"
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
    </>
  );
}
