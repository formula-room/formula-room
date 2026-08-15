import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { NewsArticleView } from "@/components/news/NewsSlide";

function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const WRAPPER_CLASSES =
  "group relative isolate z-0 block rounded-[12px] hover:z-10 focus-visible:z-10 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-red)] focus-visible:ring-offset-2";

const INNER_CLASSES =
  "flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-line2)] bg-white transition-transform duration-[280ms] ease-out group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0";

export function NewsArticleRow({ article }: { article: NewsArticleView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  const tag = article.isBreaking ? "Breaking" : article.category;

  const inner = (
    <div className={INNER_CLASSES}>
      <div
        className="relative aspect-[4/3] w-full shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${article.teamColor ?? "#17140F"}33, #17140F)` }}
      >
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.headline}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[280ms] ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        {tag ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--color-red)]">{tag}</span>
        ) : null}
        <h3 className="text-[16px] font-medium leading-snug text-ink">{article.headline}</h3>
        <p className="text-[11px] text-ink3">{formatNewsDate(article.publishedAt)}</p>
        {article.excerpt ? (
          <p className="line-clamp-3 text-[13px] leading-relaxed text-ink2">{article.excerpt}</p>
        ) : null}
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
