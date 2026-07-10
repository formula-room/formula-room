import { Grid2X2, List, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type CalendarFilter = "All" | "Completed" | "Upcoming";
export type CalendarViewMode = "list" | "card";

export function CalendarToolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  view,
  onViewChange,
}: {
  filter: CalendarFilter;
  onFilterChange: (filter: CalendarFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
}) {
  const filters: CalendarFilter[] = ["All", "Completed", "Upcoming"];

  return (
    <section className="mb-4 flex flex-col gap-3 animate-fade-up animate-fade-up-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-fit rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onFilterChange(item)}
            className={cn(
              "rounded-[5px] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.8px] transition-all",
              filter === item ? "bg-ink text-white" : "text-ink3 hover:text-ink2",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="flex w-full items-center gap-2 rounded-[8px] border border-[var(--color-line2)] bg-white px-3 py-2 transition-colors focus-within:border-[var(--color-line3)] sm:w-56">
          <Search className="h-3.5 w-3.5 flex-shrink-0 text-ink3" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search races or circuits..."
            className="min-w-0 flex-1 border-none bg-transparent text-[12px] text-ink outline-none placeholder:text-ink3"
          />
        </label>

        <div className="flex w-fit rounded-[8px] border border-[var(--color-line2)] bg-white p-[3px]">
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-label="List view"
            className={cn(
              "flex h-[28px] w-[28px] items-center justify-center rounded-[4px] transition-all",
              view === "list" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("card")}
            aria-label="Card view"
            className={cn(
              "flex h-[28px] w-[28px] items-center justify-center rounded-[4px] transition-all",
              view === "card" ? "bg-[var(--color-bg2)] text-ink" : "text-ink3 hover:text-ink2",
            )}
          >
            <Grid2X2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
