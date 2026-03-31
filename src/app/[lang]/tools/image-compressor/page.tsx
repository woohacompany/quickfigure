"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
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

export default function ImageCompressorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-compressor");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [originalFileName, setOriginalFileName] = useState("");

  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");

  const [compressedDataUrl, setCompressedDataUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const title = isKo
    ? "이미지 압축 - 사진 용량 줄이기 무료 도구"
    : "Image Compressor - Reduce Photo Size Online Free";
  const description = isKo
    ? "이미지 용량을 줄여보세요. 품질 조절 슬라이더로 원하는 수준으로 압축하고 즉시 다운로드. 서버 업로드 없이 100% 브라우저에서 처리."
    : "Compress images online for free. Adjust quality with a slider and download instantly. 100% client-side, no server upload needed.";

  const processImage = useCallback((file: File) => {
    setCompressedDataUrl(null);
    setCompressedSize(0);
    setOriginalFileSize(file.size);
    setOriginalFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalDataUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const compress = useCallback(() => {
    if (!originalImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(originalImage, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCompressedSize(blob.size);
        const url = URL.createObjectURL(blob);
        setCompressedDataUrl(url);
      },
      outputFormat,
      outputFormat === "image/png" ? undefined : quality / 100
    );
  }, [originalImage, quality, outputFormat]);

  const download = useCallback(() => {
    if (!compressedDataUrl) return;
    const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
    const baseName = originalFileName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = compressedDataUrl;
    a.download = `${baseName}_compressed.${ext}`;
    a.click();
  }, [compressedDataUrl, outputFormat, originalFileName]);

  const reductionPercent = originalFileSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalFileSize) * 100).toFixed(1)
    : null;

  const faqItems = isKo
    ? [
        { q: "이미지 품질을 얼마로 설정하면 좋나요?", a: "일반적으로 70~80% 품질이면 파일 크기는 크게 줄이면서 육안으로 차이가 거의 없습니다. 웹용은 60~70%, 인쇄용은 85~95%를 추천합니다." },
        { q: "PNG는 왜 품질 조절이 안 되나요?", a: "PNG는 무손실 압축 포맷이므로 JPEG/WebP처럼 품질 수준을 조절할 수 없습니다. PNG로 용량을 줄이려면 이미지 크기(해상도)를 줄이는 것이 효과적입니다." },
        { q: "서버에 이미지가 업로드되나요?", a: "아닙니다. 모든 처리는 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 이미지가 외부 서버로 전송되지 않으므로 완전히 안전합니다." },
        { q: "어떤 포맷이 가장 작나요?", a: "WebP가 동일 품질 대비 가장 작은 파일 크기를 제공합니다. JPEG는 사진에 적합하고, PNG는 텍스트나 아이콘 등 선명함이 중요한 이미지에 적합합니다." },
      ]
    : [
        { q: "What quality setting should I use?", a: "70-80% quality is ideal for most cases — significant size reduction with minimal visible difference. Use 60-70% for web, 85-95% for print." },
        { q: "Why can't I adjust quality for PNG?", a: "PNG is a lossless format, so quality levels don't apply like JPEG/WebP. To reduce PNG file size, consider reducing the image dimensions instead." },
        { q: "Is my image uploaded to a server?", a: "No. All processing happens in your browser using the Canvas API. Your images are never sent to any external server, ensuring complete privacy." },
        { q: "Which format produces the smallest file?", a: "WebP offers the smallest file size at equivalent quality. JPEG is great for photos, while PNG is best for images requiring sharpness like text or icons." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 압축" : "Image Compressor"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="image-compressor" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo ? "이미지를 드래그하거나 클릭하여 업로드" : "Drag & drop image or click to upload"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {originalImage && (
          <>
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "품질" : "Quality"}: {quality}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                {outputFormat === "image/png" && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {isKo ? "PNG는 무손실 포맷이라 품질 조절이 적용되지 않습니다." : "PNG is lossless — quality slider has no effect."}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "출력 포맷" : "Output Format"}
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>

            <button
              onClick={compress}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isKo ? "압축하기" : "Compress"}
            </button>

            {/* Results */}
            {compressedDataUrl && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-lg font-semibold">{formatBytes(originalFileSize)}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{isKo ? "원본 크기" : "Original Size"}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatBytes(compressedSize)}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{isKo ? "압축 후 크기" : "Compressed Size"}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
                    <p className={`text-lg font-semibold ${Number(reductionPercent) > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {Number(reductionPercent) > 0 ? `-${reductionPercent}%` : `+${Math.abs(Number(reductionPercent)).toFixed(1)}%`}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{isKo ? "용량 변화" : "Size Change"}</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">{isKo ? "원본" : "Original"}</p>
                    {originalDataUrl && (
                      <img src={originalDataUrl} alt="Original" className="w-full rounded-md border border-neutral-200 dark:border-neutral-700" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">{isKo ? "압축 결과" : "Compressed"}</p>
                    <img src={compressedDataUrl} alt="Compressed" className="w-full rounded-md border border-neutral-200 dark:border-neutral-700" />
                  </div>
                </div>

                <button
                  onClick={download}
                  className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
                >
                  {isKo ? "다운로드" : "Download"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "이미지를 드래그하거나 클릭하여 업로드하세요.",
                "품질 슬라이더를 조절하세요 (1~100%).",
                "출력 포맷을 선택하세요 (JPEG, PNG, WebP).",
                "압축하기 버튼을 클릭하고 결과를 확인하세요.",
                "만족스러우면 다운로드 버튼을 클릭하세요.",
              ]
            : [
                "Upload an image by dragging or clicking the upload area.",
                "Adjust the quality slider (1-100%).",
                "Select the output format (JPEG, PNG, WebP).",
                "Click Compress and review the result.",
                "Click Download if satisfied.",
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
            <details key={i} className="group rounded-lg border border-neutral-200 dark:border-neutral-700">
              <summary className="cursor-pointer p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
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
          <Link href={`/${lang}/tools/image-resizer`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageResizer}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageResizerDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-to-pdf`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageToPdf}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageToPdfDesc}</p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="image-compressor" locale={locale} />
      <ToolDisclaimer slug="image-compressor" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="image-compressor" labels={dict.share} />
      <EmbedCodeButton slug="image-compressor" lang={lang} labels={dict.embed} />

      {relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4">{dict.relatedArticles}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((post) => {
              const tr = post.translations[locale];
              return (
                <Link key={post.slug} href={`/${lang}/blog/${post.slug}`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
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
