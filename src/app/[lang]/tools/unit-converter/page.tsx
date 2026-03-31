"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

type UnitCategory = "length" | "weight" | "temperature" | "area" | "volume";

const unitData: Record<UnitCategory, { units: string[]; toBase: Record<string, (v: number) => number>; fromBase: Record<string, (v: number) => number> }> = {
  length: {
    units: ["m", "km", "cm", "mm", "mi", "yd", "ft", "in"],
    toBase: {
      m: (v) => v, km: (v) => v * 1000, cm: (v) => v / 100, mm: (v) => v / 1000,
      mi: (v) => v * 1609.344, yd: (v) => v * 0.9144, ft: (v) => v * 0.3048, in: (v) => v * 0.0254,
    },
    fromBase: {
      m: (v) => v, km: (v) => v / 1000, cm: (v) => v * 100, mm: (v) => v * 1000,
      mi: (v) => v / 1609.344, yd: (v) => v / 0.9144, ft: (v) => v / 0.3048, in: (v) => v / 0.0254,
    },
  },
  weight: {
    units: ["kg", "g", "mg", "lb", "oz", "ton"],
    toBase: {
      kg: (v) => v, g: (v) => v / 1000, mg: (v) => v / 1000000,
      lb: (v) => v * 0.453592, oz: (v) => v * 0.0283495, ton: (v) => v * 1000,
    },
    fromBase: {
      kg: (v) => v, g: (v) => v * 1000, mg: (v) => v * 1000000,
      lb: (v) => v / 0.453592, oz: (v) => v / 0.0283495, ton: (v) => v / 1000,
    },
  },
  temperature: {
    units: ["celsius", "fahrenheit", "kelvin"],
    toBase: {
      celsius: (v) => v, fahrenheit: (v) => (v - 32) * 5 / 9, kelvin: (v) => v - 273.15,
    },
    fromBase: {
      celsius: (v) => v, fahrenheit: (v) => v * 9 / 5 + 32, kelvin: (v) => v + 273.15,
    },
  },
  area: {
    units: ["sqm", "sqkm", "sqft", "sqyd", "acre", "hectare", "pyeong"],
    toBase: {
      sqm: (v) => v, sqkm: (v) => v * 1000000, sqft: (v) => v * 0.092903,
      sqyd: (v) => v * 0.836127, acre: (v) => v * 4046.86, hectare: (v) => v * 10000, pyeong: (v) => v * 3.30579,
    },
    fromBase: {
      sqm: (v) => v, sqkm: (v) => v / 1000000, sqft: (v) => v / 0.092903,
      sqyd: (v) => v / 0.836127, acre: (v) => v / 4046.86, hectare: (v) => v / 10000, pyeong: (v) => v / 3.30579,
    },
  },
  volume: {
    units: ["l", "ml", "gal", "qt", "cup", "floz"],
    toBase: {
      l: (v) => v, ml: (v) => v / 1000,
      gal: (v) => v * 3.78541, qt: (v) => v * 0.946353, cup: (v) => v * 0.236588, floz: (v) => v * 0.0295735,
    },
    fromBase: {
      l: (v) => v, ml: (v) => v * 1000,
      gal: (v) => v / 3.78541, qt: (v) => v / 0.946353, cup: (v) => v / 0.236588, floz: (v) => v / 0.0295735,
    },
  },
};

export default function UnitConverterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.unitConverter;
  const relatedPosts = getPostsByTool("unit-converter");

  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("km");
  const [toUnit, setToUnit] = useState("mi");
  const [inputValue, setInputValue] = useState("");
  const [resultValue, setResultValue] = useState("");

  function convert(val?: string, cat?: UnitCategory, from?: string, to?: string) {
    const v = parseFloat(val ?? inputValue);
    const c = cat ?? category;
    const f = from ?? fromUnit;
    const tt = to ?? toUnit;
    if (isNaN(v)) { setResultValue(""); return; }
    const data = unitData[c];
    const baseValue = data.toBase[f](v);
    const result = data.fromBase[tt](baseValue);
    setResultValue(result.toLocaleString(undefined, { maximumFractionDigits: 6 }));
  }

  function handleCategoryChange(newCat: UnitCategory) {
    const units = unitData[newCat].units;
    setCategory(newCat);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setInputValue("");
    setResultValue("");
  }

  function handleSwap() {
    const oldFrom = fromUnit;
    const oldTo = toUnit;
    setFromUnit(oldTo);
    setToUnit(oldFrom);
    convert(inputValue, category, oldTo, oldFrom);
  }

  function handleInputChange(val: string) {
    setInputValue(val);
    if (val) convert(val);
    else setResultValue("");
  }

  function handleFromChange(unit: string) {
    setFromUnit(unit);
    if (inputValue) convert(inputValue, category, unit, toUnit);
  }

  function handleToChange(unit: string) {
    setToUnit(unit);
    if (inputValue) convert(inputValue, category, fromUnit, unit);
  }

  const categoryKeys: UnitCategory[] = ["length", "weight", "temperature", "area", "volume"];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="unit-converter" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t.categories[cat as keyof typeof t.categories]}
            </button>
          ))}
        </div>

        {/* Converter */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="text-sm font-medium block mb-2">{t.from}</label>
            <select
              value={fromUnit}
              onChange={(e) => handleFromChange(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {unitData[category].units.map((u) => (
                <option key={u} value={u}>{t.units[u as keyof typeof t.units]}</option>
              ))}
            </select>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSwap}
            className="self-center px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-lg"
            aria-label="Swap units"
          >
            ⇄
          </button>

          <div>
            <label className="text-sm font-medium block mb-2">{t.to}</label>
            <select
              value={toUnit}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {unitData[category].units.map((u) => (
                <option key={u} value={u}>{t.units[u as keyof typeof t.units]}</option>
              ))}
            </select>
            <div className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 min-h-[48px] text-lg font-semibold">
              {resultValue || "0"}
            </div>
          </div>
        </div>
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

      <ToolHowItWorks slug="unit-converter" locale={locale} />
      <ToolDisclaimer slug="unit-converter" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="unit-converter"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="unit-converter"
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
