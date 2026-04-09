"use client";

export function SummaryBox({
  title,
  items,
}: {
  title?: string;
  items: string[];
}) {
  return (
    <div className="my-8 rounded-xl bg-gray-50 dark:bg-neutral-800/60 p-6 sm:p-7">
      <p className="font-semibold text-base mb-4">
        {title ?? "\uD83D\uDCCC \uC774 \uAE00\uC5D0\uC11C \uC54C \uC218 \uC788\uB294 \uAC83"}
      </p>
      <ul className="space-y-3">
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
