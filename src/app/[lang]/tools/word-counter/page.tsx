"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
    </div>
  );
}

function getByteLength(str: string): number {
  let bytes = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdfff) { bytes += 4; i++; }
    else bytes += 3;
  }
  return bytes;
}

function getKeywordFrequency(text: string): { word: string; count: number }[] {
  const cleaned = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "");
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2);
  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function SnsLimitBar({ label, current, limit }: { label: string; current: number; limit: number }) {
  const pct = Math.min(100, (current / limit) * 100);
  const over = current > limit;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={over ? "text-red-500 font-medium" : "text-neutral-500"}>
          {current}/{limit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function WordCounterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.wordCounter;
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("word-counter");

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences =
      trimmed === "" ? 0 : trimmed.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs =
      trimmed === ""
        ? 0
        : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const bytes = getByteLength(text);
    const readingTimeMin = isKo
      ? Math.max(1, Math.ceil(charactersNoSpaces / 500))
      : Math.max(1, Math.ceil(words / 200));
    return { words, characters, charactersNoSpaces, sentences, paragraphs, bytes, readingTimeMin };
  }, [text, isKo]);

  const keywords = useMemo(() => getKeywordFrequency(text), [text]);

  function copyText() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const toolUrl = `https://quickfigure.net/${lang}/tools/word-counter`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title,
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: t.metaDescription,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faqItems.map((item: { q: string; a: string }) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>

        <ToolAbout slug="word-counter" locale={locale} />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label={t.characters} value={stats.characters} />
        <StatCard label={t.charactersNoSpaces} value={stats.charactersNoSpaces} />
        <StatCard label={t.words} value={stats.words} />
        <StatCard label={t.bytes} value={stats.bytes.toLocaleString()} />
        <StatCard label={t.sentences} value={stats.sentences} />
        <StatCard label={t.paragraphs} value={stats.paragraphs} />
        <StatCard label={t.readingTime} value={`${stats.readingTimeMin} ${t.min}`} />
      </div>

      {/* Text Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        className="w-full h-64 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans text-base leading-relaxed"
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mt-3">
        {text.length > 0 && (
          <>
            <button
              onClick={copyText}
              className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? t.copied : t.copy}
            </button>
            <button
              onClick={() => setText("")}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {t.clear}
            </button>
          </>
        )}
      </div>

      {/* SNS Character Limits */}
      <div className="mt-8 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
        <h2 className="text-sm font-medium">{t.snsLimits}</h2>
        <SnsLimitBar label={t.twitterX} current={stats.characters} limit={280} />
        <SnsLimitBar label={t.kakaoProflie} current={stats.characters} limit={60} />
        <SnsLimitBar label={t.instaBio} current={stats.characters} limit={150} />
      </div>

      {/* Keyword Frequency */}
      <div className="mt-8 rounded-lg border border-neutral-200 dark:border-neutral-700 p-5">
        <h2 className="text-sm font-medium mb-3">{t.keywordFrequency}</h2>
        {keywords.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left p-2 text-neutral-500 font-medium">#</th>
                <th className="text-left p-2 text-neutral-500 font-medium">{t.keyword}</th>
                <th className="text-right p-2 text-neutral-500 font-medium">{t.count}</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw, i) => (
                <tr key={kw.word} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-2 text-neutral-400">{i + 1}</td>
                  <td className="p-2 font-mono">{kw.word}</td>
                  <td className="p-2 text-right font-semibold">{kw.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-neutral-400">{t.noKeywords}</p>
        )}
      </div>

      <ToolHowItWorks slug="word-counter" locale={locale} />
      <ToolDisclaimer slug="word-counter" locale={locale} />

      <ShareButtons title={t.title} description={t.description} lang={lang} slug="word-counter" labels={dict.share} />
      <EmbedCodeButton slug="word-counter" lang={lang} labels={dict.embed} />

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.howToUseTitle}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {t.howToUseSteps.map((step: string, i: number) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faqItems.map((item: { q: string; a: string }, i: number) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium flex items-center justify-between">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{t.relatedToolsTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { slug: "case-converter", icon: "🔤", name: isKo ? "대소문자 변환" : "Case Converter" },
            { slug: "text-diff", icon: "📝", name: isKo ? "텍스트 비교" : "Text Diff" },
            { slug: "lorem-ipsum-generator", icon: "📄", name: isKo ? "Lorem Ipsum 생성기" : "Lorem Ipsum Generator" },
          ].map((tool) => (
            <Link key={tool.slug} href={`/${lang}/tools/${tool.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
              <span className="text-2xl">{tool.icon}</span>
              <h3 className="mt-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h3>
            </Link>
          ))}
        </div>
      </section>

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
