import Link from "next/link";

import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/shared/country-flag";
import { RaceStatusBadge, type RaceStatus } from "@/components/calendar/RaceStatusBadge";

export type CalendarRaceListItem = {
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
  monthLabel: string;
};

type MonthGroup = {
  monthLabel: string;
  races: CalendarRaceListItem[];
};

const gridColumns = "64px 1fr 200px 130px 110px 120px";

function ActionButton({ race }: { race: CalendarRaceListItem }) {
  const className = cn(
    "rounded-[6px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
    race.isNext
      ? "border-[var(--color-red)] bg-[var(--color-red)] text-white hover:border-[#a81915] hover:bg-[#a81915]"
      : "border-[var(--color-line2)] bg-transparent text-ink3 hover:border-[var(--color-line3)] hover:bg-[var(--color-bg2)] hover:text-ink",
  );

  if (!race.href) {
    return (
      <span className="rounded-[6px] border border-[var(--color-line2)] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] text-ink3">
        Unavailable
      </span>
    );
  }

  return (
    <Link href={race.href} className={className}>
      View Event
    </Link>
  );
}

function RaceRow({ race }: { race: CalendarRaceListItem }) {
  return (
    <div
      className={cn(
        "relative grid min-h-[60px] cursor-pointer items-center border-b border-[var(--color-line)] px-6 transition-colors hover:bg-[var(--color-bg)] last:border-b-0",
        race.isNext && "bg-[var(--cal-next-bg)]",
      )}
      style={{ gridTemplateColumns: gridColumns }}
    >
      {race.isNext ? (
        <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-r-[2px] bg-[var(--cal-next)]" />
      ) : null}

      <div className={cn("pl-1 font-display text-[18px] tracking-[0.5px] text-ink3", race.isNext && "text-[var(--cal-next)]")}>
        {String(race.round).padStart(2, "0")}
      </div>

      <div className="flex items-center gap-2">
        <CountryFlag country={race.flagCountry || race.country} className="h-5 w-7 rounded-[3px]" />
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className={cn("truncate text-[14px] font-medium", race.status === "done" && !race.isNext ? "text-ink2" : "text-ink")}>
              {race.name}
            </p>
            {race.isNext ? (
              <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[3px] border border-[var(--cal-next-border)] bg-[var(--cal-next-bg)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.8px] text-[var(--cal-next)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--cal-next)] animate-pulse" />
                Next
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <p className="truncate text-[12px] text-ink3">{race.circuit}</p>
      <p className="text-[13px] font-medium tabular-nums text-ink2">{race.dateRange}</p>
      <div>
        <RaceStatusBadge status={race.isNext ? "next" : race.status} />
      </div>
      <div className="flex justify-end">
        <ActionButton race={race} />
      </div>
    </div>
  );
}

export function RaceListView({ groups }: { groups: MonthGroup[] }) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white animate-fade-up animate-fade-up-4">
      <div
        className="grid h-[38px] items-center border-b border-[var(--color-line2)] bg-[var(--color-bg)] px-6"
        style={{ gridTemplateColumns: gridColumns }}
      >
        {["Round", "Grand Prix", "Circuit", "Date", "Status", ""].map((head, index) => (
          <div
            key={`${head}-${index}`}
            className={cn("text-[10px] font-medium uppercase tracking-[1px] text-ink3", index === 5 && "text-right")}
          >
            {head}
          </div>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="px-6 py-16 text-center text-sm text-ink3">No races match the current filter.</div>
      ) : (
        groups.map((group) => (
          <div key={group.monthLabel}>
            <div
              className="grid border-y border-[var(--color-line2)] bg-[var(--color-bg2)] px-6 py-1.5"
              style={{ gridTemplateColumns: gridColumns }}
            >
              <div className="col-span-6 flex items-center gap-2">
                <span className="font-display text-[13px] tracking-[1px] text-ink3">{group.monthLabel}</span>
                <div className="h-px flex-1 bg-[var(--color-line2)]" />
              </div>
            </div>
            {group.races.map((race) => (
              <RaceRow key={race.id} race={race} />
            ))}
          </div>
        ))
      )}
    </section>
  );
}
