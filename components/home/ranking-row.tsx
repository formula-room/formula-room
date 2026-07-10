import Link from "next/link";

type HomeRankingRowProps = {
  position: string;
  name: string;
  sublabel: string;
  accentColor: string;
  index: number;
  points: string | number;
  pointsLabel?: string;
  href?: string | null;
};

export function HomeRankingRow({
  position,
  name,
  sublabel,
  accentColor,
  index,
  points,
  pointsLabel,
  href,
}: HomeRankingRowProps) {
  const accent = accentColor || "#ff6a3d";
  const isHaasEntry = /haas/i.test(`${name} ${sublabel}`);
  const intensity = index === 0 ? 0.18 : index === 1 ? 0.13 : 0.1;
  const glow = index === 0 ? 0.18 : index === 1 ? 0.12 : 0.08;
  const rowTint = Math.min(intensity + (isHaasEntry ? 0.015 : 0), 0.22);
  const pointsTint = index === 0 ? "1f" : "14";
  const pointsTintOpacity = isHaasEntry
    ? `${Math.min(parseInt(pointsTint, 16) + 3, 255).toString(16).padStart(2, "0")}`
    : pointsTint;

  const content = (
    <>
      <div
        className="flex size-14 shrink-0 items-center justify-center rounded-[1.2rem] text-sm font-semibold"
        style={{
          background: `linear-gradient(135deg, ${accent}${index === 0 ? "38" : index === 1 ? "2c" : "20"}, rgba(255,255,255,0.03))`,
          color: index === 0 ? "#ffffff" : "rgba(255,255,255,0.9)",
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${accent}18`,
        }}
      >
        {position}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-medium text-white">{name}</div>
        <div className="mt-1 text-sm text-white/48">{sublabel}</div>
      </div>

      <div
        className="flex min-w-[88px] shrink-0 self-stretch flex-col items-center justify-center gap-0.5 rounded-[1.15rem] border px-3 py-2 text-center"
        style={{
          borderColor: `${accent}26`,
          background: `linear-gradient(180deg, ${accent}${pointsTintOpacity}, rgba(255,255,255,0.02))`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
        }}
      >
        <div className="text-2xl leading-none font-semibold tracking-[-0.03em] text-white">
          {points}
        </div>
        {pointsLabel ? (
          <div className="text-[10px] leading-none uppercase tracking-[0.24em] text-white/38">
            {pointsLabel}
          </div>
        ) : null}
      </div>
    </>
  );

  const className =
    "flex items-center gap-4 rounded-[1.5rem] border px-4 py-4 transition-colors";
  const rowStyle = {
    borderColor: `${accent}${index === 0 ? "30" : "1a"}`,
    background: `linear-gradient(135deg, ${accent}${Math.round(rowTint * 255)
      .toString(16)
      .padStart(2, "0")}, rgba(255,255,255,0.025) 42%, rgba(255,255,255,0.02))`,
    boxShadow:
      index === 0
        ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 28px rgba(0,0,0,0.14), 0 0 18px ${accent}${Math.round(
            glow * 255,
          )
            .toString(16)
            .padStart(2, "0")}`
        : `inset 0 1px 0 rgba(255,255,255,0.04)`,
  } as const;

  return href ? (
    <Link href={href} className={className} style={rowStyle}>
      {content}
    </Link>
  ) : (
    <div className={className} style={rowStyle}>
      {content}
    </div>
  );
}
