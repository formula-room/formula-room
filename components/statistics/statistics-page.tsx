"use client";

import Link from "next/link";
import { ArrowUpRight, Grid2X2, List, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { cn } from "@/lib/utils";
import { statisticsCategories, type StatisticsCategory } from "@/lib/statistics-data";
import {
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import { CategoryIcon } from "@/components/statistics/CategoryIcon";
import { categoryRgb } from "@/components/statistics/categoryConfig";
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

function LinkRow({
  link,
  categoryId,
  view,
  isLast,
}: {
  link: { label: string; href: string };
  categoryId: string;
  view: ViewMode;
  isLast: boolean;
}) {
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-between border-b border-[var(--color-line)] transition-colors hover:bg-[var(--color-bg)]",
        view === "grid" ? "px-6 py-3.5" : "px-5 py-3",
        isLast && view === "grid" && "border-b-0",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className="h-[5px] w-[5px] flex-shrink-0 rounded-full"
          style={{ backgroundColor: categoryVar(categoryId) }}
        />
        <span className="truncate text-[13px] text-ink2 transition-colors group-hover:text-ink">
          {link.label}
        </span>
      </span>
      <span className="ml-4 text-[12px] text-ink3 opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100">
        -&gt;
      </span>
    </Link>
  );
}

function StatCategoryCard({
  category,
  view,
  index,
}: {
  category: StatisticsCategory;
  view: ViewMode;
  index: number;
}) {
  const categoryId = categoryIdFromTitle(category.title);
  const accent = categoryVar(categoryId);
  const tint = categoryRgb[categoryId] ?? categoryRgb.championships;
  const linksLabel = `${category.items.length} ${category.items.length === 1 ? "link" : "links"}`;

  if (view === "list") {
    return (
      <article
        className="group animate-fade-up overflow-hidden rounded-[10px] border border-[var(--color-line2)] bg-white transition-all duration-200 hover:border-[var(--color-line3)]"
        style={{ animationDelay: `${0.05 + index * 0.03}s` }}
      >
        <div
          className="flex items-center gap-4 border-b border-[var(--color-line)] px-5 py-4"
          style={{ borderLeft: `3px solid ${accent}` }}
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[7px]"
            style={{ backgroundColor: `rgba(${tint}, 0.08)` }}
          >
            <CategoryIcon
              categoryId={categoryId}
              className="h-4 w-4"
              style={{ color: accent }}
            />
          </div>
          <p className="min-w-0 flex-1 truncate font-display text-[18px] leading-none tracking-[0.5px] text-ink">
            {category.title}
          </p>
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-ink3">
            {linksLabel}
          </span>
          <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-ink3 transition-colors group-hover:text-ink" />
        </div>
        <div className="grid sm:grid-cols-2">
          {category.items.map((link, linkIndex) => (
            <LinkRow
              key={`${category.title}-${link.label}-${link.href}`}
              link={link}
              categoryId={categoryId}
              view="list"
              isLast={linkIndex === category.items.length - 1}
            />
          ))}
        </div>
      </article>
    );
  }

  return (
    <article
      className="group animate-fade-up cursor-pointer overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--color-line3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]"
      style={{ animationDelay: `${0.05 + index * 0.03}s` }}
    >
      <div className="h-[3px] w-full" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between border-b border-[var(--color-line)] px-6 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[9px]"
            style={{ backgroundColor: `rgba(${tint}, 0.08)` }}
          >
            <CategoryIcon
              categoryId={categoryId}
              className="h-[18px] w-[18px]"
              style={{ color: accent }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-[22px] leading-none tracking-[0.5px] text-ink">
              {category.title}
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[1px] text-ink3">
              {linksLabel}
            </p>
          </div>
        </div>
        <div className="mt-0.5 flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-[6px] border border-[var(--color-line2)] text-[13px] text-ink3 transition-all group-hover:border-[var(--color-line3)] group-hover:bg-[var(--color-bg)] group-hover:text-ink">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex flex-col">
        {category.items.map((link, linkIndex) => (
          <LinkRow
            key={`${category.title}-${link.label}-${link.href}`}
            link={link}
            categoryId={categoryId}
            view="grid"
            isLast={linkIndex === category.items.length - 1}
          />
        ))}
      </div>
    </article>
  );
}

function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[16px] border border-[var(--color-line2)] bg-[var(--color-bg2)]">
        <Search className="h-7 w-7 text-ink3" />
      </div>
      <p className="font-display text-[22px] tracking-[0.5px] text-ink2">No results found</p>
      <p className="max-w-[280px] text-[13px] leading-relaxed text-ink3">
        No statistics categories match <em>{search ? `"${search}"` : "the current filter"}</em>.
        Try a different term.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 text-[12px] font-medium text-[var(--color-red)] hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}

export function StatisticsPageView() {
  const [filterValue, setFilterValue] = useState("All Time");
  const [seasonOptions, setSeasonOptions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All categories");
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

  const categoryPills = useMemo(() => ["All categories", ...categories.map((category) => category.title)], [categories]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      if (activeCategory !== "All categories" && category.title !== activeCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        category.title.toLowerCase().includes(query) ||
        category.items.some((item) => item.label.toLowerCase().includes(query))
      );
    });
  }, [activeCategory, categories, search]);

  return (
    <div className="mx-auto max-w-[1140px] px-4 py-8 pb-20 sm:px-8 lg:py-10">
      <section className="mb-8 flex flex-col gap-6 animate-fade-up animate-fade-up-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-[var(--color-red)]" />
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-ink3">
              Stats Library
            </span>
          </div>
          <h1 className="font-display text-[64px] leading-[0.92] tracking-[1px] text-ink">
            Statistics
          </h1>
          <p className="mt-3 max-w-[480px] text-[13px] font-light leading-relaxed text-ink3">
            Explore every dimension of Formula 1 performance, from championships and wins to lap
            records, sprint results, and head-to-head matchups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className={`${premiumSelectTriggerClass} h-10 w-full rounded-[8px] px-4 sm:w-[180px]`}>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className={premiumSelectContentClass}>
              {statisticsFilterOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-[5px] transition-all",
                view === "grid" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
              )}
            >
              <Grid2X2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-[5px] transition-all",
                view === "list" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 animate-fade-up animate-fade-up-2">
        <div className="flex max-w-[420px] items-center gap-2.5 rounded-[10px] border border-[var(--color-line2)] bg-white px-4 py-3 transition-colors focus-within:border-[var(--color-line3)]">
          <Search className="h-4 w-4 flex-shrink-0 text-ink3" />
          <input
            type="text"
            placeholder="Search statistics..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-ink outline-none placeholder:text-ink3"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-ink3 transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </section>

      <section className="mb-8 flex flex-wrap gap-2 animate-fade-up animate-fade-up-3">
        {categoryPills.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.5px] transition-all",
              activeCategory === category
                ? "border-ink bg-ink text-white"
                : "border-[var(--color-line2)] bg-white text-ink3 hover:border-[var(--color-line3)] hover:text-ink2",
            )}
          >
            {category}
          </button>
        ))}
      </section>

      <section
        className={cn(
          "animate-fade-up animate-fade-up-4",
          view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3",
        )}
      >
        {filteredCategories.length ? (
          filteredCategories.map((category, index) => (
            <StatCategoryCard
              key={category.title}
              category={category}
              view={view}
              index={index}
            />
          ))
        ) : (
          <EmptyState
            search={search}
            onClear={() => {
              setSearch("");
              setActiveCategory("All categories");
            }}
          />
        )}
      </section>
    </div>
  );
}
