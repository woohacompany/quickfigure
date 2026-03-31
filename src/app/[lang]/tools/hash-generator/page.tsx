"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";
const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

/* ── SHA via Web Crypto API ── */
async function computeSHA(algorithm: string, data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── Pure JS MD5 (RFC 1321) ── */
function md5(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  function leftRotate(x: number, c: number): number {
    return (x << c) | (x >>> (32 - c));
  }

  // Per-round shift amounts
  const s: number[] = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Pre-computed K table: floor(2^32 * abs(sin(i+1)))
  const K: number[] = [];
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  // Pre-processing: adding padding bits
  const originalLenBits = bytes.length * 8;
  // Append 0x80
  let msgLen = bytes.length + 1;
  // Pad to 56 mod 64
  while (msgLen % 64 !== 56) {
    msgLen++;
  }
  // Add 8 bytes for original length
  msgLen += 8;

  const msg = new Uint8Array(msgLen);
  msg.set(bytes);
  msg[bytes.length] = 0x80;

  // Append original length in bits as 64-bit little-endian
  const lenView = new DataView(msg.buffer, msg.byteLength - 8);
  lenView.setUint32(0, originalLenBits >>> 0, true);
  lenView.setUint32(4, Math.floor(originalLenBits / 0x100000000) >>> 0, true);

  // Initialize hash values
  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  // Process each 512-bit (64-byte) chunk
  const view = new DataView(msg.buffer);
  for (let offset = 0; offset < msg.length; offset += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;

      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + leftRotate(F, s[i])) >>> 0;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Output as hex (little-endian)
  function toHexLE(val: number): string {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      hex += ((val >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return hex;
  }

  return toHexLE(a0) + toHexLE(b0) + toHexLE(c0) + toHexLE(d0);
}

/* ── Format file size ── */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/* ── Main Component ── */
export default function HashGeneratorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("hash-generator");
  const isKo = locale === "ko";

  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"text" | "file">("text");
  const [hashes, setHashes] = useState<Record<Algorithm, string>>({
    "MD5": "",
    "SHA-1": "",
    "SHA-256": "",
    "SHA-512": "",
  });
  const [isComputing, setIsComputing] = useState(false);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [caseUpper, setCaseUpper] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [compareHash1, setCompareHash1] = useState("");
  const [compareHash2, setCompareHash2] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const computeHashes = useCallback(async (data: ArrayBuffer) => {
    setIsComputing(true);
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        computeSHA("SHA-1", data),
        computeSHA("SHA-256", data),
        computeSHA("SHA-512", data),
      ]);
      const md5Result = md5(data);
      setHashes({
        "MD5": md5Result,
        "SHA-1": sha1,
        "SHA-256": sha256,
        "SHA-512": sha512,
      });
    } finally {
      setIsComputing(false);
    }
  }, []);

  // Compute hashes when text input changes
  useEffect(() => {
    if (tab === "text" && input) {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      computeHashes(data.buffer as ArrayBuffer);
    } else if (tab === "text" && !input) {
      setHashes({ "MD5": "", "SHA-1": "", "SHA-256": "", "SHA-512": "" });
    }
  }, [input, tab, computeHashes]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        if (buffer) computeHashes(buffer);
      };
      reader.readAsArrayBuffer(file);
      e.target.value = "";
    },
    [computeHashes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setFileSize(file.size);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        if (buffer) computeHashes(buffer);
      };
      reader.readAsArrayBuffer(file);
    },
    [computeHashes]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleCopy = useCallback(
    (algo: string, value: string) => {
      const displayValue = caseUpper ? value.toUpperCase() : value.toLowerCase();
      navigator.clipboard.writeText(displayValue);
      setCopiedAlgo(algo);
      setTimeout(() => setCopiedAlgo(null), 2000);
    },
    [caseUpper]
  );

  const compareResult = (() => {
    if (!compareHash1 || !compareHash2) return null;
    return compareHash1.trim().toLowerCase() === compareHash2.trim().toLowerCase();
  })();

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "해시 생성기" : "Hash Generator",
    description: isKo
      ? "MD5, SHA-1, SHA-256, SHA-512 해시값을 생성하고 비교하세요. 텍스트와 파일 모두 지원."
      : "Generate MD5, SHA-1, SHA-256, SHA-512 hashes. Supports both text and file input.",
    url: `https://quickfigure.net/${lang}/tools/hash-generator`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        {
          q: "해시 함수란?",
          a: "해시 함수는 어떤 크기의 입력 데이터든 고정된 크기의 출력(해시값)을 생성합니다. 같은 입력은 항상 같은 해시를 만들지만, 해시에서 원본 데이터를 복원하는 것은 사실상 불가능합니다.",
        },
        {
          q: "MD5는 아직 안전한가요?",
          a: "MD5는 알려진 충돌 취약점으로 더 이상 암호학적으로 안전하지 않습니다. 체크섬이나 비보안 용도에는 괜찮지만, 비밀번호 해싱 같은 보안 용도에는 SHA-256 또는 SHA-512를 사용하세요.",
        },
        {
          q: "SHA-256과 SHA-512의 차이는?",
          a: "SHA-256은 256비트(64자 16진수) 해시를, SHA-512는 512비트(128자 16진수) 해시를 생성합니다. SHA-512가 더 큰 보안 마진을 제공하지만 약간 느립니다. 둘 다 현재 애플리케이션에 안전합니다.",
        },
        {
          q: "데이터가 안전한가요?",
          a: "네. 모든 해싱은 Web Crypto API를 사용하여 브라우저에서 처리됩니다. 서버로 데이터가 전송되지 않으며, 텍스트와 파일은 기기를 벗어나지 않습니다.",
        },
        {
          q: "파일 무결성을 어떻게 검증하나요?",
          a: "파일을 업로드하여 해시를 생성한 후, 파일 원본 소스에서 제공하는 해시와 비교하세요. 일치하면 파일이 변조되지 않은 것입니다.",
        },
      ]
    : [
        {
          q: "What is a hash function?",
          a: "A hash function takes input data of any size and produces a fixed-size output (hash value). The same input always produces the same hash, but it's practically impossible to reverse the process \u2014 you can't recover the original data from the hash.",
        },
        {
          q: "Is MD5 still safe to use?",
          a: "MD5 is no longer considered cryptographically secure due to known collision vulnerabilities. It's fine for checksums and non-security purposes, but use SHA-256 or SHA-512 for security-critical applications like password hashing.",
        },
        {
          q: "What's the difference between SHA-256 and SHA-512?",
          a: "SHA-256 produces a 256-bit (64-character hex) hash, while SHA-512 produces a 512-bit (128-character hex) hash. SHA-512 offers a larger security margin but is slightly slower. Both are considered secure for current applications.",
        },
        {
          q: "Is my data safe?",
          a: "Yes. All hashing is performed entirely in your browser using the Web Crypto API. No data is sent to any server. Your text and files never leave your device.",
        },
        {
          q: "How do I verify file integrity with a hash?",
          a: "Upload the file to generate its hash, then compare the result with the hash provided by the file's source. If they match, the file hasn't been tampered with.",
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

  const toolTitle = isKo ? "해시 생성기" : "Hash Generator";
  const toolDescription = isKo
    ? "MD5, SHA-1, SHA-256, SHA-512 해시값을 생성하고 비교하세요. 텍스트와 파일 모두 지원."
    : "Generate MD5, SHA-1, SHA-256, SHA-512 hashes. Supports both text and file input.";

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
            ? "해시 생성기 - MD5 / SHA-256 해시 계산"
            : "Hash Generator - MD5 / SHA-256 Hash Calculator"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "무료 온라인 해시 생성기. 텍스트나 파일의 MD5, SHA-1, SHA-256, SHA-512 해시값을 즉시 계산하세요. 가입 없이 무료."
            : "Free online hash generator. Instantly compute MD5, SHA-1, SHA-256, SHA-512 hashes for text or files. No signup needed."}
        </p>

        <ToolAbout slug="hash-generator" locale={locale} />
      </header>

      {/* Tab: Text | File */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <button
          onClick={() => setTab("text")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === "text"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          {isKo ? "텍스트" : "Text"}
        </button>
        <button
          onClick={() => setTab("file")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === "file"
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          {isKo ? "파일" : "File"}
        </button>
      </div>

      {/* Text Input */}
      {tab === "text" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">
              {isKo ? "텍스트 입력" : "Text Input"}
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
                ? "해시를 생성할 텍스트를 입력하세요..."
                : "Enter text to generate hash..."
            }
            spellCheck={false}
            className="w-full min-h-[160px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-neutral-400"
          />
        </div>
      )}

      {/* File Upload */}
      {tab === "file" && (
        <div className="mb-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col items-center justify-center min-h-[160px] p-6 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer"
          >
            <svg
              className="w-10 h-10 mb-3 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "클릭하거나 파일을 드래그하여 업로드"
                : "Click or drag a file to upload"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {isKo ? "모든 파일 형식 지원" : "All file types supported"}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          {fileName && (
            <div className="mt-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-neutral-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {fileName}
                </span>
                <span className="text-neutral-400 text-xs flex-shrink-0">
                  ({formatFileSize(fileSize)})
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Computing indicator */}
      {isComputing && (
        <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {isKo ? "해시 계산 중..." : "Computing hashes..."}
        </div>
      )}

      {/* Hash Results */}
      <div className="mb-4 space-y-3">
        {ALGORITHMS.map((algo) => {
          const hashValue = hashes[algo];
          const displayHash = hashValue
            ? caseUpper
              ? hashValue.toUpperCase()
              : hashValue.toLowerCase()
            : isKo
              ? "결과가 여기에 표시됩니다"
              : "Hash will appear here";
          return (
            <div
              key={algo}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex items-center justify-between p-3">
                <span className="text-sm font-medium w-20 flex-shrink-0">
                  {algo}
                </span>
                <code
                  className={`flex-1 text-xs font-mono break-all mx-3 ${
                    hashValue
                      ? "text-neutral-600 dark:text-neutral-400"
                      : "text-neutral-400 dark:text-neutral-600"
                  }`}
                >
                  {displayHash}
                </code>
                <button
                  onClick={() => handleCopy(algo, hashValue)}
                  disabled={!hashValue}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer flex-shrink-0 ${
                    !hashValue
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                      : copiedAlgo === algo
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {copiedAlgo === algo
                    ? isKo
                      ? "복사됨!"
                      : "Copied!"
                    : isKo
                      ? "복사"
                      : "Copy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Toggle */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setCaseUpper(!caseUpper)}
          className="text-xs px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          {caseUpper
            ? isKo
              ? "소문자로 표시"
              : "Show Lowercase"
            : isKo
              ? "대문자로 표시"
              : "Show Uppercase"}
        </button>
      </div>

      {/* Hash Comparison Section */}
      <section className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold mb-4">
          {isKo ? "해시 비교" : "Compare Hashes"}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">
              {isKo ? "해시 1" : "Hash 1"}
            </label>
            <input
              type="text"
              value={compareHash1}
              onChange={(e) => setCompareHash1(e.target.value)}
              placeholder={isKo ? "첫 번째 해시값 입력..." : "Enter first hash..."}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {isKo ? "해시 2" : "Hash 2"}
            </label>
            <input
              type="text"
              value={compareHash2}
              onChange={(e) => setCompareHash2(e.target.value)}
              placeholder={isKo ? "두 번째 해시값 입력..." : "Enter second hash..."}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {compareResult !== null && (
            <div
              className={`p-3 rounded-lg border text-sm font-medium ${
                compareResult
                  ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
              }`}
            >
              {compareResult
                ? isKo
                  ? "일치합니다! 두 해시값이 동일합니다."
                  : "Match! The two hash values are identical."
                : isKo
                  ? "불일치! 두 해시값이 다릅니다."
                  : "No match! The two hash values are different."}
            </div>
          )}
        </div>
      </section>

      <ToolHowItWorks slug="hash-generator" locale={locale} />
      <ToolDisclaimer slug="hash-generator" locale={locale} />

      <ShareButtons
        title={toolTitle}
        description={toolDescription}
        lang={lang}
        slug="hash-generator"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="hash-generator"
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
                "텍스트 또는 파일 탭을 선택하여 입력 방식을 고르세요.",
                "텍스트를 입력하거나 파일을 업로드하여 해시값을 생성하세요.",
                "4가지 해시 알고리즘(MD5, SHA-1, SHA-256, SHA-512)이 동시에 계산됩니다.",
                "해시값 옆의 복사 버튼을 클릭하여 클립보드에 복사하세요.",
                "비교 섹션에서 두 해시값의 일치 여부를 확인하세요.",
              ]
            : [
                "Choose Text or File tab to select your input method.",
                "Enter text or upload a file to generate hash values.",
                "All four hash algorithms (MD5, SHA-1, SHA-256, SHA-512) compute simultaneously.",
                "Click Copy next to any hash value to copy it to your clipboard.",
                "Use the Compare section to verify two hash values match.",
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
