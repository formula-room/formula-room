"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { DashCard, DashCardHead, PosBadge, TeamStripe } from "@/components/dashboard/page-primitives";
import { HeroCard } from "@/components/home/hero-card";
import { CountryFlag } from "@/components/shared/country-flag";

type HomeInsightItem = {
  label: string;
  value: string;
};

type HomeSessionItem = {
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
};

type HomeRaceCardData = {
  flagCountry: string;
  location: string;
  circuitId: string;
  circuitName: string;
  eventHref: string | null;
  circuitHref: string | null;
  round: string;
  title: string;
  subtitle: string;
  date: string;
  status: string;
  sessions: HomeSessionItem[];
  overview: {
    circuitLength: string;
    numberOfLaps: string;
    raceDistance: string;
    firstGrandPrix: string;
    fastestLap: string;
    fastestLapHolder: string;
    fastestLapYear: string;
  };
  insights: HomeInsightItem[];
};

type HomeStandingsEntry = {
  position: string;
  name: string;
  points: number;
  sublabel: string;
  href: string | null;
  accentColor: string;
};

type HomePageData = {
  seasonLabel: string;
  nextRace: HomeRaceCardData;
  lastRace: HomeRaceCardData;
  driverStandingsTopThree: HomeStandingsEntry[];
  teamStandingsTopThree: HomeStandingsEntry[];
};

function buildUnavailableRaceCard(title: string, subtitle: string): HomeRaceCardData {
  return {
    flagCountry: "",
    location: "Data unavailable",
    circuitId: "",
    circuitName: "Circuit unavailable",
    eventHref: null,
    circuitHref: null,
    round: "--",
    title,
    subtitle,
    date: "Data unavailable",
    status: "Unavailable",
    sessions: [],
    overview: {
      circuitLength: "--",
      numberOfLaps: "--",
      raceDistance: "--",
      firstGrandPrix: "--",
      fastestLap: "--",
      fastestLapHolder: "Lap Record",
      fastestLapYear: "",
    },
    insights: [],
  };
}

function buildUnavailableStandings(prefix: string): HomeStandingsEntry[] {
  return ["01", "02", "03"].map((position) => ({
    position,
    name: "Data unavailable",
    points: 0,
    sublabel: `${prefix} data unavailable`,
    href: null,
    accentColor: "#ff6a3d",
  }));
}

const emptyState: HomePageData = {
  seasonLabel: "Season data unavailable",
  nextRace: buildUnavailableRaceCard("Next Race", "No upcoming race is available in the stored dataset."),
  lastRace: buildUnavailableRaceCard("Last Race", "No completed race is available in the stored dataset."),
  driverStandingsTopThree: buildUnavailableStandings("Driver standings"),
  teamStandingsTopThree: buildUnavailableStandings("Team standings"),
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ActionLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex h-7 w-7 items-center justify-center rounded-[6px] border border-[var(--color-line2)] text-[12px] text-ink3 transition-colors hover:bg-[var(--color-bg)] hover:text-ink"
      aria-label="Open section"
    >
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}

function PodiumRow({ session, index }: { session: HomeSessionItem; index: number }) {
  const podiumSession = session as HomeSessionItem & { accentColor?: string; position?: string };
  const position = Number.parseInt(podiumSession.position ?? String(index + 1), 10);
  const accentColor = podiumSession.accentColor ?? "#C8201A";
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-[var(--color-line)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--color-bg)] lg:border-r lg:border-b-0 lg:last:border-r-0">
      <PosBadge pos={position} />
      <TeamStripe teamColor={accentColor} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-ink">{session.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-ink3">{session.label}</p>
      </div>
      <div className="text-right">
        <span className="block font-display text-[22px] leading-none tracking-[0.5px] text-ink">{session.time.replace(/\s*pts$/i, "")}</span>
        <span className="block text-[10px] uppercase tracking-[0.5px] text-ink3">pts</span>
      </div>
    </div>
  );
}

function LastRaceCard({ race }: { race: HomeRaceCardData }) {
  return (
    <DashCard>
      <div className="grid lg:grid-cols-[360px_1fr]">
        <div className="relative flex items-start gap-5 border-b border-[var(--color-line2)] px-6 py-5 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[linear-gradient(90deg,var(--team-mercedes)_33%,var(--team-mclaren)_33%_66%,var(--team-ferrari)_66%)] after:opacity-60 lg:border-r lg:border-b-0 lg:after:inset-y-0 lg:after:right-0 lg:after:left-auto lg:after:h-auto lg:after:w-0.5">
          <CountryFlag country={race.flagCountry} className="h-8 w-12 flex-shrink-0 rounded-[6px]" />
          <div className="min-w-0">
            <span className="mb-3 inline-flex rounded-full border border-[var(--color-line2)] bg-[var(--color-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[1px] text-ink3">
              Last Race - Round {race.round}
            </span>
            <h2 className="font-display text-[30px] leading-none tracking-[1px] text-ink">{race.title}</h2>
            <p className="mt-1 text-[12px] text-ink3">{race.date} - {race.circuitName}</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3">
        {race.sessions.length ? (
          race.sessions.slice(0, 3).map((session, index) => (
            <PodiumRow key={`${index}-${session.name}`} session={session} index={index} />
          ))
        ) : (
          <div className="px-6 py-6 text-[13px] text-ink3">No verified finishing data is available for this race.</div>
        )}
        </div>
      </div>
    </DashCard>
  );
}

function DriverStandingsCard({ entries }: { entries: HomeStandingsEntry[] }) {
  return (
    <DashCard>
      <DashCardHead eyebrow="Top 3" title="Driver Standings" action={<ActionLink href="/standings" />} />
      <div>
        {entries.map((entry, index) => {
          const pos = Number.parseInt(entry.position, 10) || index + 1;
          const row = (
            <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-6 py-3.5 transition-colors last:border-b-0 hover:bg-[var(--color-bg)]">
              <PosBadge pos={pos} />
              <TeamStripe teamColor={entry.accentColor} />
              <div
                className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full font-display text-[13px] tracking-[0.5px]"
                style={{ backgroundColor: `${entry.accentColor}18`, color: entry.accentColor }}
              >
                {initials(entry.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-ink">{entry.name}</p>
                <p className="truncate text-[11px] text-ink3">{entry.sublabel}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-[20px] leading-none tracking-[0.5px] text-ink">{entry.points}</span>
                <span className="ml-1 text-[10px] uppercase tracking-[0.3px] text-ink3">pts</span>
              </div>
            </div>
          );
          return entry.href ? <Link key={`${entry.position}-${entry.name}`} href={entry.href}>{row}</Link> : <div key={`${entry.position}-${entry.name}`}>{row}</div>;
        })}
      </div>
    </DashCard>
  );
}

function TeamStandingsCard({ entries }: { entries: HomeStandingsEntry[] }) {
  const maxPoints = Math.max(...entries.map((entry) => entry.points), 1);
  return (
    <DashCard>
      <DashCardHead eyebrow="Top 3" title="Team Standings" action={<ActionLink href="/standings" />} />
      <div className="flex flex-col gap-[13px] p-6">
        {entries.map((entry, index) => (
          <div key={`${entry.position}-${entry.name}`} className="flex items-center gap-3">
            <span className="w-4 flex-shrink-0 text-center font-display text-[13px] text-ink3">{index + 1}</span>
            <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: entry.accentColor }} />
            <span className="w-[108px] flex-shrink-0 truncate text-[12px] font-medium text-ink2">{entry.name}</span>
            <div className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-[var(--color-bg3)]">
              <div
                className="h-full origin-left rounded-[3px]"
                style={{
                  width: `${(entry.points / maxPoints) * 100}%`,
                  backgroundColor: entry.accentColor,
                  animation: "barGrow 1s 0.6s cubic-bezier(0.16,1,0.3,1) both",
                }}
              />
            </div>
            <span className="min-w-8 text-right text-[12px] font-medium tabular-nums text-ink3">{entry.points}</span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

export function HomePageView() {
  const [data, setData] = useState<HomePageData>(emptyState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHomePage() {
      try {
        const payload = await fetchInternalApi<HomePageData>("/api/home");
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load home data.");
        }
      }
    }

    void loadHomePage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1140px] flex-col gap-6 px-0 pb-20 lg:px-0">
      {error && data === emptyState ? (
        <div className="rounded-[14px] border border-[var(--color-red-border)] bg-[var(--color-red-bg)] px-6 py-5 text-[13px] leading-relaxed text-[var(--color-red)]">
          <p className="mb-1 font-medium">Home dashboard data could not be loaded.</p>
          <p>{error}</p>
        </div>
      ) : error ? (
        <div className="rounded-[14px] border border-[var(--color-red-border)] bg-[var(--color-red-bg)] px-5 py-3 text-[13px] text-[var(--color-red)]">
          {error}
        </div>
      ) : null}

      {error && data === emptyState ? null : (
        <>
          <HeroCard className="animate-fade-up animate-fade-up-1" {...data.nextRace} />

          <div className="animate-fade-up animate-fade-up-3">
            <LastRaceCard race={data.lastRace} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 animate-fade-up animate-fade-up-4">
            <DriverStandingsCard entries={data.driverStandingsTopThree} />
            <TeamStandingsCard entries={data.teamStandingsTopThree} />
          </div>
        </>
      )}
    </div>
  );
}
