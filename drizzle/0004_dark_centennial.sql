CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"excerpt" text,
	"image_url" text,
	"category" text,
	"team_name" text,
	"team_color" text,
	"is_breaking" boolean DEFAULT false NOT NULL,
	"source" text,
	"author" text,
	"href" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL
);