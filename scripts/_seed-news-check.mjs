import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

await sql`
  insert into news_articles (headline, excerpt, image_url, category, team_name, team_color, is_breaking, source, author, href, published_at)
  values
  ('Leclerc fastest in final Spa practice', 'Ferrari tops FP3 as rain threatens qualifying at Spa-Francorchamps.', null, 'Race', 'Ferrari', '#E8002D', true, 'F1 Wire', 'Jenna Cross', '/news/leclerc-spa', now() - interval '2 hours'),
  ('Mercedes trials new floor concept', 'A revised floor edge appeared on Russell''s car during Friday running.', null, 'Technical', 'Mercedes', '#00897B', false, 'F1 Wire', 'Amit Rao', '/news/mercedes-floor', now() - interval '1 day'),
  ('Championship gap narrows to 12 points', 'Norris closes in after a string of podiums.', null, 'Championship', null, null, false, 'F1 Wire', null, null, now() - interval '3 days')
`;
console.log("seeded 3 rows");
await sql.end();
