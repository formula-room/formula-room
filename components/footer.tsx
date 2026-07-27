import { InstagramIcon, ThreadsIcon, XIcon } from "@/components/icons/SocialIcons";
import { socialLinks, type SocialLinkId } from "@/config/social";

const socialHoverClass: Record<SocialLinkId, string> = {
  instagram: "hover:border-[rgba(225,48,108,0.30)] hover:bg-[rgba(225,48,108,0.10)] hover:text-[#E1306C]",
  x: "hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F8FAFC]",
  threads: "hover:border-[rgba(255,255,255,0.25)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#F8FAFC]",
};

const socialIcons: Record<SocialLinkId, React.ReactNode> = {
  instagram: <InstagramIcon className="w-4 h-4" />,
  x: <XIcon className="w-4 h-4" />,
  threads: <ThreadsIcon className="w-4 h-4" />,
};

export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.08)] bg-[#17140F]" style={{ backgroundColor: "#17140F" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-red)] to-transparent opacity-60" />

      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="min-w-0">
          <div className="font-display text-[14px] uppercase tracking-[2.6px] text-[#F8FAFC]">Formula Room</div>
          <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[rgba(255,255,255,0.42)]">
            Follow Formula Room for F1 updates, stats, and race-week coverage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              title={link.label}
              className={`flex h-10 w-10 items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.42)] transition ${socialHoverClass[link.id]}`}
            >
              {socialIcons[link.id]}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
