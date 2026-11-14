"use client";

import { Anton } from "next/font/google";
import Image from "next/image";
import { useEffect } from "react";

import { RaceCountdownBar, type CountdownBarRace } from "@/components/home/race-countdown-bar";
import { CountryFlag } from "@/components/shared/country-flag";
import type { HomeHeroBackground } from "@/lib/server/page-data/home-hero";
import { cn } from "@/lib/utils";

const anton = Anton({ subsets: ["latin"], weight: "400" });

type HeroSectionProps = {
  background: HomeHeroBackground;
  race: CountdownBarRace & { location: string; flagCountry: string };
  status: "loading" | "ready" | "unavailable";
};

/* Left-side shade: stronger for bright daytime photos, lighter for night photos. */
const SHADE: Record<HomeHeroBackground["tone"], string> = {
  bright:
    "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.66) 26%, rgba(0,0,0,0.28) 46%, rgba(0,0,0,0) 62%)",
  dark: "linear-gradient(90deg, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.48) 26%, rgba(0,0,0,0.16) 46%, rgba(0,0,0,0) 60%)",
};
const MOBILE_SHADE: Record<HomeHeroBackground["tone"], string> = {
  bright: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.72) 100%)",
  dark: "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.62) 100%)",
};

/** Lets the hero span the full window (minus the scrollbar) from inside the page's centred column. */
function useScrollbarWidthVar() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => root.style.setProperty("--fr-scrollbar", `${window.innerWidth - root.clientWidth}px`);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
}

export function HeroSection({ background, race, status }: HeroSectionProps) {
  useScrollbarWidthVar();
  // The location label describes the Grand Prix shown in the photo (during a gap week that is the previous
  // Grand Prix). It is hidden while the generic fallback photo is shown. The countdown bar always shows the upcoming one.
  const label = background.isFallback ? null : background.race;
  const roundNumber = label ? String(Number.parseInt(label.round, 10) || label.round) : "";

  return (
    <section
      className="fr-hero relative isolate -mt-8 flex min-h-[calc(100svh-60px)] flex-col overflow-hidden bg-[#0d0d0f] text-[#fff] md:min-h-[min(calc(100svh-60px),820px)] lg:min-h-[min(max(calc(100svh-60px),640px),820px)]"
      style={
        {
          "--hero-pos": background.position ?? "50% 50%",
          "--hero-pos-mobile": background.mobilePosition ?? background.position ?? "50% 50%",
        } as React.CSSProperties
      }
    >
      <Image
        src={background.src}
        alt={background.alt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[var(--hero-pos-mobile)] md:object-[var(--hero-pos)]"
      />
      {/* Readability shade: left side on wider screens, top-to-bottom on phones */}
      <div className="absolute inset-0 -z-10 md:hidden" style={{ background: MOBILE_SHADE[background.tone] }} aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden md:block" style={{ background: SHADE[background.tone] }} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-[45%] bg-[linear-gradient(0deg,rgba(0,0,0,0.45),rgba(0,0,0,0))] md:block" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-[calc(1280px+4rem)] flex-1 flex-col px-4 pt-10 pb-6 sm:px-6 sm:pt-14 sm:pb-8 lg:px-8 lg:pt-20 lg:pb-10">
        <div className="max-w-[640px]">
          <h1
            className={cn(anton.className, "uppercase leading-[0.93] tracking-[0.5px] text-[#fff] [text-shadow:0_2px_24px_rgba(0,0,0,0.35)]")}
            style={{ fontSize: "clamp(44px, 6.4vw, 92px)" }}
          >
            Your F1 Community
            <span className="block text-[var(--color-red)] [filter:brightness(1.12)]">In One Room</span>
          </h1>
          <p className="mt-5 max-w-[540px] text-[16px] leading-[1.55] text-[rgba(255,255,255,0.9)] sm:text-[18px] lg:text-[19px]">
            All the news, results, standings and race-week information you need. One community.
          </p>
          {label ? (
            <div className="mt-5 flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-semibold uppercase tracking-[1.4px] text-[rgba(255,255,255,0.85)] sm:text-[13px]">
              {label.flagCountry ? <CountryFlag country={label.flagCountry} className="h-5 w-7 rounded-[4px]" /> : null}
              <span>{label.location}</span>
              <span className="h-3.5 w-px bg-[rgba(255,255,255,0.4)]" aria-hidden="true" />
              <span>Round {roundNumber}</span>
            </div>
          ) : null}
        </div>

        {/* Phones: 40-48px gap above the countdown card; larger screens keep pushing the card to the bottom. */}
        <div className="min-h-10 flex-1 max-sm:max-h-12 sm:mt-12 sm:min-h-0" aria-hidden="true" />

        <RaceCountdownBar race={race} status={status} />
      </div>
    </section>
  );
}
