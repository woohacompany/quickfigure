"use client";

import { useState, useMemo } from "react";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { use } from "react";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
    </div>
  );
}

export default function WordCounterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const t = getDictionary((isValidLocale(lang) ? lang : "en") as Locale).wordCounter;

  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences =
      trimmed === "" ? 0 : trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs =
      trimmed === ""
        ? 0
        : trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const readingTimeMin = Math.ceil(words / 200);
    return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTimeMin };
  }, [text]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      {/* Ad placeholder */}
      {/* <div className="mb-6"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label={t.words} value={stats.words} />
        <StatCard label={t.characters} value={stats.characters} />
        <StatCard label={t.charactersNoSpaces} value={stats.charactersNoSpaces} />
        <StatCard label={t.sentences} value={stats.sentences} />
        <StatCard label={t.paragraphs} value={stats.paragraphs} />
        <StatCard label={t.readingTime} value={`${stats.readingTimeMin} ${t.min}`} />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.placeholder}
        className="w-full h-64 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans text-base leading-relaxed"
      />

      {text.length > 0 && (
        <button
          onClick={() => setText("")}
          className="mt-3 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
        >
          {t.clear}
        </button>
      )}

      {/* Ad placeholder - bottom */}
      {/* <div className="mt-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}
    </div>
  );
}
