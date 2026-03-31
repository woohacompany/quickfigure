"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ────────────────────────────────────────────
   Markdown Parser (no external libraries)
   ──────────────────────────────────────────── */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseInline(text: string): string {
  let result = text;

  // Images ![alt](url) — must come before links
  result = result.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%;height:auto;" />'
  );

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline">$1</a>'
  );

  // Bold **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Strikethrough ~~text~~
  result = result.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Italic *text* or _text_
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");

  // Inline code `code`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  return result;
}

function parseMarkdown(raw: string): string {
  // Escape HTML entities first for security (XSS prevention)
  const escaped = escapeHtml(raw);

  const lines = escaped.split("\n");
  const htmlLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = "";
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  function closeList() {
    if (inUl) {
      htmlLines.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      htmlLines.push("</ol>");
      inOl = false;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      htmlLines.push("</blockquote>");
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks (``` ... ```)
    if (line.trimStart().startsWith("```")) {
      if (!inCodeBlock) {
        closeList();
        closeBlockquote();
        inCodeBlock = true;
        codeBlockLang = line.trimStart().slice(3).trim();
        codeBlockContent = [];
      } else {
        htmlLines.push(
          `<pre class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto text-sm font-mono my-2"><code>${codeBlockContent.join("\n")}</code></pre>`
        );
        inCodeBlock = false;
        codeBlockLang = "";
      }
      continue;
    }

    if (inCodeBlock) {
      // Inside code block - already escaped, just push
      codeBlockContent.push(line);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      closeList();
      closeBlockquote();
      htmlLines.push("");
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim()) || /^___+$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      htmlLines.push('<hr class="my-4 border-neutral-300 dark:border-neutral-600" />');
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      closeList();
      closeBlockquote();
      const level = headerMatch[1].length;
      const content = parseInline(headerMatch[2]);
      const sizes: Record<number, string> = {
        1: "text-2xl font-bold mt-6 mb-3",
        2: "text-xl font-bold mt-5 mb-2",
        3: "text-lg font-semibold mt-4 mb-2",
        4: "text-base font-semibold mt-3 mb-1",
        5: "text-sm font-semibold mt-2 mb-1",
        6: "text-sm font-medium mt-2 mb-1",
      };
      htmlLines.push(`<h${level} class="${sizes[level]}">${content}</h${level}>`);
      continue;
    }

    // Blockquote
    const bqMatch = line.match(/^&gt;\s?(.*)$/);
    if (bqMatch) {
      closeList();
      if (!inBlockquote) {
        htmlLines.push('<blockquote class="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 my-2 text-neutral-600 dark:text-neutral-400 italic">');
        inBlockquote = true;
      }
      htmlLines.push(`<p>${parseInline(bqMatch[1])}</p>`);
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // Unordered list
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (inOl) {
        htmlLines.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        htmlLines.push('<ul class="list-disc list-inside my-2 space-y-1">');
        inUl = true;
      }
      htmlLines.push(`<li>${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (inUl) {
        htmlLines.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        htmlLines.push('<ol class="list-decimal list-inside my-2 space-y-1">');
        inOl = true;
      }
      htmlLines.push(`<li>${parseInline(olMatch[1])}</li>`);
      continue;
    }

    // Regular paragraph
    closeList();
    closeBlockquote();
    htmlLines.push(`<p class="my-2 leading-relaxed">${parseInline(line)}</p>`);
  }

  // Close any remaining open blocks
  if (inCodeBlock) {
    htmlLines.push(
      `<pre class="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto text-sm font-mono my-2"><code>${codeBlockContent.join("\n")}</code></pre>`
    );
  }
  closeList();
  closeBlockquote();

  return htmlLines.join("\n");
}

/* ────────────────────────────────────────────
   Default markdown content
   ──────────────────────────────────────────── */

const DEFAULT_MD_EN = `# Welcome to Markdown Editor

This is a **live preview** Markdown editor. Start typing on the left and see the result on the right!

## Text Formatting

You can write **bold text**, *italic text*, and ~~strikethrough text~~.

Combine them: ***bold and italic***

## Links & Images

[Visit QuickFigure](https://quickfigure.net)

![Sample Image](https://via.placeholder.com/300x100?text=Markdown+Preview)

## Lists

### Unordered List
- First item
- Second item
- Third item

### Ordered List
1. Step one
2. Step two
3. Step three

## Code

Inline code: \`const x = 42;\`

Code block:
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

## Blockquote

> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext documents.

## Horizontal Rule

---

Enjoy writing in Markdown!
`;

const DEFAULT_MD_KO = `# 마크다운 편집기에 오신 것을 환영합니다

이것은 **실시간 미리보기** 마크다운 편집기입니다. 왼쪽에 입력하면 오른쪽에서 결과를 확인할 수 있습니다!

## 텍스트 서식

**굵은 글씨**, *기울임 글씨*, ~~취소선~~을 사용할 수 있습니다.

조합도 가능합니다: ***굵은 기울임***

## 링크 & 이미지

[QuickFigure 방문하기](https://quickfigure.net)

![샘플 이미지](https://via.placeholder.com/300x100?text=Markdown+Preview)

## 목록

### 순서 없는 목록
- 첫 번째 항목
- 두 번째 항목
- 세 번째 항목

### 순서 있는 목록
1. 단계 1
2. 단계 2
3. 단계 3

## 코드

인라인 코드: \`const x = 42;\`

코드 블록:
\`\`\`javascript
function greet(name) {
  return "안녕하세요, " + name + "님!";
}
\`\`\`

## 인용문

> 마크다운은 일반 텍스트 문서에 서식을 추가할 수 있는 경량 마크업 언어입니다.

## 수평선

---

마크다운으로 즐겁게 글을 작성해 보세요!
`;

/* ────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────── */

export default function MarkdownEditorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("markdown-editor");

  const title = isKo
    ? "마크다운 편집기 - 실시간 미리보기 & HTML 내보내기 | QuickFigure"
    : "Online Markdown Editor - Live Preview & HTML Export | QuickFigure";
  const pageTitle = isKo ? "온라인 마크다운 편집기" : "Online Markdown Editor";
  const description = isKo
    ? "무료 온라인 마크다운 편집기. 마크다운을 작성하고 실시간 미리보기와 HTML 내보내기를 이용하세요."
    : "Free online Markdown editor with real-time preview. Write Markdown, see live HTML preview, and export HTML.";

  const [markdown, setMarkdown] = useState(isKo ? DEFAULT_MD_KO : DEFAULT_MD_EN);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [copied, setCopied] = useState<string | null>(null);

  const htmlOutput = useMemo(() => parseMarkdown(markdown), [markdown]);

  function copyHtml() {
    navigator.clipboard.writeText(htmlOutput);
    setCopied("html");
    setTimeout(() => setCopied(null), 2000);
  }

  function copyMarkdown() {
    navigator.clipboard.writeText(markdown);
    setCopied("md");
    setTimeout(() => setCopied(null), 2000);
  }

  function clearEditor() {
    setMarkdown("");
  }

  function downloadMd() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const faqItems = isKo
    ? [
        {
          q: "마크다운이란?",
          a: "마크다운(Markdown)은 일반 텍스트에 간단한 기호를 사용하여 서식을 지정하는 경량 마크업 언어입니다. 제목에는 #, 굵은 글씨에는 **텍스트**, 목록에는 - 등의 기호를 사용합니다. GitHub, 블로그, 기술 문서 등에서 널리 사용됩니다.",
        },
        {
          q: "HTML로 내보낼 수 있나요?",
          a: "네, 'HTML 복사' 버튼을 클릭하면 변환된 HTML 코드가 클립보드에 복사됩니다. 이 HTML을 웹 페이지, 블로그, 이메일 등에 바로 붙여넣어 사용할 수 있습니다.",
        },
        {
          q: "작성한 내용이 저장되나요?",
          a: "아니요, 이 편집기는 브라우저에서 실행되며 서버에 데이터를 전송하지 않습니다. 페이지를 새로고침하면 내용이 사라지므로, 중요한 내용은 '.md 다운로드' 버튼을 사용하여 파일로 저장하세요.",
        },
        {
          q: "표(테이블)를 지원하나요?",
          a: "현재 이 편집기는 제목, 굵게, 기울임, 취소선, 링크, 이미지, 코드 블록, 목록, 인용문, 수평선 등 주요 마크다운 문법을 지원합니다. 표(테이블) 문법은 아직 지원하지 않지만, 향후 업데이트에서 추가될 예정입니다.",
        },
      ]
    : [
        {
          q: "What is Markdown?",
          a: "Markdown is a lightweight markup language that uses simple symbols to format plain text. Use # for headings, **text** for bold, - for lists, and more. It is widely used on GitHub, blogs, technical documentation, and note-taking apps.",
        },
        {
          q: "Can I export to HTML?",
          a: "Yes! Click the 'Copy HTML' button to copy the converted HTML code to your clipboard. You can paste this HTML directly into web pages, blogs, emails, or any HTML editor.",
        },
        {
          q: "Is my content saved?",
          a: "No, this editor runs entirely in your browser and does not send any data to a server. If you refresh the page, your content will be lost. Use the 'Download .md' button to save your work as a file.",
        },
        {
          q: "Does it support tables?",
          a: "Currently, this editor supports headings, bold, italic, strikethrough, links, images, code blocks, lists, blockquotes, and horizontal rules. Table syntax is not yet supported but will be added in a future update.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "왼쪽 편집 영역에 마크다운 문법으로 텍스트를 입력합니다.",
        "오른쪽 미리보기 영역에서 실시간으로 변환된 결과를 확인합니다.",
        "'HTML 복사' 버튼으로 변환된 HTML을 클립보드에 복사하거나, '마크다운 복사' 버튼으로 원본 마크다운을 복사합니다.",
        "'.md 다운로드' 버튼을 클릭하여 마크다운 파일로 저장합니다.",
      ]
    : [
        "Type your text using Markdown syntax in the editor area on the left.",
        "See the live HTML preview on the right panel as you type.",
        "Use 'Copy HTML' to copy the converted HTML or 'Copy Markdown' to copy the raw Markdown text.",
        "Click 'Download .md' to save your Markdown as a file.",
      ];

  const cheatsheetItems = [
    { syntax: "# Heading 1", desc: isKo ? "제목 1" : "Heading 1" },
    { syntax: "## Heading 2", desc: isKo ? "제목 2" : "Heading 2" },
    { syntax: "**bold**", desc: isKo ? "굵은 글씨" : "Bold" },
    { syntax: "*italic*", desc: isKo ? "기울임" : "Italic" },
    { syntax: "~~strike~~", desc: isKo ? "취소선" : "Strikethrough" },
    { syntax: "[text](url)", desc: isKo ? "링크" : "Link" },
    { syntax: "![alt](url)", desc: isKo ? "이미지" : "Image" },
    { syntax: "`code`", desc: isKo ? "인라인 코드" : "Inline Code" },
    { syntax: "```code```", desc: isKo ? "코드 블록" : "Code Block" },
    { syntax: "- item", desc: isKo ? "순서 없는 목록" : "Unordered List" },
    { syntax: "1. item", desc: isKo ? "순서 있는 목록" : "Ordered List" },
    { syntax: "> quote", desc: isKo ? "인용문" : "Blockquote" },
    { syntax: "---", desc: isKo ? "수평선" : "Horizontal Rule" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* SEO Meta via head */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://quickfigure.net/${lang}/tools/markdown-editor`} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={`https://quickfigure.net/${lang}/tools/markdown-editor`} />
      <link rel="alternate" hrefLang="en" href="https://quickfigure.net/en/tools/markdown-editor" />
      <link rel="alternate" hrefLang="ko" href="https://quickfigure.net/ko/tools/markdown-editor" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="markdown-editor" locale={locale} />
      </header>

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={copyHtml}
          className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {copied === "html"
            ? isKo ? "복사됨!" : "Copied!"
            : isKo ? "HTML 복사" : "Copy HTML"}
        </button>
        <button
          onClick={copyMarkdown}
          className="px-4 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {copied === "md"
            ? isKo ? "복사됨!" : "Copied!"
            : isKo ? "마크다운 복사" : "Copy Markdown"}
        </button>
        <button
          onClick={downloadMd}
          className="px-4 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {isKo ? ".md 다운로드" : "Download .md"}
        </button>
        <button
          onClick={clearEditor}
          className="px-4 py-1.5 rounded-md border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          {isKo ? "지우기" : "Clear"}
        </button>
      </div>

      {/* ── Mobile Tab Switcher ── */}
      <div className="flex md:hidden mb-2 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-2 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === "edit"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {isKo ? "편집" : "Edit"}
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === "preview"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400"
          }`}
        >
          {isKo ? "미리보기" : "Preview"}
        </button>
      </div>

      {/* ── Editor + Preview Split ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className={`${activeTab === "preview" ? "hidden md:block" : ""}`}>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "마크다운 입력" : "Markdown Input"}
          </label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={isKo ? "마크다운을 입력하세요..." : "Type your Markdown here..."}
            className="w-full h-[500px] p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className={`${activeTab === "edit" ? "hidden md:block" : ""}`}>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "미리보기" : "Preview"}
          </label>
          <div
            className="w-full h-[500px] p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-y-auto text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />
        </div>
      </div>

      {/* ── Cheatsheet ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "마크다운 문법 요약" : "Markdown Cheatsheet"}
        </h2>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                <th className="p-3 text-left text-neutral-600 dark:text-neutral-400 font-medium">
                  {isKo ? "문법" : "Syntax"}
                </th>
                <th className="p-3 text-left text-neutral-600 dark:text-neutral-400 font-medium">
                  {isKo ? "설명" : "Description"}
                </th>
              </tr>
            </thead>
            <tbody>
              {cheatsheetItems.map((item, i) => (
                <tr
                  key={i}
                  className={
                    i < cheatsheetItems.length - 1
                      ? "border-b border-neutral-200 dark:border-neutral-700"
                      : ""
                  }
                >
                  <td className="p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-800/50">
                    {item.syntax}
                  </td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">
                    {item.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── How to Use ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer p-4 font-medium">
                {item.q}
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* ── Related Tools ── */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "관련 도구" : "Related Tools"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/json-formatter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.jsonFormatter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.jsonFormatterDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/word-counter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.wordCounter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.wordCounterDesc}
            </p>
          </Link>
        </div>
      </section>

      {/* ── Share & Embed ── */}
      <ToolHowItWorks slug="markdown-editor" locale={locale} />
      <ToolDisclaimer slug="markdown-editor" locale={locale} />

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="markdown-editor"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="markdown-editor"
        lang={lang}
        labels={dict.embed}
      />

      {/* ── Related Blog Posts ── */}
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
