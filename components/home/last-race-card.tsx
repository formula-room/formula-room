import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { DashCard } from "@/components/dashboard/page-primitives";
import { PodiumRow, raceType } from "@/components/home/rank-row";
import { CountryFlag } from "@/components/shared/country-flag";
import { cn } from "@/lib/utils";

type PodiumEntry = {
  position?: string;
  name: string;
  label: string;
  time: string;
  accentColor?: string;
};

type LastRaceCardProps = {
  title: string;
  circuitName: string;
  flagCountry: string;
  eventHref: string | null;
  podium: PodiumEntry[];
};

export function LastRaceCard({ title, circuitName, flagCountry, eventHref, podium }: LastRaceCardProps) {
  return (
    <DashCard className="home-card flex h-full flex-col">
      <div className="px-4 pb-3 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className={cn("flex items-center gap-2 whitespace-nowrap text-[15px] leading-none tracking-[0.4px] text-ink", raceType)}>
            {flagCountry ? <CountryFlag country={flagCountry} className="h-[14px] w-[21px] rounded-[2px] border-black/10 shadow-none" /> : null}
            Last Race
          </p>
          <Link
            href={eventHref ?? "/results"}
            className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] border border-[var(--color-line3)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.5px] text-ink transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
          >
            View Full Results
            <ArrowRight className="h-3.5 w-3.5 max-[359px]:hidden" aria-hidden="true" />
          </Link>
        </div>
        <h2 className={cn("mt-2 text-[24px] leading-[1.1] tracking-[0.3px] text-ink sm:text-[28px]", raceType)}>{title}</h2>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-ink2">{circuitName}</p>
      </div>

      {podium.length ? (
        <ol className="flex flex-1 flex-col justify-center gap-2.5 px-4 pb-5 pt-2 max-[359px]:px-3 sm:px-6">
          {podium.map((entry) => (
            <PodiumRow
              key={`${entry.position}-${entry.name}`}
              pos={Number.parseInt(entry.position ?? "0", 10) || 0}
              name={entry.name}
              team={entry.label}
              points={entry.time}
              accentColor={entry.accentColor ?? "#C8201A"}
            />
          ))}
        </ol>
      ) : (
        <p className="px-5 py-6 text-[13px] text-ink2 sm:px-6">No verified finishing data is available for this race.</p>
      )}
    </DashCard>
  );
}
