"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parsePageRange(input: string, totalPages: number): number[] {
  const indices = new Set<number>();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Math.max(1, parseInt(rangeMatch[1], 10));
      const end = Math.min(totalPages, parseInt(rangeMatch[2], 10));
      for (let i = start; i <= end; i++) {
        indices.add(i - 1);
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        indices.add(num - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export default function PdfSplitterPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-splitter");
  const isKo = locale === "ko";

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rangeInput, setRangeInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "PDF 분할 - PDF 페이지 나누기 추출 | QuickFigure"
    : "Split PDF - Extract Pages from PDF Free | QuickFigure";
  const description = isKo
    ? "PDF 파일에서 원하는 페이지만 추출하세요. 페이지 범위 지정, 개별 선택 가능. 서버 업로드 없이 100% 안전."
    : "Extract specific pages from a PDF file for free. Select page ranges or individual pages. No upload, 100% private and secure.";
  const pageTitle = isKo ? "PDF 분할" : "Split PDF";

  const loadPdf = useCallback(async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      setFile(f);
      setFileName(f.name);
      setFileSize(f.size);
      setPdfBytes(buffer);
      setTotalPages(count);
      setSelectedPages(new Set());
      setRangeInput("");
      setStatus("");
    } catch {
      setStatus(
        isKo
          ? "PDF 파일을 읽을 수 없습니다. 파일을 확인해주세요."
          : "Could not read the PDF file. Please check your file."
      );
    }
  }, [isKo]);

  const handleFileInput = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const pdfFile = arr.find(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (pdfFile) loadPdf(pdfFile);
    },
    [loadPdf]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFileInput(e.dataTransfer.files);
      }
    },
    [handleFileInput]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const togglePage = useCallback((index: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const applyRange = useCallback(() => {
    if (!rangeInput.trim() || totalPages === 0) return;
    const indices = parsePageRange(rangeInput, totalPages);
    setSelectedPages(new Set(indices));
  }, [rangeInput, totalPages]);

  const selectAll = useCallback(() => {
    const all = new Set<number>();
    for (let i = 0; i < totalPages; i++) all.add(i);
    setSelectedPages(all);
  }, [totalPages]);

  const selectOdd = useCallback(() => {
    const odd = new Set<number>();
    for (let i = 0; i < totalPages; i += 2) odd.add(i);
    setSelectedPages(odd);
  }, [totalPages]);

  const selectEven = useCallback(() => {
    const even = new Set<number>();
    for (let i = 1; i < totalPages; i += 2) even.add(i);
    setSelectedPages(even);
  }, [totalPages]);

  const selectFirstHalf = useCallback(() => {
    const half = new Set<number>();
    const mid = Math.ceil(totalPages / 2);
    for (let i = 0; i < mid; i++) half.add(i);
    setSelectedPages(half);
  }, [totalPages]);

  const selectSecondHalf = useCallback(() => {
    const half = new Set<number>();
    const mid = Math.ceil(totalPages / 2);
    for (let i = mid; i < totalPages; i++) half.add(i);
    setSelectedPages(half);
  }, [totalPages]);

  const selectNone = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  const splitPdf = useCallback(async () => {
    if (!pdfBytes || selectedPages.size === 0) return;
    setProcessing(true);
    setStatus(isKo ? "PDF 분할 중..." : "Splitting PDF...");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const sortedIndices = Array.from(selectedPages).sort((a, b) => a - b);

      setStatus(
        isKo
          ? `${sortedIndices.length}개 페이지 추출 중...`
          : `Extracting ${sortedIndices.length} page${sortedIndices.length !== 1 ? "s" : ""}...`
      );

      const copiedPages = await newPdf.copyPages(sourcePdf, sortedIndices);
      for (const page of copiedPages) {
        newPdf.addPage(page);
      }

      setStatus(isKo ? "다운로드 준비 중..." : "Preparing download...");
      const newBytes = await newPdf.save();
      const blob = new Blob([newBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = fileName.replace(/\.pdf$/i, "");
      link.download = `${baseName}_split.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus(
        isKo
          ? "분할 완료! 파일이 다운로드됩니다."
          : "Split complete! Downloading file."
      );
    } catch (err) {
      console.error(err);
      setStatus(
        isKo
          ? "분할 중 오류가 발생했습니다. 파일을 확인해주세요."
          : "An error occurred during split. Please check your file."
      );
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, selectedPages, fileName, isKo]);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileName("");
    setFileSize(0);
    setTotalPages(0);
    setSelectedPages(new Set());
    setRangeInput("");
    setStatus("");
    setPdfBytes(null);
  }, []);

  const faqItems = isKo
    ? [
        {
          q: "PDF 분할이 안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "페이지 범위는 어떻게 입력하나요?",
          a: "쉼표로 구분하여 개별 페이지 번호나 범위를 입력하세요. 예: \"1-3, 5, 7-10\"은 1, 2, 3, 5, 7, 8, 9, 10 페이지를 추출합니다.",
        },
        {
          q: "분할 후 원본 PDF는 어떻게 되나요?",
          a: "원본 PDF는 변경되지 않습니다. 선택한 페이지만 새 PDF 파일로 추출됩니다.",
        },
        {
          q: "최대 몇 페이지까지 처리할 수 있나요?",
          a: "기술적 제한은 없지만, 브라우저 메모리에 따라 달라집니다. 일반적으로 수백 페이지의 PDF를 문제없이 처리할 수 있습니다.",
        },
      ]
    : [
        {
          q: "Is it safe to split PDFs here?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "How do I enter page ranges?",
          a: "Use comma-separated page numbers or ranges. For example, \"1-3, 5, 7-10\" extracts pages 1, 2, 3, 5, 7, 8, 9, and 10.",
        },
        {
          q: "What happens to the original PDF?",
          a: "The original PDF remains unchanged. Only the selected pages are extracted into a new PDF file.",
        },
        {
          q: "How many pages can I process?",
          a: "There is no hard limit. It depends on your browser's available memory. Typically, you can process PDFs with hundreds of pages without any issues.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 PDF 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "페이지 그리드에서 추출할 페이지를 개별 선택하거나, 범위 입력란에 \"1-3, 5, 7-10\" 형식으로 입력하세요.",
        "빠른 선택 버튼(전체, 홀수, 짝수, 전반부, 후반부)을 활용할 수도 있습니다.",
        "'PDF 분할' 버튼을 클릭하면 선택한 페이지만 새 PDF로 추출됩니다.",
        "분할이 완료되면 자동으로 다운로드됩니다.",
      ]
    : [
        "Drag and drop a PDF file into the upload area above, or click to browse and select a file.",
        "Select pages to extract by clicking individual page checkboxes in the grid, or enter a range like \"1-3, 5, 7-10\".",
        "Use quick select buttons (All, Odd, Even, First Half, Second Half) for common selections.",
        "Click the 'Split PDF' button to extract the selected pages into a new PDF.",
        "The split PDF will download automatically when complete.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Drop zone */}
        {!file && (
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
                : "Drag & drop a PDF file here, or click to browse"}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {isKo ? "PDF 파일만 지원됩니다" : "Only PDF files are supported"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFileInput(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {/* File info */}
        {file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formatFileSize(fileSize)} &middot; {totalPages}{" "}
                  {isKo ? "페이지" : totalPages === 1 ? "page" : "pages"}
                </p>
              </div>
              <button
                onClick={clearFile}
                className="shrink-0 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                {isKo ? "파일 제거" : "Remove"}
              </button>
            </div>

            {/* Page range input */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {isKo ? "페이지 범위 입력" : "Page Range"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyRange();
                  }}
                  placeholder={isKo ? "예: 1-3, 5, 7-10" : "e.g. 1-3, 5, 7-10"}
                  className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <button
                  onClick={applyRange}
                  className="px-4 py-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {isKo ? "적용" : "Apply"}
                </button>
              </div>
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {isKo ? "전체 선택" : "All pages"}
              </button>
              <button
                onClick={selectOdd}
                className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {isKo ? "홀수 페이지" : "Odd pages"}
              </button>
              <button
                onClick={selectEven}
                className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {isKo ? "짝수 페이지" : "Even pages"}
              </button>
              <button
                onClick={selectFirstHalf}
                className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {isKo ? "전반부" : "First half"}
              </button>
              <button
                onClick={selectSecondHalf}
                className="px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                {isKo ? "후반부" : "Second half"}
              </button>
              <button
                onClick={selectNone}
                className="px-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {isKo ? "선택 해제" : "Clear selection"}
              </button>
            </div>

            {/* Page grid */}
            <div>
              <p className="text-sm font-medium mb-2">
                {isKo
                  ? `페이지 선택 (${selectedPages.size}/${totalPages})`
                  : `Select pages (${selectedPages.size}/${totalPages})`}
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => togglePage(i)}
                    className={`relative flex items-center justify-center rounded-md border text-sm font-mono py-2 transition-colors cursor-pointer ${
                      selectedPages.has(i)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Split button */}
            <button
              onClick={splitPdf}
              disabled={processing || selectedPages.size === 0}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing
                ? isKo
                  ? "분할 중..."
                  : "Splitting..."
                : isKo
                  ? `PDF 분할 (${selectedPages.size}페이지 추출)`
                  : `Split PDF (${selectedPages.size} page${selectedPages.size !== 1 ? "s" : ""})`}
            </button>
          </div>
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
            href={`/${lang}/tools/pdf-merger`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.pdfMerger}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.pdfMergerDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/image-to-pdf`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageToPdf}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageToPdfDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="pdf-splitter"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="pdf-splitter"
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
