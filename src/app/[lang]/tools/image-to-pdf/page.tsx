"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface ImageEntry {
  file: File;
  name: string;
  size: number;
  dataUrl: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageToPdfPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-to-pdf");

  const [images, setImages] = useState<ImageEntry[]>([]);
  const [converting, setConverting] = useState(false);
  const [status, setStatus] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(20);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo ? "이미지 PDF 변환" : "Image to PDF";
  const description = isKo
    ? "여러 장의 JPG, PNG 이미지를 하나의 PDF 파일로 변환하세요. 순서 변경, 페이지 방향, 여백 설정 가능. 서버 업로드 없이 100% 안전."
    : "Convert multiple JPG/PNG images into a single PDF file. Reorder pages, set orientation and margins. 100% client-side, no upload needed.";

  const addImages = useCallback(async (newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const entries: ImageEntry[] = [];
    for (const file of imageFiles) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      entries.push({ file, name: file.name, size: file.size, dataUrl });
    }
    setImages((prev) => [...prev, ...entries]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const convertToPdf = useCallback(async () => {
    if (images.length === 0) return;
    setConverting(true);
    setStatus(isKo ? "PDF 생성 중..." : "Creating PDF...");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      // A4 dimensions in points (72 points per inch)
      const A4_W = orientation === "portrait" ? 595.28 : 841.89;
      const A4_H = orientation === "portrait" ? 841.89 : 595.28;

      for (let i = 0; i < images.length; i++) {
        setStatus(isKo ? `이미지 처리 중 (${i + 1}/${images.length})...` : `Processing image ${i + 1} of ${images.length}...`);

        const imgBytes = await images[i].file.arrayBuffer();
        let pdfImage;

        if (images[i].file.type === "image/png") {
          pdfImage = await pdfDoc.embedPng(imgBytes);
        } else if (images[i].file.type === "image/jpeg" || images[i].file.type === "image/jpg") {
          pdfImage = await pdfDoc.embedJpg(imgBytes);
        } else {
          // Convert other formats to JPEG via canvas
          const canvas = document.createElement("canvas");
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d")!;
              ctx.drawImage(img, 0, 0);
              resolve();
            };
            img.src = images[i].dataUrl;
          });
          const jpegBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.92);
          });
          const jpegBytes = await jpegBlob.arrayBuffer();
          pdfImage = await pdfDoc.embedJpg(jpegBytes);
        }

        const page = pdfDoc.addPage([A4_W, A4_H]);
        const availW = A4_W - margin * 2;
        const availH = A4_H - margin * 2;

        const imgAspect = pdfImage.width / pdfImage.height;
        const pageAspect = availW / availH;

        let drawW, drawH;
        if (imgAspect > pageAspect) {
          drawW = availW;
          drawH = availW / imgAspect;
        } else {
          drawH = availH;
          drawW = availH * imgAspect;
        }

        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;

        page.drawImage(pdfImage, { x, y, width: drawW, height: drawH });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "images.pdf";
      a.click();
      URL.revokeObjectURL(url);

      setStatus(isKo ? "PDF 생성 완료!" : "PDF created successfully!");
    } catch (err) {
      setStatus(isKo ? "오류가 발생했습니다." : "An error occurred.");
      console.error(err);
    } finally {
      setConverting(false);
    }
  }, [images, orientation, margin, isKo]);

  const faqItems = isKo
    ? [
        { q: "어떤 이미지 포맷을 지원하나요?", a: "JPG, PNG, WebP, GIF, BMP 등 대부분의 이미지 포맷을 지원합니다. JPG/PNG가 아닌 포맷은 자동으로 JPEG로 변환된 후 PDF에 포함됩니다." },
        { q: "이미지 순서를 변경할 수 있나요?", a: "네. 위/아래 화살표 버튼으로 이미지 순서를 자유롭게 변경할 수 있습니다. 순서대로 PDF 페이지가 생성됩니다." },
        { q: "서버에 이미지가 업로드되나요?", a: "아닙니다. pdf-lib 라이브러리를 사용하여 100% 브라우저에서 처리됩니다. 이미지가 외부 서버로 전송되지 않습니다." },
        { q: "최대 몇 장까지 가능한가요?", a: "기술적 제한은 없지만, 브라우저 메모리에 따라 달라집니다. 일반적으로 수십 장까지는 문제없이 처리됩니다." },
      ]
    : [
        { q: "What image formats are supported?", a: "JPG, PNG, WebP, GIF, BMP and most image formats are supported. Non-JPG/PNG formats are automatically converted to JPEG before embedding in the PDF." },
        { q: "Can I reorder images?", a: "Yes. Use the up/down arrow buttons to reorder images. Pages are created in the displayed order." },
        { q: "Are my images uploaded to a server?", a: "No. Everything is processed in your browser using the pdf-lib library. No images are sent to any external server." },
        { q: "How many images can I convert?", a: "There's no hard limit, but it depends on your browser's memory. Typically, dozens of images can be processed without issues." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo ? "이미지를 드래그하거나 클릭하여 업로드 (여러 장 가능)" : "Drag & drop images or click to upload (multiple)"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP, GIF</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { if (e.target.files) addImages(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <>
            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={`${img.name}-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                  <img src={img.dataUrl} alt={img.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{img.name}</p>
                    <p className="text-xs text-neutral-400">{formatFileSize(img.size)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="Move up">&#9650;</button>
                    <button onClick={() => moveDown(i)} disabled={i === images.length - 1} className="p-1.5 rounded text-neutral-400 hover:text-neutral-600 disabled:opacity-30 cursor-pointer disabled:cursor-default" title="Move down">&#9660;</button>
                    <button onClick={() => removeImage(i)} className="p-1.5 rounded text-red-400 hover:text-red-600 cursor-pointer" title="Remove">&#10005;</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "페이지 방향" : "Page Orientation"}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="orientation" checked={orientation === "portrait"} onChange={() => setOrientation("portrait")} className="accent-blue-600" />
                    <span className="text-sm">{isKo ? "세로" : "Portrait"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="orientation" checked={orientation === "landscape"} onChange={() => setOrientation("landscape")} className="accent-blue-600" />
                    <span className="text-sm">{isKo ? "가로" : "Landscape"}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "여백" : "Margin"}
                </label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>{isKo ? "없음" : "None"}</option>
                  <option value={20}>{isKo ? "작게 (20pt)" : "Small (20pt)"}</option>
                  <option value={40}>{isKo ? "보통 (40pt)" : "Medium (40pt)"}</option>
                </select>
              </div>
            </div>

            <button
              onClick={convertToPdf}
              disabled={converting}
              className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {converting ? (isKo ? "변환 중..." : "Converting...") : (isKo ? `PDF로 변환 (${images.length}장)` : `Convert to PDF (${images.length} images)`)}
            </button>

            {status && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{status}</p>
            )}
          </>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "이미지를 드래그하거나 클릭하여 업로드하세요 (여러 장 가능).",
                "화살표 버튼으로 이미지 순서를 원하는 대로 변경하세요.",
                "페이지 방향(세로/가로)과 여백을 설정하세요.",
                "PDF로 변환 버튼을 클릭하면 자동으로 다운로드됩니다.",
              ]
            : [
                "Upload images by dragging or clicking (multiple allowed).",
                "Reorder images using the arrow buttons.",
                "Set page orientation (portrait/landscape) and margins.",
                "Click Convert to PDF — the file downloads automatically.",
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
          <Link href={`/${lang}/tools/pdf-merger`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.pdfMerger}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.pdfMergerDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-compressor`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageCompressor}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageCompressorDesc}</p>
          </Link>
        </div>
      </section>

      <ShareButtons title={title} description={description} lang={lang} slug="image-to-pdf" labels={dict.share} />
      <EmbedCodeButton slug="image-to-pdf" lang={lang} labels={dict.embed} />

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
