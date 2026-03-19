"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import {
  blogPosts,
  blogTagLabels,
  blogTagColors,
  blogTagOrder,
  categoryLabels,
  getPostsByTag,
  getPostTags,
  getTagCounts,
  getFeaturedPosts,
  POSTS_PER_PAGE,
  type BlogTag,
} from "@/lib/blog";
import BlogHeroImage from "@/components/BlogHeroImage";

export default function BlogListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale).blog;

  const [tag, setTag] = useState<BlogTag | "all">("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const listRef = useRef<HTMLDivElement>(null);

  const tagCounts = useMemo(() => getTagCounts(), []);
  const featured = useMemo(() => getFeaturedPosts(), []);

  const filtered = useMemo(() => {
    let posts = getPostsByTag(tag);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter((p) => {
        const tr = p.translations[locale];
        const catLabel = categoryLabels[p.category]?.[locale] || "";
        const tags = getPostTags(p.slug);
        const tagLabels = tags.map((tg) => blogTagLabels[tg][locale]).join(" ");
        return (
          tr.title.toLowerCase().includes(q) ||
          tr.summary.toLowerCase().includes(q) ||
          catLabel.toLowerCase().includes(q) ||
          tagLabels.toLowerCase().includes(q)
        );
      });
    }
    return posts;
  }, [tag, search, locale]);

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function selectTag(t: BlogTag | "all") {
    setTag(t);
    setVisibleCount(POSTS_PER_PAGE);
  }

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [search]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* ── Hero Section ── */}
      <header className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-3 text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
          {t.description}
        </p>
      </header>

      {/* ── Featured Guides ── */}
      <section className="mb-14">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          <span className="text-lg">&#x1F4CC;</span> {t.featured}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((post) => {
            const tr = post.translations[locale];
            const tags = getPostTags(post.slug);
            const primaryTag = tags[0];
            return (
              <Link
                key={post.slug}
                href={`/${lang}/blog/${post.slug}`}
                className="group block rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <BlogHeroImage
                  category={post.category}
                  alt={post.thumbnailAlt[locale]}
                  size="small"
                  heroImages={post.heroImages}
                />
                <div className="p-4">
                  {primaryTag && (
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${blogTagColors[primaryTag]}`}
                    >
                      {blogTagLabels[primaryTag][locale]}
                    </span>
                  )}
                  <h3 className="font-semibold text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {tr.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Search ── */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* ── Category Tags ── */}
      <nav className="mb-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-1">
          <button
            onClick={() => selectTag("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              tag === "all"
                ? "bg-foreground text-background border-foreground"
                : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            }`}
          >
            {t.all} ({tagCounts.all})
          </button>
          {blogTagOrder.map((bt) => (
            <button
              key={bt}
              onClick={() => selectTag(bt)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                tag === bt
                  ? "bg-foreground text-background border-foreground"
                  : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {blogTagLabels[bt][locale]} ({tagCounts[bt]})
            </button>
          ))}
        </div>
      </nav>

      {/* ── Results count ── */}
      {search.trim() && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          {filtered.length} {t.showingResults}
        </p>
      )}

      {/* ── Post Grid ── */}
      <div ref={listRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post, i) => {
          const tr = post.translations[locale];
          const tags = getPostTags(post.slug);
          return (
            <article
              key={post.slug}
              className="animate-fadeIn"
              style={{ animationDelay: `${Math.min(i, 11) * 30}ms` }}
            >
              <Link
                href={`/${lang}/blog/${post.slug}`}
                className="group block rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full"
              >
                <BlogHeroImage
                  category={post.category}
                  alt={post.thumbnailAlt[locale]}
                  size="small"
                  heroImages={post.heroImages}
                />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {tags.map((tg) => (
                      <span
                        key={tg}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${blogTagColors[tg]}`}
                      >
                        {blogTagLabels[tg][locale]}
                      </span>
                    ))}
                    <span className="text-xs text-neutral-400 ml-auto whitespace-nowrap">
                      {post.date} · {post.readingTime} {t.minRead}
                    </span>
                  </div>
                  <h2 className="font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {tr.title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {tr.summary}
                  </p>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <p className="text-center text-neutral-400 py-16">{t.noPosts}</p>
      )}

      {/* ── Load More ── */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((c) => c + POSTS_PER_PAGE)}
            className="px-8 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {t.loadMore} ({filtered.length - visibleCount}{" "}
            {locale === "ko" ? "개 남음" : "remaining"})
          </button>
        </div>
      )}

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: t.title,
            description: t.description,
            url: `https://quickfigure.net/${lang}/blog`,
            inLanguage: locale === "ko" ? "ko-KR" : "en-US",
            publisher: {
              "@type": "Organization",
              name: "QuickFigure",
              url: "https://quickfigure.net",
            },
          }),
        }}
      />
    </main>
  );
}
