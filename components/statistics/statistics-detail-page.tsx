"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { getDriverHref } from "@/lib/route-helpers";
import {
  DashboardPageHeader,
  DataTableShell,
  DashboardPanel,
  premiumSelectContentClass,
  premiumSelectTriggerClass,
} from "@/components/dashboard/page-primitives";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StatisticsScope = "All-Time" | "Season";

type StatisticsDetailResponse = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  metricLabel: string;
  secondaryLabel: string;
  seasons: string[];
  selectedSeason: string;
  supportsSeasonScope: boolean;
  rows: Array<{
    slug: string;
    name: string;
    flag: string;
    team: string;
    primaryValue: string;
    starts: string;
    secondaryValue: string;
  }>;
  foundation?: {
    message: string;
    links: Array<{ label: string; href: string }>;
  };
};

function FoundationState({
  message,
  links,
}: {
  message: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <DashboardPanel className="space-y-4">
      <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.03] p-6 text-white/72">
        <div className="text-sm leading-7">{message}</div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between rounded-[1.15rem] border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/14 hover:bg-white/[0.06]"
          >
            <span className="text-sm text-white/76 transition-colors group-hover:text-white">{link.label}</span>
            <ArrowUpRight className="size-4 text-white/26 transition-colors group-hover:text-[#ff8b68]" />
          </Link>
        ))}
      </div>
    </DashboardPanel>
  );
}

export function StatisticsDetailPageView({
  slug,
  initialScope,
  initialSeason,
}: {
  slug: string;
  initialScope: StatisticsScope;
  initialSeason?: string;
}) {
  const [filterValue, setFilterValue] = useState(
    initialScope === "Season" && initialSeason ? initialSeason : "All Time",
  );
  const [sortOrder, setSortOrder] = useState<"Highest First" | "Lowest First">("Highest First");
  const [data, setData] = useState<StatisticsDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scope: StatisticsScope = filterValue === "All Time" ? "All-Time" : "Season";
  const season = filterValue === "All Time" ? "" : filterValue;

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({
        scope,
      });

      if (season) {
        query.set("season", season);
      }

      try {
        const payload = await fetchInternalApi<StatisticsDetailResponse>(`/api/statistics/${slug}?${query.toString()}`);
        if (cancelled) return;

        setData(payload);
      } catch (loadError) {
        if (!cancelled) {
          setData(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load statistic.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [scope, season, slug]);

  const sortedRows = useMemo(() => {
    if (!data) return [];

    const rows = [...data.rows];
    rows.sort((left, right) => {
      const leftValue = Number(left.primaryValue);
      const rightValue = Number(right.primaryValue);
      const delta = sortOrder === "Highest First" ? rightValue - leftValue : leftValue - rightValue;
      if (delta !== 0) return delta;
      return left.name.localeCompare(right.name);
    });
    return rows;
  }, [data, sortOrder]);

  if (loading && !data) {
    return (
      <Card className="rounded-[1.8rem] p-8 text-center text-white/56">
        Loading statistic detail...
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="rounded-[1.8rem] p-8 text-center text-[#ff9e84]">
        {error ?? "Statistic detail is not available yet."}
      </Card>
    );
  }

  const statisticsFilterOptions = data.supportsSeasonScope ? ["All Time", ...data.seasons] : ["All Time"];

  return (
    <div className="space-y-5 lg:space-y-6">
      <DashboardPageHeader
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        meta={[
          `Filter: ${filterValue}`,
          `${data.metricLabel} ranking`,
        ]}
        actions={
          <>
            <Select
              value={filterValue}
              onValueChange={setFilterValue}
            >
                <SelectTrigger className={`${premiumSelectTriggerClass} w-full sm:w-[180px]`}>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className={premiumSelectContentClass}>
                  {statisticsFilterOptions.map((option) => (
                    <SelectItem key={option} value={option} className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "Highest First" | "Lowest First")}>
              <SelectTrigger className={`${premiumSelectTriggerClass} w-full sm:w-[180px]`}>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className={premiumSelectContentClass}>
                <SelectItem value="Highest First" className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white">
                  Highest First
                </SelectItem>
                <SelectItem value="Lowest First" className="focus:bg-slate-950/8 focus:text-slate-950 dark:focus:bg-white/8 dark:focus:text-white">
                  Lowest First
                </SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {data.foundation ? (
        <FoundationState message={data.foundation.message} links={data.foundation.links} />
      ) : sortedRows.length > 0 ? (
        <DashboardPanel>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Position</TableHead>
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Driver</TableHead>
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Team</TableHead>
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">{data.metricLabel}</TableHead>
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">Starts</TableHead>
                  <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-white/34">{data.secondaryLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row, index) => {
                  const href = getDriverHref(row.slug);

                  return (
                    <TableRow key={`${row.slug}-${row.primaryValue}`} className="border-white/8 hover:bg-white/[0.03]">
                      <TableCell className="px-5 py-4 text-sm font-semibold text-white/88">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-white">
                        {href ? (
                          <Link href={href} className="inline-flex items-center gap-2 hover:text-[#ff8b68]">
                            <span>{row.flag}</span>
                            <span>{row.name}</span>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span>{row.flag}</span>
                            <span>{row.name}</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-white/58">{row.team}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-white/82">{row.primaryValue}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-white/72">{row.starts}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-white/72">{row.secondaryValue}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DataTableShell>
        </DashboardPanel>
      ) : (
        <Card className="rounded-[1.8rem] p-8 text-center text-white/56">
          No ranked entries are available for this statistic yet.
        </Card>
      )}
    </div>
  );
}
