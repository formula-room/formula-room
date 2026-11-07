"use client";

import { useEffect, useMemo, useState } from "react";

import type { ComparisonTab, DriverProfile } from "@/lib/head-to-head-data";
import { fetchInternalApi } from "@/lib/client/internal-api";
import { FilterCard, type CompareState } from "@/components/h2h/FilterCard";
import type { Summary } from "@/components/h2h/StatsOverview";
import {
  AnalysisPanel,
  PanelMessage,
  ReadyToCompare,
  type ApiMeeting,
  type BySeasonRow,
  type ComparisonResult,
} from "@/components/h2h/AnalysisPanel";

type ApiPayload = {
  drivers: DriverProfile[];
  seasons: string[];
  selectedDrivers: {
    driverA: DriverProfile;
    driverB: DriverProfile;
  };
  summary: Summary;
  meetings: ApiMeeting[];
  bySeason: BySeasonRow[];
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

function scopeLabel(filters: CompareState) {
  if (filters.scope === "Season") return `Season ${filters.season}`;
  if (filters.scope === "Season Range") return `${filters.seasonFrom}-${filters.seasonTo}`;
  return filters.scope;
}

export function HeadToHeadPageView() {
  const [draft, setDraft] = useState<CompareState>(defaultCompareState);
  // Empty until Compare is clicked, so nothing loads and no zeroed results show before then.
  const [filters, setFilters] = useState<CompareState>(defaultCompareState);
  const [tab, setTab] = useState<ComparisonTab>("Overview");
  const [driverOptions, setDriverOptions] = useState<DriverProfile[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [data, setData] = useState<ApiPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        const options = await fetchInternalApi<{ drivers: DriverProfile[]; seasons: string[] }>("/api/head-to-head/options");
        if (cancelled) return;

        const latestSeason = options.seasons[0] ?? "";
        const oldestSeason = options.seasons[options.seasons.length - 1] ?? latestSeason;

        setDriverOptions(options.drivers);
        setAvailableSeasons(options.seasons);
        setDraft((current) => ({
          ...current,
          season: latestSeason,
          seasonFrom: oldestSeason,
          seasonTo: latestSeason,
        }));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load driver options.");
        }
      } finally {
        if (!cancelled) {
          setDriversLoading(false);
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
        return;
      }

      setLoading(true);
      setData(null);
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

  // Two drivers from different eras have no shared meetings, which would otherwise read as a page of zeros.
  const result: ComparisonResult | null =
    data && data.meetings.length > 0
      ? {
          driverA: data.selectedDrivers.driverA,
          driverB: data.selectedDrivers.driverB,
          summary: data.summary,
          allMeetings: data.meetings,
          meetings: tabMeetings,
          bySeason: data.bySeason,
          type: filters.type,
          appliedFilters: [scopeLabel(filters), filters.mode, filters.dnfMode],
        }
      : null;

  let notice = <ReadyToCompare />;
  if (error) {
    notice = <PanelMessage title="Comparison unavailable" tone="error">{error}</PanelMessage>;
  } else if (loading) {
    notice = <PanelMessage title="Loading comparison..." />;
  } else if (data) {
    notice = (
      <PanelMessage title="No shared meetings">
        {data.selectedDrivers.driverA.name} and {data.selectedDrivers.driverB.name} have no meetings that match these filters.
      </PanelMessage>
    );
  } else if (!driversLoading && driverOptions.length === 0) {
    notice = <PanelMessage title="No driver data">No driver comparison data is available yet.</PanelMessage>;
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center gap-2.5">
          <span aria-hidden="true" className="h-0.5 w-6 bg-[var(--color-red)]" />
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-ink3">Comparison Tool</p>
        </div>
        <h1 className="font-display text-[56px] italic leading-[0.9] tracking-[1px] text-ink min-[400px]:text-[64px] sm:text-[78px]">
          Head-to-Head
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-ink2">
          Compare two drivers across races, seasons and event formats.
        </p>
      </section>

      <FilterCard
        draft={draft}
        setDraft={setDraft}
        driverOptions={driverOptions}
        availableSeasons={availableSeasons}
        driversLoading={driversLoading}
        canCompare={canCompare}
        onCompare={() => {
          setFilters(normaliseCompareState(draft));
          setTab("Overview");
        }}
      />

      <AnalysisPanel tab={tab} onTabChange={setTab} result={result} notice={notice} />
    </div>
  );
}
