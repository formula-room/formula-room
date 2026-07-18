import {
  boolean,
  date,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const seasons = pgTable("seasons", {
  year: integer("year").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const circuits = pgTable("circuits", {
  circuitId: text("circuit_id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  locality: text("locality").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  driverId: text("driver_id").primaryKey(),
  givenName: text("given_name").notNull(),
  familyName: text("family_name").notNull(),
  code: text("code"),
  nationality: text("nationality").notNull(),
  dob: date("dob"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const constructors = pgTable("constructors", {
  constructorId: text("constructor_id").primaryKey(),
  name: text("name").notNull(),
  nationality: text("nationality").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const races = pgTable(
  "races",
  {
    raceId: integer("race_id").generatedAlwaysAsIdentity().primaryKey(),
    seasonYear: integer("season_year")
      .notNull()
      .references(() => seasons.year, { onDelete: "restrict" }),
    round: integer("round").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    date: date("date").notNull(),
    circuitId: text("circuit_id")
      .notNull()
      .references(() => circuits.circuitId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    seasonRoundUnique: uniqueIndex("races_season_round_unique").on(table.seasonYear, table.round),
    seasonSlugUnique: uniqueIndex("races_season_slug_unique").on(table.seasonYear, table.slug),
  }),
);

export const raceSessions = pgTable(
  "race_sessions",
  {
    raceId: integer("race_id")
      .notNull()
      .references(() => races.raceId, { onDelete: "cascade" }),
    sessionKey: text("session_key").notNull(),
    name: text("name").notNull(),
    date: date("date").notNull(),
    time: time("time", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.raceId, table.sessionKey] }),
  }),
);

export const raceResults = pgTable(
  "race_results",
  {
    raceId: integer("race_id")
      .notNull()
      .references(() => races.raceId, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => drivers.driverId, { onDelete: "restrict" }),
    constructorId: text("constructor_id")
      .notNull()
      .references(() => constructors.constructorId, { onDelete: "restrict" }),
    position: integer("position"),
    positionText: text("position_text").notNull(),
    grid: integer("grid"),
    status: text("status").notNull(),
    points: numeric("points", { precision: 8, scale: 2 }).notNull(),
    started: boolean("started").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.raceId, table.driverId] }),
  }),
);

export const qualifyingResults = pgTable(
  "qualifying_results",
  {
    raceId: integer("race_id")
      .notNull()
      .references(() => races.raceId, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => drivers.driverId, { onDelete: "restrict" }),
    constructorId: text("constructor_id")
      .notNull()
      .references(() => constructors.constructorId, { onDelete: "restrict" }),
    position: integer("position"),
    q1: text("q1"),
    q2: text("q2"),
    q3: text("q3"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.raceId, table.driverId] }),
  }),
);

export const sprintResults = pgTable(
  "sprint_results",
  {
    raceId: integer("race_id")
      .notNull()
      .references(() => races.raceId, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => drivers.driverId, { onDelete: "restrict" }),
    constructorId: text("constructor_id")
      .notNull()
      .references(() => constructors.constructorId, { onDelete: "restrict" }),
    position: integer("position"),
    positionText: text("position_text").notNull(),
    grid: integer("grid"),
    laps: integer("laps"),
    status: text("status").notNull(),
    points: numeric("points", { precision: 8, scale: 2 }).notNull(),
    started: boolean("started").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.raceId, table.driverId] }),
  }),
);

export const driverSeasonStandings = pgTable(
  "driver_season_standings",
  {
    seasonYear: integer("season_year")
      .notNull()
      .references(() => seasons.year, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => drivers.driverId, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    points: numeric("points", { precision: 8, scale: 2 }).notNull(),
    wins: integer("wins").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seasonYear, table.driverId] }),
  }),
);

export const constructorSeasonStandings = pgTable(
  "constructor_season_standings",
  {
    seasonYear: integer("season_year")
      .notNull()
      .references(() => seasons.year, { onDelete: "cascade" }),
    constructorId: text("constructor_id")
      .notNull()
      .references(() => constructors.constructorId, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    points: numeric("points", { precision: 8, scale: 2 }).notNull(),
    wins: integer("wins").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.seasonYear, table.constructorId] }),
  }),
);

export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  imageUrl: text("image_url"),
  category: text("category"),
  teamName: text("team_name"),
  teamColor: text("team_color"),
  isBreaking: boolean("is_breaking").notNull().default(false),
  source: text("source"),
  author: text("author"),
  href: text("href"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
});
