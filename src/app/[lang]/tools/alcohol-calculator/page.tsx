"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

type DrinkType = "soju" | "beer" | "wine" | "whisky" | "custom";

interface DrinkEntry {
  type: DrinkType;
  amount: number;
  customMl?: number;
  customAbv?: number;
}

const DRINK_PRESETS: Record<
  Exclude<DrinkType, "custom">,
  { ml: number; abv: number }
> = {
  soju: { ml: 360, abv: 17 },
  beer: { ml: 500, abv: 5 },
  wine: { ml: 150, abv: 12 },
  whisky: { ml: 45, abv: 40 },
};

function calcAlcoholGrams(ml: number, abv: number): number {
  return ml * (abv / 100) * 0.7894;
}

export default function AlcoholCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.alcoholCalc;
  const relatedPosts = getPostsByTool("alcohol-calculator");

  const [gender, setGender] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [drinks, setDrinks] = useState<DrinkEntry[]>([
    { type: "soju", amount: 1 },
  ]);
  const [drinkingHours, setDrinkingHours] = useState("");
  const [elapsedHours, setElapsedHours] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{
    bac: number;
    soberTime: number;
    legalTime: number;
    status: "safe" | "caution" | "danger" | "over";
  } | null>(null);

  function addDrink() {
    setDrinks([...drinks, { type: "beer", amount: 1 }]);
  }

  function removeDrink(index: number) {
    if (drinks.length <= 1) return;
    setDrinks(drinks.filter((_, i) => i !== index));
  }

  function updateDrink(index: number, updates: Partial<DrinkEntry>) {
    setDrinks(
      drinks.map((d, i) => (i === index ? { ...d, ...updates } : d))
    );
  }

  function calculate() {
    const w = parseFloat(weight);
    const elapsed = parseFloat(elapsedHours) || 0;
    if (!w || w <= 0) return;

    const genderCoeff = gender === "male" ? 0.68 : 0.55;

    let totalAlcoholGrams = 0;
    for (const drink of drinks) {
      let ml: number;
      let abv: number;
      if (drink.type === "custom") {
        ml = drink.customMl || 0;
        abv = drink.customAbv || 0;
      } else {
        const preset = DRINK_PRESETS[drink.type];
        ml = preset.ml;
        abv = preset.abv;
      }
      totalAlcoholGrams += calcAlcoholGrams(ml * drink.amount, abv);
    }

    // Widmark formula
    let bac =
      (totalAlcoholGrams * 0.7894) / (w * genderCoeff) -
      elapsed * 0.015;
    if (bac < 0) bac = 0;

    // Time until BAC reaches 0
    const soberTime = bac > 0 ? bac / 0.015 : 0;

    // Time until BAC < 0.03% (Korean legal limit)
    const legalTime = bac > 0.03 ? (bac - 0.03) / 0.015 : 0;

    let status: "safe" | "caution" | "danger" | "over";
    if (bac === 0) status = "safe";
    else if (bac < 0.03) status = "caution";
    else if (bac < 0.08) status = "danger";
    else status = "over";

    setResult({ bac, soberTime, legalTime, status });
  }

  const statusColor = {
    safe: "text-green-600 dark:text-green-400",
    caution: "text-yellow-600 dark:text-yellow-400",
    danger: "text-orange-600 dark:text-orange-400",
    over: "text-red-600 dark:text-red-400",
  };

  const statusBg = {
    safe: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    caution:
      "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    danger:
      "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    over: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  };

  const drinkLabel = (type: DrinkType) => {
    const labels: Record<DrinkType, string> = {
      soju: t.soju,
      beer: t.beer,
      wine: t.wine,
      whisky: t.whisky,
      custom: t.custom,
    };
    return labels[type];
  };

  const drinkUnit = (type: DrinkType) => {
    const units: Record<DrinkType, string> = {
      soju: t.bottles,
      beer: t.glasses,
      wine: t.glasses,
      whisky: t.shots,
      custom: t.glasses,
    };
    return units[type];
  };

  const fmtTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}${t.minutes}`;
    if (m === 0) return `${h}${t.hours}`;
    return `${h}${t.hours} ${m}${t.minutes}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t.description}
        </p>
      </header>

      {/* Warning disclaimer */}
      <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
          {t.disclaimer}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Gender selector */}
        <div>
          <label className="text-sm font-medium block mb-2">{t.gender}</label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setGender("male");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                gender === "male"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t.male}
            </button>
            <button
              onClick={() => {
                setGender("female");
                setResult(null);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                gender === "female"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {t.female}
            </button>
          </div>
        </div>

        {/* Weight input */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.weight}
          </label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              kg
            </span>
          </div>
        </div>

        {/* Drink entries */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.drinks}
          </label>
          <div className="space-y-3">
            {drinks.map((drink, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 p-3"
              >
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                    {t.drinkType}
                  </label>
                  <select
                    value={drink.type}
                    onChange={(e) =>
                      updateDrink(index, {
                        type: e.target.value as DrinkType,
                      })
                    }
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="soju">{t.soju} (360ml, 17%)</option>
                    <option value="beer">{t.beer} (500ml, 5%)</option>
                    <option value="wine">{t.wine} (150ml, 12%)</option>
                    <option value="whisky">{t.whisky} (45ml, 40%)</option>
                    <option value="custom">{t.custom}</option>
                  </select>
                </div>

                <div className="w-24">
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                    {t.drinkAmount} ({drinkUnit(drink.type)})
                  </label>
                  <input
                    type="number"
                    value={drink.amount}
                    onChange={(e) =>
                      updateDrink(index, {
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.5"
                    className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {drink.type === "custom" && (
                  <>
                    <div className="w-24">
                      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                        ml
                      </label>
                      <input
                        type="number"
                        value={drink.customMl || ""}
                        onChange={(e) =>
                          updateDrink(index, {
                            customMl: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="500"
                        className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                        ABV %
                      </label>
                      <input
                        type="number"
                        value={drink.customAbv || ""}
                        onChange={(e) =>
                          updateDrink(index, {
                            customAbv: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="5"
                        className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {drinks.length > 1 && (
                  <button
                    onClick={() => removeDrink(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                    aria-label="Remove drink"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addDrink}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            + {t.addDrink}
          </button>
        </div>

        {/* Drinking duration */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.drinkingDuration}
          </label>
          <div className="relative">
            <input
              type="number"
              value={drinkingHours}
              onChange={(e) => setDrinkingHours(e.target.value)}
              placeholder="2"
              min="0"
              step="0.5"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              {t.hours}
            </span>
          </div>
        </div>

        {/* Elapsed time */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.elapsedTime}
          </label>
          <div className="relative">
            <input
              type="number"
              value={elapsedHours}
              onChange={(e) => setElapsedHours(e.target.value)}
              placeholder="3"
              min="0"
              step="0.5"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              {t.hours}
            </span>
          </div>
        </div>

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
              {/* BAC value */}
              <div
                className={`rounded-lg border p-6 text-center ${statusBg[result.status]}`}
              >
                <p
                  className={`text-4xl font-bold tracking-tight ${statusColor[result.status]}`}
                >
                  {result.bac.toFixed(4)}%
                </p>
                <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-400">
                  {t.currentBAC}
                </p>
                <p
                  className={`text-sm font-medium mt-2 ${statusColor[result.status]}`}
                >
                  {{ safe: t.statusSafe, caution: t.statusCaution, danger: t.statusDanger, over: t.statusOver }[result.status]}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight">
                    {result.bac >= 0.03 ? "⚠️" : "✅"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.legalLimit} (0.03%)
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {result.bac >= 0.03 ? t.statusDanger : t.alreadyLegal}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    {fmtTime(result.soberTime)}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.soberTime}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                  <p className="text-2xl font-semibold tracking-tight text-orange-600 dark:text-orange-400">
                    {result.legalTime > 0 ? fmtTime(result.legalTime) : "-"}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {t.legalTime}
                  </p>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.currentBAC}
                      </td>
                      <td className="p-3 text-right font-medium">
                        {result.bac.toFixed(4)}%
                      </td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.legalLimit}
                      </td>
                      <td className="p-3 text-right">0.03%</td>
                    </tr>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.soberTime}
                      </td>
                      <td className="p-3 text-right">
                        {fmtTime(result.soberTime)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">
                        {t.legalTime}
                      </td>
                      <td className="p-3 text-right">
                        {result.legalTime > 0
                          ? fmtTime(result.legalTime)
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={t.title}
              slug="alcohol-calculator"
              labels={dict.saveImage}
            />
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
        </div>
      </section>

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="alcohol-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="alcohol-calculator"
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
