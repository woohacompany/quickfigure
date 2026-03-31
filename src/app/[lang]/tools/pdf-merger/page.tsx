"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface PdfFileEntry {
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfMergerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-merger");
  const isKo = locale === "ko";

  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [merging, setMerging] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "PDF 합치기 - 여러 PDF 파일 병합 무료 도구 | QuickFigure"
    : "Merge PDF - Combine PDF Files Online Free | QuickFigure";
  const description = isKo
    ? "여러 PDF 파일을 하나로 합치세요. 순서 변경, 병합, 즉시 다운로드. 서버 업로드 없이 100% 안전."
    : "Merge multiple PDF files into one online for free. Reorder pages, combine PDFs, and download instantly. No upload, 100% private.";
  const pageTitle = isKo ? "PDF 합치기" : "Merge PDF";

  const readPageCount = useCallback(async (file: File): Promise<number | null> => {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return pdf.getPageCount();
    } catch {
      return null;
    }
  }, []);

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const pdfFiles = Array.from(newFiles).filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (pdfFiles.length === 0) return;

      const entries: PdfFileEntry[] = [];
      for (const file of pdfFiles) {
        const pageCount = await readPageCount(file);
        entries.push({
          file,
          name: file.name,
          size: file.size,
          pageCount,
        });
      }
      setFiles((prev) => [...prev, ...entries]);
    },
    [readPageCount]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setStatus("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const mergePDFs = useCallback(async () => {
    if (files.length < 2) return;
    setMerging(true);
    setStatus(isKo ? "PDF 병합 중..." : "Merging PDFs...");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setStatus(
          isKo
            ? `파일 처리 중 (${i + 1}/${files.length})...`
            : `Processing file ${i + 1} of ${files.length}...`
        );
        const buffer = await files[i].file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        for (const page of pages) {
          mergedPdf.addPage(page);
        }
      }

      setStatus(isKo ? "다운로드 준비 중..." : "Preparing download...");
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus(isKo ? "병합 완료! 파일이 다운로드됩니다." : "Merge complete! Downloading file.");
    } catch (err) {
      console.error(err);
      setStatus(
        isKo
          ? "병합 중 오류가 발생했습니다. 파일을 확인해주세요."
          : "An error occurred during merge. Please check your files."
      );
    } finally {
      setMerging(false);
    }
  }, [files, isKo]);

  const totalPages = files.reduce((sum, f) => sum + (f.pageCount ?? 0), 0);

  const faqItems = isKo
    ? [
        {
          q: "여기서 PDF 합치기가 안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "몇 개의 PDF를 합칠 수 있나요?",
          a: "기술적 제한은 없지만, 브라우저 메모리에 따라 달라집니다. 일반적으로 수십 개의 PDF를 문제없이 합칠 수 있습니다.",
        },
        {
          q: "병합 후 품질이 유지되나요?",
          a: "네, 원본 PDF의 모든 콘텐츠, 서식, 이미지, 링크가 그대로 유지됩니다. 압축이나 품질 손실이 없습니다.",
        },
        {
          q: "페이지 순서를 변경할 수 있나요?",
          a: "네, 파일 목록에서 위/아래 버튼을 사용하여 파일 순서를 변경할 수 있습니다. 병합은 목록 순서대로 진행됩니다.",
        },
      ]
    : [
        {
          q: "Is it safe to merge PDFs here?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "How many PDFs can I merge?",
          a: "There is no hard limit. It depends on your browser's available memory. Typically, you can merge dozens of PDFs without any issues.",
        },
        {
          q: "Is the merged PDF quality preserved?",
          a: "Yes, all content, formatting, images, and links from the original PDFs are preserved exactly. There is no compression or quality loss.",
        },
        {
          q: "Can I change the page order?",
          a: "Yes, use the up/down buttons in the file list to reorder files before merging. The merge follows the list order from top to bottom.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 PDF 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "필요에 따라 위/아래 버튼으로 파일 순서를 조정하세요.",
        "'PDF 합치기' 버튼을 클릭하면 모든 파일이 하나로 병합됩니다.",
        "병합이 완료되면 자동으로 다운로드됩니다.",
      ]
    : [
        "Drag and drop PDF files into the upload area above, or click to browse and select files.",
        "Use the up/down buttons to reorder files as needed.",
        "Click the 'Merge PDFs' button to combine all files into one.",
        "The merged PDF will download automatically when complete.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="pdf-merger" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          }`}
        >
          <svg
            className="w-10 h-10 text-neutral-400 dark:text-neutral-500 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 16V4m0 0L8 8m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"
            />
          </svg>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {isKo
              ? "PDF 파일을 여기에 드래그하거나 클릭하여 선택"
              : "Drag & drop PDF files here, or click to browse"}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            {isKo ? "PDF 파일만 지원됩니다" : "Only PDF files are supported"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {isKo
                  ? `${files.length}개 파일 · ${totalPages}페이지`
                  : `${files.length} file${files.length !== 1 ? "s" : ""} · ${totalPages} page${totalPages !== 1 ? "s" : ""}`}
              </p>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                {isKo ? "전체 삭제" : "Clear all"}
              </button>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
              {files.map((entry, index) => (
                <div
                  key={`${entry.name}-${index}`}
                  className="flex items-center gap-3 p-3"
                >
                  {/* Order number */}
                  <span className="text-xs font-mono text-neutral-400 w-5 text-center shrink-0">
                    {index + 1}
                  </span>

                  {/* PDF icon */}
                  <div className="shrink-0 w-8 h-8 rounded bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatFileSize(entry.size)}
                      {entry.pageCount !== null &&
                        ` · ${entry.pageCount} ${isKo ? "페이지" : entry.pageCount === 1 ? "page" : "pages"}`}
                    </p>
                  </div>

                  {/* Move buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move up"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === files.length - 1}
                      className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Move down"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="shrink-0 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                    aria-label="Remove"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge button */}
        {files.length >= 2 && (
          <button
            onClick={mergePDFs}
            disabled={merging}
            className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {merging
              ? isKo
                ? "병합 중..."
                : "Merging..."
              : isKo
                ? `PDF 합치기 (${files.length}개 파일)`
                : `Merge PDFs (${files.length} files)`}
          </button>
        )}

        {/* Status */}
        {status && (
          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
            {status}
          </p>
        )}

        {/* Privacy notice */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>
            {isKo
              ? "모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않습니다."
              : "All processing happens in your browser. Files are never uploaded to any server."}
          </span>
        </div>
      </div>

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
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
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
          <Link
            href={`/${lang}/tools/qr-code-generator`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.qrCodeGenerator}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.qrCodeGeneratorDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="pdf-merger" locale={locale} />
      <ToolDisclaimer slug="pdf-merger" locale={locale} />

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="pdf-merger"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="pdf-merger"
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
