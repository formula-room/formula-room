import { DashCard, PosBadge, TeamStripe } from "@/components/dashboard/page-primitives";

type PodiumEntry = {
  position?: string;
  name: string;
  label: string;
  time: string;
  accentColor?: string;
};

type LastRaceCardProps = {
  title: string;
  circuitName: string;
  location: string;
  date: string;
  podium: PodiumEntry[];
};

export function LastRaceCard({ title, circuitName, location, date, podium }: LastRaceCardProps) {
  return (
    <DashCard className="h-full">
      <div className="border-b border-[var(--color-line)] px-6 py-5">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Last Race</p>
        <h2 className="font-display text-[22px] leading-none tracking-[0.5px] text-ink">{title}</h2>
        <p className="mt-1.5 text-[12px] text-ink3">
          {circuitName} · {location} · {date}
        </p>
      </div>

      {podium.length ? (
        <div>
          <div className="grid grid-cols-[32px_1fr_1fr_64px] gap-3 border-b border-[var(--color-line)] px-6 py-2.5 text-[10px] font-medium uppercase tracking-[0.8px] text-ink3 sm:grid-cols-[32px_1fr_1fr_80px]">
            <span>Pos</span>
            <span>Driver</span>
            <span>Team</span>
            <span className="text-right">Pts</span>
          </div>
          {podium.map((entry) => (
            <div
              key={`${entry.position}-${entry.name}`}
              className="grid grid-cols-[32px_1fr_1fr_64px] items-center gap-3 border-b border-[var(--color-line)] px-6 py-3 last:border-b-0 sm:grid-cols-[32px_1fr_1fr_80px]"
            >
              <PosBadge pos={Number.parseInt(entry.position ?? "0", 10) || 0} />
              <div className="flex min-w-0 items-center gap-2.5">
                <TeamStripe teamColor={entry.accentColor ?? "#C8201A"} />
                <span className="truncate text-[13px] font-medium text-ink">{entry.name}</span>
              </div>
              <span className="truncate text-[12px] text-ink3">{entry.label}</span>
              <span className="text-right text-[13px] font-semibold tabular-nums text-ink">
                {entry.time.replace(/\s*pts$/i, "")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-6 py-6 text-[13px] text-ink3">No verified finishing data is available for this race.</p>
      )}
    </DashCard>
  );
}
