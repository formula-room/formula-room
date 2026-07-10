"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import {
  type DriverProfileRecord,
} from "@/lib/driver-profile-data";
import { getTeamHrefByName } from "@/lib/route-helpers";
import { premiumSegmentedListClass, premiumSegmentedTriggerClass } from "@/components/dashboard/page-primitives";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="gap-0 rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</div>
      <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]" style={{ color: accent }}>
        {value}
      </div>
    </Card>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-[1.8rem] border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
        {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      </div>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

function SummaryFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function LightTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
      {children}
    </div>
  );
}

export function DriverProfilePageView({
  slug,
}: {
  slug: string;
}) {
  const [driver, setDriver] = useState<DriverProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDriver() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInternalApi<DriverProfileRecord>(`/api/drivers/by-slug/${slug}`);
        if (!cancelled) {
          setDriver(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setDriver(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load driver profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDriver();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-slate-500">Loading driver profile...</div>
      </Card>
    );
  }

  if (error || !driver) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-[#d14f3b]">{error ?? "Driver profile data is not available yet."}</div>
      </Card>
    );
  }

  const teamHref = getTeamHrefByName(driver.teamLabel);

  return (
    <div className="space-y-6 lg:space-y-8">
      <section
        className="overflow-hidden rounded-[2.2rem] border border-white/50 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.18)]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${driver.accent} 0%, ${driver.accentSoft} 42%, #ffffff 100%)`,
        }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                Driver Profile
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                {driver.teamLabel}
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                {driver.eraLabel}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-4xl sm:text-5xl">{driver.flag}</div>
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  {driver.name}
                </h1>
                {driver.number !== "--" ? (
                  <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800">
                    #{driver.number}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                <span>{driver.nationality}</span>
                <span>{driver.teamLabel}</span>
                <span>{driver.eraLabel}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-900/10 bg-white/78 p-5 backdrop-blur-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Profile Baseline</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-slate-500">Current team</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">
                  {teamHref ? <Link href={teamHref} className="hover:underline">{driver.teamLabel}</Link> : driver.teamLabel}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Nationality</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{driver.nationality}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Era label</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{driver.eraLabel}</div>
              </div>
              <div className="grid gap-2 pt-2">
                {teamHref ? (
                  <Link href={teamHref} className="text-sm font-medium text-slate-700 hover:text-slate-950">
                    Open team profile
                  </Link>
                ) : null}
                <Link href="/standings" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  View championship standings
                </Link>
                <Link href="/head-to-head" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  Compare in head-to-head
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="Overview" className="space-y-5">
        <TabsList className={premiumSegmentedListClass}>
          {["Overview", "Season by Season", "Grand Prix", "Qualifying", "Sprint", "Records / Streaks"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn("px-4 py-2 text-sm", premiumSegmentedTriggerClass)}
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Overview" className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {driver.overviewStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} accent={driver.accent} />
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {driver.secondaryStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} accent={driver.accent} />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard title="Career Summary" description="Debut markers, win landmarks, and current role.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {driver.summaryFacts.map((fact) => (
                  <SummaryFact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Milestones" description="Selected benchmark achievements and context points.">
              <div className="space-y-3">
                {driver.milestones.map((item) => (
                  <div key={item.label} className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{item.label}</div>
                    <div className="mt-2 text-sm font-medium text-slate-800">{item.value}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="Season by Season">
          <SectionCard title="Season by Season" description="Full campaign-level results across teams and eras.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Season</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Position</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Points</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Starts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.seasons.map((season) => (
                    <TableRow key={season.season} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{season.season}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.team}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.position}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.wins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.poles}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.points}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.starts}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Grand Prix">
          <SectionCard title="Grand Prix Breakdown" description="Race-focused venue performance and scoring profile.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Starts</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Best Finish</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.grandPrixBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.starts}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.wins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.bestFinish}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Qualifying">
          <SectionCard title="Qualifying Breakdown" description="Pole venues, front-row strength, and grid consistency.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Front Rows</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Q3s</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Best Grid</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Average Grid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.qualifyingBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.poles}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.frontRows}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.q3s}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.bestGrid}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.averageGrid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Sprint">
          <SectionCard title="Sprint Breakdown" description="Sprint weekends isolated from the main Grand Prix record.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Sprint Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Points</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Best Finish</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.sprintBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.sprintWins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.points}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.bestFinish}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Records / Streaks" className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {driver.records.map((record) => (
              <Card key={record.label} className="gap-0 rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{record.label}</div>
                <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]" style={{ color: driver.accent }}>
                  {record.value}
                </div>
                <div className="mt-3 text-sm text-slate-500">{record.detail}</div>
              </Card>
            ))}
          </section>

          <SectionCard title="Championship Chronology" description="Title trajectory and peak campaign context.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Season</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Result</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.championshipChronology.map((row) => (
                    <TableRow key={`${row.season}-${row.result}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.season}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.result}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
