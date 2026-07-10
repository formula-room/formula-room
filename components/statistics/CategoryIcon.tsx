import type { CSSProperties } from "react";
import {
  AlertTriangle,
  Award,
  Clock,
  Flag,
  MapPin,
  Medal,
  Star,
  Timer,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const iconMap = {
  championships: Trophy,
  wins: Star,
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
