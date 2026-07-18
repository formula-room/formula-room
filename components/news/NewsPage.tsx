"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { cn } from "@/lib/utils";
import { NewsArticleRow } from "@/components/news/NewsArticleRow";
import type { NewsArticleView } from "@/components/news/NewsSlide";

const CATEGORIES = ["All", "Race", "Qualifying", "Technical", "Championship", "Breaking"] as const;

function matchesCategory(article: NewsArticleView, activeCategory: string) {
  if (activeCategory === "All") {
    return true;
  }
  if (activeCategory === "Breaking") {
    return article.isBreaking;
  }
  return article.category === activeCategory;
}

export function NewsPageView() {
  const [articles, setArticles] = useState<NewsArticleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setLoading(true);
      setError(null);

      try {
        const payload = await fetchInternalApi<{ articles: NewsArticleView[] }>("/api/news");
        if (!cancelled) {
          setArticles(payload.articles);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load news.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      if (!matchesCategory(article, activeCategory)) {
        return false;
      }
      if (query && !article.headline.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [articles, activeCategory, search]);

  function clearFilters() {
    setActiveCategory("All");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      <section className="animate-fade-up animate-fade-up-1">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-[var(--color-red)]">
          Newsroom
        </p>
        <h1 className="font-display text-[54px] leading-[0.9] tracking-[1px] text-ink">Latest News</h1>
      </section>

      <section className="flex flex-col gap-4 animate-fade-up animate-fade-up-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[1px] transition-colors",
                activeCategory === category
                  ? "border-ink bg-ink text-white"
                  : "border-[var(--color-line2)] bg-transparent text-ink2 hover:bg-[var(--color-bg)]",
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <label className="relative block w-full sm:w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search headlines"
            className="h-10 w-full rounded-full border border-[var(--color-line2)] bg-white pl-9 pr-4 text-sm text-ink outline-none transition focus:border-[var(--color-red-border)]"
          />
        </label>
      </section>

      <section className="flex flex-col gap-[10px] animate-fade-up animate-fade-up-3">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 text-center text-sm text-ink2">
            Loading news...
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 text-center text-sm text-ink2">
            {error}
          </div>
        ) : filteredArticles.length > 0 ? (
          filteredArticles.map((article) => <NewsArticleRow key={article.id} article={article} />)
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 text-center">
            <Search className="h-8 w-8 text-ink3" />
            <p className="text-sm font-medium text-ink2">No articles found</p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[var(--color-line2)] px-4 py-2 text-xs font-semibold uppercase tracking-[1px] text-ink2 transition-colors hover:bg-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
