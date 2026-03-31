import Link from "next/link";
import type { Locale } from "@/lib/dictionaries";
import type { Author } from "@/lib/authors";
import type { BlogPost } from "@/lib/blog";

/* ── Inline byline (used in blog header) ── */
export function AuthorByline({
  author,
  locale,
}: {
  author: Author;
  locale: Locale;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${author.color} ${author.textColor}`}
      >
        {author.initials}
      </span>
      <span className="text-sm text-neutral-600 dark:text-neutral-400">
        {author.name[locale]}
      </span>
    </span>
  );
}

/* ── Full profile card (used at bottom of blog post) ── */
export function AuthorCard({
  author,
  locale,
  lang,
  otherPosts,
  moreLabel,
}: {
  author: Author;
  locale: Locale;
  lang: string;
  otherPosts: BlogPost[];
  moreLabel: string;
}) {
  return (
    <section className="mt-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold ${author.color} ${author.textColor}`}
        >
          {author.initials}
        </div>
        {/* Info */}
        <div className="min-w-0">
          <p className="font-semibold text-base">{author.name[locale]}</p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {author.bio[locale]}
          </p>
        </div>
      </div>

      {/* Other posts by this author */}
      {otherPosts.length > 0 && (
        <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
            {moreLabel}
          </p>
          <ul className="space-y-2">
            {otherPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${lang}/blog/${p.slug}`}
                  className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug"
                >
                  {p.translations[locale].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
