import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";

export type NewsArticleView = {
  id: number;
  headline: string;
  excerpt: string | null;
  imageUrl: string | null;
  category: string | null;
  teamName: string | null;
  teamColor: string | null;
  isBreaking: boolean;
  source: string | null;
  author: string | null;
  href: string | null;
  publishedAt: string;
};

export function NewsSlide({ article }: { article: NewsArticleView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <div className="grid min-h-[260px] grid-cols-[58%_42%]">
      <div className="relative overflow-hidden bg-[var(--color-ink)]">
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.headline}
            fill
            className="object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink)] to-[var(--color-bg3)]" />
        )}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.08)]" />
        {article.isBreaking ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-[4px] bg-[var(--color-red)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Breaking
          </span>
        ) : article.category ? (
          <span
            className="absolute left-3 top-3 inline-flex items-center rounded-[4px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.8px] text-white"
            style={{ backgroundColor: article.teamColor ?? "var(--color-ink)" }}
          >
            {article.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col justify-center gap-2 border-l border-[var(--color-line2)] px-6 py-5">
        {article.teamName ? (
          <span
            className="text-[10px] font-bold uppercase tracking-[0.8px]"
            style={{ color: article.teamColor ?? "var(--color-ink3)" }}
          >
            {article.teamName}
          </span>
        ) : null}
        <h3
          className={cn(
            "text-[18px] font-medium leading-snug",
            article.isBreaking ? "text-[var(--color-red)]" : "text-ink",
          )}
        >
          {article.headline}
        </h3>
        {article.excerpt ? (
          <p className="line-clamp-3 text-[12px] font-light text-ink3">{article.excerpt}</p>
        ) : null}
        <div className="flex items-center gap-2 text-[11px] text-ink3">
          <span>{relativeTime}</span>
          {article.author ? (
            <>
              <span aria-hidden="true">·</span>
              <span>By {article.author}</span>
            </>
          ) : null}
        </div>
        {article.href ? (
          <Link
            href={article.href}
            className="mt-1 text-[12px] font-medium text-[var(--color-red)] transition-colors hover:underline"
          >
            Read full story →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
