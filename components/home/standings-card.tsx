import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { HomeRankingRow } from "@/components/home/ranking-row";
import { Card } from "@/components/ui/card";

type Entry = {
  position: string;
  name: string;
  points: number;
  sublabel: string;
  href?: string | null;
  accentColor: string;
};

type StandingsCardProps = {
  title: string;
  eyebrow: string;
  href?: string;
  entries: Entry[];
};

export function StandingsCard({ title, eyebrow, href, entries }: StandingsCardProps) {
  return (
    <Card className="rounded-[2rem] border-white/10 bg-[#0f1520]/88 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.34em] text-white/42">{eyebrow}</div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">{title}</h2>
        </div>
        {href ? (
          <Link
            href={href}
            className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white hover:text-slate-950"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60">
            <ArrowUpRight className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {entries.map((entry, index) => {
          const rowKey = `${title}-${entry.position}-${entry.name}-${entry.href ?? "static"}`;

          return (
            <HomeRankingRow
              key={rowKey}
              position={entry.position}
              name={entry.name}
              sublabel={entry.sublabel}
              accentColor={entry.accentColor}
              index={index}
              points={entry.points}
              pointsLabel="Points"
              href={entry.href}
            />
          );
        })}
      </div>
    </Card>
  );
}
