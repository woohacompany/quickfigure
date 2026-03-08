"use client";

import { useState } from "react";

const EMBED_SLUGS = new Set([
  "bmi-calculator",
  "age-calculator",
  "compound-interest-calculator",
  "freelancer-tax-calculator",
  "salary-calculator",
  "loan-calculator",
  "unit-converter",
  "percentage-calculator",
]);

interface EmbedCodeButtonProps {
  slug: string;
  lang: string;
  labels: {
    embedButton: string;
    embedTitle: string;
    embedDescription: string;
    copyCode: string;
    copied: string;
    close: string;
  };
}

export default function EmbedCodeButton({ slug, lang, labels }: EmbedCodeButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!EMBED_SLUGS.has(slug)) return null;

  const iframeCode = `<iframe src="https://quickfigure.net/embed/${lang}/${slug}" width="100%" height="450" frameborder="0" style="border:0;border-radius:8px;overflow:hidden;" loading="lazy"></iframe>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(iframeCode);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = iframeCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-embed={slug}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-4 rounded-md text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        {labels.embedButton}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xl max-w-lg w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{labels.embedTitle}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                aria-label={labels.close}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{labels.embedDescription}</p>
            <pre className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all border border-neutral-200 dark:border-neutral-700 select-all">
              {iframeCode}
            </pre>
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {copied ? labels.copied : labels.copyCode}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
