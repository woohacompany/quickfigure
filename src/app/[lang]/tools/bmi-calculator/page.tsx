"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

const BMI_CATEGORIES = [
  { key: "underweight" as const, rangeKey: "underweightRange" as const, min: 0, max: 18.5, color: "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700" },
  { key: "normal" as const, rangeKey: "normalRange" as const, min: 18.5, max: 25, color: "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700" },
  { key: "overweight" as const, rangeKey: "overweightRange" as const, min: 25, max: 30, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700" },
  { key: "obese" as const, rangeKey: "obeseRange" as const, min: 30, max: Infinity, color: "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700" },
];

export default function BmiCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.bmi;
  const relatedPosts = getPostsByTool("bmi-calculator");

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<{ bmi: number; categoryKey: string } | null>(null);

  function calculate() {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);

    let categoryKey: string;
    if (bmi < 18.5) categoryKey = "underweight";
    else if (bmi < 25) categoryKey = "normal";
    else if (bmi < 30) categoryKey = "overweight";
    else categoryKey = "obese";

    setResult({ bmi, categoryKey });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2">{t.height}</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="170"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t.weight}</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="70"
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.calculate}
        </button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {result.bmi.toFixed(1)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.yourBmi}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                <p className="text-2xl font-semibold tracking-tight">
                  {t[result.categoryKey as keyof typeof t]}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t.category}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t.bmiRange}</h3>
              {BMI_CATEGORIES.map((cat) => {
                const isActive = result.categoryKey === cat.key;
                return (
                  <div
                    key={cat.key}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      isActive
                        ? cat.color + " ring-2 ring-blue-500"
                        : "border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isActive ? "" : "text-neutral-500 dark:text-neutral-400"}`}>
                      {t[cat.key as keyof typeof t]}
                    </span>
                    <span className={`text-sm ${isActive ? "" : "text-neutral-400 dark:text-neutral-500"}`}>
                      {t[cat.rangeKey as keyof typeof t]}
                    </span>
                  </div>
                );
              })}
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
