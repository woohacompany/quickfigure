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

export default function SaveResultImage({ targetRef, toolName, slug, labels }: SaveResultImageProps) {
  const busyRef = useRef(false);

  const handleSave = useCallback(async () => {
    if (busyRef.current || !targetRef.current) return;
    busyRef.current = true;

    const btn = document.querySelector(`[data-save-image="${slug}"]`) as HTMLButtonElement | null;
    if (btn) btn.textContent = labels.saving;

    try {
      const html2canvas = (await import("html2canvas")).default;

      const el = targetRef.current;
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Add padding + watermark
      const pad = 32;
      const watermarkH = 48;
      const final = document.createElement("canvas");
      final.width = canvas.width + pad * 2;
      final.height = canvas.height + pad * 2 + watermarkH;
      const ctx = final.getContext("2d")!;

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

      // Download
      const link = document.createElement("a");
      link.download = `quickfigure-${slug}-result.png`;
      link.href = final.toDataURL("image/png");
      link.click();
    } catch {
      // silent fail
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
