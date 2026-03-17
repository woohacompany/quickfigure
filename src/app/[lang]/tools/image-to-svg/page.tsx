"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
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

type TraceMode = "color" | "outline" | "silhouette";

const COLOR_OPTIONS = [2, 4, 8, 16, 32, 64] as const;

export default function ImageToSvgPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-to-svg");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [fileName, setFileName] = useState("");
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [svgString, setSvgString] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings
  const [mode, setMode] = useState<TraceMode>("color");
  const [numColors, setNumColors] = useState(16);
  const [detail, setDetail] = useState<"low" | "medium" | "high">("medium");
  const [smoothing, setSmoothing] = useState(1);
  const [removeBg, setRemoveBg] = useState(false);

  const title = isKo
    ? "이미지 SVG 변환기 - 사진을 벡터로"
    : "Image to SVG Converter - Vectorize Your Images";
  const description = isKo
    ? "JPG, PNG 이미지를 SVG 벡터 파일로 변환하세요. 로고, 아이콘, 일러스트를 깔끔한 벡터로. 색상 수, 디테일 조절 가능. 100% 무료, 서버 업로드 없음."
    : "Convert JPG and PNG images to SVG vector files. Perfect for logos, icons, and illustrations. Adjustable colors and detail. 100% free, no server upload.";

  const loadImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setOriginalUrl(dataUrl);
          setOriginalSize(file.size);
          setFileName(file.name);
          setImgWidth(img.width);
          setImgHeight(img.height);
          setSvgString(null);
          setShowCode(false);

          // Draw to hidden canvas for later use
          const canvas = canvasRef.current!;
          // Limit canvas size for performance
          const maxDim = 1024;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const scale = maxDim / Math.max(w, h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) loadImage(file);
      e.target.value = "";
    },
    [loadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) loadImage(file);
    },
    [loadImage]
  );

  const convertToSvg = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setSvgString(null);

    try {
      // Dynamic import to avoid SSR issues
      const ImageTracer = (await import("imagetracerjs")).default;

      const ctx = canvas.getContext("2d")!;
      const imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Build options based on settings
      const detailSettings = {
        low: { ltres: 2, qtres: 2, pathomit: 20 },
        medium: { ltres: 1, qtres: 1, pathomit: 8 },
        high: { ltres: 0.5, qtres: 0.5, pathomit: 2 },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options: any = {
        ...detailSettings[detail],
        blurradius: smoothing,
        blurdelta: 20,
        strokewidth: 0,
        scale: 1,
        roundcoords: 1,
        desc: false,
        viewbox: true,
      };

      if (mode === "color") {
        options.numberofcolors = numColors;
        options.colorsampling = 2;
        options.colorquantcycles = 3;
      } else if (mode === "outline") {
        options.numberofcolors = 2;
        options.colorsampling = 0;
        options.colorquantcycles = 1;
        options.strokewidth = 1;
        options.linefilter = true;
        options.pal = [
          { r: 0, g: 0, b: 0, a: 255 },
          { r: 255, g: 255, b: 255, a: 255 },
        ];
      } else if (mode === "silhouette") {
        options.numberofcolors = 2;
        options.colorsampling = 0;
        options.colorquantcycles = 1;
        options.pal = [
          { r: 0, g: 0, b: 0, a: 255 },
          { r: 255, g: 255, b: 255, a: 255 },
        ];
      }

      // Run in a timeout to not block UI
      const svg = await new Promise<string>((resolve) => {
        setTimeout(() => {
          let result = ImageTracer.imagedataToSVG(imgd, options);

          // Remove white background if option is enabled
          if (removeBg) {
            // Remove paths that fill with white (#ffffff or rgb(255,255,255))
            result = result.replace(
              /<path[^>]*fill="rgb\(255,255,255\)"[^>]*d="[^"]*"[^/]*\/>/g,
              ""
            );
            result = result.replace(
              /<path[^>]*fill="#ffffff"[^>]*d="[^"]*"[^/]*\/>/g,
              ""
            );
          }

          resolve(result);
        }, 50);
      });

      setSvgString(svg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [mode, numColors, detail, smoothing, removeBg]);

  const downloadSvg = useCallback(() => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = fileName.replace(/\.[^.]+$/, "");
    a.href = url;
    a.download = `${baseName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [svgString, fileName]);

  const copySvgCode = useCallback(() => {
    if (!svgString) return;
    navigator.clipboard.writeText(svgString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgString]);

  const clearFile = useCallback(() => {
    setOriginalUrl(null);
    setSvgString(null);
    setFileName("");
    setOriginalSize(0);
    setShowCode(false);
  }, []);

  const svgSize = svgString ? new Blob([svgString]).size : 0;

  const faqItems = isKo
    ? [
        {
          q: "어떤 이미지에서 가장 좋은 결과가 나오나요?",
          a: "로고, 아이콘, 일러스트, 클립아트 같은 단순하고 명확한 이미지에서 최고의 결과를 얻을 수 있습니다. 색상이 적고 경계가 뚜렷한 이미지일수록 깔끔한 벡터가 생성됩니다.",
        },
        {
          q: "사진(인물, 풍경)도 변환할 수 있나요?",
          a: "가능하지만 사진은 일러스트 스타일로 단순화됩니다. 색상 수를 32~64로 높이면 더 세밀한 결과를 얻을 수 있지만, 파일 크기가 커집니다. 예술적 효과를 원할 때 유용합니다.",
        },
        {
          q: "변환된 SVG를 일러스트레이터에서 편집할 수 있나요?",
          a: "네, SVG는 Adobe Illustrator, Inkscape, Figma 등 모든 벡터 편집기에서 바로 열고 편집할 수 있습니다. 개별 패스와 색상을 자유롭게 수정할 수 있습니다.",
        },
        {
          q: "이미지가 서버에 업로드되나요?",
          a: "아닙니다. 모든 처리가 브라우저에서 이루어집니다. 이미지가 외부 서버로 전송되지 않으므로 완전히 안전합니다.",
        },
        {
          q: "JPG와 PNG 중 어떤 걸 올려야 하나요?",
          a: "PNG를 권장합니다. PNG는 무손실 압축이라 원본 품질이 더 좋고, 투명 배경도 지원합니다. JPG는 압축 아티팩트가 있어 변환 결과에 노이즈가 생길 수 있습니다.",
        },
      ]
    : [
        {
          q: "What types of images produce the best results?",
          a: "Logos, icons, illustrations, and clipart with simple shapes and clear edges produce the cleanest vectors. Images with fewer colors and distinct boundaries work best.",
        },
        {
          q: "Can I convert photos (portraits, landscapes)?",
          a: "Yes, but photos will be simplified into an illustration style. Setting colors to 32-64 gives more detail but increases file size. It's great for artistic effects.",
        },
        {
          q: "Can I edit the SVG in Illustrator?",
          a: "Yes, SVG files open directly in Adobe Illustrator, Inkscape, Figma, and all vector editors. You can freely modify individual paths and colors.",
        },
        {
          q: "Are my images uploaded to a server?",
          a: "No. All processing happens in your browser. Images are never sent to any external server, ensuring complete privacy.",
        },
        {
          q: "Should I use JPG or PNG as input?",
          a: "PNG is recommended. PNG uses lossless compression so the source quality is better, and it supports transparent backgrounds. JPG compression artifacts can introduce noise in the traced output.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      </header>

      {/* Quality notice */}
      <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
        {isKo
          ? "💡 로고, 아이콘, 일러스트 같은 단순한 이미지에 가장 좋은 결과를 얻을 수 있습니다. 사진(풍경, 인물)은 예술적 효과를 줄 수 있지만 원본과 다를 수 있습니다."
          : "💡 Best results with logos, icons, and illustrations. Photos may produce artistic effects but will differ from the original."}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-5">
        {/* Upload area */}
        {!originalUrl && (
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
            <p className="text-4xl mb-2">✏️</p>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isKo
                ? "이미지를 드래그하거나 클릭하여 업로드"
                : "Drag & drop an image or click to upload"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              JPG, PNG, WebP, BMP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {originalUrl && (
          <>
            {/* File info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">
                {fileName} ({formatBytes(originalSize)}, {imgWidth}×{imgHeight}px)
              </span>
              <button
                onClick={clearFile}
                className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
              >
                {isKo ? "파일 제거" : "Remove"}
              </button>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              {/* Mode selector */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "변환 모드" : "Conversion Mode"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        key: "color" as TraceMode,
                        label: isKo ? "컬러 벡터" : "Color",
                        desc: isKo ? "원본 색상 유지" : "Preserve colors",
                      },
                      {
                        key: "outline" as TraceMode,
                        label: isKo ? "흑백 윤곽선" : "Outline",
                        desc: isKo ? "선만 추출" : "Lines only",
                      },
                      {
                        key: "silhouette" as TraceMode,
                        label: isKo ? "실루엣" : "Silhouette",
                        desc: isKo ? "단색 형태" : "Solid shape",
                      },
                    ]
                  ).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMode(m.key)}
                      className={`px-3 py-2.5 rounded-md border text-sm font-medium transition-colors cursor-pointer ${
                        mode === m.key
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <div>{m.label}</div>
                      <div className="text-xs font-normal mt-0.5 opacity-70">
                        {m.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Number of colors (only for color mode) */}
                {mode === "color" && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      {isKo ? "색상 수" : "Number of Colors"}: {numColors}
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_OPTIONS.map((n) => (
                        <button
                          key={n}
                          onClick={() => setNumColors(n)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                            numColors === n
                              ? "bg-blue-600 text-white"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detail level */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {isKo ? "디테일 수준" : "Detail Level"}
                  </label>
                  <select
                    value={detail}
                    onChange={(e) =>
                      setDetail(e.target.value as "low" | "medium" | "high")
                    }
                    className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">
                      {isKo ? "낮음 (단순, 작은 파일)" : "Low (simple, small file)"}
                    </option>
                    <option value="medium">
                      {isKo ? "중간 (균형)" : "Medium (balanced)"}
                    </option>
                    <option value="high">
                      {isKo ? "높음 (세밀, 큰 파일)" : "High (detailed, larger file)"}
                    </option>
                  </select>
                </div>

                {/* Smoothing */}
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {isKo ? "스무딩" : "Smoothing"}: {smoothing}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={smoothing}
                    onChange={(e) => setSmoothing(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>{isKo ? "없음" : "None"}</span>
                    <span>{isKo ? "최대" : "Max"}</span>
                  </div>
                </div>

                {/* Remove background */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeBg}
                      onChange={(e) => setRemoveBg(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {isKo
                        ? "흰색 배경 제거 (투명 처리)"
                        : "Remove white background"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Convert button */}
            <button
              onClick={convertToSvg}
              disabled={isProcessing}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? isKo
                  ? "변환 중..."
                  : "Converting..."
                : isKo
                ? "SVG로 변환"
                : "Convert to SVG"}
            </button>

            {/* Preview: Original vs SVG side by side */}
            {svgString && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-neutral-400 mb-2 text-center">
                      {isKo ? "원본" : "Original"} ({formatBytes(originalSize)})
                    </p>
                    <div className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]">
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="w-full object-contain max-h-64"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-2 text-center">
                      SVG ({formatBytes(svgSize)})
                    </p>
                    <div
                      className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjBmMGYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=')]"
                      dangerouslySetInnerHTML={{ __html: svgString }}
                      style={{ maxHeight: "256px" }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={downloadSvg}
                    className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {isKo ? "SVG 다운로드" : "Download SVG"}
                  </button>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="px-5 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                  >
                    {showCode
                      ? isKo
                        ? "코드 닫기"
                        : "Hide Code"
                      : isKo
                      ? "SVG 코드 보기"
                      : "View SVG Code"}
                  </button>
                  <button
                    onClick={copySvgCode}
                    className="px-5 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                  >
                    {copied
                      ? isKo
                        ? "복사됨!"
                        : "Copied!"
                      : isKo
                      ? "코드 복사"
                      : "Copy Code"}
                  </button>
                </div>

                {/* SVG Code view */}
                {showCode && (
                  <div className="relative">
                    <pre className="p-4 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs overflow-auto max-h-60 text-neutral-700 dark:text-neutral-300">
                      {svgString}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Privacy notice */}
      <p className="mt-3 text-xs text-neutral-400 text-center">
        {isKo
          ? "🔒 모든 처리는 브라우저에서 이루어집니다. 이미지가 서버로 전송되지 않습니다."
          : "🔒 All processing happens in your browser. Images are never uploaded to any server."}
      </p>

      {/* How to Use */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "사용 방법" : "How to Use"}
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
          {(isKo
            ? [
                "이미지를 드래그하거나 클릭하여 업로드하세요 (JPG, PNG, WebP, BMP).",
                "변환 모드를 선택하세요: 컬러 벡터, 흑백 윤곽선, 또는 실루엣.",
                "색상 수, 디테일 수준, 스무딩 등 설정을 조절하세요.",
                "'SVG로 변환' 버튼을 클릭하고 미리보기를 확인하세요.",
                "결과가 마음에 들면 SVG를 다운로드하거나 코드를 복사하세요.",
              ]
            : [
                "Upload an image by dragging or clicking (JPG, PNG, WebP, BMP).",
                "Choose a conversion mode: Color, Outline, or Silhouette.",
                "Adjust settings: number of colors, detail level, smoothing.",
                "Click 'Convert to SVG' and check the preview.",
                "Download the SVG or copy the code if you're happy with the result.",
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
            url: `https://quickfigure.net/${lang}/tools/image-to-svg`,
            applicationCategory: "DesignApplication",
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
            href={`/${lang}/tools/image-converter`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageConverter}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageConverterDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/tools/image-resizer`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageResizer}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageResizerDesc}
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
          <Link
            href={`/${lang}/tools/image-cropper`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageCropper}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageCropperDesc}
            </p>
          </Link>
        </div>
      </section>

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="image-to-svg"
        labels={dict.share}
      />
      <EmbedCodeButton slug="image-to-svg" lang={lang} labels={dict.embed} />

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
