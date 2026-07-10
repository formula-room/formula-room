export function SeasonProgress({
  completedRounds,
  totalRounds,
  remainingRounds,
  firstRaceName,
  lastRaceName,
}: {
  completedRounds: number;
  totalRounds: number;
  remainingRounds: number;
  firstRaceName: string;
  lastRaceName: string;
}) {
  const progress = totalRounds > 0 ? (completedRounds / totalRounds) * 100 : 0;

  return (
    <section className="mb-5 flex flex-col gap-5 rounded-[12px] border border-[var(--color-line2)] bg-white px-5 py-5 animate-fade-up animate-fade-up-2 lg:flex-row lg:items-center lg:gap-8 lg:px-7">
      <span className="flex-shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-[1px] text-ink3">
        Season progress
      </span>

      <div className="flex-1">
        <div className="relative h-[5px] overflow-hidden rounded-full bg-[var(--color-bg3)]">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-[var(--cal-done)]"
            style={{ width: `${progress}%` }}
          />
          {totalRounds > 0 && remainingRounds > 0 ? (
            <div
              className="absolute top-0 h-full w-[4.5%] rounded-full bg-[var(--cal-next)] animate-pulse"
              style={{ left: `${Math.min(progress, 95.5)}%` }}
            />
          ) : null}
        </div>
        <div className="mt-1.5 flex justify-between gap-3">
          <span className="truncate text-[10px] text-ink3">{firstRaceName || "First race"}</span>
          <span className="text-[10px] text-ink3">Mid-season</span>
          <span className="truncate text-right text-[10px] text-ink3">{lastRaceName || "Last race"}</span>
        </div>
      </div>

      <div className="hidden h-9 w-px flex-shrink-0 bg-[var(--color-line2)] lg:block" />

      <div className="flex flex-shrink-0 gap-6">
        {[
          { val: completedRounds, label: "Done", color: "var(--cal-done)" },
          { val: remainingRounds > 0 ? 1 : 0, label: "Next up", color: "var(--cal-next)" },
          { val: remainingRounds, label: "Remaining", color: "var(--cal-up)" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-[24px] leading-none tracking-[0.5px]" style={{ color: stat.color }}>
              {stat.val}
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.8px] text-ink3">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
