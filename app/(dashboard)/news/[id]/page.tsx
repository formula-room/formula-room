import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticleById, getRelatedArticles, type NewsArticle } from "@/lib/db/news";

type NewsArticleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getInitials(name: string | null) {
  const source = name ?? "Formula Room";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getReadMinutes(content: string | null) {
  const words = content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.ceil(words / 220));
}

function ArticleBody({ content }: { content: string | null }) {
  const paragraphs = (content?.trim() || "Full article copy is being prepared.")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className="animate-fade-up animate-fade-up-3">
      {paragraphs.map((paragraph, index) => {
        const isQuote = paragraph.startsWith(">");
        const text = isQuote ? paragraph.replace(/^>\s*/, "") : paragraph;

        if (isQuote) {
          return (
            <blockquote
              key={`${text}-${index}`}
              className="my-8 rounded-r-[8px] border-l-[3px] border-[var(--color-red)] bg-[rgba(200,32,26,0.04)] px-5 py-3 text-[17px] font-normal italic leading-[1.8] text-ink"
            >
              {text}
            </blockquote>
          );
        }

        return (
          <p
            key={`${text}-${index}`}
            className="mb-6 text-[15px] font-light leading-[1.8] text-[rgba(23,20,15,0.75)]"
          >
            {text}
          </p>
        );
      })}
    </section>
  );
}

function MoreArticleRow({ article }: { article: NewsArticle }) {
  const publishedAt = format(article.publishedAt, "d MMM");

  return (
    <Link
      href={`/news/${article.id}`}
      className="grid min-h-[80px] grid-cols-[80px_1fr_auto] gap-0 overflow-hidden rounded-[10px] border border-[var(--color-line2)] bg-white transition-all hover:-translate-y-px hover:border-[var(--color-line3)] hover:shadow-[0_6px_20px_rgba(23,20,15,0.08)]"
    >
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${article.teamColor ?? "#17140F"}33, #17140F)`,
        }}
      >
        {article.imageUrl ? (
          <Image src={article.imageUrl} alt={article.headline} fill className="object-cover" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 border-l border-[var(--color-line)] px-4">
        {article.teamName ? (
          <span
            className="text-[9px] font-bold uppercase tracking-[0.8px]"
            style={{ color: article.teamColor ?? "var(--color-ink3)" }}
          >
            {article.teamName}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{article.headline}</h3>
      </div>
      <div className="flex items-center px-4 text-right text-[10px] text-ink3">{publishedAt}</div>
    </Link>
  );
}

export default async function NewsArticleDetailPage({ params }: NewsArticleDetailPageProps) {
  const { id } = await params;
  const articleId = Number(id);

  if (!Number.isInteger(articleId)) {
    notFound();
  }

  const article = await getArticleById(articleId);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.id, 3);
  const teamColor = article.teamColor ?? "var(--color-red)";
  const author = article.author ?? "Formula Room";
  const publishedAt = `${format(article.publishedAt, "d MMM yyyy")} · ${format(article.publishedAt, "HH:mm 'UTC'")}`;
  const tags = [article.category, article.teamName].filter((tag): tag is string => Boolean(tag));

  return (
    <main className="mx-auto max-w-[740px]">
      <Link
        href="/news"
        className="mb-7 inline-flex animate-fade-up animate-fade-up-1 text-[11px] font-medium text-ink3 transition-colors hover:text-ink"
      >
        ← Back to Latest News
      </Link>

      <header className="animate-fade-up animate-fade-up-1">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.8px]" style={{ color: teamColor }}>
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: teamColor }} />
          <span>
            {[article.teamName, article.category].filter(Boolean).join(" · ")}
          </span>
        </div>
        <h1 className="font-display text-[46px] leading-none text-ink">{article.headline}</h1>

        <div className="mt-6 flex items-center justify-between gap-5 border-y border-[var(--color-line)] py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(200,32,26,0.1)] text-[12px] font-semibold text-[var(--color-red)]">
              {getInitials(author)}
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink">{author}</p>
              <p className="text-[11px] text-ink3">Formula Room · Staff Writer</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-ink3">{publishedAt}</p>
            <p className="text-[11px] text-ink3">{getReadMinutes(article.content)} min read</p>
          </div>
        </div>
      </header>

      <section className="relative my-8 aspect-video overflow-hidden rounded-[12px] bg-[var(--color-ink)] animate-fade-up animate-fade-up-2">
        {article.imageUrl ? (
          <Image src={article.imageUrl} alt={article.headline} fill priority className="object-contain" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink)] via-[rgba(23,20,15,0.82)] to-[var(--color-red)]" />
        )}
      </section>

      <ArticleBody content={article.content} />

      <section className="mt-8 border-t border-[var(--color-line)] pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-ink3">Tags:</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--color-line2)] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.6px] text-ink3 transition-colors hover:border-[var(--color-line3)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="font-display text-[24px] leading-none text-ink">More articles</h2>
            <div className="h-px flex-1 bg-[var(--color-line)]" />
          </div>
          <div className="flex flex-col gap-2">
            {relatedArticles.map((relatedArticle) => (
              <MoreArticleRow key={relatedArticle.id} article={relatedArticle} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
