import { EventPageView } from "@/components/event/event-page";

type EventPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string; round?: string }>;
};

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params;
  const { season, round } = await searchParams;

  return (
    <EventPageView
      slug={slug}
      season={season ? Number.parseInt(season, 10) : undefined}
      round={round ? Number.parseInt(round, 10) : undefined}
    />
  );
}
