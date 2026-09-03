"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";

import { Footer } from "@/components/footer";
import { InstagramIcon, LinkedInIcon, ThreadsIcon, XIcon } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";
import { socialLinks, type SocialLinkId } from "@/config/social";
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
  { title: "News", href: "/news", matches: ["/news"] },
  { title: "Calendar", href: "/calendar", matches: ["/calendar"] },
  { title: "Standings", href: "/standings", matches: ["/standings", "/driver", "/team"] },
  { title: "Statistics", href: "/statistics", matches: ["/statistics"] },
  { title: "Wallpapers", href: "/wallpapers", matches: ["/wallpapers"] },
  { title: "eStore", href: "/estore", matches: ["/estore"] },
];

const socialHoverClass: Record<SocialLinkId, string> = {
  instagram: "hover:text-[#E1306C]",
  x: "hover:text-[#F8FAFC]",
  threads: "hover:text-[#F8FAFC]",
  linkedin: "hover:text-[#F8FAFC]",
};

const socialIcons: Record<SocialLinkId, React.ReactNode> = {
  instagram: <InstagramIcon className="h-4 w-4" />,
  x: <XIcon className="h-4 w-4" />,
  threads: <ThreadsIcon className="h-4 w-4" />,
  linkedin: <LinkedInIcon className="h-4 w-4" />,
};

function LogoLockup() {
  return (
    <Link
      href="/"
      className="flex translate-x-3 items-center gap-2.5 text-white"
      aria-label="Formula Room home"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Image
          src="/images/FR logo.png"
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
      </span>
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
              "flex h-[60px] items-center border-b-2 border-transparent px-4 text-[11px] font-medium uppercase tracking-[0.9px] text-[rgba(255,255,255,0.42)] transition-colors hover:text-white",
              mobile && "h-auto rounded-[8px] border border-[rgba(255,255,255,0.12)] px-4 py-3",
              isActive
                ? "border-[var(--color-red)] text-white"
                : "text-[rgba(255,255,255,0.42)]"
            )}
          >
            {route.title}
          </Link>
        );
      })}
    </nav>
  );
}

function HeaderSocialLinks() {
  return (
    <div className="hidden items-center gap-5 min-[1180px]:flex">
      {socialLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
          className={`flex items-center justify-center text-[rgba(255,255,255,0.74)] transition-colors ${socialHoverClass[link.id]}`}
        >
          {socialIcons[link.id]}
        </a>
      ))}
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-[300] h-[60px] border-b border-[rgba(255,255,255,0.08)] bg-[#1d1d1d] backdrop-blur-xl" style={{ backgroundColor: "#1d1d1d" }}>
        <div className="mx-auto grid h-[60px] max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 pl-2 pr-5 lg:pl-4 lg:pr-10">
          <LogoLockup />

          <div className="hidden translate-x-12 justify-self-center min-[1180px]:block">
            <NavItems />
          </div>

          <div className="flex items-center gap-5 justify-self-end min-[1180px]:min-w-[140px] min-[1180px]:justify-end">
            <HeaderSocialLinks />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[6px] border border-[rgba(255,255,255,0.12)] bg-white/5 text-[rgba(255,255,255,0.42)] hover:bg-white/10 hover:text-white min-[1180px]:hidden"
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
      <Footer />
    </div>
  );
}
