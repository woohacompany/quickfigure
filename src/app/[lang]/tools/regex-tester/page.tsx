"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Sample Test Text ── */
const SAMPLE_TEXT = `Hello World! My email is user@example.com and backup email is admin@test.org.
Visit https://www.quickfigure.net or http://example.com for more info.
Call me at +1-555-123-4567 or 010-1234-5678.
Server IP: 192.168.1.1, DNS: 8.8.8.8
Date: 2026-03-28, Updated: 2025-12-31`;

/* ── Presets ── */
const PRESETS = [
  {
    labelEn: "Email",
    labelKo: "이메일",
    pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
    flags: "gm",
  },
  {
    labelEn: "URL",
    labelKo: "URL",
    pattern:
      "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    flags: "g",
  },
  {
    labelEn: "Phone",
    labelKo: "전화번호",
    pattern:
      "(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{2,4}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{3,4}",
    flags: "g",
  },
  {
    labelEn: "IP Address",
    labelKo: "IP 주소",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: "g",
  },
  {
    labelEn: "Date (YYYY-MM-DD)",
    labelKo: "날짜 (YYYY-MM-DD)",
    pattern: "\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])",
    flags: "g",
  },
];

/* ── Cheat Sheet Data ── */
const CHEAT_SHEET = [
  { symbol: ".", en: "Any character except newline", ko: "줄바꿈을 제외한 모든 문자" },
  { symbol: "\\d", en: "Digit (0-9)", ko: "숫자 (0-9)" },
  { symbol: "\\w", en: "Word character", ko: "영문자, 숫자, 밑줄" },
  { symbol: "\\s", en: "Whitespace", ko: "공백 문자" },
  { symbol: "^", en: "Start of string", ko: "문자열 시작" },
  { symbol: "$", en: "End of string", ko: "문자열 끝" },
  { symbol: "*", en: "0 or more", ko: "0회 이상 반복" },
  { symbol: "+", en: "1 or more", ko: "1회 이상 반복" },
  { symbol: "?", en: "0 or 1", ko: "0 또는 1회" },
  { symbol: "{n,m}", en: "Between n and m times", ko: "n~m회 반복" },
  { symbol: "[abc]", en: "Character class", ko: "문자 클래스" },
  { symbol: "(...)", en: "Capture group", ko: "캡처 그룹" },
  { symbol: "(?:...)", en: "Non-capture group", ko: "비캡처 그룹" },
  { symbol: "a|b", en: "Alternation (a or b)", ko: "또는 (a 또는 b)" },
  { symbol: "\\b", en: "Word boundary", ko: "단어 경계" },
];

/* ── Flag definitions ── */
const FLAG_OPTIONS = [
  { flag: "g", label: "Global" },
  { flag: "i", label: "Case Insensitive" },
  { flag: "m", label: "Multiline" },
  { flag: "s", label: "DotAll" },
  { flag: "u", label: "Unicode" },
] as const;

/* ── HTML escape ── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Main Component ── */
export default function RegexTesterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("regex-tester");
  const isKo = locale === "ko";

  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });
  const [testString, setTestString] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join("");
  }, [flags]);

  const toggleFlag = useCallback((f: string) => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  }, []);

  // Compute matches
  const matchResult = useMemo(() => {
    if (!pattern || !testString) {
      return { matches: [], error: null, highlightedHtml: escapeHtml(testString) };
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flagString);
    } catch (e) {
      return {
        matches: [],
        error: (e as Error).message,
        highlightedHtml: escapeHtml(testString),
      };
    }

    const matches: { index: number; value: string; groups: string[] }[] = [];

    if (flagString.includes("g")) {
      let m: RegExpExecArray | null;
      // Guard against infinite loops with zero-length matches
      let lastIndex = -1;
      while ((m = regex.exec(testString)) !== null) {
        if (regex.lastIndex === lastIndex) {
          regex.lastIndex++;
          continue;
        }
        lastIndex = regex.lastIndex;
        const groups = m.slice(1).map((g) => (g === undefined ? "" : g));
        matches.push({ index: m.index, value: m[0], groups });
      }
    } else {
      const m = regex.exec(testString);
      if (m) {
        const groups = m.slice(1).map((g) => (g === undefined ? "" : g));
        matches.push({ index: m.index, value: m[0], groups });
      }
    }

    // Build highlighted HTML
    if (matches.length === 0) {
      return { matches, error: null, highlightedHtml: escapeHtml(testString) };
    }

    // Sort matches by index (should already be sorted)
    const sorted = [...matches].sort((a, b) => a.index - b.index);

    let html = "";
    let cursor = 0;
    for (const match of sorted) {
      if (match.index < cursor) continue; // overlapping match, skip
      // Text before match
      html += escapeHtml(testString.slice(cursor, match.index));
      // Match highlight
      html += `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">${escapeHtml(match.value)}</mark>`;
      cursor = match.index + match.value.length;
    }
    // Remaining text
    html += escapeHtml(testString.slice(cursor));

    return { matches, error: null, highlightedHtml: html };
  }, [pattern, flagString, testString]);

  const handleCopy = useCallback(() => {
    const regexStr = `/${pattern}/${flagString}`;
    navigator.clipboard.writeText(regexStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pattern, flagString]);

  const loadPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      setPattern(preset.pattern);
      const newFlags: Record<string, boolean> = {
        g: false,
        i: false,
        m: false,
        s: false,
        u: false,
      };
      for (const ch of preset.flags) {
        newFlags[ch] = true;
      }
      setFlags(newFlags);
      if (!testString) {
        setTestString(SAMPLE_TEXT);
      }
    },
    [testString]
  );

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "정규식 테스터" : "Regex Tester",
    description: isKo
      ? "정규표현식을 실시간으로 테스트하세요. 매칭 하이라이트, 캡처 그룹, 프리셋 제공."
      : "Test regular expressions in real-time. Match highlighting, capture groups, and presets included.",
    url: `https://quickfigure.net/${lang}/tools/regex-tester`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        {
          q: "정규식 테스터란?",
          a: "정규식 테스터는 정규표현식을 작성하고 테스트 텍스트에 대해 실시간으로 테스트할 수 있는 도구입니다. 매칭된 부분을 하이라이트하고, 캡처 그룹을 보여주며, 패턴 디버깅을 도와줍니다.",
        },
        {
          q: "정규식 플래그란?",
          a: "플래그는 정규식 엔진의 동작을 변경합니다. 주요 플래그: g(전역 - 모든 매치 찾기), i(대소문자 무시), m(멀티라인 - ^와 $가 줄 경계에 매칭), s(dotAll - .이 줄바꿈에도 매칭), u(유니코드 지원).",
        },
        {
          q: "데이터가 안전한가요?",
          a: "네. 모든 처리는 브라우저에서 이루어집니다. 서버로 데이터가 전송되지 않으며, 정규식 패턴과 테스트 문자열은 기기를 벗어나지 않습니다.",
        },
        {
          q: "어떤 정규식 문법을 지원하나요?",
          a: "이 도구는 JavaScript의 내장 RegExp 엔진을 사용하며, 전방탐색, 후방탐색, 명명된 그룹, 유니코드 속성 등 모든 ECMAScript 정규식 기능을 지원합니다.",
        },
      ]
    : [
        {
          q: "What is a regex tester?",
          a: "A regex tester is a tool that lets you write regular expressions and test them against sample text in real-time. It highlights matches, shows capture groups, and helps you debug patterns quickly.",
        },
        {
          q: "What are regex flags?",
          a: "Flags modify how the regex engine processes the pattern. Common flags: g (global - find all matches), i (case-insensitive), m (multiline - ^ and $ match line boundaries), s (dotAll - . matches newlines), u (unicode support).",
        },
        {
          q: "Is my data safe?",
          a: "Yes. All processing happens entirely in your browser. No data is sent to any server. Your regex patterns and test strings never leave your device.",
        },
        {
          q: "What regex syntax is supported?",
          a: "This tool uses JavaScript's built-in RegExp engine, supporting all standard ECMAScript regex features including lookaheads, lookbehinds, named groups, and Unicode properties.",
        },
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

  const toolTitle = isKo ? "정규식 테스터" : "Regex Tester";
  const toolDescription = isKo
    ? "정규표현식을 실시간으로 테스트하세요. 매칭 하이라이트, 캡처 그룹, 프리셋 제공."
    : "Test regular expressions in real-time. Match highlighting, capture groups, and presets included.";

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
          {isKo
            ? "정규식 테스터 - 실시간 정규표현식 테스트"
            : "Regex Tester - Test Regular Expressions Online"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "무료 온라인 정규식 테스터. 패턴을 입력하고 실시간으로 매칭 결과를 확인하세요. 가입 없이 무료."
            : "Free online regex tester. Enter a pattern and see matches highlighted in real-time. No signup needed."}
        </p>

        <ToolAbout slug="regex-tester" locale={locale} />
      </header>

      {/* Presets */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {isKo ? "프리셋:" : "Presets:"}
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.labelEn}
              onClick={() => loadPreset(preset)}
              className="text-xs px-2.5 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {isKo ? preset.labelKo : preset.labelEn}
            </button>
          ))}
          <button
            onClick={() => {
              if (!testString) setTestString(SAMPLE_TEXT);
            }}
            className="text-xs px-2.5 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            {isKo ? "샘플 텍스트 로드" : "Load Sample Text"}
          </button>
        </div>
      </div>

      {/* Pattern Input */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          {isKo ? "패턴" : "Pattern"}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-neutral-400 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={isKo ? "정규표현식을 입력하세요..." : "Enter regex pattern..."}
            spellCheck={false}
            className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-lg text-neutral-400 font-mono">/</span>
          <span className="text-sm text-neutral-500 font-mono min-w-[3ch]">
            {flagString}
          </span>
        </div>
      </div>

      {/* Flags */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">
          {isKo ? "플래그" : "Flags"}
        </label>
        <div className="flex flex-wrap gap-2">
          {FLAG_OPTIONS.map((opt) => (
            <button
              key={opt.flag}
              onClick={() => toggleFlag(opt.flag)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                flags[opt.flag]
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
              }`}
            >
              {opt.flag} <span className="text-[10px] opacity-75">({opt.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Test String */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {isKo ? "테스트 문자열" : "Test String"}
            {testString.length > 0 && (
              <span className="ml-2 text-xs text-neutral-400 font-normal">
                {testString.length.toLocaleString()} {isKo ? "글자" : "chars"}
              </span>
            )}
          </label>
          {testString && (
            <button
              onClick={() => setTestString("")}
              className="text-xs px-2 py-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {isKo ? "지우기" : "Clear"}
            </button>
          )}
        </div>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder={
            isKo
              ? "테스트할 문자열을 입력하세요..."
              : "Enter test string here..."
          }
          spellCheck={false}
          className="w-full min-h-[160px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-neutral-400"
        />
      </div>

      {/* Error Display */}
      {matchResult.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm">
          <p className="font-medium text-red-700 dark:text-red-400">
            {isKo ? "정규식 오류" : "Regex Error"}
          </p>
          <p className="text-red-600 dark:text-red-400 mt-1 font-mono text-xs">
            {matchResult.error}
          </p>
        </div>
      )}

      {/* Highlighted Result */}
      {testString && !matchResult.error && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              {isKo ? "매칭 결과" : "Match Result"}
              <span className="ml-2 text-xs text-neutral-400 font-normal">
                {matchResult.matches.length}{" "}
                {isKo
                  ? matchResult.matches.length === 1
                    ? "개 매치"
                    : "개 매치"
                  : matchResult.matches.length === 1
                    ? "match"
                    : "matches"}
              </span>
            </label>
            {pattern && (
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {copied
                  ? isKo
                    ? "복사됨!"
                    : "Copied!"
                  : isKo
                    ? "패턴 복사"
                    : "Copy Pattern"}
              </button>
            )}
          </div>
          <div
            className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: matchResult.highlightedHtml }}
          />
        </div>
      )}

      {/* Match Details Table */}
      {matchResult.matches.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">
            {isKo ? "매치 상세" : "Match Details"}
          </label>
          <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800 text-left">
                    <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                      #
                    </th>
                    <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                      {isKo ? "매치" : "Match"}
                    </th>
                    <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                      {isKo ? "인덱스" : "Index"}
                    </th>
                    <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                      {isKo ? "그룹" : "Groups"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matchResult.matches.map((m, i) => (
                    <tr
                      key={i}
                      className={
                        i % 2 === 0
                          ? "bg-white dark:bg-neutral-900"
                          : "bg-neutral-50 dark:bg-neutral-800/50"
                      }
                    >
                      <td className="px-3 py-2 text-neutral-400 font-mono">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-blue-600 dark:text-blue-400 break-all">
                        {m.value}
                      </td>
                      <td className="px-3 py-2 font-mono text-neutral-500">
                        {m.index}
                      </td>
                      <td className="px-3 py-2 font-mono text-neutral-500 break-all">
                        {m.groups.length > 0
                          ? m.groups.map((g, gi) => (
                              <span key={gi}>
                                {gi > 0 && ", "}
                                <span className="text-amber-600 dark:text-amber-400">
                                  {g || (isKo ? "(빈값)" : "(empty)")}
                                </span>
                              </span>
                            ))
                          : isKo
                            ? "-"
                            : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cheat Sheet Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowCheatSheet(!showCheatSheet)}
          className="text-sm px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span>{showCheatSheet ? "\u25BC" : "\u25B6"}</span>
          {isKo ? "정규식 치트시트" : "Regex Cheat Sheet"}
        </button>
        {showCheatSheet && (
          <div className="mt-3 rounded-lg border border-neutral-300 dark:border-neutral-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-100 dark:bg-neutral-800 text-left">
                  <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                    {isKo ? "기호" : "Symbol"}
                  </th>
                  <th className="px-3 py-2 font-medium text-neutral-600 dark:text-neutral-400">
                    {isKo ? "설명" : "Description"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {CHEAT_SHEET.map((item, i) => (
                  <tr
                    key={i}
                    className={
                      i % 2 === 0
                        ? "bg-white dark:bg-neutral-900"
                        : "bg-neutral-50 dark:bg-neutral-800/50"
                    }
                  >
                    <td className="px-3 py-2 font-mono font-medium text-blue-600 dark:text-blue-400">
                      {item.symbol}
                    </td>
                    <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                      {isKo ? item.ko : item.en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToolHowItWorks slug="regex-tester" locale={locale} />
      <ToolDisclaimer slug="regex-tester" locale={locale} />

      <ShareButtons
        title={toolTitle}
        description={toolDescription}
        lang={lang}
        slug="regex-tester"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="regex-tester"
        lang={lang}
        labels={dict.embed}
      />

      {/* How to Use */}
      <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="space-y-3 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "패턴 입력 필드에 정규표현식을 입력하세요.",
                "플래그(g, i, m, s, u)를 선택하여 매칭 동작을 변경하세요.",
                "아래 텍스트 영역에 테스트할 문자열을 입력하거나 붙여넣으세요.",
                "매칭 결과가 실시간으로 하이라이트되며 인덱스와 캡처 그룹이 표시됩니다.",
                "자주 쓰는 프리셋이나 치트시트를 활용하세요.",
              ]
            : [
                "Enter your regular expression pattern in the Pattern field.",
                "Select flags (g, i, m, s, u) to modify matching behavior.",
                "Type or paste your test string in the text area below.",
                "Matches are highlighted in real-time with index and capture group details.",
                "Use presets for common patterns or the cheat sheet for syntax reference.",
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
          {isKo ? "자주 묻는 질문 (FAQ)" : "Frequently Asked Questions"}
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
