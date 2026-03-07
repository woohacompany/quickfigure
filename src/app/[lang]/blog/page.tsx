"use client";

import { useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getDictionary, isValidLocale, type Locale } from "@/lib/dictionaries";
import {
  blogPosts,
  categoryLabels,
  getPaginatedPosts,
  getPostsByCategory,
  type BlogCategory,
} from "@/lib/blog";

export default function BlogListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (isValidLocale(lang) ? lang : "en") as Locale;
  const t = getDictionary(locale).blog;

  const [category, setCategory] = useState<BlogCategory | "all">("all");
  const [page, setPage] = useState(1);

  const filtered = getPostsByCategory(category);
  const { posts, totalPages } = getPaginatedPosts(filtered, page);

  const categories: (BlogCategory | "all")[] = ["all", "text-tools", "developer-tools", "generators", "finance", "lifestyle"];

  function selectCategory(c: BlogCategory | "all") {
    setCategory(c);
    setPage(1);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">{t.description}</p>
      </header>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => {
          const label = c === "all" ? t.all : categoryLabels[c][locale];
          return (
            <button
              key={c}
              onClick={() => selectCategory(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                category === c
                  ? "bg-foreground text-background border-foreground"
                  : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Ad placeholder */}
      {/* <div className="mb-8"><ins className="adsbygoogle" data-ad-client="ca-pub-XXXXXXX" data-ad-slot="XXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins></div> */}

      {/* Post Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => {
          const tr = post.translations[locale];
          return (
            <Link
              key={post.slug}
              href={`/${lang}/blog/${post.slug}`}
              className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
            >
              {/* Thumbnail placeholder */}
              <div
                className="w-full h-40 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                role="img"
                aria-label={post.thumbnailAlt[locale]}
              >
                <span className="text-3xl text-neutral-300 dark:text-neutral-600">
                  {post.category === "text-tools" ? "Aa" : post.category === "developer-tools" ? "</>" : post.category === "finance" ? "$" : post.category === "lifestyle" ? "♡" : "***"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                    {categoryLabels[post.category][locale]}
                  </span>
                  <span className="text-xs text-neutral-400">{post.date}</span>
                  <span className="text-xs text-neutral-400">
                    {post.readingTime} {t.minRead}
                  </span>
                </div>
                <h2 className="font-semibold leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tr.title}
                </h2>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {tr.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-neutral-400 py-12">{t.noPosts}</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                page === p
                  ? "bg-foreground text-background border-foreground"
                  : "border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
