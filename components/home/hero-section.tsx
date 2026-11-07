"use client";

import { Anton } from "next/font/google";
import Image from "next/image";
import { usePathname } from "next/navigation";

const anton = Anton({ subsets: ["latin"], weight: "400" });

const HERO_IMAGE = { src: "/images/Audi f1 2026 (1).png", alt: "Audi 2026 Formula 1 car" };
const HERO_IMAGE_ASPECT = "2728/599";

export function HeroSection() {
  const pathname = usePathname();

  return (
    <section className="flex flex-col items-center gap-5 pt-6 pb-2 text-center sm:pt-8 sm:pb-3 lg:pt-10 lg:pb-4">
      <h1
        key={`hero-heading-${pathname}`}
        className={`${anton.className} animate-fade-in max-w-full whitespace-normal text-balance uppercase leading-[0.95] tracking-[1px] text-[var(--color-red)] lg:whitespace-nowrap`}
        style={{ fontSize: "clamp(34px, 5.6vw, 72px)" }}
      >
        Your F1 Community in One Room
      </h1>
      <p
        key={`hero-copy-${pathname}`}
        className="animate-fade-in max-w-[640px] text-balance px-2 text-[13px] uppercase leading-relaxed tracking-[0.4px] text-ink2 sm:text-[14px] lg:max-w-full lg:whitespace-nowrap lg:text-[15px]"
      >
        All the news, results, standings and <span className="whitespace-nowrap">race-week</span> information you need. One community
      </p>
      <div className="mt-1 flex w-full justify-center sm:mt-0 lg:-mt-2">
        <div className="animate-fade-in flex w-full max-w-[1180px] flex-col items-center">
          <div className="relative w-full" style={{ aspectRatio: HERO_IMAGE_ASPECT }}>
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1180px, 100vw"
              quality={100}
              unoptimized
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
