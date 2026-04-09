"use client";

import type { ReactNode } from "react";

export function TipBox({
  title,
  text,
  children,
}: {
  title?: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 p-5">
      <span className="shrink-0 text-xl mt-0.5">{"\uD83D\uDCA1"}</span>
      <div>
        {title && (
          <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1">{title}</p>
        )}
        {text && <p className="text-blue-800 dark:text-blue-300 leading-relaxed">{text}</p>}
        {children && <div className="text-blue-800 dark:text-blue-300 leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
