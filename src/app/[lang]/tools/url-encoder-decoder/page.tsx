"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
type Mode = "encode" | "decode";

interface ParsedURL {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  hash: string;
  params: { key: string; value: string }[];
}

/* ── URL parser ── */
function parseURL(raw: string): ParsedURL | null {
  try {
    const u = new URL(raw);
    const params: { key: string; value: string }[] = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      params,
    };
  } catch {
    return null;
  }
}

/* ── Main Component ── */
export default function UrlEncoderDecoderPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("url-encoder-decoder");
  const isKo = locale === "ko";

  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [useComponent, setUseComponent] = useState(true); // encodeURIComponent vs encodeURI
  const [copied, setCopied] = useState(false);

  const output = (() => {
    if (!input) return "";
    try {
      if (mode === "encode") {
        return useComponent ? encodeURIComponent(input) : encodeURI(input);
      }
      return useComponent ? decodeURIComponent(input) : decodeURI(input);
    } catch {
      return isKo ? "(유효하지 않은 입력)" : "(Invalid input)";
    }
  })();

  const parsed = parseURL(input);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleSwap = useCallback(() => {
    if (output && !output.startsWith("(")) {
      setInput(output);
      setMode((prev) => (prev === "encode" ? "decode" : "encode"));
    }
  }, [output]);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "URL 인코더 & 디코더" : "URL Encoder & Decoder",
    description: isKo
      ? "URL을 인코딩하거나 디코딩하세요. 한글 URL 변환, 쿼리 파라미터 파싱. 가입 없이 무료."
      : "Encode or decode URLs online. Parse query parameters, convert special characters. Free, no signup.",
    url: `https://www.quickfigure.net/${lang}/tools/url-encoder-decoder`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        {
          q: "URL 인코딩이란?",
          a: "URL 인코딩(퍼센트 인코딩)은 URL에서 사용할 수 없는 문자를 %XX 형태로 변환하는 것입니다. 예를 들어 한글 '가'는 %EA%B0%80으로 변환됩니다.",
        },
        {
          q: "encodeURIComponent와 encodeURI의 차이는?",
          a: "encodeURI는 전체 URL 구조를 유지하면서 인코딩합니다(://,/,?,# 등은 인코딩하지 않음). encodeURIComponent는 모든 특수문자를 인코딩하므로 쿼리 파라미터 값에 적합합니다.",
        },
        {
          q: "왜 URL 인코딩이 필요한가요?",
          a: "URL에는 ASCII 문자만 허용됩니다. 한글, 공백, 특수문자 등을 URL에 포함하려면 퍼센트 인코딩으로 변환해야 브라우저와 서버가 올바르게 처리할 수 있습니다.",
        },
        {
          q: "데이터가 안전한가요?",
          a: "네. 모든 인코딩/디코딩은 브라우저에서 처리됩니다. 서버로 데이터가 전송되지 않으며, 입력한 내용은 기기를 벗어나지 않습니다.",
        },
        {
          q: "URL 파싱은 무엇인가요?",
          a: "URL 파싱은 전체 URL을 protocol, host, path, query parameters, hash 등의 구성 요소로 분리하는 것입니다. 디버깅이나 API 개발 시 유용합니다.",
        },
      ]
    : [
        {
          q: "What is URL encoding?",
          a: "URL encoding (percent-encoding) converts characters that aren't allowed in URLs into %XX format. For example, a space becomes %20 and non-ASCII characters like Korean are converted to their UTF-8 byte sequences.",
        },
        {
          q: "What's the difference between encodeURIComponent and encodeURI?",
          a: "encodeURI preserves the URL structure (doesn't encode ://, /, ?, # etc.). encodeURIComponent encodes all special characters, making it ideal for encoding query parameter values.",
        },
        {
          q: "Why is URL encoding necessary?",
          a: "URLs can only contain ASCII characters. To include spaces, non-ASCII characters, or reserved characters in URLs, they must be percent-encoded so browsers and servers can process them correctly.",
        },
        {
          q: "Is my data safe?",
          a: "Yes. All encoding and decoding is performed entirely in your browser. No data is sent to any server. Your input never leaves your device.",
        },
        {
          q: "What is URL parsing?",
          a: "URL parsing breaks a full URL into its components: protocol, host, path, query parameters, and hash. It's useful for debugging and API development.",
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

  const toolTitle = isKo ? "URL 인코더 & 디코더" : "URL Encoder & Decoder";
  const toolDescription = isKo
    ? "URL을 인코딩하거나 디코딩하세요. 한글 URL 변환, 쿼리 파라미터 파싱. 가입 없이 무료."
    : "Encode or decode URLs online. Parse query parameters, convert special characters. Free, no signup.";

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
            ? "URL 인코더 & 디코더 - URL 인코딩 디코딩 온라인"
            : "URL Encoder & Decoder - Encode / Decode URLs Online"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "URL을 인코딩하거나 디코딩하세요. 한글 URL 변환, 쿼리 파라미터 파싱. 가입 없이 무료."
            : "Encode or decode URLs online. Parse query parameters, convert special characters. Free, no signup."}
        </p>

        <ToolAbout slug="url-encoder-decoder" locale={locale} />
      </header>

      {/* Mode Toggle: Encode / Decode */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <button
          onClick={() => setMode("encode")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            mode === "encode"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          {isKo ? "인코딩" : "Encode"}
        </button>
        <button
          onClick={() => setMode("decode")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            mode === "decode"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          {isKo ? "디코딩" : "Decode"}
        </button>
      </div>

      {/* Function Toggle */}
      <div className="mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={useComponent}
            onChange={(e) => setUseComponent(e.target.checked)}
            className="rounded border-neutral-300 dark:border-neutral-600"
          />
          <span className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
            {mode === "encode" ? "encodeURIComponent" : "decodeURIComponent"}
          </span>
        </label>
        <span className="text-xs text-neutral-400">
          {isKo
            ? useComponent
              ? "(모든 특수문자 인코딩 — 쿼리 값에 적합)"
              : "(URL 구조 유지 — 전체 URL에 적합)"
            : useComponent
              ? "(Encodes all special chars — best for query values)"
              : "(Preserves URL structure — best for full URLs)"}
        </span>
      </div>

      {/* Input */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {isKo ? "입력" : "Input"}
            {input.length > 0 && (
              <span className="ml-2 text-xs text-neutral-400 font-normal">
                {input.length.toLocaleString()} {isKo ? "글자" : "chars"}
              </span>
            )}
          </label>
          {input && (
            <button
              onClick={() => setInput("")}
              className="text-xs px-2 py-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
            >
              {isKo ? "지우기" : "Clear"}
            </button>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isKo
              ? mode === "encode"
                ? "인코딩할 텍스트를 입력하세요... (예: 안녕하세요 or https://example.com/path?q=한글)"
                : "디코딩할 URL 인코딩 문자열을 입력하세요... (예: %EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94)"
              : mode === "encode"
                ? "Enter text to encode... (e.g., Hello World or https://example.com/path?q=hello world)"
                : "Enter URL-encoded string to decode... (e.g., Hello%20World)"
          }
          spellCheck={false}
          className="w-full min-h-[120px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-neutral-400"
        />
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={handleSwap}
          disabled={!output || output.startsWith("(")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {isKo ? "입력 ↔ 출력 교환" : "Swap Input ↔ Output"}
        </button>
      </div>

      {/* Output */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">
            {isKo ? "결과" : "Result"}
          </label>
          <button
            onClick={() => handleCopy(output)}
            disabled={!output || output.startsWith("(")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              !output || output.startsWith("(")
                ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : copied
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copied ? (isKo ? "복사됨!" : "Copied!") : (isKo ? "복사" : "Copy")}
          </button>
        </div>
        <div className="w-full min-h-[120px] p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 font-mono text-sm leading-relaxed break-all whitespace-pre-wrap">
          {output || (
            <span className="text-neutral-400">
              {isKo ? "결과가 여기에 표시됩니다" : "Result will appear here"}
            </span>
          )}
        </div>
      </div>

      {/* URL Parsing Section */}
      {parsed && (
        <section className="mt-6 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
          <h2 className="text-sm font-semibold mb-3">
            {isKo ? "URL 파싱 결과" : "URL Parsing Result"}
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex gap-2">
              <span className="w-20 text-neutral-400 flex-shrink-0">Protocol</span>
              <span className="text-neutral-700 dark:text-neutral-300 break-all">{parsed.protocol}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-20 text-neutral-400 flex-shrink-0">Host</span>
              <span className="text-neutral-700 dark:text-neutral-300 break-all">{parsed.host}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-20 text-neutral-400 flex-shrink-0">Path</span>
              <span className="text-neutral-700 dark:text-neutral-300 break-all">{parsed.pathname}</span>
            </div>
            {parsed.search && (
              <div className="flex gap-2">
                <span className="w-20 text-neutral-400 flex-shrink-0">Search</span>
                <span className="text-neutral-700 dark:text-neutral-300 break-all">{parsed.search}</span>
              </div>
            )}
            {parsed.hash && (
              <div className="flex gap-2">
                <span className="w-20 text-neutral-400 flex-shrink-0">Hash</span>
                <span className="text-neutral-700 dark:text-neutral-300 break-all">{parsed.hash}</span>
              </div>
            )}
          </div>

          {/* Query Parameters */}
          {parsed.params.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="text-sm font-semibold mb-2">
                {isKo ? "쿼리 파라미터" : "Query Parameters"} ({parsed.params.length})
              </h3>
              <div className="space-y-2">
                {parsed.params.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    <span className="text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">{p.key}</span>
                    <span className="text-neutral-400">=</span>
                    <span className="text-neutral-700 dark:text-neutral-300 break-all">{p.value}</span>
                    <button
                      onClick={() => handleCopy(`${p.key}=${encodeURIComponent(p.value)}`)}
                      className="ml-auto text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer flex-shrink-0"
                    >
                      {isKo ? "복사" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* encodeURI vs encodeURIComponent Explanation */}
      <section className="mt-8 p-4 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20">
        <h2 className="text-sm font-semibold mb-3 text-blue-700 dark:text-blue-400">
          encodeURI vs encodeURIComponent
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1 font-mono text-xs">encodeURI()</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              {isKo
                ? "전체 URL을 인코딩할 때 사용. :, /, ?, #, & 등 URL 구조 문자는 유지합니다."
                : "Use for encoding full URLs. Preserves URL structure characters like :, /, ?, #, &."}
            </p>
            <code className="block mt-2 text-xs bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200 dark:border-neutral-700">
              encodeURI(&quot;https://example.com/path?q=hello world&quot;)
              <br />
              <span className="text-green-600 dark:text-green-400">
                → https://example.com/path?q=hello%20world
              </span>
            </code>
          </div>
          <div>
            <h3 className="font-medium mb-1 font-mono text-xs">encodeURIComponent()</h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              {isKo
                ? "쿼리 파라미터 값을 인코딩할 때 사용. 모든 특수문자를 인코딩합니다."
                : "Use for encoding query parameter values. Encodes all special characters."}
            </p>
            <code className="block mt-2 text-xs bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200 dark:border-neutral-700">
              encodeURIComponent(&quot;hello world&name=test&quot;)
              <br />
              <span className="text-green-600 dark:text-green-400">
                → hello%20world%26name%3Dtest
              </span>
            </code>
          </div>
        </div>
      </section>

      <ToolHowItWorks slug="url-encoder-decoder" locale={locale} />
      <ToolDisclaimer slug="url-encoder-decoder" locale={locale} />

      <ShareButtons
        title={toolTitle}
        description={toolDescription}
        lang={lang}
        slug="url-encoder-decoder"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="url-encoder-decoder"
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
                "인코딩 또는 디코딩 모드를 선택하세요.",
                "encodeURIComponent(쿼리 값용) 또는 encodeURI(전체 URL용)를 선택하세요.",
                "텍스트를 입력하면 실시간으로 결과가 표시됩니다.",
                "URL을 입력하면 protocol, host, path, 쿼리 파라미터로 자동 파싱됩니다.",
                "결과 복사 버튼을 클릭하거나, 교환 버튼으로 입력과 출력을 바꿀 수 있습니다.",
              ]
            : [
                "Select Encode or Decode mode.",
                "Choose encodeURIComponent (for query values) or encodeURI (for full URLs).",
                "Enter text and see the result update in real time.",
                "If you enter a URL, it will be automatically parsed into protocol, host, path, and query parameters.",
                "Click Copy to copy the result, or use the Swap button to exchange input and output.",
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
