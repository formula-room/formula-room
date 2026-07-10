"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  raceDate: string;
};

function parseRaceDate(value: string) {
  const parsed = Date.parse(`${value} UTC`);
  return Number.isNaN(parsed) ? null : parsed;
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

export function CountdownTimer({ raceDate }: CountdownTimerProps) {
  const target = useMemo(() => parseRaceDate(raceDate), [raceDate]);
  const [time, setTime] = useState(() => getTime(target));

  useEffect(() => {
    const tick = () => setTime(getTime(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <div>
      <p className="mb-4 text-[10px] font-medium uppercase tracking-[1.4px] text-ink3">Race starts in</p>
      <div className="flex items-end overflow-x-auto pb-1">
        {[
          { val: time.d, label: "Days" },
          { val: time.h, label: "Hours" },
          { val: time.m, label: "Mins" },
          { val: time.s, label: "Secs" },
        ].map((unit, index) => (
          <div key={unit.label} className="flex items-end">
            {index > 0 ? (
              <span className="translate-y-[-0.12em] px-1 font-display text-[56px] leading-none text-[var(--color-red)] opacity-50 sm:text-[72px]">
                :
              </span>
            ) : null}
            <div className="text-center">
              <span className="block font-display text-[60px] leading-none tracking-[2px] text-ink transition-transform duration-300 sm:text-[88px]">
                {String(unit.val).padStart(2, "0")}
              </span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">
                {unit.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
