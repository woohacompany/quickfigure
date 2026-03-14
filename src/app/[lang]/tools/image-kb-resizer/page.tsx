"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function formatKB(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " KB";
  return (kb / 1024).toFixed(2) + " MB";
}

interface FileItem {
  id: string;
  file: File;
  originalSize: number;
  originalDataUrl: string;
  originalImg: HTMLImageElement;
  resultBlob: Blob | null;
  resultDataUrl: string | null;
  resultSize: number;
  processing: boolean;
  progress: number;
  done: boolean;
  error: string | null;
}

async function compressToTargetKB(
  img: HTMLImageElement,
  targetBytes: number,
  format: string,
  maxWidth: number | null,
  onProgress: (p: number) => void
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  let w = img.width;
  let h = img.height;

  if (maxWidth && w > maxWidth) {
    h = Math.round((h * maxWidth) / w);
    w = maxWidth;
  }

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  const mimeType = format === "webp" ? "image/webp" : format === "png" ? "image/png" : "image/jpeg";

  // PNG has no quality parameter - just return directly
  if (mimeType === "image/png") {
    onProgress(100);
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    });
  }

  // Binary search for the right quality
  let lo = 0.01;
  let hi = 1.0;
  let bestBlob: Blob | null = null;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations && hi - lo > 0.01) {
    const mid = (lo + hi) / 2;
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, mid);
    });

    onProgress(Math.min(70, Math.round((iterations / maxIterations) * 70)));
    iterations++;

    if (blob.size <= targetBytes) {
      bestBlob = blob;
      lo = mid + 0.01;
    } else {
      hi = mid - 0.01;
    }
  }

  // If quality alone can't get us below target, progressively reduce resolution
  if (!bestBlob || bestBlob.size > targetBytes) {
    const minBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), mimeType, 0.01);
    });

    if (minBlob.size > targetBytes) {
      // Need to reduce resolution
      let scale = 0.9;
      while (scale > 0.1) {
        const newW = Math.round(w * scale);
        const newH = Math.round(h * scale);
        canvas.width = newW;
        canvas.height = newH;
        ctx.drawImage(img, 0, 0, newW, newH);

        onProgress(Math.min(90, 70 + Math.round((1 - scale) * 50)));

        // Binary search again at this resolution
        lo = 0.01;
        hi = 1.0;
        let innerIterations = 0;
        while (innerIterations < 10 && hi - lo > 0.02) {
          const mid = (lo + hi) / 2;
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), mimeType, mid);
          });
          innerIterations++;

          if (blob.size <= targetBytes) {
            bestBlob = blob;
            lo = mid + 0.01;
          } else {
            hi = mid - 0.01;
          }
        }

        if (bestBlob && bestBlob.size <= targetBytes) break;

        // Try minimum quality at this resolution
        const minRes = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), mimeType, 0.01);
        });
        if (minRes.size <= targetBytes) {
          bestBlob = minRes;
          break;
        }

        scale -= 0.1;
      }
    } else {
      bestBlob = minBlob;
    }
  }

  onProgress(100);
  return bestBlob || (await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), mimeType, 0.01);
  }));
}

export default function ImageKbResizerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-kb-resizer");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [targetKB, setTargetKB] = useState(200);
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [maxWidthCustom, setMaxWidthCustom] = useState("");
  const [maxWidthOption, setMaxWidthOption] = useState("none");
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "webp" | "png">("jpeg");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const title = isKo
    ? "사진 용량 줄이기 - KB 단위 지정, 증명사진 200KB 맞추기 | QuickFigure"
    : "Image KB Resizer - Resize Photos to Exact KB Size | QuickFigure";
  const description = isKo
    ? "사진 용량을 원하는 KB로 정확히 줄이세요. 증명사진 200KB, 여권사진 500KB 등 목표 크기 지정 가능. 일괄 처리, 무료."
    : "Resize images to your target KB size precisely. Set exact file size for ID photos, passports, and uploads. Batch processing, free.";

  const loadImage = (file: File): Promise<{ dataUrl: string; img: HTMLImageElement }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => resolve({ dataUrl, img });
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).filter((f) => f.type.startsWith("image/")).slice(0, 20);
    const items: FileItem[] = [];

    for (const file of fileArray) {
      const { dataUrl, img } = await loadImage(file);
      items.push({
        id: crypto.randomUUID(),
        file,
        originalSize: file.size,
        originalDataUrl: dataUrl,
        originalImg: img,
        resultBlob: null,
        resultDataUrl: null,
        resultSize: 0,
        processing: false,
        progress: 0,
        done: false,
        error: null,
      });
    }

    setFiles((prev) => [...prev, ...items].slice(0, 20));
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getMaxWidth = (): number | null => {
    if (maxWidthOption === "none") return null;
    if (maxWidthOption === "custom") {
      const v = parseInt(maxWidthCustom);
      return v > 0 ? v : null;
    }
    return parseInt(maxWidthOption);
  };

  const processAll = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const targetBytes = targetKB * 1024;
    const mw = getMaxWidth();

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, processing: true, progress: 0, done: false, error: null } : f))
      );

      try {
        const blob = await compressToTargetKB(
          item.originalImg,
          targetBytes,
          outputFormat,
          mw,
          (p) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === item.id ? { ...f, progress: p } : f))
            );
          }
        );

        const url = URL.createObjectURL(blob);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, resultBlob: blob, resultDataUrl: url, resultSize: blob.size, processing: false, progress: 100, done: true }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, processing: false, done: true, error: isKo ? "처리 중 오류가 발생했습니다." : "An error occurred during processing." }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
  }, [files, targetKB, outputFormat, maxWidthOption, maxWidthCustom, maxWidth, isKo]);

  const downloadFile = useCallback((item: FileItem) => {
    if (!item.resultDataUrl) return;
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = item.resultDataUrl;
    a.download = `${baseName}_${targetKB}kb.${ext}`;
    a.click();
  }, [outputFormat, targetKB]);

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.done && f.resultBlob);
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1) {
      downloadFile(doneFiles[0]);
      return;
    }

    // ZIP download using JSZip-like approach with manual ZIP construction
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const ext = outputFormat === "jpeg" ? "jpg" : outputFormat;

    for (const item of doneFiles) {
      if (item.resultBlob) {
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}_${targetKB}kb.${ext}`, item.resultBlob);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `images_${targetKB}kb.zip`;
    a.click();
  }, [files, outputFormat, targetKB, downloadFile]);

  const presetKBs = [50, 100, 200, 500, 1024];
  const doneCount = files.filter((f) => f.done && !f.error).length;

  const faqItems = isKo
    ? [
        { q: "목표 용량(KB)을 정확히 맞출 수 있나요?", a: "이진 탐색 알고리즘으로 JPEG/WebP 품질을 자동 조절하여 목표 KB 이하로 최대한 가깝게 맞춥니다. 품질만으로 안 되면 해상도도 자동으로 줄여 목표를 달성합니다." },
        { q: "증명사진 200KB로 줄이려면 어떻게 하나요?", a: "사진을 업로드한 후 목표 용량에 200을 입력하거나 200KB 프리셋 버튼을 클릭하세요. 출력 형식은 JPG를 선택하면 가장 효과적입니다." },
        { q: "여러 장을 한꺼번에 처리할 수 있나요?", a: "네, 최대 20개 파일까지 동시에 업로드하고 일괄 처리할 수 있습니다. 처리 완료 후 개별 또는 ZIP으로 한꺼번에 다운로드 가능합니다." },
        { q: "서버에 사진이 업로드되나요?", a: "아닙니다. 모든 처리는 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 사진이 외부 서버로 전송되지 않아 완전히 안전합니다." },
        { q: "PNG 형식으로도 용량을 줄일 수 있나요?", a: "PNG는 무손실 포맷이라 품질 기반 압축이 적용되지 않습니다. 용량을 줄이려면 JPG 또는 WebP 형식을 선택하는 것을 추천합니다." },
      ]
    : [
        { q: "Can it hit the exact target KB?", a: "Our binary search algorithm adjusts JPEG/WebP quality to get as close to your target KB as possible. If quality alone isn't enough, resolution is also reduced automatically." },
        { q: "How do I resize an ID photo to 200KB?", a: "Upload your photo, enter 200 in the target size field or click the 200KB preset button. Choose JPG as the output format for the best results." },
        { q: "Can I process multiple files at once?", a: "Yes, you can upload and process up to 20 files simultaneously. After processing, download individually or as a ZIP archive." },
        { q: "Are my photos uploaded to a server?", a: "No. All processing uses the Canvas API and happens 100% in your browser. Your photos never leave your device." },
        { q: "Can I reduce file size with PNG format?", a: "PNG is lossless and doesn't support quality-based compression. We recommend choosing JPG or WebP format for effective size reduction." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "사진 용량 줄이기 (KB 지정)" : "Image KB Resizer"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>
      </header>

      {/* Practical example banner */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
          {isKo
            ? "💡 증명사진 200KB, 여권사진 500KB, 공무원 시험 사진 등 정확한 용량 맞추기가 필요할 때 사용하세요."
            : "💡 Use this when you need exact file sizes — ID photos (200KB), passport photos (500KB), application uploads, and more."}
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
              : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500"
          }`}
        >
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            {isKo ? "이미지를 드래그하거나 클릭하여 업로드" : "Drag & drop images or click to upload"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            JPG, PNG, WebP &middot; {isKo ? "최대 20개" : "Up to 20 files"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isKo ? `업로드된 파일 (${files.length}개)` : `Uploaded files (${files.length})`}
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-md bg-neutral-50 dark:bg-neutral-800/50 text-sm">
                  <img src={item.originalDataUrl} alt="" className="w-10 h-10 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.file.name}</p>
                    <p className="text-xs text-neutral-500">{formatKB(item.originalSize)}</p>
                  </div>
                  {item.processing && (
                    <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                  {item.done && !item.error && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap">
                      {formatKB(item.resultSize)}
                    </span>
                  )}
                  {item.error && (
                    <span className="text-xs text-red-500">{isKo ? "오류" : "Error"}</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    title={isKo ? "삭제" : "Remove"}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        {files.length > 0 && (
          <>
            {/* Target KB */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "목표 용량 (KB)" : "Target Size (KB)"}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetKBs.map((kb) => (
                  <button
                    key={kb}
                    onClick={() => setTargetKB(kb)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                      targetKB === kb
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {kb >= 1024 ? `${kb / 1024}MB` : `${kb}KB`}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5000}
                  value={targetKB}
                  onChange={(e) => setTargetKB(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={targetKB}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      if (v > 0 && v <= 10000) setTargetKB(v);
                    }}
                    className="w-20 p-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-500">KB</span>
                </div>
              </div>
            </div>

            {/* Max resolution */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "최대 해상도 제한" : "Max Resolution Limit"}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "none", label: isKo ? "제한 없음" : "No limit" },
                  { value: "800", label: "800px" },
                  { value: "1024", label: "1024px" },
                  { value: "1920", label: "1920px" },
                  { value: "custom", label: isKo ? "직접 입력" : "Custom" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMaxWidthOption(opt.value);
                      if (opt.value !== "custom" && opt.value !== "none") {
                        setMaxWidth(parseInt(opt.value));
                      } else if (opt.value === "none") {
                        setMaxWidth(null);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                      maxWidthOption === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {maxWidthOption === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={100}
                    max={10000}
                    value={maxWidthCustom}
                    onChange={(e) => {
                      setMaxWidthCustom(e.target.value);
                      const v = parseInt(e.target.value);
                      if (v > 0) setMaxWidth(v);
                    }}
                    placeholder={isKo ? "최대 가로 px" : "Max width px"}
                    className="w-32 p-2 text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-500">px</span>
                </div>
              )}
            </div>

            {/* Output format */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "출력 형식" : "Output Format"}
              </label>
              <div className="flex gap-2">
                {(["jpeg", "webp", "png"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                      outputFormat === fmt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              {outputFormat === "png" && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  {isKo
                    ? "PNG는 무손실 포맷이라 품질 기반 용량 조절이 제한됩니다. JPG 또는 WebP를 추천합니다."
                    : "PNG is lossless — quality-based size control is limited. JPG or WebP recommended."}
                </p>
              )}
            </div>

            {/* Process button */}
            <button
              onClick={processAll}
              disabled={isProcessing || files.length === 0}
              className={`w-full px-5 py-3 rounded-md font-medium text-white transition-colors cursor-pointer ${
                isProcessing
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isProcessing
                ? isKo ? "처리 중..." : "Processing..."
                : isKo ? `${files.length}개 파일 → ${targetKB}KB로 변환` : `Convert ${files.length} file(s) to ${targetKB}KB`}
            </button>
          </>
        )}

        {/* Results */}
        {doneCount > 0 && (
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold">{isKo ? "변환 결과" : "Results"}</h3>

            {files.filter((f) => f.done).map((item) => (
              <div key={item.id} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                <div className="flex items-start gap-4">
                  {/* Before / After preview */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div>
                      <p className="text-xs font-medium mb-1 text-neutral-500">{isKo ? "원본" : "Original"}</p>
                      <img src={item.originalDataUrl} alt="Original" className="w-full rounded border border-neutral-200 dark:border-neutral-700" />
                    </div>
                    {item.resultDataUrl && (
                      <div>
                        <p className="text-xs font-medium mb-1 text-neutral-500">{isKo ? "결과" : "Result"}</p>
                        <img src={item.resultDataUrl} alt="Result" className="w-full rounded border border-neutral-200 dark:border-neutral-700" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-neutral-500">{formatKB(item.originalSize)}</span>
                    <span className="text-neutral-400">&rarr;</span>
                    {item.error ? (
                      <span className="text-red-500">{item.error}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-green-600 dark:text-green-400">{formatKB(item.resultSize)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.resultSize <= targetKB * 1024
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                        }`}>
                          {item.resultSize <= targetKB * 1024
                            ? isKo ? "달성" : "Target met"
                            : isKo ? "초과" : "Over target"}
                        </span>
                      </>
                    )}
                  </div>
                  {item.resultDataUrl && (
                    <button
                      onClick={() => downloadFile(item)}
                      className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      {isKo ? "다운로드" : "Download"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Download all */}
            {doneCount >= 2 && (
              <button
                onClick={downloadAll}
                className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                {isKo ? `전체 ZIP 다운로드 (${doneCount}개)` : `Download All as ZIP (${doneCount} files)`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "사진을 드래그하거나 클릭하여 업로드하세요 (최대 20개).",
                "목표 용량(KB)을 프리셋 버튼이나 직접 입력으로 설정하세요.",
                "필요시 최대 해상도 제한과 출력 형식을 선택하세요.",
                "변환 버튼을 클릭하면 자동으로 품질/해상도를 조절합니다.",
                "결과를 확인하고 개별 또는 ZIP으로 다운로드하세요.",
              ]
            : [
                "Upload images by dragging or clicking the upload area (up to 20 files).",
                "Set your target size (KB) using preset buttons or manual input.",
                "Optionally set max resolution limit and output format.",
                "Click Convert — quality and resolution are adjusted automatically.",
                "Review results and download individually or as a ZIP.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Why KB resizing matters */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "왜 KB 지정이 필요한가요?" : "Why Specify Exact KB Size?"}
        </h2>
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
          {isKo ? (
            <>
              <p>취업 서류, 공공기관 온라인 제출, 자격증 시험 접수 등에서는 사진 용량 제한이 있는 경우가 많습니다. 일반적인 이미지 압축 도구는 품질만 조절할 수 있어 정확한 KB를 맞추기 어렵습니다.</p>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-4 mt-4">
                <p className="font-medium text-foreground mb-2">자주 요구되는 파일 크기</p>
                <ul className="space-y-1">
                  <li>공무원 시험 증명사진: <strong>200KB 이하</strong></li>
                  <li>여권 사진: <strong>500KB 이하</strong></li>
                  <li>운전면허 사진: <strong>100KB 이하</strong></li>
                  <li>온라인 원서 접수: <strong>보통 200~500KB</strong></li>
                  <li>이력서/자소서 첨부: <strong>100~300KB</strong></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>Many job applications, government portals, and exam registrations require photos under a specific file size. Regular image compressors only adjust quality, making it hard to hit exact KB targets.</p>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-4 mt-4">
                <p className="font-medium text-foreground mb-2">Common file size requirements</p>
                <ul className="space-y-1">
                  <li>ID photos (civil service exams): <strong>under 200KB</strong></li>
                  <li>Passport photos: <strong>under 500KB</strong></li>
                  <li>Driver&apos;s license photos: <strong>under 100KB</strong></li>
                  <li>Online applications: <strong>typically 200~500KB</strong></li>
                  <li>Resume attachments: <strong>100~300KB</strong></li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Tips */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사진 용량 줄이기 팁" : "Tips for Reducing Image Size"}
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "JPG 형식이 사진 용량 줄이기에 가장 효과적입니다.",
                "WebP는 동일 품질 대비 JPG보다 약 25~35% 더 작은 파일을 만듭니다.",
                "해상도를 줄이면 용량도 크게 감소합니다 — 증명사진은 보통 300~400px이면 충분합니다.",
                "PNG는 무손실 포맷이라 사진에는 비효율적입니다. 아이콘이나 텍스트 이미지에 적합합니다.",
              ]
            : [
                "JPG is the most effective format for reducing photo file sizes.",
                "WebP produces files 25-35% smaller than JPG at equivalent quality.",
                "Reducing resolution significantly decreases file size — ID photos usually need only 300-400px.",
                "PNG is lossless and inefficient for photos. It's best for icons and text images.",
              ]
          ).map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                  "@type": "Question",
                  name: item.q,
                  acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
              },
              {
                "@type": "WebApplication",
                name: isKo ? "사진 용량 줄이기 (KB 지정)" : "Image KB Resizer",
                description: description,
                url: `https://quickfigure.net/${lang}/tools/image-kb-resizer`,
                applicationCategory: "UtilityApplication",
                operatingSystem: "All",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
            ],
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{dict.blog.quickTools}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href={`/${lang}/tools/image-compressor`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageCompressor}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageCompressorDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-resizer`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageResizer}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageResizerDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-converter`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageConverter}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageConverterDesc}</p>
          </Link>
        </div>
      </section>

      <ShareButtons title={title} description={description} lang={lang} slug="image-kb-resizer" labels={dict.share} />
      <EmbedCodeButton slug="image-kb-resizer" lang={lang} labels={dict.embed} />

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
