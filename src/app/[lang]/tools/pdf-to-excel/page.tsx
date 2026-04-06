"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface ExtractedTable {
  page: number;
  rows: string[][];
}

// ── PDF Text Item with positional data ──
interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
}

// ── Cluster text items into table rows/cols by Y/X coordinates ──
function clusterIntoTable(items: TextItem[], pageHeight: number): string[][] {
  if (items.length === 0) return [];

  // Sort by Y descending (top of page first), then X ascending
  const sorted = [...items].sort((a, b) => {
    const ay = pageHeight - a.transform[5];
    const by = pageHeight - b.transform[5];
    if (Math.abs(ay - by) > 3) return ay - by;
    return a.transform[4] - b.transform[4];
  });

  // Group by Y coordinate (same row if within 4px)
  const rows: { y: number; cells: { x: number; text: string }[] }[] = [];
  for (const item of sorted) {
    if (!item.str.trim()) continue;
    const y = pageHeight - item.transform[5];
    const x = item.transform[4];
    let found = false;
    for (const row of rows) {
      if (Math.abs(row.y - y) < 4) {
        row.cells.push({ x, text: item.str });
        found = true;
        break;
      }
    }
    if (!found) {
      rows.push({ y, cells: [{ x, text: item.str }] });
    }
  }

  // Sort cells in each row by X
  for (const row of rows) {
    row.cells.sort((a, b) => a.x - b.x);
  }

  // Detect column boundaries from all X positions
  const allX: number[] = [];
  for (const row of rows) {
    for (const cell of row.cells) {
      allX.push(cell.x);
    }
  }
  allX.sort((a, b) => a - b);

  // Cluster X positions into columns (gap > 15px = new column)
  const colBounds: number[] = [];
  if (allX.length > 0) {
    colBounds.push(allX[0]);
    for (let i = 1; i < allX.length; i++) {
      if (allX[i] - allX[i - 1] > 15) {
        colBounds.push(allX[i]);
      }
    }
  }

  // Assign cells to columns
  const result: string[][] = [];
  for (const row of rows) {
    const cols: string[] = new Array(colBounds.length).fill("");
    for (const cell of row.cells) {
      let colIdx = 0;
      let minDist = Infinity;
      for (let i = 0; i < colBounds.length; i++) {
        const dist = Math.abs(cell.x - colBounds[i]);
        if (dist < minDist) {
          minDist = dist;
          colIdx = i;
        }
      }
      cols[colIdx] = cols[colIdx] ? cols[colIdx] + " " + cell.text : cell.text;
    }
    result.push(cols);
  }

  return result;
}

// ── CSV generation with UTF-8 BOM ──
function tablesToCSV(tables: ExtractedTable[]): string {
  const lines: string[] = [];
  for (const table of tables) {
    if (tables.length > 1) {
      lines.push(`--- Page ${table.page} ---`);
    }
    for (const row of table.rows) {
      lines.push(
        row
          .map((cell) => {
            const escaped = cell.replace(/"/g, '""');
            return cell.includes(",") || cell.includes('"') || cell.includes("\n")
              ? `"${escaped}"`
              : escaped;
          })
          .join(",")
      );
    }
    if (tables.length > 1) lines.push("");
  }
  return "\uFEFF" + lines.join("\n");
}

export default function PdfToExcelPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  if (!isValidLocale(lang)) return null;

  const locale = lang as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("pdf-to-excel");

  const isKo = lang === "ko";
  const title = isKo
    ? "PDF 엑셀 변환 - PDF 표를 엑셀로 추출"
    : "PDF to Excel Converter - Extract Tables from PDF";
  const description = isKo
    ? "PDF 파일의 표를 엑셀(XLSX/CSV)로 변환하세요. 테이블 자동 감지, 미리보기 제공. 100% 무료, 서버 업로드 없음."
    : "Convert PDF tables to Excel (XLSX/CSV). Auto table detection with preview. 100% free, no server upload.";

  const [tables, setTables] = useState<ExtractedTable[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError(isKo ? "PDF 파일만 지원합니다." : "Only PDF files are supported.");
        return;
      }
      setLoading(true);
      setError("");
      setTables([]);
      setFileName(file.name);

      try {
        // Load pdf.js from CDN
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPageCount(pdf.numPages);

        const extracted: ExtractedTable[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const textContent = await page.getTextContent();

          const items = textContent.items
            .filter((item: { str?: string }) => typeof item.str === "string")
            .map((item: { str: string; transform: number[]; width: number; height: number }) => ({
              str: item.str,
              transform: item.transform,
              width: item.width,
              height: item.height,
            }));

          const rows = clusterIntoTable(items, viewport.height);
          // Filter out rows that are all empty
          const nonEmpty = rows.filter((r) => r.some((c) => c.trim()));
          if (nonEmpty.length > 0) {
            extracted.push({ page: i, rows: nonEmpty });
          }
        }

        if (extracted.length === 0) {
          setError(
            isKo
              ? "PDF에서 표 데이터를 찾을 수 없습니다. 텍스트 기반 PDF만 지원됩니다."
              : "No table data found in PDF. Only text-based PDFs are supported."
          );
        }
        setTables(extracted);
      } catch (err) {
        console.error(err);
        setError(
          isKo
            ? "PDF 처리 중 오류가 발생했습니다. 파일을 확인해주세요."
            : "Error processing PDF. Please check your file."
        );
      } finally {
        setLoading(false);
      }
    },
    [isKo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const downloadCSV = useCallback(() => {
    if (tables.length === 0) return;
    const csv = tablesToCSV(tables);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [tables, fileName]);

  const downloadXLSX = useCallback(async () => {
    if (tables.length === 0) return;
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();
      for (const table of tables) {
        const ws = XLSX.utils.aoa_to_sheet(table.rows);
        const sheetName =
          tables.length > 1
            ? `Page ${table.page}`
            : "Sheet1";
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
      XLSX.writeFile(wb, fileName.replace(/\.pdf$/i, "") + ".xlsx");
    } catch {
      setError(
        isKo
          ? "XLSX 다운로드 중 오류가 발생했습니다."
          : "Error downloading XLSX file."
      );
    }
  }, [tables, fileName, isKo]);

  const reset = useCallback(() => {
    setTables([]);
    setFileName("");
    setError("");
    setPageCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // FAQ items
  const faqItems = isKo
    ? [
        {
          q: "스캔한 PDF(이미지 PDF)도 변환할 수 있나요?",
          a: "아니요. 이 도구는 텍스트 기반 PDF만 지원합니다. 스캔한 PDF는 OCR(광학 문자 인식) 처리가 필요하며, 현재 이 기능은 제공하지 않습니다.",
        },
        {
          q: "한글이 깨지지 않나요?",
          a: "CSV 파일은 UTF-8 BOM으로 저장되어 엑셀에서 열 때 한글이 정상적으로 표시됩니다. XLSX 파일은 자동으로 유니코드를 지원합니다.",
        },
        {
          q: "여러 페이지 PDF를 한 번에 변환할 수 있나요?",
          a: "네! 모든 페이지에서 표를 자동으로 감지하여 추출합니다. XLSX 다운로드 시 각 페이지가 별도의 시트로 저장됩니다.",
        },
        {
          q: "PDF 파일이 서버에 업로드되나요?",
          a: "아니요. 모든 처리가 브라우저에서 이루어지며, 파일은 서버에 업로드되지 않습니다. 인터넷 연결이 끊겨도 작동합니다.",
        },
        {
          q: "복잡한 표(병합 셀, 중첩 표)도 지원하나요?",
          a: "기본적인 표 구조는 잘 추출됩니다. 셀이 병합되거나 복잡한 레이아웃의 경우 결과가 정확하지 않을 수 있습니다. 추출 후 미리보기에서 확인하세요.",
        },
      ]
    : [
        {
          q: "Can I convert scanned PDFs (image-based)?",
          a: "No. This tool only supports text-based PDFs. Scanned PDFs require OCR (Optical Character Recognition), which is not currently supported.",
        },
        {
          q: "Does it handle non-English characters correctly?",
          a: "Yes. CSV files are saved with UTF-8 BOM encoding, and XLSX files automatically support Unicode characters including Korean, Chinese, Japanese, etc.",
        },
        {
          q: "Can I convert multi-page PDFs?",
          a: "Yes! Tables are automatically detected from all pages. When downloading XLSX, each page is saved as a separate sheet.",
        },
        {
          q: "Is my PDF uploaded to a server?",
          a: "No. Everything is processed in your browser. Your file never leaves your device. It works even offline.",
        },
        {
          q: "Does it handle complex tables (merged cells, nested tables)?",
          a: "Basic table structures are extracted well. Complex layouts with merged cells may produce imperfect results. Check the preview after extraction.",
        },
      ];

  // How to use steps
  const howToSteps = isKo
    ? [
        "PDF 파일을 드래그 앤 드롭하거나 클릭하여 업로드합니다.",
        "도구가 자동으로 PDF의 모든 페이지에서 표를 감지하고 추출합니다.",
        "추출된 데이터를 미리보기 테이블에서 확인합니다.",
        "CSV 또는 XLSX 형식으로 다운로드합니다.",
      ]
    : [
        "Drag and drop a PDF file, or click to upload.",
        "The tool automatically detects and extracts tables from all pages.",
        "Review the extracted data in the preview table.",
        "Download as CSV or XLSX format.",
      ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">{description}</p>

      <ToolAbout slug="pdf-to-excel" locale={locale} />

      {/* Upload Area */}
      <div className="mt-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-600 dark:bg-neutral-800/50 dark:hover:border-neutral-500"
          }`}
        >
          <svg
            className="mb-3 h-12 w-12 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {isKo ? "PDF 파일을 드래그하거나 클릭하여 업로드" : "Drag & drop PDF or click to upload"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {isKo ? "텍스트 기반 PDF만 지원 (스캔/이미지 PDF 제외)" : "Text-based PDFs only (not scanned/image PDFs)"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {isKo ? "PDF 분석 중..." : "Analyzing PDF..."}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {tables.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Info bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <div className="text-sm text-emerald-800 dark:text-emerald-300">
              <span className="font-medium">{fileName}</span>
              <span className="mx-2">|</span>
              {isKo ? `${pageCount}페이지` : `${pageCount} page${pageCount > 1 ? "s" : ""}`}
              <span className="mx-2">|</span>
              {isKo
                ? `${tables.length}개 테이블, ${tables.reduce((s, t) => s + t.rows.length, 0)}행 추출`
                : `${tables.length} table${tables.length > 1 ? "s" : ""}, ${tables.reduce((s, t) => s + t.rows.length, 0)} rows extracted`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadCSV}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                {isKo ? "CSV 다운로드" : "Download CSV"}
              </button>
              <button
                onClick={downloadXLSX}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                {isKo ? "XLSX 다운로드" : "Download XLSX"}
              </button>
              <button
                onClick={reset}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              >
                {isKo ? "초기화" : "Reset"}
              </button>
            </div>
          </div>

          {/* Table Preview */}
          {tables.map((table, idx) => (
            <div key={idx} className="space-y-2">
              {tables.length > 1 && (
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {isKo ? `페이지 ${table.page}` : `Page ${table.page}`}
                </h3>
              )}
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                <table className="min-w-full text-sm">
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className={
                          ri === 0
                            ? "bg-neutral-100 font-medium dark:bg-neutral-800"
                            : ri % 2 === 0
                            ? "bg-white dark:bg-neutral-900"
                            : "bg-neutral-50 dark:bg-neutral-850"
                        }
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="whitespace-nowrap border-r border-neutral-200 px-3 py-1.5 last:border-r-0 dark:border-neutral-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-700 dark:text-neutral-300">
          {howToSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "자주 묻는 질문" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700"
            >
              <summary className="cursor-pointer px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200 select-none">
                {item.q}
              </summary>
              <p className="px-4 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD */}
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

      {/* WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            description,
            url: `https://www.quickfigure.net/${lang}/tools/pdf-to-excel`,
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
            href={`/${lang}/tools/pdf-to-word`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.pdfToWord}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.pdfToWordDesc}
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

      <ToolHowItWorks slug="pdf-to-excel" locale={locale} />
      <ToolDisclaimer slug="pdf-to-excel" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="pdf-to-excel"
        labels={dict.share}
      />
      <EmbedCodeButton slug="pdf-to-excel" lang={lang} labels={dict.embed} />

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfJsLib = any;

// ── Dynamic pdf.js loader ──
let pdfjsPromise: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.min.mjs";
    script.type = "module";

    // Use dynamic import for ES module
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

    // Timeout fallback
    setTimeout(() => {
      window.removeEventListener("pdfjsReady", onReady);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lib = (window as any).__pdfjsLib;
      if (lib) resolve(lib);
      else reject(new Error("pdf.js load timeout"));
    }, 10000);
  });

  return pdfjsPromise;
}
