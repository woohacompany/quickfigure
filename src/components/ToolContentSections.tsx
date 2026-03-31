import Link from "next/link";
import type { Locale } from "@/lib/dictionaries";
import { getToolContent } from "@/lib/tool-content";
import { getPostsByTool, type BlogPost } from "@/lib/blog";

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

/* ── "관련 가이드" — blog posts linked to this tool ── */
export function ToolRelatedGuides({
  slug,
  locale,
  lang,
}: {
  slug: string;
  locale: Locale;
  lang: string;
}) {
  const posts = getPostsByTool(slug, 3);
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
      <h2 className="text-xl font-semibold mb-4">
        {locale === "ko" ? "관련 가이드" : "Related Guides"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: BlogPost) => {
          const tr = post.translations[locale];
          return (
            <Link
              key={post.slug}
              href={`/${lang}/blog/${post.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              <span className="text-xs text-neutral-400">{post.date}</span>
              <h3 className="mt-1 font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tr.title}
              </h3>
              <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {tr.summary}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
