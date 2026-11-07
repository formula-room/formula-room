"use client";

import { useEffect, useMemo, useState } from "react";

import { CountryFlag } from "@/components/shared/country-flag";

type CountdownPanelProps = {
  available: boolean;
  round: string;
  flagCountry: string;
  title: string;
  location: string;
  date: string;
  raceStartUtc?: string;
  dateRange: string;
  isLive: boolean;
};

function resolveTarget(raceStartUtc: string | undefined, fallbackDate: string) {
  if (raceStartUtc) {
    const precise = Date.parse(raceStartUtc);
    if (!Number.isNaN(precise)) {
      return precise;
    }
  }

  const fallback = Date.parse(`${fallbackDate} UTC`);
  return Number.isNaN(fallback) ? null : fallback;
}

const COUNTDOWN_SIZE = "text-[48px] min-[360px]:text-[56px] sm:text-[88px] lg:text-[116px]";

function RollingDigits({ value }: { value: string }) {
  return (
    <span className="inline-flex">
      {value.split("").map((char, index) => (
        // Fixed-width cells stop the digits shifting sideways as the seconds tick.
        <span
          key={index}
          className={`relative inline-block h-[1em] w-[0.44em] overflow-hidden text-center font-display leading-none text-[#f8fafc] ${COUNTDOWN_SIZE}`}
        >
          <span key={char} className="block animate-roll-digit">
            {char}
          </span>
        </span>
      ))}
    </span>
  );
}

function getTime(target: number | null) {
  if (!target) {
    return { d: 0, h: 0, m: 0, s: 0 };
  }

  const diff = Math.max(target - Date.now(), 0);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownPanel({ available, round, flagCountry, title, location, date, raceStartUtc, dateRange, isLive }: CountdownPanelProps) {
  const target = useMemo(
    () => (available ? resolveTarget(raceStartUtc, date) : null),
    [available, raceStartUtc, date],
  );
  const [time, setTime] = useState(() => getTime(target));

  useEffect(() => {
    const tick = () => setTime(getTime(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <section className="relative overflow-hidden rounded-t-[14px] bg-[#1d1d1d]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-red)] to-transparent" />

      <div className="flex flex-col items-center justify-center gap-7 px-4 py-9 text-center sm:gap-8 sm:px-9 sm:py-11 lg:py-12">
        {isLive ? (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-[var(--color-red)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-red)] animate-pulse" />
            Live
          </span>
        ) : null}

        {available ? (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-[rgba(248,250,252,0.62)]">
              Next Race · Round {round}
            </p>
            <h2 className="font-display text-[38px] uppercase leading-none tracking-[1px] text-[#f8fafc] sm:text-[48px] lg:text-[56px]">
              {title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[13px] text-[rgba(248,250,252,0.7)] sm:text-[14px]">
              {flagCountry ? <CountryFlag country={flagCountry} className="h-4 w-6 rounded-[3px]" /> : null}
              <span>
                {location} · {dateRange}
              </span>
            </div>
          </div>
        ) : (
          <h2 className="font-display text-[24px] uppercase leading-none tracking-[1px] text-[#f8fafc]">No upcoming race scheduled</h2>
        )}

        {available ? (
          <div className="flex items-start justify-center">
            {[
              { val: time.d, label: "Days" },
              { val: time.h, label: "Hours" },
              { val: time.m, label: "Mins" },
              { val: time.s, label: "Secs" },
            ].map((unit, index) => (
              <div key={unit.label} className="flex items-start">
                {index > 0 ? (
                  <span className={`px-1 font-display leading-none text-[var(--color-red)] opacity-80 sm:px-3 lg:px-4 ${COUNTDOWN_SIZE}`}>
                    :
                  </span>
                ) : null}
                <div className="text-center">
                  <RollingDigits value={String(unit.val).padStart(2, "0")} />
                  <span className="mt-2.5 block text-[10px] font-medium uppercase tracking-[1.6px] text-[rgba(248,250,252,0.62)] sm:text-[11px] lg:text-[12px]">
                    {unit.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
