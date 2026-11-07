import { Users } from "lucide-react";
import type { ReactNode } from "react";

import type {
  ComparisonTab,
  ComparisonType,
  DriverMeetingResult,
  DriverProfile,
} from "@/lib/head-to-head-data";
import { comparisonTabs } from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";
import {
  DashCard,
  premiumTabsListClass,
  premiumTabsTriggerClass,
} from "@/components/dashboard/page-primitives";
import { raceType } from "@/components/home/rank-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComparisonRow,
  DuelHeader,
  StatsOverview,
  formatPoints,
  type Side,
  type Summary,
} from "@/components/h2h/StatsOverview";
import { getPanelTitle } from "@/utils/h2h";

export type ApiMeeting = {
  season: string;
  round: string;
  grandPrix: string;
  type: ComparisonType;
  notes: string;
  resultA: DriverMeetingResult;
  resultB: DriverMeetingResult;
};

export type BySeasonRow = {
  season: string;
  raceH2H: string;
  qualiH2H: string;
  points: string;
  wins: string;
  podiums: string;
};

/** "P12" fits the large type; statuses such as "Power Unit" don't. */
function isPositionLabel(label: string) {
  return /^P\d+$/.test(label);
}

function getWinner(meeting: ApiMeeting): Side | null {
  if (meeting.resultA.position < meeting.resultB.position) return "A";
  if (meeting.resultB.position < meeting.resultA.position) return "B";
  return null;
}

/** A driver's team in the most recent meeting shown. Meetings run oldest to newest within each session type. */
function latestTeam(meetings: ApiMeeting[], side: Side) {
  const races = meetings.filter((meeting) => meeting.type === "Race");
  const meeting = races[races.length - 1] ?? meetings[meetings.length - 1];
  return side === "A" ? meeting?.resultA.team : meeting?.resultB.team;
}

/** Faint angled squares in opposite corners, echoing a chequered flag. */
function CornerChecks({ className }: { className: string }) {
  const square = "absolute h-9 w-12 -skew-x-[24deg] bg-[var(--color-bg)]";

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute hidden h-[72px] w-[160px] md:block", className)}>
      <span className={cn(square, "left-4 top-0")} />
      <span className={cn(square, "left-28 top-0")} />
      <span className={cn(square, "bottom-0 left-12")} />
    </div>
  );
}

export function ReadyToCompare() {
  return (
    <DashCard className="relative">
      <CornerChecks className="left-4 top-8" />
      <CornerChecks className="bottom-8 right-4 rotate-180" />
      <div className="relative flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-[var(--color-bg2)]">
          <Users aria-hidden="true" className="h-6 w-6 text-ink2" />
        </div>
        <h2 className={cn("mt-5 text-[30px] leading-[1.15] tracking-[0.3px] text-ink", raceType)}>Ready to Compare</h2>
        <p className="mt-2 max-w-[340px] text-sm leading-6 text-ink2">
          Select two drivers to explore their racing statistics and head-to-head results.
        </p>
      </div>
    </DashCard>
  );
}

export function PanelMessage({ title, children, tone }: { title: string; children?: ReactNode; tone?: "error" }) {
  return (
    <DashCard>
      <div role="status" className="flex flex-col items-center px-6 py-12 text-center">
        <p className={cn("text-[22px] leading-[1.2] tracking-[0.3px]", tone === "error" ? "text-[var(--color-red)]" : "text-ink", raceType)}>{title}</p>
        {children ? <p className="mt-2 max-w-[420px] text-sm leading-6 text-ink2">{children}</p> : null}
      </div>
    </DashCard>
  );
}

function ListMessage({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[10px] bg-[var(--color-bg)] px-6 py-10 text-center text-sm leading-6 text-ink2">{children}</p>
  );
}

function SideTick({ side, name }: { side: Side; name: string }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", side === "B" && "flex-row-reverse")}>
      <span aria-hidden="true" className="h-3 w-1 flex-shrink-0 -skew-x-12" style={{ backgroundColor: side === "A" ? "var(--h2h-a)" : "var(--h2h-b)" }} />
      <span className={cn("truncate pr-1 text-[14px] leading-[1.3] tracking-[0.3px] text-ink", raceType)}>{name}</span>
    </span>
  );
}

function MeetingList({
  meetings,
  driverA,
  driverB,
  emptyMessage,
}: {
  meetings: ApiMeeting[];
  driverA: DriverProfile;
  driverB: DriverProfile;
  emptyMessage: string;
}) {
  if (meetings.length === 0) {
    return <ListMessage>{emptyMessage}</ListMessage>;
  }

  return (
    <div className="px-1.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SideTick side="A" name={driverA.shortName} />
        <SideTick side="B" name={driverB.shortName} />
      </div>
      <ol className="space-y-2.5">
        {meetings.map((meeting) => {
          const winner = getWinner(meeting);

          return (
            <ComparisonRow
              key={`${meeting.season}-${meeting.round}-${meeting.grandPrix}-${meeting.type}`}
              className="min-h-[54px]"
              valueA={meeting.resultA.label}
              valueB={meeting.resultB.label}
              smallA={!isPositionLabel(meeting.resultA.label)}
              smallB={!isPositionLabel(meeting.resultB.label)}
              leader={winner}
              leaderName={winner === "A" ? driverA.name : winner === "B" ? driverB.name : "Tied"}
            >
              <span className="text-[12px] font-bold leading-[1.25] text-ink sm:text-[13px]">{meeting.grandPrix}</span>
              <span className="mt-0.5 text-[10px] font-medium leading-[1.3] text-ink2 sm:text-[11px]">
                {meeting.season} · Round {Number(meeting.round)} · {meeting.type}
                <span className="hidden sm:inline">{meeting.notes ? ` · ${meeting.notes}` : ""}</span>
              </span>
            </ComparisonRow>
          );
        })}
      </ol>
    </div>
  );
}

function SeasonCell({ value, isPoints }: { value: string; isPoints?: boolean }) {
  const [rawA = "0", rawB = "0"] = value.split("-");
  const a = Number(rawA);
  const b = Number(rawB);
  const show = (raw: string, number: number) => (isPoints ? formatPoints(number) : raw);

  return (
    <td className="whitespace-nowrap px-4 py-3 text-center text-[14px] tabular-nums">
      <span className={a > b ? "font-bold text-ink" : "text-ink2"}>{show(rawA, a)}</span>
      <span className="px-1 text-ink2">-</span>
      <span className={b > a ? "font-bold text-ink" : "text-ink2"}>{show(rawB, b)}</span>
    </td>
  );
}

function BySeasonTable({ rows, driverA, driverB }: { rows: BySeasonRow[]; driverA: DriverProfile; driverB: DriverProfile }) {
  if (rows.length === 0) {
    return <ListMessage>No season totals match the current filters.</ListMessage>;
  }

  return (
    <div className="px-1.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SideTick side="A" name={driverA.shortName} />
        <SideTick side="B" name={driverB.shortName} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">
            Season totals, written as {driverA.name} then {driverB.name}
          </caption>
          <thead>
            <tr className="border-b border-[var(--color-line2)]">
              {["Season", "Race H2H", "Quali H2H", "Points", "Wins", "Podiums"].map((head, index) => (
                <th
                  key={head}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 pb-2.5 text-[10px] font-semibold uppercase tracking-[0.8px] text-ink2",
                    index === 0 ? "pl-1 text-left" : "text-center",
                  )}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.season} className="border-b border-[var(--color-line)] last:border-b-0">
                <th scope="row" className={cn("py-3 pl-1 pr-4 text-left text-[18px] font-normal leading-none tracking-[0.3px] text-ink", raceType)}>
                  {row.season}
                </th>
                <SeasonCell value={row.raceH2H} />
                <SeasonCell value={row.qualiH2H} />
                <SeasonCell value={row.points} isPoints />
                <SeasonCell value={row.wins} />
                <SeasonCell value={row.podiums} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type ComparisonResult = {
  driverA: DriverProfile;
  driverB: DriverProfile;
  summary: Summary;
  /** Every meeting that matched the filters, whichever tab is open. */
  allMeetings: ApiMeeting[];
  /** The meetings for the open tab. */
  meetings: ApiMeeting[];
  bySeason: BySeasonRow[];
  type: ComparisonType;
  /** Session type is left out: it only applies to the Overview list. */
  appliedFilters: string[];
};

function ComparisonPanel({ tab, result }: { tab: ComparisonTab; result: ComparisonResult }) {
  const { driverA, driverB, summary, allMeetings, meetings, bySeason, type, appliedFilters } = result;
  const [title, subtitle] = getPanelTitle(tab, type);

  return (
    <DashCard>
      <div className="flex flex-col gap-1.5 border-b border-[var(--color-line)] px-5 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h2 className={cn("text-[24px] leading-[1.2] tracking-[0.3px] text-ink", raceType)}>{title}</h2>
          <p className="mt-0.5 text-[13px] leading-5 text-ink2">{subtitle}</p>
        </div>
        <p className="flex-shrink-0 text-[11px] font-medium uppercase tracking-[0.5px] text-ink2">{(tab === "Overview" ? [appliedFilters[0], type, ...appliedFilters.slice(1)] : appliedFilters).join(" · ")}</p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <DuelHeader driverA={driverA} driverB={driverB} teamA={latestTeam(allMeetings, "A")} teamB={latestTeam(allMeetings, "B")} />

        {tab === "Overview" ? <StatsOverview driverA={driverA} driverB={driverB} summary={summary} /> : null}

        {tab === "By Season" ? (
          <BySeasonTable rows={bySeason} driverA={driverA} driverB={driverB} />
        ) : (
          <div>
            {tab === "Overview" ? (
              <h3 className={cn("mb-3 px-1.5 text-[18px] leading-[1.2] tracking-[0.3px] text-ink", raceType)}>{type} meetings</h3>
            ) : null}
            <MeetingList
              meetings={meetings}
              driverA={driverA}
              driverB={driverB}
              emptyMessage={`No ${tab === "Overview" ? type.toLowerCase() : tab.toLowerCase()} meetings match the current filters.`}
            />
          </div>
        )}
      </div>
    </DashCard>
  );
}

export function AnalysisPanel({
  tab,
  onTabChange,
  result,
  notice,
}: {
  tab: ComparisonTab;
  onTabChange: (tab: ComparisonTab) => void;
  result: ComparisonResult | null;
  /** Shown instead of the results before a comparison has run, or when it can't show anything. */
  notice: ReactNode;
}) {
  return (
    <Tabs value={tab} onValueChange={(value) => onTabChange(value as ComparisonTab)} className="gap-5">
      <TabsList className={cn(premiumTabsListClass, "group-data-[orientation=horizontal]/tabs:h-auto")}>
        {comparisonTabs.map((item) => (
          <TabsTrigger
            key={item}
            value={item}
            disabled={!result}
            className={cn(
              premiumTabsTriggerClass,
              "h-auto flex-none px-2 text-[10px] tracking-[0.4px] text-ink after:hidden hover:text-[var(--color-red)] data-[state=active]:disabled:opacity-100 sm:px-6 sm:text-[11px] sm:tracking-[0.8px]",
              "dark:text-ink dark:hover:text-[var(--color-red)]",
              "data-[state=active]:hover:text-white dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-ink dark:data-[state=active]:text-[var(--color-bg)] dark:data-[state=active]:hover:text-[var(--color-bg)]",
            )}
          >
            {item}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={tab}>
        {result ? <ComparisonPanel tab={tab} result={result} /> : notice}
      </TabsContent>
    </Tabs>
  );
}
