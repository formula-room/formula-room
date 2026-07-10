"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { type TeamProfileRecord } from "@/lib/team-profile-data";
import { getDriverHrefByName } from "@/lib/route-helpers";
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

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-900/10 bg-white/58 px-4 py-4 backdrop-blur-sm">
      <div className="text-[10px] uppercase tracking-[0.26em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</div>
    </div>
  );
}

export function TeamProfilePageView({
  slug,
}: {
  slug: string;
}) {
  const [team, setTeam] = useState<TeamProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInternalApi<TeamProfileRecord>(`/api/constructors/by-slug/${slug}`);
        if (!cancelled) {
          setTeam(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setTeam(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load team profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTeam();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-slate-500">Loading team profile...</div>
      </Card>
    );
  }

  if (error || !team) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-[#d14f3b]">{error ?? "Team profile data is not available yet."}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <section
        className="overflow-hidden rounded-[2.2rem] border border-white/50 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.18)]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${team.accent} 0%, ${team.accentSoft} 42%, #ffffff 100%)`,
        }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                Team Profile
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                {team.eraLabel}
              </div>
              <div className="rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-700">
                {team.statusLabel}
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                {team.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                <span>{team.nationality}</span>
                <span>First season: {team.firstSeason}</span>
                <span>{team.activeYears}</span>
              </div>
            </div>

            <div className="max-w-3xl rounded-[1.6rem] border border-slate-900/10 bg-white/46 px-5 py-5 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Constructor Snapshot</div>
              <div className="mt-3 text-base leading-7 text-slate-800">
                {team.name} sits in the database as a {team.statusLabel.toLowerCase()} with coverage spanning{" "}
                {team.activeYears}. This profile combines stored race, qualifying, sprint, and standings data into a
                single constructor view without switching away from the standings context.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {team.overviewStats.slice(0, 4).map((stat) => (
                <HeroMetric key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-900/10 bg-white/78 p-5 backdrop-blur-sm">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Team Identity</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-slate-500">Nationality</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{team.nationality}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Active years</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{team.activeYears}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Status</div>
                <div className="mt-1 text-lg font-semibold text-slate-950">{team.statusLabel}</div>
              </div>
              <div className="grid gap-2 pt-2">
                <Link href="/standings" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  View constructor standings
                </Link>
                <Link href="/results" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  Open results archive
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="Overview" className="space-y-5">
        <TabsList className={premiumSegmentedListClass}>
          {["Overview", "Season by Season", "Drivers", "Grand Prix", "Qualifying", "Records / Streaks"].map((tab) => (
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
            {team.overviewStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} accent={team.accent} />
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {team.secondaryStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} accent={team.accent} />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard title="Team Summary" description="Debut, win landmarks, title cadence, and identity markers.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {team.summaryFacts.map((fact) => (
                  <SummaryFact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Milestones" description="Selected constructor landmarks and defining phases.">
              <div className="space-y-3">
                {team.milestones.map((item) => (
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
          <SectionCard title="Season by Season" description="Constructor performance across recent campaigns and pairings.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Season</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Drivers</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Position</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Points</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Starts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.seasons.map((season) => (
                    <TableRow key={season.season} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{season.season}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{season.drivers}</TableCell>
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

        <TabsContent value="Drivers">
          <SectionCard title="Drivers" description="Current anchors and notable names associated with the team.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {team.drivers.map((driver) => (
                <Card key={`${driver.name}-${driver.era}`} className="gap-0 rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{driver.era}</div>
                  <div className="mt-4 text-xl font-semibold text-slate-950">
                    {getDriverHrefByName(driver.name) ? (
                      <Link href={getDriverHrefByName(driver.name)!} className="hover:underline">
                        {driver.name}
                      </Link>
                    ) : (
                      driver.name
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {driver.nationality}
                    {driver.number ? ` / #${driver.number}` : ""}
                  </div>
                  <div className="mt-4 text-sm text-slate-700">{driver.highlight}</div>
                </Card>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Grand Prix">
          <SectionCard title="Grand Prix Breakdown" description="Race-focused constructor performance by venue.">
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
                  {team.grandPrixBreakdown.map((row) => (
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
          <SectionCard title="Qualifying Breakdown" description="Front-row strength, lockouts, and circuit-specific one-lap pace.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Front Rows</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Lockouts</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Best Grid Avg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.qualifyingBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.poles}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.frontRows}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.lockouts}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.bestGridAverage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Records / Streaks">
          <SectionCard title="Records / Streaks" description="Constructor-level streaks, lockout peaks, and title rhythm.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {team.records.map((record) => (
                <Card key={record.label} className="gap-0 rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{record.label}</div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.04em]" style={{ color: team.accent }}>
                    {record.value}
                  </div>
                  <div className="mt-3 text-sm text-slate-500">{record.detail}</div>
                </Card>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
