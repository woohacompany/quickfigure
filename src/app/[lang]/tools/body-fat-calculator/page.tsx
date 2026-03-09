"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";
import SaveResultImage from "@/components/SaveResultImage";

type Gender = "male" | "female";
type UnitSystem = "metric" | "imperial";

interface Result {
  bodyFatPercent: number;
  category: string;
  categoryColor: string;
}

const MALE_CATEGORIES = [
  { key: "underfat", min: 0, max: 6, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300" },
  { key: "healthy", min: 6, max: 24, color: "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300" },
  { key: "overfat", min: 24, max: 31, color: "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300" },
  { key: "obese", min: 31, max: Infinity, color: "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300" },
];

const FEMALE_CATEGORIES = [
  { key: "underfat", min: 0, max: 16, color: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300" },
  { key: "healthy", min: 16, max: 31, color: "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300" },
  { key: "overfat", min: 31, max: 39, color: "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300" },
  { key: "obese", min: 39, max: Infinity, color: "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300" },
];

export default function BodyFatCalculatorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("body-fat-calculator");
  const isKo = locale === "ko";

  const title = isKo
    ? "체지방률 계산기 - 체지방 측정 및 비만도 확인"
    : "Body Fat Calculator - US Navy Method Body Fat Percentage";
  const description = isKo
    ? "성별, 키, 허리/목/엉덩이 둘레를 입력하면 미 해군 공식으로 체지방률을 계산합니다."
    : "Calculate your body fat percentage using the US Navy method. Enter measurements to get your body fat % and health category.";

  const [gender, setGender] = useState<Gender>("male");
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [height, setHeight] = useState("");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function toCm(value: number): number {
    return unit === "imperial" ? value * 2.54 : value;
  }

  function getCategoryLabel(key: string): string {
    const labels: Record<string, { en: string; ko: string }> = {
      underfat: { en: "Underfat", ko: "저체지방" },
      healthy: { en: "Healthy", ko: "정상" },
      overfat: { en: "Overfat", ko: "과체지방" },
      obese: { en: "Obese", ko: "비만" },
    };
    return isKo ? labels[key].ko : labels[key].en;
  }

  function getCategoryRange(key: string): string {
    const categories = gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;
    const cat = categories.find((c) => c.key === key);
    if (!cat) return "";
    if (cat.max === Infinity) return `>${cat.min}%`;
    if (cat.min === 0) return `<${cat.max}%`;
    return `${cat.min}–${cat.max}%`;
  }

  function calculate() {
    const h = toCm(parseFloat(height) || 0);
    const w = toCm(parseFloat(waist) || 0);
    const n = toCm(parseFloat(neck) || 0);
    const hp = toCm(parseFloat(hip) || 0);

    if (h <= 0 || w <= 0 || n <= 0) return;
    if (gender === "female" && hp <= 0) return;
    if (w <= n) return;

    let bodyFat: number;
    if (gender === "male") {
      bodyFat =
        495 /
          (1.0324 -
            0.19077 * Math.log10(w - n) +
            0.15456 * Math.log10(h)) -
        450;
    } else {
      if (w + hp - n <= 0) return;
      bodyFat =
        495 /
          (1.29579 -
            0.35004 * Math.log10(w + hp - n) +
            0.221 * Math.log10(h)) -
        450;
    }

    if (bodyFat < 0 || bodyFat > 80 || isNaN(bodyFat)) return;

    const categories = gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;
    let categoryKey = "obese";
    let categoryColor = categories[categories.length - 1].color;

    for (const cat of categories) {
      if (bodyFat < cat.max) {
        categoryKey = cat.key;
        categoryColor = cat.color;
        break;
      }
    }

    setResult({
      bodyFatPercent: bodyFat,
      category: categoryKey,
      categoryColor,
    });
  }

  const unitLabel = unit === "metric" ? "cm" : "in";

  const faqItems = isKo
    ? [
        {
          q: "미 해군 체지방 계산법이란 무엇인가요?",
          a: "미 해군(US Navy) 체지방 계산법은 신체 둘레 측정값(허리, 목, 엉덩이)과 키를 이용하여 체지방률을 추정하는 공식입니다. 캘리퍼나 고가 장비 없이도 비교적 정확한 체지방률을 측정할 수 있어 널리 사용됩니다.",
        },
        {
          q: "허리둘레는 어디서 측정하나요?",
          a: "허리둘레는 배꼽 높이에서 가장 넓은 부분을 측정합니다. 줄자를 피부에 밀착시키되 살이 눌리지 않도록 하고, 숨을 내쉰 상태에서 측정하세요. 남성은 배꼽 높이, 여성은 가장 잘록한 부분에서 측정합니다.",
        },
        {
          q: "건강한 체지방률은 얼마인가요?",
          a: "건강한 체지방률은 성별에 따라 다릅니다. 남성은 6~24%, 여성은 16~31%가 정상 범위입니다. 필수 체지방은 남성 2~5%, 여성 10~13%이며, 이 이하로 떨어지면 건강에 문제가 생길 수 있습니다.",
        },
        {
          q: "이 계산기의 정확도는 어느 정도인가요?",
          a: "미 해군 공식은 일반적으로 DEXA 스캔 대비 ±3~4% 오차 범위 내에서 정확합니다. 체형이 극단적이거나 근육량이 매우 많은 경우 오차가 커질 수 있습니다. 정밀한 측정이 필요하다면 전문 기관에서 DEXA 스캔이나 수중 체중 측정을 권장합니다.",
        },
      ]
    : [
        {
          q: "What is the US Navy body fat calculation method?",
          a: "The US Navy body fat formula estimates body fat percentage using circumference measurements (waist, neck, hip) and height. It provides a reasonably accurate estimate without expensive equipment like calipers or DEXA scanners, making it widely used for fitness assessments.",
        },
        {
          q: "Where should I measure my waist circumference?",
          a: "Measure your waist at the widest point around the abdomen, typically at navel level. Keep the tape snug but not compressing the skin, and measure while exhaling naturally. For men, measure at navel height; for women, measure at the narrowest point of the torso.",
        },
        {
          q: "What is a healthy body fat percentage?",
          a: "Healthy body fat ranges differ by gender. For men, 6–24% is considered healthy, while for women, 16–31% is normal. Essential fat is 2–5% for men and 10–13% for women — dropping below these levels can cause health issues.",
        },
        {
          q: "How accurate is this calculator?",
          a: "The US Navy formula is generally accurate within ±3–4% compared to DEXA scans. Accuracy may decrease for individuals with extreme body types or very high muscle mass. For precise measurements, consider professional DEXA or hydrostatic weighing.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "성별(남성/여성)을 선택하세요.",
        "단위(cm/inches)를 선택하세요.",
        "키, 허리둘레, 목둘레를 입력하세요. 여성의 경우 엉덩이둘레도 입력합니다.",
        "계산하기 버튼을 누르세요.",
        "체지방률과 건강 등급(저체지방/정상/과체지방/비만)을 확인하세요.",
      ]
    : [
        "Select your gender (male or female).",
        "Choose your preferred unit system (metric cm or imperial inches).",
        "Enter your height, waist circumference, and neck circumference. For females, also enter hip circumference.",
        "Click the Calculate button.",
        "View your body fat percentage and health category (underfat, healthy, overfat, or obese).",
      ];

  const categories = gender === "male" ? MALE_CATEGORIES : FEMALE_CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "체지방률 계산기" : "Body Fat Calculator"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Gender Selection */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "성별" : "Gender"}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => { setGender("male"); setResult(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                gender === "male"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "남성" : "Male"}
            </button>
            <button
              onClick={() => { setGender("female"); setResult(null); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                gender === "female"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "여성" : "Female"}
            </button>
          </div>
        </div>

        {/* Unit Toggle */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "단위" : "Unit"}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setUnit("metric")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                unit === "metric"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "센티미터 (cm)" : "Metric (cm)"}
            </button>
            <button
              onClick={() => setUnit("imperial")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                unit === "imperial"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {isKo ? "인치 (in)" : "Imperial (in)"}
            </button>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? `키 (${unitLabel})` : `Height (${unitLabel})`}
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unit === "metric" ? "170" : "67"}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Waist Circumference */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? `허리둘레 (${unitLabel})` : `Waist Circumference (${unitLabel})`}
          </label>
          <input
            type="number"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder={unit === "metric" ? "85" : "33"}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Neck Circumference */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? `목둘레 (${unitLabel})` : `Neck Circumference (${unitLabel})`}
          </label>
          <input
            type="number"
            value={neck}
            onChange={(e) => setNeck(e.target.value)}
            placeholder={unit === "metric" ? "37" : "15"}
            className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hip Circumference (female only) */}
        {gender === "female" && (
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? `엉덩이둘레 (${unitLabel})` : `Hip Circumference (${unitLabel})`}
            </label>
            <input
              type="number"
              value={hip}
              onChange={(e) => setHip(e.target.value)}
              placeholder={unit === "metric" ? "95" : "37"}
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

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
                    {result.bodyFatPercent.toFixed(1)}%
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {isKo ? "체지방률" : "Body Fat Percentage"}
                  </p>
                </div>
                <div className={`rounded-lg border p-4 ${result.categoryColor}`}>
                  <p className="text-2xl font-semibold tracking-tight">
                    {getCategoryLabel(result.category)}
                  </p>
                  <p className="text-sm mt-1 opacity-80">
                    {isKo ? "건강 등급" : "Health Category"}
                  </p>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {isKo
                    ? `체지방률 범위 (${gender === "male" ? "남성" : "여성"})`
                    : `Body Fat Ranges (${gender === "male" ? "Male" : "Female"})`}
                </h3>
                {categories.map((cat) => {
                  const isActive = result.category === cat.key;
                  return (
                    <div
                      key={cat.key}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        isActive
                          ? cat.color + " ring-2 ring-blue-500"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "" : "text-neutral-500 dark:text-neutral-400"
                        }`}
                      >
                        {getCategoryLabel(cat.key)}
                      </span>
                      <span
                        className={`text-sm ${
                          isActive ? "" : "text-neutral-400 dark:text-neutral-500"
                        }`}
                      >
                        {getCategoryRange(cat.key)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <SaveResultImage
              targetRef={resultRef}
              toolName={isKo ? "체지방률 계산기" : "Body Fat Calculator"}
              slug="body-fat-calculator"
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

      {/* Share & Embed */}
      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="body-fat-calculator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="body-fat-calculator"
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
