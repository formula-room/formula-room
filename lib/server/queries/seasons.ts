import "server-only";

import { desc } from "drizzle-orm";

import { getDatabase } from "@/lib/db/client";
import { seasons } from "@/lib/db/schema";

export async function getSeasonsList() {
  const { db } = getDatabase();

  return db
    .select({
      year: seasons.year,
    })
    .from(seasons)
    .orderBy(desc(seasons.year));
}
