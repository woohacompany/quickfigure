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

export default function SaveResultImage({
  targetRef,
  toolName,
  slug,
  labels,
}: SaveResultImageProps) {
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (busy) return;

    console.log("[SaveImg] 1. Start");

    if (!targetRef.current) {
      console.error("[SaveImg] 2. targetRef is null");
      alert("저장할 결과가 없습니다. 먼저 계산을 실행해주세요.");
      return;
    }

    setBusy(true);

    try {
      // Step 1: dynamic import html2canvas
      console.log("[SaveImg] 3. Importing html2canvas...");
      const mod = await import("html2canvas");
      const html2canvas = mod.default;
      console.log("[SaveImg] 4. html2canvas loaded");

      // Step 2: check ref still exists
      const el = targetRef.current;
      if (!el) {
        console.error("[SaveImg] 5. targetRef became null");
        alert("결과 영역을 찾을 수 없습니다.");
        return;
      }

      console.log(
        "[SaveImg] 6. Capturing element:",
        el.tagName,
        el.offsetWidth,
        "x",
        el.offsetHeight
      );

      // Step 3: capture with html2canvas
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      console.log(
        "[SaveImg] 7. Canvas captured:",
        canvas.width,
        "x",
        canvas.height
      );

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("[SaveImg] 8. Canvas is 0 size");
        alert("이미지 캡처에 실패했습니다.");
        return;
      }

      // Step 4: add padding + watermark
      const pad = 32;
      const watermarkH = 48;
      const final = document.createElement("canvas");
      final.width = canvas.width + pad * 2;
      final.height = canvas.height + pad * 2 + watermarkH;
      const ctx = final.getContext("2d");

      if (!ctx) {
        console.error("[SaveImg] 9. No 2d context");
        alert("이미지 생성에 실패했습니다.");
        return;
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, final.width, final.height);
      ctx.drawImage(canvas, pad, pad);

      // watermark bar
      const wmY = canvas.height + pad * 2;
      ctx.fillStyle = "#f5f5f5";
      ctx.fillRect(0, wmY, final.width, watermarkH);

      ctx.fillStyle = "#737373";
      ctx.font =
        "bold 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillText(toolName, pad, wmY + watermarkH / 2);

      ctx.font =
        "600 20px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.fillStyle = "#3b82f6";
      const siteText = "quickfigure.net";
      const siteW = ctx.measureText(siteText).width;
      ctx.fillText(siteText, final.width - pad - siteW, wmY + watermarkH / 2);

      console.log("[SaveImg] 10. Watermark added");

      // Step 5: convert to blob using toBlob (most reliable)
      const blob = await new Promise<Blob | null>((resolve) => {
        final.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) {
        console.error("[SaveImg] 11. toBlob returned null");
        alert("이미지 변환에 실패했습니다.");
        return;
      }

      console.log("[SaveImg] 12. Blob created, size:", blob.size);

      const blobUrl = URL.createObjectURL(blob);

      if (isMobile()) {
        // Mobile: open blob URL in new tab for long-press save
        console.log("[SaveImg] 13. Mobile - opening new tab");
        window.open(blobUrl, "_blank");
      } else {
        // PC: download via <a> click
        console.log("[SaveImg] 13. PC - downloading");
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `quickfigure-${slug}-result.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      }

      console.log("[SaveImg] 14. Done");
    } catch (err) {
      console.error("[SaveImg] Error:", err);
      alert(
        "이미지 저장에 실패했습니다. 브라우저 콘솔을 확인해주세요.\n" +
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
