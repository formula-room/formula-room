import { redirect } from "next/navigation";

import { getCalendarPageData } from "@/lib/server/page-data/calendar";
import { getSeasonsList } from "@/lib/server/queries/seasons";

export default async function EventIndexPage() {
  const seasons = await getSeasonsList();
  const latestSeason = seasons[0]?.year;

  if (!latestSeason) {
    redirect("/");
  }

  const calendar = await getCalendarPageData(latestSeason);

  if (calendar.featuredEventHref) {
    redirect(calendar.featuredEventHref);
  }

  redirect("/calendar");
}
