"use client";

import { MapPin } from "lucide-react";

import { CircuitOutline } from "@/components/circuit/circuit-outline";
import type { GrandPrixRecord, GrandPrixScope } from "@/lib/grand-prix-data";
import { cn } from "@/lib/utils";

export function GpHeroCard({
  record,
  scope,
}: {
  record: GrandPrixRecord;
  scope: GrandPrixScope;
}) {
  const scopeData = record.scopes[scope];
  const facts = [
    { label: "Location", value: record.location },
    { label: "First Held", value: record.firstHeld },
    { label: "Current Circuit", value: record.currentCircuit },
    { label: "Latest Winner", value: `${record.latestWinner} / ${record.latestWinnerTeam}` },
  ];

  return (
    <section className="mb-6 overflow-hidden rounded-[16px] border border-[var(--color-line2)] bg-white animate-fade-up animate-fade-up-2">
      <div className="grid min-h-[180px] lg:grid-cols-[1fr_260px]">
        <div className="border-b border-[var(--color-line2)] p-7 sm:p-10 lg:border-b-0 lg:border-r">
          <h2 className="mb-1.5 font-display text-[42px] leading-none tracking-[1px] text-ink">
            {record.name}
          </h2>
          <p className="mb-8 text-[12px] font-light text-ink3">
            {scopeData.description}
          </p>

          <div className="grid gap-y-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={cn(
                  "pr-6",
                  index > 0 && "lg:border-l lg:border-[var(--color-line2)] lg:pl-6",
                )}
              >
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                  {fact.label}
                </p>
                <p className="text-[14px] font-medium leading-snug text-ink">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)] p-8">
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.015)_10px,rgba(0,0,0,0.015)_11px)]" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            {record.currentCircuit ? (
              <CircuitOutline
                circuitId={record.currentCircuitId}
                circuitName={record.currentCircuit}
                alt={`${record.currentCircuit} circuit outline`}
                theme="light"
                className="h-[120px] w-[160px] opacity-60"
              />
            ) : (
              <MapPin className="h-12 w-12 text-ink3 opacity-30" />
            )}
            <p className="text-center text-[10px] font-medium uppercase tracking-[1px] text-ink3">
              {record.currentCircuit}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
