import { Users } from "lucide-react";

import type {
  ComparisonMode,
  ComparisonScope,
  ComparisonTab,
  ComparisonType,
  DnfMode,
  DriverMeetingResult,
  DriverProfile,
} from "@/lib/head-to-head-data";
import { comparisonTabs } from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, getPanelTitle } from "@/utils/h2h";

type ApiMeeting = {
  season: string;
  round: string;
  grandPrix: string;
  type: ComparisonType;
  notes: string;
  resultA: DriverMeetingResult;
  resultB: DriverMeetingResult;
};

type BySeasonRow = {
  season: string;
  raceH2H: string;
  qualiH2H: string;
  points: string;
  wins: string;
  podiums: string;
};

function getWinner(meeting: ApiMeeting): "A" | "B" | "Tie" {
  if (meeting.resultA.position < meeting.resultB.position) {
    return "A";
  }

  if (meeting.resultB.position < meeting.resultA.position) {
    return "B";
  }

  return "Tie";
}

function EmptyComparisonState({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[16px] border border-[var(--color-line2)] bg-[var(--color-bg2)]">
        <Users className="h-7 w-7 text-ink3" />
      </div>
      <p className="font-display text-[22px] tracking-[0.5px] text-ink2">No comparison data</p>
      <p className="max-w-[320px] text-[13px] leading-relaxed text-ink3">
        {label ?? "Select two drivers above and click Compare to see their head-to-head record across meetings."}
      </p>
    </div>
  );
}

function MeetingsTable({
  meetings,
  driverA,
  driverB,
}: {
  meetings: ApiMeeting[];
  driverA: DriverProfile;
  driverB: DriverProfile;
}) {
  const driverAInitials = getInitials(driverA.name);
  const driverBInitials = getInitials(driverB.name);

  if (meetings.length === 0) {
    return <EmptyComparisonState label="No event comparisons match the current filter set." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line2)] bg-[var(--color-bg)]">
            <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">Round</th>
            <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">Grand Prix</th>
            <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[1px]" style={{ color: "var(--h2h-a)" }}>
              {driverAInitials}
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[1px] text-ink3">Result</th>
            <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[1px]" style={{ color: "var(--h2h-b)" }}>
              {driverBInitials}
            </th>
            <th className="px-4 py-3 text-center text-[10px] font-medium uppercase tracking-[1px] text-ink3">Winner</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => {
            const winner = getWinner(meeting);
            const winnerColor = winner === "A" ? "var(--h2h-a)" : winner === "B" ? "var(--h2h-b)" : "var(--color-ink3)";
            const winnerLabel = winner === "A" ? driverAInitials : winner === "B" ? driverBInitials : "Tie";

            return (
              <tr
                key={`${meeting.season}-${meeting.round}-${meeting.grandPrix}-${meeting.type}`}
                className={cn(
                  "cursor-pointer border-b border-[var(--color-line)] transition-colors hover:bg-[var(--color-bg)]",
                  winner === "A" && "bg-[rgba(30,91,191,0.025)]",
                  winner === "B" && "bg-[rgba(200,32,26,0.025)]",
                )}
              >
                <td className="px-6 py-4 text-[13px] text-ink2">{String(meeting.round).padStart(2, "0")}</td>
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-ink">{meeting.grandPrix}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.8px] text-ink3">{meeting.season} / {meeting.type}</div>
                </td>
                <td className="px-4 py-4 text-center font-display text-[18px] tracking-[0.5px]" style={{ color: "var(--h2h-a)" }}>
                  {meeting.resultA.label}
                </td>
                <td className="px-4 py-4 text-center text-[11px] text-ink3">{meeting.notes || `${meeting.resultA.points} vs ${meeting.resultB.points} pts`}</td>
                <td className="px-4 py-4 text-center font-display text-[18px] tracking-[0.5px]" style={{ color: "var(--h2h-b)" }}>
                  {meeting.resultB.label}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: winnerColor }} />
                    <span className="text-[12px] font-medium" style={{ color: winnerColor }}>
                      {winnerLabel}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BySeasonTable({ rows }: { rows: BySeasonRow[] }) {
  if (rows.length === 0) {
    return <EmptyComparisonState label="No season aggregates match the current filter set." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-line2)] bg-[var(--color-bg)]">
            {["Season", "Race H2H", "Quali H2H", "Points", "Wins", "Podiums"].map((head) => (
              <th key={head} className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[1px] text-ink3">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.season} className="border-b border-[var(--color-line)] transition-colors hover:bg-[var(--color-bg)]">
              <td className="px-6 py-4 text-[14px] font-medium text-ink">{row.season}</td>
              <td className="px-6 py-4 text-[13px] text-ink2">{row.raceH2H}</td>
              <td className="px-6 py-4 text-[13px] text-ink2">{row.qualiH2H}</td>
              <td className="px-6 py-4 text-[13px] text-ink2">{row.points}</td>
              <td className="px-6 py-4 text-[13px] text-ink2">{row.wins}</td>
              <td className="px-6 py-4 text-[13px] text-ink2">{row.podiums}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnalysisPanel({
  tab,
  onTabChange,
  meetings,
  bySeason,
  driverA,
  driverB,
  scope,
  type,
  mode,
  dnfMode,
}: {
  tab: ComparisonTab;
  onTabChange: (tab: ComparisonTab) => void;
  meetings: ApiMeeting[];
  bySeason: BySeasonRow[];
  driverA: DriverProfile;
  driverB: DriverProfile;
  scope: ComparisonScope;
  type: ComparisonType;
  mode: ComparisonMode;
  dnfMode: DnfMode;
}) {
  const [panelTitle, panelSubtitle] = getPanelTitle(tab, type, scope, mode);

  return (
    <section className="animate-fade-up animate-fade-up-4">
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as ComparisonTab)}>
        <TabsList className="mb-5 flex h-auto w-fit flex-wrap rounded-[10px] border border-[var(--color-line2)] bg-white p-1">
          {comparisonTabs.map((item) => (
            <TabsTrigger
              key={item}
              value={item}
              className="rounded-[7px] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.8px] text-ink3 transition-all hover:text-ink2 data-[state=active]:bg-ink data-[state=active]:text-white"
            >
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-[14px] border border-[var(--color-line2)] bg-white">
        <div className="flex flex-col gap-4 border-b border-[var(--color-line2)] px-7 py-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-[24px] tracking-[0.5px] text-ink">{panelTitle}</p>
            <p className="mt-1 text-[12px] text-ink3">{panelSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[scope, type, mode, dnfMode].map((chip) => (
              <span
                key={chip}
                className="rounded-[20px] border border-[var(--color-line2)] bg-[var(--color-bg2)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.5px] text-ink3"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {tab === "By Season" ? (
          <BySeasonTable rows={bySeason} />
        ) : (
          <MeetingsTable meetings={meetings} driverA={driverA} driverB={driverB} />
        )}
      </div>
    </section>
  );
}
