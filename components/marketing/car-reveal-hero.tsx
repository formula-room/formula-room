"use client";

import Image from "next/image";
import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";

import { AeroFlowOverlay } from "./aero-flow-overlay";
import styles from "./car-reveal-hero.module.css";

const DEFAULT_BASE_SRC = "/images/f1-car-exterior.webp";
const DEFAULT_AERO_SRC = "/images/f1-car-aero.webp";

type CarRevealHeroProps = {
  className?: string;
  baseSrc?: string;
  aeroSrc?: string;
  eyebrow?: string;
  heading?: React.ReactNode;
  description?: string;
};

function ImageMissingFallback({ path }: { path: string }) {
  return (
    <div className={styles.fallback}>
      <p className="max-w-[220px] text-[11px] leading-relaxed text-[rgba(248,250,252,0.4)]">
        Add the matched car render at
        <br />
        <span className="font-mono text-[rgba(248,250,252,0.6)]">{path}</span>
      </p>
    </div>
  );
}

export function CarRevealHero({
  className,
  baseSrc = DEFAULT_BASE_SRC,
  aeroSrc = DEFAULT_AERO_SRC,
  eyebrow = "FR-01 · Concept",
  heading = (
    <>
      Engineered
      <br />
      for the <span className="text-[#C8201A]">limit</span>.
    </>
  ),
  description = "Hover over the car to reveal a live aerodynamic airflow visualization sweeping across the bodywork.",
}: CarRevealHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [revealAll, setRevealAll] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const [baseMissing, setBaseMissing] = useState(false);
  const [aeroMissing, setAeroMissing] = useState(false);
  const revealDisabled = baseMissing || aeroMissing;

  const updateSpot = useCallback((clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    stage.style.setProperty("--mx", `${Math.min(100, Math.max(0, x))}%`);
    stage.style.setProperty("--my", `${Math.min(100, Math.max(0, y))}%`);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      updateSpot(event.clientX, event.clientY);
      if (!interacted) setInteracted(true);
    },
    [interacted, updateSpot],
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[16px] border border-[rgba(248,250,252,0.1)] bg-[#090B10]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_20%,rgba(200,32,26,0.08)_0%,transparent_45%)]",
        className,
      )}
    >
      <div className="relative z-10 grid gap-10 px-7 py-14 sm:px-10 lg:grid-cols-[400px_1fr] lg:items-center lg:px-14 lg:py-20">
        <div>
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(200,32,26,0.34)] bg-[rgba(200,32,26,0.13)] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8201A]" />
            <span className="text-[11px] font-medium uppercase tracking-[1px] text-[#C8201A]">{eyebrow}</span>
          </div>
          <h1 className="font-display text-[52px] leading-[0.9] tracking-[1px] text-[#F8FAFC] sm:text-[68px]">{heading}</h1>
          <p className="mt-5 max-w-[380px] text-[14px] leading-relaxed text-[rgba(248,250,252,0.62)]">{description}</p>
          <button
            type="button"
            onClick={() => setRevealAll((prev) => !prev)}
            disabled={revealDisabled}
            aria-pressed={revealAll}
            className="mt-9 inline-flex items-center gap-2 rounded-[6px] border border-[rgba(248,250,252,0.15)] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.6px] text-[rgba(248,250,252,0.78)] transition-colors hover:border-[#C8201A] hover:text-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[rgba(248,250,252,0.15)] disabled:hover:text-[rgba(248,250,252,0.78)]"
          >
            {revealAll ? "Hide airflow" : "Reveal airflow"}
          </button>
        </div>

        <div
          ref={stageRef}
          data-hover={hovering}
          data-reveal-all={revealAll}
          data-disabled={revealDisabled}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className={cn("relative aspect-[16/9] w-full", styles.stage)}
        >
          {baseMissing ? (
            <ImageMissingFallback path={baseSrc} />
          ) : (
            <Image
              src={baseSrc}
              alt="Fictional FR-01 Formula 1 concept car, exterior view"
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
              className={styles.layer}
              onError={() => setBaseMissing(true)}
            />
          )}
          {aeroMissing ? null : (
            <div className={styles.aeroLayer}>
              <Image
                src={aeroSrc}
                alt="Fictional FR-01 Formula 1 concept car, aerodynamic airflow analysis view"
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className={styles.layer}
                onError={() => setAeroMissing(true)}
              />
              <AeroFlowOverlay />
            </div>
          )}
          {!interacted && !revealAll && !revealDisabled ? (
            <span className={cn("pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[rgba(248,250,252,0.15)] bg-[rgba(0,0,0,0.45)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.8px] text-[rgba(248,250,252,0.7)] backdrop-blur-sm", styles.hint)}>
              Hover to inspect
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
