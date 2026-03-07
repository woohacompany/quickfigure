"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

const SYMBOL_CATEGORIES = {
  hearts: ["\u2665", "\u2666", "\u2764", "\uD83D\uDC97", "\uD83D\uDC98", "\uD83D\uDC99", "\uD83D\uDC9A", "\uD83D\uDC9B", "\uD83D\uDC9C", "\uD83D\uDC9D", "\uD83D\uDC9E", "\uD83D\uDC9F", "\uD83D\uDC93", "\uD83D\uDC94", "\uD83D\uDC95", "\uD83D\uDC96", "\u2763", "\u2661", "\u2765", "\u2766"],
  arrows: ["\u2190", "\u2191", "\u2192", "\u2193", "\u2194", "\u2195", "\u2196", "\u2197", "\u2198", "\u2199", "\u21D0", "\u21D1", "\u21D2", "\u21D3", "\u21D4", "\u21D5", "\u27A1", "\u2B05", "\u2B06", "\u2B07", "\u21AA", "\u21A9", "\u27F3", "\u27F2"],
  stars: ["\u2605", "\u2606", "\u2729", "\u2730", "\u272A", "\u2736", "\u2734", "\u2737", "\u2738", "\u2739", "\u272F", "\u2742", "\u2743", "\u2749", "\u274B", "\u2726", "\u2727", "\u269D", "\u2728", "\u2B50"],
  currency: ["$", "\u20AC", "\u00A3", "\u00A5", "\u20A9", "\u20B9", "\u20BD", "\u20BA", "\u20AB", "\u20B1", "\u20BF", "\u00A2", "\u20A3", "\u20A4", "\u20A7", "\u20B4", "\u20B2", "\u20B3", "\u20B5", "\u20B8"],
  math: ["\u00B1", "\u00D7", "\u00F7", "\u2260", "\u2264", "\u2265", "\u221E", "\u221A", "\u03C0", "\u2211", "\u222B", "\u2202", "\u0394", "\u2248", "\u2261", "\u2282", "\u2283", "\u2229", "\u222A", "\u2234", "\u2235", "\u00B2", "\u00B3", "\u2074", "\u00BD", "\u2153", "\u00BC", "\u00BE", "\u2030"],
  music: ["\u266A", "\u266B", "\u266C", "\u266D", "\u266E", "\u266F", "\u25B6", "\u23F8", "\u23F9", "\u23EA", "\u23E9", "\u23EF", "\u23F4", "\u23F5", "\u23F6", "\u23F7", "\u2669"],
  punctuation: ["\u00AB", "\u00BB", "\u2018", "\u2019", "\u201C", "\u201D", "\u2026", "\u2013", "\u2014", "\u2022", "\u00A7", "\u00B6", "\u00A9", "\u00AE", "\u2122", "\u2020", "\u2021", "\u203B", "\u3010", "\u3011", "\u300A", "\u300B", "\u3008", "\u3009"],
  emoji: ["\uD83D\uDE00", "\uD83D\uDE02", "\uD83D\uDE0D", "\uD83E\uDD23", "\uD83D\uDE0E", "\uD83E\uDD14", "\uD83D\uDE31", "\uD83D\uDE4F", "\uD83D\uDCAF", "\uD83D\uDD25", "\uD83C\uDF89", "\uD83C\uDF1F", "\uD83D\uDCA1", "\uD83D\uDCE2", "\u2705", "\u274C", "\u26A0\uFE0F", "\uD83D\uDC4D", "\uD83D\uDC4E", "\uD83D\uDCAA"],
  hands: ["\uD83D\uDC4B", "\u270B", "\uD83D\uDD90\uFE0F", "\uD83E\uDD1A", "\u270C\uFE0F", "\uD83E\uDD1E", "\uD83E\uDD1F", "\uD83E\uDD18", "\uD83D\uDC4C", "\uD83E\uDD0C", "\uD83E\uDD0F", "\u261D\uFE0F", "\uD83D\uDC46", "\uD83D\uDC47", "\uD83D\uDC48", "\uD83D\uDC49", "\uD83D\uDC4A", "\uD83D\uDC4F", "\uD83D\uDE4C", "\uD83E\uDD32"],
  weather: ["\u2600\uFE0F", "\uD83C\uDF24\uFE0F", "\u26C5", "\uD83C\uDF25\uFE0F", "\uD83C\uDF26\uFE0F", "\uD83C\uDF27\uFE0F", "\u26C8\uFE0F", "\uD83C\uDF28\uFE0F", "\u2744\uFE0F", "\uD83C\uDF2C\uFE0F", "\uD83C\uDF08", "\uD83C\uDF19", "\u2B50", "\uD83C\uDF3B", "\uD83C\uDF3A", "\uD83C\uDF39", "\uD83C\uDF3F", "\uD83C\uDF43", "\uD83C\uDF42", "\uD83C\uDF41"],
} as const;

type CategoryKey = keyof typeof SYMBOL_CATEGORIES;

export default function SymbolCopyPastePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.symbolCopyPaste;
  const relatedPosts = getPostsByTool("symbol-copy-paste");

  const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const categoryKeys: (CategoryKey | "all")[] = ["all", "hearts", "arrows", "stars", "currency", "math", "music", "punctuation", "emoji", "hands", "weather"];

  const categoryLabel = (key: CategoryKey | "all") => {
    if (key === "all") return t.all;
    return t[key as keyof typeof t] || key;
  };

  function copySymbol(symbol: string) {
    navigator.clipboard.writeText(symbol);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  }

  const getSymbols = (): string[] => {
    if (activeCategory === "all") {
      return Object.values(SYMBOL_CATEGORIES).flat();
    }
    return [...SYMBOL_CATEGORIES[activeCategory]];
  };

  const symbols = getSymbols().filter((s) => !search || s.includes(search));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="space-y-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                activeCategory === key
                  ? "bg-foreground text-background border-foreground"
                  : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
            {symbols.map((symbol, i) => (
              <button
                key={`${symbol}-${i}`}
                onClick={() => copySymbol(symbol)}
                title={t.clickToCopy}
                className={`w-full aspect-square flex items-center justify-center text-xl rounded-md border transition-all cursor-pointer hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700 ${
                  copiedSymbol === symbol
                    ? "bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-700"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          {symbols.length === 0 && (
            <p className="text-center text-neutral-400 py-8">No symbols found.</p>
          )}
        </div>

        {copiedSymbol && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium shadow-lg z-50">
            {t.copied} {copiedSymbol}
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
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
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
