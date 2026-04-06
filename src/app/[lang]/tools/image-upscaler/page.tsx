"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Unsharp Mask sharpening filter applied via Canvas ImageData.
 * amount: 0~100 (0 = off, 100 = max)
 */
function applySharpen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  if (amount <= 0) return;
  const factor = amount / 100;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  // 3x3 sharpen kernel weighted by factor
  const w = width;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const neighbors =
          copy[((y - 1) * w + x) * 4 + c] +
          copy[((y + 1) * w + x) * 4 + c] +
          copy[(y * w + x - 1) * 4 + c] +
          copy[(y * w + x + 1) * 4 + c];
        const blurred = neighbors / 4;
        const sharpened = center + (center - blurred) * factor * 2;
        data[idx + c] = Math.max(0, Math.min(255, sharpened));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Simple box-blur for noise reduction (3x3 average).
 */
function applyDenoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  const w = width;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += copy[((y + dy) * w + (x + dx)) * 4 + c];
          }
        }
        data[idx + c] = Math.round(sum / 9);
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

export default function ImageUpscalerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-upscaler");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [originalFileName, setOriginalFileName] = useState("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);

  const [scale, setScale] = useState(2);
  const [sharpness, setSharpness] = useState(50);
  const [denoise, setDenoise] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [jpgQuality, setJpgQuality] = useState(90);

  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultFileSize, setResultFileSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Before/After slider
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  const title = isKo
    ? "이미지 화질 개선 - 사진 해상도 높이기, 화질 올리기 | QuickFigure"
    : "Image Upscaler - Enhance Photo Quality & Resolution Online | QuickFigure";
  const description = isKo
    ? "저화질 이미지를 고화질로 개선하세요. 2x~4x 업스케일, 샤프닝 적용. 서버 업로드 없이 브라우저에서 안전하게 처리."
    : "Enhance low-quality images to high resolution. 2x-4x upscale with sharpening. 100% browser-based, no server upload.";

  const targetWidth = originalWidth * scale;
  const targetHeight = originalHeight * scale;

  const processImage = useCallback((file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert(isKo ? "파일 크기가 20MB를 초과합니다." : "File size exceeds 20MB limit.");
      return;
    }
    setResultDataUrl(null);
    setResultFileSize(0);
    setOriginalFileSize(file.size);
    setOriginalFileName(file.name);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalDataUrl(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [isKo]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const upscale = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    setProcessing(true);
    setProgress(10);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const newW = originalImage.width * scale;
      const newH = originalImage.height * scale;
      canvas.width = newW;
      canvas.height = newH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setProcessing(false);
        return;
      }

      setProgress(30);

      // Multi-step upscale for better quality (Lanczos-like via browser's high-quality interpolation)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (scale <= 2) {
        ctx.drawImage(originalImage, 0, 0, newW, newH);
      } else {
        // Step upscale: first 2x, then remaining
        const tempCanvas = document.createElement("canvas");
        const step1W = originalImage.width * 2;
        const step1H = originalImage.height * 2;
        tempCanvas.width = step1W;
        tempCanvas.height = step1H;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = "high";
        tempCtx.drawImage(originalImage, 0, 0, step1W, step1H);

        ctx.drawImage(tempCanvas, 0, 0, newW, newH);
      }

      setProgress(60);

      // Apply denoise before sharpening
      if (denoise) {
        applyDenoise(ctx, newW, newH);
      }

      setProgress(80);

      // Apply sharpening
      applySharpen(ctx, newW, newH, sharpness);

      setProgress(90);

      // Export
      const qualityValue = outputFormat === "image/png" ? undefined : (outputFormat === "image/jpeg" ? jpgQuality / 100 : 0.9);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setProcessing(false);
            return;
          }
          setResultFileSize(blob.size);
          const url = URL.createObjectURL(blob);
          setResultDataUrl(url);
          setProgress(100);
          setProcessing(false);
        },
        outputFormat,
        qualityValue
      );
    }, 50);
  }, [originalImage, scale, sharpness, denoise, outputFormat, jpgQuality]);

  const download = useCallback(() => {
    if (!resultDataUrl) return;
    const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
    const baseName = originalFileName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `${baseName}_upscaled_${scale}x.${ext}`;
    a.click();
  }, [resultDataUrl, outputFormat, originalFileName, scale]);

  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!compareRef.current) return;
      const rect = compareRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(pct);
    },
    []
  );

  const faqItems = isKo
    ? [
        {
          q: "이 도구는 AI 업스케일러인가요?",
          a: "아닙니다. 이 도구는 브라우저의 Canvas API를 사용한 고급 보간법(Bicubic/High-quality interpolation) 기반 업스케일러입니다. 전문 AI 업스케일러(Real-ESRGAN 등) 대비 품질 차이가 있을 수 있지만, 서버 업로드 없이 완전히 무료로 안전하게 사용할 수 있습니다.",
        },
        {
          q: "어떤 이미지 형식을 지원하나요?",
          a: "입력: JPEG, PNG, WebP 등 브라우저가 지원하는 모든 이미지 형식을 사용할 수 있습니다. 출력: PNG(기본, 무손실), JPEG(품질 선택 가능), WebP 형식으로 다운로드할 수 있습니다.",
        },
        {
          q: "4x 업스케일 시 화질이 좋아지나요?",
          a: "배율이 높을수록 이미지가 커지지만, 원본에 없는 디테일을 생성할 수는 없습니다. 샤프닝 필터로 선명도를 높일 수 있으며, 2x 업스케일이 가장 자연스러운 결과를 제공합니다.",
        },
        {
          q: "파일 크기 제한이 있나요?",
          a: "최대 20MB까지 업로드할 수 있습니다. 모든 처리는 브라우저에서 수행되므로, 매우 큰 이미지를 고배율로 업스케일하면 처리 시간이 길어질 수 있습니다.",
        },
        {
          q: "서버에 이미지가 업로드되나요?",
          a: "아닙니다. 모든 처리는 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 이미지가 외부 서버로 전송되지 않으므로 완전히 안전합니다.",
        },
      ]
    : [
        {
          q: "Is this an AI upscaler?",
          a: "No. This tool uses high-quality interpolation via the browser's Canvas API. While it may not match dedicated AI upscalers (like Real-ESRGAN), it's completely free, private, and requires no server upload.",
        },
        {
          q: "What image formats are supported?",
          a: "Input: Any image format supported by your browser, including JPEG, PNG, and WebP. Output: PNG (default, lossless), JPEG (with quality control), or WebP.",
        },
        {
          q: "Does 4x upscaling improve quality?",
          a: "Higher scale factors make the image larger but can't create detail that isn't in the original. Sharpening helps improve clarity, and 2x upscaling typically provides the most natural results.",
        },
        {
          q: "Is there a file size limit?",
          a: "You can upload images up to 20MB. All processing happens in your browser, so upscaling very large images at high scale factors may take longer.",
        },
        {
          q: "Is my image uploaded to a server?",
          a: "No. All processing happens in your browser using the Canvas API. Your images are never sent to any external server, ensuring complete privacy.",
        },
      ];

  const howToUseSteps = isKo
    ? [
        "이미지를 드래그하거나 클릭하여 업로드하세요. (JPG, PNG, WebP / 최대 20MB)",
        "배율(2x, 3x, 4x)을 선택하세요. 결과 해상도가 자동으로 표시됩니다.",
        "샤프닝 강도와 노이즈 제거 옵션을 조절하세요.",
        "출력 형식을 선택하고 \"화질 개선\" 버튼을 클릭하세요.",
        "Before/After 슬라이더로 결과를 비교하고, 다운로드 버튼을 클릭하세요.",
      ]
    : [
        "Upload an image by dragging or clicking. (JPG, PNG, WebP / max 20MB)",
        "Select scale factor (2x, 3x, 4x). The result resolution is shown automatically.",
        "Adjust sharpening intensity and noise reduction options.",
        "Choose the output format and click the \"Upscale\" button.",
        "Compare the result with the Before/After slider, then click Download.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 화질 개선" : "Image Upscaler"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="image-upscaler" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Upload Area */}
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
          <div className="text-4xl mb-2">{originalDataUrl ? "🖼️" : "📤"}</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo ? "이미지를 드래그하거나 클릭하여 업로드" : "Drag & drop image or click to upload"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP · {isKo ? "최대" : "Max"} 20MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Original Preview */}
        {originalDataUrl && (
          <div>
            <label className="text-sm font-medium block mb-2">
              {isKo ? "원본 이미지" : "Original Image"}
            </label>
            <div className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
              <img src={originalDataUrl} alt="Original" className="max-w-full max-h-64 mx-auto object-contain" />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {isKo ? "해상도" : "Resolution"}: {originalWidth} × {originalHeight}px
              {" | "}
              {isKo ? "파일 크기" : "File size"}: {formatBytes(originalFileSize)}
            </p>
          </div>
        )}

        {originalImage && (
          <>
            {/* Scale Selection */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "배율 선택" : "Scale Factor"}
              </label>
              <div className="flex gap-2">
                {([2, 3, 4] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`flex-1 px-4 py-3 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                      scale === s
                        ? "bg-foreground text-background border-foreground"
                        : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className="font-bold">{s}x</div>
                    <div className="text-xs mt-0.5 opacity-70">
                      {originalWidth * s} × {originalHeight * s}px
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sharpening */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "샤프닝 강도" : "Sharpening Intensity"}: {sharpness}
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={sharpness}
                onChange={(e) => setSharpness(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{isKo ? "없음" : "None"} (0)</span>
                <span>{isKo ? "최대" : "Max"} (100)</span>
              </div>
            </div>

            {/* Denoise */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="denoise"
                checked={denoise}
                onChange={(e) => setDenoise(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 accent-blue-600"
              />
              <label htmlFor="denoise" className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer">
                {isKo ? "노이즈 제거" : "Noise Reduction"}
              </label>
            </div>

            {/* Output Format */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "출력 형식" : "Output Format"}
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image/png">PNG ({isKo ? "무손실, 기본" : "Lossless, default"})</option>
                <option value="image/jpeg">JPEG ({isKo ? "품질 선택" : "Quality control"})</option>
                <option value="image/webp">WebP</option>
              </select>
            </div>

            {/* JPEG Quality */}
            {outputFormat === "image/jpeg" && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "JPEG 품질" : "JPEG Quality"}: {jpgQuality}%
                </label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {/* Result Resolution Preview */}
            <div className="rounded-md bg-neutral-100 dark:bg-neutral-800 p-3 text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">
                {isKo ? "결과 해상도" : "Result Resolution"}:
              </span>
              <span className="ml-2 font-mono font-medium">
                {targetWidth} × {targetHeight}px
              </span>
            </div>

            {/* Upscale Button */}
            <button
              onClick={upscale}
              disabled={processing}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing
                ? (isKo ? "화질을 개선하고 있습니다..." : "Enhancing image quality...")
                : (isKo ? "화질 개선" : "Upscale Image")}
            </button>

            {/* Progress Bar */}
            {processing && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </>
        )}

        {/* Results */}
        {resultDataUrl && originalDataUrl && (
          <div className="space-y-4">
            {/* Before/After Comparison Slider */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "Before / After 비교" : "Before / After Comparison"}
              </label>
              <div
                ref={compareRef}
                className="relative rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden select-none cursor-col-resize"
                style={{ aspectRatio: `${targetWidth} / ${targetHeight}`, maxHeight: "400px" }}
                onMouseDown={(e) => {
                  setIsDraggingSlider(true);
                  handleSliderMove(e.clientX);
                }}
                onMouseMove={(e) => {
                  if (isDraggingSlider) handleSliderMove(e.clientX);
                }}
                onMouseUp={() => setIsDraggingSlider(false)}
                onMouseLeave={() => setIsDraggingSlider(false)}
                onTouchStart={(e) => {
                  setIsDraggingSlider(true);
                  handleSliderMove(e.touches[0].clientX);
                }}
                onTouchMove={(e) => {
                  if (isDraggingSlider) handleSliderMove(e.touches[0].clientX);
                }}
                onTouchEnd={() => setIsDraggingSlider(false)}
              >
                {/* After (upscaled) - full width background */}
                <img
                  src={resultDataUrl}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-contain bg-neutral-50 dark:bg-neutral-800"
                />
                {/* Before (original) - clipped */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={originalDataUrl}
                    alt="Before"
                    className="w-full h-full object-contain bg-neutral-100 dark:bg-neutral-900"
                    style={{ width: compareRef.current ? `${compareRef.current.offsetWidth}px` : "100%" }}
                  />
                </div>
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-600 text-xs font-bold">
                    ⟷
                  </div>
                </div>
                {/* Labels */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {isKo ? "원본" : "Before"}
                </div>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {isKo ? "개선" : "After"}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold">{originalWidth} × {originalHeight}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "원본 해상도" : "Original"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{targetWidth} × {targetHeight}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "결과 해상도" : "Result"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold">{formatBytes(originalFileSize)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "원본 크기" : "Original Size"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold">{formatBytes(resultFileSize)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "결과 크기" : "Result Size"}</p>
              </div>
            </div>

            {/* Download */}
            <button
              onClick={download}
              className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              {isKo ? "다운로드" : "Download Upscaled Image"}
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="space-y-1">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            {isKo
              ? "AI 업스케일링이 아닌 고급 보간법 기반 처리입니다."
              : "Uses advanced interpolation, not AI-based upscaling."}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            {isKo
              ? "전문적인 AI 업스케일러 대비 품질 차이가 있을 수 있습니다."
              : "Quality may differ from professional AI upscaling tools."}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
            {isKo
              ? "이미지는 로컬에서 처리되며 서버에 업로드되지 않습니다."
              : "Your images are processed locally and never uploaded to any server."}
          </p>
        </div>
      </div>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "사용 방법" : "How to Use"}</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {howToUseSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* About */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "이미지 화질 개선이란?" : "What is Image Upscaling?"}
        </h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-neutral-600 dark:text-neutral-400 space-y-3">
          <p>
            {isKo
              ? "이미지 업스케일링은 저해상도 이미지의 픽셀 수를 늘려 더 큰 고해상도 이미지로 변환하는 기술입니다. 이 과정에서 보간법(Interpolation)을 사용하여 기존 픽셀 사이에 새로운 픽셀 값을 계산합니다."
              : "Image upscaling is the process of increasing the pixel count of a low-resolution image to create a larger, higher-resolution version. This uses interpolation algorithms to calculate new pixel values between existing ones."}
          </p>
          <p>
            {isKo
              ? "이 도구는 브라우저의 고품질 보간법(Bicubic 계열)을 활용하며, 추가로 Unsharp Mask 샤프닝 필터를 적용하여 업스케일된 이미지의 선명도를 향상시킵니다. 노이즈 제거 옵션을 통해 업스케일 과정에서 발생할 수 있는 노이즈도 줄일 수 있습니다."
              : "This tool leverages the browser's high-quality interpolation (Bicubic family) and additionally applies an Unsharp Mask sharpening filter to enhance clarity in the upscaled image. The noise reduction option helps minimize artifacts that may appear during upscaling."}
          </p>
          <h3 className="text-base font-semibold text-foreground">
            {isKo ? "활용 사례" : "Use Cases"}
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>{isKo ? "오래된 사진 복원 및 확대" : "Restoring and enlarging old photos"}</li>
            <li>{isKo ? "작은 이미지를 인쇄용 크기로 확대" : "Enlarging small images for print"}</li>
            <li>{isKo ? "웹용 썸네일을 고해상도로 변환" : "Converting web thumbnails to high resolution"}</li>
            <li>{isKo ? "소셜 미디어용 이미지 크기 확대" : "Enlarging images for social media"}</li>
          </ul>
        </div>
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

      {/* WebApplication JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: isKo ? "이미지 화질 개선" : "Image Upscaler",
            description: description,
            url: `https://www.quickfigure.net/${lang}/tools/image-upscaler`,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Related Tools */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">{isKo ? "관련 도구" : "Related Tools"}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href={`/${lang}/tools/image-resizer`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageResizer}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageResizerDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-compressor`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageCompressor}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageCompressorDesc}</p>
          </Link>
          <Link href={`/${lang}/tools/image-converter`} className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{dict.home.imageConverter}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{dict.home.imageConverterDesc}</p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="image-upscaler" locale={locale} />
      <ToolDisclaimer slug="image-upscaler" locale={locale} />

      <ShareButtons
        title={isKo ? "이미지 화질 개선" : "Image Upscaler"}
        description={description}
        lang={lang}
        slug="image-upscaler"
        labels={dict.share}
      />
      <EmbedCodeButton slug="image-upscaler" lang={lang} labels={dict.embed} />

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
