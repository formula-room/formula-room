import { normalizeCountryFlagKey } from "@/lib/f1/flag-country";
import { cn } from "@/lib/utils";

type CountryFlagProps = {
  country: string;
  className?: string;
};

type SvgProps = {
  className?: string;
};

function FlagFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-10 items-center justify-center overflow-hidden rounded-[0.55rem] border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function SvgBase({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={cn("h-full w-full", className)} xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

function JapanFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" rx="4" fill="#F7F7F7" />
      <circle cx="18" cy="12" r="6.2" fill="#BC002D" />
    </SvgBase>
  );
}

function ItalyFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="12" height="24" fill="#009246" />
      <rect x="12" width="12" height="24" fill="#F7F7F7" />
      <rect x="24" width="12" height="24" fill="#CE2B37" />
    </SvgBase>
  );
}

function FranceFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="12" height="24" fill="#0055A4" />
      <rect x="12" width="12" height="24" fill="#F7F7F7" />
      <rect x="24" width="12" height="24" fill="#EF4135" />
    </SvgBase>
  );
}

function BelgiumFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="12" height="24" fill="#1F1F1F" />
      <rect x="12" width="12" height="24" fill="#FFD90C" />
      <rect x="24" width="12" height="24" fill="#EF3340" />
    </SvgBase>
  );
}

function NetherlandsFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="8" fill="#AE1C28" />
      <rect y="8" width="36" height="8" fill="#F7F7F7" />
      <rect y="16" width="36" height="8" fill="#21468B" />
    </SvgBase>
  );
}

function SpainFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#AA151B" />
      <rect y="5" width="36" height="14" fill="#F1BF00" />
    </SvgBase>
  );
}

function AustriaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#ED2939" />
      <rect y="8" width="36" height="8" fill="#F7F7F7" />
    </SvgBase>
  );
}

function HungaryFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="8" fill="#CE2939" />
      <rect y="8" width="36" height="8" fill="#F7F7F7" />
      <rect y="16" width="36" height="8" fill="#477050" />
    </SvgBase>
  );
}

function GermanyFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="8" fill="#1F1F1F" />
      <rect y="8" width="36" height="8" fill="#DD0000" />
      <rect y="16" width="36" height="8" fill="#FFCE00" />
    </SvgBase>
  );
}

function MonacoFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="12" fill="#CE1126" />
      <rect y="12" width="36" height="12" fill="#F7F7F7" />
    </SvgBase>
  );
}

function PolandFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="12" fill="#F7F7F7" />
      <rect y="12" width="36" height="12" fill="#DC143C" />
    </SvgBase>
  );
}

function IndonesiaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="12" fill="#CE1126" />
      <rect y="12" width="36" height="12" fill="#F7F7F7" />
    </SvgBase>
  );
}

function IrelandFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="12" height="24" fill="#169B62" />
      <rect x="12" width="12" height="24" fill="#F7F7F7" />
      <rect x="24" width="12" height="24" fill="#FF883E" />
    </SvgBase>
  );
}

function MexicoFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="12" height="24" fill="#006847" />
      <rect x="12" width="12" height="24" fill="#F7F7F7" />
      <rect x="24" width="12" height="24" fill="#CE1126" />
      <circle cx="18" cy="12" r="2.1" fill="#9C7A3C" />
    </SvgBase>
  );
}

function BahrainFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#CE1126" />
      <path d="M0 0h11l4 2.4-4 2.4 4 2.4-4 2.4 4 2.4-4 2.4 4 2.4-4 2.4 4 2.4-4 2.4H0Z" fill="#F7F7F7" />
    </SvgBase>
  );
}

function SaudiFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#006C35" />
      <rect x="7.5" y="8" width="21" height="1.8" rx="0.9" fill="#F7F7F7" />
      <rect x="9.5" y="11" width="17" height="1.6" rx="0.8" fill="#F7F7F7" opacity="0.95" />
      <rect x="9" y="15.2" width="17.5" height="1.8" rx="0.9" fill="#F7F7F7" />
      <rect x="21.5" y="14.3" width="5.2" height="0.9" rx="0.45" fill="#F7F7F7" />
    </SvgBase>
  );
}

function QatarFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#8A1538" />
      <path d="M0 0h10l3.4 2.4-3.4 2.4 3.4 2.4-3.4 2.4 3.4 2.4-3.4 2.4 3.4 2.4-3.4 2.4 3.4 2.4-3.4 2.4H0Z" fill="#F7F7F7" />
    </SvgBase>
  );
}

function SingaporeFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="12" fill="#EF3340" />
      <rect y="12" width="36" height="12" fill="#F7F7F7" />
      <circle cx="9" cy="6" r="4.2" fill="#F7F7F7" />
      <circle cx="10.6" cy="6" r="3.2" fill="#EF3340" />
    </SvgBase>
  );
}

function ChinaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#DE2910" />
      <path d="m8 4.2 1.1 3.1h3.2L9.7 9.2l1 3.1L8 10.4l-2.7 1.9 1-3.1-2.6-1.9h3.2Z" fill="#FFDE00" />
    </SvgBase>
  );
}

function VietnamFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#DA251D" />
      <path
        d="m18 5.2 2.2 6.3h6.6l-5.3 3.8 2 6.2-5.5-3.8-5.4 3.8 2-6.2-5.3-3.8h6.6Z"
        fill="#FFDD00"
      />
    </SvgBase>
  );
}

function AzerbaijanFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="8" fill="#00B5E2" />
      <rect y="8" width="36" height="8" fill="#EF3340" />
      <rect y="16" width="36" height="8" fill="#509E2F" />
      <circle cx="18" cy="12" r="3.2" fill="#F7F7F7" />
      <circle cx="19" cy="12" r="2.5" fill="#EF3340" />
    </SvgBase>
  );
}

function PortugalFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="14" height="24" fill="#046A38" />
      <rect x="14" width="22" height="24" fill="#DA291C" />
      <circle cx="14" cy="12" r="4.2" fill="#FFCD00" />
      <circle cx="14" cy="12" r="2.5" fill="#F7F7F7" />
    </SvgBase>
  );
}

function RussiaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="8" fill="#F7F7F7" />
      <rect y="8" width="36" height="8" fill="#0039A6" />
      <rect y="16" width="36" height="8" fill="#D52B1E" />
    </SvgBase>
  );
}

function TurkeyFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#E30A17" />
      <circle cx="14" cy="12" r="5.2" fill="#F7F7F7" />
      <circle cx="15.6" cy="12" r="4.1" fill="#E30A17" />
      <path d="m22.8 8.6.95 2.76h2.9l-2.35 1.7.9 2.74-2.4-1.7-2.38 1.7.9-2.74-2.35-1.7h2.9Z" fill="#F7F7F7" />
    </SvgBase>
  );
}

function BrazilFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#009B3A" />
      <path d="M18 3 31 12 18 21 5 12Z" fill="#FFDF00" />
      <circle cx="18" cy="12" r="4.3" fill="#002776" />
    </SvgBase>
  );
}

function CanadaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="8" height="24" fill="#D52B1E" />
      <rect x="8" width="20" height="24" fill="#F7F7F7" />
      <rect x="28" width="8" height="24" fill="#D52B1E" />
      <path d="M18 5.8 19.2 8l2.2-1-.7 2.5h2.6l-2 1.8 2 1.2-1.7 1.1.8 2.3-2.4-.7v3.5h-2v-3.5l-2.4.7.8-2.3-1.7-1.1 2-1.2-2-1.8h2.6L14.6 7l2.2 1Z" fill="#D52B1E" />
    </SvgBase>
  );
}

function AbuDhabiFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#00732F" />
      <rect y="8" width="36" height="8" fill="#F7F7F7" />
      <rect y="16" width="36" height="8" fill="#1F1F1F" />
      <rect width="8" height="24" fill="#FF0000" />
    </SvgBase>
  );
}

function UnitedKingdomFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#012169" />
      <path d="M0 0 36 24M36 0 0 24" stroke="#F7F7F7" strokeWidth="5.2" />
      <path d="M0 0v2.2l13.2 8.8h4.4zM36 0h-4.4L18.4 8.8v2.2zM0 24h4.4l13.2-8.8v-2.2zM36 24v-2.2l-13.2-8.8h-4.4z" fill="#C8102E" />
      <path d="M14 0h8v24h-8zM0 8h36v8H0z" fill="#F7F7F7" />
      <path d="M15.4 0h5.2v24h-5.2zM0 9.4h36v5.2H0z" fill="#C8102E" />
    </SvgBase>
  );
}

function UnitedStatesFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#F7F7F7" />
      <rect width="36" height="2.2" y="0" fill="#B22234" />
      <rect width="36" height="2.2" y="4.4" fill="#B22234" />
      <rect width="36" height="2.2" y="8.8" fill="#B22234" />
      <rect width="36" height="2.2" y="13.2" fill="#B22234" />
      <rect width="36" height="2.2" y="17.6" fill="#B22234" />
      <rect width="36" height="2.2" y="22" fill="#B22234" />
      <rect width="15.5" height="13" fill="#3C3B6E" />
      <circle cx="4" cy="4" r="1" fill="#F7F7F7" />
      <circle cx="8" cy="6.5" r="1" fill="#F7F7F7" />
      <circle cx="12" cy="4" r="1" fill="#F7F7F7" />
      <circle cx="4" cy="9" r="1" fill="#F7F7F7" />
      <circle cx="12" cy="9" r="1" fill="#F7F7F7" />
    </SvgBase>
  );
}

function AustraliaFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#012169" />
      <rect width="16" height="12" fill="#012169" />
      <path d="M0 0h3.2L16 8.5V12h-3.2L0 3.5ZM16 0h-3.2L0 8.5V12h3.2L16 3.5Z" fill="#F7F7F7" />
      <path d="M6.4 0h3.2v12H6.4Z" fill="#F7F7F7" />
      <path d="M0 4.4h16v3.2H0Z" fill="#F7F7F7" />
      <path d="M7 0h2v12H7Z" fill="#C8102E" />
      <path d="M0 5h16v2H0Z" fill="#C8102E" />
      <circle cx="25.5" cy="7" r="2.2" fill="#F7F7F7" />
      <circle cx="29.5" cy="12" r="1.8" fill="#F7F7F7" />
      <circle cx="24.2" cy="15.5" r="1.7" fill="#F7F7F7" />
      <circle cx="30.2" cy="18" r="1.5" fill="#F7F7F7" />
    </SvgBase>
  );
}

const flagComponents: Record<string, React.ComponentType<SvgProps>> = {
  Australia: AustraliaFlag,
  Austria: AustriaFlag,
  Azerbaijan: AzerbaijanFlag,
  Bahrain: BahrainFlag,
  Belgium: BelgiumFlag,
  Brazil: BrazilFlag,
  Canada: CanadaFlag,
  China: ChinaFlag,
  France: FranceFlag,
  Germany: GermanyFlag,
  Hungary: HungaryFlag,
  Indonesia: IndonesiaFlag,
  Ireland: IrelandFlag,
  Italy: ItalyFlag,
  Japan: JapanFlag,
  Mexico: MexicoFlag,
  Monaco: MonacoFlag,
  Netherlands: NetherlandsFlag,
  Poland: PolandFlag,
  Portugal: PortugalFlag,
  Qatar: QatarFlag,
  Russia: RussiaFlag,
  "Saudi Arabia": SaudiFlag,
  Singapore: SingaporeFlag,
  Spain: SpainFlag,
  Turkey: TurkeyFlag,
  "Abu Dhabi": AbuDhabiFlag,
  "United Arab Emirates": AbuDhabiFlag,
  "United Kingdom": UnitedKingdomFlag,
  "United States": UnitedStatesFlag,
  Vietnam: VietnamFlag,
};

function FallbackFlag({ className }: SvgProps) {
  return (
    <SvgBase className={className}>
      <rect width="36" height="24" fill="#0F172A" />
      <rect x="0" y="0" width="18" height="12" fill="#E5E7EB" opacity="0.9" />
      <rect x="18" y="12" width="18" height="12" fill="#E5E7EB" opacity="0.9" />
    </SvgBase>
  );
}

export function CountryFlag({ country, className }: CountryFlagProps) {
  const FlagGraphic = flagComponents[normalizeCountryFlagKey(country)] ?? FallbackFlag;

  return (
    <FlagFrame className={className}>
      <FlagGraphic />
    </FlagFrame>
  );
}
