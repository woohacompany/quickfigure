"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AspectPreset {
  label: string;
  labelKo: string;
  ratio: number | null; // null = free
  fixedW?: number;
  fixedH?: number;
}

const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Free", labelKo: "자유", ratio: null },
  { label: "1:1", labelKo: "1:1 (정사각형)", ratio: 1 },
  { label: "4:3", labelKo: "4:3", ratio: 4 / 3 },
  { label: "16:9", labelKo: "16:9", ratio: 16 / 9 },
  { label: "3:2", labelKo: "3:2", ratio: 3 / 2 },
  { label: "2:3", labelKo: "2:3 (세로)", ratio: 2 / 3 },
];

const SOCIAL_PRESETS: AspectPreset[] = [
  { label: "Instagram (1:1)", labelKo: "인스타그램 (1:1)", ratio: 1 },
  { label: "FB Cover (820×312)", labelKo: "페이스북 커버 (820×312)", ratio: 820 / 312, fixedW: 820, fixedH: 312 },
  { label: "YouTube (1280×720)", labelKo: "유튜브 썸네일 (1280×720)", ratio: 1280 / 720, fixedW: 1280, fixedH: 720 },
  { label: "KakaoTalk (640×640)", labelKo: "카카오톡 프로필 (640×640)", ratio: 1, fixedW: 640, fixedH: 640 },
];

const ID_PHOTO_PRESETS: AspectPreset[] = [
  { label: "Passport (35×45mm)", labelKo: "여권 (35×45mm)", ratio: 35 / 45 },
  { label: "ID Photo (3×4cm)", labelKo: "반명함 (3×4cm)", ratio: 3 / 4 },
];

type DragHandle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e" | null;

export default function ImageCropperPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("image-cropper");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [originalFileName, setOriginalFileName] = useState("");

  // Display dimensions (scaled to fit container)
  const [displayW, setDisplayW] = useState(0);
  const [displayH, setDisplayH] = useState(0);
  const [scaleRatio, setScaleRatio] = useState(1);

  // Crop rect in display coordinates
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>(ASPECT_PRESETS[0]);

  // Transform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Output
  const [outputFormat, setOutputFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [jpgQuality, setJpgQuality] = useState(90);

  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [resultFileSize, setResultFileSize] = useState(0);
  const [resultW, setResultW] = useState(0);
  const [resultH, setResultH] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropAtDragStart, setCropAtDragStart] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });

  // For creating new crop via drag on overlay
  const [isCreatingCrop, setIsCreatingCrop] = useState(false);

  const title = isKo
    ? "이미지 자르기 - 사진 크롭, 비율 맞추기, 증명사진 자르기 | QuickFigure"
    : "Image Cropper - Crop Photos Online Free | QuickFigure";
  const description = isKo
    ? "이미지를 원하는 크기로 자르세요. 인스타그램, 유튜브, 증명사진 비율 프리셋 제공. 회전, 반전까지. 설치 없이 무료."
    : "Crop images to any size online for free. Aspect ratio presets for Instagram, YouTube, passport photos. Rotate and flip included.";

  // Compute display dimensions when image loads
  const computeDisplay = useCallback((img: HTMLImageElement) => {
    const maxW = Math.min(700, window.innerWidth - 48);
    const maxH = 500;
    let w = img.width;
    let h = img.height;
    const ratio = Math.min(maxW / w, maxH / h, 1);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
    setDisplayW(w);
    setDisplayH(h);
    setScaleRatio(ratio);
    // Default crop: full image
    setCrop({ x: 0, y: 0, w, h });
  }, []);

  const processImage = useCallback((file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      alert(isKo ? "파일 크기가 20MB를 초과합니다." : "File size exceeds 20MB limit.");
      return;
    }
    setResultDataUrl(null);
    setResultFileSize(0);
    setOriginalFileSize(file.size);
    setOriginalFileName(file.name);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspectPreset(ASPECT_PRESETS[0]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalDataUrl(dataUrl);
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        computeDisplay(img);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [isKo, computeDisplay]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) processImage(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) processImage(file);
    },
    [processImage]
  );

  // Clamp crop to display bounds and enforce aspect ratio
  const clampCrop = useCallback(
    (c: CropRect, ratio: number | null): CropRect => {
      let { x, y, w, h } = c;
      w = Math.max(10, Math.min(w, displayW));
      h = Math.max(10, Math.min(h, displayH));
      if (ratio !== null) {
        // Adjust height to match ratio
        h = Math.round(w / ratio);
        if (h > displayH) {
          h = displayH;
          w = Math.round(h * ratio);
        }
        if (h < 10) { h = 10; w = Math.round(10 * ratio); }
      }
      x = Math.max(0, Math.min(x, displayW - w));
      y = Math.max(0, Math.min(y, displayH - h));
      return { x, y, w, h };
    },
    [displayW, displayH]
  );

  // Apply aspect preset
  const applyAspectPreset = useCallback(
    (preset: AspectPreset) => {
      setAspectPreset(preset);
      if (preset.ratio !== null) {
        setCrop((prev) => {
          const centerX = prev.x + prev.w / 2;
          const centerY = prev.y + prev.h / 2;
          let newW = prev.w;
          let newH = Math.round(newW / preset.ratio!);
          if (newH > displayH) {
            newH = displayH;
            newW = Math.round(newH * preset.ratio!);
          }
          if (newW > displayW) {
            newW = displayW;
            newH = Math.round(newW / preset.ratio!);
          }
          const newX = Math.max(0, Math.min(Math.round(centerX - newW / 2), displayW - newW));
          const newY = Math.max(0, Math.min(Math.round(centerY - newH / 2), displayH - newH));
          return { x: newX, y: newY, w: newW, h: newH };
        });
      }
    },
    [displayW, displayH]
  );

  // Rotation: rotate in 90-degree steps
  const rotateBy = useCallback((deg: number) => {
    setRotation((prev) => {
      let next = prev + deg;
      if (next > 180) next -= 360;
      if (next <= -180) next += 360;
      return next;
    });
  }, []);

  // Crop the image
  const cropImage = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    // Convert display crop to actual image coordinates
    const sx = crop.x / scaleRatio;
    const sy = crop.y / scaleRatio;
    const sw = crop.w / scaleRatio;
    const sh = crop.h / scaleRatio;

    // Determine output dimensions (account for rotation)
    const isRotated90 = Math.abs(rotation) === 90;
    const outW = isRotated90 ? Math.round(sh) : Math.round(sw);
    const outH = isRotated90 ? Math.round(sw) : Math.round(sh);

    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);
    if (flipV) ctx.scale(1, -1);
    ctx.drawImage(
      originalImage,
      sx, sy, sw, sh,
      -Math.round(sw) / 2, -Math.round(sh) / 2, Math.round(sw), Math.round(sh)
    );
    ctx.restore();

    setResultW(outW);
    setResultH(outH);

    const qualityValue = outputFormat === "image/png" ? undefined : (outputFormat === "image/jpeg" ? jpgQuality / 100 : 0.9);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setResultFileSize(blob.size);
        setResultDataUrl(URL.createObjectURL(blob));
      },
      outputFormat,
      qualityValue
    );
  }, [originalImage, crop, scaleRatio, rotation, flipH, flipV, outputFormat, jpgQuality]);

  const download = useCallback(() => {
    if (!resultDataUrl) return;
    const ext = outputFormat === "image/jpeg" ? "jpg" : outputFormat === "image/png" ? "png" : "webp";
    const baseName = originalFileName.replace(/\.[^.]+$/, "");
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `${baseName}_cropped.${ext}`;
    a.click();
  }, [resultDataUrl, outputFormat, originalFileName]);

  // ====== Drag handlers for crop region ======

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };

  const getHandle = (clientX: number, clientY: number): DragHandle => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const cx = crop.x;
    const cy = crop.y;
    const cw = crop.w;
    const ch = crop.h;
    const handleSize = 14;

    // Corners
    if (Math.abs(mx - cx) < handleSize && Math.abs(my - cy) < handleSize) return "nw";
    if (Math.abs(mx - (cx + cw)) < handleSize && Math.abs(my - cy) < handleSize) return "ne";
    if (Math.abs(mx - cx) < handleSize && Math.abs(my - (cy + ch)) < handleSize) return "sw";
    if (Math.abs(mx - (cx + cw)) < handleSize && Math.abs(my - (cy + ch)) < handleSize) return "se";

    // Edges
    if (mx > cx + handleSize && mx < cx + cw - handleSize && Math.abs(my - cy) < handleSize) return "n";
    if (mx > cx + handleSize && mx < cx + cw - handleSize && Math.abs(my - (cy + ch)) < handleSize) return "s";
    if (my > cy + handleSize && my < cy + ch - handleSize && Math.abs(mx - cx) < handleSize) return "w";
    if (my > cy + handleSize && my < cy + ch - handleSize && Math.abs(mx - (cx + cw)) < handleSize) return "e";

    // Inside = move
    if (mx > cx && mx < cx + cw && my > cy && my < cy + ch) return "move";

    return null;
  };

  const handlePointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!overlayRef.current) return;
      const pos = getClientPos(e);
      const handle = getHandle(pos.x, pos.y);

      if (handle) {
        e.preventDefault();
        setDragHandle(handle);
        setDragStart(pos);
        setCropAtDragStart({ ...crop });
      } else {
        // Start creating new crop
        const rect = overlayRef.current.getBoundingClientRect();
        const mx = pos.x - rect.left;
        const my = pos.y - rect.top;
        if (mx >= 0 && mx <= displayW && my >= 0 && my <= displayH) {
          e.preventDefault();
          setIsCreatingCrop(true);
          setDragStart(pos);
          setCrop({ x: mx, y: my, w: 0, h: 0 });
        }
      }
    },
    [crop, displayW, displayH]
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!overlayRef.current) return;
      const pos = getClientPos(e);

      if (isCreatingCrop) {
        e.preventDefault();
        const rect = overlayRef.current.getBoundingClientRect();
        const mx = Math.max(0, Math.min(pos.x - rect.left, displayW));
        const my = Math.max(0, Math.min(pos.y - rect.top, displayH));
        const startRect = overlayRef.current.getBoundingClientRect();
        const sx = Math.max(0, Math.min(dragStart.x - startRect.left, displayW));
        const sy = Math.max(0, Math.min(dragStart.y - startRect.top, displayH));

        let newX = Math.min(sx, mx);
        let newY = Math.min(sy, my);
        let newW = Math.abs(mx - sx);
        let newH = Math.abs(my - sy);

        if (aspectPreset.ratio !== null) {
          newH = Math.round(newW / aspectPreset.ratio);
          if (newY + newH > displayH) {
            newH = displayH - newY;
            newW = Math.round(newH * aspectPreset.ratio);
          }
        }

        setCrop({ x: newX, y: newY, w: Math.max(10, newW), h: Math.max(10, newH) });
        return;
      }

      if (!dragHandle) return;
      e.preventDefault();

      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;
      const c = cropAtDragStart;
      const ratio = aspectPreset.ratio;

      let newCrop: CropRect;

      if (dragHandle === "move") {
        newCrop = { x: c.x + dx, y: c.y + dy, w: c.w, h: c.h };
      } else if (dragHandle === "se") {
        let nw = Math.max(10, c.w + dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : Math.max(10, c.h + dy);
        newCrop = { x: c.x, y: c.y, w: nw, h: nh };
      } else if (dragHandle === "sw") {
        let nw = Math.max(10, c.w - dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : Math.max(10, c.h + dy);
        newCrop = { x: c.x + c.w - nw, y: c.y, w: nw, h: nh };
      } else if (dragHandle === "ne") {
        let nw = Math.max(10, c.w + dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : Math.max(10, c.h - dy);
        newCrop = { x: c.x, y: ratio !== null ? c.y + c.h - nh : c.y + c.h - nh, w: nw, h: nh };
      } else if (dragHandle === "nw") {
        let nw = Math.max(10, c.w - dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : Math.max(10, c.h - dy);
        newCrop = { x: c.x + c.w - nw, y: c.y + c.h - nh, w: nw, h: nh };
      } else if (dragHandle === "n") {
        let nh = Math.max(10, c.h - dy);
        let nw = ratio !== null ? Math.round(nh * ratio) : c.w;
        newCrop = { x: ratio !== null ? c.x + (c.w - nw) / 2 : c.x, y: c.y + c.h - nh, w: nw, h: nh };
      } else if (dragHandle === "s") {
        let nh = Math.max(10, c.h + dy);
        let nw = ratio !== null ? Math.round(nh * ratio) : c.w;
        newCrop = { x: ratio !== null ? c.x + (c.w - nw) / 2 : c.x, y: c.y, w: nw, h: nh };
      } else if (dragHandle === "w") {
        let nw = Math.max(10, c.w - dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : c.h;
        newCrop = { x: c.x + c.w - nw, y: ratio !== null ? c.y + (c.h - nh) / 2 : c.y, w: nw, h: nh };
      } else if (dragHandle === "e") {
        let nw = Math.max(10, c.w + dx);
        let nh = ratio !== null ? Math.round(nw / ratio) : c.h;
        newCrop = { x: c.x, y: ratio !== null ? c.y + (c.h - nh) / 2 : c.y, w: nw, h: nh };
      } else {
        return;
      }

      setCrop(clampCrop(newCrop, null));
    },
    [dragHandle, dragStart, cropAtDragStart, aspectPreset, isCreatingCrop, displayW, displayH, clampCrop]
  );

  const handlePointerUp = useCallback(() => {
    setDragHandle(null);
    setIsCreatingCrop(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!originalImage) return;
      if (e.key === "Enter") { e.preventDefault(); cropImage(); }
      if (e.key === "Escape") { e.preventDefault(); setCrop({ x: 0, y: 0, w: displayW, h: displayH }); }
      if (e.key === "r" || e.key === "R") { e.preventDefault(); rotateBy(90); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [originalImage, cropImage, displayW, displayH, rotateBy]);

  // Manual crop input
  const setCropField = useCallback(
    (field: keyof CropRect, value: number) => {
      setCrop((prev) => {
        const actual = { ...prev, [field]: value };
        return clampCrop(actual, aspectPreset.ratio);
      });
    },
    [clampCrop, aspectPreset]
  );

  // Actual crop dimensions in original image pixels
  const actualCropW = Math.round(crop.w / scaleRatio);
  const actualCropH = Math.round(crop.h / scaleRatio);

  const handleCursorStyle = (e: React.MouseEvent) => {
    if (!overlayRef.current) return;
    const handle = getHandle(e.clientX, e.clientY);
    const el = overlayRef.current;
    if (handle === "nw" || handle === "se") el.style.cursor = "nwse-resize";
    else if (handle === "ne" || handle === "sw") el.style.cursor = "nesw-resize";
    else if (handle === "n" || handle === "s") el.style.cursor = "ns-resize";
    else if (handle === "w" || handle === "e") el.style.cursor = "ew-resize";
    else if (handle === "move") el.style.cursor = "move";
    else el.style.cursor = "crosshair";
  };

  const faqItems = isKo
    ? [
        { q: "이미지 자르기가 안전한가요?", a: "네, 완전히 안전합니다. 모든 이미지 처리는 브라우저 내에서 로컬로 수행되며, 이미지가 서버에 업로드되지 않습니다." },
        { q: "증명사진 비율로 자를 수 있나요?", a: "네, 여권(35×45mm), 반명함(3×4cm) 프리셋이 제공됩니다. 해당 비율을 선택하고 원하는 영역을 지정하면 됩니다." },
        { q: "인스타그램 비율은 어떻게 맞추나요?", a: "소셜미디어 프리셋에서 '인스타그램 (1:1)'을 선택하면 자동으로 정사각형 비율이 적용됩니다." },
        { q: "자른 이미지의 품질이 떨어지나요?", a: "PNG 형식으로 저장하면 무손실이므로 품질 저하가 없습니다. JPEG의 경우 품질 슬라이더로 90% 이상을 선택하면 거의 차이를 느끼기 어렵습니다." },
        { q: "회전과 자르기를 동시에 할 수 있나요?", a: "네, 이미지를 회전하거나 반전한 후 크롭 영역을 지정하고 자르기를 적용하면 회전+자르기가 동시에 처리됩니다." },
      ]
    : [
        { q: "Is it safe to crop images here?", a: "Yes, completely safe. All image processing happens locally in your browser. Your images are never uploaded to any server." },
        { q: "Can I crop to passport photo dimensions?", a: "Yes, passport (35×45mm) and ID photo (3×4cm) presets are provided. Select the ratio and drag to choose the area." },
        { q: "How do I crop for Instagram?", a: "Select 'Instagram (1:1)' from the social media presets to automatically apply a square aspect ratio." },
        { q: "Does cropping reduce image quality?", a: "Saving as PNG is lossless with no quality loss. For JPEG, setting quality to 90% or above produces virtually identical results." },
        { q: "Can I rotate and crop at the same time?", a: "Yes, rotate or flip the image first, then select your crop area and apply. Both transforms are processed together." },
      ];

  const howToUseSteps = isKo
    ? [
        "이미지를 드래그하거나 클릭하여 업로드하세요. (JPG, PNG, WebP, GIF, BMP / 최대 20MB)",
        "원하는 비율 프리셋을 선택하거나, 자유 크롭으로 드래그하여 영역을 지정하세요.",
        "필요하면 회전이나 반전을 적용하세요.",
        "출력 형식을 선택하고 \"자르기\" 버튼을 클릭하세요. (단축키: Enter)",
        "결과를 확인하고 다운로드 버튼을 클릭하세요.",
      ]
    : [
        "Upload an image by dragging or clicking. (JPG, PNG, WebP, GIF, BMP / max 20MB)",
        "Select an aspect ratio preset or drag freely to define the crop area.",
        "Optionally rotate or flip the image.",
        "Choose the output format and click \"Crop\". (Shortcut: Enter)",
        "Review the result and click Download.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "이미지 자르기" : "Image Cropper"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{description}</p>

        <ToolAbout slug="image-cropper" locale={locale} />
      </header>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 space-y-6">
        {/* Upload Area */}
        {!originalImage && (
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
            <div className="text-4xl mb-2">📤</div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {isKo ? "이미지를 드래그하거나 클릭하여 업로드" : "Drag & drop image or click to upload"}
            </p>
            <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP, GIF, BMP · {isKo ? "최대" : "Max"} 20MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Image Crop Area */}
        {originalImage && originalDataUrl && (
          <>
            {/* Change Image */}
            <div className="flex justify-between items-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isKo ? "원본" : "Original"}: {originalImage.width} × {originalImage.height}px · {formatBytes(originalFileSize)}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {isKo ? "다른 이미지 선택" : "Choose another image"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Crop Canvas */}
            <div
              ref={containerRef}
              className="relative mx-auto select-none"
              style={{ width: displayW, height: displayH }}
            >
              {/* Image */}
              <img
                src={originalDataUrl}
                alt="Original"
                className="absolute inset-0 pointer-events-none"
                style={{
                  width: displayW,
                  height: displayH,
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                }}
                draggable={false}
              />

              {/* Overlay */}
              <div
                ref={overlayRef}
                className="absolute inset-0 z-10"
                style={{ width: displayW, height: displayH }}
                onMouseDown={handlePointerDown}
                onMouseMove={(e) => { handlePointerMove(e); if (!dragHandle && !isCreatingCrop) handleCursorStyle(e); }}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              >
                {/* Dark overlay outside crop */}
                {/* Top */}
                <div className="absolute bg-black/50" style={{ top: 0, left: 0, width: displayW, height: crop.y }} />
                {/* Bottom */}
                <div className="absolute bg-black/50" style={{ top: crop.y + crop.h, left: 0, width: displayW, height: displayH - crop.y - crop.h }} />
                {/* Left */}
                <div className="absolute bg-black/50" style={{ top: crop.y, left: 0, width: crop.x, height: crop.h }} />
                {/* Right */}
                <div className="absolute bg-black/50" style={{ top: crop.y, left: crop.x + crop.w, width: displayW - crop.x - crop.w, height: crop.h }} />

                {/* Crop border */}
                <div
                  className="absolute border-2 border-white"
                  style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
                >
                  {/* Rule of thirds grid */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute border-b border-white/30" style={{ top: "33.33%", width: "100%" }} />
                    <div className="absolute border-b border-white/30" style={{ top: "66.66%", width: "100%" }} />
                    <div className="absolute border-r border-white/30" style={{ left: "33.33%", height: "100%" }} />
                    <div className="absolute border-r border-white/30" style={{ left: "66.66%", height: "100%" }} />
                  </div>

                  {/* Corner handles */}
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => {
                    const pos: Record<string, string> = {};
                    if (corner.includes("n")) pos.top = "-4px";
                    if (corner.includes("s")) pos.bottom = "-4px";
                    if (corner.includes("w")) pos.left = "-4px";
                    if (corner.includes("e")) pos.right = "-4px";
                    return (
                      <div
                        key={corner}
                        className="absolute w-3 h-3 bg-white border border-neutral-400 rounded-sm"
                        style={pos}
                      />
                    );
                  })}

                  {/* Edge handles */}
                  <div className="absolute w-6 h-1.5 bg-white border border-neutral-400 rounded-sm" style={{ top: "-3px", left: "50%", transform: "translateX(-50%)" }} />
                  <div className="absolute w-6 h-1.5 bg-white border border-neutral-400 rounded-sm" style={{ bottom: "-3px", left: "50%", transform: "translateX(-50%)" }} />
                  <div className="absolute w-1.5 h-6 bg-white border border-neutral-400 rounded-sm" style={{ left: "-3px", top: "50%", transform: "translateY(-50%)" }} />
                  <div className="absolute w-1.5 h-6 bg-white border border-neutral-400 rounded-sm" style={{ right: "-3px", top: "50%", transform: "translateY(-50%)" }} />

                  {/* Crop size label */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                    {actualCropW} × {actualCropH}px
                  </div>
                </div>
              </div>
            </div>

            {/* Aspect Ratio Presets */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "비율 프리셋" : "Aspect Ratio"}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ASPECT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyAspectPreset(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      aspectPreset.label === p.label
                        ? "bg-foreground text-background border-foreground"
                        : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isKo ? p.labelKo : p.label}
                  </button>
                ))}
              </div>

              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5 mt-3">
                {isKo ? "소셜미디어" : "Social Media"}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SOCIAL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyAspectPreset(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      aspectPreset.label === p.label
                        ? "bg-foreground text-background border-foreground"
                        : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isKo ? p.labelKo : p.label}
                  </button>
                ))}
              </div>

              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1.5 mt-3">
                {isKo ? "증명사진" : "ID Photo"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ID_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyAspectPreset(p)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      aspectPreset.label === p.label
                        ? "bg-foreground text-background border-foreground"
                        : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isKo ? p.labelKo : p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Crop Input */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "크롭 영역 (px)" : "Crop Area (px)"}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["x", "y", "w", "h"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-neutral-500 block mb-1">
                      {field === "x" ? "X" : field === "y" ? "Y" : field === "w" ? (isKo ? "너비" : "Width") : (isKo ? "높이" : "Height")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={Math.round(crop[field] / scaleRatio)}
                      onChange={(e) => setCropField(field, parseInt(e.target.value || "0") * scaleRatio)}
                      className="w-full p-2 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "회전" : "Rotation"}: {rotation}°
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => rotateBy(-90)} className="px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  ↺ -90°
                </button>
                <button onClick={() => rotateBy(90)} className="px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  ↻ +90°
                </button>
                <button onClick={() => setRotation(0)} className="px-3 py-1.5 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  {isKo ? "초기화" : "Reset"}
                </button>
              </div>
            </div>

            {/* Flip */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "반전" : "Flip"}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlipH((v) => !v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                    flipH
                      ? "bg-foreground text-background border-foreground"
                      : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  ↔ {isKo ? "좌우 반전" : "Horizontal"}
                </button>
                <button
                  onClick={() => setFlipV((v) => !v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                    flipV
                      ? "bg-foreground text-background border-foreground"
                      : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  ↕ {isKo ? "상하 반전" : "Vertical"}
                </button>
              </div>
            </div>

            {/* Output Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "출력 형식" : "Output Format"}
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as typeof outputFormat)}
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image/png">PNG ({isKo ? "무손실" : "Lossless"})</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
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
                    className="w-full accent-blue-600 mt-2"
                  />
                </div>
              )}
            </div>

            {/* Crop Button */}
            <button
              onClick={cropImage}
              className="w-full px-5 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {isKo ? "자르기" : "Crop Image"} <span className="text-xs opacity-70">(Enter)</span>
            </button>

            {/* Shortcut hint */}
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
              {isKo
                ? "단축키: Enter(자르기) · Esc(영역 초기화) · R(90° 회전)"
                : "Shortcuts: Enter (crop) · Esc (reset area) · R (rotate 90°)"}
            </p>
          </>
        )}

        {/* Result */}
        {resultDataUrl && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                {isKo ? "결과 이미지" : "Cropped Image"}
              </label>
              <div className="rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50 dark:bg-neutral-800">
                <img src={resultDataUrl} alt="Cropped" className="max-w-full max-h-80 mx-auto object-contain" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{resultW} × {resultH}px</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "결과 크기" : "Result Size"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold">{formatBytes(originalFileSize)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "원본" : "Original"}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-center">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatBytes(resultFileSize)}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{isKo ? "결과" : "Result"}</p>
              </div>
            </div>

            <button
              onClick={download}
              className="w-full px-5 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
            >
              {isKo ? "다운로드" : "Download Cropped Image"}
            </button>
          </div>
        )}

        {/* Privacy */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          {isKo
            ? "이미지는 로컬에서 처리되며 서버에 업로드되지 않습니다."
            : "Your images are processed locally and never uploaded to any server."}
        </p>
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
          {isKo ? "이미지 자르기란?" : "What is Image Cropping?"}
        </h2>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-neutral-600 dark:text-neutral-400 space-y-3">
          <p>
            {isKo
              ? "이미지 자르기(크롭)는 사진에서 원하는 부분만 선택하여 나머지를 잘라내는 작업입니다. 구도를 개선하거나, 특정 플랫폼에 맞는 비율로 조정하거나, 불필요한 배경을 제거하는 데 사용됩니다."
              : "Image cropping is the process of selecting a desired portion of a photo and removing the rest. It's used to improve composition, adjust to platform-specific aspect ratios, or remove unwanted backgrounds."}
          </p>
          <h3 className="text-base font-semibold text-foreground">
            {isKo ? "비율별 용도" : "Common Aspect Ratios"}
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>{isKo ? "1:1 — 인스타그램 피드, 프로필 사진, 카카오톡 프로필" : "1:1 — Instagram feed, profile photos, KakaoTalk profile"}</li>
            <li>{isKo ? "16:9 — 유튜브 썸네일, 프레젠테이션, 와이드스크린" : "16:9 — YouTube thumbnails, presentations, widescreen"}</li>
            <li>{isKo ? "4:3 — 일반 사진, 문서, 웹 이미지" : "4:3 — Standard photos, documents, web images"}</li>
            <li>{isKo ? "3:2 — DSLR 사진, 인쇄용 (4×6인치)" : "3:2 — DSLR photos, print (4×6 inches)"}</li>
            <li>{isKo ? "35×45mm — 여권 사진 (국제 표준)" : "35×45mm — Passport photo (international standard)"}</li>
            <li>{isKo ? "3×4cm — 반명함 사진 (한국 표준)" : "3×4cm — ID photo (Korean standard)"}</li>
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
            name: isKo ? "이미지 자르기" : "Image Cropper",
            description,
            url: `https://www.quickfigure.net/${lang}/tools/image-cropper`,
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

      <ToolHowItWorks slug="image-cropper" locale={locale} />
      <ToolDisclaimer slug="image-cropper" locale={locale} />

      <ShareButtons
        title={isKo ? "이미지 자르기" : "Image Cropper"}
        description={description}
        lang={lang}
        slug="image-cropper"
        labels={dict.share}
      />
      <EmbedCodeButton slug="image-cropper" lang={lang} labels={dict.embed} />

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
