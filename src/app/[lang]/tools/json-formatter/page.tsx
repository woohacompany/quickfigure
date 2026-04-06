"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
type Tab = "beautify" | "minify" | "validate" | "tree";
type IndentType = "2" | "4" | "tab";

/* ── Sample JSON ── */
const SAMPLE_JSON = `{
  "name": "QuickFigure",
  "version": "2.0",
  "description": "Free online tools",
  "features": ["JSON Formatter", "Calculators", "Converters"],
  "stats": {
    "tools": 78,
    "languages": ["en", "ko"],
    "isFree": true,
    "rating": 4.9
  },
  "categories": [
    { "id": "finance", "count": 27 },
    { "id": "image", "count": 20 },
    { "id": "dev", "count": 3 }
  ],
  "contact": null
}`;

/* ── Syntax Highlighting ── */
function highlightJson(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "text-emerald-600 dark:text-emerald-400"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-blue-600 dark:text-blue-400"; // key
            match = match.replace(/:$/, "");
            return `<span class="${cls}">${match}</span>:`;
          } else {
            cls = "text-amber-600 dark:text-amber-400"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-purple-600 dark:text-purple-400"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-red-400 dark:text-red-500"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

/* ── Tree View Component ── */
function TreeNode({
  label,
  value,
  depth,
  isLast,
}: {
  label: string | null;
  value: unknown;
  depth: number;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) {
    return (
      <div className="flex items-start" style={{ paddingLeft: depth * 20 }}>
        {label !== null && (
          <span className="text-blue-600 dark:text-blue-400 font-medium mr-1">{label}:</span>
        )}
        <span className="text-red-400 dark:text-red-500 italic">null</span>
        {!isLast && <span className="text-neutral-400">,</span>}
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    const isArray = Array.isArray(value);
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>);
    const bracket = isArray ? ["[", "]"] : ["{", "}"];

    return (
      <div style={{ paddingLeft: depth * 20 }}>
        <div className="flex items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mr-1 cursor-pointer flex-shrink-0"
          >
            {expanded ? "\u25BC" : "\u25B6"}
          </button>
          {label !== null && (
            <span className="text-blue-600 dark:text-blue-400 font-medium mr-1">{label}:</span>
          )}
          {!expanded ? (
            <>
              <span className="text-neutral-500">{bracket[0]}</span>
              <span className="text-neutral-400 text-xs mx-1">
                {entries.length} {isArray ? "items" : "keys"}
              </span>
              <span className="text-neutral-500">{bracket[1]}</span>
              {!isLast && <span className="text-neutral-400">,</span>}
            </>
          ) : (
            <span className="text-neutral-500">{bracket[0]}</span>
          )}
        </div>
        {expanded && (
          <>
            {entries.map(([k, v], i) => (
              <TreeNode
                key={k}
                label={isArray ? null : k}
                value={v}
                depth={depth + 1}
                isLast={i === entries.length - 1}
              />
            ))}
            <div style={{ paddingLeft: 20 }} className="text-neutral-500">
              {bracket[1]}
              {!isLast && <span className="text-neutral-400">,</span>}
            </div>
          </>
        )}
      </div>
    );
  }

  // Primitive
  let valClass = "text-emerald-600 dark:text-emerald-400";
  let display = String(value);
  if (typeof value === "string") {
    valClass = "text-amber-600 dark:text-amber-400";
    display = `"${value}"`;
  } else if (typeof value === "boolean") {
    valClass = "text-purple-600 dark:text-purple-400";
  }

  return (
    <div className="flex items-start" style={{ paddingLeft: depth * 20 }}>
      {label !== null && (
        <span className="text-blue-600 dark:text-blue-400 font-medium mr-1">{label}:</span>
      )}
      <span className={valClass}>{display}</span>
      {!isLast && <span className="text-neutral-400">,</span>}
    </div>
  );
}

/* ── Error line parser ── */
function parseErrorPosition(msg: string): number | null {
  // "... at position 123" or "... at line 5 column 10"
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) return parseInt(posMatch[1], 10);
  return null;
}

function getErrorLine(input: string, position: number): number {
  return input.substring(0, position).split("\n").length;
}

/* ── Main Component ── */
export default function JsonFormatterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.jsonFormatter;
  const relatedPosts = getPostsByTool("json-formatter");
  const isKo = locale === "ko";

  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>("beautify");
  const [indent, setIndent] = useState<IndentType>("2");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse result
  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, errorLine: null, parsed: null };

    try {
      const parsed = JSON.parse(input);
      let output = "";
      if (tab === "beautify") {
        const indentStr = indent === "tab" ? "\t" : indent === "4" ? "    " : "  ";
        output = JSON.stringify(parsed, null, indentStr);
      } else if (tab === "minify") {
        output = JSON.stringify(parsed);
      } else if (tab === "validate") {
        output = isKo ? "JSON\uC774 \uC720\uD6A8\uD569\uB2C8\uB2E4!" : "Valid JSON!";
      }
      return { output, error: null, errorLine: null, parsed };
    } catch (e) {
      const msg = (e as Error).message;
      const pos = parseErrorPosition(msg);
      const errorLine = pos !== null ? getErrorLine(input, pos) : null;
      return { output: "", error: msg, errorLine, parsed: null };
    }
  }, [input, tab, indent, isKo]);

  const inputStats = useMemo(() => {
    const chars = input.length;
    const lines = input ? input.split("\n").length : 0;
    return { chars, lines };
  }, [input]);

  const outputStats = useMemo(() => {
    if (!result.output || tab === "validate" || tab === "tree") return { chars: 0, lines: 0 };
    return { chars: result.output.length, lines: result.output.split("\n").length };
  }, [result.output, tab]);

  const handleCopy = useCallback(() => {
    if (!result.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result.output]);

  const handleDownload = useCallback(() => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [result.output]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") setInput(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
  }, []);

  // Highlighted output with line numbers
  const highlightedOutput = useMemo(() => {
    if (tab === "validate" || tab === "tree" || !result.output) return "";
    return highlightJson(result.output);
  }, [result.output, tab]);

  // Input lines with error highlight
  const inputLines = useMemo(() => {
    if (!input) return [];
    return input.split("\n");
  }, [input]);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "JSON \uD3EC\uB9F7\uD130" : "JSON Formatter",
    description: isKo
      ? "\uBB34\uB8CC \uC628\uB77C\uC778 JSON \uD3EC\uB9F7\uD130. JSON\uC744 \uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD558\uACE0 \uC720\uD6A8\uC131 \uAC80\uC0AC\uAE4C\uC9C0."
      : "Free online JSON formatter. Beautify, minify, and validate JSON data instantly.",
    url: `https://www.quickfigure.net/${lang}/tools/json-formatter`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        { q: "JSON \uD3EC\uB9F7\uD305\uC774\uB780 \uBB34\uC5C7\uC778\uAC00\uC694?", a: "JSON \uD3EC\uB9F7\uD305\uC740 JSON \uB370\uC774\uD130\uB97C \uB4E4\uC5EC\uC4F0\uAE30\uC640 \uC904\uBC14\uAFC8\uC744 \uCD94\uAC00\uD558\uC5EC \uC0AC\uB78C\uC774 \uC77D\uAE30 \uC27D\uAC8C \uC815\uB9AC\uD558\uB294 \uAC83\uC785\uB2C8\uB2E4. Beautify\uB77C\uACE0\uB3C4 \uD569\uB2C8\uB2E4." },
        { q: "Minify\uC640 Beautify\uC758 \uCC28\uC774\uB294?", a: "Beautify\uB294 \uB4E4\uC5EC\uC4F0\uAE30\uC640 \uC904\uBC14\uAFC8\uC744 \uCD94\uAC00\uD574 \uAC00\uB3C5\uC131\uC744 \uB192\uC774\uACE0, Minify\uB294 \uBAA8\uB4E0 \uACF5\uBC31\uC744 \uC81C\uAC70\uD574 \uD30C\uC77C \uD06C\uAE30\uB97C \uCD5C\uC18C\uD654\uD569\uB2C8\uB2E4. API \uC751\uB2F5\uC774\uB098 \uC124\uC815 \uD30C\uC77C\uC744 \uC800\uC7A5\uD560 \uB54C\uB294 Minify\uB97C \uC0AC\uC6A9\uD569\uB2C8\uB2E4." },
        { q: "JSON \uC720\uD6A8\uC131 \uAC80\uC0AC\uB294 \uC65C \uD544\uC694\uD55C\uAC00\uC694?", a: "JSON \uBB38\uBC95 \uC624\uB958\uAC00 \uC788\uC73C\uBA74 API \uD1B5\uC2E0\uC774 \uC2E4\uD328\uD558\uAC70\uB098 \uD504\uB85C\uADF8\uB7A8\uC774 \uCDA9\uB3CC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC804\uC1A1 \uC804\uC5D0 \uC720\uD6A8\uC131\uC744 \uAC80\uC0AC\uD558\uBA74 \uB514\uBC84\uAE45 \uC2DC\uAC04\uC744 \uD06C\uAC8C \uC904\uC77C \uC218 \uC788\uC2B5\uB2C8\uB2E4." },
        { q: "Tree View\uB294 \uC5B4\uB5BB\uAC8C \uD65C\uC6A9\uD558\uB098\uC694?", a: "Tree View\uB294 JSON\uC758 \uACC4\uCE35 \uAD6C\uC870\uB97C \uC2DC\uAC01\uC801\uC73C\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4. \uAC01 \uB178\uB4DC\uB97C \uD074\uB9AD\uD574 \uC811\uAE30/\uD3BC\uCE58\uAE30\uAC00 \uAC00\uB2A5\uD574\uC11C \uBCF5\uC7A1\uD55C \uC911\uCCA9 JSON\uC744 \uD0D0\uC0C9\uD558\uAE30\uC5D0 \uD3B8\uB9AC\uD569\uB2C8\uB2E4." },
      ]
    : [
        { q: "What is JSON formatting?", a: "JSON formatting (also called beautifying) adds indentation and line breaks to make JSON data human-readable. It doesn't change the data itself, just its visual presentation." },
        { q: "What's the difference between Minify and Beautify?", a: "Beautify adds whitespace and indentation for readability. Minify removes all unnecessary whitespace to reduce file size. Use Minify for API responses or config files in production." },
        { q: "Why should I validate JSON?", a: "Invalid JSON syntax can cause API failures or program crashes. Validating before sending or saving catches syntax errors early and saves debugging time." },
        { q: "How does Tree View work?", a: "Tree View renders JSON as an expandable/collapsible tree structure. Click any node to expand or collapse it. It's great for navigating deeply nested JSON objects." },
      ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "beautify", label: isKo ? "Beautify (\uC815\uB9AC)" : "Beautify" },
    { id: "minify", label: isKo ? "Minify (\uC555\uCD95)" : "Minify" },
    { id: "validate", label: isKo ? "Validate (\uAC80\uC99D)" : "Validate" },
    { id: "tree", label: isKo ? "Tree View (\uD2B8\uB9AC)" : "Tree View" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "JSON \uD3EC\uB9F7\uD130 - JSON \uC815\uB9AC & \uC720\uD6A8\uC131 \uAC80\uC0AC" : "JSON Formatter - Beautify, Minify & Validate"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "\uBB34\uB8CC \uC628\uB77C\uC778 JSON \uD3EC\uB9F7\uD130. JSON\uC744 \uBCF4\uAE30 \uC88B\uAC8C \uC815\uB9AC\uD558\uACE0 \uC720\uD6A8\uC131 \uAC80\uC0AC\uAE4C\uC9C0. \uD2B8\uB9AC \uBDF0 \uC9C0\uC6D0. \uAC00\uC785 \uC5C6\uC774 \uBB34\uB8CC."
            : "Free online JSON formatter. Beautify, minify, validate, and explore JSON with Tree View. No signup needed."}
        </p>

        <ToolAbout slug="json-formatter" locale={locale} />
      </header>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 mb-4 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === t.id
                ? "bg-white dark:bg-neutral-700 text-foreground shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        {(tab === "beautify") && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">
              {isKo ? "\uB4E4\uC5EC\uC4F0\uAE30:" : "Indent:"}
            </span>
            {(["2", "4", "tab"] as IndentType[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setIndent(opt)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  indent === opt
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {opt === "tab" ? "Tab" : `${opt}\uCE78`}
              </button>
            ))}
          </div>
        )}
        <label className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
            className="rounded"
          />
          {isKo ? "\uC904 \uBC88\uD638" : "Line numbers"}
        </label>
      </div>

      {/* Input Area */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {isKo ? "\uC785\uB825" : "Input"}
            {inputStats.chars > 0 && (
              <span className="ml-2 text-xs text-neutral-400 font-normal">
                {inputStats.chars.toLocaleString()} {isKo ? "\uAE00\uC790" : "chars"} / {inputStats.lines} {isKo ? "\uC904" : "lines"}
              </span>
            )}
          </label>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {isKo ? "\uC0D8\uD50C JSON" : "Sample JSON"}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {isKo ? "\uD30C\uC77C \uC5C5\uB85C\uB4DC" : "Upload .json"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {input && (
              <button
                onClick={() => setInput("")}
                className="text-xs px-2 py-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {isKo ? "\uC9C0\uC6B0\uAE30" : "Clear"}
              </button>
            )}
          </div>
        </div>
        <div className="relative rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
          <div className="flex">
            {showLineNumbers && inputLines.length > 0 && (
              <div className="flex-shrink-0 py-3 px-2 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 text-right select-none min-w-[3rem]">
                {inputLines.map((_, i) => (
                  <div
                    key={i}
                    className={`text-xs leading-[1.625rem] font-mono ${
                      result.errorLine === i + 1
                        ? "text-red-500 font-bold"
                        : "text-neutral-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isKo ? "JSON\uC744 \uC5EC\uAE30\uC5D0 \uBD99\uC5EC\uB123\uC73C\uC138\uC694..." : "Paste your JSON here..."}
              spellCheck={false}
              className="flex-1 min-h-[280px] p-3 bg-white dark:bg-neutral-900 font-mono text-sm leading-relaxed focus:outline-none resize-y placeholder:text-neutral-400"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {result.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm">
          <p className="font-medium text-red-700 dark:text-red-400">
            {isKo ? "JSON \uC624\uB958" : "JSON Error"}
          </p>
          <p className="text-red-600 dark:text-red-400 mt-1 font-mono text-xs">
            {result.error}
            {result.errorLine && (
              <span className="ml-2 text-red-500 font-semibold">
                ({isKo ? `${result.errorLine}\uBC88\uC9F8 \uC904` : `line ${result.errorLine}`})
              </span>
            )}
          </p>
        </div>
      )}

      {/* Validation Success */}
      {tab === "validate" && !result.error && input.trim() && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-sm">
          <p className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
            <span className="text-lg">{"\u2705"}</span>
            {result.output}
          </p>
        </div>
      )}

      {/* Tree View */}
      {tab === "tree" && result.parsed !== null && (
        <div className="mb-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 max-h-[500px] overflow-auto font-mono text-sm">
          <TreeNode label={null} value={result.parsed} depth={0} isLast={true} />
        </div>
      )}

      {/* Output Area (beautify/minify) */}
      {(tab === "beautify" || tab === "minify") && result.output && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              {isKo ? "\uACB0\uACFC" : "Output"}
              <span className="ml-2 text-xs text-neutral-400 font-normal">
                {outputStats.chars.toLocaleString()} {isKo ? "\uAE00\uC790" : "chars"} / {outputStats.lines} {isKo ? "\uC904" : "lines"}
              </span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {copied ? (isKo ? "\uBCF5\uC0AC\uB428!" : "Copied!") : (isKo ? "\uBCF5\uC0AC" : "Copy")}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {isKo ? ".json \uB2E4\uC6B4\uB85C\uB4DC" : "Download .json"}
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
            <div className="flex">
              {showLineNumbers && (
                <div className="flex-shrink-0 py-3 px-2 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 text-right select-none min-w-[3rem]">
                  {result.output.split("\n").map((_, i) => (
                    <div key={i} className="text-xs leading-[1.625rem] font-mono text-neutral-400">
                      {i + 1}
                    </div>
                  ))}
                </div>
              )}
              <pre
                className="flex-1 p-3 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm leading-relaxed overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: highlightedOutput }}
              />
            </div>
          </div>
        </div>
      )}

      <ToolHowItWorks slug="json-formatter" locale={locale} />
      <ToolDisclaimer slug="json-formatter" locale={locale} />

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="json-formatter"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="json-formatter"
        lang={lang}
        labels={dict.embed}
      />

      {/* How to Use */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "\uC0AC\uC6A9 \uBC29\uBC95" : "How to Use"}
        </h2>
        <ol className="space-y-3 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "JSON \uB370\uC774\uD130\uB97C \uC785\uB825\uCC3D\uC5D0 \uBD99\uC5EC\uB123\uAC70\uB098 .json \uD30C\uC77C\uC744 \uC5C5\uB85C\uB4DC\uD558\uC138\uC694.",
                "Beautify / Minify / Validate / Tree View \uD0ED\uC744 \uC120\uD0DD\uD558\uC138\uC694.",
                "Beautify \uBAA8\uB4DC\uC5D0\uC11C\uB294 \uB4E4\uC5EC\uC4F0\uAE30(2\uCE78/4\uCE78/\uD0ED)\uB97C \uC124\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
                "\uC624\uB958\uAC00 \uC788\uC73C\uBA74 \uBE68\uAC04\uC0C9\uC73C\uB85C \uC904 \uBC88\uD638\uC640 \uD568\uAED8 \uD45C\uC2DC\uB429\uB2C8\uB2E4.",
                "\uACB0\uACFC\uB97C \uBCF5\uC0AC\uD558\uAC70\uB098 .json \uD30C\uC77C\uB85C \uB2E4\uC6B4\uB85C\uB4DC\uD558\uC138\uC694.",
              ]
            : [
                "Paste your JSON data or upload a .json file.",
                "Select a mode: Beautify / Minify / Validate / Tree View.",
                "In Beautify mode, choose your indent style (2 spaces, 4 spaces, or tab).",
                "Errors are highlighted in red with the line number.",
                "Copy the result or download it as a .json file.",
              ]
          ).map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "\uC790\uC8FC \uBB3B\uB294 \uC9C8\uBB38 (FAQ)" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
            >
              <h3 className="font-medium mb-2">{item.q}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Articles */}
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
