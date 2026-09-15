import Link from "next/link";

import { getReadableTextColor } from "@/lib/f1/presentation";

const PILL_DARK = "#1d1d1d";

type StatPillProps = {
  pos: number;
  name: string;
  value: string | number;
  accentColor: string;
  href?: string | null;
};

export function StatPill({ pos, name, value, accentColor, href }: StatPillProps) {
  const nameTextColor = getReadableTextColor(accentColor);

  const content = (
    <div className="flex h-11 items-stretch">
      <div
        className="flex w-9 flex-shrink-0 items-center justify-center font-display text-[15px]"
        style={{ backgroundColor: PILL_DARK, color: "#ffffff" }}
      >
        {pos}
      </div>
      <div className="flex flex-1 items-stretch overflow-hidden">
        <div
          className="flex min-w-0 flex-1 items-center px-4"
          style={{ backgroundColor: accentColor }}
        >
          <span
            className="truncate font-display text-[16px] tracking-[0.5px]"
            style={{ color: nameTextColor }}
          >
            {name}
          </span>
        </div>
        <div
          className="flex min-w-12 flex-shrink-0 items-center justify-center pl-3"
          style={{ backgroundColor: PILL_DARK }}
        >
          <span className="font-display text-[17px]" style={{ color: "#ffffff" }}>
            {value}
          </span>
        </div>
        <svg
          className="block h-full w-4 flex-shrink-0"
          viewBox="0 0 16 44"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,0 L10,0 Q16,0 16,9 L11,33 Q9,44 0,44 Z" fill={PILL_DARK} />
        </svg>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
