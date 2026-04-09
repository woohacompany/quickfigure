"use client";

import Link from "next/link";

export function ToolCTA({
  tool,
  toolName,
  title,
  description,
  buttonText,
  href,
  lang,
}: {
  tool?: string;
  toolName?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
  lang?: string;
}) {
  const displayTitle = title ?? toolName ?? "";
  const linkHref = href ?? (lang && tool ? `/${lang}/tools/${tool}` : "#");

  return (
    <div className="my-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 p-7 text-center">
      <p className="text-white text-lg font-semibold mb-1">{displayTitle}</p>
      {description && (
        <p className="text-blue-100 text-sm mb-4">{description}</p>
      )}
      <Link
        href={linkHref}
        className="inline-block px-6 py-2.5 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
      >
        {buttonText ?? "\uBC14\uB85C \uACC4\uC0B0\uD558\uAE30"} &rarr;
      </Link>
    </div>
  );
}
