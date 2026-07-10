import Link from "next/link";

import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/shared/country-flag";
import { RaceStatusBadge, type RaceStatus } from "@/components/calendar/RaceStatusBadge";

export type CalendarRaceCardItem = {
  id: string;
  round: number;
  name: string;
  country: string;
  flagCountry: string;
  circuit: string;
  dateRange: string;
  status: RaceStatus;
  isNext: boolean;
  href?: string;
};

export function RaceCard({ race }: { race: CalendarRaceCardItem }) {
  const barColor = race.status === "done" ? "var(--cal-done)" : race.isNext ? "var(--cal-next)" : "var(--cal-up)";
  const content = (
    <div
      className={cn(
        "h-full overflow-hidden rounded-[12px] border border-[var(--color-line2)] bg-white transition-all hover:-translate-y-[2px] hover:border-[var(--color-line3)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]",
        race.isNext && "border-[var(--cal-next-border)]",
      )}
    >
      <div className="h-[3px]" style={{ backgroundColor: barColor }} />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <p
            className={cn(
              "font-display text-[32px] leading-[0.85] tracking-[0.5px]",
              race.isNext ? "text-[var(--cal-next)]" : "text-ink3",
            )}
          >
            {String(race.round).padStart(2, "0")}
          </p>
          <CountryFlag country={race.flagCountry || race.country} className="h-6 w-9 rounded-[4px]" />
        </div>
        <p className="mb-1 text-[15px] font-medium leading-tight text-ink">{race.name}</p>
        <p className="mb-3 line-clamp-2 text-[11px] text-ink3">{race.circuit}</p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium tabular-nums text-ink2">{race.dateRange}</p>
          <RaceStatusBadge status={race.isNext ? "next" : race.status} />
        </div>
      </div>
    </div>
  );

  if (!race.href) {
    return content;
  }

  return (
    <Link href={race.href} className="block h-full">
      {content}
    </Link>
  );
}
