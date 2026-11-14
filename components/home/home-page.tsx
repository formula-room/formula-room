"use client";

import { useEffect, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { HeroSection } from "@/components/home/hero-section";
import { LastRaceCard } from "@/components/home/last-race-card";
import { NewsGrid } from "@/components/home/news-grid";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { StandingsTabsCard } from "@/components/home/standings-tabs-card";
import { WeekendSchedule } from "@/components/home/weekend-schedule";
import type { NewsArticleView } from "@/components/news/NewsSlide";
import type { HomeHeroBackground } from "@/lib/server/page-data/home-hero";

type HomeSessionItem = {
  position?: string;
  name: string;
  label: string;
  time: string;
  startsAtUtc?: string;
  status?: "completed" | "live" | "upcoming";
  accentColor?: string;
};

type HomeRaceCardData = {
  flagCountry: string;
  location: string;
  circuitId: string;
  circuitName: string;
  /** IANA time zone of the circuit (used for the event dates in the hero bar). */
  timeZone?: string;
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
  news: NewsArticleView[];
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
  news: [],
};

type HomePageViewProps = {
  /** Race-week photograph, chosen on the server so it is part of the first paint. */
  heroBackground: HomeHeroBackground;
};

export function HomePageView({ heroBackground }: HomePageViewProps) {
  const [data, setData] = useState<HomePageData>(emptyState);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHomePage() {
      try {
        const payload = await fetchInternalApi<HomePageData>("/api/home");
        if (!cancelled) {
          setData(payload);
          setError(null);
          setLoaded(true);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load home data.");
          setLoaded(true);
        }
      }
    }

    void loadHomePage();

    return () => {
      cancelled = true;
    };
  }, []);

  const nextRaceAvailable = data.nextRace.round !== "--";
  const raceStatus = !loaded ? "loading" : nextRaceAvailable ? "ready" : "unavailable";

  return (
    <div className="home-graphite-scope mx-auto flex w-full max-w-[1140px] flex-col gap-5 px-0 pb-20 lg:gap-6 lg:px-0">
      <HeroSection background={heroBackground} race={data.nextRace} status={raceStatus} />

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
          <WeekendSchedule sessions={data.nextRace.sessions} eventHref={data.nextRace.eventHref} status={raceStatus} />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <ScrollReveal delayMs={240}>
              <LastRaceCard
                title={data.lastRace.title}
                circuitName={data.lastRace.circuitName}
                flagCountry={data.lastRace.flagCountry}
                eventHref={data.lastRace.eventHref}
                podium={data.lastRace.sessions}
              />
            </ScrollReveal>
            <ScrollReveal delayMs={340}>
              <StandingsTabsCard
                seasonLabel={data.seasonLabel}
                driverEntries={data.driverStandingsTopThree}
                teamEntries={data.teamStandingsTopThree}
              />
            </ScrollReveal>
          </div>

          <NewsGrid articles={data.news} />
        </>
      )}
    </div>
  );
}
