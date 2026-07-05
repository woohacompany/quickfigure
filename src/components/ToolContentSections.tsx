import type { Locale } from "@/lib/dictionaries";
import { getToolContent } from "@/lib/tool-content";

/* ── "이 도구는?" — rendered ABOVE the tool UI ── */
export function ToolAbout({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const data = getToolContent(slug);
  if (!data) return null;
  const about = data.about[locale];
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">
        {locale === "ko" ? "이 도구는?" : "About This Tool"}
      </h2>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
        {about}
      </p>
    </section>
  );
}

/* ── "계산 원리 / 작동 방식" — rendered BELOW How to Use ── */
export function ToolHowItWorks({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const data = getToolContent(slug);
  if (!data) return null;
  const content = data.howItWorks[locale];
  const title = data.howItWorksTitle?.[locale]
    ?? (locale === "ko" ? "작동 방식" : "How It Works");
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-3">
        {content.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

/* ── "주의사항 / 면책" — YMYL tools only ── */
export function ToolDisclaimer({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const data = getToolContent(slug);
  if (!data?.disclaimer) return null;
  return (
    <section className="mt-12 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5">
      <h2 className="text-base font-semibold mb-2 text-amber-800 dark:text-amber-300">
        {locale === "ko" ? "⚠️ 주의사항" : "⚠️ Disclaimer"}
      </h2>
      <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
        {data.disclaimer[locale]}
      </p>
    </section>
  );
}
