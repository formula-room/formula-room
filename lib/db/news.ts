import "server-only";

import { and, desc, eq, ne } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { newsArticles } from "@/lib/db/schema";

export type NewsArticle = typeof newsArticles.$inferSelect;

export async function getLatestNews(limit = 5): Promise<NewsArticle[]> {
  const { db } = getDatabase();

  return db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.isVisible, true))
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit);
}

export async function getArticleById(id: number): Promise<NewsArticle | undefined> {
  const { db } = getDatabase();

  const [article] = await db
    .select()
    .from(newsArticles)
    .where(and(eq(newsArticles.id, id), eq(newsArticles.isVisible, true)))
    .limit(1);

  return article;
}

export async function getRelatedArticles(excludeId: number, limit = 3): Promise<NewsArticle[]> {
  const { db } = getDatabase();

  return db
    .select()
    .from(newsArticles)
    .where(and(ne(newsArticles.id, excludeId), eq(newsArticles.isVisible, true)))
    .orderBy(desc(newsArticles.publishedAt))
    .limit(limit);
}
