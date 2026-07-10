create table if not exists "sprint_results" (
  "race_id" integer not null,
  "driver_id" text not null,
  "constructor_id" text not null,
  "position" integer,
  "position_text" text not null,
  "grid" integer,
  "laps" integer,
  "status" text not null,
  "points" numeric(8, 2) not null,
  "started" boolean not null default true,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint "sprint_results_race_id_driver_id_pk" primary key ("race_id", "driver_id"),
  constraint "sprint_results_race_id_races_race_id_fk" foreign key ("race_id") references "races"("race_id") on delete cascade,
  constraint "sprint_results_driver_id_drivers_driver_id_fk" foreign key ("driver_id") references "drivers"("driver_id") on delete restrict,
  constraint "sprint_results_constructor_id_constructors_constructor_id_fk" foreign key ("constructor_id") references "constructors"("constructor_id") on delete restrict
);
