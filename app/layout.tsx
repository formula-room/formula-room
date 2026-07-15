import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";

import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Dashboard",
  description: "Formula 1 dashboard project scaffold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storedTheme = window.localStorage.getItem("formula-room-theme");
                  var theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
                  var root = document.documentElement;
                  root.classList.toggle("dark", theme === "dark");
                  root.dataset.theme = theme;
                } catch (error) {
                  document.documentElement.classList.add("dark");
                  document.documentElement.dataset.theme = "dark";
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans transition-colors duration-300">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
