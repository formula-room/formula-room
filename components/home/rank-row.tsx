import { Anton } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

import { CountryFlag } from "@/components/shared/country-flag";
import { TeamLogo } from "@/components/home/team-logo";
import { cn } from "@/lib/utils";

const anton = Anton({ subsets: ["latin"], weight: "400" });

/** Bold, condensed, slanted type shared by the race cards. */
export const raceType = `${anton.className} italic! uppercase`;

const STRIP_CLASS = "race-strip relative flex min-w-0 flex-1 -skew-x-12 items-stretch overflow-hidden rounded-[3px]";

function PositionBadge({ pos, className }: { pos: number | string; className: string }) {
  return (
    <div className={cn("flex w-10 flex-shrink-0 -skew-x-12 items-center justify-center rounded-[4px] max-[359px]:w-8 sm:w-11", className)}>
      <span className={cn("skew-x-12 leading-none", typeof pos === "string" ? "text-[13px] tracking-[0.3px]" : "text-[20px]", raceType)}>{pos}</span>
    </div>
  );
}

function splitDriverName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { given: parts.slice(0, -1).join(" "), family: parts[parts.length - 1] ?? "" };
}

function StackedName({ name }: { name: string }) {
  const { given, family } = splitDriverName(name);

  return (
    <>
      {given ? (
        <span className={cn("block truncate text-[11px] leading-[1.35] tracking-[0.3px] text-ink2", raceType)}>{given} </span>
      ) : null}
      <span className={cn("block truncate text-[18px] leading-[1.3] tracking-[0.3px] sm:text-[20px]", raceType)}>{family}</span>
    </>
  );
}

type PodiumRowProps = {
  pos: number;
  name: string;
  team: string;
  points: string;
  accentColor: string;
};

/** Last Race row: medal badge, angled strip, stacked driver name, team logo, points. */
export function PodiumRow({ pos, name, team, points, accentColor }: PodiumRowProps) {
  return (
    <li className="flex items-stretch gap-2 max-[359px]:gap-1.5 sm:gap-2.5">
      <PositionBadge pos={pos} className={cn("my-1", `race-medal-${pos}`)} />

      <div className={cn(STRIP_CLASS, "h-[52px]")}>
        <div className="flex min-w-0 flex-1 skew-x-12 items-center gap-2 pl-3.5 pr-2 max-[359px]:gap-1.5 max-[359px]:pl-2.5 max-[359px]:pr-1 sm:gap-3 sm:pl-5 sm:pr-3">
          <span className="min-w-0 flex-1 text-ink">
            <StackedName name={name} />
          </span>
          <TeamLogo team={team} />
        </div>

        <div className="race-strip-tint flex w-[66px] flex-shrink-0 items-center justify-center max-[359px]:w-[54px] sm:w-[84px]">
          <span className={cn("skew-x-12 whitespace-nowrap text-[17px] leading-none max-[359px]:text-[15px] tracking-[0.4px] text-ink sm:text-[20px]", raceType)}>
            {points}
          </span>
        </div>

        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
      </div>
    </li>
  );
}

type ResultRowProps = {
  /** A number for a classified finish, or a short code such as "RET". */
  position: number | string;
  badgeClassName: string;
  /** Full meaning of a status code, for tooltips and screen readers. */
  statusLabel?: string;
  name: string;
  team: string;
  value: string;
  /** Small caption under the value, such as "Pts". Lap times don't need one. */
  valueCaption?: string;
  /** Leave undefined to drop the column; null shows a placeholder for a driver with no count. */
  laps?: string | null;
  accentColor: string;
  href?: string | null;
  teamHref?: string | null;
  isClassified: boolean;
};

/** Full results row: the Last Race row plus laps, links and non-finisher states. */
export function ResultRow({
  position,
  badgeClassName,
  statusLabel,
  name,
  team,
  value,
  valueCaption,
  laps,
  accentColor,
  href,
  teamHref,
  isClassified,
}: ResultRowProps) {
  return (
    <li className="flex items-stretch gap-2 max-[359px]:gap-1.5 sm:gap-2.5" title={statusLabel}>
      <PositionBadge pos={position} className={cn("my-1", badgeClassName)} />
      {statusLabel ? <span className="sr-only">{statusLabel}</span> : null}

      <div className={cn(STRIP_CLASS, "h-[48px]", !isClassified && "opacity-70")}>
        <div className="flex min-w-0 flex-1 skew-x-12 items-center gap-2 pl-3.5 pr-2 max-[359px]:gap-1.5 max-[359px]:pl-2.5 max-[359px]:pr-1 sm:gap-3 sm:pl-5 sm:pr-3">
          {href ? (
            <Link href={href} className="min-w-0 flex-1 text-ink transition-colors hover:text-[var(--color-red)]">
              <StackedName name={name} />
            </Link>
          ) : (
            <span className="min-w-0 flex-1 text-ink">
              <StackedName name={name} />
            </span>
          )}
          {laps !== undefined ? (
            <span className="w-7 flex-shrink-0 text-center sm:w-8">
              <span className={cn("block text-[14px] leading-[1.2] text-ink sm:text-[15px]", raceType)}>{laps ?? "--"}</span>
              <span className="block text-[8px] font-bold uppercase leading-[1.3] tracking-[0.4px] text-ink3">Laps</span>
            </span>
          ) : null}
          {teamHref ? (
            <Link href={teamHref} className="flex-shrink-0 transition-opacity hover:opacity-70">
              <TeamLogo team={team} />
            </Link>
          ) : (
            <TeamLogo team={team} />
          )}
        </div>

        <div
          className={cn(
            "race-strip-tint flex flex-shrink-0 items-center justify-center",
            valueCaption ? "w-[50px] max-[359px]:w-[42px] sm:w-[62px]" : "w-[76px] max-[359px]:w-[64px] sm:w-[84px]",
          )}
        >
          <span className="skew-x-12 text-center text-ink">
            <span
              className={cn(
                "block whitespace-nowrap leading-[1.1] tracking-[0.4px]",
                valueCaption ? "text-[17px] sm:text-[20px]" : "text-[14px] max-[359px]:text-[13px] sm:text-[16px]",
                raceType,
              )}
            >
              {value}
            </span>
            {valueCaption ? (
              <span className="block text-[8px] font-bold uppercase leading-[1.3] tracking-[0.4px] text-ink2">{valueCaption}</span>
            ) : null}
          </span>
        </div>

        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
      </div>
    </li>
  );
}

type StandingsRowProps = {
  pos: number;
  name: string;
  team: string;
  points: string | number;
  accentColor: string;
  href?: string | null;
  /** Reserves the flag column on driver rows, so the name doesn't jump when flags load. */
  showFlag?: boolean;
  flagCountry?: string;
  /** Extra details under the row, lined up with the strip. */
  meta?: ReactNode;
};

/** Championship row: black angled position, flag, name, team logo, black points box. */
export function StandingsRow({ pos, name, team, points, accentColor, href, showFlag, flagCountry, meta }: StandingsRowProps) {
  const content = (
    <>
      <PositionBadge pos={pos} className="race-black my-1" />

      <div className={cn(STRIP_CLASS, "h-[48px] transition-transform group-hover:translate-x-0.5")}>
        <div className="flex min-w-0 flex-1 skew-x-12 items-center gap-2 pl-3 pr-2 max-[359px]:gap-1.5 max-[359px]:pl-2.5 max-[359px]:pr-1 sm:gap-3 sm:pl-5 sm:pr-4">
          {showFlag ? (
            <span className="flex h-[18px] w-[27px] flex-shrink-0 max-[359px]:h-[14px] max-[359px]:w-[21px]">
              {flagCountry ? (
                <CountryFlag country={flagCountry} className="h-full w-full rounded-[2px] border-black/10 shadow-none" />
              ) : null}
            </span>
          ) : null}
          <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-bold leading-[1.15] max-[359px]:text-[12px] tracking-[-0.01em] text-ink sm:text-[15px]">
            {name}
          </span>
          <TeamLogo team={team} />
        </div>

        <div className="race-black flex w-[52px] flex-shrink-0 items-center justify-center max-[359px]:w-[44px] sm:w-[68px]">
          <span className={cn("skew-x-12 text-[20px] leading-none tracking-[0.4px] max-[359px]:text-[17px] sm:text-[22px]", raceType)}>{points}</span>
        </div>

        <div className="w-2 flex-shrink-0" style={{ backgroundColor: accentColor }} />
      </div>
    </>
  );

  const rowClass = "group flex items-stretch gap-2 max-[359px]:gap-1.5 sm:gap-2.5";

  return (
    <li>
      {href ? (
        <Link
          href={href}
          className={cn(rowClass, "rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)]")}
        >
          {content}
        </Link>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
      {meta ? <div className="mt-1.5 pl-12 max-[359px]:pl-[38px] sm:pl-[54px]">{meta}</div> : null}
    </li>
  );
}
