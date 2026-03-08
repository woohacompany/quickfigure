"use client";

import { useState, type RefObject } from "react";

interface SaveResultImageProps {
  targetRef: RefObject<HTMLDivElement | null>;
  toolName: string;
  slug: string;
  labels: {
    saveImage: string;
    saving: string;
  };
}

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || (typeof window !== "undefined" && window.innerWidth < 768)
  );
}

/**
 * Convert any CSS color string to rgb() using a temporary canvas.
 * Handles oklch(), lab(), lch(), color-mix(), etc.
 * Returns null if conversion fails.
 */
function colorToRgb(color: string): string | null {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = color;
    // The browser normalizes the color to rgb/rgba format
    const result = ctx.fillStyle;
    // ctx.fillStyle returns hex like "#rrggbb" or "rgba(r,g,b,a)"
    return result;
  } catch {
    return null;
  }
}

/**
 * Walk all elements in cloned DOM and force-convert oklch/lab/lch/color-mix
 * colors to rgb equivalents. This prevents html2canvas from crashing.
 */
function sanitizeColorsInClone(clonedDoc: Document, originalEl: HTMLElement) {
  const problematicPattern = /oklch|lab\(|lch\(|color-mix|color\(/i;

  // Process all elements in the cloned document
  const allCloned = clonedDoc.querySelectorAll("*");
  allCloned.forEach((clonedEl) => {
    if (!(clonedEl instanceof HTMLElement)) return;

    const style = clonedEl.style;
    const computed = window.getComputedStyle(clonedEl);

    // List of CSS properties that commonly have color values
    const colorProps = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "boxShadow",
      "caretColor",
    ] as const;

    colorProps.forEach((prop) => {
      const val = computed[prop as keyof CSSStyleDeclaration] as string;
      if (val && typeof val === "string" && problematicPattern.test(val)) {
        const rgb = colorToRgb(val);
        if (rgb) {
          (style as unknown as Record<string, string>)[prop] = rgb;
        } else {
          // Fallback: set safe defaults
          if (prop === "backgroundColor") {
            style.backgroundColor = "transparent";
          } else if (prop === "color") {
            style.color = "#000000";
          } else if (prop.includes("border") || prop.includes("Border")) {
            (style as unknown as Record<string, string>)[prop] = "#d4d4d4";
          }
        }
      }
    });
  });

  // Also sanitize CSS custom properties (--*) on :root and body
  const rootEl = clonedDoc.documentElement;
  const bodyEl = clonedDoc.body;
  [rootEl, bodyEl].forEach((el) => {
    if (!el) return;
    const cs = window.getComputedStyle(el);
    // Force known custom properties used by Tailwind
    el.style.setProperty("--background", "#ffffff");
    el.style.setProperty("--foreground", "#171717");
  });
}

/**
 * Add watermark bar to a canvas and return the final canvas
 */
function addWatermark(
  sourceCanvas: HTMLCanvasElement,
  toolName: string
): HTMLCanvasElement {
  const pad = 32;
  const watermarkH = 48;
  const final = document.createElement("canvas");
  final.width = sourceCanvas.width + pad * 2;
  final.height = sourceCanvas.height + pad * 2 + watermarkH;
  const ctx = final.getContext("2d")!;

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, final.width, final.height);

  // Draw captured content
  ctx.drawImage(sourceCanvas, pad, pad);

  // Watermark bar
  const wmY = sourceCanvas.height + pad * 2;
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, wmY, final.width, watermarkH);

  // Left: tool name
  ctx.fillStyle = "#737373";
  ctx.font =
    "bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(toolName, pad, wmY + watermarkH / 2);

  // Right: site URL
  ctx.font =
    "600 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = "#3b82f6";
  const siteText = "quickfigure.net";
  const siteW = ctx.measureText(siteText).width;
  ctx.fillText(siteText, final.width - pad - siteW, wmY + watermarkH / 2);

  return final;
}

/**
 * Method 1: html2canvas with color sanitization
 */
async function captureWithHtml2Canvas(
  el: HTMLElement,
  toolName: string
): Promise<Blob> {
  console.log("[SaveImg] Method 1: html2canvas");

  const mod = await import("html2canvas");
  const html2canvas = mod.default;

  const canvas = await html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (clonedDoc: Document) => {
      console.log("[SaveImg] onclone: sanitizing colors...");
      sanitizeColorsInClone(clonedDoc, el);
    },
  });

  console.log("[SaveImg] html2canvas done:", canvas.width, "x", canvas.height);

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("html2canvas produced empty canvas");
  }

  const final = addWatermark(canvas, toolName);

  const blob = await new Promise<Blob | null>((resolve) => {
    final.toBlob((b) => resolve(b), "image/png");
  });

  if (!blob) throw new Error("toBlob returned null");
  return blob;
}

/**
 * Method 2: dom-to-image-more (SVG foreignObject based, no CSS parsing issues)
 */
async function captureWithDomToImage(
  el: HTMLElement,
  toolName: string
): Promise<Blob> {
  console.log("[SaveImg] Method 2: dom-to-image-more");

  const domtoimage = await import("dom-to-image-more");

  const dataUrl = await domtoimage.toPng(el, {
    bgcolor: "#ffffff",
    quality: 1,
    width: el.offsetWidth,
    height: el.offsetHeight,
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  });

  console.log("[SaveImg] dom-to-image done, dataUrl length:", dataUrl.length);

  // Convert dataUrl to canvas to add watermark
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load captured image"));
    img.src = dataUrl;
  });

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = img.width * 2; // 2x for retina
  sourceCanvas.height = img.height * 2;
  const sCtx = sourceCanvas.getContext("2d")!;
  sCtx.scale(2, 2);
  sCtx.drawImage(img, 0, 0);

  const final = addWatermark(sourceCanvas, toolName);

  const blob = await new Promise<Blob | null>((resolve) => {
    final.toBlob((b) => resolve(b), "image/png");
  });

  if (!blob) throw new Error("toBlob returned null (dom-to-image)");
  return blob;
}

/**
 * Deliver blob to user: download on PC, new tab on mobile
 */
function deliverBlob(blob: Blob, slug: string) {
  const blobUrl = URL.createObjectURL(blob);

  if (isMobile()) {
    console.log("[SaveImg] Mobile - opening new tab");
    window.open(blobUrl, "_blank");
  } else {
    console.log("[SaveImg] PC - downloading");
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `quickfigure-${slug}-result.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  }
}

export default function SaveResultImage({
  targetRef,
  toolName,
  slug,
  labels,
}: SaveResultImageProps) {
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (busy) return;

    console.log("[SaveImg] Start");

    if (!targetRef.current) {
      console.error("[SaveImg] targetRef is null");
      alert("저장할 결과가 없습니다. 먼저 계산을 실행해주세요.");
      return;
    }

    setBusy(true);

    const el = targetRef.current;

    try {
      // Try Method 1: html2canvas with color sanitization
      let blob: Blob;
      try {
        blob = await captureWithHtml2Canvas(el, toolName);
        console.log("[SaveImg] html2canvas succeeded, blob size:", blob.size);
      } catch (err1) {
        // Method 1 failed → fallback to Method 2
        console.warn("[SaveImg] html2canvas failed:", err1);
        console.log("[SaveImg] Falling back to dom-to-image-more...");
        blob = await captureWithDomToImage(el, toolName);
        console.log("[SaveImg] dom-to-image succeeded, blob size:", blob.size);
      }

      deliverBlob(blob, slug);
      console.log("[SaveImg] Done");
    } catch (err) {
      console.error("[SaveImg] All methods failed:", err);
      alert(
        "이미지 저장에 실패했습니다.\n" +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={busy}
      data-save-image={slug}
      data-tool={slug}
      className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {busy ? labels.saving : labels.saveImage}
    </button>
  );
}
