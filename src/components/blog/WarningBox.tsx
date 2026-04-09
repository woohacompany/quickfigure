"use client";

import type { ReactNode } from "react";

export function WarningBox({
  title,
  text,
  children,
}: {
  title?: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 p-5">
      <span className="shrink-0 text-xl mt-0.5">{"\u26A0\uFE0F"}</span>
      <div>
        {title && (
          <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">{title}</p>
        )}
        {text && <p className="text-amber-800 dark:text-amber-300 leading-relaxed">{text}</p>}
        {children && <div className="text-amber-800 dark:text-amber-300 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
