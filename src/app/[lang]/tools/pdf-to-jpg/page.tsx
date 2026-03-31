"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let pdfjsLoadPromise: Promise<void> | null = null;
function ensurePdfJs(): Promise<void> {
  if (pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve();
      } else {
        reject(new Error("Failed to load PDF.js"));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfjsLoadPromise;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBlob(
  files: { name: string; content: Uint8Array }[]
): Blob {
  const centralDir: Uint8Array[] = [];
  const localFiles: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.content);
    const size = file.content.length;

    // Local file header (30 + name + data)
    const local = new Uint8Array(30 + nameBytes.length + size);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(file.content, 30 + nameBytes.length);
    localFiles.push(local);

    // Central directory header (46 + name)
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralDir.push(central);

    offset += local.length;
  }

  const centralSize = centralDir.reduce((s, c) => s + c.length, 0);

  // End of central directory (22 bytes)
  const endRecord = new Uint8Array(22);
  const ev = new DataView(endRecord.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localFiles, ...centralDir, endRecord] as BlobPart[], {
    type: "application/zip",
  });
}

export default function PdfToJpgPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-to-jpg");
  const isKo = locale === "ko";

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dpi, setDpi] = useState<72 | 150 | 300>(150);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [images, setImages] = useState<
    { name: string; blob: Blob; url: string }[]
  >([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "PDF JPG 변환 - PDF를 이미지로 변환 | QuickFigure"
    : "PDF to JPG Converter - Convert PDF to Images Free | QuickFigure";
  const description = isKo
    ? "PDF 페이지를 고품질 JPG 이미지로 변환하세요. 해상도 선택(72/150/300 DPI), 개별 또는 ZIP 다운로드."
    : "Convert PDF pages to high-quality JPG images for free. Choose resolution (72/150/300 DPI), download individual pages or all as ZIP.";
  const pageTitle = isKo ? "PDF JPG 변환" : "PDF to JPG Converter";

  const loadPdf = useCallback(
    async (f: File) => {
      try {
        setStatus(isKo ? "PDF 로딩 중..." : "Loading PDF...");
        await ensurePdfJs();
        const buffer = await f.arrayBuffer();
        const lib = (window as any).pdfjsLib;
        const pdf = await lib.getDocument({ data: buffer }).promise;
        const count = pdf.numPages;
        setFile(f);
        setFileName(f.name);
        setFileSize(f.size);
        setTotalPages(count);
        setImages([]);
        setStatus("");
      } catch {
        setStatus(
          isKo
            ? "PDF 파일을 읽을 수 없습니다. 파일을 확인해주세요."
            : "Could not read the PDF file. Please check your file."
        );
      }
    },
    [isKo]
  );

  const handleFileInput = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const pdfFile = arr.find(
        (f) =>
          f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
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

  const convertToJpg = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setImages([]);
    setStatus(isKo ? "변환 준비 중..." : "Preparing conversion...");

    try {
      await ensurePdfJs();
      const buffer = await file.arrayBuffer();
      const lib = (window as any).pdfjsLib;
      const pdf = await lib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      setProgress({ current: 0, total: numPages });

      const scale = dpi / 72;
      const results: { name: string; blob: Blob; url: string }[] = [];
      const baseName = fileName.replace(/\.pdf$/i, "");

      for (let i = 1; i <= numPages; i++) {
        setProgress({ current: i, total: numPages });
        setStatus(
          isKo
            ? `페이지 ${i} / ${numPages} 변환 중...`
            : `Converting page ${i} of ${numPages}...`
        );

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b!),
            "image/jpeg",
            0.92
          );
        });

        const url = URL.createObjectURL(blob);
        const pageName = `${baseName}_page_${String(i).padStart(
          String(numPages).length,
          "0"
        )}.jpg`;
        results.push({ name: pageName, blob, url });
      }

      setImages(results);
      setStatus(
        isKo
          ? `변환 완료! ${numPages}개 이미지 생성됨.`
          : `Conversion complete! ${numPages} image${numPages !== 1 ? "s" : ""} created.`
      );
    } catch (err) {
      console.error(err);
      setStatus(
        isKo
          ? "변환 중 오류가 발생했습니다. 파일을 확인해주세요."
          : "An error occurred during conversion. Please check your file."
      );
    } finally {
      setProcessing(false);
    }
  }, [file, fileName, dpi, isKo]);

  const downloadImage = useCallback(
    (img: { name: string; url: string }) => {
      const link = document.createElement("a");
      link.href = img.url;
      link.download = img.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  const downloadAllAsZip = useCallback(async () => {
    if (images.length === 0) return;
    setStatus(isKo ? "ZIP 생성 중..." : "Creating ZIP...");

    try {
      const files: { name: string; content: Uint8Array }[] = [];
      for (const img of images) {
        const arrayBuffer = await img.blob.arrayBuffer();
        files.push({ name: img.name, content: new Uint8Array(arrayBuffer) });
      }

      const zipBlob = createZipBlob(files);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = fileName.replace(/\.pdf$/i, "");
      link.download = `${baseName}_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus(isKo ? "ZIP 다운로드 시작!" : "ZIP download started!");
    } catch {
      setStatus(
        isKo
          ? "ZIP 생성 중 오류가 발생했습니다."
          : "An error occurred while creating the ZIP."
      );
    }
  }, [images, fileName, isKo]);

  const clearFile = useCallback(() => {
    for (const img of images) {
      URL.revokeObjectURL(img.url);
    }
    setFile(null);
    setFileName("");
    setFileSize(0);
    setTotalPages(0);
    setImages([]);
    setStatus("");
    setProgress({ current: 0, total: 0 });
  }, [images]);

  const faqItems = isKo
    ? [
        {
          q: "어떤 DPI를 선택해야 하나요?",
          a: "72 DPI는 웹/화면용으로 적합하고 파일 크기가 작습니다. 150 DPI는 일반적인 용도에 적합합니다. 300 DPI는 인쇄용으로 최고 품질을 제공하지만 파일 크기가 큽니다.",
        },
        {
          q: "변환이 안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "특정 페이지만 변환할 수 있나요?",
          a: "현재는 모든 페이지를 변환합니다. 특정 페이지만 필요하다면 PDF 분할 도구로 먼저 원하는 페이지를 추출한 후 변환하세요.",
        },
        {
          q: "이미지 품질은 어떤가요?",
          a: "JPG 92% 품질로 변환되며, DPI 설정에 따라 해상도가 달라집니다. 300 DPI는 인쇄에도 적합한 고해상도 이미지를 생성합니다.",
        },
      ]
    : [
        {
          q: "What DPI should I choose?",
          a: "72 DPI is suitable for web/screen viewing with small file sizes. 150 DPI works well for general purposes. 300 DPI provides the highest quality for printing but produces larger files.",
        },
        {
          q: "Is it safe to convert PDFs here?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "Can I convert specific pages only?",
          a: "Currently, all pages are converted. If you need specific pages, use the PDF Splitter tool first to extract the pages you want, then convert them here.",
        },
        {
          q: "What is the image quality?",
          a: "Images are exported at 92% JPG quality. Resolution depends on your DPI setting — 300 DPI produces high-resolution images suitable for printing.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 PDF 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "DPI(해상도)를 선택하세요: 72 DPI(웹용), 150 DPI(일반), 300 DPI(인쇄용).",
        "'JPG로 변환' 버튼을 클릭하면 각 페이지가 이미지로 변환됩니다.",
        "변환된 이미지를 미리보기로 확인하고, 개별 다운로드 버튼으로 저장하세요.",
        "모든 이미지를 한 번에 받으려면 '전체 ZIP 다운로드' 버튼을 클릭하세요.",
      ]
    : [
        "Drag and drop a PDF file into the upload area above, or click to browse and select a file.",
        "Choose a DPI (resolution): 72 DPI for web, 150 DPI for general use, or 300 DPI for print.",
        "Click the 'Convert to JPG' button to convert each page to an image.",
        "Preview the converted images and use individual download buttons to save specific pages.",
        "To download all images at once, click the 'Download All (ZIP)' button.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="pdf-to-jpg" locale={locale} />
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

            {/* DPI selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isKo ? "해상도 (DPI)" : "Resolution (DPI)"}
              </label>
              <div className="flex gap-2">
                {([72, 150, 300] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDpi(d)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      dpi === d
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {d} DPI
                    <span className="block text-xs mt-0.5 opacity-70">
                      {d === 72
                        ? isKo
                          ? "웹/화면"
                          : "Web"
                        : d === 150
                          ? isKo
                            ? "일반"
                            : "General"
                          : isKo
                            ? "인쇄용"
                            : "Print"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Convert button */}
            <button
              onClick={convertToJpg}
              disabled={processing}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing
                ? isKo
                  ? `변환 중... (${progress.current}/${progress.total})`
                  : `Converting... (${progress.current}/${progress.total})`
                : isKo
                  ? "JPG로 변환"
                  : "Convert to JPG"}
            </button>

            {/* Progress bar */}
            {processing && progress.total > 0 && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Converted images preview */}
        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {isKo
                  ? `${images.length}개 이미지 변환 완료`
                  : `${images.length} image${images.length !== 1 ? "s" : ""} converted`}
              </p>
              <button
                onClick={downloadAllAsZip}
                className="px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                {isKo
                  ? `전체 ZIP 다운로드 (${images.length}개)`
                  : `Download All (ZIP) (${images.length})`}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={`Page ${i + 1}`}
                    className="w-full aspect-[3/4] object-contain bg-neutral-50 dark:bg-neutral-900"
                  />
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {isKo ? `${i + 1}페이지` : `Page ${i + 1}`}
                    </span>
                    <button
                      onClick={() => downloadImage(img)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
                    >
                      {isKo ? "저장" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
        </div>
      </section>

      <ToolHowItWorks slug="pdf-to-jpg" locale={locale} />
      <ToolDisclaimer slug="pdf-to-jpg" locale={locale} />

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="pdf-to-jpg"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="pdf-to-jpg"
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
