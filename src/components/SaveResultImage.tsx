"use client";

import { useRef, useCallback, type RefObject } from "react";

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
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (typeof window !== "undefined" && window.innerWidth < 768);
}

export default function SaveResultImage({ targetRef, toolName, slug, labels }: SaveResultImageProps) {
  const busyRef = useRef(false);

  const handleSave = useCallback(async () => {
    if (busyRef.current) {
      console.warn("[SaveResultImage] Already processing, skipping.");
      return;
    }
    if (!targetRef.current) {
      console.error("[SaveResultImage] targetRef is null. The result element is not rendered yet.");
      return;
    }

    busyRef.current = true;
    const btn = document.querySelector(`[data-save-image="${slug}"]`) as HTMLButtonElement | null;
    if (btn) btn.textContent = labels.saving;

    try {
      console.log("[SaveResultImage] Importing html2canvas...");
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      console.log("[SaveResultImage] html2canvas loaded successfully.");

      const el = targetRef.current;
      if (!el) {
        console.error("[SaveResultImage] targetRef became null during async import.");
        return;
      }

      console.log("[SaveResultImage] Capturing element:", el.tagName, "size:", el.offsetWidth, "x", el.offsetHeight);

      // Force light background on children for capture
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: true,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      console.log("[SaveResultImage] Canvas captured:", canvas.width, "x", canvas.height);

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("[SaveResultImage] Captured canvas has zero dimensions.");
        return;
      }

      // Add padding + watermark
      const pad = 32;
      const watermarkH = 48;
      const final = document.createElement("canvas");
      final.width = canvas.width + pad * 2;
      final.height = canvas.height + pad * 2 + watermarkH;
      const ctx = final.getContext("2d");

      if (!ctx) {
        console.error("[SaveResultImage] Failed to get 2D context from canvas.");
        return;
      }

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, final.width, final.height);

      // Draw captured content
      ctx.drawImage(canvas, pad, pad);

      // Watermark area
      const wmY = canvas.height + pad * 2;
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, wmY, final.width, watermarkH);

      // Watermark text - left: tool name
      ctx.fillStyle = "#737373";
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(toolName, pad, wmY + watermarkH / 2);

      // Watermark text - right: site URL
      ctx.font = "600 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.fillStyle = "#3b82f6";
      const siteText = "quickfigure.net";
      const siteW = ctx.measureText(siteText).width;
      ctx.fillText(siteText, final.width - pad - siteW, wmY + watermarkH / 2);

      const dataUrl = final.toDataURL("image/png");
      console.log("[SaveResultImage] Image generated, dataUrl length:", dataUrl.length);

      if (isMobile()) {
        // Mobile: open image in new tab so user can long-press to save
        console.log("[SaveResultImage] Mobile detected, opening in new tab.");
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(
            `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${toolName} - QuickFigure</title><style>body{margin:0;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;background:#f5f5f5;padding:16px}img{max-width:100%;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}</style></head><body><img src="${dataUrl}" alt="${toolName} result"></body></html>`
          );
          newTab.document.close();
        } else {
          // Popup blocked fallback: use blob URL in current tab
          console.warn("[SaveResultImage] Popup blocked, using blob fallback.");
          const blob = await (await fetch(dataUrl)).blob();
          const blobUrl = URL.createObjectURL(blob);
          window.open(blobUrl, "_blank");
        }
      } else {
        // PC: download via <a> tag
        console.log("[SaveResultImage] PC detected, downloading file.");
        const blob = await (await fetch(dataUrl)).blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `quickfigure-${slug}-result.png`;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      }

      console.log("[SaveResultImage] Done.");
    } catch (err) {
      console.error("[SaveResultImage] Error:", err);
    } finally {
      busyRef.current = false;
      if (btn) btn.textContent = labels.saveImage;
    }
  }, [targetRef, toolName, slug, labels]);

  return (
    <button
      onClick={handleSave}
      data-save-image={slug}
      data-tool={slug}
      className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {labels.saveImage}
    </button>
  );
}
