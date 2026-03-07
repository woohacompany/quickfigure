"use client";

import { useState, useCallback } from "react";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { use } from "react";

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function PasswordGeneratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const t = getDictionary((isValidLocale(lang) ? lang : "en") as Locale).passwordGenerator;

  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    let charset = "";
    if (options.uppercase) charset += CHARS.uppercase;
    if (options.lowercase) charset += CHARS.lowercase;
    if (options.numbers) charset += CHARS.numbers;
    if (options.symbols) charset += CHARS.symbols;
    if (!charset) charset = CHARS.lowercase;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const result = Array.from(array, (v) => charset[v % charset.length]).join("");
    setPassword(result);
    setCopied(false);
  }, [length, options]);

  function copy() {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const optionLabels: Record<string, string> = {
    uppercase: t.uppercase,
    lowercase: t.lowercase,
    numbers: t.numbers,
    symbols: t.symbols,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Length */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {t.length}: {length}
          </label>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          {(Object.keys(options) as (keyof typeof options)[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                className="accent-blue-600"
              />
              {optionLabels[key]}
            </label>
          ))}
        </div>

        {/* Generate */}
        <button
          onClick={generate}
          className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.generateBtn}
        </button>

        {/* Output */}
        {password && (
          <div className="flex items-center gap-3">
            <code className="flex-1 p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono text-sm break-all">
              {password}
            </code>
            <button
              onClick={copy}
              className="shrink-0 px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? t.copied : t.copy}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
