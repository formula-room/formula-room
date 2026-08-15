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
    <section className="flex flex-col items-center gap-6 px-4 pt-10 pb-8 text-center sm:pt-14 sm:pb-10">
      <h1
        key={`hero-heading-${pathname}`}
        className={`${anton.className} animate-fade-in max-w-full whitespace-normal uppercase leading-[0.95] tracking-[1px] text-[var(--color-red)] lg:whitespace-nowrap`}
        style={{ fontSize: "clamp(34px, 5.6vw, 72px)" }}
      >
        Your F1 Community in One Room
      </h1>
      <p
        key={`hero-copy-${pathname}`}
        className="animate-fade-in max-w-full whitespace-nowrap text-[14px] uppercase leading-relaxed text-ink3 sm:text-[15px]"
      >
        All the news, results, standings and race-week information you need. One community
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
