"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Diff types ─────────────────────────────────────────── */

type DiffType = "added" | "removed" | "same" | "modified";

interface DiffLine {
  type: DiffType;
  leftLine?: string;
  rightLine?: string;
  leftNum?: number;
  rightNum?: number;
  wordDiffs?: WordDiff[];
}

interface WordDiff {
  type: "added" | "removed" | "same";
  text: string;
}

/* ── LCS-based diff algorithm ──────────────────────────── */

function computeLCS(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function backtrackLCS(
  dp: number[][],
  a: string[],
  b: string[]
): DiffLine[] {
  const result: DiffLine[] = [];
  let i = a.length;
  let j = b.length;
  let leftNum = a.length;
  let rightNum = b.length;

  // collect in reverse, then reverse at end
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      stack.push({
        type: "same",
        leftLine: a[i - 1],
        rightLine: b[j - 1],
        leftNum: i,
        rightNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: "added",
        rightLine: b[j - 1],
        rightNum: j,
      });
      j--;
    } else if (i > 0) {
      stack.push({
        type: "removed",
        leftLine: a[i - 1],
        leftNum: i,
      });
      i--;
    }
  }

  stack.reverse();

  // Post-process: merge adjacent removed+added into "modified"
  const merged: DiffLine[] = [];
  let idx = 0;
  while (idx < stack.length) {
    if (
      idx + 1 < stack.length &&
      stack[idx].type === "removed" &&
      stack[idx + 1].type === "added"
    ) {
      merged.push({
        type: "modified",
        leftLine: stack[idx].leftLine,
        rightLine: stack[idx + 1].rightLine,
        leftNum: stack[idx].leftNum,
        rightNum: stack[idx + 1].rightNum,
      });
      idx += 2;
    } else {
      merged.push(stack[idx]);
      idx++;
    }
  }

  return merged;
}

function computeWordDiffs(left: string, right: string): WordDiff[] {
  const wordsA = left.split(/(\s+)/);
  const wordsB = right.split(/(\s+)/);
  const dp = computeLCS(wordsA, wordsB);

  const result: WordDiff[] = [];
  let i = wordsA.length;
  let j = wordsB.length;
  const stack: WordDiff[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      stack.push({ type: "same", text: wordsA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: wordsB[j - 1] });
      j--;
    } else if (i > 0) {
      stack.push({ type: "removed", text: wordsA[i - 1] });
      i--;
    }
  }

  stack.reverse();
  return stack;
}

function computeDiff(
  textA: string,
  textB: string,
  wordLevel: boolean
): DiffLine[] {
  const linesA = textA.split("\n");
  const linesB = textB.split("\n");
  const dp = computeLCS(linesA, linesB);
  const diff = backtrackLCS(dp, linesA, linesB);

  if (wordLevel) {
    return diff.map((d) => {
      if (d.type === "modified" && d.leftLine != null && d.rightLine != null) {
        return { ...d, wordDiffs: computeWordDiffs(d.leftLine, d.rightLine) };
      }
      return d;
    });
  }

  return diff;
}

/* ── Stats ─────────────────────────────────────────────── */

interface DiffStats {
  total: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

function getStats(diffs: DiffLine[]): DiffStats {
  const stats: DiffStats = { total: diffs.length, added: 0, removed: 0, modified: 0, unchanged: 0 };
  for (const d of diffs) {
    if (d.type === "added") stats.added++;
    else if (d.type === "removed") stats.removed++;
    else if (d.type === "modified") stats.modified++;
    else stats.unchanged++;
  }
  return stats;
}

/* ── Component ─────────────────────────────────────────── */

export default function TextDiffPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("text-diff");
  const isKo = locale === "ko";

  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffs, setDiffs] = useState<DiffLine[] | null>(null);
  const [wordLevel, setWordLevel] = useState(false);

  const title = isKo
    ? "텍스트 비교 도구"
    : "Text Diff Tool";
  const description = isKo
    ? "두 텍스트를 비교하여 차이점을 즉시 확인하세요. 줄 단위, 단어 단위 비교 지원."
    : "Compare two texts and find differences instantly. Line-by-line and word-by-word comparison with highlighted changes.";
  const pageTitle = isKo
    ? "텍스트 비교 도구 - 두 문서 차이점 비교 | QuickFigure"
    : "Text Diff Tool - Compare Two Texts Online | QuickFigure";

  function handleCompare() {
    const result = computeDiff(leftText, rightText, wordLevel);
    setDiffs(result);
  }

  function handleClear() {
    setLeftText("");
    setRightText("");
    setDiffs(null);
  }

  function handleSwap() {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    setDiffs(null);
  }

  function toggleMode() {
    const newWordLevel = !wordLevel;
    setWordLevel(newWordLevel);
    if (leftText || rightText) {
      const result = computeDiff(leftText, rightText, newWordLevel);
      setDiffs(result);
    }
  }

  const stats = diffs ? getStats(diffs) : null;

  /* ── FAQ data ────────────────────────────────────────── */

  const faqs = isKo
    ? [
        {
          q: "텍스트 비교 원리는?",
          a: "LCS(최장 공통 부분 수열) 알고리즘을 사용하여 두 텍스트의 공통 부분을 찾고, 추가/삭제/변경된 줄을 식별합니다. 모든 처리는 브라우저에서 이루어집니다.",
        },
        {
          q: "긴 텍스트도 비교 가능한가요?",
          a: "네, 가능합니다. 다만 매우 긴 텍스트(수만 줄 이상)는 브라우저 성능에 영향을 줄 수 있습니다. 일반적인 문서, 코드 비교에는 충분합니다.",
        },
        {
          q: "줄 비교와 단어 비교 차이는?",
          a: "줄 비교는 각 줄 전체를 단위로 비교합니다. 단어 비교는 변경된 줄 내에서 어떤 단어가 바뀌었는지 세부적으로 보여줍니다.",
        },
        {
          q: "입력한 텍스트가 저장되나요?",
          a: "아니요. 모든 비교는 브라우저에서 로컬로 처리됩니다. 서버에 데이터를 전송하거나 저장하지 않습니다.",
        },
      ]
    : [
        {
          q: "How does the text comparison work?",
          a: "It uses the LCS (Longest Common Subsequence) algorithm to find common parts between two texts and identify added, removed, and modified lines. All processing happens in your browser.",
        },
        {
          q: "Can I compare large texts?",
          a: "Yes, you can. However, extremely large texts (tens of thousands of lines) may affect browser performance. It works well for typical documents and code comparisons.",
        },
        {
          q: "What is the difference between line and word comparison?",
          a: "Line comparison treats each line as a unit. Word comparison additionally highlights which specific words changed within modified lines.",
        },
        {
          q: "Is my text stored anywhere?",
          a: "No. All comparisons are processed locally in your browser. No data is sent to or stored on any server.",
        },
      ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const relatedTools = [
    {
      slug: "word-counter",
      title: isKo ? "글자 수 세기" : "Word Counter",
      desc: isKo
        ? "단어, 문자, 문장, 단락 수를 즉시 계산합니다."
        : "Count words, characters, sentences, and paragraphs instantly.",
    },
    {
      slug: "case-converter",
      title: isKo ? "대소문자 변환기" : "Case Converter",
      desc: isKo
        ? "텍스트를 대문자, 소문자, 제목 형식 등으로 변환합니다."
        : "Convert text between UPPER, lower, Title, camelCase, and more.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ── Header ──────────────────────────────────── */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </header>

        {/* Ad placeholder - top */}
        {/* <div className="mb-6"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

        {/* ── Text inputs ─────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "원본 텍스트" : "Original Text"}
            </label>
            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              placeholder={
                isKo
                  ? "원본 텍스트를 입력하세요..."
                  : "Paste original text here..."
              }
              className="w-full h-64 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm leading-relaxed"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "수정된 텍스트" : "Modified Text"}
            </label>
            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              placeholder={
                isKo
                  ? "수정된 텍스트를 입력하세요..."
                  : "Paste modified text here..."
              }
              className="w-full h-64 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* ── Action buttons ──────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={handleCompare}
            disabled={!leftText && !rightText}
            className="px-5 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isKo ? "비교하기" : "Compare"}
          </button>
          <button
            onClick={handleSwap}
            className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isKo ? "좌우 바꾸기" : "Swap"}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {isKo ? "초기화" : "Clear"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo ? "줄 비교" : "Line"}
            </span>
            <button
              onClick={toggleMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                wordLevel
                  ? "bg-blue-600"
                  : "bg-neutral-300 dark:bg-neutral-600"
              }`}
              role="switch"
              aria-checked={wordLevel}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  wordLevel ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo ? "단어 비교" : "Word"}
            </span>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
              <p className="text-xl font-semibold">{stats.total}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isKo ? "전체 줄" : "Total Lines"}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-3 text-center">
              <p className="text-xl font-semibold text-green-700 dark:text-green-400">
                +{stats.added}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isKo ? "추가" : "Added"}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3 text-center">
              <p className="text-xl font-semibold text-red-700 dark:text-red-400">
                -{stats.removed}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isKo ? "삭제" : "Removed"}
              </p>
            </div>
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-3 text-center">
              <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-400">
                ~{stats.modified}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isKo ? "변경" : "Modified"}
              </p>
            </div>
          </div>
        )}

        {/* ── Diff output ─────────────────────────────── */}
        {diffs && diffs.length > 0 && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800 text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th className="px-3 py-2 w-12 text-right">#</th>
                    <th className="px-3 py-2">
                      {isKo ? "원본" : "Original"}
                    </th>
                    <th className="px-3 py-2 w-12 text-right">#</th>
                    <th className="px-3 py-2">
                      {isKo ? "수정" : "Modified"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {diffs.map((d, i) => {
                    if (d.type === "same") {
                      return (
                        <tr
                          key={i}
                          className="border-t border-neutral-100 dark:border-neutral-800"
                        >
                          <td className="px-3 py-1 text-right text-neutral-400 select-none w-12">
                            {d.leftNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all">
                            {d.leftLine}
                          </td>
                          <td className="px-3 py-1 text-right text-neutral-400 select-none w-12">
                            {d.rightNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all">
                            {d.rightLine}
                          </td>
                        </tr>
                      );
                    }

                    if (d.type === "removed") {
                      return (
                        <tr
                          key={i}
                          className="border-t border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/50"
                        >
                          <td className="px-3 py-1 text-right text-red-400 select-none w-12">
                            {d.leftNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all text-red-700 dark:text-red-400">
                            {d.leftLine}
                          </td>
                          <td className="px-3 py-1 w-12" />
                          <td className="px-3 py-1" />
                        </tr>
                      );
                    }

                    if (d.type === "added") {
                      return (
                        <tr
                          key={i}
                          className="border-t border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/50"
                        >
                          <td className="px-3 py-1 w-12" />
                          <td className="px-3 py-1" />
                          <td className="px-3 py-1 text-right text-green-400 select-none w-12">
                            {d.rightNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all text-green-700 dark:text-green-400">
                            {d.rightLine}
                          </td>
                        </tr>
                      );
                    }

                    // modified
                    if (d.type === "modified") {
                      return (
                        <tr
                          key={i}
                          className="border-t border-yellow-100 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/30"
                        >
                          <td className="px-3 py-1 text-right text-yellow-500 select-none w-12">
                            {d.leftNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all">
                            {wordLevel && d.wordDiffs ? (
                              d.wordDiffs
                                .filter((w) => w.type !== "added")
                                .map((w, wi) => (
                                  <span
                                    key={wi}
                                    className={
                                      w.type === "removed"
                                        ? "bg-red-200 dark:bg-red-800 line-through"
                                        : ""
                                    }
                                  >
                                    {w.text}
                                  </span>
                                ))
                            ) : (
                              <span className="text-red-700 dark:text-red-400">
                                {d.leftLine}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1 text-right text-yellow-500 select-none w-12">
                            {d.rightNum}
                          </td>
                          <td className="px-3 py-1 whitespace-pre-wrap break-all">
                            {wordLevel && d.wordDiffs ? (
                              d.wordDiffs
                                .filter((w) => w.type !== "removed")
                                .map((w, wi) => (
                                  <span
                                    key={wi}
                                    className={
                                      w.type === "added"
                                        ? "bg-green-200 dark:bg-green-800 font-semibold"
                                        : ""
                                    }
                                  >
                                    {w.text}
                                  </span>
                                ))
                            ) : (
                              <span className="text-green-700 dark:text-green-400">
                                {d.rightLine}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }

                    return null;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {diffs && diffs.length === 0 && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-6 text-center mb-8">
            <p className="text-green-700 dark:text-green-400 font-medium">
              {isKo
                ? "두 텍스트가 동일합니다!"
                : "Both texts are identical!"}
            </p>
          </div>
        )}

        {/* Ad placeholder - middle */}
        {/* <div className="my-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

        {/* ── How to Use ──────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {isKo ? "사용 방법" : "How to Use"}
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            {isKo ? (
              <>
                <li>왼쪽 입력란에 원본 텍스트를 붙여넣으세요.</li>
                <li>오른쪽 입력란에 수정된 텍스트를 붙여넣으세요.</li>
                <li>&ldquo;비교하기&rdquo; 버튼을 클릭하면 차이점이 색상으로 표시됩니다.</li>
                <li>줄 비교 / 단어 비교 토글로 비교 단위를 전환할 수 있습니다.</li>
                <li>&ldquo;좌우 바꾸기&rdquo; 버튼으로 원본과 수정본을 교체할 수 있습니다.</li>
              </>
            ) : (
              <>
                <li>Paste your original text in the left textarea.</li>
                <li>Paste the modified text in the right textarea.</li>
                <li>Click &ldquo;Compare&rdquo; to see differences highlighted by color.</li>
                <li>Toggle between Line and Word comparison modes for different detail levels.</li>
                <li>Use &ldquo;Swap&rdquo; to switch the original and modified texts.</li>
              </>
            )}
          </ol>
        </section>

        {/* ── FAQ ─────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {isKo ? "자주 묻는 질문" : "FAQ"}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <summary className="cursor-pointer px-4 py-3 font-medium text-sm select-none">
                  {faq.q}
                </summary>
                <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Related Tools ───────────────────────────── */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {isKo ? "관련 도구" : "Related Tools"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${lang}/tools/${tool.slug}`}
                className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Share + Embed ───────────────────────────── */}
        <ShareButtons
          title={title}
          description={description}
          lang={lang}
          slug="text-diff"
          labels={dict.share}
        />
        <EmbedCodeButton
          slug="text-diff"
          lang={lang}
          labels={dict.embed}
        />

        {/* Ad placeholder - bottom */}
        {/* <div className="mt-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

        {/* ── Related blog posts ──────────────────────── */}
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
                    <span className="text-xs text-neutral-400">
                      {post.date}
                    </span>
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
    </>
  );
}
