"use client";

import Link from "next/link";
import { ArrowRight, Grid2X2, List, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { cn } from "@/lib/utils";
import { statisticsCategories, type StatisticsCategory } from "@/lib/statistics-data";
import {
  DashCard,
  SearchBox,
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import { raceType } from "@/components/home/rank-row";
import { CategoryIcon } from "@/components/statistics/CategoryIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "grid" | "list";

function categoryIdFromTitle(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("championship")) return "championships";
  if (normalized.includes("wins")) return "wins";
  if (normalized.includes("podium")) return "podiums";
  if (normalized.includes("pole")) return "poles";
  if (normalized.includes("points")) return "points";
  if (normalized.includes("laps")) return "laps";
  if (normalized.includes("dnf") || normalized.includes("reliability")) return "dnf";
  if (normalized.includes("sprint")) return "sprint";
  if (normalized.includes("special")) return "special";
  if (normalized.includes("grand prix")) return "gp";
  if (normalized.includes("circuit")) return "circuits";
  if (normalized.includes("head")) return "h2h";

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "championships";
}

function categoryVar(categoryId: string) {
  return `var(--cat-${categoryId}, var(--color-red))`;
}

function LinkRow({ link, accent }: { link: { label: string; href: string }; accent: string }) {
  return (
    <Link
      href={link.href}
      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--color-bg)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-red)]"
    >
      <span aria-hidden="true" className="h-3 w-[3px] flex-shrink-0 -skew-x-12 rounded-[1px]" style={{ backgroundColor: accent }} />
      <span className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-[var(--color-red)]">
        {link.label}
      </span>
      <ArrowRight
        aria-hidden="true"
        className="h-3.5 w-3.5 flex-shrink-0 text-ink3 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-red)]"
      />
    </Link>
  );
}

function StatCategoryCard({ category, view }: { category: StatisticsCategory; view: ViewMode }) {
  const categoryId = categoryIdFromTitle(category.title);
  const accent = categoryVar(categoryId);
  const isList = view === "list";

  return (
    <DashCard className="flex flex-col">
      <article>
        <header className="flex items-center gap-3.5 border-b border-[var(--color-line)] px-5 py-4">
          <span className="race-black flex h-10 w-11 flex-shrink-0 -skew-x-12 items-center justify-center rounded-[4px]">
            <CategoryIcon categoryId={categoryId} className="h-[18px] w-[18px] skew-x-12" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className={cn("text-[21px] leading-[1.15] tracking-[0.3px] text-ink", raceType)}>{category.title}</h2>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[1px] text-ink3">
              {category.items.length} {category.items.length === 1 ? "link" : "links"}
            </p>
          </div>
          <span aria-hidden="true" className="h-8 w-1.5 flex-shrink-0 -skew-x-12 rounded-[1px]" style={{ backgroundColor: accent }} />
        </header>

        {/* In list view the card's overflow clips the bottom border of the final row. */}
        <ul className={cn("-mb-px", isList && "grid sm:grid-cols-2")}>
          {category.items.map((link) => (
            <li key={`${category.title}-${link.label}-${link.href}`} className={cn("border-b border-[var(--color-line)]", !isList && "last:border-b-0")}>
              <LinkRow link={link} accent={accent} />
            </li>
          ))}
        </ul>
      </article>
    </DashCard>
  );
}

function ViewButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-red)]",
        active ? "race-selected" : "text-ink2 hover:text-ink",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="col-span-full flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-[var(--color-line2)] bg-[var(--color-bg)] px-6 py-10 text-center">
      <p className={cn("text-[21px] tracking-[0.3px] text-ink", raceType)}>No results found</p>
      <p className="max-w-[320px] text-sm leading-6 text-ink2">
        No statistics categories match <em>&quot;{search}&quot;</em>. Try a different term.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-[12px] font-medium text-[var(--color-red)] hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}

export function StatisticsPageView() {
  const [filterValue, setFilterValue] = useState("All Time");
  const [seasonOptions, setSeasonOptions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    let cancelled = false;

    async function loadSeasons() {
      try {
        const rows = await fetchInternalApi<Array<{ year: number }>>("/api/seasons");
        if (cancelled) return;

        setSeasonOptions(rows.map((row) => String(row.year)));
      } catch {
        if (!cancelled) {
          setSeasonOptions([]);
        }
      }
    }

    void loadSeasons();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeScope = filterValue === "All Time" ? "All-Time" : "Season";
  const selectedSeason = filterValue === "All Time" ? "" : filterValue;
  const statisticsFilterOptions = useMemo(() => ["All Time", ...seasonOptions], [seasonOptions]);

  const categories = useMemo(() => {
    if (activeScope !== "Season" || !selectedSeason) {
      return statisticsCategories;
    }

    return statisticsCategories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        href: item.href.startsWith("/statistics/")
          ? `${item.href}?scope=Season&season=${selectedSeason}`
          : item.href,
      })),
    }));
  }, [activeScope, selectedSeason]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter(
      (category) =>
        category.title.toLowerCase().includes(query) ||
        category.items.some((item) => item.label.toLowerCase().includes(query)),
    );
  }, [categories, search]);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[2px] text-ink3">Stats Library</p>
          <h1 className="font-display text-[64px] leading-[0.9] tracking-[1px] text-ink sm:text-[78px]">Statistics</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink2">
            Explore every dimension of Formula 1 performance, from championships and wins to lap records, sprint
            results, and head-to-head matchups.
          </p>
        </div>

        <Select value={filterValue} onValueChange={setFilterValue}>
          <SelectTrigger aria-label="Season" className={`${premiumSelectTriggerClass} w-full sm:w-[180px]`}>
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className={premiumSelectContentClass}>
            {statisticsFilterOptions.map((option) => (
              <SelectItem key={option} value={option} className="focus:bg-[var(--color-bg)] focus:text-ink">
                {option === "All Time" ? option : `Season ${option}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <DashCard>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-ink3">
            {filteredCategories.length} {filteredCategories.length === 1 ? "category" : "categories"}
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1 sm:flex-none">
              <SearchBox
                value={search}
                onChange={setSearch}
                onClear={() => setSearch("")}
                placeholder="Search statistics"
              />
            </div>
            <div className="flex flex-shrink-0 gap-0.5 rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
              <ViewButton label="Grid view" icon={Grid2X2} active={view === "grid"} onClick={() => setView("grid")} />
              <ViewButton label="List view" icon={List} active={view === "list"} onClick={() => setView("list")} />
            </div>
          </div>
        </div>
      </DashCard>

      <section className={cn(view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3")}>
        {filteredCategories.length ? (
          filteredCategories.map((category) => (
            <StatCategoryCard key={category.title} category={category} view={view} />
          ))
        ) : (
          <EmptyState search={search} onClear={() => setSearch("")} />
        )}
      </section>
    </div>
  );
}
