import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type DatabaseBundle = {
  client: postgres.Sql;
  db: ReturnType<typeof drizzle<typeof schema>>;
};

declare global {
  var __f1DatabaseBundle__: DatabaseBundle | undefined;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return url;
}

export function getDatabase() {
  if (!global.__f1DatabaseBundle__) {
    const client = postgres(getDatabaseUrl(), {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    global.__f1DatabaseBundle__ = {
      client,
      db: drizzle(client, { schema }),
    };
  }

  return global.__f1DatabaseBundle__;
}
