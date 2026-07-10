"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import {
  type GrandPrixRecord,
  type GrandPrixScope,
  type GrandPrixSortMetric,
} from "@/lib/grand-prix-data";
import { fetchInternalApi } from "@/lib/client/internal-api";
import { GpHeroCard } from "@/components/grand-prix/GpHeroCard";
import { GpHighlights } from "@/components/grand-prix/GpHighlights";
import { GpLeaderboard } from "@/components/grand-prix/GpLeaderboard";
import { GpRaceHistory } from "@/components/grand-prix/GpRaceHistory";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const grandPrixScopes: GrandPrixScope[] = ["All-Time", "Season"];

function SelectorField({
  label,
  value,
  onChange,
  options,
  minWidth = "min-w-[220px]",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  minWidth?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{label}</p>
      <div className="relative">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            className={cn(
              "h-auto rounded-[8px] border border-[var(--color-line2)] bg-white py-2.5 pl-4 pr-10 text-[13px] font-medium text-ink2 shadow-none focus:border-[var(--color-line3)] [&>svg]:hidden",
              minWidth,
            )}
          >
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent className="border-[var(--color-line2)] bg-[var(--color-white)] text-ink">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="focus:bg-[var(--color-bg)] focus:text-ink">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink3" />
      </div>
    </div>
  );
}

function ScopeSelector({
  scope,
  onChange,
}: {
  scope: GrandPrixScope;
  onChange: (scope: GrandPrixScope) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Scope</p>
      <div className="flex gap-0.5 rounded-[8px] border border-[var(--color-line2)] bg-[var(--color-bg2)] p-[3px]">
        {grandPrixScopes.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              "rounded-[6px] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.8px] transition-all",
              scope === item
                ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                : "text-ink3 hover:text-ink2",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "error" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1140px] rounded-[14px] border border-[var(--color-line2)] bg-white px-8 py-14 text-center text-[13px] animate-fade-up",
        tone === "error" ? "text-[var(--color-red)]" : "text-ink3",
      )}
    >
      {children}
    </div>
  );
}

export function GrandPrixPageView() {
  const [options, setOptions] = useState<Array<{ slug: string; name: string }>>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [scope, setScope] = useState<GrandPrixScope>("All-Time");
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<GrandPrixRecord | null>(null);
  const [driverSortMetric, setDriverSortMetric] = useState<GrandPrixSortMetric>("Wins");
  const [teamSortMetric, setTeamSortMetric] = useState<GrandPrixSortMetric>("Wins");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInternalApi<Array<{ slug: string; name: string }>>("/api/grand-prix");
        if (cancelled) return;

        setOptions(data);
        setSelectedSlug((current) => (current && data.some((option) => option.slug === current) ? current : (data[0]?.slug ?? "")));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load Grand Prix list.");
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

    async function loadRecord() {
      if (!selectedSlug) {
        setSelectedRecord(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const suffix = selectedSeason ? `?season=${selectedSeason}` : "";

      try {
        const payload = await fetchInternalApi<{
          record: GrandPrixRecord;
          seasons: string[];
          selectedSeason: string;
        }>(`/api/grand-prix/${selectedSlug}${suffix}`);

        if (cancelled) return;

        setSelectedRecord(payload.record);
        setSeasons(payload.seasons);
        setSelectedSeason((current) => (current && payload.seasons.includes(current) ? current : payload.selectedSeason));
      } catch (loadError) {
        if (!cancelled) {
          setSelectedRecord(null);
          setSeasons([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load Grand Prix data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecord();

    return () => {
      cancelled = true;
    };
  }, [selectedSeason, selectedSlug]);

  useEffect(() => {
    if (selectedRecord) {
      document.title = `${selectedRecord.name} | F1 Dashboard`;
    }
  }, [selectedRecord]);

  if (!selectedRecord && loading) {
    return <EmptyState>Loading Grand Prix statistics...</EmptyState>;
  }

  if (!selectedRecord) {
    return <EmptyState tone="error">{error ?? "Grand Prix data is not available yet."}</EmptyState>;
  }

  const activeScope = selectedRecord.scopes[scope];

  return (
    <div className="mx-auto w-full max-w-[1140px] px-0 pb-20">
      <section className="mb-8 flex flex-col gap-6 animate-fade-up animate-fade-up-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[var(--color-red)]" />
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-ink3">
              Grand Prix Statistics
            </span>
          </div>
          <h1 className="font-display text-[56px] leading-[0.92] tracking-[1px] text-ink">
            {selectedRecord.name}
          </h1>
          <p className="mt-3 max-w-[420px] text-[13px] font-light leading-relaxed text-ink3">
            Historical winners, benchmark performers, and team records for the selected Grand Prix.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end lg:gap-5">
          <SelectorField
            label="Grand Prix"
            value={selectedSlug}
            onChange={setSelectedSlug}
            options={options.map((record) => ({ label: record.name, value: record.slug }))}
          />
          {scope === "Season" ? (
            <SelectorField
              label="Season"
              value={selectedSeason}
              onChange={setSelectedSeason}
              options={seasons.map((season) => ({ label: season, value: season }))}
              minWidth="min-w-[120px]"
            />
          ) : null}
          <ScopeSelector scope={scope} onChange={setScope} />
        </div>
      </section>

      <GpHeroCard record={selectedRecord} scope={scope} />
      <GpHighlights cards={activeScope.summaryCards} />

      <section className="mb-6 grid gap-5 animate-fade-up animate-fade-up-4 xl:grid-cols-2">
        <GpLeaderboard
          type="driver"
          rows={activeScope.driverLeaders}
          sortBy={driverSortMetric}
          onSortChange={setDriverSortMetric}
        />
        <GpLeaderboard
          type="team"
          rows={activeScope.teamLeaders}
          sortBy={teamSortMetric}
          onSortChange={setTeamSortMetric}
        />
      </section>

      <GpRaceHistory record={selectedRecord} scope={scope} />
    </div>
  );
}
