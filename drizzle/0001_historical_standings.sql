CREATE TABLE "driver_season_standings" (
	"season_year" integer NOT NULL,
	"driver_id" text NOT NULL,
	"position" integer NOT NULL,
	"points" numeric(8, 2) NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "driver_season_standings_season_year_driver_id_pk" PRIMARY KEY("season_year","driver_id")
);
--> statement-breakpoint
CREATE TABLE "constructor_season_standings" (
	"season_year" integer NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer NOT NULL,
	"points" numeric(8, 2) NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "constructor_season_standings_season_year_constructor_id_pk" PRIMARY KEY("season_year","constructor_id")
);
--> statement-breakpoint
ALTER TABLE "driver_season_standings" ADD CONSTRAINT "driver_season_standings_season_year_seasons_year_fk" FOREIGN KEY ("season_year") REFERENCES "public"."seasons"("year") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "driver_season_standings" ADD CONSTRAINT "driver_season_standings_driver_id_drivers_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("driver_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "constructor_season_standings" ADD CONSTRAINT "constructor_season_standings_season_year_seasons_year_fk" FOREIGN KEY ("season_year") REFERENCES "public"."seasons"("year") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "constructor_season_standings" ADD CONSTRAINT "constructor_season_standings_constructor_id_constructors_constructor_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("constructor_id") ON DELETE restrict ON UPDATE no action;
