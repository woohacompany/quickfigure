"use client";

import { use } from "react";
import { isValidLocale, type Locale } from "@/lib/dictionaries";
import EmbedTool from "@/components/EmbedTools";

export default function EmbedPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;

  const tool = EmbedTool({ tool: slug, lang: locale });

  return (
    <div className="min-h-screen flex flex-col p-4">
      <div className="flex-1">
        {tool || (
          <div className="flex items-center justify-center h-40 text-neutral-500 text-sm">
            This tool is not available for embedding.
          </div>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 text-center">
        <a
          href={`https://www.quickfigure.net/${lang}/tools/${slug}`}
          target="_blank"
          rel="noopener"
          className="text-xs text-neutral-500 hover:text-blue-600 transition-colors"
        >
          Powered by <span className="font-semibold">QuickFigure</span>
        </a>
      </div>
    </div>
  );
}
