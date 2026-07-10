import { CalendarDays, CircleDot, MapPin } from "lucide-react";

import { CircuitOutline } from "@/components/circuit/circuit-outline";
import { premiumSegmentedListClass, premiumSegmentedTriggerClass } from "@/components/dashboard/page-primitives";
import { HomeRankingRow } from "@/components/home/ranking-row";
import { cn } from "@/lib/utils";
import { CountryFlag } from "@/components/shared/country-flag";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Session = {
  position?: string;
  name: string;
  label: string;
  time: string;
  accentColor?: string;
};

type RaceCardProps = {
  variant: "next" | "last";
  eyebrow: string;
  flagCountry: string;
  location: string;
  circuitId: string;
  circuitName: string;
  round: string;
  title: string;
  subtitle: string;
  date: string;
  status: string;
  sessions: Session[];
  overview: {
    circuitLength: string;
    numberOfLaps: string;
    raceDistance: string;
    firstGrandPrix: string;
    fastestLap: string;
    fastestLapHolder: string;
    fastestLapYear: string;
  };
};

export function RaceCard({
  variant,
  eyebrow,
  flagCountry,
  location,
  circuitId,
  circuitName,
  round,
  title,
  subtitle,
  date,
  sessions,
  overview,
}: RaceCardProps) {
  const primaryTab = variant === "last" ? "results" : "schedule";
  const primaryLabel = variant === "last" ? "Results" : "Schedule";
  const primaryEmptyMessage =
    variant === "last"
      ? "No verified finishing data is available for this race."
      : "Detailed session data is unavailable for this block.";

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[2rem] border-white/10 bg-[#0f1520]/88 p-0 shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        variant === "next" && "bg-[linear-gradient(135deg,rgba(255,96,56,0.14),rgba(15,21,32,0.96)_42%,rgba(15,21,32,0.95))]"
      )}
    >
      <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="rounded-full bg-[#ff6238] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white shadow-[0_0_25px_rgba(255,98,56,0.35)]">
              {eyebrow}
            </Badge>
          </div>

          <div className="space-y-5">
            <CountryFlag country={flagCountry} />
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
                {title}
              </h1>
              <div className="text-base text-white/58 sm:text-lg">{subtitle}</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] text-white/58">
                  <CalendarDays className="size-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">Date</div>
                  <div className="mt-2 text-xl font-semibold text-white">{date}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] text-white/58">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">Location</div>
                  <div className="mt-2 text-xl font-semibold text-white">{location}</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] text-white/58">
                  <CircleDot className="size-4" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-white/40">Round</div>
                  <div className="mt-2 text-xl font-semibold text-white">{round}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue={primaryTab} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
          <TabsList className={cn("grid grid-cols-2", premiumSegmentedListClass)}>
            <TabsTrigger
              value={primaryTab}
              className={cn("text-xs uppercase tracking-[0.28em]", premiumSegmentedTriggerClass)}
            >
              {primaryLabel}
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className={cn("text-xs uppercase tracking-[0.28em]", premiumSegmentedTriggerClass)}
            >
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value={primaryTab} className="mt-5 space-y-3">
            {sessions.length > 0 ? (
              sessions.map((session, index) => {
                return variant === "last" ? (
                  <HomeRankingRow
                    key={`${session.position ?? index}-${session.name}`}
                    position={session.position ?? String(index + 1).padStart(2, "0")}
                    name={session.name}
                    sublabel={session.label}
                    accentColor={session.accentColor ?? "#ff6a3d"}
                    index={index}
                    points={session.time}
                  />
                ) : (
                  <div
                    key={session.name}
                    className="flex items-center justify-between rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{session.name}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-white/38">
                        {session.label}
                      </div>
                    </div>
                    <div className="text-base font-semibold text-white/90 sm:text-lg">{session.time}</div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/58">
                {primaryEmptyMessage}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview" className="mt-5">
            <div className="grid gap-3">
              <div className="grid gap-3 rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-3 sm:grid-cols-[178px_1fr]">
                <div className="flex min-h-[156px] items-center justify-center rounded-[1.1rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-2 py-2">
                  <CircuitOutline
                    circuitId={circuitId}
                    circuitName={circuitName}
                    alt={`${circuitName} outline`}
                    theme="dark"
                    className="h-32 w-full max-w-[152px]"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Circuit Length</div>
                    <div className="mt-2 text-sm font-semibold text-white/86">{overview.circuitLength}</div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Number of Laps</div>
                    <div className="mt-2 text-sm font-semibold text-white/86">{overview.numberOfLaps}</div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Race Distance</div>
                    <div className="mt-2 text-sm font-semibold text-white/86">{overview.raceDistance}</div>
                  </div>
                  <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">First Grand Prix</div>
                    <div className="mt-2 text-sm font-semibold text-white/86">{overview.firstGrandPrix}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/34">Fastest Lap</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {overview.fastestLap} - {overview.fastestLapHolder}
                  {overview.fastestLapYear ? ` (${overview.fastestLapYear})` : ""}
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </Card>
  );
}
