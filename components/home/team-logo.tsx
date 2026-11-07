import Image from "next/image";

import { cn } from "@/lib/utils";

type LogoEntry = {
  matches: (key: string) => boolean;
  file: string;
  /** Has a white version for marks that would disappear on the dark theme. */
  hasWhite?: boolean;
};

// Order matters: Racing Bulls has to be tested before Red Bull.
const TEAM_LOGOS: LogoEntry[] = [
  { matches: (key) => key === "rb" || key === "rbfteam" || key.includes("racingbulls") || key.includes("visacashapp"), file: "racing-bulls", hasWhite: true },
  { matches: (key) => key.includes("redbull"), file: "red-bull" },
  { matches: (key) => key.includes("mercedes"), file: "mercedes", hasWhite: true },
  { matches: (key) => key.includes("ferrari"), file: "ferrari" },
  { matches: (key) => key.includes("mclaren"), file: "mclaren" },
  { matches: (key) => key.includes("astonmartin"), file: "aston-martin", hasWhite: true },
  { matches: (key) => key.includes("alpine"), file: "alpine" },
  { matches: (key) => key.includes("williams"), file: "williams", hasWhite: true },
  { matches: (key) => key.includes("haas"), file: "haas" },
  { matches: (key) => key.includes("audi"), file: "audi", hasWhite: true },
  { matches: (key) => key.includes("cadillac"), file: "cadillac", hasWhite: true },
];

const BOX_CLASS = "h-7 w-8 flex-shrink-0 max-[359px]:w-6 sm:w-10";

export function TeamLogo({ team }: { team: string }) {
  // A driver with two teams in a season arrives as "RB / Red Bull Racing": one logo fits, so use the first.
  const key = (team.split(" / ")[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const logo = key ? TEAM_LOGOS.find((entry) => entry.matches(key)) : undefined;

  if (!logo) {
    return (
      <span
        className={cn(BOX_CLASS, "flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.5px] text-ink2")}
        title={team}
      >
        {team.slice(0, 3)}
      </span>
    );
  }

  const image = (file: string, className?: string) => (
    <span className={cn(BOX_CLASS, "relative block", className)}>
      <Image src={`/team-logos/${file}.webp`} alt={team} fill sizes="40px" unoptimized className="object-contain" />
    </span>
  );

  return logo.hasWhite ? (
    <>
      {image(logo.file, "dark:hidden")}
      {image(`${logo.file}-white`, "hidden dark:block")}
    </>
  ) : (
    image(logo.file)
  );
}
