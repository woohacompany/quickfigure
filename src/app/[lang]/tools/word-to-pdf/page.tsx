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

function readZipEntry(buffer: ArrayBuffer, targetName: string): Uint8Array | null {
  const view = new DataView(buffer);
  let offset = 0;
  while (offset < buffer.byteLength - 4) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameBytes = new Uint8Array(buffer, offset + 30, nameLen);
    const name = new TextDecoder().decode(nameBytes);
    const dataStart = offset + 30 + nameLen + extraLen;
    if (name === targetName) {
      return new Uint8Array(buffer, dataStart, compSize);
    }
    offset = dataStart + compSize;
  }
  return null;
}

function extractTextFromDocXml(xml: string): string[] {
  const paragraphs: string[] = [];
  const pRegex = /<w:p[\s\S]*?<\/w:p>/g;
  let pMatch;
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let text = "";
    let tMatch;
    while ((tMatch = tRegex.exec(pMatch[0])) !== null) {
      text += tMatch[1];
    }
    paragraphs.push(text);
  }
  return paragraphs;
}

export default function WordToPdfPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("word-to-pdf");
  const isKo = locale === "ko";

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [docxBuffer, setDocxBuffer] = useState<ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = isKo
    ? "워드 PDF 변환 - DOCX를 PDF로 변환 | QuickFigure"
    : "Word to PDF Converter - Convert DOCX to PDF Free | QuickFigure";
  const description = isKo
    ? "Word 문서(DOCX)를 PDF로 변환하세요. 서버 업로드 없이 브라우저에서 100% 처리됩니다."
    : "Convert Word documents (DOCX) to PDF online for free. No upload to servers, 100% browser-based processing.";
  const pageTitle = isKo ? "워드 PDF 변환" : "Word to PDF Converter";

  const loadDocx = useCallback(
    async (f: File) => {
      try {
        const buffer = await f.arrayBuffer();
        // Verify it's a valid ZIP/DOCX by checking the ZIP signature
        const view = new DataView(buffer);
        if (view.getUint32(0, true) !== 0x04034b50) {
          setStatus(
            isKo
              ? "유효한 DOCX 파일이 아닙니다. 파일을 확인해주세요."
              : "Not a valid DOCX file. Please check your file."
          );
          return;
        }
        setFile(f);
        setFileName(f.name);
        setFileSize(f.size);
        setDocxBuffer(buffer);
        setStatus("");
      } catch {
        setStatus(
          isKo
            ? "DOCX 파일을 읽을 수 없습니다. 파일을 확인해주세요."
            : "Could not read the DOCX file. Please check your file."
        );
      }
    },
    [isKo]
  );

  const handleFileInput = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const docxFile = arr.find(
        (f) =>
          f.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          f.name.toLowerCase().endsWith(".docx")
      );
      if (docxFile) loadDocx(docxFile);
    },
    [loadDocx]
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

  const convertToPdf = useCallback(async () => {
    if (!docxBuffer) return;
    setProcessing(true);
    setStatus(isKo ? "DOCX 파일 분석 중..." : "Analyzing DOCX file...");

    try {
      // Extract document.xml from the DOCX (ZIP) file
      const xmlBytes = readZipEntry(docxBuffer, "word/document.xml");
      if (!xmlBytes) {
        setStatus(
          isKo
            ? "DOCX 파일에서 문서 내용을 찾을 수 없습니다."
            : "Could not find document content in the DOCX file."
        );
        setProcessing(false);
        return;
      }

      const xmlStr = new TextDecoder("utf-8").decode(xmlBytes);
      const paragraphs = extractTextFromDocXml(xmlStr);

      setStatus(isKo ? "PDF 생성 중..." : "Creating PDF...");

      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const fontSize = 12;
      const lineHeight = fontSize * 1.5;
      const margin = 50;
      const pageWidth = 595.28; // A4
      const pageHeight = 841.89; // A4
      const maxWidth = pageWidth - margin * 2;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const paragraph of paragraphs) {
        if (paragraph.trim() === "") {
          y -= lineHeight * 0.5;
          if (y < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          continue;
        }

        // Word wrap: split text into lines that fit within maxWidth
        const words = paragraph.split(/\s+/);
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        for (const line of lines) {
          if (y < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          // Filter out characters the font can't encode
          const safeLine = line.replace(/[^\x00-\x7F]/g, "?");
          page.drawText(safeLine, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }

        // Add paragraph spacing
        y -= lineHeight * 0.3;
      }

      setStatus(isKo ? "다운로드 준비 중..." : "Preparing download...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = fileName.replace(/\.docx$/i, "");
      link.download = `${baseName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus(
        isKo
          ? "변환 완료! 파일이 다운로드됩니다."
          : "Conversion complete! Downloading file."
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
  }, [docxBuffer, fileName, isKo]);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileName("");
    setFileSize(0);
    setStatus("");
    setDocxBuffer(null);
  }, []);

  const faqItems = isKo
    ? [
        {
          q: "워드 PDF 변환이 안전한가요?",
          a: "네, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 업로드되지 않으므로 100% 안전합니다.",
        },
        {
          q: "어떤 파일 형식을 지원하나요?",
          a: "DOCX 형식(.docx)만 지원됩니다. 구버전 DOC 파일(.doc)은 지원하지 않습니다.",
        },
        {
          q: "서식이 그대로 유지되나요?",
          a: "기본 텍스트와 단락 구조는 유지됩니다. 이미지, 표, 복잡한 서식(글꼴, 색상 등)은 변환 시 달라질 수 있습니다.",
        },
        {
          q: "파일 크기 제한이 있나요?",
          a: "서버 제한은 없지만, 브라우저 메모리에 따라 달라집니다. 일반적으로 수십 MB의 문서를 문제없이 처리할 수 있습니다.",
        },
      ]
    : [
        {
          q: "Is it safe to convert Word to PDF here?",
          a: "Yes, all processing happens entirely in your browser. Your files are never uploaded to any server, making it 100% private and secure.",
        },
        {
          q: "What file formats are supported?",
          a: "Only DOCX format (.docx) is supported. Legacy DOC files (.doc) are not supported.",
        },
        {
          q: "Will the formatting be preserved?",
          a: "Basic text and paragraph structure are preserved. Images, tables, and complex formatting (fonts, colors, etc.) may vary in the converted output.",
        },
        {
          q: "Are there file size limits?",
          a: "There are no server-side limits. It depends on your browser's available memory. Typically, documents of tens of MBs can be processed without issues.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "위의 업로드 영역에 DOCX 파일을 드래그하거나 클릭하여 파일을 선택하세요.",
        "파일이 로드되면 파일명과 크기가 표시됩니다.",
        "파일을 잘못 선택한 경우 '파일 제거' 버튼으로 제거하고 다시 선택하세요.",
        "'PDF로 변환' 버튼을 클릭하면 변환이 시작됩니다.",
        "변환이 완료되면 PDF 파일이 자동으로 다운로드됩니다.",
      ]
    : [
        "Drag and drop a DOCX file into the upload area above, or click to browse and select a file.",
        "Once the file is loaded, the file name and size will be displayed.",
        "If you selected the wrong file, click the 'Remove' button and select another file.",
        "Click the 'Convert to PDF' button to start the conversion.",
        "The converted PDF file will download automatically when complete.",
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
                ? "DOCX 파일을 여기에 드래그하거나 클릭하여 선택"
                : "Drag & drop a DOCX file here, or click to browse"}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              {isKo ? "DOCX 파일만 지원됩니다" : "Only DOCX files are supported"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
              {/* DOCX icon */}
              <div className="shrink-0 w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-500"
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

            {/* Convert button */}
            <button
              onClick={convertToPdf}
              disabled={processing}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing
                ? isKo
                  ? "변환 중..."
                  : "Converting..."
                : isKo
                  ? "PDF로 변환"
                  : "Convert to PDF"}
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
        slug="word-to-pdf"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="word-to-pdf"
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
