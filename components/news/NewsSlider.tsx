"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { NewsSlide, type NewsArticleView } from "@/components/news/NewsSlide";

const AUTO_ADVANCE_MS = 5000;

export function NewsSlider({ articles }: { articles: NewsArticleView[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || articles.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = current + 1 >= articles.length ? 0 : current + 1;
        setDirection(next > current ? "forward" : "backward");
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isPaused, articles.length]);

  if (articles.length === 0) {
    return null;
  }

  function goTo(index: number) {
    if (index === activeIndex || index < 0 || index >= articles.length) {
      return;
    }
    setDirection(index > activeIndex ? "forward" : "backward");
    setActiveIndex(index);
  }

  const activeArticle = articles[activeIndex];

  return (
    <div
      className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-end justify-between gap-4 border-b border-[var(--color-line)] px-7 py-5">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-[22px] leading-none tracking-[1px] text-ink">Latest News</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-red-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.6px] text-[var(--color-red)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-red)] animate-pulse" />
            Live
          </span>
        </div>
        <Link
          href="/news"
          className="text-[12px] font-medium text-[var(--color-red)] transition-colors hover:underline"
        >
          View all news →
        </Link>
      </div>

      <div className="relative">
        <div
          key={activeArticle.id}
          className={direction === "forward" ? "animate-slide-in-r" : "animate-slide-in-l"}
        >
          <NewsSlide article={activeArticle} />
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="Previous story"
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition-opacity hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === articles.length - 1}
          aria-label="Next story"
          className="absolute right-[calc(42%_+_0.75rem)] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition-opacity hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to story ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-[18px] bg-[var(--color-red)]" : "w-1.5 bg-[var(--color-ink3)]",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
