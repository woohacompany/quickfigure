"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface PresetSize {
  label: string;
  width: number;
  height: number;
}

const PRESETS: PresetSize[] = [
  { label: "1920x1080 (Full HD)", width: 1920, height: 1080 },
  { label: "1280x720 (HD)", width: 1280, height: 720 },
  { label: "800x600", width: 800, height: 600 },
  { label: "640x480", width: 640, height: 480 },
  { label: "Instagram (1080x1080)", width: 1080, height: 1080 },
  { label: "Twitter (1200x675)", width: 1200, height: 675 },
];

export default function ImageResizerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-resizer");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [quality, setQuality] = useState(85);

  const [resizedDataUrl, setResizedDataUrl] = useState<string | null>(null);
  const [resizedFileSize, setResizedFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const title = isKo
    ? "이미지 리사이저 - 온라인 사진 크기 변경 | QuickFigure"
    : "Image Resizer - Resize Photos Online Free | QuickFigure";
  const description = isKo
    ? "이미지 크기를 온라인에서 무료로 변경하세요. 비율 유지, JPEG/PNG/WebP 다운로드 지원. 서버 업로드 없이 안전."
    : "Resize images online for free. Set custom dimensions, maintain aspect ratio, and download in JPEG, PNG, or WebP format.";

  const handleImageLoad = useCallback((file: File) => {
    setResizedDataUrl(null);
    setResizedFileSize(0);
    setOriginalFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalDataUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleImageLoad(file);
      }
    },
    [handleImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleImageLoad(file);
      }
    },
    [handleImageLoad]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleWidthChange = useCallback(
    (newWidth: number) => {
      setTargetWidth(newWidth);
      if (maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
        const ratio = originalHeight / originalWidth;
        setTargetHeight(Math.round(newWidth * ratio));
      }
    },
    [maintainAspectRatio, originalWidth, originalHeight]
  );

  const handleHeightChange = useCallback(
    (newHeight: number) => {
      setTargetHeight(newHeight);
      if (maintainAspectRatio && originalWidth > 0 && originalHeight > 0) {
        const ratio = originalWidth / originalHeight;
        setTargetWidth(Math.round(newHeight * ratio));
      }
    },
    [maintainAspectRatio, originalWidth, originalHeight]
  );

  const applyPreset = useCallback(
    (preset: PresetSize) => {
      setTargetWidth(preset.width);
      setTargetHeight(preset.height);
      setMaintainAspectRatio(false);
    },
    []
  );

  const resizeImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    if (targetWidth <= 0 || targetHeight <= 0) return;

    const canvas = canvasRef.current;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);

    const qualityValue = outputFormat === "image/png" ? undefined : quality / 100;
    const dataUrl = canvas.toDataURL(outputFormat, qualityValue);
    setResizedDataUrl(dataUrl);

    // Calculate resized file size from base64
    const base64 = dataUrl.split(",")[1];
    const byteLength = atob(base64).length;
    setResizedFileSize(byteLength);
  }, [originalImage, targetWidth, targetHeight, outputFormat, quality]);

  const downloadResized = useCallback(() => {
    if (!resizedDataUrl) return;

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = extMap[outputFormat] || "jpg";

    const link = document.createElement("a");
    link.download = `resized-image.${ext}`;
    link.href = resizedDataUrl;
    link.click();
  }, [resizedDataUrl, outputFormat]);

  const faqItems = isKo
    ? [
        {
          q: "여기서 이미지 리사이즈하는 것이 안전한가요?",
          a: "네, 완전히 안전합니다. 모든 이미지 처리는 브라우저 내에서 로컬로 수행되며, 이미지가 서버에 업로드되지 않습니다. 개인정보가 완벽하게 보호됩니다.",
        },
        {
          q: "어떤 형식을 지원하나요?",
          a: "입력: JPEG, PNG, WebP, GIF, BMP, SVG 등 브라우저가 지원하는 모든 이미지 형식을 사용할 수 있습니다. 출력: JPEG, PNG, WebP 형식으로 다운로드할 수 있습니다.",
        },
        {
          q: "파일 크기 제한이 있나요?",
          a: "서버 업로드가 없으므로 엄격한 제한은 없지만, 매우 큰 이미지(50MB 이상)는 브라우저 메모리에 따라 처리 속도가 느려질 수 있습니다. 일반적으로 대부분의 이미지는 문제없이 처리됩니다.",
        },
        {
          q: "여러 이미지를 한번에 리사이즈할 수 있나요?",
          a: "현재는 한 번에 하나의 이미지만 리사이즈할 수 있습니다. 여러 이미지를 처리하려면 각 이미지를 순서대로 업로드하여 리사이즈하시면 됩니다.",
        },
      ]
    : [
        {
          q: "Is it safe to resize images here?",
          a: "Yes, completely safe. All image processing happens locally in your browser. Your images are never uploaded to any server, ensuring complete privacy.",
        },
        {
          q: "What formats are supported?",
          a: "Input: Any image format supported by your browser, including JPEG, PNG, WebP, GIF, BMP, and SVG. Output: You can download resized images in JPEG, PNG, or WebP format.",
        },
        {
          q: "Is there a file size limit?",
          a: "Since there is no server upload, there is no strict limit. However, very large images (over 50MB) may slow down processing depending on your browser's available memory. Most images process without any issues.",
        },
        {
          q: "Can I resize multiple images at once?",
          a: "Currently, you can resize one image at a time. To process multiple images, simply upload and resize each image sequentially.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역을 클릭하거나 이미지를 드래그 앤 드롭하여 이미지를 선택합니다.",
        "원하는 너비와 높이를 입력하거나, 프리셋 크기 중 하나를 선택합니다.",
        "출력 형식(JPEG, PNG, WebP)과 품질을 설정합니다.",
        "\"리사이즈\" 버튼을 클릭하여 이미지를 변환합니다.",
        "\"다운로드\" 버튼을 클릭하여 리사이즈된 이미지를 저장합니다.",
      ]
    : [
        "Click the upload area or drag and drop an image to select a file.",
        "Enter the desired width and height, or choose from preset sizes.",
        "Select the output format (JPEG, PNG, WebP) and quality level.",
        "Click the \"Resize\" button to process the image.",
        "Click the \"Download\" button to save the resized image.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 리사이저" : "Image Resizer"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Upload Area */}
        <div>
          <label className="text-sm font-medium block mb-2">
            {isKo ? "이미지 업로드" : "Upload Image"}
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
            }`}
          >
            <div className="text-4xl mb-2">
              {originalDataUrl ? "" : ""}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "클릭하거나 이미지를 드래그 앤 드롭하세요"
                : "Click or drag and drop an image here"}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              JPEG, PNG, WebP, GIF, BMP, SVG
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Original Image Preview */}
        {originalDataUrl && (
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "원본 이미지" : "Original Image"}
            </label>
            <div className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
              <img
                src={originalDataUrl}
                alt="Original"
                className="max-w-full max-h-64 mx-auto object-contain"
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {isKo ? "크기" : "Dimensions"}: {originalWidth} x {originalHeight}px
              {" | "}
              {isKo ? "파일 크기" : "File size"}: {formatBytes(originalFileSize)}
            </p>
          </div>
        )}

        {/* Dimensions */}
        {originalImage && (
          <>
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "새 크기 (픽셀)" : "New Dimensions (px)"}
              </label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">
                    {isKo ? "너비" : "Width"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetWidth}
                    onChange={(e) =>
                      handleWidthChange(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-neutral-400 mt-4">x</span>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">
                    {isKo ? "높이" : "Height"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight}
                    onChange={(e) =>
                      handleHeightChange(parseInt(e.target.value) || 0)
                    }
                    className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Maintain Aspect Ratio */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aspectRatio"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-blue-600"
              />
              <label
                htmlFor="aspectRatio"
                className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer"
              >
                {isKo ? "비율 유지" : "Maintain aspect ratio"}
              </label>
            </div>

            {/* Preset Sizes */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "프리셋 크기" : "Preset Sizes"}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "출력 형식" : "Output Format"}
              </label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "image/jpeg", label: "JPEG" },
                    { value: "image/png", label: "PNG" },
                    { value: "image/webp", label: "WebP" },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() =>
                      setOutputFormat(
                        fmt.value as "image/jpeg" | "image/png" | "image/webp"
                      )
                    }
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                      outputFormat === fmt.value
                        ? "bg-foreground text-background border-foreground"
                        : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            {outputFormat !== "image/png" && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "품질" : "Quality"}: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>{isKo ? "낮음" : "Low"} (1)</span>
                  <span>{isKo ? "높음" : "High"} (100)</span>
                </div>
              </div>
            )}

            {/* Resize Button */}
            <button
              onClick={resizeImage}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isKo ? "리사이즈" : "Resize Image"}
            </button>
          </>
        )}

        {/* Resized Result */}
        {resizedDataUrl && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "리사이즈된 이미지" : "Resized Image"}
              </label>
              <div className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                <img
                  src={resizedDataUrl}
                  alt="Resized"
                  className="max-w-full max-h-64 mx-auto object-contain"
                />
              </div>
            </div>

            {/* File Size Comparison */}
            <div className="rounded-md bg-neutral-100 dark:bg-neutral-800 p-4">
              <h3 className="text-sm font-medium mb-2">
                {isKo ? "파일 크기 비교" : "File Size Comparison"}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {isKo ? "원본" : "Original"}:
                  </span>
                  <span className="ml-2 font-mono">
                    {formatBytes(originalFileSize)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {isKo ? "리사이즈" : "Resized"}:
                  </span>
                  <span className="ml-2 font-mono">
                    {formatBytes(resizedFileSize)}
                  </span>
                </div>
              </div>
              {originalFileSize > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                  {resizedFileSize < originalFileSize
                    ? `${((1 - resizedFileSize / originalFileSize) * 100).toFixed(1)}% ${isKo ? "감소" : "smaller"}`
                    : `${(((resizedFileSize / originalFileSize) - 1) * 100).toFixed(1)}% ${isKo ? "증가" : "larger"}`}
                </p>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={downloadResized}
              className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              {isKo ? "다운로드" : "Download Resized Image"}
            </button>
          </div>
        )}

        {/* Privacy Notice */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          {isKo
            ? "이미지는 로컬에서 처리되며 서버에 업로드되지 않습니다."
            : "Your images are processed locally and never uploaded to any server."}
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* How to Use */}
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

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "자주 묻는 질문" : "FAQ"}
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

      {/* JSON-LD FAQPage */}
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

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "관련 도구" : "Related Tools"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/qr-code-generator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {isKo ? "QR 코드 생성기" : "QR Code Generator"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "URL, 텍스트, WiFi 정보로 QR 코드를 생성하고 PNG로 다운로드하세요."
                : "Generate QR codes for URLs, text, or WiFi and download as PNG."}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/color-picker`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {isKo ? "색상 선택기 & 변환기" : "Color Picker & Converter"}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {isKo
                ? "색상을 선택하고 HEX, RGB, HSL 형식 간 변환하세요."
                : "Pick colors and convert between HEX, RGB, and HSL formats."}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={isKo ? "이미지 리사이저" : "Image Resizer"}
        description={description}
        lang={lang}
        slug="image-resizer"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="image-resizer"
        lang={lang}
        labels={dict.embed}
      />

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
