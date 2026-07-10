import type { Metadata } from "next";

import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <html lang="en" suppressHydrationWarning>
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
