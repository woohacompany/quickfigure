"use client";

import type { ReactNode } from "react";

export function CalcBox({
  title,
  steps,
  children,
}: {
  title?: string;
  steps?: string[];
  children?: ReactNode;
}) {
  return (
    <div className="my-8 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
      {title && (
        <p className="font-semibold mb-3">{title}</p>
      )}
      {steps && (
        <div className="space-y-2 font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="shrink-0 text-blue-500 font-semibold select-none">{i + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
      {children && (
        <div className="font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {children}
        </div>
      )}
    </div>
  );
}
