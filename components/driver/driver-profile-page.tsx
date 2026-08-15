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
    <Card className="gap-0 rounded-[14px] border-[var(--color-line2)] bg-white p-5">
      <div className="text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{label}</div>
      <div className="mt-4 font-display text-[32px] leading-none tracking-[0.5px]" style={{ color: accent }}>
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
    <Card className="gap-0 rounded-[14px] border-[var(--color-line2)] bg-white p-5">
      <div>
        <h2 className="font-display text-[24px] leading-none tracking-[1px] text-ink">{title}</h2>
        {description && <div className="mt-1 text-sm text-ink3">{description}</div>}
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
    <div className="rounded-[10px] border border-[var(--color-line2)] bg-[var(--color-bg)] px-4 py-4">
      <div className="text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{label}</div>
      <div className="mt-2 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function LightTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white">
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
      <Card className="rounded-[14px] border-[var(--color-line2)] bg-white p-8 text-center">
        <div className="text-sm text-ink3">Loading driver profile...</div>
      </Card>
    );
  }

  if (error || !driver) {
    return (
      <Card className="rounded-[14px] border-[var(--color-line2)] bg-white p-8 text-center">
        <div className="text-sm text-[var(--color-red)]">{error ?? "Driver profile data is not available yet."}</div>
      </Card>
    );
  }

  const teamHref = getTeamHrefByName(driver.teamLabel);

  return (
    <div className="space-y-6 lg:space-y-8">
      <section
        className="overflow-hidden rounded-[16px] border border-[var(--color-line2)] bg-white"
        style={{
          backgroundImage: `linear-gradient(135deg, ${driver.accent} 0%, ${driver.accentSoft} 42%, #ffffff 100%)`,
        }}
      >
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[6px] border border-[var(--color-line2)] bg-white/76 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[1px] text-ink2">
                Driver Profile
              </div>
              <div className="rounded-[6px] border border-[var(--color-line2)] bg-white/76 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[1px] text-ink2">
                {driver.teamLabel}
              </div>
              <div className="rounded-[6px] border border-[var(--color-line2)] bg-white/76 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[1px] text-ink2">
                {driver.eraLabel}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-4xl sm:text-5xl">{driver.flag}</div>
                <h1 className="font-display text-[52px] leading-[0.9] tracking-[1px] text-ink sm:text-[64px]">
                  {driver.name}
                </h1>
                {driver.number !== "--" ? (
                  <div className="rounded-[6px] border border-[var(--color-line2)] bg-white/76 px-3 py-1.5 text-sm font-semibold text-ink">
                    #{driver.number}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink2">
                <span>{driver.nationality}</span>
                <span>{driver.teamLabel}</span>
                <span>{driver.eraLabel}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-[var(--color-line2)] bg-white/88 p-5 backdrop-blur-sm">
            <div className="text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Profile Baseline</div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-ink3">Current team</div>
                <div className="mt-1 font-display text-[22px] leading-none tracking-[0.5px] text-ink">
                  {teamHref ? <Link href={teamHref} className="hover:underline">{driver.teamLabel}</Link> : driver.teamLabel}
                </div>
              </div>
              <div>
                <div className="text-sm text-ink3">Nationality</div>
                <div className="mt-1 font-display text-[22px] leading-none tracking-[0.5px] text-ink">{driver.nationality}</div>
              </div>
              <div>
                <div className="text-sm text-ink3">Era label</div>
                <div className="mt-1 font-display text-[22px] leading-none tracking-[0.5px] text-ink">{driver.eraLabel}</div>
              </div>
              <div className="grid gap-2 pt-2">
                {teamHref ? (
                  <Link href={teamHref} className="text-sm font-medium text-ink2 hover:text-[var(--color-red)]">
                    Open team profile
                  </Link>
                ) : null}
                <Link href="/standings" className="text-sm font-medium text-ink2 hover:text-[var(--color-red)]">
                  View championship standings
                </Link>
                <Link href="/head-to-head" className="text-sm font-medium text-ink2 hover:text-[var(--color-red)]">
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
                  <div key={item.label} className="rounded-[10px] border border-[var(--color-line2)] bg-[var(--color-bg)] px-4 py-4">
                    <div className="text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{item.label}</div>
                    <div className="mt-2 text-sm font-medium text-ink">{item.value}</div>
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
                  <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Season</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Position</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Points</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Starts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.seasons.map((season) => (
                    <TableRow key={season.season} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                      <TableCell className="px-5 py-4 text-sm font-medium text-ink">{season.season}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.team}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.position}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.wins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.poles}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.points}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{season.starts}</TableCell>
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
                  <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Starts</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Best Finish</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.grandPrixBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                      <TableCell className="px-5 py-4 text-sm font-medium text-ink">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.starts}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.wins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.bestFinish}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.points}</TableCell>
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
                  <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Poles</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Front Rows</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Q3s</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Best Grid</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Average Grid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.qualifyingBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                      <TableCell className="px-5 py-4 text-sm font-medium text-ink">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.poles}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.frontRows}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.q3s}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.bestGrid}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.averageGrid}</TableCell>
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
                  <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Sprint Wins</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Podiums</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Points</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Best Finish</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.sprintBreakdown.map((row) => (
                    <TableRow key={row.grandPrix} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                      <TableCell className="px-5 py-4 text-sm font-medium text-ink">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.sprintWins}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.podiums}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.points}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.bestFinish}</TableCell>
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
              <Card key={record.label} className="gap-0 rounded-[14px] border-[var(--color-line2)] bg-white p-5">
                <div className="text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">{record.label}</div>
                <div className="mt-4 font-display text-[32px] leading-none tracking-[0.5px]" style={{ color: driver.accent }}>
                  {record.value}
                </div>
                <div className="mt-3 text-sm text-ink3">{record.detail}</div>
              </Card>
            ))}
          </section>

          <SectionCard title="Championship Chronology" description="Title trajectory and peak campaign context.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--color-line)] hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Season</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Result</TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-medium uppercase tracking-[1.2px] text-ink3">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driver.championshipChronology.map((row) => (
                    <TableRow key={`${row.season}-${row.result}`} className="border-[var(--color-line)] hover:bg-[var(--color-bg)]">
                      <TableCell className="px-5 py-4 text-sm font-medium text-ink">{row.season}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.result}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-ink2">{row.detail}</TableCell>
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
