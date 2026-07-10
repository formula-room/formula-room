import { ChevronDown } from "lucide-react";

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
import {
  premiumSelectContentClass,
} from "@/components/dashboard/page-primitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TogglePair } from "@/components/h2h/TogglePair";

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
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{label}</p>
      <Select value={value} onValueChange={(next) => onChange(next as T)}>
        <SelectTrigger className="h-auto w-full rounded-[8px] border border-[var(--color-line2)] bg-[var(--color-bg)] py-2.5 pl-3.5 pr-8 text-[13px] font-medium text-ink2 shadow-none focus:border-[var(--color-line3)] [&>svg]:hidden">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className={premiumSelectContentClass}>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="focus:bg-slate-950/8 focus:text-slate-950">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChevronDown className="pointer-events-none -mt-6 ml-auto mr-2.5 h-3 w-3 text-ink3" />
    </div>
  );
}

function DriverSelect({
  side,
  label,
  value,
  drivers,
  onChange,
}: {
  side: "a" | "b";
  label: string;
  value: string;
  drivers: DriverProfile[];
  onChange: (value: string) => void;
}) {
  const sideStyles =
    side === "a"
      ? {
          label: "var(--h2h-a)",
          bg: "var(--h2h-a-bg)",
          border: "var(--h2h-a-border)",
        }
      : {
          label: "var(--h2h-b)",
          bg: "var(--h2h-b-bg)",
          border: "var(--h2h-b-border)",
        };

  return (
    <div>
      <p
        className="mb-2.5 text-[10px] font-medium uppercase tracking-[1.2px]"
        style={{ color: sideStyles.label }}
      >
        {label}
      </p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          className="h-auto w-full rounded-[10px] border-[1.5px] py-3.5 pl-4 pr-10 text-[15px] font-medium text-ink shadow-none transition-colors focus:border-current [&>svg]:hidden"
          style={{ backgroundColor: sideStyles.bg, borderColor: sideStyles.border }}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className={premiumSelectContentClass}>
          {drivers.map((driver) => (
            <SelectItem key={driver.slug} value={driver.slug} className="focus:bg-slate-950/8 focus:text-slate-950">
              {driver.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChevronDown className="pointer-events-none -mt-8 ml-auto mr-3.5 h-4 w-4 text-ink3" />
    </div>
  );
}

export function FilterCard({
  draft,
  setDraft,
  driverOptions,
  availableSeasons,
  canCompare,
  onCompare,
}: {
  draft: CompareState;
  setDraft: (updater: (current: CompareState) => CompareState) => void;
  driverOptions: DriverProfile[];
  availableSeasons: string[];
  canCompare: boolean;
  onCompare: () => void;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-[16px] border border-[var(--color-line2)] bg-white animate-fade-up animate-fade-up-2">
      <div className="flex flex-col gap-2 border-b border-[var(--color-line2)] px-7 py-4 lg:flex-row lg:items-center lg:justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[1.3px] text-ink3">
          Driver Selector & Filters
        </span>
        <span className="text-[11px] italic text-ink3">
          All stored seasons included. Sprint shootout / sprint qualifying remains unsupported.
        </span>
      </div>

      <div className="px-5 pb-5 pt-6 sm:px-7">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <DriverSelect
            side="a"
            label="Driver A"
            value={draft.driverA}
            drivers={driverOptions}
            onChange={(driverA) => setDraft((current) => ({ ...current, driverA }))}
          />

          <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[var(--color-line2)] bg-[var(--color-bg2)] font-display text-[16px] tracking-[1px] text-ink3 lg:flex">
            VS
          </div>

          <DriverSelect
            side="b"
            label="Driver B"
            value={draft.driverB}
            drivers={driverOptions}
            onChange={(driverB) => setDraft((current) => ({ ...current, driverB }))}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] xl:items-end">
          <FilterSelect
            label="Scope"
            value={draft.scope}
            options={comparisonScopes}
            onChange={(scope) => setDraft((current) => ({ ...current, scope }))}
          />
          <FilterSelect
            label="Type"
            value={draft.type}
            options={comparisonTypes}
            onChange={(type) => setDraft((current) => ({ ...current, type }))}
          />
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Mode</p>
            <TogglePair
              options={comparisonModes}
              value={draft.mode}
              onChange={(mode) => setDraft((current) => ({ ...current, mode }))}
              labels={{ "All meetings": "All Meetings", "Teammates only": "Teammates" }}
            />
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">DNF Handling</p>
            <TogglePair
              options={dnfModes}
              value={draft.dnfMode}
              onChange={(dnfMode) => setDraft((current) => ({ ...current, dnfMode }))}
              labels={{ "Include DNFs": "Include", "Exclude DNFs": "Exclude" }}
            />
          </div>
          <button
            type="button"
            disabled={!canCompare}
            onClick={onCompare}
            className="whitespace-nowrap rounded-[8px] bg-[var(--color-red)] px-8 py-2.5 font-sans text-[13px] font-medium tracking-[0.5px] text-white transition-all hover:-translate-y-0.5 hover:bg-[#a81915] hover:shadow-[0_4px_12px_rgba(200,32,26,0.3)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Compare -&gt;
          </button>
        </div>

        {draft.scope === "Season" ? (
          <div className="mt-5 max-w-xs">
            <FilterSelect
              label="Season"
              value={draft.season}
              options={availableSeasons}
              onChange={(season) => setDraft((current) => ({ ...current, season }))}
            />
          </div>
        ) : null}

        {draft.scope === "Season Range" ? (
          <div className="mt-5 grid max-w-xl gap-5 sm:grid-cols-2">
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
