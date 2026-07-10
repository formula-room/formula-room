import { RaceCard, type CalendarRaceCardItem } from "@/components/calendar/RaceCard";

export function RaceCardGrid({ races }: { races: CalendarRaceCardItem[] }) {
  if (races.length === 0) {
    return (
      <div className="rounded-[14px] border border-[var(--color-line2)] bg-white px-6 py-16 text-center text-sm text-ink3 animate-fade-up animate-fade-up-4">
        No races match the current filter.
      </div>
    );
  }

  return (
    <section className="grid gap-4 animate-fade-up animate-fade-up-4 md:grid-cols-2 xl:grid-cols-3">
      {races.map((race) => (
        <RaceCard key={race.id} race={race} />
      ))}
    </section>
  );
}
