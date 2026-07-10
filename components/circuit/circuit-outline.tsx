"use client";

import Image from "next/image";

import { resolveCircuitOutline } from "@/lib/circuit-outlines";
import { cn } from "@/lib/utils";

type CircuitOutlineProps = {
  circuitId?: string | null;
  circuitName: string;
  alt: string;
  theme?: "dark" | "light";
  className?: string;
};

export function CircuitOutline({
  circuitId,
  circuitName,
  alt,
  theme,
  className,
}: CircuitOutlineProps) {
  const outline = resolveCircuitOutline({ circuitId, circuitName });

  if (!outline) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[CircuitOutline] Falling back to placeholder outline.", {
        circuitId,
        circuitName,
      });
    }

    return (
      <div className={cn("relative", className)}>
        <Image src="/track-outline.svg" alt={alt} fill className="object-contain" />
      </div>
    );
  }

  const shellClassName =
    theme === "dark"
      ? "text-[#fff3eb] [--circuit-outline-glow:#ff7a4d] [--circuit-outline-base:rgba(255,255,255,0.16)] [--circuit-outline-glow-opacity:0.12]"
      : theme === "light"
        ? "text-slate-900 [--circuit-outline-glow:#ff8d69] [--circuit-outline-base:rgba(15,23,42,0.18)] [--circuit-outline-glow-opacity:0.1]"
        : "text-slate-900 [--circuit-outline-glow:#ff8d69] [--circuit-outline-base:rgba(15,23,42,0.18)] [--circuit-outline-glow-opacity:0.1] dark:text-[#fff3eb] dark:[--circuit-outline-glow:#ff7a4d] dark:[--circuit-outline-base:rgba(255,255,255,0.16)] dark:[--circuit-outline-glow-opacity:0.12]";

  return (
    <div className={cn("relative", shellClassName, className)}>
      <svg
        viewBox={outline.viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={alt}
        className="size-full overflow-visible"
      >
        <path
          d={outline.path}
          fill="none"
          stroke="var(--circuit-outline-glow)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="var(--circuit-outline-glow-opacity)"
        />
        <path
          d={outline.path}
          fill="none"
          stroke="var(--circuit-outline-base)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={outline.path}
          fill="none"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
