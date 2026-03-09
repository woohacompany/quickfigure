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

export default function PdfCompressorPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-compressor");
  const isKo = locale === "ko";

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState<"high" | "medium" | "low">("medium");
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
    blob: Blob;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "PDF 압축 - 무료 온라인 PDF 용량 줄이기 | QuickFigure"
    : "PDF Compressor - Reduce PDF File Size Free Online | QuickFigure";
  const description = isKo
    ? "PDF 파일 용량을 줄여보세요. 압축 레벨 선택 후 즉시 다운로드. 서버 업로드 없이 100% 안전합니다."
    : "Compress PDF files to reduce file size online for free. Choose compression level and download instantly. No upload to servers.";
  const pageTitle = isKo ? "PDF 압축" : "PDF Compressor";

  const loadPdf = useCallback(async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      await PDFDocument.load(buffer, { ignoreEncryption: true });
      setFile(f);
      setFileName(f.name);
      setFileSize(f.size);
      setPdfBytes(buffer);
      setStatus("");
      setResult(null);
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

  const compressPdf = useCallback(async () => {
    if (!pdfBytes) return;
    setProcessing(true);
    setStatus(isKo ? "PDF 압축 중..." : "Compressing PDF...");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const pageIndices = sourcePdf.getPageIndices();
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      // Remove metadata for higher compression
      if (compressionLevel === "high") {
        newPdf.setTitle("");
        newPdf.setAuthor("");
        newPdf.setSubject("");
        newPdf.setKeywords([]);
        newPdf.setProducer("");
        newPdf.setCreator("");
      }

      const compressedBytes = await newPdf.save({
        useObjectStreams: compressionLevel !== "low",
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
      setResult({
        originalSize: fileSize,
        compressedSize: compressedBytes.length,
        blob,
      });
      setStatus(isKo ? "압축 완료!" : "Compression complete!");
    } catch (err) {
      console.error(err);
      setStatus(
        isKo
          ? "압축 중 오류가 발생했습니다."
          : "An error occurred during compression."
      );
    } finally {
      setProcessing(false);
    }
  }, [pdfBytes, compressionLevel, fileSize, isKo]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = fileName.replace(/\.pdf$/i, "");
    link.download = `${baseName}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result, fileName]);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileName("");
    setFileSize(0);
    setStatus("");
    setPdfBytes(null);
    setResult(null);
  }, []);

  const compressionRatio = result
    ? Math.max(0, ((1 - result.compressedSize / result.originalSize) * 100)).toFixed(1)
    : null;

  const faqItems = isKo
    ? [
        {
          q: "PDF 압축은 어떻게 작동하나요?",
          a: "PDF 내부의 중복 데이터를 제거하고, 오브젝트 스트림을 최적화하며, 불필요한 메타데이터를 정리하여 파일 크기를 줄입니다.",
        },
        {
          q: "압축하면 품질이 떨어지나요?",
          a: "텍스트 품질은 완전히 보존됩니다. 높은 압축 레벨에서는 메타데이터가 제거되지만, 문서 내용 자체는 변하지 않습니다.",
        },
        {
          q: "안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "최대 파일 크기는 얼마인가요?",
          a: "브라우저 메모리에 따라 달라지지만, 일반적으로 100MB 이하의 PDF 파일을 문제없이 처리할 수 있습니다.",
        },
      ]
    : [
        {
          q: "How does PDF compression work?",
          a: "It removes redundant data, optimizes object streams, and cleans up unnecessary metadata within the PDF to reduce the overall file size.",
        },
        {
          q: "Will quality be affected?",
          a: "Text quality is fully preserved. At higher compression levels, metadata is removed, but the document content itself remains unchanged.",
        },
        {
          q: "Is it safe?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "What is the maximum file size?",
          a: "It depends on your browser's available memory. Typically, you can handle PDF files up to 100MB without any issues.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 PDF 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "압축 레벨을 선택하세요: 높음(최대 압축), 중간(표준), 낮음(가벼운 최적화).",
        "'PDF 압축' 버튼을 클릭하여 압축을 시작하세요.",
        "원본 크기와 압축 후 크기, 압축률을 확인하세요.",
        "'다운로드' 버튼을 클릭하여 압축된 PDF를 저장하세요.",
      ]
    : [
        "Drag and drop a PDF file into the upload area above, or click to browse and select a file.",
        "Choose a compression level: High (maximum compression), Medium (standard), or Low (light optimization).",
        "Click the 'Compress PDF' button to start compression.",
        "Review the original size, compressed size, and compression ratio.",
        "Click the 'Download' button to save the compressed PDF.",
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

        {/* File info + compression options */}
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
                  {formatFileSize(fileSize)}
                </p>
              </div>
              <button
                onClick={clearFile}
                className="shrink-0 text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                {isKo ? "파일 제거" : "Remove"}
              </button>
            </div>

            {/* Compression level selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isKo ? "압축 레벨" : "Compression Level"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCompressionLevel("low")}
                  className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    compressionLevel === "low"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div>{isKo ? "낮음" : "Low"}</div>
                  <div className="text-xs font-normal mt-0.5 opacity-70">
                    {isKo ? "가벼운 최적화" : "Light optimization"}
                  </div>
                </button>
                <button
                  onClick={() => setCompressionLevel("medium")}
                  className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    compressionLevel === "medium"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div>{isKo ? "중간" : "Medium"}</div>
                  <div className="text-xs font-normal mt-0.5 opacity-70">
                    {isKo ? "표준 압축" : "Standard"}
                  </div>
                </button>
                <button
                  onClick={() => setCompressionLevel("high")}
                  className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                    compressionLevel === "high"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div>{isKo ? "높음" : "High"}</div>
                  <div className="text-xs font-normal mt-0.5 opacity-70">
                    {isKo ? "최대 압축" : "Maximum"}
                  </div>
                </button>
              </div>
            </div>

            {/* Compress button */}
            <button
              onClick={compressPdf}
              disabled={processing}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing
                ? isKo
                  ? "압축 중..."
                  : "Compressing..."
                : isKo
                  ? "PDF 압축"
                  : "Compress PDF"}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {isKo ? "원본 크기" : "Original"}
                </p>
                <p className="text-sm font-semibold">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {isKo ? "압축 후" : "Compressed"}
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {formatFileSize(result.compressedSize)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {isKo ? "압축률" : "Reduced"}
                </p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {compressionRatio}%
                </p>
              </div>
            </div>
            <button
              onClick={downloadResult}
              className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              {isKo ? "압축된 PDF 다운로드" : "Download Compressed PDF"}
            </button>
          </div>
        )}

        {/* Status */}
        {status && !result && (
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
            href={`/${lang}/tools/pdf-splitter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.pdfSplitter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.pdfSplitterDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="pdf-compressor"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="pdf-compressor"
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
