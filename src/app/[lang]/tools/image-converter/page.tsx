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

function canvasToBmp(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { width, height, data } = imageData;
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BMP header
  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d); // BM
  view.setUint32(2, fileSize, true);
  view.setUint32(10, 54, true); // pixel data offset
  view.setUint32(14, 40, true); // DIB header size
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // negative for top-down
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelDataSize, true);

  let offset = 54;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      view.setUint8(offset++, data[i + 2]); // B
      view.setUint8(offset++, data[i + 1]); // G
      view.setUint8(offset++, data[i]); // R
    }
    const padding = rowSize - width * 3;
    for (let p = 0; p < padding; p++) view.setUint8(offset++, 0);
  }

  return new Blob([buffer], { type: "image/bmp" });
}

interface FileItem {
  name: string;
  originalSize: number;
  type: string;
  url: string;
  blob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  convertedBlob?: Blob;
}

export default function ImageConverterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-converter");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<
    "image/jpeg" | "image/png" | "image/webp" | "image/bmp"
  >("image/jpeg");
  const [quality, setQuality] = useState(85);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const title = isKo
    ? "이미지 형식 변환 - PNG, JPG, WEBP, BMP 무료 변환"
    : "Image Format Converter - Convert PNG, JPG, WEBP, BMP Free";
  const description = isKo
    ? "PNG, JPG, WEBP, BMP 간 이미지 형식을 무료로 변환하세요. 여러 파일 일괄 변환, 품질 조절 가능. 서버 업로드 없음."
    : "Convert images between PNG, JPG, WEBP, and BMP formats online for free. Batch convert multiple files with adjustable quality. No upload needed.";

  const formatExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/bmp": "bmp",
  };

  const formatLabel: Record<string, string> = {
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WEBP",
    "image/bmp": "BMP",
  };

  const showQuality =
    outputFormat === "image/jpeg" || outputFormat === "image/webp";

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: FileItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newFiles.push({
          name: file.name,
          originalSize: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          blob: file,
        });
      }
    });
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus("");
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].url) URL.revokeObjectURL(updated[index].url);
      if (updated[index].convertedUrl)
        URL.revokeObjectURL(updated[index].convertedUrl!);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
    setStatus("");
  }, [files]);

  const convertOne = useCallback(
    (file: FileItem): Promise<FileItem> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // For JPEG, fill white background (no transparency support)
          if (outputFormat === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          if (outputFormat === "image/bmp") {
            const blob = canvasToBmp(canvas);
            const convertedUrl = URL.createObjectURL(blob);
            resolve({
              ...file,
              convertedUrl,
              convertedSize: blob.size,
              convertedBlob: blob,
            });
          } else {
            const qualityVal = showQuality ? quality / 100 : undefined;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve(file);
                  return;
                }
                const convertedUrl = URL.createObjectURL(blob);
                resolve({
                  ...file,
                  convertedUrl,
                  convertedSize: blob.size,
                  convertedBlob: blob,
                });
              },
              outputFormat,
              qualityVal
            );
          }
        };
        img.onerror = () => resolve(file);
        img.src = file.url;
      });
    },
    [outputFormat, quality, showQuality]
  );

  const convertAll = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setStatus(isKo ? "변환 중..." : "Converting...");

    const results: FileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      setStatus(
        isKo
          ? `변환 중... (${i + 1}/${files.length})`
          : `Converting... (${i + 1}/${files.length})`
      );
      const result = await convertOne(files[i]);
      results.push(result);
    }

    setFiles(results);
    setProcessing(false);
    setStatus(
      isKo
        ? `${results.length}개 파일 변환 완료!`
        : `${results.length} file(s) converted!`
    );
  }, [files, convertOne, isKo]);

  const downloadOne = useCallback(
    (file: FileItem) => {
      if (!file.convertedUrl) return;
      const ext = formatExt[outputFormat];
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const a = document.createElement("a");
      a.href = file.convertedUrl;
      a.download = `${baseName}.${ext}`;
      a.click();
    },
    [outputFormat]
  );

  const downloadAll = useCallback(() => {
    files.forEach((file) => {
      if (file.convertedUrl) {
        downloadOne(file);
      }
    });
  }, [files, downloadOne]);

  const hasConverted = files.some((f) => f.convertedUrl);

  const faqItems = isKo
    ? [
        {
          q: "어떤 형식을 사용해야 하나요?",
          a: "사진에는 JPG가 적합하고, 투명 배경이 필요하면 PNG, 웹 최적화에는 WEBP, 비압축 원본이 필요하면 BMP를 사용하세요.",
        },
        {
          q: "변환 시 품질이 손실되나요?",
          a: "JPG와 WEBP는 손실 압축 포맷이므로 품질 슬라이더로 조절할 수 있습니다. PNG는 무손실 포맷이라 품질 손실이 없습니다. BMP도 비압축이므로 손실이 없습니다.",
        },
        {
          q: "한 번에 몇 개의 파일을 변환할 수 있나요?",
          a: "고정된 제한은 없으며 브라우저 메모리에 따라 다릅니다. 일반적으로 수십 개의 이미지를 동시에 변환할 수 있습니다.",
        },
        {
          q: "안전한가요?",
          a: "네. 모든 처리는 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 이미지가 서버로 전송되지 않습니다.",
        },
      ]
    : [
        {
          q: "Which format should I use?",
          a: "Use JPG for photos, PNG for images requiring transparency, WEBP for web optimization with smaller file sizes, and BMP for uncompressed raw images.",
        },
        {
          q: "Is quality lost during conversion?",
          a: "JPG and WEBP are lossy formats — use the quality slider to balance size and quality. PNG is lossless with no quality loss. BMP is uncompressed, so no loss either.",
        },
        {
          q: "How many files can I convert at once?",
          a: "There is no hard limit. It depends on your browser's available memory. Typically you can convert dozens of images simultaneously.",
        },
        {
          q: "Is it safe?",
          a: "Yes. All processing happens in your browser using the Canvas API. Your images are never uploaded to any server.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 형식 변환" : "Image Format Converter"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo
              ? "이미지를 드래그하거나 클릭하여 업로드 (여러 파일 가능)"
              : "Drag & drop images or click to upload (multiple files)"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            JPG, PNG, WEBP, BMP, GIF
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {isKo
                    ? `${files.length}개 파일 선택됨`
                    : `${files.length} file(s) selected`}
                </p>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  {isKo ? "모두 제거" : "Clear All"}
                </button>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2"
                  >
                    <span className="truncate mr-2">
                      {file.name}{" "}
                      <span className="text-neutral-400">
                        ({formatBytes(file.originalSize)})
                      </span>
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Output format selector */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "출력 형식" : "Output Format"}
              </label>
              <div className="flex gap-2">
                {(
                  [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/bmp",
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      outputFormat === fmt
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {formatLabel[fmt]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider */}
            {showQuality && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "품질" : "Quality"}: {quality}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Convert button */}
            <button
              onClick={convertAll}
              disabled={processing}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing
                ? isKo
                  ? "변환 중..."
                  : "Converting..."
                : isKo
                ? "모두 변환"
                : "Convert All"}
            </button>

            {status && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {status}
              </p>
            )}

            {/* Results */}
            {hasConverted && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  {isKo ? "변환 결과" : "Results"}
                </h3>
                <div className="space-y-2">
                  {files.map((file, i) =>
                    file.convertedUrl ? (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-md bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0 mr-3">
                          <p className="truncate">
                            {file.name.replace(/\.[^.]+$/, "")}.
                            {formatExt[outputFormat]}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {formatBytes(file.originalSize)} &rarr;{" "}
                            <span className="text-green-600 dark:text-green-400">
                              {formatBytes(file.convertedSize || 0)}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => downloadOne(file)}
                          className="px-3 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer shrink-0"
                        >
                          {isKo ? "다운로드" : "Download"}
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
                {files.filter((f) => f.convertedUrl).length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {isKo ? "모두 다운로드" : "Download All"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Privacy notice */}
      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500 text-center">
        {isKo
          ? "모든 처리는 브라우저에서 이루어지며 이미지는 서버로 전송되지 않습니다."
          : "All processing happens in your browser. Your images are never uploaded to any server."}
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "이미지를 드래그하거나 클릭하여 업로드하세요 (여러 파일 가능).",
                "원하는 출력 형식을 선택하세요 (JPG, PNG, WEBP, BMP).",
                "JPG 또는 WEBP를 선택한 경우 품질 슬라이더를 조절하세요.",
                "모두 변환 버튼을 클릭하세요.",
                "변환된 파일을 개별 또는 일괄 다운로드하세요.",
              ]
            : [
                "Upload images by dragging or clicking the upload area (multiple files supported).",
                "Select the desired output format (JPG, PNG, WEBP, BMP).",
                "If you chose JPG or WEBP, adjust the quality slider.",
                "Click the Convert All button.",
                "Download converted files individually or all at once.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.faq}</h2>
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

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/image-compressor`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageCompressor}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageCompressorDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/image-resizer`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageResizer}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageResizerDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="image-converter"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="image-converter"
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
