CREATE TABLE "circuits" (
	"circuit_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"locality" text NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constructors" (
	"constructor_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nationality" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"driver_id" text PRIMARY KEY NOT NULL,
	"given_name" text NOT NULL,
	"family_name" text NOT NULL,
	"code" text,
	"nationality" text NOT NULL,
	"dob" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qualifying_results" (
	"race_id" integer NOT NULL,
	"driver_id" text NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer,
	"q1" text,
	"q2" text,
	"q3" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qualifying_results_race_id_driver_id_pk" PRIMARY KEY("race_id","driver_id")
);
--> statement-breakpoint
CREATE TABLE "race_results" (
	"race_id" integer NOT NULL,
	"driver_id" text NOT NULL,
	"constructor_id" text NOT NULL,
	"position" integer,
	"position_text" text NOT NULL,
	"grid" integer,
	"status" text NOT NULL,
	"points" numeric(8, 2) NOT NULL,
	"started" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "race_results_race_id_driver_id_pk" PRIMARY KEY("race_id","driver_id")
);
--> statement-breakpoint
CREATE TABLE "races" (
	"race_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "races_race_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"season_year" integer NOT NULL,
	"round" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"date" date NOT NULL,
	"circuit_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"year" integer PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_race_id_races_race_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("race_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_driver_id_drivers_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("driver_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifying_results" ADD CONSTRAINT "qualifying_results_constructor_id_constructors_constructor_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("constructor_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_race_id_races_race_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("race_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_driver_id_drivers_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("driver_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_constructor_id_constructors_constructor_id_fk" FOREIGN KEY ("constructor_id") REFERENCES "public"."constructors"("constructor_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_season_year_seasons_year_fk" FOREIGN KEY ("season_year") REFERENCES "public"."seasons"("year") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_circuit_id_circuits_circuit_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "public"."circuits"("circuit_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "races_season_round_unique" ON "races" USING btree ("season_year","round");--> statement-breakpoint
CREATE UNIQUE INDEX "races_season_slug_unique" ON "races" USING btree ("season_year","slug");