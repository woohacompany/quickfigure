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

/* ── Minimal ZIP builder (no compression, STORE only) ── */
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBlob(
  files: { name: string; content: Uint8Array }[]
): Blob {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = file.content;
    const checksum = crc32(data);

    // Local file header (30 + name)
    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); // STORE
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, checksum, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);

    // Central directory entry (46 + name)
    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, checksum, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);

    parts.push(lh, data);
    centralDir.push(cd);
    offset += lh.length + data.length;
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const entry of centralDir) {
    parts.push(entry);
    cdSize += entry.length;
  }

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);
  parts.push(eocd);

  return new Blob(parts as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/* ── XML helpers ── */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDocx(pages: string[]): Blob {
  const encoder = new TextEncoder();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  let bodyContent = "";
  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i].split("\n");
    // Page break between pages
    if (i > 0) {
      bodyContent += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
    // Page heading
    bodyContent += `<w:p><w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Page ${i + 1}</w:t></w:r></w:p>`;
    for (const line of lines) {
      if (line.trim()) {
        bodyContent += `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
      } else {
        bodyContent += `<w:p/>`;
      }
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>${bodyContent}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>
</w:document>`;

  return createZipBlob([
    { name: "[Content_Types].xml", content: encoder.encode(contentTypes) },
    { name: "_rels/.rels", content: encoder.encode(rels) },
    { name: "word/_rels/document.xml.rels", content: encoder.encode(wordRels) },
    { name: "word/document.xml", content: encoder.encode(documentXml) },
  ]);
}

/* ── Load PDF.js from CDN ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLibPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadPdfJs(): Promise<any> {
  if (pdfjsLibPromise) return pdfjsLibPromise;
  pdfjsLibPromise = new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).pdfjsLib) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdf.js failed to load"));
      }
    };
    script.onerror = () => {
      pdfjsLibPromise = null;
      reject(new Error("pdf.js CDN load error"));
    };
    document.head.appendChild(script);
  });
  return pdfjsLibPromise;
}

/* ── Component ── */
export default function PdfToWordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-to-word");
  const isKo = locale === "ko";

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "PDF 워드 변환 - PDF to Word 변환기 | QuickFigure"
    : "PDF to Word Converter - Free Online Tool | QuickFigure";
  const description = isKo
    ? "PDF 파일을 편집 가능한 Word 문서(DOCX)로 변환하세요. 서버 업로드 없이 브라우저에서 100% 처리됩니다."
    : "Convert PDF files to editable Word documents (DOCX) online for free. No upload needed, all processing happens in your browser.";
  const pageTitle = isKo ? "PDF 워드 변환" : "PDF to Word Converter";

  const loadFile = useCallback(
    async (f: File) => {
      try {
        setStatus(isKo ? "PDF 로딩 중..." : "Loading PDF...");
        const buffer = await f.arrayBuffer();

        // Use pdf-lib to get page count quickly
        const { PDFDocument } = await import("pdf-lib");
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = pdf.getPageCount();

        setFile(f);
        setFileName(f.name);
        setFileSize(f.size);
        setPdfBuffer(buffer);
        setTotalPages(count);
        setStatus("");
        setProgress(0);
        setDownloadUrl(null);
        setDownloadName("");
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
      if (pdfFile) loadFile(pdfFile);
    },
    [loadFile]
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

  const convertToWord = useCallback(async () => {
    if (!pdfBuffer) return;
    setProcessing(true);
    setProgress(0);
    setDownloadUrl(null);
    setStatus(isKo ? "PDF.js 로딩 중..." : "Loading PDF.js...");

    try {
      const pdfjsLib = await loadPdfJs();
      setStatus(isKo ? "PDF 분석 중..." : "Analyzing PDF...");

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pageTexts: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setStatus(
          isKo
            ? `텍스트 추출 중... (${i}/${numPages})`
            : `Extracting text... (${i}/${numPages})`
        );
        setProgress(Math.round((i / numPages) * 80));

        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const strings = textContent.items.map((item: any) => item.str || "");
        pageTexts.push(strings.join(" "));
      }

      setStatus(isKo ? "DOCX 생성 중..." : "Generating DOCX...");
      setProgress(90);

      const blob = buildDocx(pageTexts);
      const url = URL.createObjectURL(blob);
      const baseName = fileName.replace(/\.pdf$/i, "");
      const outName = `${baseName}.docx`;

      setDownloadUrl(url);
      setDownloadName(outName);
      setProgress(100);
      setStatus(
        isKo
          ? "변환 완료! 아래 버튼을 클릭하여 다운로드하세요."
          : "Conversion complete! Click the button below to download."
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
  }, [pdfBuffer, fileName, isKo]);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [downloadUrl, downloadName]);

  const clearFile = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setFileName("");
    setFileSize(0);
    setTotalPages(0);
    setProcessing(false);
    setStatus("");
    setProgress(0);
    setPdfBuffer(null);
    setDownloadUrl(null);
    setDownloadName("");
  }, [downloadUrl]);

  const faqItems = isKo
    ? [
        {
          q: "PDF를 Word로 변환할 때 서버에 업로드되나요?",
          a: "아니요, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 전송되지 않으므로 개인정보가 완벽하게 보호됩니다.",
        },
        {
          q: "변환된 DOCX 파일의 품질은 어떤가요?",
          a: "PDF에서 텍스트를 추출하여 DOCX로 변환합니다. 텍스트 기반 PDF는 높은 정확도로 변환되지만, 이미지 기반 PDF(스캔 문서)는 텍스트 추출이 제한될 수 있습니다.",
        },
        {
          q: "이미지가 포함된 PDF도 변환할 수 있나요?",
          a: "현재는 텍스트 추출에 초점을 맞추고 있습니다. PDF 내의 이미지는 DOCX에 포함되지 않으며, 텍스트 콘텐츠만 변환됩니다.",
        },
        {
          q: "대용량 PDF 파일도 처리할 수 있나요?",
          a: "브라우저 메모리 한도 내에서 처리 가능합니다. 일반적으로 수십 MB 크기의 PDF도 문제없이 변환할 수 있습니다.",
        },
      ]
    : [
        {
          q: "Are my files uploaded to a server?",
          a: "No, all processing happens entirely in your browser. Your files are never sent to any server, ensuring complete privacy and security.",
        },
        {
          q: "How good is the conversion quality?",
          a: "Text-based PDFs are converted with high accuracy. However, scanned or image-based PDFs may have limited text extraction since OCR is not included.",
        },
        {
          q: "Can I convert PDFs with images?",
          a: "This tool focuses on text extraction. Images within the PDF are not included in the DOCX output — only the text content is converted.",
        },
        {
          q: "Can I process large PDF files?",
          a: "Yes, as long as your browser has sufficient memory. Typically, PDFs up to several tens of MB can be processed without issues.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 PDF 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "파일이 로드되면 페이지 수와 파일 크기가 표시됩니다.",
        "'Word로 변환' 버튼을 클릭하여 변환을 시작하세요.",
        "변환이 완료되면 '다운로드' 버튼을 클릭하여 DOCX 파일을 저장하세요.",
      ]
    : [
        "Drag and drop a PDF file into the upload area above, or click to browse and select a file.",
        "Once the file is loaded, you will see the page count and file size.",
        "Click the 'Convert to Word' button to start the conversion.",
        "When the conversion is complete, click the 'Download' button to save the DOCX file.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
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

            {/* Progress bar */}
            {processing && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Convert button */}
            {!downloadUrl && (
              <button
                onClick={convertToWord}
                disabled={processing}
                className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing
                  ? isKo
                    ? "변환 중..."
                    : "Converting..."
                  : isKo
                    ? "Word로 변환 (DOCX)"
                    : "Convert to Word (DOCX)"}
              </button>
            )}

            {/* Download button */}
            {downloadUrl && (
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  {isKo
                    ? `다운로드 (${downloadName})`
                    : `Download (${downloadName})`}
                </button>
                <button
                  onClick={clearFile}
                  className="w-full px-5 py-2.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  {isKo ? "다른 파일 변환" : "Convert another file"}
                </button>
              </div>
            )}
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
        </div>
      </section>

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="pdf-to-word"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="pdf-to-word"
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
