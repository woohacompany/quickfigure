"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import EmailSubscribeForm from "@/components/EmailSubscribeForm";

interface Tool {
  name: string;
  description: string;
  href: string;
  tags?: string[];
}

interface Category {
  id: string;
  title: string;
  description: string;
  color: string;
  tools: Tool[];
}

interface PopularTool extends Tool {
  icon: string;
}

interface BlogPost {
  slug: string;
  href: string;
  title: string;
  summary: string;
  category: string;
  date: string;
}

interface SearchResult {
  name: string;
  description: string;
  href: string;
  categoryTitle: string;
  score: number;
  matchedTag?: string;
}

const categoryColorMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
  blue: { border: "border-blue-200 dark:border-blue-800", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", hover: "hover:border-blue-400 dark:hover:border-blue-600" },
  emerald: { border: "border-emerald-200 dark:border-emerald-800", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", hover: "hover:border-emerald-400 dark:hover:border-emerald-600" },
  orange: { border: "border-orange-200 dark:border-orange-800", bg: "bg-orange-50 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300", hover: "hover:border-orange-400 dark:hover:border-orange-600" },
  violet: { border: "border-violet-200 dark:border-violet-800", bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", hover: "hover:border-violet-400 dark:hover:border-violet-600" },
  cyan: { border: "border-cyan-200 dark:border-cyan-800", bg: "bg-cyan-50 dark:bg-cyan-950", text: "text-cyan-700 dark:text-cyan-300", hover: "hover:border-cyan-400 dark:hover:border-cyan-600" },
  pink: { border: "border-pink-200 dark:border-pink-800", bg: "bg-pink-50 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300", hover: "hover:border-pink-400 dark:hover:border-pink-600" },
  amber: { border: "border-amber-200 dark:border-amber-800", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", hover: "hover:border-amber-400 dark:hover:border-amber-600" },
  slate: { border: "border-slate-200 dark:border-slate-800", bg: "bg-slate-50 dark:bg-slate-950", text: "text-slate-700 dark:text-slate-300", hover: "hover:border-slate-400 dark:hover:border-slate-600" },
};

export default function HomeClient({
  lang,
  t,
  categories,
  popularTools,
  latestPosts,
  toolCount,
  blogCount,
}: {
  lang: string;
  t: Dictionary;
  categories: Category[];
  popularTools: PopularTool[];
  latestPosts: BlogPost[];
  toolCount: number;
  blogCount: number;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input (200ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allTools = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.tools.map((tool) => ({ ...tool, categoryId: cat.id, categoryTitle: cat.title }))
    );
  }, [categories]);

  // Scored search: name (10) > tag exact (8) > tag partial (5) > description (3)
  const searchResults: SearchResult[] = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();

    const scored: SearchResult[] = [];

    for (const tool of allTools) {
      let score = 0;
      let matchedTag: string | undefined;
      const nameLower = tool.name.toLowerCase();
      const descLower = tool.description.toLowerCase();

      // Name match (highest priority)
      if (nameLower === q) {
        score += 20;
      } else if (nameLower.startsWith(q)) {
        score += 15;
      } else if (nameLower.includes(q)) {
        score += 10;
      }

      // Tag match
      if (tool.tags) {
        for (const tag of tool.tags) {
          const tagLower = tag.toLowerCase();
          if (tagLower === q) {
            score += 8;
            matchedTag = tag;
            break;
          } else if (tagLower.includes(q) || q.includes(tagLower)) {
            if (!matchedTag || tagLower.includes(q)) {
              score = Math.max(score, score === 0 ? 5 : score);
              if (score >= 5) matchedTag = tag;
            }
          }
        }
      }

      // Description match (lowest priority)
      if (descLower.includes(q)) {
        score += 3;
      }

      if (score > 0) {
        scored.push({
          name: tool.name,
          description: tool.description,
          href: tool.href,
          categoryTitle: tool.categoryTitle,
          score,
          matchedTag,
        });
      }
    }

    // Sort by score descending, then alphabetically
    scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    return scored.slice(0, 8);
  }, [debouncedQuery, allTools]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchResults]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) return;

      const hasResults = searchResults.length > 0;
      const noResults = debouncedQuery.trim() && !hasResults;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hasResults) {
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hasResults) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (hasResults && selectedIndex >= 0 && selectedIndex < searchResults.length) {
          router.push(searchResults[selectedIndex].href);
          setShowDropdown(false);
        }
      } else if (e.key === "Escape") {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    },
    [showDropdown, searchResults, selectedIndex, debouncedQuery, router]
  );

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(`category-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const noResultsText = lang === "ko"
    ? "검색 결과가 없습니다. 다른 키워드로 검색해보세요."
    : "No results found. Try a different keyword.";

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="pt-12 pb-10 sm:pt-16 sm:pb-14 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight animate-fade-in">
          {t.home.hero}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto animate-fade-in-delay">
          {t.home.heroSub}
        </p>

        {/* Value badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in-delay-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>🔒</span> {t.home.badge1}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>⚡</span> {t.home.badge2}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <span>🌐</span> {t.home.badge3}
          </span>
        </div>

        {/* Search bar */}
        <div className="mt-8 max-w-xl mx-auto relative" ref={searchRef}>
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => searchQuery && setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder={t.home.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 text-base rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors shadow-sm"
            />
          </div>
          {showDropdown && debouncedQuery.trim() && (
            <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                searchResults.map((tool, index) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors border-b border-neutral-100 dark:border-neutral-800 last:border-0 ${
                      index === selectedIndex
                        ? "bg-blue-50 dark:bg-blue-950/50"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                    onClick={() => setShowDropdown(false)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{tool.name}</p>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                          {tool.categoryTitle}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">{tool.description}</p>
                      {tool.matchedTag && (
                        <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5">
                          {lang === "ko" ? "연관" : "match"}: {tool.matchedTag}
                        </p>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-neutral-400">
                  {noResultsText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats counter */}
        <div className="mt-8 flex justify-center gap-8 sm:gap-12 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{toolCount}+</p>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{t.trustSection.tools}</p>
          </div>
          <div className="w-px bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{blogCount}+</p>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{t.trustSection.blog}</p>
          </div>
          <div className="w-px bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <p className="text-2xl sm:text-3xl font-bold">{t.trustSection.languagesValue}</p>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{t.trustSection.languages}</p>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">🔥 {t.home.popularTools}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {popularTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <span className="text-2xl">{tool.icon}</span>
              <h3 className="mt-2 font-medium text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tool.name}
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Navigation Tabs */}
      <nav className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => {
            const colors = categoryColorMap[cat.color] || categoryColorMap.slate;
            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${colors.border} ${colors.text} ${colors.hover} ${colors.bg}`}
              >
                {cat.title}
                <span className="ml-1.5 opacity-60">({cat.tools.length})</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Category Sections */}
      <div className="py-8 space-y-12">
        {categories.map((cat) => {
          const colors = categoryColorMap[cat.color] || categoryColorMap.slate;
          return (
            <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-16">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{cat.title}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {cat.tools.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{cat.description}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`group block rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${colors.border} ${colors.hover}`}
                  >
                    <h3 className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Blog Section */}
      <section className="py-10 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">📚 {t.home.guidesAndTips}</h2>
          <Link
            href={`/${lang}/blog`}
            className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
          >
            {t.blog.viewAll} &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <article key={post.slug}>
              <Link
                href={post.href}
                className="group block rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 hover:border-neutral-400 dark:hover:border-neutral-500 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-neutral-400">{post.date}</span>
                </div>
                <h3 className="font-medium leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                  {post.summary}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-10 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-xl font-bold mb-4">{t.home.aboutSectionTitle}</h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          {t.home.aboutSectionText}
        </p>
      </section>

      {/* Email Subscribe */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 -mx-4 px-4 rounded-xl">
        <EmailSubscribeForm lang={lang} source="homepage" />
      </section>
    </div>
  );
}
