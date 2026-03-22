"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

/* ── Types ── */
type MainTab = "text" | "image";
type Direction = "encode" | "decode";

/* ── Helpers ── */
function toBase64(str: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return b64;
}

function fromBase64(b64: string): string {
  // Handle URL-safe Base64
  let normalized = b64.trim().replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (normalized.length % 4 !== 0) normalized += "=";
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Component ── */
export default function Base64Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const t = dict.base64;
  const relatedPosts = getPostsByTool("base64-encoder-decoder");
  const isKo = locale === "ko";

  // Main tab
  const [mainTab, setMainTab] = useState<MainTab>("text");

  // Text tab state
  const [textInput, setTextInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [textError, setTextError] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Image tab state
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageError, setImageError] = useState("");
  const [copiedImage, setCopiedImage] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Text tab logic ──
  const handleTextConvert = useCallback(() => {
    if (!textInput.trim()) {
      setTextOutput("");
      setTextError("");
      return;
    }
    try {
      if (direction === "encode") {
        setTextOutput(toBase64(textInput, urlSafe));
      } else {
        setTextOutput(fromBase64(textInput));
      }
      setTextError("");
    } catch {
      setTextError(
        direction === "encode"
          ? (isKo ? "\uC785\uB825\uC744 \uC778\uCF54\uB529\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." : "Failed to encode the input.")
          : (isKo ? "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 Base64 \uBB38\uC790\uC5F4\uC785\uB2C8\uB2E4." : "Invalid Base64 string.")
      );
      setTextOutput("");
    }
  }, [textInput, direction, urlSafe, isKo]);

  const swapTextIO = useCallback(() => {
    setTextInput(textOutput);
    setTextOutput("");
    setTextError("");
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  }, [textOutput]);

  const copyTextOutput = useCallback(() => {
    if (!textOutput) return;
    navigator.clipboard.writeText(textOutput);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }, [textOutput]);

  const textInputStats = useMemo(() => {
    const chars = textInput.length;
    const bytes = new TextEncoder().encode(textInput).length;
    return { chars, bytes };
  }, [textInput]);

  const textOutputStats = useMemo(() => {
    const chars = textOutput.length;
    const bytes = new TextEncoder().encode(textOutput).length;
    return { chars, bytes };
  }, [textOutput]);

  // ── Image tab logic ──
  const handleImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageError(isKo ? "\uC774\uBBF8\uC9C0 \uD30C\uC77C\uB9CC \uC5C5\uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." : "Only image files can be uploaded.");
      return;
    }
    setImageError("");
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [isKo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }, [handleImageFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleBase64ToImage = useCallback(() => {
    if (!imageInput.trim()) return;
    setImageError("");
    try {
      let src = imageInput.trim();
      // If it doesn't start with data:, assume raw base64 for PNG
      if (!src.startsWith("data:")) {
        src = `data:image/png;base64,${src}`;
      }
      setImagePreview(src);
      setImageBase64(src);
      setImageFileName("");
    } catch {
      setImageError(isKo ? "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 Base64 \uC774\uBBF8\uC9C0\uC785\uB2C8\uB2E4." : "Invalid Base64 image string.");
    }
  }, [imageInput, isKo]);

  const copyImageBase64 = useCallback(() => {
    if (!imageBase64) return;
    navigator.clipboard.writeText(imageBase64);
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2000);
  }, [imageBase64]);

  const clearImage = useCallback(() => {
    setImageBase64("");
    setImagePreview("");
    setImageFileName("");
    setImageError("");
    setImageInput("");
  }, []);

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: isKo ? "Base64 \uC778\uCF54\uB354 & \uB514\uCF54\uB354" : "Base64 Encoder & Decoder",
    description: isKo
      ? "\uBB34\uB8CC Base64 \uC778\uCF54\uB354/\uB514\uCF54\uB354. \uD14D\uC2A4\uD2B8\xB7\uC774\uBBF8\uC9C0 Base64 \uBCC0\uD658."
      : "Free Base64 encoder/decoder. Convert text and images to/from Base64.",
    url: `https://quickfigure.net/${lang}/tools/base64-encoder-decoder`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqItems = isKo
    ? [
        { q: "Base64 \uC778\uCF54\uB529\uC774\uB780 \uBB34\uC5C7\uC778\uAC00\uC694?", a: "Base64\uB294 \uBC14\uC774\uB108\uB9AC \uB370\uC774\uD130\uB97C ASCII \uBB38\uC790\uC5F4\uB85C \uBCC0\uD658\uD558\uB294 \uC778\uCF54\uB529 \uBC29\uBC95\uC785\uB2C8\uB2E4. 3\uBC14\uC774\uD2B8\uB97C 4\uAC1C\uC758 \uC548\uC804\uD55C ASCII \uBB38\uC790\uB85C \uBCC0\uD658\uD558\uC5EC \uC774\uBA54\uC77C, URL, JSON \uB4F1\uC5D0\uC11C \uC548\uC804\uD558\uAC8C \uC804\uC1A1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." },
        { q: "URL-safe Base64\uB780 \uBB34\uC5C7\uC778\uAC00\uC694?", a: "\uD45C\uC900 Base64\uC758 +\uC640 /\uB97C URL\uC5D0\uC11C \uC548\uC804\uD55C -\uC640 _\uB85C \uAD50\uCCB4\uD55C \uBC84\uC804\uC785\uB2C8\uB2E4. URL \uD30C\uB77C\uBBF8\uD130, JWT \uD1A0\uD070, API \uD1B5\uC2E0\uC5D0\uC11C \uC8FC\uB85C \uC0AC\uC6A9\uD569\uB2C8\uB2E4." },
        { q: "\uC774\uBBF8\uC9C0\uB97C Base64\uB85C \uBCC0\uD658\uD558\uBA74 \uC5B4\uB514\uC5D0 \uC0AC\uC6A9\uD558\uB098\uC694?", a: "HTML/CSS\uC5D0 \uC774\uBBF8\uC9C0\uB97C \uC9C1\uC811 \uC784\uBCA0\uB529(data URI)\uD558\uAC70\uB098, API \uC694\uCCAD \uBCF8\uBB38\uC5D0 \uC774\uBBF8\uC9C0\uB97C \uD3EC\uD568\uD560 \uB54C \uC0AC\uC6A9\uD569\uB2C8\uB2E4. \uBCC4\uB3C4 \uD30C\uC77C \uC5C5\uB85C\uB4DC \uC5C6\uC774 \uC774\uBBF8\uC9C0\uB97C \uC804\uC1A1\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." },
        { q: "\uB370\uC774\uD130\uAC00 \uC11C\uBC84\uB85C \uC804\uC1A1\uB418\uB098\uC694?", a: "\uC544\uB2C8\uC694, \uBAA8\uB4E0 \uBCC0\uD658\uC740 \uBE0C\uB77C\uC6B0\uC800\uC5D0\uC11C \uCC98\uB9AC\uB429\uB2C8\uB2E4. \uC5B4\uB5A4 \uB370\uC774\uD130\uB3C4 \uC11C\uBC84\uB85C \uC804\uC1A1\uB418\uC9C0 \uC54A\uC544 \uC548\uC804\uD569\uB2C8\uB2E4." },
      ]
    : [
        { q: "What is Base64 encoding?", a: "Base64 is an encoding method that converts binary data into ASCII text. It transforms 3 bytes into 4 safe ASCII characters, making it suitable for email, URLs, JSON, and other text-based protocols." },
        { q: "What is URL-safe Base64?", a: "URL-safe Base64 replaces + with - and / with _ from standard Base64. It also removes padding (=). This variant is commonly used in URL parameters, JWT tokens, and API communications." },
        { q: "Why convert images to Base64?", a: "Base64-encoded images can be embedded directly in HTML/CSS (data URIs) or included in API request bodies. This eliminates the need for separate file uploads and reduces HTTP requests." },
        { q: "Is my data sent to a server?", a: "No, all conversions happen in your browser. No data is transmitted to any server. Your text and images never leave your device." },
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
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
          {isKo ? "Base64 \uC778\uCF54\uB354 & \uB514\uCF54\uB354" : "Base64 Encoder & Decoder"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {isKo
            ? "\uBB34\uB8CC Base64 \uC778\uCF54\uB354/\uB514\uCF54\uB354. \uD14D\uC2A4\uD2B8\xB7\uC774\uBBF8\uC9C0 Base64 \uBCC0\uD658. \uBE60\uB974\uACE0 \uC548\uC804\uD55C \uD074\uB77C\uC774\uC5B8\uD2B8 \uCC98\uB9AC. \uAC00\uC785 \uC5C6\uC774 \uBB34\uB8CC."
            : "Free Base64 encoder/decoder. Convert text and images to/from Base64. Fast, secure, client-side processing. No signup needed."}
        </p>
      </header>

      {/* Main Tab Bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {([
          { id: "text" as MainTab, label: isKo ? "Text \u2194 Base64" : "Text \u2194 Base64" },
          { id: "image" as MainTab, label: isKo ? "Image \u2194 Base64" : "Image \u2194 Base64" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mainTab === tab.id
                ? "bg-white dark:bg-neutral-700 text-foreground shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ Text Tab ══════ */}
      {mainTab === "text" && (
        <div>
          {/* Direction + URL-safe toggle */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex gap-2">
              {([
                { id: "encode" as Direction, label: isKo ? "\uC778\uCF54\uB529 (Text \u2192 Base64)" : "Encode (Text \u2192 Base64)" },
                { id: "decode" as Direction, label: isKo ? "\uB514\uCF54\uB529 (Base64 \u2192 Text)" : "Decode (Base64 \u2192 Text)" },
              ]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setDirection(opt.id); setTextOutput(""); setTextError(""); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    direction === opt.id
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {direction === "encode" && (
              <label className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                  className="rounded"
                />
                URL-safe Base64
              </label>
            )}
          </div>

          {/* Input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                {direction === "encode" ? (isKo ? "\uD14D\uC2A4\uD2B8 \uC785\uB825" : "Text Input") : (isKo ? "Base64 \uC785\uB825" : "Base64 Input")}
                {textInput && (
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    {textInputStats.chars.toLocaleString()} {isKo ? "\uAE00\uC790" : "chars"} / {formatBytes(textInputStats.bytes)}
                  </span>
                )}
              </label>
              {textInput && (
                <button
                  onClick={() => { setTextInput(""); setTextOutput(""); setTextError(""); }}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                >
                  {isKo ? "\uC9C0\uC6B0\uAE30" : "Clear"}
                </button>
              )}
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={direction === "encode"
                ? (isKo ? "\uBCC0\uD658\uD560 \uD14D\uC2A4\uD2B8\uB97C \uC785\uB825\uD558\uC138\uC694..." : "Enter text to encode...")
                : (isKo ? "Base64 \uBB38\uC790\uC5F4\uC744 \uBD99\uC5EC\uB123\uC73C\uC138\uC694..." : "Paste Base64 string to decode...")}
              spellCheck={false}
              className="w-full h-40 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleTextConvert}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {direction === "encode" ? (isKo ? "\uC778\uCF54\uB529" : "Encode") : (isKo ? "\uB514\uCF54\uB529" : "Decode")}
            </button>
            {textOutput && (
              <>
                <button
                  onClick={swapTextIO}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {isKo ? "\uC785\uB825/\uACB0\uACFC \uAD50\uD658" : "Swap I/O"}
                </button>
                <button
                  onClick={copyTextOutput}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {copiedText ? (isKo ? "\uBCF5\uC0AC\uB428!" : "Copied!") : (isKo ? "\uACB0\uACFC \uBCF5\uC0AC" : "Copy Result")}
                </button>
              </>
            )}
          </div>

          {/* Error */}
          {textError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
              {textError}
            </div>
          )}

          {/* Output */}
          {textOutput && (
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">
                {direction === "encode" ? (isKo ? "Base64 \uACB0\uACFC" : "Base64 Result") : (isKo ? "\uD14D\uC2A4\uD2B8 \uACB0\uACFC" : "Text Result")}
                <span className="ml-2 text-xs text-neutral-400 font-normal">
                  {textOutputStats.chars.toLocaleString()} {isKo ? "\uAE00\uC790" : "chars"} / {formatBytes(textOutputStats.bytes)}
                </span>
              </label>
              <textarea
                value={textOutput}
                readOnly
                className="w-full h-40 p-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-sm resize-y"
              />
            </div>
          )}
        </div>
      )}

      {/* ══════ Image Tab ══════ */}
      {mainTab === "image" && (
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {isKo ? "\uC774\uBBF8\uC9C0 \u2192 Base64" : "Image \u2192 Base64"}
              </h3>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                    : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
                }`}
              >
                <div className="text-3xl mb-2">{"\uD83D\uDDBC\uFE0F"}</div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {isKo ? "\uC774\uBBF8\uC9C0\uB97C \uB4DC\uB798\uADF8\uD558\uAC70\uB098 \uD074\uB9AD\uD558\uC5EC \uC5C5\uB85C\uB4DC" : "Drag & drop image or click to upload"}
                </p>
                <p className="text-xs text-neutral-400 mt-1">PNG, JPG, GIF, SVG, WebP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFile(file);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
              </div>
              {imageFileName && (
                <p className="mt-2 text-xs text-neutral-500">{imageFileName}</p>
              )}
            </div>

            {/* Base64 to Image */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {isKo ? "Base64 \u2192 \uC774\uBBF8\uC9C0" : "Base64 \u2192 Image"}
              </h3>
              <textarea
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder={isKo ? "data:image/png;base64,... \uBD99\uC5EC\uB123\uAE30" : "Paste data:image/png;base64,... here"}
                spellCheck={false}
                className="w-full h-[152px] p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <button
                onClick={handleBase64ToImage}
                disabled={!imageInput.trim()}
                className="mt-2 px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isKo ? "\uC774\uBBF8\uC9C0\uB85C \uBCC0\uD658" : "Convert to Image"}
              </button>
            </div>
          </div>

          {/* Error */}
          {imageError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
              {imageError}
            </div>
          )}

          {/* Image Preview & Base64 Output */}
          {imagePreview && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {isKo ? "\uBBF8\uB9AC\uBCF4\uAE30 & Base64 \uACB0\uACFC" : "Preview & Base64 Result"}
                </h3>
                <button
                  onClick={clearImage}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                >
                  {isKo ? "\uC9C0\uC6B0\uAE30" : "Clear"}
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22/%3E%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%2210%22%20height%3D%2210%22%20fill%3D%22%23f0f0f0%22/%3E%3C/svg%3E')] dark:bg-none">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto object-contain"
                  onError={() => setImageError(isKo ? "\uC774\uBBF8\uC9C0\uB97C \uB85C\uB4DC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." : "Failed to load image.")}
                />
              </div>

              {/* Base64 string */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-400">
                    {formatBytes(imageBase64.length)}
                  </span>
                  <button
                    onClick={copyImageBase64}
                    className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {copiedImage ? (isKo ? "\uBCF5\uC0AC\uB428!" : "Copied!") : (isKo ? "Base64 \uBCF5\uC0AC" : "Copy Base64")}
                  </button>
                </div>
                <textarea
                  value={imageBase64}
                  readOnly
                  className="w-full h-24 p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono text-xs resize-y"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <ShareButtons
        title={t.title}
        description={t.description}
        lang={lang}
        slug="base64-encoder-decoder"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="base64-encoder-decoder"
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
                "Text \u2194 Base64 \uB610\uB294 Image \u2194 Base64 \uD0ED\uC744 \uC120\uD0DD\uD558\uC138\uC694.",
                "Text \uD0ED: \uC778\uCF54\uB529/\uB514\uCF54\uB529 \uBC29\uD5A5\uC744 \uC120\uD0DD\uD558\uACE0 \uD14D\uC2A4\uD2B8\uB97C \uC785\uB825\uD558\uC138\uC694.",
                "Image \uD0ED: \uC774\uBBF8\uC9C0\uB97C \uB4DC\uB798\uADF8\uD558\uAC70\uB098, Base64 \uBB38\uC790\uC5F4\uC744 \uBD99\uC5EC\uB123\uC73C\uC138\uC694.",
                "URL-safe \uD1A0\uAE00\uB85C JWT \uD1A0\uD070\uC774\uB098 URL \uD30C\uB77C\uBBF8\uD130\uC5D0 \uC801\uD569\uD55C \uD615\uC2DD\uC73C\uB85C \uBCC0\uD658\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
                "\uACB0\uACFC\uB97C \uBCF5\uC0AC\uD558\uAC70\uB098 \uC785\uB825/\uACB0\uACFC\uB97C \uAD50\uD658\uD558\uC5EC \uC5ED\uBCC0\uD658\uD558\uC138\uC694.",
              ]
            : [
                "Choose Text \u2194 Base64 or Image \u2194 Base64 tab.",
                "Text tab: Select encode/decode direction and enter your text or Base64 string.",
                "Image tab: Drag & drop an image, or paste a Base64 string to preview.",
                "Toggle URL-safe to get JWT-compatible or URL-parameter-safe Base64.",
                "Copy the result or swap input/output for reverse conversion.",
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
            <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <h3 className="font-medium mb-2">{item.q}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.a}</p>
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
