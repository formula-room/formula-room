import { DashCard } from "@/components/dashboard/page-primitives";
import { StatPill } from "@/components/home/stat-pill";

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
        <div className="flex flex-col gap-2 py-5 pl-6 pr-16">
          {podium.map((entry) => (
            <StatPill
              key={`${entry.position}-${entry.name}`}
              pos={Number.parseInt(entry.position ?? "0", 10) || 0}
              name={entry.name}
              value={entry.time.replace(/\s*pts$/i, "")}
              accentColor={entry.accentColor ?? "#C8201A"}
            />
          ))}
        </div>
      ) : (
        <p className="px-6 py-6 text-[13px] text-ink3">No verified finishing data is available for this race.</p>
      )}
    </DashCard>
  );
}
