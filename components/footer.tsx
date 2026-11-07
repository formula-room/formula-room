export function Footer() {
  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.08)] bg-[#1d1d1d]" style={{ backgroundColor: "#1d1d1d" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-red)] to-transparent opacity-60" />

      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 py-8 lg:px-10">
        <div className="min-w-0 lg:max-w-[300px]">
          <div className="font-display text-[14px] uppercase tracking-[2.6px] text-[#F8FAFC]">Formula Room</div>
          <p className="mt-1.5 text-[13px] leading-6 text-[rgba(255,255,255,0.42)]">
            Your F1 community in one room. News, results, standings and everything that matters.
          </p>
          <p className="mt-3 text-[11px] leading-5 text-[rgba(255,255,255,0.34)] lg:w-[760px] lg:max-w-[calc(100vw-80px)]">
            <span className="lg:whitespace-nowrap">This website is unofficial and is not associated in any way with the Formula 1 companies.</span>
            <br />
            <span className="lg:whitespace-nowrap">F1, FORMULA ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade marks of Formula One Licensing B.V.</span>
          </p>
        </div>

      </div>

      <div className="border-t border-[rgba(255,255,255,0.08)] px-5 py-4 lg:px-10">
        <p className="text-[11px] text-[rgba(255,255,255,0.32)]">© {new Date().getFullYear()} Formula Room. All rights reserved.</p>
      </div>
    </footer>
  );
}
