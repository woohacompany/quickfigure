"use client";

export function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700 -mx-4 sm:mx-0">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3.5 text-left font-semibold text-neutral-700 dark:text-neutral-200 whitespace-nowrap"
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
              className={`border-t border-neutral-100 dark:border-neutral-800 transition-colors ${
                i % 2 === 1 ? "bg-neutral-50/60 dark:bg-neutral-800/30" : ""
              } hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50`}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3.5 text-neutral-700 dark:text-neutral-300"
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
