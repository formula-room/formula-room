"use client";

import Link from "next/link";
import { useState } from "react";

import { DashCard, PosBadge, TeamStripe } from "@/components/dashboard/page-primitives";
import { SectionTabs, tabButtonId, tabPanelId } from "@/components/home/section-tabs";

type StandingsEntry = {
  position: string;
  name: string;
  points: number;
  sublabel: string;
  href: string | null;
  accentColor: string;
};

type StandingsTabsCardProps = {
  driverEntries: StandingsEntry[];
  teamEntries: StandingsEntry[];
};

const ID_PREFIX = "home-standings";

function StandingsRows({ entries }: { entries: StandingsEntry[] }) {
  const leaderPoints = Math.max(...entries.map((entry) => entry.points), 1);

  if (!entries.length) {
    return <p className="px-6 py-6 text-[13px] text-ink3">Standings data is unavailable.</p>;
  }

  return (
    <div>
      {entries.map((entry) => {
        const pos = Number.parseInt(entry.position, 10) || 0;
        const width = leaderPoints > 0 ? Math.min((entry.points / leaderPoints) * 100, 100) : 0;
        const row = (
          <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-6 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--color-bg)]">
            <PosBadge pos={pos} />
            <TeamStripe teamColor={entry.accentColor} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{entry.name}</p>
              <div className="mt-1.5 h-[4px] w-full max-w-[160px] overflow-hidden rounded-[2px] bg-[var(--color-bg3)]">
                <div className="h-full rounded-[2px]" style={{ width: `${width}%`, backgroundColor: entry.accentColor }} />
              </div>
            </div>
            <span className="flex-shrink-0 text-[14px] font-semibold tabular-nums text-ink">{entry.points}</span>
          </div>
        );
        return entry.href ? (
          <Link key={`${entry.position}-${entry.name}`} href={entry.href}>
            {row}
          </Link>
        ) : (
          <div key={`${entry.position}-${entry.name}`}>{row}</div>
        );
      })}
    </div>
  );
}

export function StandingsTabsCard({ driverEntries, teamEntries }: StandingsTabsCardProps) {
  const [tab, setTab] = useState<"drivers" | "teams">("drivers");

  return (
    <DashCard className="flex h-full flex-col">
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
      >
        <StandingsRows entries={driverEntries} />
      </div>
      <div
        id={tabPanelId(ID_PREFIX, "teams")}
        role="tabpanel"
        aria-labelledby={tabButtonId(ID_PREFIX, "teams")}
        hidden={tab !== "teams"}
        tabIndex={0}
      >
        <StandingsRows entries={teamEntries} />
      </div>

      <div className="mt-auto p-4">
        <Link
          href={tab === "teams" ? "/standings?tab=teams" : "/standings"}
          className="flex items-center justify-center gap-2 rounded-[6px] border border-[var(--color-line2)] py-3 text-center text-[12px] font-medium uppercase tracking-[0.5px] text-ink3 transition-colors hover:border-[var(--color-red-border)] hover:text-[var(--color-red)]"
        >
          View Full Standings
        </Link>
      </div>
    </DashCard>
  );
}
