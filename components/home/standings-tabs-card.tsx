"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DashCard } from "@/components/dashboard/page-primitives";
import { StandingsRow } from "@/components/home/rank-row";
import { SectionTabs, tabButtonId, tabPanelId } from "@/components/home/section-tabs";
import { fetchInternalApi } from "@/lib/client/internal-api";

type StandingsEntry = {
  position: string;
  name: string;
  points: number;
  sublabel: string;
  href: string | null;
  accentColor: string;
};

type StandingsTabsCardProps = {
  seasonLabel: string;
  driverEntries: StandingsEntry[];
  teamEntries: StandingsEntry[];
};

type DriverFlags = Record<string, string>;

const ID_PREFIX = "home-standings";
const LIST_CLASS = "flex flex-1 flex-col justify-center gap-2.5 px-4 py-4 max-[359px]:px-3 sm:px-6";

const driverSlug = (href: string | null) => href?.split("/").pop() ?? "";

/** The home payload has no nationality, so flags come from the existing season standings API. */
function useDriverFlags(seasonLabel: string, hasDrivers: boolean) {
  const season = seasonLabel.match(/\d{4}/)?.[0];
  const [flags, setFlags] = useState<DriverFlags | null>(null);

  useEffect(() => {
    if (!season || !hasDrivers) {
      return;
    }

    let cancelled = false;

    fetchInternalApi<{ drivers: Array<{ slug: string; flagCountry: string }> }>(`/api/standings/${season}`)
      .then((data) => {
        if (!cancelled) {
          setFlags(Object.fromEntries(data.drivers.map((row) => [row.slug, row.flagCountry])));
        }
      })
      .catch(() => {
        // Flags are decorative: the rows stay correct without them.
        if (!cancelled) {
          setFlags({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [season, hasDrivers]);

  return flags;
}

function EmptyStandings() {
  return <p className="px-5 py-6 text-[13px] text-ink2 sm:px-6">Standings data is unavailable.</p>;
}

export function StandingsTabsCard({ seasonLabel, driverEntries, teamEntries }: StandingsTabsCardProps) {
  const [tab, setTab] = useState<"drivers" | "teams">("drivers");
  const flags = useDriverFlags(seasonLabel, driverEntries.length > 0);

  return (
    <DashCard className="home-card flex h-full flex-col">
      <SectionTabs
        idPrefix={ID_PREFIX}
        tabs={[
          { value: "drivers", label: "Driver Championship" },
          { value: "teams", label: "Team Championship" },
        ]}
        active={tab}
        onChange={(value) => setTab(value as "drivers" | "teams")}
      />

      <div
        id={tabPanelId(ID_PREFIX, "drivers")}
        role="tabpanel"
        aria-labelledby={tabButtonId(ID_PREFIX, "drivers")}
        hidden={tab !== "drivers"}
        tabIndex={0}
        className={tab === "drivers" ? "flex flex-1 flex-col" : undefined}
      >
        {driverEntries.length ? (
          <ol className={LIST_CLASS}>
            {driverEntries.map((entry) => {
              const flagCountry = flags?.[driverSlug(entry.href)];
              return (
                <StandingsRow
                  key={`${entry.position}-${entry.name}`}
                  pos={Number.parseInt(entry.position, 10) || 0}
                  name={entry.name}
                  team={entry.sublabel}
                  points={entry.points}
                  accentColor={entry.accentColor}
                  href={entry.href}
                  showFlag={flags === null || Boolean(flagCountry)}
                  flagCountry={flagCountry}
                />
              );
            })}
          </ol>
        ) : (
          <EmptyStandings />
        )}
      </div>
      <div
        id={tabPanelId(ID_PREFIX, "teams")}
        role="tabpanel"
        aria-labelledby={tabButtonId(ID_PREFIX, "teams")}
        hidden={tab !== "teams"}
        tabIndex={0}
        className={tab === "teams" ? "flex flex-1 flex-col" : undefined}
      >
        {teamEntries.length ? (
          <ol className={LIST_CLASS}>
            {teamEntries.map((entry) => (
              <StandingsRow
                key={`${entry.position}-${entry.name}`}
                pos={Number.parseInt(entry.position, 10) || 0}
                name={entry.name}
                team={entry.name}
                points={entry.points}
                accentColor={entry.accentColor}
                href={entry.href}
              />
            ))}
          </ol>
        ) : (
          <EmptyStandings />
        )}
      </div>

      <div className="px-4 pb-5 sm:px-6">
        <Link
          href={tab === "teams" ? "/standings?tab=teams" : "/standings"}
          className="flex items-center justify-center gap-2 rounded-[10px] border border-[var(--color-line3)] py-3 text-center text-[13px] font-bold uppercase tracking-[0.6px] text-ink transition-colors hover:border-[var(--color-red)] hover:text-[var(--color-red)]"
        >
          View Full Standings
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </DashCard>
  );
}
