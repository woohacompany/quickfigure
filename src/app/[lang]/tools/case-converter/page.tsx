"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase());
}

function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s\-]+/g, "_")
    .toLowerCase();
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
}

const converters = [
  { key: "upper", fn: (s: string) => s.toUpperCase() },
  { key: "lower", fn: (s: string) => s.toLowerCase() },
  { key: "title", fn: toTitleCase },
  { key: "sentence", fn: toSentenceCase },
  { key: "camel", fn: toCamelCase },
  { key: "pascal", fn: toPascalCase },
  { key: "snake", fn: toSnakeCase },
  { key: "kebab", fn: toKebabCase },
] as const;

export default function CaseConverterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.caseConverter;
  const relatedPosts = getPostsByTool("case-converter");

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [active, setActive] = useState("");

  const labels: Record<string, string> = {
    upper: t.upper,
    lower: t.lower,
    title: t.titleCase,
    sentence: t.sentenceCase,
    camel: t.camelCase,
    pascal: t.pascalCase,
    snake: t.snakeCase,
    kebab: t.kebabCase,
  };

  function convert(key: string, fn: (s: string) => string) {
    setOutput(fn(input));
    setActive(key);
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t.placeholder}
        className="w-full h-36 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-sans text-base leading-relaxed"
      />

      <div className="flex flex-wrap gap-2 my-4">
        {converters.map(({ key, fn }) => (
          <button
            key={key}
            onClick={() => convert(key, fn)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
              active === key
                ? "bg-foreground text-background border-foreground"
                : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>

      {output && (
        <>
          <textarea
            value={output}
            readOnly
            className="w-full h-36 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-foreground font-sans text-base leading-relaxed resize-y"
          />
          <button
            onClick={copyOutput}
            className="mt-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
          >
            {t.copy}
          </button>
        </>
      )}

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
