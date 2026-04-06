"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface CurrencyInfo {
  code: string;
  name: { en: string; ko: string };
  flag: string;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "KRW", name: { en: "South Korean Won", ko: "대한민국 원" }, flag: "🇰🇷" },
  { code: "USD", name: { en: "US Dollar", ko: "미국 달러" }, flag: "🇺🇸" },
  { code: "JPY", name: { en: "Japanese Yen", ko: "일본 엔" }, flag: "🇯🇵" },
  { code: "EUR", name: { en: "Euro", ko: "유로" }, flag: "🇪🇺" },
  { code: "CNY", name: { en: "Chinese Yuan", ko: "중국 위안" }, flag: "🇨🇳" },
  { code: "GBP", name: { en: "British Pound", ko: "영국 파운드" }, flag: "🇬🇧" },
  { code: "AUD", name: { en: "Australian Dollar", ko: "호주 달러" }, flag: "🇦🇺" },
  { code: "CAD", name: { en: "Canadian Dollar", ko: "캐나다 달러" }, flag: "🇨🇦" },
  { code: "THB", name: { en: "Thai Baht", ko: "태국 바트" }, flag: "🇹🇭" },
  { code: "VND", name: { en: "Vietnamese Dong", ko: "베트남 동" }, flag: "🇻🇳" },
  { code: "PHP", name: { en: "Philippine Peso", ko: "필리핀 페소" }, flag: "🇵🇭" },
  { code: "CHF", name: { en: "Swiss Franc", ko: "스위스 프랑" }, flag: "🇨🇭" },
  { code: "SGD", name: { en: "Singapore Dollar", ko: "싱가포르 달러" }, flag: "🇸🇬" },
  { code: "HKD", name: { en: "Hong Kong Dollar", ko: "홍콩 달러" }, flag: "🇭🇰" },
  { code: "SEK", name: { en: "Swedish Krona", ko: "스웨덴 크로나" }, flag: "🇸🇪" },
  { code: "NOK", name: { en: "Norwegian Krone", ko: "노르웨이 크로네" }, flag: "🇳🇴" },
  { code: "NZD", name: { en: "New Zealand Dollar", ko: "뉴질랜드 달러" }, flag: "🇳🇿" },
  { code: "MXN", name: { en: "Mexican Peso", ko: "멕시코 페소" }, flag: "🇲🇽" },
  { code: "INR", name: { en: "Indian Rupee", ko: "인도 루피" }, flag: "🇮🇳" },
  { code: "TWD", name: { en: "Taiwan Dollar", ko: "대만 달러" }, flag: "🇹🇼" },
  { code: "BRL", name: { en: "Brazilian Real", ko: "브라질 헤알" }, flag: "🇧🇷" },
  { code: "ZAR", name: { en: "South African Rand", ko: "남아공 란드" }, flag: "🇿🇦" },
  { code: "TRY", name: { en: "Turkish Lira", ko: "터키 리라" }, flag: "🇹🇷" },
  { code: "MYR", name: { en: "Malaysian Ringgit", ko: "말레이시아 링깃" }, flag: "🇲🇾" },
  { code: "IDR", name: { en: "Indonesian Rupiah", ko: "인도네시아 루피아" }, flag: "🇮🇩" },
  { code: "DKK", name: { en: "Danish Krone", ko: "덴마크 크로네" }, flag: "🇩🇰" },
  { code: "PLN", name: { en: "Polish Zloty", ko: "폴란드 즐로티" }, flag: "🇵🇱" },
  { code: "CZK", name: { en: "Czech Koruna", ko: "체코 코루나" }, flag: "🇨🇿" },
  { code: "HUF", name: { en: "Hungarian Forint", ko: "헝가리 포린트" }, flag: "🇭🇺" },
  { code: "ILS", name: { en: "Israeli Shekel", ko: "이스라엘 셰켈" }, flag: "🇮🇱" },
  { code: "KRW", name: { en: "South Korean Won", ko: "대한민국 원" }, flag: "🇰🇷" },
];

// Remove duplicate KRW at end
const UNIQUE_CURRENCIES = CURRENCIES.filter(
  (c, i, arr) => arr.findIndex((x) => x.code === c.code) === i
);

const POPULAR_CODES = ["KRW", "USD", "JPY", "EUR", "CNY", "GBP", "AUD", "CAD", "THB", "VND", "PHP"];

interface RecentPair {
  from: string;
  to: string;
}

interface RateCache {
  base: string;
  rates: Record<string, number>;
  date: string;
  fetchedAt: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 min

function getCurrencyInfo(code: string): CurrencyInfo {
  return (
    UNIQUE_CURRENCIES.find((c) => c.code === code) ?? {
      code,
      name: { en: code, ko: code },
      flag: "",
    }
  );
}

function formatNumber(n: number, code: string): string {
  const decimals = ["JPY", "KRW", "VND", "IDR", "HUF"].includes(code) ? 0 : 2;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatRate(n: number): string {
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

export default function CurrencyConverterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("currency-converter");

  const title = isKo
    ? "환율 계산기 - 실시간 환율 변환"
    : "Currency Converter - Real-Time Exchange Rates";
  const description = isKo
    ? "실시간 환율로 통화를 변환하세요. 달러, 엔화, 유로 등 30개+ 통화 지원. 100% 무료."
    : "Convert currencies with real-time exchange rates. 30+ currencies supported. USD, EUR, JPY, KRW and more. 100% free.";

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("KRW");
  const [amount, setAmount] = useState("1");
  const [rateCache, setRateCache] = useState<Record<string, RateCache>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentPairs, setRecentPairs] = useState<RecentPair[]>([]);
  const [compareCurrencies, setCompareCurrencies] = useState<string[]>(["KRW", "JPY", "EUR"]);

  // Load recent pairs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qf-currency-recent");
      if (stored) setRecentPairs(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecentPair = useCallback(
    (from: string, to: string) => {
      setRecentPairs((prev) => {
        const filtered = prev.filter(
          (p) => !(p.from === from && p.to === to)
        );
        const next = [{ from, to }, ...filtered].slice(0, 5);
        try {
          localStorage.setItem("qf-currency-recent", JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const fetchRates = useCallback(
    async (base: string): Promise<RateCache | null> => {
      const cached = rateCache[base];
      if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
        return cached;
      }

      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=${base}`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const cache: RateCache = {
          base: data.base,
          rates: { ...data.rates, [data.base]: 1 },
          date: data.date,
          fetchedAt: Date.now(),
        };
        setRateCache((prev) => ({ ...prev, [base]: cache }));
        return cache;
      } catch {
        setError(
          isKo
            ? "환율 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요."
            : "Could not fetch exchange rates. Please try again later."
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [rateCache, isKo]
  );

  // Fetch rates on mount and when base currency changes
  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentCache = rateCache[fromCurrency];
  const rate =
    currentCache?.rates?.[toCurrency] ?? null;
  const amountNum = parseFloat(amount) || 0;
  const result = rate !== null ? amountNum * rate : null;
  const reverseRate = rate !== null && rate !== 0 ? 1 / rate : null;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleConvert = () => {
    fetchRates(fromCurrency);
    saveRecentPair(fromCurrency, toCurrency);
  };

  // Multi-currency comparison
  const comparisonRates = useMemo(() => {
    if (!currentCache) return [];
    return compareCurrencies
      .filter((c) => c !== fromCurrency && currentCache.rates[c] !== undefined)
      .map((code) => ({
        code,
        info: getCurrencyInfo(code),
        rate: currentCache.rates[code],
        converted: amountNum * currentCache.rates[code],
      }));
  }, [currentCache, compareCurrencies, fromCurrency, amountNum]);

  const inputClass =
    "w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500";

  const faqItems = isKo
    ? [
        {
          q: "환율은 얼마나 자주 업데이트되나요?",
          a: "이 계산기는 유럽중앙은행(ECB) 데이터를 기반으로 매 영업일 업데이트되는 환율을 사용합니다. 실시간 시세와 소폭 차이가 있을 수 있으니, 대규모 거래 시에는 은행에 직접 확인하세요.",
        },
        {
          q: "환전 수수료는 포함되어 있나요?",
          a: "아니요, 여기 표시되는 환율은 중간 환율(기준 환율)입니다. 실제 환전 시에는 은행이나 환전소에서 수수료(스프레드)를 추가하므로 실제 환전 금액은 다를 수 있습니다.",
        },
        {
          q: "어떤 통화를 지원하나요?",
          a: "USD, EUR, JPY, KRW, GBP, AUD, CAD, CHF, CNY, THB, VND, PHP 등 30개 이상의 주요 통화를 지원합니다. ECB에서 제공하는 모든 통화를 사용할 수 있습니다.",
        },
        {
          q: "환율 알림을 받을 수 있나요?",
          a: "현재 이 도구에서는 환율 알림 기능을 제공하지 않습니다. 정기적으로 방문하여 확인하거나, 브라우저 북마크에 추가하여 빠르게 접근하세요.",
        },
        {
          q: "여러 통화를 동시에 비교할 수 있나요?",
          a: "네, 아래 '여러 통화 동시 비교' 섹션에서 최대 10개 통화의 환율을 한눈에 확인할 수 있습니다.",
        },
      ]
    : [
        {
          q: "How often are exchange rates updated?",
          a: "This calculator uses exchange rates from the European Central Bank (ECB), updated every business day. Rates may differ slightly from real-time market rates. For large transactions, verify with your bank.",
        },
        {
          q: "Are transaction fees included?",
          a: "No, the rates shown are mid-market (interbank) rates. Actual exchange amounts may differ due to bank spreads and fees.",
        },
        {
          q: "Which currencies are supported?",
          a: "We support 30+ major currencies including USD, EUR, JPY, KRW, GBP, AUD, CAD, CHF, CNY, THB, VND, PHP, and more. All currencies provided by the ECB are available.",
        },
        {
          q: "Can I get exchange rate alerts?",
          a: "This tool doesn't currently offer alerts. Bookmark this page for quick access and check rates regularly.",
        },
        {
          q: "Can I compare multiple currencies at once?",
          a: "Yes! Use the 'Multi-Currency Comparison' section below to see up to 10 currencies side by side.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="currency-converter" locale={locale} />
      </header>

      {/* Main Converter */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium block mb-1.5">
            {isKo ? "금액" : "Amount"}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
            min="0"
            className={inputClass}
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              {isKo ? "보내는 통화" : "From"}
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className={inputClass}
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name[locale]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="mb-1 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title={isKo ? "통화 교환" : "Swap currencies"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>

          <div>
            <label className="text-sm font-medium block mb-1.5">
              {isKo ? "받는 통화" : "To"}
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className={inputClass}
            >
              {UNIQUE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name[locale]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Currency Quick Select */}
        <div>
          <p className="text-xs text-neutral-400 mb-2">
            {isKo ? "인기 통화 빠른 선택 →" : "Quick select →"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CODES.filter((c) => c !== fromCurrency).map((code) => (
              <button
                key={code}
                onClick={() => setToCurrency(code)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                  toCurrency === code
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                }`}
              >
                {getCurrencyInfo(code).flag} {code}
              </button>
            ))}
          </div>
        </div>

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading}
          className="w-full py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {loading
            ? isKo
              ? "환율 조회 중..."
              : "Fetching rates..."
            : isKo
            ? "환율 계산하기"
            : "Convert"}
        </button>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Result */}
        {result !== null && rate !== null && !error && (
          <div className="mt-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 space-y-3">
            <div className="text-center">
              <p className="text-sm text-neutral-500">
                {getCurrencyInfo(fromCurrency).flag}{" "}
                {formatNumber(amountNum, fromCurrency)} {fromCurrency}
              </p>
              <p className="text-3xl font-bold mt-1">
                {getCurrencyInfo(toCurrency).flag}{" "}
                {formatNumber(result, toCurrency)}{" "}
                <span className="text-lg font-normal text-neutral-500">
                  {toCurrency}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 text-xs text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <span>
                1 {fromCurrency} = {formatRate(rate)} {toCurrency}
              </span>
              {reverseRate !== null && (
                <span>
                  1 {toCurrency} = {formatRate(reverseRate)} {fromCurrency}
                </span>
              )}
            </div>

            {currentCache?.date && (
              <p className="text-center text-xs text-neutral-400">
                {isKo
                  ? `기준: ${currentCache.date} ECB 환율`
                  : `Source: ECB rates as of ${currentCache.date}`}
              </p>
            )}

            {/* Copy button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const text = `${formatNumber(amountNum, fromCurrency)} ${fromCurrency} = ${formatNumber(
                    result,
                    toCurrency
                  )} ${toCurrency}`;
                  navigator.clipboard.writeText(text);
                }}
                className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {isKo ? "결과 복사" : "Copy Result"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {recentPairs.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium mb-2 text-neutral-500">
            {isKo ? "최근 검색" : "Recent Searches"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentPairs.map((pair, i) => (
              <button
                key={i}
                onClick={() => {
                  setFromCurrency(pair.from);
                  setToCurrency(pair.to);
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 transition-colors cursor-pointer"
              >
                {getCurrencyInfo(pair.from).flag} {pair.from} →{" "}
                {getCurrencyInfo(pair.to).flag} {pair.to}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Currency Comparison */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "여러 통화 동시 비교" : "Multi-Currency Comparison"}
        </h2>
        <p className="text-sm text-neutral-500 mb-3">
          {isKo
            ? `${formatNumber(amountNum, fromCurrency)} ${fromCurrency} 기준`
            : `Based on ${formatNumber(amountNum, fromCurrency)} ${fromCurrency}`}
        </p>

        {/* Toggle currencies */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {UNIQUE_CURRENCIES.filter((c) => c.code !== fromCurrency).map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCompareCurrencies((prev) =>
                  prev.includes(c.code)
                    ? prev.filter((x) => x !== c.code)
                    : prev.length < 10
                    ? [...prev, c.code]
                    : prev
                );
              }}
              className={`text-xs px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                compareCurrencies.includes(c.code)
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 text-neutral-500"
              }`}
            >
              {c.flag} {c.code}
            </button>
          ))}
        </div>

        {comparisonRates.length > 0 && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">
                    {isKo ? "통화" : "Currency"}
                  </th>
                  <th className="text-right px-4 py-2 font-medium">
                    {isKo ? "환율" : "Rate"}
                  </th>
                  <th className="text-right px-4 py-2 font-medium">
                    {isKo ? "변환 결과" : "Converted"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRates.map((item) => (
                  <tr
                    key={item.code}
                    className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                  >
                    <td className="px-4 py-2.5">
                      <span className="mr-1.5">{item.info.flag}</span>
                      <span className="font-medium">{item.code}</span>
                      <span className="text-neutral-400 ml-1.5 hidden sm:inline">
                        {item.info.name[locale]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-neutral-500">
                      {formatRate(item.rate)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {formatNumber(item.converted, item.code)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {comparisonRates.length === 0 && currentCache && (
          <p className="text-sm text-neutral-400 text-center py-4">
            {isKo
              ? "위에서 비교할 통화를 선택하세요."
              : "Select currencies above to compare."}
          </p>
        )}
      </section>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "변환할 금액을 입력하세요.",
                "'보내는 통화'와 '받는 통화'를 선택하세요. 화살표 버튼으로 쌍방향 전환 가능합니다.",
                "'환율 계산하기' 버튼을 클릭하면 최신 환율로 계산됩니다.",
                "아래 '여러 통화 동시 비교'에서 여러 통화의 환율을 한눈에 확인하세요.",
                "최근 검색한 통화쌍은 자동으로 저장되어 빠르게 재사용할 수 있습니다.",
              ]
            : [
                "Enter the amount you want to convert.",
                "Select 'From' and 'To' currencies. Use the swap button for bidirectional conversion.",
                "Click 'Convert' to calculate with the latest exchange rates.",
                "Use 'Multi-Currency Comparison' below to see rates for multiple currencies at once.",
                "Recently searched currency pairs are saved automatically for quick reuse.",
              ]
          ).map((step, i) => (
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            description,
            url: `https://www.quickfigure.net/${lang}/tools/currency-converter`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {dict.blog.quickTools}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/compound-interest-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.compoundInterest}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.compoundInterestDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/roi-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.roiCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.roiCalcDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/loan-calculator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.loanCalc}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.loanCalcDesc}
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

      <ToolHowItWorks slug="currency-converter" locale={locale} />
      <ToolDisclaimer slug="currency-converter" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="currency-converter"
        labels={dict.share}
      />
      <EmbedCodeButton slug="currency-converter" lang={lang} labels={dict.embed} />

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
