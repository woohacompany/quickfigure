"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import { getPostsByTool } from "@/lib/blog";
import { ToolAbout, ToolHowItWorks, ToolDisclaimer } from "@/components/ToolContentSections";
import { use } from "react";
import ShareButtons from "@/components/ShareButtons";
import EmbedCodeButton from "@/components/EmbedCodeButton";

interface FrameImage {
  id: string;
  file: File;
  dataUrl: string;
  img: HTMLImageElement;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ── Minimal GIF Encoder (LZW + GIF89a) ──
function encodeGIF(
  frames: ImageData[],
  width: number,
  height: number,
  delayCs: number,
  loopCount: number
): Uint8Array {
  const buf: number[] = [];

  // Quantize all frames to 256-color palette using median-cut-like approach
  const quantized = frames.map((f) => quantizeFrame(f, width, height));

  // GIF Header
  writeStr(buf, "GIF89a");
  // Logical screen descriptor
  writeU16(buf, width);
  writeU16(buf, height);
  // Use global color table from first frame
  const gct = quantized[0].palette;
  buf.push(0xf7); // GCT flag, 8bpp (256 colors)
  buf.push(0); // bg color index
  buf.push(0); // pixel aspect ratio

  // Global Color Table (256 * 3 bytes)
  for (let i = 0; i < 256; i++) {
    buf.push(gct[i * 3] ?? 0);
    buf.push(gct[i * 3 + 1] ?? 0);
    buf.push(gct[i * 3 + 2] ?? 0);
  }

  // Netscape extension for looping
  buf.push(0x21, 0xff, 0x0b);
  writeStr(buf, "NETSCAPE2.0");
  buf.push(0x03, 0x01);
  writeU16(buf, loopCount === -1 ? 0 : loopCount); // 0 = infinite
  buf.push(0x00);

  // Write each frame
  for (let fi = 0; fi < quantized.length; fi++) {
    const q = quantized[fi];

    // Graphic control extension
    buf.push(0x21, 0xf9, 0x04);
    buf.push(0x04); // dispose: restore to bg, no transparency
    writeU16(buf, delayCs);
    buf.push(0x00); // transparent color index (unused)
    buf.push(0x00);

    if (fi === 0) {
      // First frame: use global color table, write as image descriptor without local table
      buf.push(0x2c); // Image separator
      writeU16(buf, 0); // left
      writeU16(buf, 0); // top
      writeU16(buf, width);
      writeU16(buf, height);
      buf.push(0x00); // no local color table

      // LZW compress
      lzwEncode(buf, q.indices, 8);
    } else {
      // Subsequent frames: use local color table
      buf.push(0x2c);
      writeU16(buf, 0);
      writeU16(buf, 0);
      writeU16(buf, width);
      writeU16(buf, height);
      buf.push(0x87); // local color table flag, 8bpp

      // Local Color Table
      const lct = q.palette;
      for (let i = 0; i < 256; i++) {
        buf.push(lct[i * 3] ?? 0);
        buf.push(lct[i * 3 + 1] ?? 0);
        buf.push(lct[i * 3 + 2] ?? 0);
      }

      lzwEncode(buf, q.indices, 8);
    }
  }

  // Trailer
  buf.push(0x3b);

  return new Uint8Array(buf);
}

function writeStr(buf: number[], s: string) {
  for (let i = 0; i < s.length; i++) buf.push(s.charCodeAt(i));
}

function writeU16(buf: number[], v: number) {
  buf.push(v & 0xff, (v >> 8) & 0xff);
}

function quantizeFrame(
  imageData: ImageData,
  w: number,
  h: number
): { palette: Uint8Array; indices: Uint8Array } {
  const pixels = imageData.data;
  const n = w * h;

  // Simple uniform quantization: 6 bits R, 7 bits G, 6 bits B -> 8-bit index
  // Better: build a frequency-based palette
  const colorCounts = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const off = i * 4;
    const r = pixels[off] >> 2; // 6 bits
    const g = pixels[off + 1] >> 2;
    const b = pixels[off + 2] >> 2;
    const key = (r << 12) | (g << 6) | b;
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);
  }

  // Get top 256 colors by frequency
  const sorted = [...colorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 256);

  const palette = new Uint8Array(256 * 3);
  const colorMap = new Map<number, number>();

  for (let i = 0; i < sorted.length; i++) {
    const key = sorted[i][0];
    const r = ((key >> 12) & 0x3f) << 2;
    const g = ((key >> 6) & 0x3f) << 2;
    const b = (key & 0x3f) << 2;
    palette[i * 3] = r;
    palette[i * 3 + 1] = g;
    palette[i * 3 + 2] = b;
    colorMap.set(key, i);
  }

  // Map pixels to palette indices (nearest match for colors not in top 256)
  const indices = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const off = i * 4;
    const r = pixels[off] >> 2;
    const g = pixels[off + 1] >> 2;
    const b = pixels[off + 2] >> 2;
    const key = (r << 12) | (g << 6) | b;
    const idx = colorMap.get(key);
    if (idx !== undefined) {
      indices[i] = idx;
    } else {
      // Find nearest color in palette
      indices[i] = findNearest(palette, sorted.length, pixels[off], pixels[off + 1], pixels[off + 2]);
    }
  }

  return { palette, indices };
}

function findNearest(
  palette: Uint8Array,
  count: number,
  r: number,
  g: number,
  b: number
): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < count; i++) {
    const dr = r - palette[i * 3];
    const dg = g - palette[i * 3 + 1];
    const db = b - palette[i * 3 + 2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function lzwEncode(buf: number[], indices: Uint8Array, minCodeSize: number) {
  buf.push(minCodeSize);
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxTableSize = 4096;

  let table = new Map<string, number>();
  // Initialize table
  for (let i = 0; i < clearCode; i++) {
    table.set(String(i), i);
  }

  const subBlocks: number[] = [];
  let bits = 0;
  let bitCount = 0;

  function writeBits(code: number, size: number) {
    bits |= code << bitCount;
    bitCount += size;
    while (bitCount >= 8) {
      subBlocks.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  }

  writeBits(clearCode, codeSize);

  let current = String(indices[0]);

  for (let i = 1; i < indices.length; i++) {
    const next = current + "," + indices[i];
    if (table.has(next)) {
      current = next;
    } else {
      writeBits(table.get(current)!, codeSize);
      if (nextCode < maxTableSize) {
        table.set(next, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Table full, emit clear code and reset
        writeBits(clearCode, codeSize);
        table = new Map<string, number>();
        for (let j = 0; j < clearCode; j++) {
          table.set(String(j), j);
        }
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      current = String(indices[i]);
    }
  }

  writeBits(table.get(current)!, codeSize);
  writeBits(eoiCode, codeSize);
  if (bitCount > 0) {
    subBlocks.push(bits & 0xff);
  }

  // Write sub-blocks (max 255 bytes each)
  let pos = 0;
  while (pos < subBlocks.length) {
    const chunkSize = Math.min(255, subBlocks.length - pos);
    buf.push(chunkSize);
    for (let i = 0; i < chunkSize; i++) {
      buf.push(subBlocks[pos++]);
    }
  }
  buf.push(0x00); // Block terminator
}

// ── Component ──

export default function GifMakerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const relatedPosts = getPostsByTool("gif-maker");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [frames, setFrames] = useState<FrameImage[]>([]);
  const [delay, setDelay] = useState(500); // ms
  const [outputWidth, setOutputWidth] = useState<number>(0); // 0 = original
  const [loopMode, setLoopMode] = useState<"infinite" | "once" | "custom">("infinite");
  const [customLoops, setCustomLoops] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);

  const widthOptions = [320, 480, 640, 800];

  const title = isKo
    ? "GIF 만들기 - 이미지로 움짤 만들기"
    : "GIF Maker - Create Animated GIF from Images";
  const description = isKo
    ? "여러 이미지를 업로드하여 애니메이션 GIF(움짤)를 만드세요. 프레임 속도, 크기 조절 가능. 100% 무료, 서버 업로드 없음."
    : "Upload multiple images to create animated GIFs. Adjust frame rate, size, and loop settings. 100% free, no server upload.";

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
    };
  }, [gifUrl]);

  const loadImage = useCallback((file: File): Promise<FrameImage> => {
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
      setFrames((prev) => [...prev, ...loaded]);
      setGifBlob(null);
      setGifUrl(null);
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

  const removeFrame = useCallback((id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id));
    setGifBlob(null);
    setGifUrl(null);
  }, []);

  // Frame reorder via drag
  const handleFrameDragStart = useCallback((index: number) => {
    setDragSourceIndex(index);
  }, []);

  const handleFrameDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    []
  );

  const handleFrameDropReorder = useCallback(
    (targetIndex: number) => {
      if (dragSourceIndex === null || dragSourceIndex === targetIndex) {
        setDragOverIndex(null);
        setDragSourceIndex(null);
        return;
      }
      setFrames((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragSourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
      setDragOverIndex(null);
      setDragSourceIndex(null);
      setGifBlob(null);
      setGifUrl(null);
    },
    [dragSourceIndex]
  );

  // Preview animation
  const togglePreview = useCallback(() => {
    if (isPreviewPlaying) {
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
        previewIntervalRef.current = null;
      }
      setIsPreviewPlaying(false);
    } else {
      setIsPreviewPlaying(true);
      let idx = 0;
      previewIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % frames.length;
        setPreviewIndex(idx);
      }, delay);
    }
  }, [isPreviewPlaying, frames.length, delay]);

  useEffect(() => {
    // Stop preview when frames change
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    setIsPreviewPlaying(false);
    setPreviewIndex(0);
  }, [frames.length]);

  // Generate GIF
  const generateGif = useCallback(async () => {
    if (frames.length < 2) return;
    setIsGenerating(true);
    setProgress(0);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Determine output size
    const maxOrigW = Math.max(...frames.map((f) => f.img.width));
    const maxOrigH = Math.max(...frames.map((f) => f.img.height));
    const w = outputWidth > 0 ? outputWidth : maxOrigW;
    const scale = w / maxOrigW;
    const h = Math.round(maxOrigH * scale);

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Render all frames to ImageData
    const frameDataList: ImageData[] = [];
    for (let i = 0; i < frames.length; i++) {
      ctx.clearRect(0, 0, w, h);
      const img = frames[i].img;
      const imgScale = Math.min(w / img.width, h / img.height);
      const dw = img.width * imgScale;
      const dh = img.height * imgScale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, dx, dy, dw, dh);
      frameDataList.push(ctx.getImageData(0, 0, w, h));
      setProgress(Math.round(((i + 1) / frames.length) * 50));
    }

    // Encode GIF in a timeout to not block UI
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        const delayCs = Math.round(delay / 10);
        const loops =
          loopMode === "infinite" ? -1 : loopMode === "once" ? 1 : customLoops;
        const gifData = encodeGIF(frameDataList, w, h, delayCs, loops);
        const blob = new Blob([gifData.buffer as ArrayBuffer], { type: "image/gif" });

        if (gifUrl) URL.revokeObjectURL(gifUrl);
        const url = URL.createObjectURL(blob);
        setGifBlob(blob);
        setGifUrl(url);
        setPreviewUrl(url);
        setProgress(100);
        setIsGenerating(false);
        resolve();
      }, 50);
    });
  }, [frames, outputWidth, delay, loopMode, customLoops, gifUrl]);

  const downloadGif = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = "quickfigure-animated.gif";
    a.click();
  }, [gifUrl]);

  const faqItems = isKo
    ? [
        {
          q: "몇 장의 이미지까지 사용할 수 있나요?",
          a: "제한은 없지만 이미지 수가 많을수록 GIF 파일 크기가 커집니다. 일반적으로 5~30장 사이가 적당합니다. 모든 처리가 브라우저에서 이루어지므로 너무 많은 이미지는 메모리를 많이 사용할 수 있습니다.",
        },
        {
          q: "GIF 파일 크기를 줄이려면 어떻게 하나요?",
          a: "출력 너비를 줄이면 파일 크기가 크게 줄어듭니다. 320px이나 480px로 설정해보세요. 또한 프레임 수를 줄이거나 색상이 단순한 이미지를 사용하면 도움이 됩니다.",
        },
        {
          q: "이미지가 서버에 업로드되나요?",
          a: "아닙니다. 모든 처리가 브라우저의 Canvas API를 사용하여 100% 클라이언트에서 이루어집니다. 이미지가 외부 서버로 전송되지 않으므로 완전히 안전합니다.",
        },
        {
          q: "어떤 이미지 형식을 사용할 수 있나요?",
          a: "JPG, PNG, WebP 등 브라우저가 지원하는 모든 이미지 형식을 사용할 수 있습니다. 서로 다른 형식의 이미지를 섞어서 사용해도 됩니다.",
        },
        {
          q: "카카오톡에서 움짤로 보내려면 어떻게 하나요?",
          a: "GIF를 다운로드한 후 카카오톡 채팅에서 파일 전송으로 GIF 파일을 보내면 자동으로 움짤로 재생됩니다. 파일 크기가 10MB 이하면 가장 좋습니다.",
        },
      ]
    : [
        {
          q: "How many images can I use?",
          a: "There's no hard limit, but more images mean a larger GIF file. 5-30 images is typically ideal. All processing happens in your browser, so very large numbers may use significant memory.",
        },
        {
          q: "How can I reduce GIF file size?",
          a: "Reducing the output width significantly reduces file size. Try 320px or 480px. Using fewer frames or simpler images with fewer colors also helps.",
        },
        {
          q: "Are my images uploaded to a server?",
          a: "No. All processing happens in your browser using the Canvas API. Your images are never sent to any external server, ensuring complete privacy.",
        },
        {
          q: "What image formats are supported?",
          a: "JPG, PNG, WebP, and any other format your browser supports. You can mix different formats in the same GIF.",
        },
        {
          q: "Can I control how many times the GIF loops?",
          a: "Yes. You can set it to loop infinitely, play once, or specify a custom loop count. Most platforms (social media, messaging apps) ignore loop settings and play GIFs infinitely.",
        },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <canvas ref={canvasRef} className="hidden" />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {isKo ? "GIF 만들기" : "GIF Maker"}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <ToolAbout slug="gif-maker" locale={locale} />
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
          <p className="text-4xl mb-2">🎞️</p>
          <p className="text-neutral-600 dark:text-neutral-400">
            {isKo
              ? "이미지를 드래그하거나 클릭하여 업로드 (여러 장 선택 가능)"
              : "Drag & drop images or click to upload (select multiple)"}
          </p>
          <p className="text-xs text-neutral-400 mt-1">JPG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Frame thumbnails */}
        {frames.length > 0 && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">
                  {isKo ? `프레임 (${frames.length}장)` : `Frames (${frames.length})`}
                </p>
                <button
                  onClick={() => {
                    setFrames([]);
                    setGifBlob(null);
                    setGifUrl(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 cursor-pointer"
                >
                  {isKo ? "전체 삭제" : "Clear All"}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {frames.map((frame, i) => (
                  <div
                    key={frame.id}
                    draggable
                    onDragStart={() => handleFrameDragStart(i)}
                    onDragOver={(e) => handleFrameDragOver(e, i)}
                    onDrop={() => handleFrameDropReorder(i)}
                    onDragEnd={() => {
                      setDragOverIndex(null);
                      setDragSourceIndex(null);
                    }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                      dragOverIndex === i
                        ? "border-blue-500 scale-105"
                        : previewIndex === i && isPreviewPlaying
                        ? "border-green-500"
                        : "border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1">
                      {i + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFrame(frame.id);
                      }}
                      className="absolute top-0 right-0 bg-black/60 text-white text-[10px] w-4 h-4 flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {isKo
                  ? "드래그하여 순서를 변경하세요"
                  : "Drag to reorder frames"}
              </p>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Frame delay */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "프레임 간격" : "Frame Delay"}:{" "}
                  {(delay / 1000).toFixed(1)}s
                </label>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  value={delay}
                  onChange={(e) => setDelay(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>{isKo ? "빠름" : "Fast"} (0.1s)</span>
                  <span>{isKo ? "느림" : "Slow"} (5s)</span>
                </div>
              </div>

              {/* Output width */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "출력 크기 (너비)" : "Output Width"}
                </label>
                <select
                  value={outputWidth}
                  onChange={(e) => setOutputWidth(parseInt(e.target.value))}
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>
                    {isKo ? "원본 크기" : "Original Size"}
                  </option>
                  {widthOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}px
                    </option>
                  ))}
                </select>
              </div>

              {/* Loop mode */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  {isKo ? "반복 설정" : "Loop"}
                </label>
                <select
                  value={loopMode}
                  onChange={(e) =>
                    setLoopMode(
                      e.target.value as "infinite" | "once" | "custom"
                    )
                  }
                  className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="infinite">
                    {isKo ? "무한 반복" : "Infinite Loop"}
                  </option>
                  <option value="once">
                    {isKo ? "1회 재생" : "Play Once"}
                  </option>
                  <option value="custom">
                    {isKo ? "횟수 지정" : "Custom Count"}
                  </option>
                </select>
              </div>

              {loopMode === "custom" && (
                <div>
                  <label className="text-sm font-medium block mb-2">
                    {isKo ? "반복 횟수" : "Loop Count"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customLoops}
                    onChange={(e) =>
                      setCustomLoops(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-full p-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Preview */}
            {frames.length >= 2 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-medium">
                    {isKo ? "미리보기" : "Preview"}
                  </p>
                  <button
                    onClick={togglePreview}
                    className="text-xs px-3 py-1 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
                  >
                    {isPreviewPlaying
                      ? isKo
                        ? "⏸ 정지"
                        : "⏸ Stop"
                      : isKo
                      ? "▶ 재생"
                      : "▶ Play"}
                  </button>
                </div>
                <div className="w-full max-w-sm mx-auto rounded-md border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  {gifUrl ? (
                    <img
                      src={gifUrl}
                      alt="Generated GIF"
                      className="w-full"
                    />
                  ) : (
                    <img
                      src={frames[previewIndex]?.dataUrl}
                      alt={`Preview frame ${previewIndex + 1}`}
                      className="w-full"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Generate button */}
            <div className="flex items-center gap-4">
              <button
                onClick={generateGif}
                disabled={frames.length < 2 || isGenerating}
                className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating
                  ? isKo
                    ? `생성 중... ${progress}%`
                    : `Generating... ${progress}%`
                  : isKo
                  ? "GIF 생성"
                  : "Create GIF"}
              </button>
              {frames.length < 2 && (
                <p className="text-xs text-neutral-400">
                  {isKo
                    ? "2장 이상의 이미지가 필요합니다"
                    : "At least 2 images required"}
                </p>
              )}
            </div>

            {/* Progress bar */}
            {isGenerating && (
              <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Download */}
            {gifBlob && !isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <button
                    onClick={downloadGif}
                    className="px-5 py-2 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 transition-colors cursor-pointer"
                  >
                    {isKo ? "GIF 다운로드" : "Download GIF"}
                  </button>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {formatBytes(gifBlob.size)}
                  </span>
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
                "이미지 파일을 드래그하거나 클릭하여 여러 장 업로드하세요.",
                "썸네일을 드래그하여 원하는 순서로 정렬하세요.",
                "프레임 간격(속도), 출력 크기, 반복 설정을 조절하세요.",
                "미리보기로 애니메이션을 확인하세요.",
                "GIF 생성 버튼을 클릭하고 다운로드하세요.",
              ]
            : [
                "Upload multiple images by dragging or clicking the upload area.",
                "Drag thumbnails to reorder frames as desired.",
                "Adjust frame delay (speed), output width, and loop settings.",
                "Use the preview to check the animation.",
                "Click Create GIF and download the result.",
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
            url: `https://www.quickfigure.net/${lang}/tools/gif-maker`,
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
            href={`/${lang}/tools/image-watermark`}
            className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {dict.home.imageWatermark}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {dict.home.imageWatermarkDesc}
            </p>
          </Link>
        </div>
      </section>

      <ToolHowItWorks slug="gif-maker" locale={locale} />
      <ToolDisclaimer slug="gif-maker" locale={locale} />

      <ShareButtons
        title={title}
        description={description}
        lang={lang}
        slug="gif-maker"
        labels={dict.share}
      />
      <EmbedCodeButton slug="gif-maker" lang={lang} labels={dict.embed} />

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
