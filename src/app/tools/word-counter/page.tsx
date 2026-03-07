"use client";

import { useState, useMemo } from "react";
import type { Metadata } from "next";

export default function WordCounterPage() {
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Word Counter</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Paste or type your text below to get an instant word count and more.
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Words" value={stats.words} />
          <StatCard label="Characters" value={stats.characters} />
          <StatCard label="Characters (no spaces)" value={stats.charactersNoSpaces} />
          <StatCard label="Sentences" value={stats.sentences} />
          <StatCard label="Paragraphs" value={stats.paragraphs} />
          <StatCard
            label="Reading Time"
            value={`${stats.readingTimeMin} min`}
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here..."
          className="w-full h-64 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans text-base leading-relaxed"
        />

        {text.length > 0 && (
          <button
            onClick={() => setText("")}
            className="mt-3 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
          >
            Clear text
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{label}</p>
    </div>
  );
}
