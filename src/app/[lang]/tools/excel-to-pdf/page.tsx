"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface SheetData {
  name: string;
  headers: string[];
  rows: string[][];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function ExcelToPdfPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("excel-to-pdf");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // PDF options
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("a4");
  const [fontSize, setFontSize] = useState(10);
  const [highlightHeader, setHighlightHeader] = useState(true);
  const [includeAllSheets, setIncludeAllSheets] = useState(false);

  const title = isKo
    ? "엑셀 PDF 변환 - XLSX/CSV를 PDF로"
    : "Excel to PDF Converter - Convert XLSX/CSV to PDF";
  const description = isKo
    ? "엑셀 파일을 깔끔한 PDF로 변환하세요. 레이아웃 설정, 미리보기 제공. 100% 무료, 서버 업로드 없음."
    : "Convert Excel files to clean PDF documents. Layout options with preview. 100% free, no server upload.";

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError("");
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      const parsed: SheetData[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];
        const json: string[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
          raw: false,
        });
        if (json.length === 0) return { name, headers: [], rows: [] };
        const headers = json[0].map((h) => String(h));
        const rows = json.slice(1).map((row) => row.map((cell) => String(cell)));
        return { name, headers, rows };
      });

      setSheets(parsed);
      setSelectedSheet(0);
      setFileName(file.name);
      setFileSize(file.size);
    } catch {
      setError(
        isKo
          ? "파일을 읽을 수 없습니다. XLSX, XLS 또는 CSV 파일인지 확인하세요."
          : "Unable to read the file. Please ensure it is an XLSX, XLS, or CSV file."
      );
      setSheets([]);
    }
    setIsLoading(false);
  }, [isKo]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) parseFile(e.target.files[0]);
      e.target.value = "";
    },
    [parseFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile]
  );

  const generatePdf = useCallback(async () => {
    if (sheets.length === 0) return;
    setIsGenerating(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format: pageSize,
      });

      const sheetsToExport = includeAllSheets
        ? sheets
        : [sheets[selectedSheet]];

      sheetsToExport.forEach((sheet, idx) => {
        if (idx > 0) doc.addPage();

        // Sheet name as title
        if (sheetsToExport.length > 1) {
          doc.setFontSize(fontSize + 4);
          doc.text(sheet.name, 14, 15);
        }

        const startY = sheetsToExport.length > 1 ? 20 : 14;

        if (sheet.headers.length === 0 && sheet.rows.length === 0) {
          doc.setFontSize(fontSize);
          doc.text(
            isKo ? "(빈 시트)" : "(Empty sheet)",
            14,
            startY + 5
          );
          return;
        }

        autoTable(doc, {
          startY,
          head: [sheet.headers],
          body: sheet.rows,
          styles: {
            fontSize,
            cellPadding: 2,
            overflow: "linebreak",
          },
          headStyles: highlightHeader
            ? {
                fillColor: [41, 98, 255],
                textColor: [255, 255, 255],
                fontStyle: "bold",
              }
            : {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
              },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { top: 14, right: 14, bottom: 14, left: 14 },
          didDrawPage: (data: { pageNumber: number }) => {
            // Footer with page number
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
              `${data.pageNumber} / ${pageCount}`,
              doc.internal.pageSize.getWidth() / 2,
              doc.internal.pageSize.getHeight() - 8,
              { align: "center" }
            );
          },
        });
      });

      const baseName = fileName.replace(/\.[^.]+$/, "");
      doc.save(`${baseName}.pdf`);
    } catch {
      setError(
        isKo
          ? "PDF 생성 중 오류가 발생했습니다."
          : "An error occurred while generating the PDF."
      );
    }
    setIsGenerating(false);
  }, [
    sheets,
    selectedSheet,
    orientation,
    pageSize,
    fontSize,
    highlightHeader,
    includeAllSheets,
    fileName,
    isKo,
  ]);

  const currentSheet = sheets[selectedSheet] ?? null;

  const faqItems = isKo
    ? [
        {
          q: "어떤 파일 형식을 지원하나요?",
          a: "XLSX(엑셀 2007+), XLS(엑셀 97-2003), CSV 파일을 지원합니다. 가장 일반적인 스프레드시트 형식 모두 사용 가능합니다.",
        },
        {
          q: "파일이 서버에 업로드되나요?",
          a: "아닙니다. 모든 처리가 브라우저에서 이루어집니다. 파일이 외부 서버로 전송되지 않으므로 회사 기밀 문서도 안심하고 변환할 수 있습니다.",
        },
        {
          q: "한글이 깨지지 않나요?",
          a: "기본 PDF 폰트로 생성되므로, 한글이 포함된 경우 일부 글자가 깨질 수 있습니다. 이 경우 엑셀 자체의 'PDF로 내보내기' 기능을 사용하는 것을 권장합니다.",
        },
        {
          q: "여러 시트를 하나의 PDF로 합칠 수 있나요?",
          a: "네. '모든 시트 포함' 옵션을 활성화하면 워크북의 모든 시트가 하나의 PDF 파일로 합쳐집니다. 각 시트는 새 페이지에서 시작됩니다.",
        },
        {
          q: "레이아웃이 깨지면 어떻게 하나요?",
          a: "열이 많은 경우 '가로 방향'으로 변경하거나, 폰트 크기를 줄여보세요. 용지 크기를 Letter로 바꾸는 것도 도움이 됩니다.",
        },
      ]
    : [
        {
          q: "What file formats are supported?",
          a: "XLSX (Excel 2007+), XLS (Excel 97-2003), and CSV files are supported. All common spreadsheet formats work.",
        },
        {
          q: "Are my files uploaded to a server?",
          a: "No. All processing happens in your browser. Files are never sent to any external server, so you can safely convert confidential documents.",
        },
        {
          q: "Does it support non-Latin characters (CJK, etc.)?",
          a: "The PDF is generated with default fonts, which may not render all CJK characters correctly. For files with complex non-Latin text, consider using Excel's built-in 'Export as PDF' feature.",
        },
        {
          q: "Can I combine multiple sheets into one PDF?",
          a: "Yes. Enable the 'Include all sheets' option and all sheets in your workbook will be combined into a single PDF file. Each sheet starts on a new page.",
        },
        {
          q: "What if the layout looks broken?",
          a: "If you have many columns, try switching to landscape orientation or reducing the font size. Changing the page size to Letter may also help.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "엑셀 PDF 변환" : "Excel to PDF Converter"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="excel-to-pdf" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Upload area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <p className="text-4xl mb-2">📑</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo
              ? "엑셀 파일을 드래그하거나 클릭하여 업로드"
              : "Drag & drop an Excel file or click to upload"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">XLSX, XLS, CSV</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {isLoading && (
          <p className="text-center text-neutral-500">
            {isKo ? "파일 읽는 중..." : "Reading file..."}
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}

        {/* File info + sheet selector */}
        {sheets.length > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {fileName} ({formatBytes(fileSize)})
              </span>
              <button
                onClick={() => {
                  setSheets([]);
                  setFileName("");
                  setFileSize(0);
                  setError("");
                }}
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              >
                {isKo ? "파일 제거" : "Remove"}
              </button>
            </div>

            {/* Sheet tabs */}
            {sheets.length > 1 && (
              <div className="flex gap-1 overflow-x-auto pb-1">
                {sheets.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSheet(i)}
                    className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                      selectedSheet === i
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {/* Table preview */}
            {currentSheet && (
              <div className="overflow-auto max-h-80 rounded-md border border-neutral-200 dark:border-neutral-700">
                {currentSheet.headers.length === 0 &&
                currentSheet.rows.length === 0 ? (
                  <p className="p-4 text-center text-neutral-400 text-sm">
                    {isKo ? "빈 시트입니다" : "Empty sheet"}
                  </p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
                      <tr>
                        {currentSheet.headers.map((h, i) => (
                          <th
                            key={i}
                            className="px-3 py-2 text-left font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap border-b border-neutral-200 dark:border-neutral-700"
                          >
                            {h || `Col ${i + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheet.rows.slice(0, 50).map((row, ri) => (
                        <tr
                          key={ri}
                          className="border-b border-neutral-100 dark:border-neutral-800"
                        >
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {currentSheet.rows.length > 50 && (
                  <p className="p-2 text-center text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700">
                    {isKo
                      ? `... ${currentSheet.rows.length - 50}행 더 (미리보기에서는 50행만 표시)`
                      : `... ${currentSheet.rows.length - 50} more rows (preview shows first 50)`}
                  </p>
                )}
              </div>
            )}

            {/* PDF options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Orientation */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "용지 방향" : "Orientation"}
                </label>
                <select
                  value={orientation}
                  onChange={(e) =>
                    setOrientation(e.target.value as "portrait" | "landscape")
                  }
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">
                    {isKo ? "세로 (Portrait)" : "Portrait"}
                  </option>
                  <option value="landscape">
                    {isKo ? "가로 (Landscape)" : "Landscape"}
                  </option>
                </select>
              </div>

              {/* Page size */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "용지 크기" : "Page Size"}
                </label>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    setPageSize(e.target.value as "a4" | "letter")
                  }
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">Letter (8.5 × 11 in)</option>
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "폰트 크기" : "Font Size"}: {fontSize}pt
                </label>
                <input
                  type="range"
                  min={6}
                  max={16}
                  step={1}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>6pt</span>
                  <span>16pt</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium block">
                  {isKo ? "옵션" : "Options"}
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highlightHeader}
                    onChange={(e) => setHighlightHeader(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isKo ? "헤더 행 강조 (파란색)" : "Highlight header row (blue)"}
                  </span>
                </label>
                {sheets.length > 1 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAllSheets}
                      onChange={(e) => setIncludeAllSheets(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {isKo
                        ? `모든 시트 포함 (${sheets.length}개)`
                        : `Include all sheets (${sheets.length})`}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={generatePdf}
              disabled={isGenerating}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating
                ? isKo
                  ? "PDF 생성 중..."
                  : "Generating PDF..."
                : isKo
                ? "PDF 다운로드"
                : "Download PDF"}
            </button>
          </>
        )}
      </div>

      {/* Privacy notice */}
      <p className="mt-3 text-xs text-neutral-400 text-center">
        {isKo
          ? "🔒 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 전송되지 않습니다."
          : "🔒 All processing happens in your browser. Files are never uploaded to any server."}
      </p>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "엑셀 파일(XLSX, XLS, CSV)을 드래그하거나 클릭하여 업로드하세요.",
                "여러 시트가 있으면 변환할 시트를 선택하거나 '모든 시트 포함'을 체크하세요.",
                "테이블 미리보기에서 데이터를 확인하세요.",
                "용지 방향(세로/가로), 크기(A4/Letter), 폰트 크기를 설정하세요.",
                "PDF 다운로드 버튼을 클릭하여 저장하세요.",
              ]
            : [
                "Upload an Excel file (XLSX, XLS, CSV) by dragging or clicking.",
                "If there are multiple sheets, select one or check 'Include all sheets'.",
                "Review your data in the table preview.",
                "Set orientation (portrait/landscape), page size (A4/Letter), and font size.",
                "Click Download PDF to save.",
              ]
          ).map((step, i) => (
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            description,
            url: `https://www.quickfigure.net/${lang}/tools/excel-to-pdf`,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {dict.blog.quickTools}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href={`/${lang}/tools/pdf-to-excel`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.pdfToExcel}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.pdfToExcelDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/excel-merge`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.excelMerge}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.excelMergeDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/word-to-pdf`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.wordToPdf}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.wordToPdfDesc}
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

      <ToolHowItWorks slug="excel-to-pdf" locale={locale} />
      <ToolDisclaimer slug="excel-to-pdf" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="excel-to-pdf"
        labels={dict.share}
      />
      <EmbedCodeButton slug="excel-to-pdf" lang={lang} labels={dict.embed} />

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
