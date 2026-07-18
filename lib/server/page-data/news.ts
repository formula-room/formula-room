import "server-only";

import { getLatestNews } from "@/lib/db/news";
import type { NewsArticleView } from "@/components/news/NewsSlide";

function mapNewsArticles(rows: Awaited<ReturnType<typeof getLatestNews>>): NewsArticleView[] {
  return rows.map((row) => ({
    id: row.id,
    headline: row.headline,
    excerpt: row.excerpt,
    imageUrl: row.imageUrl,
    category: row.category,
    teamName: row.teamName,
    teamColor: row.teamColor,
    isBreaking: row.isBreaking,
    source: row.source,
    author: row.author,
    href: row.href,
    publishedAt: row.publishedAt.toISOString(),
  }));
}

export async function getNewsPageData() {
  const rows = await getLatestNews(50);
  return {
    articles: mapNewsArticles(rows),
  };
}
