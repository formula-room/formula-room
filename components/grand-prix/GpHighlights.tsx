"use client";

import type { GrandPrixSummary } from "@/lib/grand-prix-data";
import { cn } from "@/lib/utils";

function initials(value: string) {
  const parts = value.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "-") + (parts.at(-1)?.[0] ?? "");
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

function summaryByLabel(cards: GrandPrixSummary[], label: string) {
  return cards.find((card) => card.label.toLowerCase() === label.toLowerCase());
}

export function GpHighlights({ cards }: { cards: GrandPrixSummary[] }) {
  const highlights = [
    { key: "Most Wins", label: "Most Wins", barColor: "var(--gp-wins)" },
    { key: "Most Poles", label: "Most Poles", barColor: "var(--gp-poles)" },
    { key: "Most Podiums", label: "Most Podiums", barColor: "var(--gp-podiums)" },
    { key: "Latest Winner", label: "Latest Winner", barColor: "var(--gp-latest)", isLatest: true },
  ].map((item) => ({ ...item, data: summaryByLabel(cards, item.key) }));

  return (
    <section className="mb-6 grid gap-5 animate-fade-up animate-fade-up-3 sm:grid-cols-2 xl:grid-cols-4">
      {highlights.map((card) => {
        const data = card.data;
        const color = teamColor(data?.teamOrValue ?? data?.name ?? "");

        return (
          <div
            key={card.key}
            className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white transition-all duration-200 hover:-translate-y-[2px] hover:border-[var(--color-line3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)]"
          >
            <div className="h-[3px]" style={{ background: card.barColor }} />
            <div className="px-6 pb-6 pt-5">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                {card.label}
              </p>
              <div className="mb-4 flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center font-display text-[13px] tracking-[0.5px]",
                    card.isLatest ? "rounded-[8px]" : "rounded-full",
                  )}
                  style={{
                    background: "color-mix(in srgb, currentColor 10%, transparent)",
                    color,
                  }}
                >
                  {card.isLatest ? data?.flag ?? "F1" : initials(data?.name ?? "--")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium leading-tight text-ink">
                    {data?.name ?? "--"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink3">
                    {data?.teamOrValue ?? "Stored coverage"}
                  </p>
                </div>
              </div>
              <p className="font-display text-[20px] tracking-[0.5px] text-[var(--color-red)]">
                {data?.stat ?? "--"}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
