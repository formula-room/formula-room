"use client";

import Link from "next/link";

import type { GrandPrixRecord, GrandPrixScope } from "@/lib/grand-prix-data";
import { getCircuitHrefByName, getDriverHrefByName, getTeamHrefByName } from "@/lib/route-helpers";

function isMissing(value: string) {
  return !value || value === "--" || value === "—";
}

function teamColor(value: string) {
  const normalized = value.toLowerCase();
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

function MaybeDriverLink({ value }: { value: string }) {
  if (isMissing(value)) {
    return <span className="text-[13px] text-[var(--color-ink4)]">—</span>;
  }

  const href = getDriverHrefByName(value);
  return href ? (
    <Link href={href} className="text-[13px] text-ink2 hover:text-[var(--color-red)]">
      {value}
    </Link>
  ) : (
    <span className="text-[13px] text-ink2">{value}</span>
  );
}

export function GpRaceHistory({
  record,
  scope,
}: {
  record: GrandPrixRecord;
  scope: GrandPrixScope;
}) {
  const scopeData = record.scopes[scope];

  return (
    <section className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white animate-fade-up animate-fade-up-5">
      <div className="border-b border-[var(--color-line2)] px-7 py-5">
        <p className="font-display text-[26px] tracking-[0.5px] text-ink">Race History</p>
        <p className="mt-1 text-[12px] font-light text-ink3">{scopeData.description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-line2)] bg-[var(--color-bg)]">
              {["Year", "Winner", "Team", "Pole Sitter", "Fastest Lap", "Circuit"].map((heading) => (
                <th key={heading} className="px-7 py-2.5 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scopeData.history.map((row) => {
              const winnerHref = getDriverHrefByName(row.winner);
              const teamHref = getTeamHrefByName(row.team);
              const circuitHref = getCircuitHrefByName(row.circuit);

              return (
                <tr key={`${record.slug}-${scope}-${row.year}`} className="border-b border-[var(--color-line)] transition-colors last:border-b-0 hover:bg-[var(--color-bg)]">
                  <td className="px-7 py-4">
                    <span className="font-display text-[18px] tracking-[0.5px] text-ink">{row.year}</span>
                  </td>
                  <td className="px-7 py-4">
                    {winnerHref ? (
                      <Link href={winnerHref} className="text-[13px] font-medium text-ink hover:text-[var(--color-red)]">
                        {row.winner}
                      </Link>
                    ) : (
                      <span className="text-[13px] font-medium text-ink">{row.winner}</span>
                    )}
                  </td>
                  <td className="px-7 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-[18px] w-[3px] flex-shrink-0 rounded-[2px]" style={{ background: teamColor(row.team) }} />
                      {teamHref ? (
                        <Link href={teamHref} className="text-[12px] text-ink3 hover:text-ink">
                          {row.team}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-ink3">{row.team}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-7 py-4">
                    <MaybeDriverLink value={row.poleSitter} />
                  </td>
                  <td className="px-7 py-4">
                    <MaybeDriverLink value={row.fastestLap} />
                  </td>
                  <td className="px-7 py-4">
                    {circuitHref ? (
                      <Link href={circuitHref} className="text-[12px] text-ink3 hover:text-ink">
                        {row.circuit}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-ink3">{row.circuit}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
