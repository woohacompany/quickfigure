"use client";

import Link from "next/link";

/* ── SummaryBox ─────────────────────────────────────────── */
export function SummaryBox({
  title,
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <div className="mb-6 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 p-5 sm:p-6">
      <p className="font-semibold text-base mb-3">
        {title ?? "\uD83D\uDCCC \uC774 \uAE00\uC5D0\uC11C \uC54C \uC218 \uC788\uB294 \uAC83"}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <span className="shrink-0 mt-0.5">{"\u2705"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── TipBox ─────────────────────────────────────────────── */
export function TipBox({
  title,
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 p-5">
      <span className="shrink-0 text-xl mt-0.5">{"\uD83D\uDCA1"}</span>
      <div>
        {title && (
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">{title}</p>
        )}
        <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

/* ── WarningBox ──────────────────────────────────────────── */
export function WarningBox({
  title,
  text,
}: {
  title?: string;
  text: string;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-5">
      <span className="shrink-0 text-xl mt-0.5">{"\u26A0\uFE0F"}</span>
      <div>
        {title && (
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">{title}</p>
        )}
        <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

/* ── CalcBox ─────────────────────────────────────────────── */
export function CalcBox({
  title,
  steps,
}: {
  title?: string;
  steps: string[];
}) {
  return (
    <div className="mb-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
      {title && (
        <p className="font-semibold mb-3">{title}</p>
      )}
      <div className="space-y-2 font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="shrink-0 text-blue-500 font-semibold select-none">{i + 1}.</span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ComparisonTable ─────────────────────────────────────── */
export function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── ToolCTA ─────────────────────────────────────────────── */
export function ToolCTA({
  tool,
  toolName,
  description,
  buttonText,
  lang,
}: {
  tool: string;
  toolName: string;
  description?: string;
  buttonText?: string;
  lang: string;
}) {
  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 p-6 text-center">
      <p className="text-white text-lg font-semibold mb-1">{toolName}</p>
      {description && (
        <p className="text-blue-100 text-sm mb-4">{description}</p>
      )}
      <Link
        href={`/${lang}/tools/${tool}`}
        className="inline-block px-6 py-2.5 rounded-lg bg-white text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
      >
        {buttonText ?? "\uBC14\uB85C \uACC4\uC0B0\uD558\uAE30"} &rarr;
      </Link>
    </div>
  );
}
