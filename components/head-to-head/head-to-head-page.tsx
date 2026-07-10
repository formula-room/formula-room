"use client";

import { useEffect, useMemo, useState } from "react";

import {
  type ComparisonMode,
  type ComparisonScope,
  type ComparisonTab,
  type ComparisonType,
  type DnfMode,
  type DriverMeetingResult,
  type DriverProfile,
} from "@/lib/head-to-head-data";
import { fetchInternalApi } from "@/lib/client/internal-api";
import { FilterCard } from "@/components/h2h/FilterCard";
import { StatsOverview } from "@/components/h2h/StatsOverview";
import { AnalysisPanel } from "@/components/h2h/AnalysisPanel";

type CompareState = {
  driverA: string;
  driverB: string;
  scope: ComparisonScope;
  season: string;
  seasonFrom: string;
  seasonTo: string;
  type: ComparisonType;
  mode: ComparisonMode;
  dnfMode: DnfMode;
};

type ApiMeeting = {
  season: string;
  round: string;
  grandPrix: string;
  type: ComparisonType;
  notes: string;
  resultA: DriverMeetingResult;
  resultB: DriverMeetingResult;
};

type ApiPayload = {
  drivers: DriverProfile[];
  seasons: string[];
  selectedDrivers: {
    driverA: DriverProfile;
    driverB: DriverProfile;
  };
  summary: {
    raceH2H: { driverA: number; driverB: number };
    qualiH2H: { driverA: number; driverB: number };
    winsA: number;
    winsB: number;
    podiumsA: number;
    podiumsB: number;
    polesA: number;
    polesB: number;
    pointsA: number;
    pointsB: number;
    startsA: number;
    startsB: number;
    dnfsA: number;
    dnfsB: number;
  };
  meetings: ApiMeeting[];
  bySeason: Array<{
    season: string;
    raceH2H: string;
    qualiH2H: string;
    points: string;
    wins: string;
    podiums: string;
  }>;
  sprintSupported: boolean;
};

const defaultCompareState: CompareState = {
  driverA: "",
  driverB: "",
  scope: "All-Time",
  season: "",
  seasonFrom: "",
  seasonTo: "",
  type: "Race",
  mode: "All meetings",
  dnfMode: "Include DNFs",
};

function normaliseCompareState(state: CompareState) {
  if (state.scope !== "Season Range") {
    return state;
  }

  const ordered = [state.seasonFrom, state.seasonTo].sort();
  return {
    ...state,
    seasonFrom: ordered[0],
    seasonTo: ordered[1],
  };
}

export function HeadToHeadPageView() {
  const [draft, setDraft] = useState<CompareState>(defaultCompareState);
  const [filters, setFilters] = useState<CompareState>(defaultCompareState);
  const [tab, setTab] = useState<ComparisonTab>("Overview");
  const [driverOptions, setDriverOptions] = useState<DriverProfile[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoading(true);
      setError(null);

      try {
        const options = await fetchInternalApi<{ drivers: DriverProfile[]; seasons: string[] }>("/api/head-to-head/options");
        if (cancelled) return;

        const driverA = options.drivers[0]?.slug ?? "";
        const driverB = options.drivers[1]?.slug ?? options.drivers[0]?.slug ?? "";
        const latestSeason = options.seasons[0] ?? "";
        const oldestSeason = options.seasons[options.seasons.length - 1] ?? latestSeason;

        setDriverOptions(options.drivers);
        setAvailableSeasons(options.seasons);

        const nextState = {
          ...defaultCompareState,
          driverA,
          driverB,
          season: latestSeason,
          seasonFrom: oldestSeason,
          seasonTo: latestSeason,
        };

        setDraft(nextState);
        setFilters(nextState);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load driver options.");
          setLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadComparison() {
      if (!filters.driverA || !filters.driverB || filters.driverA === filters.driverB) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        driverA: filters.driverA,
        driverB: filters.driverB,
        scope: filters.scope,
        mode: filters.mode,
        dnfMode: filters.dnfMode,
      });

      if (filters.scope === "Season") {
        query.set("season", filters.season);
      }

      if (filters.scope === "Season Range") {
        query.set("seasonFrom", filters.seasonFrom);
        query.set("seasonTo", filters.seasonTo);
      }

      try {
        const payload = await fetchInternalApi<ApiPayload>(`/api/head-to-head?${query.toString()}`);
        if (!cancelled) {
          setData(payload);
        }
      } catch (loadError) {
        if (!cancelled) {
          setData(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load head-to-head data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadComparison();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const driverA =
    data?.selectedDrivers.driverA ??
    driverOptions.find((driver) => driver.slug === draft.driverA) ??
    driverOptions[0];
  const driverB =
    data?.selectedDrivers.driverB ??
    driverOptions.find((driver) => driver.slug === draft.driverB) ??
    driverOptions[1] ??
    driverOptions[0];

  const tabMeetings = useMemo(() => {
    if (!data) return [];

    if (tab === "Overview") {
      return data.meetings.filter((meeting) => meeting.type === filters.type);
    }

    if (tab === "Race") {
      return data.meetings.filter((meeting) => meeting.type === "Race");
    }

    if (tab === "Qualifying") {
      return data.meetings.filter((meeting) => meeting.type === "Qualifying");
    }

    if (tab === "Sprint") {
      return data.sprintSupported ? data.meetings.filter((meeting) => meeting.type === "Sprint") : [];
    }

    return data.meetings;
  }, [data, filters.type, tab]);

  const canCompare = draft.driverA !== "" && draft.driverB !== "" && draft.driverA !== draft.driverB;

  if (!driverA || !driverB) {
    return (
      <div className="mx-auto max-w-[1140px] px-8 py-10 pb-20">
        <div className="rounded-[16px] border border-[var(--color-line2)] bg-white px-8 py-14 text-center text-sm text-[var(--color-red)]">
          {error ?? "No driver comparison data is available yet."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 pb-20 sm:px-8 lg:py-10">
      <section className="mb-8 flex items-end justify-between animate-fade-up animate-fade-up-1">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[var(--color-red)]" />
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-ink3">
              Comparison Tool
            </span>
          </div>
          <h1 className="font-display text-[64px] leading-[0.92] tracking-[1px] text-ink">
            Head-to-Head
          </h1>
          <p className="mt-3 max-w-[480px] text-[13px] font-light leading-relaxed text-ink3">
            Compare two drivers across meetings, teammate windows, season cuts, and sprint formats.
          </p>
        </div>
      </section>

      <FilterCard
        draft={draft}
        setDraft={setDraft}
        driverOptions={driverOptions}
        availableSeasons={availableSeasons}
        canCompare={canCompare}
        onCompare={() => {
          setFilters(normaliseCompareState(draft));
          setTab("Overview");
        }}
      />

      <StatsOverview
        driverA={driverA}
        driverB={driverB}
        summary={data?.summary ?? null}
        scope={filters.scope}
        type={filters.type}
        mode={filters.mode}
        loading={loading}
        error={error}
      />

      <AnalysisPanel
        tab={tab}
        onTabChange={setTab}
        meetings={tabMeetings}
        bySeason={data?.bySeason ?? []}
        driverA={driverA}
        driverB={driverB}
        scope={filters.scope}
        type={filters.type}
        mode={filters.mode}
        dnfMode={filters.dnfMode}
      />
    </div>
  );
}
