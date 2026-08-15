"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import type { NewsArticleView } from "@/components/news/NewsSlide";

function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const WRAPPER_CLASSES =
  "group relative isolate z-0 block h-full rounded-[12px] hover:z-10 focus-visible:z-10 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2";

const INNER_CLASSES =
  "flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-line2)] bg-white transition-transform duration-[280ms] ease-out group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0";

function NewsCard({ article }: { article: NewsArticleView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  const tag = article.isBreaking ? "Breaking" : article.category;

  const inner = (
    <div className={INNER_CLASSES}>
      <div
        className="relative aspect-[16/10] w-full shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${article.teamColor ?? "#17140F"}33, #17140F)` }}
      >
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.headline}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[280ms] ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        {tag ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--color-red)]">{tag}</span>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.6em] text-[15px] font-medium leading-snug text-ink">{article.headline}</h3>
        <p className="text-[11px] text-ink3">{formatNewsDate(article.publishedAt)}</p>
      </div>
    </div>
  );

  if (article.href) {
    return (
      <Link href={article.href} className={WRAPPER_CLASSES}>
        {inner}
      </Link>
    );
  }

  return <div className={cn(WRAPPER_CLASSES, "cursor-default")}>{inner}</div>;
}

export function NewsGrid({ articles }: { articles: NewsArticleView[] }) {
  const [cardsPerView, setCardsPerView] = useState(3);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerRevealed, setContainerRevealed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqSm = window.matchMedia("(min-width: 640px)");

    function update() {
      setCardsPerView(mqLg.matches ? 3 : mqSm.matches ? 2 : 1);
    }

    update();
    mqLg.addEventListener("change", update);
    mqSm.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqSm.removeEventListener("change", update);
    };
  }, []);

  const pages = useMemo(() => {
    const chunks: NewsArticleView[][] = [];
    for (let i = 0; i < articles.length; i += cardsPerView) {
      chunks.push(articles.slice(i, i + cardsPerView));
    }
    return chunks;
  }, [articles, cardsPerView]);

  const page = Math.min(currentPage, Math.max(pages.length - 1, 0));

  if (articles.length === 0) {
    return null;
  }

  const gridColsClass = cardsPerView === 3 ? "grid-cols-3" : cardsPerView === 2 ? "grid-cols-2" : "grid-cols-1";

  function goTo(index: number) {
    if (index < 0 || index >= pages.length) {
      return;
    }
    setCurrentPage(index);
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) {
      return;
    }
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    const threshold = 40;
    if (delta > threshold) {
      goTo(page - 1);
    } else if (delta < -threshold) {
      goTo(page + 1);
    }
    touchStartX.current = null;
  }

  return (
    <ScrollReveal delayMs={240} onReveal={() => setContainerRevealed(true)}>
    <section className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--color-red)] to-transparent opacity-70" />
      <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-6 py-5">
        <h2 className="font-display text-[22px] leading-none tracking-[1px] text-ink">Latest News</h2>
        <Link href="/news" className="text-[12px] font-medium text-[var(--color-red)] transition-colors hover:underline">
          View all news →
        </Link>
      </div>

      <div className="flex items-center gap-2 px-3 py-5 sm:gap-4 sm:px-4">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          aria-label="Previous articles"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line2)] bg-white text-ink transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div
          className="min-w-0 flex-1 overflow-hidden pt-[10px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((pageArticles, pageIndex) => (
              <div key={pageIndex} className={cn("grid w-full shrink-0 grid-flow-row gap-4 px-2", gridColsClass)}>
                {pageArticles.map((article, articleIndex) => (
                  <ScrollReveal key={`${article.id}-${containerRevealed}`} delayMs={240 + articleIndex * 90} disabled={!containerRevealed}>
                    <NewsCard article={article} />
                  </ScrollReveal>
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page === pages.length - 1}
          aria-label="Next articles"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-line2)] bg-white text-ink transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {pages.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 pb-5">
          {pages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to page ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === page ? "w-[18px] bg-[var(--color-red)]" : "w-1.5 bg-[var(--color-ink3)]",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
    </ScrollReveal>
  );
}
