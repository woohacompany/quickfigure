"use client";

import { useState } from "react";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { use } from "react";

export default function Base64Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const t = getDictionary((isValidLocale(lang) ? lang : "en") as Locale).base64;

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  function encode() {
    try {
      const encoded = btoa(
        new TextEncoder()
          .encode(input)
          .reduce((acc, byte) => acc + String.fromCharCode(byte), "")
      );
      setOutput(encoded);
      setError("");
      setMode("encode");
    } catch (e) {
      setError(t.encodingError);
      setOutput("");
    }
  }

  function decode() {
    try {
      const binaryString = atob(input.trim());
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      setOutput(decoded);
      setError("");
      setMode("decode");
    } catch (e) {
      setError(t.decodingError);
      setOutput("");
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
  }

  function swap() {
    setInput(output);
    setOutput("");
    setError("");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      <div>
        <label className="text-sm font-medium block mb-2">{t.input}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="w-full h-40 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      <div className="flex flex-wrap gap-2 my-4">
        <button
          onClick={encode}
          className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.encodeBtn}
        </button>
        <button
          onClick={decode}
          className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t.decodeBtn}
        </button>
        {output && (
          <>
            <button
              onClick={swap}
              className="px-4 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {t.swap}
            </button>
            <button
              onClick={copy}
              className="px-4 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {t.copy}
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {output && (
        <div>
          <label className="text-sm font-medium block mb-2">
            {mode === "encode" ? t.encoded : t.decoded}
          </label>
          <textarea
            value={output}
            readOnly
            className="w-full h-40 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm resize-y"
          />
        </div>
      )}
    </div>
  );
}
