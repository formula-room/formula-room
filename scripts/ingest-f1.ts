import dotenv from "dotenv";

import { ingestRange } from "@/lib/f1/ingest-service";

dotenv.config({ path: ".env.local" });
dotenv.config();

function parseYear(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function main() {
  const currentYear = new Date().getUTCFullYear();
  const startYear = parseYear(process.env.F1_INGEST_START_YEAR, 1950);
  const endYear = parseYear(process.env.F1_INGEST_END_YEAR, currentYear);

  if (startYear > endYear) {
    throw new Error("F1_INGEST_START_YEAR cannot be greater than F1_INGEST_END_YEAR.");
  }

  const result = await ingestRange({ startYear, endYear });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
