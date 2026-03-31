"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface RotateImage {
  id: string;
  file: File;
  dataUrl: string;
  img: HTMLImageElement;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  customAngle: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function ImageRotatePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-rotate");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<RotateImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const title = isKo
    ? "이미지 회전 - 사진 돌리기 & 반전"
    : "Image Rotate - Rotate & Flip Photos Online";
  const description = isKo
    ? "이미지를 90°/180° 회전하거나 자유 각도로 돌리세요. 좌우/상하 반전도 가능. 100% 무료, 서버 업로드 없음."
    : "Rotate images 90°/180° or any custom angle. Flip horizontally or vertically. 100% free, no server upload.";

  const loadImage = useCallback((file: File): Promise<RotateImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            id: crypto.randomUUID(),
            file,
            dataUrl,
            img,
            rotation: 0,
            flipH: false,
            flipV: false,
            customAngle: 0,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;
      const loaded = await Promise.all(imageFiles.map(loadImage));
      setImages((prev) => [...prev, ...loaded]);
    },
    [loadImage]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const selected = images[selectedIndex] ?? null;

  const updateImage = useCallback(
    (id: string, updates: Partial<RotateImage>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  const rotate = useCallback(
    (degrees: number) => {
      if (!selected) return;
      updateImage(selected.id, {
        rotation: (selected.rotation + degrees + 360) % 360,
      });
    },
    [selected, updateImage]
  );

  const setCustomAngle = useCallback(
    (angle: number) => {
      if (!selected) return;
      updateImage(selected.id, { customAngle: angle, rotation: 0 });
    },
    [selected, updateImage]
  );

  const toggleFlipH = useCallback(() => {
    if (!selected) return;
    updateImage(selected.id, { flipH: !selected.flipH });
  }, [selected, updateImage]);

  const toggleFlipV = useCallback(() => {
    if (!selected) return;
    updateImage(selected.id, { flipV: !selected.flipV });
  }, [selected, updateImage]);

  const resetTransform = useCallback(() => {
    if (!selected) return;
    updateImage(selected.id, {
      rotation: 0,
      flipH: false,
      flipV: false,
      customAngle: 0,
    });
  }, [selected, updateImage]);

  const applyToAll = useCallback(() => {
    if (!selected) return;
    const { rotation, flipH, flipV, customAngle } = selected;
    setImages((prev) =>
      prev.map((img) => ({ ...img, rotation, flipH, flipV, customAngle }))
    );
  }, [selected]);

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const next = prev.filter((img) => img.id !== id);
        if (selectedIndex >= next.length && next.length > 0) {
          setSelectedIndex(next.length - 1);
        }
        return next;
      });
    },
    [selectedIndex]
  );

  const getEffectiveAngle = (img: RotateImage) => {
    return img.customAngle !== 0 ? img.customAngle : img.rotation;
  };

  const renderToCanvas = useCallback(
    (img: RotateImage): Promise<Blob> => {
      return new Promise((resolve) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const angle = getEffectiveAngle(img);
        const rad = (angle * Math.PI) / 180;
        const { width: w, height: h } = img.img;

        // Calculate bounding box
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const newW = Math.ceil(w * cos + h * sin);
        const newH = Math.ceil(w * sin + h * cos);

        canvas.width = newW;
        canvas.height = newH;

        ctx.save();
        ctx.translate(newW / 2, newH / 2);
        ctx.rotate(rad);
        if (img.flipH) ctx.scale(-1, 1);
        if (img.flipV) ctx.scale(1, -1);
        ctx.drawImage(img.img, -w / 2, -h / 2);
        ctx.restore();

        const ext = img.file.name.split(".").pop()?.toLowerCase();
        let mimeType = "image/png";
        if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
        else if (ext === "webp") mimeType = "image/webp";

        canvas.toBlob(
          (blob) => resolve(blob!),
          mimeType,
          mimeType === "image/jpeg" ? 0.95 : undefined
        );
      });
    },
    []
  );

  const downloadSingle = useCallback(
    async (img: RotateImage) => {
      setIsProcessing(true);
      const blob = await renderToCanvas(img);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = img.file.name.split(".").pop() ?? "png";
      const baseName = img.file.name.replace(/\.[^.]+$/, "");
      a.href = url;
      a.download = `${baseName}-rotated.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsProcessing(false);
    },
    [renderToCanvas]
  );

  const downloadAll = useCallback(async () => {
    setIsProcessing(true);
    for (const img of images) {
      const blob = await renderToCanvas(img);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = img.file.name.split(".").pop() ?? "png";
      const baseName = img.file.name.replace(/\.[^.]+$/, "");
      a.href = url;
      a.download = `${baseName}-rotated.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setIsProcessing(false);
  }, [images, renderToCanvas]);

  const previewTransform = selected
    ? `rotate(${getEffectiveAngle(selected)}deg) scaleX(${selected.flipH ? -1 : 1}) scaleY(${selected.flipV ? -1 : 1})`
    : "";

  const faqItems = isKo
    ? [
        {
          q: "이미지가 서버에 업로드되나요?",
          a: "아닙니다. 모든 처리가 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 이미지가 외부 서버로 전송되지 않으므로 완전히 안전합니다.",
        },
        {
          q: "회전과 반전을 동시에 적용할 수 있나요?",
          a: "네, 회전(90°/180°/270° 또는 자유 각도)과 좌우/상하 반전을 동시에 적용할 수 있습니다. 모든 변환이 실시간으로 미리보기에 반영됩니다.",
        },
        {
          q: "원본 이미지 형식이 유지되나요?",
          a: "네. JPG 이미지는 JPG로, PNG는 PNG로, WebP는 WebP로 다운로드됩니다. JPG 파일은 95% 품질로 저장되어 화질 저하가 거의 없습니다.",
        },
        {
          q: "여러 이미지를 한 번에 회전할 수 있나요?",
          a: "네. 여러 이미지를 업로드한 후 '전체 적용' 버튼으로 현재 설정을 모든 이미지에 일괄 적용할 수 있습니다. '전체 다운로드'로 한 번에 저장하세요.",
        },
        {
          q: "EXIF 방향 정보 때문에 사진이 자동 회전되는데 어떻게 하나요?",
          a: "스마트폰으로 찍은 사진은 EXIF 메타데이터에 방향 정보가 있어 일부 프로그램에서 자동 회전됩니다. 이 도구로 원하는 방향으로 직접 회전한 후 저장하면 EXIF에 관계없이 올바른 방향이 유지됩니다.",
        },
      ]
    : [
        {
          q: "Are my images uploaded to a server?",
          a: "No. All processing happens in your browser using the Canvas API. Your images are never sent to any external server, ensuring complete privacy.",
        },
        {
          q: "Can I apply rotation and flip at the same time?",
          a: "Yes, you can combine rotation (90°/180°/270° or custom angle) with horizontal/vertical flip. All transformations are reflected in the live preview instantly.",
        },
        {
          q: "Is the original image format preserved?",
          a: "Yes. JPG images are saved as JPG, PNG as PNG, and WebP as WebP. JPG files are saved at 95% quality to minimize quality loss.",
        },
        {
          q: "Can I rotate multiple images at once?",
          a: "Yes. Upload multiple images, then use the 'Apply to All' button to apply the current settings to every image. Use 'Download All' to save them at once.",
        },
        {
          q: "Why do my phone photos appear rotated in some programs?",
          a: "Smartphone photos contain EXIF orientation metadata that some programs interpret differently. Use this tool to rotate the image to the correct orientation and save — the result will display correctly everywhere, regardless of EXIF data.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 회전" : "Image Rotate"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="image-rotate" locale={locale} />
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
          <p className="text-4xl mb-2">🔄</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo
              ? "이미지를 드래그하거나 클릭하여 업로드 (여러 장 선택 가능)"
              : "Drag & drop images or click to upload (select multiple)"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            JPG, PNG, WebP, GIF
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Image thumbnails */}
        {images.length > 0 && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  {isKo
                    ? `이미지 (${images.length}장)`
                    : `Images (${images.length})`}
                </p>
                <button
                  onClick={() => {
                    setImages([]);
                    setSelectedIndex(0);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                >
                  {isKo ? "전체 삭제" : "Clear All"}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedIndex(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden cursor-pointer transition-all ${
                      selectedIndex === i
                        ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                        : "border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    <img
                      src={img.dataUrl}
                      alt={`Image ${i + 1}`}
                      className="w-full h-full object-cover"
                      style={{
                        transform: `rotate(${getEffectiveAngle(img)}deg) scaleX(${img.flipH ? -1 : 1}) scaleY(${img.flipV ? -1 : 1})`,
                      }}
                    />
                    <span className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1">
                      {i + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="absolute top-0 right-0 bg-black/60 text-white text-[10px] w-4 h-4 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selected && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md mx-auto rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-4"
                  style={{ minHeight: "240px" }}
                >
                  <img
                    src={selected.dataUrl}
                    alt="Preview"
                    className="max-w-full max-h-72 transition-transform duration-200"
                    style={{ transform: previewTransform }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-400">
                  {selected.img.width} × {selected.img.height}px &middot;{" "}
                  {formatBytes(selected.file.size)} &middot;{" "}
                  {getEffectiveAngle(selected)}°
                  {selected.flipH
                    ? isKo
                      ? " · 좌우반전"
                      : " · Flipped H"
                    : ""}
                  {selected.flipV
                    ? isKo
                      ? " · 상하반전"
                      : " · Flipped V"
                    : ""}
                </p>
              </div>
            )}

            {/* Rotation controls */}
            {selected && (
              <div className="space-y-4">
                {/* Quick rotation buttons */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    {isKo ? "빠른 회전" : "Quick Rotate"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => rotate(-90)}
                      className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                    >
                      ↺ {isKo ? "반시계 90°" : "CCW 90°"}
                    </button>
                    <button
                      onClick={() => rotate(90)}
                      className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                    >
                      ↻ {isKo ? "시계 90°" : "CW 90°"}
                    </button>
                    <button
                      onClick={() => rotate(180)}
                      className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                    >
                      🔃 180°
                    </button>
                  </div>
                </div>

                {/* Custom angle */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    {isKo ? "자유 각도" : "Custom Angle"}:{" "}
                    {selected.customAngle}°
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={1}
                      value={selected.customAngle}
                      onChange={(e) => setCustomAngle(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      value={selected.customAngle}
                      onChange={(e) => {
                        const v = parseInt(e.target.value) || 0;
                        setCustomAngle(Math.max(-180, Math.min(180, v)));
                      }}
                      className="w-20 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>180°</span>
                  </div>
                </div>

                {/* Flip buttons */}
                <div>
                  <p className="text-sm font-medium mb-2">
                    {isKo ? "반전" : "Flip"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={toggleFlipH}
                      className={`px-4 py-2 rounded-md border transition-colors cursor-pointer text-sm ${
                        selected.flipH
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                          : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      ↔ {isKo ? "좌우 반전" : "Flip Horizontal"}
                    </button>
                    <button
                      onClick={toggleFlipV}
                      className={`px-4 py-2 rounded-md border transition-colors cursor-pointer text-sm ${
                        selected.flipV
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600"
                          : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      ↕ {isKo ? "상하 반전" : "Flip Vertical"}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={resetTransform}
                    className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                  >
                    {isKo ? "초기화" : "Reset"}
                  </button>
                  {images.length > 1 && (
                    <button
                      onClick={applyToAll}
                      className="px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                    >
                      {isKo ? "전체 적용" : "Apply to All"}
                    </button>
                  )}
                </div>

                {/* Download */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadSingle(selected)}
                    disabled={isProcessing}
                    className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? isKo
                        ? "처리 중..."
                        : "Processing..."
                      : isKo
                      ? "다운로드"
                      : "Download"}
                  </button>
                  {images.length > 1 && (
                    <button
                      onClick={downloadAll}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isKo
                        ? `전체 다운로드 (${images.length}장)`
                        : `Download All (${images.length})`}
                    </button>
                  )}
                </div>
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
                "이미지를 드래그하거나 클릭하여 업로드하세요 (여러 장 가능).",
                "빠른 회전 버튼(90°/180°)으로 회전하거나, 슬라이더로 자유 각도를 설정하세요.",
                "좌우/상하 반전 버튼으로 이미지를 뒤집을 수 있습니다.",
                "실시간 미리보기를 확인하고, 여러 이미지에 일괄 적용할 수 있습니다.",
                "다운로드 버튼을 클릭하여 원본 형식 그대로 저장하세요.",
              ]
            : [
                "Upload images by dragging or clicking the upload area (multiple files supported).",
                "Use quick rotate buttons (90°/180°) or the slider to set a custom angle.",
                "Use the Flip Horizontal/Vertical buttons to mirror the image.",
                "Check the live preview and optionally apply settings to all images.",
                "Click Download to save in the original format.",
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
            url: `https://quickfigure.net/${lang}/tools/image-rotate`,
            applicationCategory: "MultimediaApplication",
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
        </div>
      </section>

      <ToolHowItWorks slug="image-rotate" locale={locale} />
      <ToolDisclaimer slug="image-rotate" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="image-rotate"
        labels={dict.share}
      />
      <EmbedCodeButton slug="image-rotate" lang={lang} labels={dict.embed} />

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
