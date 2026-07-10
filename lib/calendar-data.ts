export type CalendarStatus = "Completed" | "Upcoming" | "This Weekend";

export type CalendarEvent = {
  round: string;
  grandPrix: string;
  country: string;
  circuit: string;
  date: string;
  status: CalendarStatus;
  href: string;
  highlight?: boolean;
};

export const calendarEvents: CalendarEvent[] = [
  {
    round: "01",
    grandPrix: "Bahrain Grand Prix",
    country: "Bahrain",
    circuit: "Bahrain International Circuit",
    date: "02 Mar 2026",
    status: "Completed",
    href: "/event/bahrain-grand-prix",
  },
  {
    round: "02",
    grandPrix: "Saudi Arabian Grand Prix",
    country: "Saudi Arabia",
    circuit: "Jeddah Corniche Circuit",
    date: "09 Mar 2026",
    status: "Completed",
    href: "/event/saudi-arabian-grand-prix",
  },
  {
    round: "03",
    grandPrix: "Australian Grand Prix",
    country: "Australia",
    circuit: "Albert Park Circuit",
    date: "16 Mar 2026",
    status: "This Weekend",
    href: "/event/australian-grand-prix",
    highlight: true,
  },
  {
    round: "04",
    grandPrix: "Japanese Grand Prix",
    country: "Japan",
    circuit: "Suzuka Circuit",
    date: "30 Mar 2026",
    status: "Upcoming",
    href: "/event/japanese-grand-prix",
  },
  {
    round: "05",
    grandPrix: "Chinese Grand Prix",
    country: "China",
    circuit: "Shanghai International Circuit",
    date: "13 Apr 2026",
    status: "Upcoming",
    href: "/event/chinese-grand-prix",
  },
  {
    round: "06",
    grandPrix: "Miami Grand Prix",
    country: "United States",
    circuit: "Miami International Autodrome",
    date: "04 May 2026",
    status: "Upcoming",
    href: "/event/miami-grand-prix",
  },
  {
    round: "07",
    grandPrix: "Emilia-Romagna Grand Prix",
    country: "Italy",
    circuit: "Autodromo Enzo e Dino Ferrari",
    date: "18 May 2026",
    status: "Upcoming",
    href: "/event/emilia-romagna-grand-prix",
  },
  {
    round: "08",
    grandPrix: "Monaco Grand Prix",
    country: "Monaco",
    circuit: "Circuit de Monaco",
    date: "25 May 2026",
    status: "Upcoming",
    href: "/event/monaco-grand-prix",
  },
];

export const calendarSeasons = ["2026", "2025", "2024"] as const;
