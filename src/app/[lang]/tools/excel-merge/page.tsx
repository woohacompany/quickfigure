"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

type CellValue = string | number | boolean | null | undefined;

interface SheetInfo {
  name: string;
  headers: string[];
  rowCount: number;
}

interface ExcelFileEntry {
  file: File;
  name: string;
  size: number;
  sheets: SheetInfo[];
  selectedSheet: number;
  data: CellValue[][] | null;
}

type MergeMode = "single-sheet" | "separate-sheets";
type DuplicateAction = "highlight" | "keep-first" | "keep-last" | "separate";

interface MergeResult {
  rows: CellValue[][];
  headers: string[];
  duplicateIndices: Map<number, number>; // row index -> occurrence count
  totalRows: number;
  duplicateCount: number;
  uniqueCount: number;
  sourceFiles: string[];
  rowSources: number[]; // index of source file per row
  duplicateRows?: CellValue[][]; // for "separate" action
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ExcelMergePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const relatedPosts = getPostsByTool("excel-merge");
  const isKo = locale === "ko";

  const [files, setFiles] = useState<ExcelFileEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merge settings
  const [mergeMode, setMergeMode] = useState<MergeMode>("single-sheet");
  const [headerAsFirst, setHeaderAsFirst] = useState(true);
  const [removeDuplicateHeaders, setRemoveDuplicateHeaders] = useState(true);
  const [addSourceColumn, setAddSourceColumn] = useState(false);

  // Duplicate settings
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [duplicateColumns, setDuplicateColumns] = useState<string[]>([]);
  const [useAllColumns, setUseAllColumns] = useState(true);
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("highlight");

  // Result
  const [result, setResult] = useState<MergeResult | null>(null);
  const [previewPage, setPreviewPage] = useState(0);
  const PREVIEW_PAGE_SIZE = 100;

  const title = isKo
    ? "엑셀 파일 합치기 & 중복 검사 - 여러 엑셀 병합, 중복 데이터 감지 | QuickFigure"
    : "Excel Merge & Duplicate Checker - Combine Spreadsheets Online Free | QuickFigure";
  const description = isKo
    ? "여러 엑셀 파일을 하나로 합치고, 중복 데이터를 자동으로 찾아 색상 표시합니다. 발주서 통합, 주문 취합에 최적. 서버 업로드 없이 100% 안전."
    : "Merge multiple Excel files into one and automatically detect duplicate rows with color coding. Perfect for consolidating orders, surveys, and reports. 100% browser-based.";
  const pageTitle = isKo ? "엑셀 병합 & 중복 검사기" : "Excel Merge & Duplicate Checker";

  // All available headers across files
  const allHeaders = useMemo(() => {
    const headerSet = new Set<string>();
    files.forEach((f) => {
      if (f.sheets[f.selectedSheet]) {
        f.sheets[f.selectedSheet].headers.forEach((h) => headerSet.add(h));
      }
    });
    return Array.from(headerSet);
  }, [files]);

  const parseExcelFile = useCallback(
    async (file: File): Promise<Omit<ExcelFileEntry, "selectedSheet" | "data"> | null> => {
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });

        const sheets: SheetInfo[] = wb.SheetNames.map((name) => {
          const ws = wb.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json<CellValue[]>(ws, { header: 1 });
          const headers =
            jsonData.length > 0
              ? (jsonData[0] as CellValue[]).map((h) => String(h ?? ""))
              : [];
          return {
            name,
            headers,
            rowCount: Math.max(0, jsonData.length - 1),
          };
        });

        return { file, name: file.name, size: file.size, sheets };
      } catch {
        return null;
      }
    },
    []
  );

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const validExts = [".xlsx", ".xls", ".csv"];
      const filtered = Array.from(newFiles).filter((f) => {
        const ext = f.name.toLowerCase().substring(f.name.lastIndexOf("."));
        return validExts.includes(ext);
      });
      if (filtered.length === 0) {
        setStatus(isKo ? "지원되지 않는 파일 형식입니다. .xlsx, .xls, .csv 파일만 가능합니다." : "Unsupported file format. Only .xlsx, .xls, .csv files are allowed.");
        return;
      }

      const currentCount = files.length;
      if (currentCount + filtered.length > 20) {
        setStatus(isKo ? "최대 20개 파일까지 추가할 수 있습니다." : "You can add up to 20 files.");
        return;
      }

      for (const f of filtered) {
        if (f.size > 50 * 1024 * 1024) {
          setStatus(isKo ? `${f.name}: 파일 크기가 50MB를 초과합니다.` : `${f.name}: File size exceeds 50MB limit.`);
          return;
        }
      }

      setStatus(isKo ? "파일 분석 중..." : "Analyzing files...");
      const entries: ExcelFileEntry[] = [];
      for (const f of filtered) {
        const parsed = await parseExcelFile(f);
        if (parsed) {
          entries.push({ ...parsed, selectedSheet: 0, data: null });
        }
      }

      if (entries.length === 0) {
        setStatus(isKo ? "파일을 읽을 수 없습니다." : "Could not read the file(s).");
        return;
      }

      setFiles((prev) => [...prev, ...entries]);
      setStatus("");
      setResult(null);
    },
    [files.length, isKo, parseExcelFile]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setStatus("");
    setResult(null);
    setDuplicateColumns([]);
  }, []);

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setResult(null);
  }, []);

  const updateSelectedSheet = useCallback((fileIndex: number, sheetIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      next[fileIndex] = { ...next[fileIndex], selectedSheet: sheetIndex };
      return next;
    });
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  // ---- MERGE LOGIC ----
  const executeMerge = useCallback(async () => {
    if (files.length < 1) return;
    setProcessing(true);
    setProgress(0);
    setStatus(isKo ? "병합 처리 중..." : "Merging files...");

    try {
      const XLSX = await import("xlsx");
      const allData: { rows: CellValue[][]; headers: string[]; fileName: string }[] = [];

      for (let fi = 0; fi < files.length; fi++) {
        setProgress(Math.round(((fi + 1) / (files.length + 1)) * 80));
        const f = files[fi];
        const buffer = await f.file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheetName = wb.SheetNames[f.selectedSheet] || wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<CellValue[]>(ws, { header: 1 });

        if (jsonData.length === 0) continue;

        const headers = headerAsFirst
          ? (jsonData[0] as CellValue[]).map((h) => String(h ?? ""))
          : [];
        const dataRows = headerAsFirst ? jsonData.slice(1) : jsonData;

        allData.push({ rows: dataRows as CellValue[][], headers, fileName: f.name });
      }

      if (allData.length === 0) {
        setStatus(isKo ? "병합할 데이터가 없습니다." : "No data to merge.");
        setProcessing(false);
        return;
      }

      // Build unified headers
      const unifiedHeaders: string[] = [];
      const headerIndexMap: Map<string, number> = new Map();
      allData.forEach((d) => {
        d.headers.forEach((h) => {
          if (!headerIndexMap.has(h)) {
            headerIndexMap.set(h, unifiedHeaders.length);
            unifiedHeaders.push(h);
          }
        });
      });

      if (addSourceColumn) {
        const srcLabel = isKo ? "출처 파일" : "Source File";
        if (!headerIndexMap.has(srcLabel)) {
          headerIndexMap.set(srcLabel, unifiedHeaders.length);
          unifiedHeaders.push(srcLabel);
        }
      }

      // Build merged rows
      const mergedRows: CellValue[][] = [];
      const rowSources: number[] = [];
      const srcColIdx = addSourceColumn ? headerIndexMap.get(isKo ? "출처 파일" : "Source File")! : -1;

      allData.forEach((d, fileIdx) => {
        d.rows.forEach((row) => {
          const newRow: CellValue[] = new Array(unifiedHeaders.length).fill("");
          row.forEach((cell, ci) => {
            if (ci < d.headers.length) {
              const targetIdx = headerIndexMap.get(d.headers[ci]);
              if (targetIdx !== undefined) newRow[targetIdx] = cell;
            } else if (!headerAsFirst) {
              if (ci < newRow.length) newRow[ci] = cell;
            }
          });
          if (addSourceColumn && srcColIdx >= 0) {
            newRow[srcColIdx] = d.fileName;
          }
          mergedRows.push(newRow);
          rowSources.push(fileIdx);
        });
      });

      // Check total row count
      if (mergedRows.length > 1000000) {
        setStatus(isKo ? "총 행 수가 100만 행을 초과합니다." : "Total row count exceeds 1 million rows.");
        setProcessing(false);
        return;
      }

      setProgress(85);
      setStatus(isKo ? "중복 검사 중..." : "Checking duplicates...");

      // Duplicate detection
      const duplicateIndices = new Map<number, number>();
      let duplicateCount = 0;
      let duplicateRows: CellValue[][] | undefined;

      if (checkDuplicates && mergedRows.length > 0) {
        const colsToCheck = useAllColumns
          ? unifiedHeaders.map((_, i) => i)
          : duplicateColumns.map((h) => headerIndexMap.get(h)).filter((i) => i !== undefined) as number[];

        if (colsToCheck.length > 0) {
          const keyMap = new Map<string, number[]>();
          mergedRows.forEach((row, ri) => {
            const key = colsToCheck.map((ci) => String(row[ci] ?? "")).join("|||");
            if (!keyMap.has(key)) keyMap.set(key, []);
            keyMap.get(key)!.push(ri);
          });

          keyMap.forEach((indices) => {
            if (indices.length > 1) {
              indices.forEach((ri, oi) => {
                duplicateIndices.set(ri, oi + 1);
                if (oi > 0) duplicateCount++;
              });
            }
          });
        }
      }

      // Handle duplicate actions
      let finalRows = mergedRows;
      let finalRowSources = rowSources;

      if (checkDuplicates && duplicateCount > 0) {
        if (duplicateAction === "keep-first") {
          const seen = new Set<string>();
          const colsToCheck = useAllColumns
            ? unifiedHeaders.map((_, i) => i)
            : duplicateColumns.map((h) => headerIndexMap.get(h)).filter((i) => i !== undefined) as number[];
          const kept: number[] = [];
          mergedRows.forEach((row, ri) => {
            const key = colsToCheck.map((ci) => String(row[ci] ?? "")).join("|||");
            if (!seen.has(key)) {
              seen.add(key);
              kept.push(ri);
            }
          });
          finalRows = kept.map((i) => mergedRows[i]);
          finalRowSources = kept.map((i) => rowSources[i]);
          duplicateIndices.clear();
        } else if (duplicateAction === "keep-last") {
          const seen = new Map<string, number>();
          const colsToCheck = useAllColumns
            ? unifiedHeaders.map((_, i) => i)
            : duplicateColumns.map((h) => headerIndexMap.get(h)).filter((i) => i !== undefined) as number[];
          mergedRows.forEach((row, ri) => {
            const key = colsToCheck.map((ci) => String(row[ci] ?? "")).join("|||");
            seen.set(key, ri);
          });
          const kept = Array.from(seen.values()).sort((a, b) => a - b);
          finalRows = kept.map((i) => mergedRows[i]);
          finalRowSources = kept.map((i) => rowSources[i]);
          duplicateIndices.clear();
        } else if (duplicateAction === "separate") {
          const dupIndicesSet = new Set<number>();
          duplicateIndices.forEach((occ, ri) => {
            if (occ > 1) dupIndicesSet.add(ri);
          });
          duplicateRows = Array.from(dupIndicesSet)
            .sort((a, b) => a - b)
            .map((i) => mergedRows[i]);
          const keptIndices: number[] = [];
          mergedRows.forEach((_, ri) => {
            if (!dupIndicesSet.has(ri)) keptIndices.push(ri);
          });
          finalRows = keptIndices.map((i) => mergedRows[i]);
          finalRowSources = keptIndices.map((i) => rowSources[i]);
          duplicateIndices.clear();
        }
      }

      setProgress(100);
      setResult({
        rows: finalRows,
        headers: unifiedHeaders,
        duplicateIndices,
        totalRows: finalRows.length,
        duplicateCount,
        uniqueCount: finalRows.length - (duplicateAction === "highlight" ? duplicateCount : 0),
        sourceFiles: allData.map((d) => d.fileName),
        rowSources: finalRowSources,
        duplicateRows,
      });
      setPreviewPage(0);
      setStatus(isKo ? "병합 완료!" : "Merge complete!");
    } catch (err) {
      console.error(err);
      setStatus(isKo ? "병합 중 오류가 발생했습니다." : "An error occurred during merge.");
    } finally {
      setProcessing(false);
    }
  }, [files, isKo, mergeMode, headerAsFirst, removeDuplicateHeaders, addSourceColumn, checkDuplicates, duplicateColumns, useAllColumns, duplicateAction]);

  // ---- DOWNLOAD ----
  const downloadResult = useCallback(
    async (format: "xlsx" | "csv") => {
      if (!result) return;
      const XLSX = await import("xlsx");
      const wb = XLSX.utils.book_new();

      // Main sheet
      const mainData = [result.headers, ...result.rows];
      const ws = XLSX.utils.aoa_to_sheet(mainData);

      // Apply duplicate highlight colors for xlsx
      if (format === "xlsx" && duplicateAction === "highlight" && result.duplicateIndices.size > 0) {
        result.duplicateIndices.forEach((occ, ri) => {
          const excelRow = ri + 2; // 1-indexed, +1 for header
          result.headers.forEach((_, ci) => {
            const cellRef = XLSX.utils.encode_cell({ r: excelRow - 1, c: ci });
            if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };
            if (occ === 1) {
              ws[cellRef].s = { fill: { fgColor: { rgb: "FFF9C4" } } }; // light yellow
            } else if (occ === 2) {
              ws[cellRef].s = { fill: { fgColor: { rgb: "FFB74D" } } }; // orange
            } else {
              ws[cellRef].s = { fill: { fgColor: { rgb: "EF5350" } } }; // red
            }
          });
        });
      }

      // Auto-width columns
      const colWidths = result.headers.map((h, ci) => {
        let maxLen = h.length;
        result.rows.forEach((row) => {
          const val = String(row[ci] ?? "");
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(maxLen + 2, 50) };
      });
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, isKo ? "병합결과" : "Merged");

      // Duplicate rows sheet if separate
      if (result.duplicateRows && result.duplicateRows.length > 0) {
        const dupData = [result.headers, ...result.duplicateRows];
        const dupWs = XLSX.utils.aoa_to_sheet(dupData);
        dupWs["!cols"] = colWidths;
        XLSX.utils.book_append_sheet(wb, dupWs, isKo ? "중복데이터" : "Duplicates");
      }

      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const fileName = `${isKo ? "병합결과" : "merged"}_${dateStr}.${format}`;

      if (format === "csv") {
        const csvContent = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        XLSX.writeFile(wb, fileName);
      }
    },
    [result, isKo, duplicateAction]
  );

  // ---- PREVIEW ----
  const previewRows = useMemo(() => {
    if (!result) return [];
    const start = previewPage * PREVIEW_PAGE_SIZE;
    return result.rows.slice(start, start + PREVIEW_PAGE_SIZE);
  }, [result, previewPage]);

  const totalPreviewPages = result ? Math.ceil(result.rows.length / PREVIEW_PAGE_SIZE) : 0;

  const getDuplicateColor = useCallback(
    (globalRowIndex: number): string => {
      if (!result || duplicateAction !== "highlight") return "";
      const occ = result.duplicateIndices.get(globalRowIndex);
      if (!occ) return "";
      if (occ === 1) return "bg-yellow-100 dark:bg-yellow-900/30";
      if (occ === 2) return "bg-orange-100 dark:bg-orange-900/30";
      return "bg-red-100 dark:bg-red-900/30";
    },
    [result, duplicateAction]
  );

  const faqItems = isKo
    ? [
        { q: "서버에 파일이 업로드되나요?", a: "아니요, 모든 처리는 브라우저에서 이루어집니다. 파일이 서버로 전송되지 않으므로 100% 안전합니다." },
        { q: "몇 개 파일까지 합칠 수 있나요?", a: "최대 20개 파일까지 합칠 수 있습니다. 각 파일은 50MB 이내, 총 100만 행 이내여야 합니다." },
        { q: "CSV도 합칠 수 있나요?", a: "네, .xlsx, .xls, .csv 파일을 모두 지원합니다. 서로 다른 형식의 파일도 함께 합칠 수 있습니다." },
        { q: "중복 기준을 여러 열로 할 수 있나요?", a: "네, 복합 기준이 가능합니다. 예를 들어 '주문번호'와 '상품명'을 함께 기준으로 설정하여 두 열의 조합이 같은 행만 중복으로 판단할 수 있습니다." },
        { q: "합친 파일에서 어떤 파일에서 온 데이터인지 알 수 있나요?", a: "'출처 파일 열 추가' 옵션을 켜면, 각 행이 어떤 원본 파일에서 온 것인지 별도 열로 표시됩니다." },
      ]
    : [
        { q: "Are my files uploaded to a server?", a: "No, all processing happens entirely in your browser. Your files are never sent to any server, making it 100% private and secure." },
        { q: "How many files can I merge?", a: "You can merge up to 20 files at once. Each file should be under 50MB, and the total row count should not exceed 1 million." },
        { q: "Can I merge CSV files too?", a: "Yes, .xlsx, .xls, and .csv files are all supported. You can even mix different formats in a single merge." },
        { q: "Can I use multiple columns as duplicate criteria?", a: "Yes, you can select multiple columns as a composite key. For example, use 'Order ID' + 'Product Name' together so only rows matching both values are considered duplicates." },
        { q: "Can I tell which file each row came from?", a: "Yes, enable the 'Add source file column' option, and a column will be added showing the original file name for each row." },
      ];

  const howToSteps = isKo
    ? [
        "엑셀 파일(.xlsx, .xls, .csv)을 드래그하거나 클릭하여 업로드하세요.",
        "병합 모드, 헤더 처리, 중복 검사 설정을 원하는 대로 조정하세요.",
        "'병합 실행' 버튼을 클릭하면 파일이 합쳐지고 중복이 자동으로 감지됩니다.",
        "미리보기에서 결과를 확인한 뒤, .xlsx 또는 .csv로 다운로드하세요.",
      ]
    : [
        "Upload your Excel files (.xlsx, .xls, .csv) by dragging or clicking.",
        "Adjust merge mode, header handling, and duplicate detection settings.",
        "Click 'Merge' to combine files and automatically detect duplicates.",
        "Review the preview, then download the result as .xlsx or .csv.",
      ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      {/* ===== STEP 1: File Upload ===== */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
          }`}
        >
          <svg className="w-10 h-10 text-neutral-400 dark:text-neutral-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0L8 8m4-4l4 4M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4" />
          </svg>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {isKo ? "엑셀 파일을 여기에 드래그하거나 클릭하여 선택" : "Drag & drop Excel files here, or click to browse"}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            {isKo ? ".xlsx, .xls, .csv (최대 20개, 각 50MB 이내)" : ".xlsx, .xls, .csv (max 20 files, 50MB each)"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
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
                {isKo ? `${files.length}개 파일` : `${files.length} file${files.length !== 1 ? "s" : ""}`}
              </p>
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                {isKo ? "전체 삭제" : "Clear all"}
              </button>
            </div>

            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
              {files.map((entry, index) => (
                <div key={`${entry.name}-${index}`} className="flex items-center gap-3 p-3">
                  <span className="text-xs font-mono text-neutral-400 w-5 text-center shrink-0">{index + 1}</span>
                  <div className="shrink-0 w-8 h-8 rounded bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {formatFileSize(entry.size)} · {entry.sheets.length} {isKo ? "시트" : entry.sheets.length === 1 ? "sheet" : "sheets"}
                      {entry.sheets[entry.selectedSheet] && ` · ${entry.sheets[entry.selectedSheet].rowCount} ${isKo ? "행" : "rows"}`}
                    </p>
                  </div>

                  {/* Sheet selector */}
                  {entry.sheets.length > 1 && (
                    <select
                      value={entry.selectedSheet}
                      onChange={(e) => updateSelectedSheet(index, parseInt(e.target.value))}
                      className="text-xs rounded border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1"
                    >
                      {entry.sheets.map((s, si) => (
                        <option key={si} value={si}>{s.name}</option>
                      ))}
                    </select>
                  )}

                  {/* Move buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button onClick={() => moveFile(index, index - 1)} disabled={index === 0} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move up">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => moveFile(index, index + 1)} disabled={index === files.length - 1} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move down">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  <button onClick={() => removeFile(index)} className="shrink-0 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer" aria-label="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy notice */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{isKo ? "서버 업로드 없이 브라우저에서 안전하게 처리됩니다." : "All processing happens in your browser. Files are never uploaded."}</span>
        </div>
      </div>

      {/* ===== STEP 2 & 3: Settings ===== */}
      {files.length > 0 && (
        <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
          {/* Merge mode */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{isKo ? "병합 모드" : "Merge Mode"}</h3>
            <div className="flex gap-4">
              {(["single-sheet", "separate-sheets"] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="mergeMode" checked={mergeMode === mode} onChange={() => setMergeMode(mode)} className="accent-blue-600" />
                  {mode === "single-sheet"
                    ? isKo ? "하나의 시트로 합치기" : "Merge into single sheet"
                    : isKo ? "시트별로 합치기" : "Keep as separate sheets"}
                </label>
              ))}
            </div>
          </div>

          {/* Header options */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{isKo ? "헤더 처리" : "Header Handling"}</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={headerAsFirst} onChange={(e) => setHeaderAsFirst(e.target.checked)} className="accent-blue-600" />
                {isKo ? "첫 번째 행을 헤더로 인식" : "First row is header"}
              </label>
              {headerAsFirst && (
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={removeDuplicateHeaders} onChange={(e) => setRemoveDuplicateHeaders(e.target.checked)} className="accent-blue-600" />
                  {isKo ? "중복 헤더 자동 제거" : "Auto-remove duplicate headers"}
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={addSourceColumn} onChange={(e) => setAddSourceColumn(e.target.checked)} className="accent-blue-600" />
                {isKo ? "출처 파일 열 추가" : "Add source file column"}
              </label>
            </div>
          </div>

          {/* Duplicate detection */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold">{isKo ? "중복 검사" : "Duplicate Detection"}</h3>
              <button
                onClick={() => setCheckDuplicates(!checkDuplicates)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  checkDuplicates ? "bg-blue-600" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checkDuplicates ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {checkDuplicates && (
              <div className="space-y-4 pl-1">
                {/* Column selection */}
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {isKo ? "중복 기준 열 선택:" : "Select columns for duplicate check:"}
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer text-sm mb-2">
                    <input type="checkbox" checked={useAllColumns} onChange={(e) => { setUseAllColumns(e.target.checked); if (e.target.checked) setDuplicateColumns([]); }} className="accent-blue-600" />
                    {isKo ? "모든 열 기준" : "All columns"}
                  </label>
                  {!useAllColumns && allHeaders.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allHeaders.map((h) => (
                        <label key={h} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs cursor-pointer border transition-colors ${
                          duplicateColumns.includes(h)
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                            : "border-neutral-200 dark:border-neutral-600 hover:border-neutral-400"
                        }`}>
                          <input
                            type="checkbox"
                            checked={duplicateColumns.includes(h)}
                            onChange={(e) => {
                              if (e.target.checked) setDuplicateColumns((prev) => [...prev, h]);
                              else setDuplicateColumns((prev) => prev.filter((c) => c !== h));
                            }}
                            className="accent-blue-600 w-3 h-3"
                          />
                          {h}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duplicate action */}
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {isKo ? "중복 발견 시 처리:" : "When duplicates found:"}
                  </p>
                  <div className="space-y-1.5">
                    {([
                      { value: "highlight" as const, label: isKo ? "색상으로 표시만 (노랑→주황→빨강)" : "Highlight only (yellow → orange → red)" },
                      { value: "keep-first" as const, label: isKo ? "중복 제거 (첫 번째만 유지)" : "Remove duplicates (keep first)" },
                      { value: "keep-last" as const, label: isKo ? "중복 제거 (마지막만 유지)" : "Remove duplicates (keep last)" },
                      { value: "separate" as const, label: isKo ? "중복만 별도 시트로 분리" : "Separate duplicates to another sheet" },
                    ]).map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="dupAction" checked={duplicateAction === opt.value} onChange={() => setDuplicateAction(opt.value)} className="accent-blue-600" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Merge button */}
          <button
            onClick={executeMerge}
            disabled={processing || files.length < 1}
            className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {processing
              ? isKo ? "병합 중..." : "Merging..."
              : isKo ? `병합 실행 (${files.length}개 파일)` : `Merge (${files.length} files)`}
          </button>

          {/* Progress bar */}
          {processing && (
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          {status && (
            <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">{status}</p>
          )}
        </div>
      )}

      {/* ===== STEP 4: Preview ===== */}
      {result && (
        <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h3 className="text-lg font-semibold">{isKo ? "미리보기" : "Preview"}</h3>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              {isKo ? `총 ${result.totalRows.toLocaleString()}행` : `${result.totalRows.toLocaleString()} total rows`}
            </span>
            {checkDuplicates && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
                  {isKo ? `중복 ${result.duplicateCount.toLocaleString()}건` : `${result.duplicateCount.toLocaleString()} duplicates`}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                  {isKo ? `고유 ${result.uniqueCount.toLocaleString()}건` : `${result.uniqueCount.toLocaleString()} unique`}
                </span>
              </>
            )}
            {result.duplicateRows && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium">
                {isKo ? `분리된 중복 ${result.duplicateRows.length.toLocaleString()}건` : `${result.duplicateRows.length.toLocaleString()} separated duplicates`}
              </span>
            )}
          </div>

          {/* File source stats */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-0.5">
            {result.sourceFiles.map((name, fi) => {
              const count = result.rowSources.filter((s) => s === fi).length;
              return (
                <p key={fi}>
                  {name}: {count.toLocaleString()} {isKo ? "행" : "rows"}
                </p>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800">
                  <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">#</th>
                  {result.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700 whitespace-nowrap">{h || `Col ${i + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => {
                  const globalIndex = previewPage * PREVIEW_PAGE_SIZE + ri;
                  const dupColor = getDuplicateColor(globalIndex);
                  return (
                    <tr key={ri} className={`${dupColor} ${ri % 2 === 0 && !dupColor ? "bg-white dark:bg-neutral-900" : !dupColor ? "bg-neutral-50/50 dark:bg-neutral-800/50" : ""}`}>
                      <td className="px-3 py-1.5 text-xs text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">{globalIndex + 1}</td>
                      {result.headers.map((_, ci) => (
                        <td key={ci} className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 whitespace-nowrap max-w-[200px] truncate">
                          {String(row[ci] ?? "")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPreviewPages > 1 && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <button onClick={() => setPreviewPage(Math.max(0, previewPage - 1))} disabled={previewPage === 0} className="px-3 py-1 rounded border border-neutral-200 dark:border-neutral-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                {isKo ? "이전" : "Prev"}
              </button>
              <span className="text-neutral-500">
                {previewPage + 1} / {totalPreviewPages}
              </span>
              <button onClick={() => setPreviewPage(Math.min(totalPreviewPages - 1, previewPage + 1))} disabled={previewPage >= totalPreviewPages - 1} className="px-3 py-1 rounded border border-neutral-200 dark:border-neutral-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
                {isKo ? "다음" : "Next"}
              </button>
            </div>
          )}

          {/* Download buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => downloadResult("xlsx")} className="flex-1 px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer text-base">
              {isKo ? ".xlsx 다운로드" : "Download .xlsx"}
            </button>
            <button onClick={() => downloadResult("csv")} className="px-5 py-3 rounded-md bg-neutral-200 dark:bg-neutral-700 font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer text-base">
              {isKo ? ".csv 다운로드" : "Download .csv"}
            </button>
          </div>

          {/* Duplicate legend */}
          {checkDuplicates && duplicateAction === "highlight" && result.duplicateCount > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-800" /> {isKo ? "첫 번째 등장 (원본)" : "First occurrence (original)"}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800" /> {isKo ? "두 번째 등장 (중복)" : "Second occurrence (duplicate)"}</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-200 dark:bg-red-800" /> {isKo ? "3회 이상 (다중 중복)" : "3+ occurrences (multiple)"}</span>
            </div>
          )}
        </div>
      )}

      {/* ===== About ===== */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "엑셀 병합 & 중복 검사기란?" : "What is Excel Merge & Duplicate Checker?"}
        </h2>
        <div className="text-neutral-600 dark:text-neutral-400 space-y-3">
          {isKo ? (
            <>
              <p>엑셀 병합 & 중복 검사기는 여러 엑셀 파일(.xlsx, .xls, .csv)을 하나의 파일로 합치고, 중복 데이터를 자동으로 감지하는 무료 온라인 도구입니다.</p>
              <p><strong>활용 사례:</strong> 발주서 통합, 주문 데이터 취합, 거래처별 데이터 병합, 설문 결과 합치기, 월별 매출 데이터 통합 등</p>
              <p>모든 처리는 브라우저에서 이루어지므로, 개인정보나 민감한 데이터가 포함된 엑셀 파일도 안심하고 처리할 수 있습니다.</p>
            </>
          ) : (
            <>
              <p>Excel Merge & Duplicate Checker is a free online tool that combines multiple Excel files (.xlsx, .xls, .csv) into one and automatically detects duplicate data rows.</p>
              <p><strong>Use cases:</strong> Consolidating purchase orders, combining order data, merging vendor reports, aggregating survey results, unifying monthly sales data, and more.</p>
              <p>All processing happens in your browser, so you can safely handle files containing personal or sensitive data without worrying about privacy.</p>
            </>
          )}
        </div>
      </section>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
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
          <Link href={`/${lang}/tools/pdf-merger`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.pdfMerger}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.pdfMergerDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-converter`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageConverter}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageConverterDesc}</p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={pageTitle}
        description={description}
        lang={lang}
        slug="excel-merge"
        labels={dict.share}
      />
      <EmbedCodeButton
        slug="excel-merge"
        lang={lang}
        labels={dict.embed}
      />

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
