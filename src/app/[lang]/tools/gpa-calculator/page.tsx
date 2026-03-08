"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

interface Course {
  name: string;
  grade: string;
  credits: number;
  isMajor: boolean;
}

interface Result {
  totalGPA: number;
  totalCredits: number;
  majorGPA?: number;
  majorCredits?: number;
  generalGPA?: number;
  generalCredits?: number;
}

const GRADE_VALUES: Record<string, Record<string, number>> = {
  "4.5": {
    "A+": 4.5,
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    "D+": 1.5,
    D: 1.0,
    F: 0,
  },
  "4.3": {
    "A+": 4.3,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0,
  },
  "4.0": {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    "D-": 0.7,
    F: 0,
  },
};

function createEmptyCourse(): Course {
  return { name: "", grade: "", credits: 3, isMajor: true };
}

export default function GpaCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.gpaCalc;
  const relatedPosts = getPostsByTool("gpa-calculator");

  const [scale, setScale] = useState<"4.5" | "4.3" | "4.0">("4.5");
  const [courses, setCourses] = useState<Course[]>(
    Array.from({ length: 5 }, () => createEmptyCourse())
  );
  const [showMajorFilter, setShowMajorFilter] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const gradeOptions = Object.keys(GRADE_VALUES[scale]);

  function updateCourse(index: number, field: keyof Course, value: string | number | boolean) {
    setCourses((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  function removeCourse(index: number) {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  }

  function addCourse() {
    setCourses((prev) => [...prev, createEmptyCourse()]);
  }

  function calculate() {
    const validCourses = courses.filter((c) => c.grade && c.credits > 0);
    if (validCourses.length === 0) return;

    const gradeMap = GRADE_VALUES[scale];

    let totalWeighted = 0;
    let totalCredits = 0;
    let majorWeighted = 0;
    let majorCredits = 0;
    let generalWeighted = 0;
    let generalCredits = 0;

    for (const course of validCourses) {
      const point = gradeMap[course.grade] ?? 0;
      const w = point * course.credits;
      totalWeighted += w;
      totalCredits += course.credits;

      if (showMajorFilter) {
        if (course.isMajor) {
          majorWeighted += w;
          majorCredits += course.credits;
        } else {
          generalWeighted += w;
          generalCredits += course.credits;
        }
      }
    }

    const res: Result = {
      totalGPA: totalCredits > 0 ? totalWeighted / totalCredits : 0,
      totalCredits,
    };

    if (showMajorFilter) {
      res.majorGPA = majorCredits > 0 ? majorWeighted / majorCredits : 0;
      res.majorCredits = majorCredits;
      res.generalGPA = generalCredits > 0 ? generalWeighted / generalCredits : 0;
      res.generalCredits = generalCredits;
    }

    setResult(res);
  }

  const fmtGPA = (v: number) => v.toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Scale selector */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.scale}</label>
          <div className="flex gap-2">
            {(["4.5", "4.3", "4.0"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScale(s);
                  setResult(null);
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  scale === s
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Major/General toggle */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">{t.showMajorFilter}</label>
          <button
            onClick={() => setShowMajorFilter((prev) => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
              showMajorFilter
                ? "bg-blue-600"
                : "bg-neutral-300 dark:bg-neutral-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                showMajorFilter ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Course table */}
        <div className="space-y-3">
          {/* Header row */}
          <div
            className={`grid gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 ${
              showMajorFilter
                ? "grid-cols-[1fr_100px_70px_60px_36px]"
                : "grid-cols-[1fr_100px_70px_36px]"
            }`}
          >
            <span>{t.courseName}</span>
            <span>{t.grade}</span>
            <span>{t.credits}</span>
            {showMajorFilter && <span>{t.isMajor}</span>}
            <span />
          </div>

          {courses.map((course, i) => (
            <div
              key={i}
              className={`grid gap-2 items-center ${
                showMajorFilter
                  ? "grid-cols-[1fr_100px_70px_60px_36px]"
                  : "grid-cols-[1fr_100px_70px_36px]"
              }`}
            >
              <input
                type="text"
                value={course.name}
                onChange={(e) => updateCourse(i, "name", e.target.value)}
                placeholder={`${t.courseNum} ${i + 1}`}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select
                value={course.grade}
                onChange={(e) => updateCourse(i, "grade", e.target.value)}
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">{t.grade}</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={6}
                value={course.credits}
                onChange={(e) =>
                  updateCourse(
                    i,
                    "credits",
                    Math.max(1, Math.min(6, parseInt(e.target.value) || 1))
                  )
                }
                className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-center"
              />
              {showMajorFilter && (
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={course.isMajor}
                    onChange={(e) =>
                      updateCourse(i, "isMajor", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              )}
              <button
                onClick={() => removeCourse(i)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer text-lg"
                aria-label="Remove course"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Add course button */}
        <button
          onClick={addCourse}
          className="w-full py-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
        >
          + {t.addCourse}
        </button>

        {/* Calculate button */}
        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {/* Results */}
        {result && (
          <>
            <div ref={resultRef} className="space-y-4 mt-4">
              <div
                className={`grid grid-cols-1 gap-4 ${
                  showMajorFilter ? "sm:grid-cols-3" : "sm:grid-cols-2"
                }`}
              >
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {fmtGPA(result.totalGPA)} / {scale}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.totalGPA} ({result.totalCredits} {t.credits})
                  </p>
                </div>
                {showMajorFilter && result.majorCredits !== undefined && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-green-600 dark:text-green-400">
                      {fmtGPA(result.majorGPA!)} / {scale}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {t.majorGPA} ({result.majorCredits} {t.credits})
                    </p>
                  </div>
                )}
                {showMajorFilter && result.generalCredits !== undefined && (
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-2xl font-semibold tracking-tight">
                      {fmtGPA(result.generalGPA!)} / {scale}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {t.generalGPA} ({result.generalCredits} {t.credits})
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.totalGPA}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {fmtGPA(result.totalGPA)} / {scale}
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.totalCredits}
                      </td>
                      <td className="p-3 text-right">
                        {result.totalCredits} {t.credits}
                      </td>
                    </tr>
                    {showMajorFilter && (
                      <>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {t.majorGPA}
                          </td>
                          <td className="p-3 text-right">
                            {fmtGPA(result.majorGPA!)} / {scale} ({result.majorCredits} {t.credits})
                          </td>
                        </tr>
                        <tr className="border-b border-neutral-200 dark:border-neutral-700">
                          <td className="p-3 text-neutral-600 dark:text-neutral-400">
                            {t.generalGPA}
                          </td>
                          <td className="p-3 text-right">
                            {fmtGPA(result.generalGPA!)} / {scale} ({result.generalCredits} {t.credits})
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={t.title}
              slug="gpa-calculator"
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

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="gpa-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="gpa-calculator"
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
