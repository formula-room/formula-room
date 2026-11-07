import type { CSSProperties } from "react";
import {
  AlertTriangle,
  Award,
  Clock,
  Flag,
  MapPin,
  Medal,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

/* Lucide has no chequered flag. Squares fall on the 24-unit grid so they stay crisp at small sizes. */
function ChequeredFlag({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <path d="M4 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="3" width="17" height="13" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 3h4v4H4zM12 3h4v4h-4zM8 7h4v4H8zM16 7h5v4h-5zM4 11h4v5H4zM12 11h4v5h-4z" fill="currentColor" />
    </svg>
  );
}

const iconMap = {
  championships: Trophy,
  wins: ChequeredFlag,
  podiums: Medal,
  poles: Zap,
  points: TrendingUp,
  laps: Clock,
  dnf: AlertTriangle,
  sprint: Timer,
  special: Award,
  gp: Flag,
  circuits: MapPin,
  h2h: Users,
};

export function CategoryIcon({
  categoryId,
  className,
  style,
}: {
  categoryId: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = iconMap[categoryId as keyof typeof iconMap] ?? Trophy;
  return <Icon className={className} style={style} />;
}
