import Image from "next/image";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import type { NewsArticleView } from "@/components/news/NewsSlide";

export function NewsArticleRow({ article }: { article: NewsArticleView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "grid min-h-[88px] grid-cols-[140px_1fr_100px] overflow-hidden rounded-[12px] border border-[var(--color-line2)] bg-white transition-all hover:-translate-y-px hover:border-[var(--color-line3)] hover:shadow-[0_6px_20px_rgba(23,20,15,0.08)]",
        article.isBreaking && "border-[rgba(200,32,26,0.22)] border-l-[3px] border-l-[var(--color-red)]",
      )}
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${article.teamColor ?? "#17140F"}33, #17140F)`,
        }}
      >
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.headline}
            fill
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : null}

        {article.isBreaking ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-[3px] bg-[var(--color-red)] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.6px] text-white">
            <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
            Breaking
          </span>
        ) : (
          <span
            className="absolute left-2 top-2 h-2 w-2 rounded-full"
            style={{ backgroundColor: article.teamColor ?? "var(--color-ink3)" }}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1 border-l border-[var(--color-line)] px-6">
        {article.teamName ? (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.8px]"
            style={{ color: article.teamColor ?? "var(--color-ink3)" }}
          >
            {article.teamName}
          </span>
        ) : null}
        <h3
          className={cn(
            "line-clamp-2 text-[14px] font-medium leading-snug",
            article.isBreaking ? "text-[var(--color-red)]" : "text-ink",
          )}
        >
          {article.headline}
        </h3>
      </div>

      <div className="flex flex-col items-end justify-center gap-1.5 px-5 text-right">
        <span className="text-[10px] text-ink3">{relativeTime}</span>
        {article.category ? (
          <span className="inline-flex items-center rounded-full bg-[var(--color-bg2)] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.5px] text-ink3">
            {article.category}
          </span>
        ) : null}
      </div>
    </div>
  );
}
