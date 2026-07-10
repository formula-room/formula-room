"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";

import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type DashboardShellProps = {
  children: React.ReactNode;
};

const mainNavItems = [
  { title: "Calendar", href: "/calendar", matches: ["/calendar"] },
  {
    title: "Weekend Schedule",
    href: "/event",
    matches: ["/event"],
  },
  { title: "Results", href: "/results", matches: ["/results"] },
  { title: "Standings", href: "/standings", matches: ["/standings", "/driver", "/team"] },
  { title: "Statistics", href: "/statistics", matches: ["/statistics"] },
  { title: "Grand Prix", href: "/grand-prix", matches: ["/grand-prix", "/circuit"] },
  { title: "Head-to-Head", href: "/head-to-head", matches: ["/head-to-head"] },
  { title: "eStore", href: "/estore", matches: ["/estore"] },
];

function LogoLockup() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-ink"
      aria-label="Formula Room home"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#17140F] dark:bg-white/10">
        <Image
          src="/brand-logo.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
          priority
        />
      </span>
      <span className="font-display text-[18px] uppercase tracking-[3px] text-ink">Formula Room</span>
    </Link>
  );
}

function NavItems({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center", mobile && "flex-col items-stretch gap-1")}>
      {mainNavItems.map((route) => {
        const isActive = route.matches.some((match) =>
          match === "/" ? pathname === "/" : pathname === match || pathname.startsWith(`${match}/`)
        );

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex h-[60px] items-center border-b-2 border-transparent px-4 text-[11px] font-medium uppercase tracking-[0.9px] text-ink3 transition-colors hover:text-ink2",
              mobile && "h-auto rounded-[8px] border border-[var(--color-line2)] px-4 py-3",
              isActive
                ? "border-[var(--color-red)] text-ink"
                : "text-ink3"
            )}
          >
            {route.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-[300] h-[60px] border-b border-[var(--color-line2)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-10">
          <LogoLockup />

          <div className="hidden min-[1180px]:block">
            <NavItems />
          </div>

          <div className="flex items-center gap-2 min-[1180px]:min-w-[70px] min-[1180px]:justify-end">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[6px] border border-[var(--color-line2)] bg-white text-ink3 hover:bg-[var(--color-bg)] hover:text-ink min-[1180px]:hidden"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="border-[var(--color-line2)] bg-[var(--color-bg)] text-ink">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl tracking-[1px] text-ink">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <NavItems mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-60px)] w-full max-w-[1440px] flex-col px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
