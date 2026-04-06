"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

type Position = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";
type WatermarkType = "text" | "image";

interface FileItem {
  id: string;
  file: File;
  originalDataUrl: string;
  originalImg: HTMLImageElement;
  resultDataUrl: string | null;
  resultBlob: Blob | null;
  done: boolean;
}

function getPositionCoords(
  pos: Position,
  cw: number,
  ch: number,
  ww: number,
  wh: number,
  margin: number
): { x: number; y: number } {
  const m = margin;
  const positions: Record<Position, { x: number; y: number }> = {
    tl: { x: m + ww / 2, y: m + wh / 2 },
    tc: { x: cw / 2, y: m + wh / 2 },
    tr: { x: cw - m - ww / 2, y: m + wh / 2 },
    ml: { x: m + ww / 2, y: ch / 2 },
    mc: { x: cw / 2, y: ch / 2 },
    mr: { x: cw - m - ww / 2, y: ch / 2 },
    bl: { x: m + ww / 2, y: ch - m - wh / 2 },
    bc: { x: cw / 2, y: ch - m - wh / 2 },
    br: { x: cw - m - ww / 2, y: ch - m - wh / 2 },
  };
  return positions[pos];
}

export default function ImageWatermarkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-watermark");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Files
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Watermark type
  const [wmType, setWmType] = useState<WatermarkType>("text");

  // Text watermark
  const [wmText, setWmText] = useState(isKo ? "© QuickFigure" : "© QuickFigure");
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(-30);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  // Image watermark
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState(30);
  const [logoOpacity, setLogoOpacity] = useState(30);

  // Common
  const [position, setPosition] = useState<Position>("mc");
  const [tile, setTile] = useState(false);
  const [margin, setMargin] = useState(20);
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg">("png");
  const [jpgQuality, setJpgQuality] = useState(90);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);

  const title = isKo
    ? "이미지 워터마크 추가 - 사진에 텍스트·로고 워터마크 넣기 | QuickFigure"
    : "Image Watermark Tool - Add Text & Logo Watermarks Online | QuickFigure";
  const description = isKo
    ? "사진에 텍스트 또는 로고 워터마크를 추가하세요. 위치, 투명도, 타일 반복 설정 가능. 일괄 처리, 서버 업로드 없이 안전."
    : "Add text or logo watermarks to your images. Customize position, opacity, tiling. Batch process up to 20 files, 100% browser-based.";

  const loadImage = (file: File): Promise<{ dataUrl: string; img: HTMLImageElement }> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => resolve({ dataUrl, img });
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type.startsWith("image/")).slice(0, 20);
    const items: FileItem[] = [];
    for (const file of arr) {
      const { dataUrl, img } = await loadImage(file);
      items.push({
        id: crypto.randomUUID(),
        file,
        originalDataUrl: dataUrl,
        originalImg: img,
        resultDataUrl: null,
        resultBlob: null,
        done: false,
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

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== id);
        if (selectedIndex >= next.length) setSelectedIndex(Math.max(0, next.length - 1));
        return next;
      });
    },
    [selectedIndex]
  );

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setLogoImg(img);
        setLogoDataUrl(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  // Draw watermark on a canvas
  const drawWatermark = useCallback(
    (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const cw = canvas.width;
      const ch = canvas.height;

      if (wmType === "text" && wmText.trim()) {
        const style = `${italic ? "italic " : ""}${bold ? "bold " : ""}`;
        ctx.font = `${style}${fontSize}px sans-serif`;
        ctx.fillStyle = fontColor;
        ctx.globalAlpha = opacity / 100;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const metrics = ctx.measureText(wmText);
        const textW = metrics.width;
        const textH = fontSize;
        const rad = (rotation * Math.PI) / 180;

        if (tile) {
          const spacingX = textW + 80;
          const spacingY = textH + 80;
          const diag = Math.sqrt(cw * cw + ch * ch);
          for (let y = -diag / 2; y < diag; y += spacingY) {
            for (let x = -diag / 2; x < diag; x += spacingX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(rad);
              ctx.fillText(wmText, 0, 0);
              ctx.restore();
            }
          }
        } else {
          const pos = getPositionCoords(position, cw, ch, textW, textH, margin);
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(rad);
          ctx.fillText(wmText, 0, 0);
          ctx.restore();
        }
      } else if (wmType === "image" && logoImg) {
        const scale = logoScale / 100;
        const lw = logoImg.width * scale * (cw / 500);
        const lh = logoImg.height * scale * (cw / 500);
        ctx.globalAlpha = logoOpacity / 100;

        if (tile) {
          const spacingX = lw + 60;
          const spacingY = lh + 60;
          for (let y = margin; y < ch; y += spacingY) {
            for (let x = margin; x < cw; x += spacingX) {
              ctx.drawImage(logoImg, x - lw / 2, y - lh / 2, lw, lh);
            }
          }
        } else {
          const pos = getPositionCoords(position, cw, ch, lw, lh, margin);
          ctx.drawImage(logoImg, pos.x - lw / 2, pos.y - lh / 2, lw, lh);
        }
      }

      ctx.globalAlpha = 1;
    },
    [wmType, wmText, fontSize, fontColor, opacity, rotation, bold, italic, logoImg, logoScale, logoOpacity, position, tile, margin]
  );

  // Live preview
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const currentFile = files[selectedIndex];
    if (!canvas || !currentFile) return;

    const ctx = canvas.getContext("2d")!;
    const img = currentFile.originalImg;

    // Scale to fit preview
    const maxW = 600;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw on a temp full-size canvas then scale down
    const temp = document.createElement("canvas");
    drawWatermark(temp, img);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
  }, [files, selectedIndex, drawWatermark]);

  const processAll = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const mime = outputFormat === "jpeg" ? "image/jpeg" : "image/png";
    const quality = outputFormat === "jpeg" ? jpgQuality / 100 : undefined;

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      const canvas = document.createElement("canvas");
      drawWatermark(canvas, item.originalImg);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mime, quality);
      });
      const url = URL.createObjectURL(blob);
      updated[i] = { ...item, resultBlob: blob, resultDataUrl: url, done: true };
      setFiles([...updated]);
    }

    setIsProcessing(false);
  }, [files, drawWatermark, outputFormat, jpgQuality]);

  const downloadFile = useCallback(
    (item: FileItem) => {
      if (!item.resultDataUrl) return;
      const ext = outputFormat === "jpeg" ? "jpg" : "png";
      const baseName = item.file.name.replace(/\.[^.]+$/, "");
      const a = document.createElement("a");
      a.href = item.resultDataUrl;
      a.download = `${baseName}_watermarked.${ext}`;
      a.click();
    },
    [outputFormat]
  );

  const downloadAll = useCallback(async () => {
    const doneFiles = files.filter((f) => f.done && f.resultBlob);
    if (doneFiles.length === 0) return;
    if (doneFiles.length === 1) {
      downloadFile(doneFiles[0]);
      return;
    }
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const ext = outputFormat === "jpeg" ? "jpg" : "png";
    for (const item of doneFiles) {
      if (item.resultBlob) {
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}_watermarked.${ext}`, item.resultBlob);
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "watermarked_images.zip";
    a.click();
  }, [files, outputFormat, downloadFile]);

  const doneCount = files.filter((f) => f.done).length;

  const positionLabels: Record<Position, string> = {
    tl: "↖", tc: "↑", tr: "↗",
    ml: "←", mc: "●", mr: "→",
    bl: "↙", bc: "↓", br: "↘",
  };

  const faqItems = isKo
    ? [
        { q: "워터마크를 넣으면 원본 사진이 변경되나요?", a: "아닙니다. 모든 처리는 브라우저에서 이루어지며 원본 파일은 변경되지 않습니다. 워터마크가 추가된 새 이미지가 별도로 생성됩니다." },
        { q: "투명 배경 로고(PNG)를 워터마크로 사용할 수 있나요?", a: "네, PNG 투명 배경 로고를 업로드하면 투명 부분이 그대로 유지되어 자연스러운 워터마크를 만들 수 있습니다." },
        { q: "타일 반복이란 무엇인가요?", a: "타일 반복을 활성화하면 워터마크가 이미지 전체에 대각선 패턴으로 반복 배치됩니다. 이미지 도용 방지에 효과적입니다." },
        { q: "서버에 사진이 업로드되나요?", a: "아닙니다. Canvas API를 사용하여 100% 브라우저에서 처리합니다. 사진이 외부 서버로 전송되지 않아 완전히 안전합니다." },
        { q: "여러 장에 동시에 워터마크를 넣을 수 있나요?", a: "네, 최대 20장까지 동시에 업로드하고 동일한 워터마크 설정으로 일괄 처리할 수 있습니다. ZIP으로 한꺼번에 다운로드도 가능합니다." },
      ]
    : [
        { q: "Does adding a watermark modify my original image?", a: "No. All processing happens in your browser and your original file remains unchanged. A new watermarked image is created separately." },
        { q: "Can I use a transparent PNG logo as a watermark?", a: "Yes, upload a PNG with a transparent background and the transparency will be preserved, creating a natural-looking watermark." },
        { q: "What is tile repeat?", a: "When tile repeat is enabled, the watermark is repeated across the entire image in a diagonal pattern. This is highly effective for preventing image theft." },
        { q: "Are my photos uploaded to a server?", a: "No. Everything is processed 100% in your browser using the Canvas API. Your photos never leave your device." },
        { q: "Can I watermark multiple images at once?", a: "Yes, you can upload up to 20 images and batch-process them with the same watermark settings. Download individually or as a ZIP." },
      ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 워터마크 추가" : "Image Watermark Tool"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="image-watermark" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
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
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} className="hidden" />
        </div>

        {/* Uploaded file thumbnails */}
        {files.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {files.map((item, i) => (
              <div
                key={item.id}
                className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-colors ${
                  i === selectedIndex ? "border-blue-500" : "border-neutral-200 dark:border-neutral-700"
                }`}
                onClick={() => setSelectedIndex(i)}
              >
                <img src={item.originalDataUrl} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                  className="absolute top-0 right-0 bg-black/60 text-white text-xs w-4 h-4 flex items-center justify-center rounded-bl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <p className="text-sm font-medium mb-2">{isKo ? "미리보기" : "Preview"}</p>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center min-h-[200px]">
                <canvas ref={previewCanvasRef} className="max-w-full h-auto" />
              </div>
              <p className="text-xs text-neutral-400 mt-1 text-center">
                {isKo ? "서버 업로드 없이 브라우저에서 안전하게 처리됩니다" : "Processed safely in your browser — no server upload"}
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-5">
              {/* Watermark type tabs */}
              <div className="flex border-b border-neutral-200 dark:border-neutral-700">
                {(["text", "image"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWmType(t)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      wmType === t
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    }`}
                  >
                    {t === "text"
                      ? isKo ? "텍스트 워터마크" : "Text Watermark"
                      : isKo ? "이미지 워터마크" : "Image Watermark"}
                  </button>
                ))}
              </div>

              {wmType === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">{isKo ? "텍스트" : "Text"}</label>
                    <input
                      type="text"
                      value={wmText}
                      onChange={(e) => setWmText(e.target.value)}
                      placeholder={isKo ? "예: © 회사명" : "e.g. © Company Name"}
                      className="w-full p-2.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">{isKo ? "크기" : "Size"}: {fontSize}px</label>
                      <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(+e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">{isKo ? "색상" : "Color"}</label>
                      <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-full h-9 rounded cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium block mb-1">{isKo ? "투명도" : "Opacity"}: {opacity}%</label>
                      <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full" />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">{isKo ? "회전" : "Rotation"}: {rotation}°</label>
                      <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(+e.target.value)} className="w-full" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBold(!bold)}
                      className={`px-3 py-1.5 rounded text-sm font-bold border transition-colors cursor-pointer ${
                        bold ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 dark:border-neutral-600"
                      }`}
                    >
                      B
                    </button>
                    <button
                      onClick={() => setItalic(!italic)}
                      className={`px-3 py-1.5 rounded text-sm italic border transition-colors cursor-pointer ${
                        italic ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 dark:border-neutral-600"
                      }`}
                    >
                      I
                    </button>
                  </div>
                </div>
              )}

              {wmType === "image" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">{isKo ? "로고 이미지" : "Logo Image"}</label>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full p-3 rounded-md border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-500 hover:border-neutral-400 transition-colors cursor-pointer text-center"
                    >
                      {logoDataUrl ? (
                        <img src={logoDataUrl} alt="Logo" className="h-12 mx-auto" />
                      ) : (
                        isKo ? "로고 이미지 업로드 (PNG 투명 배경 권장)" : "Upload logo image (transparent PNG recommended)"
                      )}
                    </button>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{isKo ? "크기" : "Size"}: {logoScale}%</label>
                    <input type="range" min={10} max={80} value={logoScale} onChange={(e) => setLogoScale(+e.target.value)} className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{isKo ? "투명도" : "Opacity"}: {logoOpacity}%</label>
                    <input type="range" min={0} max={100} value={logoOpacity} onChange={(e) => setLogoOpacity(+e.target.value)} className="w-full" />
                  </div>
                </div>
              )}

              {/* Common settings */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                {/* Position grid */}
                <div>
                  <label className="text-sm font-medium block mb-2">{isKo ? "위치" : "Position"}</label>
                  <div className="inline-grid grid-cols-3 gap-1">
                    {(["tl", "tc", "tr", "ml", "mc", "mr", "bl", "bc", "br"] as Position[]).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`w-9 h-9 rounded text-sm font-medium transition-colors cursor-pointer ${
                          position === pos
                            ? "bg-blue-600 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {positionLabels[pos]}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={tile} onChange={(e) => setTile(e.target.checked)} className="rounded" />
                  <span className="font-medium">{isKo ? "타일 반복 (전체 이미지에 반복 배치)" : "Tile repeat (cover entire image)"}</span>
                </label>

                <div>
                  <label className="text-sm font-medium block mb-1">{isKo ? "여백" : "Margin"}: {margin}px</label>
                  <input type="range" min={0} max={200} value={margin} onChange={(e) => setMargin(+e.target.value)} className="w-full" />
                </div>

                {/* Output format */}
                <div>
                  <label className="text-sm font-medium block mb-2">{isKo ? "출력 형식" : "Output Format"}</label>
                  <div className="flex gap-2">
                    {(["png", "jpeg"] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                          outputFormat === fmt
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-neutral-300 dark:border-neutral-600 hover:border-blue-400"
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {outputFormat === "jpeg" && (
                    <div className="mt-2">
                      <label className="text-xs text-neutral-500">{isKo ? "JPG 품질" : "JPG Quality"}: {jpgQuality}%</label>
                      <input type="range" min={10} max={100} value={jpgQuality} onChange={(e) => setJpgQuality(+e.target.value)} className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process button */}
        {files.length > 0 && (
          <button
            onClick={processAll}
            disabled={isProcessing}
            className={`w-full px-5 py-3 rounded-md font-medium text-white transition-colors cursor-pointer ${
              isProcessing ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing
              ? isKo ? "처리 중..." : "Processing..."
              : isKo ? `${files.length}개 파일에 워터마크 적용` : `Apply watermark to ${files.length} file(s)`}
          </button>
        )}

        {/* Results */}
        {doneCount > 0 && (
          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold">{isKo ? "결과" : "Results"}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {files.filter((f) => f.done).map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
                  {item.resultDataUrl && (
                    <img src={item.resultDataUrl} alt="Result" className="w-full rounded border border-neutral-200 dark:border-neutral-700 mb-2" />
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm truncate flex-1 mr-2">{item.file.name}</p>
                    <button
                      onClick={() => downloadFile(item)}
                      className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer shrink-0"
                    >
                      {isKo ? "다운로드" : "Download"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
                "이미지를 드래그하거나 클릭하여 업로드하세요 (최대 20개).",
                "텍스트 또는 이미지 워터마크 탭을 선택하세요.",
                "워터마크 텍스트(또는 로고), 크기, 색상, 투명도 등을 설정하세요.",
                "위치를 선택하거나 타일 반복을 활성화하세요.",
                "미리보기를 확인하고 적용 버튼을 클릭하세요.",
                "개별 또는 ZIP으로 다운로드하세요.",
              ]
            : [
                "Upload images by dragging or clicking the upload area (up to 20 files).",
                "Select the Text or Image watermark tab.",
                "Set your watermark text (or logo), size, color, and opacity.",
                "Choose a position or enable tile repeat.",
                "Check the preview and click Apply.",
                "Download individually or as a ZIP.",
              ]
          ).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      {/* What is a watermark */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "워터마크란?" : "What Is a Watermark?"}
        </h2>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-3">
          {isKo ? (
            <>
              <p>워터마크는 이미지 위에 반투명하게 표시되는 텍스트나 로고입니다. 저작권 보호, 무단 사용 방지, 브랜드 인지도 향상 등 다양한 목적으로 사용됩니다.</p>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-4 mt-4">
                <p className="font-medium text-foreground mb-2">주요 사용 사례</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>상품 이미지 보호</strong> — 쇼핑몰, 마켓플레이스 사진 도용 방지</li>
                  <li><strong>기밀 문서 표시</strong> — "CONFIDENTIAL", "DRAFT" 등 상태 표시</li>
                  <li><strong>포트폴리오 보호</strong> — 사진가, 디자이너 작품 보호</li>
                  <li><strong>브랜드 홍보</strong> — SNS 공유 이미지에 로고 삽입</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>A watermark is semi-transparent text or logo overlaid on an image. It serves various purposes including copyright protection, preventing unauthorized use, and brand recognition.</p>
              <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 p-4 mt-4">
                <p className="font-medium text-foreground mb-2">Common use cases</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Product image protection</strong> — prevent photo theft on e-commerce sites</li>
                  <li><strong>Confidential documents</strong> — mark drafts, samples, or confidential files</li>
                  <li><strong>Portfolio protection</strong> — protect photographers&apos; and designers&apos; work</li>
                  <li><strong>Brand promotion</strong> — add logos to social media images</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Text vs Image comparison */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-4">
          {isKo ? "텍스트 vs 이미지 워터마크 비교" : "Text vs Image Watermark"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left p-3 font-medium">{isKo ? "항목" : "Feature"}</th>
                <th className="text-left p-3 font-medium">{isKo ? "텍스트" : "Text"}</th>
                <th className="text-left p-3 font-medium">{isKo ? "이미지(로고)" : "Image (Logo)"}</th>
              </tr>
            </thead>
            <tbody className="text-neutral-600 dark:text-neutral-400">
              {(isKo
                ? [
                    ["준비물", "없음 (바로 입력)", "로고 이미지 파일"],
                    ["커스터마이징", "크기, 색상, 회전, 스타일", "크기, 투명도"],
                    ["브랜드 효과", "보통", "높음 (로고 인지)"],
                    ["가독성", "높음", "디자인에 따라 다름"],
                    ["추천 용도", "기밀 표시, 간단한 보호", "브랜드 홍보, 전문적 보호"],
                  ]
                : [
                    ["Preparation", "None (type directly)", "Logo image file"],
                    ["Customization", "Size, color, rotation, style", "Size, opacity"],
                    ["Brand impact", "Moderate", "High (logo recognition)"],
                    ["Readability", "High", "Depends on design"],
                    ["Best for", "Confidential marks, quick protection", "Brand promotion, professional use"],
                  ]
              ).map((row, i) => (
                <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="p-3 font-medium text-foreground">{row[0]}</td>
                  <td className="p-3">{row[1]}</td>
                  <td className="p-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                name: isKo ? "이미지 워터마크 추가" : "Image Watermark Tool",
                description,
                url: `https://www.quickfigure.net/${lang}/tools/image-watermark`,
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

      <ToolHowItWorks slug="image-watermark" locale={locale} />
      <ToolDisclaimer slug="image-watermark" locale={locale} />

      <ShareButtons title={title} description={description} lang={lang} slug="image-watermark" labels={dict.share} />
      <EmbedCodeButton slug="image-watermark" lang={lang} labels={dict.embed} />

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
