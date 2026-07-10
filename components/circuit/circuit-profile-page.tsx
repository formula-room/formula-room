"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { fetchInternalApi } from "@/lib/client/internal-api";
import { type CircuitProfileRecord } from "@/lib/circuit-profile-data";
import { getEventHrefByGrandPrix } from "@/lib/route-helpers";
import { CircuitOutline } from "@/components/circuit/circuit-outline";
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
}: {
  label: string;
  value: string;
}) {
  return (
    <Card className="gap-0 rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{label}</div>
      <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</div>
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

export function CircuitProfilePageView({
  slug,
}: {
  slug: string;
}) {
  const [circuit, setCircuit] = useState<CircuitProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCircuit() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInternalApi<CircuitProfileRecord>(`/api/circuits/by-slug/${slug}`);
        if (!cancelled) {
          setCircuit(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setCircuit(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load circuit profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCircuit();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-slate-500">Loading circuit profile...</div>
      </Card>
    );
  }

  if (error || !circuit) {
    return (
      <Card className="rounded-[1.8rem] border-slate-200 bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="text-sm text-[#d14f3b]">{error ?? "Circuit profile data is not available yet."}</div>
      </Card>
    );
  }

  const eventHref = getEventHrefByGrandPrix(circuit.activeGrandPrix);

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-[0_26px_80px_rgba(15,23,42,0.12)] lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
          <div className="flex items-center justify-center rounded-[1.8rem] border border-slate-200 bg-slate-50 p-8">
            <CircuitOutline
              circuitId={circuit.circuitId}
              circuitName={circuit.name}
              alt={`${circuit.name} circuit outline`}
              theme="light"
              className="h-[240px] w-full max-w-[320px]"
            />
          </div>

          <div className="text-left">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-600 inline-block">
              Circuit Profile
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
              {circuit.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
              <span>{circuit.location}</span>
              <span>{circuit.activeGrandPrix}</span>
              <span>Since {circuit.sinceYear}</span>
            </div>
            <div className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
              {circuit.supportingInfo}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {eventHref ? (
                <Link href={eventHref} className="text-sm font-medium text-slate-700 hover:text-slate-950">
                  Open active weekend schedule
                </Link>
              ) : null}
              <Link href="/grand-prix" className="text-sm font-medium text-slate-700 hover:text-slate-950">
                Open Grand Prix statistics
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="Overview" className="space-y-5">
        <TabsList className={premiumSegmentedListClass}>
          {["Overview", "Records", "Race History", "Winners", "Pole Sitters", "Fastest Laps"].map((tab) => (
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
            {circuit.overviewStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            {circuit.secondaryStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard title="Circuit Facts" description="Track identity, setup priorities, and key race characteristics.">
              <div className="grid gap-4 md:grid-cols-2">
                {circuit.facts.map((fact) => (
                  <SummaryFact key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Latest Event Summary" description="Most recent Grand Prix at this venue, without photo-based presentation.">
              <div className="grid gap-4 md:grid-cols-2">
                {circuit.latestEventSummary.map((item) => (
                  <SummaryFact key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="Records">
          <SectionCard title="Records" description="Core benchmark holders for the circuit and active Grand Prix.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Record</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Holder</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circuit.records.map((row) => (
                    <TableRow key={`${row.record}-${row.holder}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.record}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.holder}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Race History">
          <SectionCard title="Race History" description="Year-by-year results for the active Grand Prix at this venue.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Year</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Grand Prix</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Winner</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Pole Sitter</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Fastest Lap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circuit.raceHistory.map((row) => (
                    <TableRow key={`${row.year}-${row.grandPrix}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.year}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.grandPrix}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.winner}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.team}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.poleSitter}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.fastestLap}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Winners">
          <SectionCard title="Winners" description="Recent winners and the context behind each victory.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Year</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Winner</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circuit.winners.map((row) => (
                    <TableRow key={`${row.year}-${row.entry}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.year}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.entry}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.teamOrContext}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Pole Sitters">
          <SectionCard title="Pole Sitters" description="Recent one-lap benchmarks at this circuit.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Year</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Pole Sitter</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circuit.poleSitters.map((row) => (
                    <TableRow key={`${row.year}-${row.entry}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.year}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.entry}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.teamOrContext}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LightTableShell>
          </SectionCard>
        </TabsContent>

        <TabsContent value="Fastest Laps">
          <SectionCard title="Fastest Laps" description="Recent race fastest laps and the strategic context behind them.">
            <LightTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Year</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Driver</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Team</TableHead>
                    <TableHead className="px-5 py-4 text-[11px] uppercase tracking-[0.28em] text-slate-500">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {circuit.fastestLaps.map((row) => (
                    <TableRow key={`${row.year}-${row.entry}`} className="border-slate-200 hover:bg-slate-50/70">
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-900">{row.year}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.entry}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.teamOrContext}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-slate-700">{row.note}</TableCell>
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
