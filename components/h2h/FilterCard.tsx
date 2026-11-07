"use client";

import { ArrowRight, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import type {
  ComparisonMode,
  ComparisonScope,
  ComparisonType,
  DnfMode,
  DriverProfile,
} from "@/lib/head-to-head-data";
import {
  comparisonModes,
  comparisonScopes,
  comparisonTypes,
  dnfModes,
} from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";
import {
  DashCard,
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import { raceType } from "@/components/home/rank-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DriverPicker } from "@/components/h2h/DriverPicker";
import { TogglePair } from "@/components/h2h/TogglePair";

export type CompareState = {
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

// Sprint qualifying has no stored results, so choosing it could only ever list nothing.
const sessionTypes = comparisonTypes.filter((type) => type !== "Sprint Qualifying");

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink2">{label}</p>
      {children}
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[] | string[];
  onChange: (value: T) => void;
}) {
  return (
    <FilterField label={label}>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger aria-label={label} className={cn(premiumSelectTriggerClass, "w-full data-[size=default]:h-10")}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className={premiumSelectContentClass}>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="focus:bg-[var(--color-bg)] focus:text-ink">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  );
}

function DriverSelect({
  side,
  value,
  drivers,
  loading,
  onChange,
}: {
  side: "a" | "b";
  value: string;
  drivers: DriverProfile[];
  loading: boolean;
  onChange: (value: string) => void;
}) {
  const label = side === "a" ? "Driver A" : "Driver B";

  return (
    <div className="min-w-0">
      <div className="race-black mb-2.5 ml-1 flex w-fit -skew-x-12 items-stretch overflow-hidden rounded-[3px]">
        <span className={cn("skew-x-12 px-4 py-1 text-[15px] leading-[1.35] tracking-[0.3px]", raceType)}>{label}</span>
        <span aria-hidden="true" className="w-2" style={{ backgroundColor: `var(--h2h-${side})` }} />
      </div>
      <DriverPicker
        label={label}
        value={value}
        drivers={drivers}
        loading={loading}
        accentBorder={`var(--h2h-${side}-border)`}
        onChange={onChange}
      />
    </div>
  );
}

export function FilterCard({
  draft,
  setDraft,
  driverOptions,
  availableSeasons,
  driversLoading,
  canCompare,
  onCompare,
}: {
  draft: CompareState;
  setDraft: (updater: (current: CompareState) => CompareState) => void;
  driverOptions: DriverProfile[];
  availableSeasons: string[];
  driversLoading: boolean;
  canCompare: boolean;
  onCompare: () => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [triedEmpty, setTriedEmpty] = useState(false);
  const panelId = useId();

  // The panel starts collapsed, so show when it is hiding a changed filter.
  const changedFilters = [
    draft.scope !== "All-Time",
    draft.type !== "Race",
    draft.mode !== "All meetings",
    draft.dnfMode !== "Include DNFs",
  ].filter(Boolean).length;

  const sameDriver = draft.driverA !== "" && draft.driverA === draft.driverB;
  const hint = sameDriver
    ? "Choose two different drivers."
    : triedEmpty && !canCompare
      ? "Select two drivers first."
      : null;

  return (
    <DashCard>
      <div className="grid gap-4 px-5 pb-5 pt-5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-5 sm:px-6 sm:pt-6">
        <DriverSelect
          side="a"
          value={draft.driverA}
          drivers={driverOptions}
          loading={driversLoading}
          onChange={(driverA) => setDraft((current) => ({ ...current, driverA }))}
        />

        <div
          aria-hidden="true"
          className="flex h-8 w-12 -skew-x-12 items-center justify-center justify-self-center rounded-[4px] bg-[var(--color-bg2)] sm:h-11 sm:self-end"
        >
          <span className={cn("skew-x-12 text-[17px] leading-none tracking-[0.5px] text-ink2", raceType)}>VS</span>
        </div>

        <DriverSelect
          side="b"
          value={draft.driverB}
          drivers={driverOptions}
          loading={driversLoading}
          onChange={(driverB) => setDraft((current) => ({ ...current, driverB }))}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-[var(--color-line)] px-5 py-4 sm:px-6">
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-[4px] text-[14px] font-bold italic text-ink transition-colors hover:text-[var(--color-red)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)]"
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Advanced Filters
          {changedFilters > 0 ? (
            <span className="race-selected flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] not-italic">
              {changedFilters}
              <span className="sr-only"> changed</span>
            </span>
          ) : null}
          <ChevronDown aria-hidden="true" className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
        </button>

        <div className="ml-auto flex items-center gap-4">
          {hint ? (
            <p role="status" className="text-[12px] text-ink2">
              {hint}
            </p>
          ) : null}
          <button
            type="button"
            aria-disabled={!canCompare}
            onClick={() => {
              setTriedEmpty(!canCompare);
              if (canCompare) onCompare();
            }}
            className="race-selected flex h-11 -skew-x-12 items-center rounded-[5px] px-4 transition-[filter] hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)] sm:px-6"
          >
            <span className="flex skew-x-12 items-center gap-2 text-[14px] font-bold italic">
              Compare
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!filtersOpen} className="border-t border-[var(--color-line)] px-5 py-5 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Scope"
            value={draft.scope}
            options={comparisonScopes}
            onChange={(scope) => setDraft((current) => ({ ...current, scope }))}
          />
          <FilterSelect
            label="Session Type"
            value={draft.type}
            options={sessionTypes}
            onChange={(type) => setDraft((current) => ({ ...current, type }))}
          />
          <FilterField label="Comparison Mode">
            <TogglePair
              options={comparisonModes}
              value={draft.mode}
              onChange={(mode) => setDraft((current) => ({ ...current, mode }))}
              labels={{ "All meetings": "All Meetings", "Teammates only": "Teammates" }}
            />
          </FilterField>
          <FilterField label="DNF Handling">
            <TogglePair
              options={dnfModes}
              value={draft.dnfMode}
              onChange={(dnfMode) => setDraft((current) => ({ ...current, dnfMode }))}
              labels={{ "Include DNFs": "Include", "Exclude DNFs": "Exclude" }}
            />
          </FilterField>

          {draft.scope === "Season" ? (
            <FilterSelect
              label="Season"
              value={draft.season}
              options={availableSeasons}
              onChange={(season) => setDraft((current) => ({ ...current, season }))}
            />
          ) : null}

          {draft.scope === "Season Range" ? (
            <>
              <FilterSelect
                label="From"
                value={draft.seasonFrom}
                options={availableSeasons}
                onChange={(seasonFrom) => setDraft((current) => ({ ...current, seasonFrom }))}
              />
              <FilterSelect
                label="To"
                value={draft.seasonTo}
                options={availableSeasons}
                onChange={(seasonTo) => setDraft((current) => ({ ...current, seasonTo }))}
              />
            </>
          ) : null}
        </div>

        <p className="mt-4 text-[12px] leading-5 text-ink2">
          Session Type sets which meetings Overview lists. Sprint shootout and sprint qualifying results aren&apos;t available.
        </p>
      </div>
    </DashCard>
  );
}
