"use client";

import Link from "next/link";
import { useState } from "react";

import { DashCard } from "@/components/dashboard/page-primitives";
import { SectionTabs, tabButtonId, tabPanelId } from "@/components/home/section-tabs";
import { StatPill } from "@/components/home/stat-pill";

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
  if (!entries.length) {
    return <p className="px-6 py-6 text-[13px] text-ink3">Standings data is unavailable.</p>;
  }

  return (
    <div className="flex flex-col gap-2 py-5 pl-6 pr-16">
      {entries.map((entry) => (
        <StatPill
          key={`${entry.position}-${entry.name}`}
          pos={Number.parseInt(entry.position, 10) || 0}
          name={entry.name}
          value={entry.points}
          accentColor={entry.accentColor}
          href={entry.href}
        />
      ))}
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
