"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { DriverLeader, GrandPrixSortMetric, TeamLeader } from "@/lib/grand-prix-data";
import { getDriverHref, getTeamHref } from "@/lib/route-helpers";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortMetrics: GrandPrixSortMetric[] = ["Wins", "Podiums", "Poles", "Starts"];

function metricValue(row: DriverLeader | TeamLeader, metric: GrandPrixSortMetric) {
  if (metric === "Wins") return row.wins;
  if (metric === "Podiums") return row.podiums;
  if (metric === "Poles") return row.poles;
  return row.starts;
}

function teamColor(row: DriverLeader | TeamLeader, type: "driver" | "team") {
  if (type === "driver") return "var(--color-red)";

  const normalized = row.name.toLowerCase();
  if (normalized.includes("mercedes")) return "var(--team-mercedes)";
  if (normalized.includes("ferrari")) return "var(--team-ferrari)";
  if (normalized.includes("red bull")) return "var(--team-redbull)";
  if (normalized.includes("mclaren")) return "var(--team-mclaren)";
  if (normalized.includes("aston")) return "var(--team-aston)";
  if (normalized.includes("williams")) return "var(--team-williams)";
  if (normalized.includes("alpine") || normalized.includes("renault")) return "var(--team-alpine)";
  if (normalized.includes("haas")) return "var(--team-haas)";
  if (normalized.includes("sauber") || normalized.includes("audi")) return "var(--team-sauber)";
  return "var(--color-red)";
}

function StatValue({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "font-display text-[16px] tracking-[0.5px]",
        value === 0 ? "text-[var(--color-ink4)]" : "text-ink2",
      )}
    >
      {value}
    </span>
  );
}

export function GpLeaderboard({
  type,
  rows,
  sortBy,
  onSortChange,
}: {
  type: "driver" | "team";
  rows: DriverLeader[] | TeamLeader[];
  sortBy: GrandPrixSortMetric;
  onSortChange: (metric: GrandPrixSortMetric) => void;
}) {
  const sortedRows = [...rows].sort((a, b) => {
    const byMetric = metricValue(b, sortBy) - metricValue(a, sortBy);
    if (byMetric !== 0) return byMetric;
    return b.wins - a.wins || b.podiums - a.podiums || b.poles - a.poles || b.starts - a.starts;
  });

  return (
    <section className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--color-line2)] px-7 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-display text-[22px] leading-none tracking-[0.5px] text-ink">
            {type === "driver" ? "Driver Leaders" : "Team Leaders"}
          </p>
          <p className="mt-1 max-w-[200px] text-[11px] font-light leading-relaxed text-ink3">
            Positions update automatically from the selected sort metric.
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[1px] text-ink3">Sort by</span>
          <Select value={sortBy} onValueChange={(value) => onSortChange(value as GrandPrixSortMetric)}>
            <SelectTrigger className="h-auto rounded-[7px] border border-[var(--color-line2)] bg-[var(--color-bg)] py-1.5 pl-3 pr-8 text-[12px] font-medium text-ink2 shadow-none focus:border-[var(--color-line3)] [&>svg]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-[var(--color-line2)] bg-[var(--color-white)] text-ink">
              {sortMetrics.map((metric) => (
                <SelectItem key={metric} value={metric} className="focus:bg-[var(--color-bg)] focus:text-ink">
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ChevronDown className="-ml-8 h-3 w-3 text-ink3" />
        </div>
      </div>

      <div className="max-h-[380px] overflow-x-auto overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-[var(--color-line2)] bg-[var(--color-bg)]">
              <th className="w-[44px] px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">Pos</th>
              {type === "driver" ? (
                <th className="w-[24px] px-2 py-2.5 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3" />
              ) : null}
              <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                {type === "driver" ? "Driver" : "Team"}
              </th>
              {sortMetrics.map((heading) => (
                <th key={heading} className="px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => {
              const href = type === "driver" ? getDriverHref(row.slug) : getTeamHref(row.slug);

              return (
                <tr key={`${type}-${row.slug}`} className="border-b border-[var(--color-line)] transition-colors last:border-b-0 hover:bg-[var(--color-bg)]">
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "font-display text-[16px] tracking-[0.5px]",
                        index === 0 && "text-[var(--color-gold)]",
                        index === 1 && "text-[var(--color-silver)]",
                        index === 2 && "text-[var(--color-bronze)]",
                        index > 2 && "text-ink3",
                      )}
                    >
                      {index + 1}
                    </span>
                  </td>
                  {type === "driver" ? (
                    <td className="px-2 py-3.5 text-[13px]">{(row as DriverLeader).flag}</td>
                  ) : null}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-[22px] w-[3px] flex-shrink-0 rounded-[2px]"
                        style={{ background: teamColor(row, type) }}
                      />
                      {href ? (
                        <Link href={href} className="truncate text-[13px] font-medium text-ink hover:text-[var(--color-red)]">
                          {row.name}
                        </Link>
                      ) : (
                        <span className="truncate text-[13px] font-medium text-ink">{row.name}</span>
                      )}
                    </div>
                  </td>
                  {[row.wins, row.podiums, row.poles, row.starts].map((value, valueIndex) => (
                    <td key={`${row.slug}-${valueIndex}`} className="px-3 py-3.5 text-center">
                      <StatValue value={value} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
