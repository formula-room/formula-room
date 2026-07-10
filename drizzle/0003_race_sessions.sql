create table if not exists "race_sessions" (
  "race_id" integer not null,
  "session_key" text not null,
  "name" text not null,
  "date" date not null,
  "time" time with time zone,
  "sort_order" integer not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  constraint "race_sessions_race_id_session_key_pk" primary key ("race_id", "session_key"),
  constraint "race_sessions_race_id_races_race_id_fk" foreign key ("race_id") references "races"("race_id") on delete cascade
);
