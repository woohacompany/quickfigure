"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── UUID generation utilities ── */

function generateUUIDv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function generateUUIDv1(): string {
  // Simplified v1-like: timestamp-based with random node
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const r = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  const clockSeq = ((Math.random() * 0x3fff) | 0x8000).toString(16).padStart(4, "0");
  const node = `${r()}${r()}${r()}${r()}${r()}${r()}`;
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHi = "1" + timeHex.slice(0, 3);
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
}

function generateUUIDv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Set timestamp (first 48 bits) using bit math without BigInt
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;
  // Set version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Set variant 10xx
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

type UUIDVersion = "v1" | "v4" | "v7";

function generateUUID(version: UUIDVersion): string {
  switch (version) {
    case "v1": return generateUUIDv1();
    case "v4": return generateUUIDv4();
    case "v7": return generateUUIDv7();
  }
}

function validateUUID(input: string): { valid: boolean; version: string | null } {
  const cleaned = input.trim().toLowerCase();
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const match = cleaned.match(regex);
  if (!match) {
    // Try without hyphens
    const noHyphen = /^[0-9a-f]{8}([0-9a-f]{4})([0-9a-f])([0-9a-f]{3})([89ab][0-9a-f]{3})([0-9a-f]{12})$/;
    const m2 = cleaned.match(noHyphen);
    if (!m2) return { valid: false, version: null };
    return { valid: true, version: `v${m2[2]}` };
  }
  return { valid: true, version: `v${match[1]}` };
}

export default function UuidGeneratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("uuid-generator");

  const [version, setVersion] = useState<UUIDVersion>("v4");
  const [count, setCount] = useState(1);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Validate tab
  const [tab, setTab] = useState<"generate" | "validate">("generate");
  const [validateInput, setValidateInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ valid: boolean; version: string | null } | null>(null);

  const generate = useCallback(() => {
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = generateUUID(version);
      if (noHyphens) uuid = uuid.replace(/-/g, "");
      if (uppercase) uuid = uuid.toUpperCase();
      uuids.push(uuid);
    }
    setResults(uuids);
    if (uuids.length === 1) {
      navigator.clipboard.writeText(uuids[0]);
      setCopied(uuids[0]);
      setTimeout(() => setCopied(null), 1500);
    }
  }, [version, count, noHyphens, uppercase]);

  function copyAll() {
    const text = results.join("\n");
    navigator.clipboard.writeText(text);
    setCopied("__all__");
    setTimeout(() => setCopied(null), 1500);
  }

  function copySingle(uuid: string) {
    navigator.clipboard.writeText(uuid);
    setCopied(uuid);
    setTimeout(() => setCopied(null), 1500);
  }

  function doValidate() {
    if (!validateInput.trim()) return;
    setValidationResult(validateUUID(validateInput));
  }

  const title = isKo ? "UUID 생성기 - 고유 식별자 생성" : "UUID Generator";
  const description = isKo
    ? "UUID를 온라인으로 즉시 생성하세요. v1/v4/v7 지원, 벌크 생성, 유효성 검사. 개발자 필수 도구."
    : "Generate UUIDs online instantly. Supports v1/v4/v7, bulk generation, and validation. Essential developer tool.";

  const toolUrl = `https://www.quickfigure.net/${lang}/tools/uuid-generator`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description,
  };

  const faqItems = isKo
    ? [
        { q: "UUID란 무엇인가요?", a: "UUID(Universally Unique Identifier)는 128비트 길이의 고유 식별자입니다. 32개의 16진수 문자를 하이픈으로 구분한 형태(예: 550e8400-e29b-41d4-a716-446655440000)로, 중앙 서버 없이도 충돌 없는 고유 ID를 생성할 수 있습니다." },
        { q: "UUID v4와 v7의 차이는?", a: "v4는 완전 랜덤으로 생성되어 가장 널리 사용됩니다. v7은 타임스탬프 기반으로 시간순 정렬이 가능하여 데이터베이스 인덱스 성능이 좋습니다. 신규 프로젝트에서는 v7이 권장됩니다." },
        { q: "UUID가 중복될 확률은?", a: "UUID v4의 경우 약 2^122개의 가능한 값이 있어, 초당 10억 개를 생성해도 100년 동안 중복이 발생할 확률이 약 50%입니다. 실질적으로 중복 불가능합니다." },
        { q: "UUID를 데이터베이스 PK로 사용해도 되나요?", a: "네, 많이 사용합니다. 다만 v4는 랜덤이라 B-tree 인덱스 성능이 떨어질 수 있습니다. v7은 시간순 정렬이 가능하여 인덱스 성능이 좋아 DB PK로 더 적합합니다." },
        { q: "UUID와 GUID의 차이는?", a: "실질적으로 같습니다. UUID는 RFC 4122 표준 용어이고, GUID(Globally Unique Identifier)는 Microsoft에서 사용하는 용어입니다. 형식과 생성 방식이 동일합니다." },
      ]
    : [
        { q: "What is a UUID?", a: "UUID (Universally Unique Identifier) is a 128-bit identifier. It's represented as 32 hexadecimal characters separated by hyphens (e.g., 550e8400-e29b-41d4-a716-446655440000). UUIDs can be generated without a central server while guaranteeing uniqueness." },
        { q: "What's the difference between UUID v4 and v7?", a: "v4 is fully random and the most widely used. v7 is timestamp-based, enabling time-ordered sorting, which improves database index performance. v7 is recommended for new projects." },
        { q: "What are the chances of UUID collision?", a: "UUID v4 has about 2^122 possible values. Even generating 1 billion UUIDs per second, it would take about 100 years for a 50% chance of collision. Practically, collisions are impossible." },
        { q: "Can I use UUID as a database primary key?", a: "Yes, it's common practice. However, v4's randomness can hurt B-tree index performance. v7 is time-ordered and maintains better index performance, making it more suitable as a DB primary key." },
        { q: "What's the difference between UUID and GUID?", a: "They are essentially the same. UUID is the RFC 4122 standard term, while GUID (Globally Unique Identifier) is Microsoft's term. The format and generation methods are identical." },
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

  const tabCls = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
      active
        ? "border-blue-500 text-blue-600 dark:text-blue-400"
        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="uuid-generator" locale={locale} />
      </header>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
        <button className={tabCls(tab === "generate")} onClick={() => setTab("generate")}>
          {isKo ? "생성" : "Generate"}
        </button>
        <button className={tabCls(tab === "validate")} onClick={() => setTab("validate")}>
          {isKo ? "유효성 검사" : "Validate"}
        </button>
      </div>

      {tab === "generate" ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          {/* Version */}
          <div>
            <label className="text-sm font-medium block mb-2">{isKo ? "UUID 버전" : "UUID Version"}</label>
            <div className="flex gap-2">
              {(["v1", "v4", "v7"] as const).map((v) => (
                <button key={v} onClick={() => setVersion(v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                    version === v
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}>
                  {v.toUpperCase()}
                  <span className="text-xs ml-1 opacity-70">
                    {v === "v1" ? (isKo ? "(타임스탬프)" : "(timestamp)") :
                     v === "v4" ? (isKo ? "(랜덤)" : "(random)") :
                     (isKo ? "(시간순)" : "(time-ordered)")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-sm font-medium block mb-2">{isKo ? "생성 개수" : "Count"}</label>
            <input type="number" min="1" max="100" value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-32 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-xs text-neutral-400 ml-2">{isKo ? "최대 100개" : "max 100"}</span>
          </div>

          {/* Format options */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={noHyphens} onChange={(e) => setNoHyphens(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600" />
              {isKo ? "하이픈 제거" : "Remove hyphens"}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)}
                className="rounded border-neutral-300 dark:border-neutral-600" />
              {isKo ? "대문자" : "Uppercase"}
            </label>
          </div>

          {/* Generate button */}
          <button onClick={generate}
            className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer text-lg">
            {isKo ? "UUID 생성" : "Generate UUID"}
            {count === 1 && <span className="text-sm ml-2 opacity-70">{isKo ? "(자동 복사)" : "(auto-copy)"}</span>}
          </button>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">{results.length}{isKo ? "개 생성됨" : " generated"}</span>
                {results.length > 1 && (
                  <button onClick={copyAll}
                    className="px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                    {copied === "__all__" ? (isKo ? "복사됨!" : "Copied!") : (isKo ? "전체 복사" : "Copy All")}
                  </button>
                )}
              </div>
              <div className="rounded-md border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700 max-h-96 overflow-y-auto">
                {results.map((uuid, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <code className="text-sm font-mono break-all">{uuid}</code>
                    <button onClick={() => copySingle(uuid)}
                      className="ml-3 px-2 py-1 rounded text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0">
                      {copied === uuid ? (isKo ? "복사됨!" : "Copied!") : (isKo ? "복사" : "Copy")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Validate Tab */
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
          <div>
            <label className="text-sm font-medium block mb-2">{isKo ? "UUID 입력" : "Enter UUID"}</label>
            <input type="text" value={validateInput}
              onChange={(e) => { setValidateInput(e.target.value); setValidationResult(null); }}
              placeholder="550e8400-e29b-41d4-a716-446655440000"
              className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={doValidate}
            className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer">
            {isKo ? "검증하기" : "Validate"}
          </button>
          {validationResult && (
            <div className={`rounded-lg border-2 p-4 text-center ${
              validationResult.valid
                ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                : "border-red-500 bg-red-50 dark:bg-red-950/30"
            }`}>
              {validationResult.valid ? (
                <>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {isKo ? "유효한 UUID" : "Valid UUID"}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {isKo ? `버전: ${validationResult.version?.toUpperCase()}` : `Version: ${validationResult.version?.toUpperCase()}`}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {isKo ? "유효하지 않은 UUID" : "Invalid UUID"}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <ToolHowItWorks slug="uuid-generator" locale={locale} />
      <ToolDisclaimer slug="uuid-generator" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="uuid-generator" labels={dict.share} />
      <EmbedCodeButton slug="uuid-generator" lang={lang} labels={dict.embed} />

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo ? [
            "UUID 버전을 선택하세요 (v4 랜덤 / v7 시간순 / v1 타임스탬프).",
            "생성할 개수를 선택하세요 (1~100개).",
            "포맷 옵션을 설정하세요 (하이픈 제거, 대문자).",
            "UUID 생성 버튼을 클릭하세요. 1개 생성 시 자동 복사됩니다.",
            "벌크 생성 시 전체 복사 버튼으로 한 번에 복사하세요.",
            "유효성 검사 탭에서 UUID의 유효 여부와 버전을 확인할 수 있습니다.",
          ] : [
            "Select a UUID version (v4 random / v7 time-ordered / v1 timestamp).",
            "Choose how many to generate (1-100).",
            "Set format options (remove hyphens, uppercase).",
            "Click Generate UUID. Single generation auto-copies to clipboard.",
            "For bulk generation, use Copy All to copy all at once.",
            "Use the Validate tab to check UUID validity and version.",
          ]).map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "자주 묻는 질문" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium flex items-center justify-between">
                {item.q}
                <span className="text-neutral-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{isKo ? "관련 도구" : "Related Tools"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { slug: "password-generator", icon: "🔐", name: isKo ? "비밀번호 생성기" : "Password Generator" },
            { slug: "json-formatter", icon: "📋", name: isKo ? "JSON 포맷터" : "JSON Formatter" },
            { slug: "base64-encoder-decoder", icon: "🔄", name: isKo ? "Base64 인코더/디코더" : "Base64 Encoder/Decoder" },
          ].map((tool) => (
            <Link key={tool.slug} href={`/${lang}/tools/${tool.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
              <span className="text-2xl">{tool.icon}</span>
              <h3 className="mt-2 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`}
                  className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tr.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">{tr.summary}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
