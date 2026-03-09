"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface HistoryEntry {
  numbers: number[];
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
  timestamp: Date;
}

interface LotteryPreset {
  name: string;
  min: number;
  max: number;
  count: number;
  allowDuplicates: boolean;
}

export default function RandomNumberGeneratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("random-number-generator");
  const isKo = locale === "ko";

  const title = isKo
    ? "랜덤 숫자 생성기 - 난수 생성, 로또 번호 추첨"
    : "Random Number Generator - Generate Random Numbers & Lottery";
  const description = isKo
    ? "최소/최대 범위를 설정하고 랜덤 숫자를 생성하세요. 로또 번호 추첨, 중복 허용/불허 옵션 지원."
    : "Generate random numbers with custom range. Lottery number presets, duplicate control, and instant results.";

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const lotteryPresets: LotteryPreset[] = isKo
    ? [
        { name: "로또 6/45", min: 1, max: 45, count: 6, allowDuplicates: false },
        { name: "US Powerball", min: 1, max: 69, count: 5, allowDuplicates: false },
        { name: "US Mega Millions", min: 1, max: 70, count: 5, allowDuplicates: false },
        { name: "EuroMillions", min: 1, max: 50, count: 5, allowDuplicates: false },
      ]
    : [
        { name: "Korean Lotto 6/45", min: 1, max: 45, count: 6, allowDuplicates: false },
        { name: "US Powerball", min: 1, max: 69, count: 5, allowDuplicates: false },
        { name: "US Mega Millions", min: 1, max: 70, count: 5, allowDuplicates: false },
        { name: "EuroMillions", min: 1, max: 50, count: 5, allowDuplicates: false },
      ];

  function applyPreset(preset: LotteryPreset) {
    setMin(String(preset.min));
    setMax(String(preset.max));
    setCount(String(preset.count));
    setAllowDuplicates(preset.allowDuplicates);
    setError("");
  }

  function generate() {
    setError("");
    setCopied(false);

    const minVal = parseInt(min, 10);
    const maxVal = parseInt(max, 10);
    const countVal = parseInt(count, 10);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) {
      setError(isKo ? "모든 값을 올바르게 입력해주세요." : "Please enter valid numbers.");
      return;
    }

    if (minVal > maxVal) {
      setError(isKo ? "최소값이 최대값보다 클 수 없습니다." : "Min cannot be greater than Max.");
      return;
    }

    if (countVal < 1 || countVal > 100) {
      setError(isKo ? "개수는 1~100 사이여야 합니다." : "Count must be between 1 and 100.");
      return;
    }

    const range = maxVal - minVal + 1;

    if (!allowDuplicates && countVal > range) {
      setError(
        isKo
          ? `중복 불허 시 최대 ${range}개까지만 생성 가능합니다.`
          : `Without duplicates, you can only generate up to ${range} numbers in this range.`
      );
      return;
    }

    let nums: number[];

    if (allowDuplicates) {
      nums = Array.from({ length: countVal }, () =>
        Math.floor(Math.random() * range) + minVal
      );
    } else {
      // Fisher-Yates shuffle for unique numbers
      const pool = Array.from({ length: range }, (_, i) => minVal + i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums = pool.slice(0, countVal).sort((a, b) => a - b);
    }

    setResults(nums);
    setHistory((prev) => [
      {
        numbers: nums,
        min: minVal,
        max: maxVal,
        count: countVal,
        allowDuplicates,
        timestamp: new Date(),
      },
      ...prev.slice(0, 19),
    ]);
  }

  function copyResults() {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join(", ")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setMin("1");
    setMax("100");
    setCount("1");
    setAllowDuplicates(true);
    setResults([]);
    setError("");
    setCopied(false);
  }

  function clearHistory() {
    setHistory([]);
  }

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const faqItems = isKo
    ? [
        {
          q: "랜덤 숫자 생성은 어떻게 작동하나요?",
          a: "이 도구는 자바스크립트의 Math.random() 함수를 사용하여 지정된 범위 내에서 의사 난수(pseudo-random number)를 생성합니다. 중복 불허 옵션 선택 시 Fisher-Yates 셔플 알고리즘을 사용하여 고르게 분포된 고유한 숫자를 생성합니다.",
        },
        {
          q: "로또 번호 추첨에 사용할 수 있나요?",
          a: "네, 로또 프리셋 버튼을 사용하면 한국 로또 6/45, US Powerball, Mega Millions, EuroMillions 등의 번호를 빠르게 생성할 수 있습니다. 단, 이 도구는 오락 목적이며 당첨을 보장하지 않습니다.",
        },
        {
          q: "중복 허용과 불허의 차이는?",
          a: "중복 허용 시 같은 숫자가 여러 번 나올 수 있습니다. 중복 불허 시 모든 생성된 숫자가 고유합니다. 로또 번호처럼 고유한 숫자가 필요한 경우 중복 불허를 선택하세요.",
        },
        {
          q: "한 번에 몇 개까지 생성할 수 있나요?",
          a: "한 번에 최대 100개의 랜덤 숫자를 생성할 수 있습니다. 중복 불허 모드에서는 범위 내 가능한 숫자 수를 초과할 수 없습니다. 예: 1~45 범위에서 중복 불허 시 최대 45개까지 가능합니다.",
        },
      ]
    : [
        {
          q: "How does random number generation work?",
          a: "This tool uses JavaScript's Math.random() function to generate pseudo-random numbers within your specified range. When duplicates are disallowed, it uses the Fisher-Yates shuffle algorithm to ensure evenly distributed unique numbers.",
        },
        {
          q: "Can I use this for lottery numbers?",
          a: "Yes! Use the lottery preset buttons to quickly generate numbers for Korean Lotto 6/45, US Powerball, Mega Millions, or EuroMillions. However, this tool is for entertainment purposes only and does not guarantee winning numbers.",
        },
        {
          q: "What is the difference between allowing and disallowing duplicates?",
          a: "When duplicates are allowed, the same number can appear multiple times. When disallowed, every generated number is unique. Choose 'no duplicates' for lottery-style picks where each number must be different.",
        },
        {
          q: "How many numbers can I generate at once?",
          a: "You can generate up to 100 random numbers at a time. In no-duplicates mode, the count cannot exceed the range size. For example, with a range of 1-45, you can generate at most 45 unique numbers.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "최소값과 최대값을 입력하여 숫자 범위를 설정하세요.",
        "생성할 숫자의 개수를 입력하세요 (1~100개).",
        "중복 허용 여부를 선택하세요. 로또 번호처럼 고유한 숫자가 필요하면 중복 불허를 선택합니다.",
        "로또 프리셋 버튼을 사용하면 인기 로또의 설정이 자동으로 적용됩니다.",
        "'생성하기' 버튼을 클릭하면 결과가 즉시 표시됩니다. '복사' 버튼으로 결과를 클립보드에 복사할 수 있습니다.",
      ]
    : [
        "Enter the minimum and maximum values to define your number range.",
        "Set how many numbers you want to generate (1-100).",
        "Choose whether to allow duplicates. For lottery-style picks, disable duplicates.",
        "Use lottery preset buttons to auto-fill settings for popular lotteries.",
        "Click 'Generate' to get your results instantly. Use the 'Copy' button to copy results to your clipboard.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Lottery Presets */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "로또 프리셋" : "Lottery Presets"}
          </label>
          <div className="flex flex-wrap gap-2">
            {lotteryPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Min / Max */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "최소값" : "Min"}
            </label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="1"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "최대값" : "Max"}
            </label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="100"
              className={inputClass}
            />
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "생성 개수" : "Count"}
            <span className="text-neutral-400 text-xs ml-2">(1-100)</span>
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={1}
            max={100}
            placeholder="1"
            className={inputClass}
          />
        </div>

        {/* Allow Duplicates Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">
            {isKo ? "중복 허용" : "Allow Duplicates"}
          </span>
        </label>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generate}
            className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {isKo ? "생성하기" : "Generate"}
          </button>
          <button
            onClick={reset}
            className="px-5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            {isKo ? "초기화" : "Reset"}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div ref={resultRef} className="space-y-4 mt-4">
            <div className="rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 p-5 text-center">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                {isKo ? "생성된 숫자" : "Generated Numbers"}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {results.map((num, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg"
                  >
                    {num}
                  </span>
                ))}
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-3">
                {results.join(", ")}
              </p>
            </div>

            <button
              onClick={copyResults}
              className="w-full px-5 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {copied
                ? isKo
                  ? "복사됨!"
                  : "Copied!"
                : isKo
                ? "결과 복사"
                : "Copy Results"}
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                {isKo ? "생성 기록" : "History"}
              </h3>
              <button
                onClick={clearHistory}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {isKo ? "기록 삭제" : "Clear"}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-400">
                      {entry.min}~{entry.max} | {entry.count}
                      {isKo ? "개" : " nums"}{" "}
                      | {entry.allowDuplicates
                        ? isKo
                          ? "중복 허용"
                          : "Dup"
                        : isKo
                        ? "중복 불허"
                        : "No dup"}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {entry.numbers.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step, i) => (
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

      {/* JSON-LD FAQPage */}
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
            href={`/${lang}/tools/password-generator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.passwordGenerator}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.passwordGeneratorDesc}
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
        title={title}
        description={description}
        lang={lang}
        slug="random-number-generator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="random-number-generator"
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
