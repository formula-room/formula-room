import type { Metadata } from "next";

import { CarRevealHero } from "@/components/marketing/car-reveal-hero";

export const metadata: Metadata = {
  title: "Formula Room",
  description: "Formula Room concept car engineering reveal.",
};

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center px-6 py-10 sm:px-10">
      <CarRevealHero className="w-full" />
    </main>
  );
}
