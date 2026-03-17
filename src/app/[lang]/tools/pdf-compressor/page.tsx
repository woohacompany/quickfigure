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

// Compression settings: render scale and JPEG quality per level
const COMPRESSION_SETTINGS = {
  low: { scale: 1.5, quality: 0.82 },
  medium: { scale: 1.2, quality: 0.6 },
  high: { scale: 0.9, quality: 0.4 },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfJsLib = any;

let pdfjsPromise: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    const moduleScript = document.createElement("script");
    moduleScript.type = "module";
    moduleScript.textContent = `
      import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.min.mjs';
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs';
      window.__pdfjsLib = pdfjsLib;
      window.dispatchEvent(new Event('pdfjsReady'));
    `;
    document.head.appendChild(moduleScript);

    const onReady = () => {
      window.removeEventListener("pdfjsReady", onReady);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).__pdfjsLib;
      if (lib) resolve(lib);
      else reject(new Error("pdf.js failed to load"));
    };

    window.addEventListener("pdfjsReady", onReady);

    setTimeout(() => {
      window.removeEventListener("pdfjsReady", onReady);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).__pdfjsLib;
      if (lib) resolve(lib);
      else reject(new Error("pdf.js load timeout"));
    }, 15000);
  });

  return pdfjsPromise;
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
  const [progress, setProgress] = useState(0);
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
    ? "PDF 파일 용량을 줄여보세요. 이미지 품질 조절로 최대 80% 압축. 서버 업로드 없이 100% 안전합니다."
    : "Compress PDF files to reduce file size online for free. Up to 80% reduction via image resampling. No upload to servers.";
  const pageTitle = isKo ? "PDF 압축" : "PDF Compressor";

  const loadPdf = useCallback(async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      // Validate PDF by attempting to load with pdf-lib
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
    setProgress(0);
    setStatus(isKo ? "PDF.js 로딩 중..." : "Loading PDF.js...");

    try {
      // 1. Load pdf.js for rendering and jsPDF for output
      const [pdfjsLib, { default: jsPDF }] = await Promise.all([
        loadPdfJs(),
        import("jspdf"),
      ]);

      setStatus(isKo ? "PDF 페이지 렌더링 중..." : "Rendering PDF pages...");

      // 2. Open the PDF with pdf.js
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) }).promise;
      const totalPages = pdf.numPages;
      const settings = COMPRESSION_SETTINGS[compressionLevel];

      // 3. Render each page to canvas and collect JPEG data
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const pageImages: { dataUrl: string; width: number; height: number }[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: settings.scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Clear and render
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Export as JPEG
        const dataUrl = canvas.toDataURL("image/jpeg", settings.quality);
        pageImages.push({
          dataUrl,
          width: viewport.width,
          height: viewport.height,
        });

        setProgress(Math.round((i / totalPages) * 80));
        setStatus(
          isKo
            ? `페이지 처리 중... ${i}/${totalPages}`
            : `Processing pages... ${i}/${totalPages}`
        );

        // Yield to keep UI responsive
        await new Promise((r) => setTimeout(r, 0));
      }

      setStatus(isKo ? "PDF 생성 중..." : "Building PDF...");
      setProgress(85);

      // 4. Build new PDF with jsPDF using the JPEG images
      const firstImg = pageImages[0];
      // Convert px to mm (assume 72 DPI base for PDF points, then scaled)
      const pxToMm = (px: number) => (px * 25.4) / 72;

      const doc = new jsPDF({
        orientation: firstImg.width > firstImg.height ? "landscape" : "portrait",
        unit: "mm",
        format: [pxToMm(firstImg.width), pxToMm(firstImg.height)],
      });

      for (let i = 0; i < pageImages.length; i++) {
        const img = pageImages[i];
        const w = pxToMm(img.width);
        const h = pxToMm(img.height);

        if (i > 0) {
          doc.addPage([w, h], img.width > img.height ? "landscape" : "portrait");
        }

        doc.addImage(img.dataUrl, "JPEG", 0, 0, w, h, undefined, "FAST");

        setProgress(85 + Math.round(((i + 1) / pageImages.length) * 15));
      }

      const pdfOutput = doc.output("arraybuffer");
      const blob = new Blob([pdfOutput], { type: "application/pdf" });

      setResult({
        originalSize: fileSize,
        compressedSize: pdfOutput.byteLength,
        blob,
      });
      setProgress(100);
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
          a: "PDF의 각 페이지를 이미지로 렌더링한 후, 선택한 압축 수준에 따라 이미지 품질과 해상도를 낮춰서 새로운 PDF로 재구성합니다. PDF 용량의 대부분은 이미지가 차지하므로, 이 방식이 가장 효과적입니다.",
        },
        {
          q: "압축하면 품질이 떨어지나요?",
          a: "압축 수준에 따라 다릅니다. '낮음'은 눈에 띄는 차이가 거의 없고 약 30% 감소합니다. '중간'은 약간의 품질 저하로 약 50% 감소합니다. '높음'은 눈에 띄는 품질 저하가 있지만 최대 70% 이상 감소합니다. 텍스트 가독성은 모든 수준에서 유지됩니다.",
        },
        {
          q: "안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "이미지가 없는 텍스트 PDF도 압축되나요?",
          a: "텍스트 위주의 PDF는 원래 용량이 작아서 압축 효과가 적을 수 있습니다. 이 도구는 이미지가 포함된 PDF(스캔 문서, 사진 포함 문서 등)에서 가장 큰 효과를 발휘합니다.",
        },
        {
          q: "최대 파일 크기는 얼마인가요?",
          a: "브라우저 메모리에 따라 달라지지만, 일반적으로 50MB 이하의 PDF 파일을 문제없이 처리할 수 있습니다. 매우 큰 파일은 처리 시간이 길어질 수 있습니다.",
        },
      ]
    : [
        {
          q: "How does PDF compression work?",
          a: "Each page is rendered as an image, then re-encoded at reduced quality and resolution based on your chosen compression level. Since images make up most of a PDF's file size, this approach is the most effective.",
        },
        {
          q: "Will quality be affected?",
          a: "It depends on the compression level. 'Low' shows barely noticeable difference (~30% reduction). 'Medium' has slight quality loss (~50% reduction). 'High' has visible quality reduction but achieves up to 70%+ reduction. Text readability is maintained at all levels.",
        },
        {
          q: "Is it safe?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "Does it work on text-only PDFs?",
          a: "Text-heavy PDFs are already small, so compression may be limited. This tool is most effective on PDFs containing images (scanned documents, photo-heavy reports, etc.).",
        },
        {
          q: "What is the maximum file size?",
          a: "It depends on your browser's available memory. Typically, you can handle PDF files up to 50MB without issues. Very large files may take longer to process.",
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
                    {isKo ? "품질 유지, ~30% 감소" : "Quality kept, ~30% smaller"}
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
                    {isKo ? "균형 잡힌, ~50% 감소" : "Balanced, ~50% smaller"}
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
                    {isKo ? "최대 압축, ~70% 감소" : "Max compress, ~70% smaller"}
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
                  ? `압축 중... ${progress}%`
                  : `Compressing... ${progress}%`
                : isKo
                  ? "PDF 압축"
                  : "Compress PDF"}
            </button>

            {/* Progress bar */}
            {processing && (
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-4">
            {/* Before → After display */}
            <div className="flex items-center justify-center gap-3">
              <div className="text-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {isKo ? "원본" : "Original"}
                </p>
                <p className="text-lg font-bold">
                  {formatFileSize(result.originalSize)}
                </p>
              </div>
              <div className="text-xl text-neutral-400">→</div>
              <div className="text-center">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                  {isKo ? "압축 후" : "Compressed"}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatFileSize(result.compressedSize)}
                </p>
              </div>
            </div>
            {/* Compression ratio badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium">
                {parseFloat(compressionRatio!) > 0
                  ? `${compressionRatio}% ${isKo ? "감소" : "smaller"}`
                  : isKo
                    ? "추가 압축 불가"
                    : "No further compression possible"}
              </span>
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
