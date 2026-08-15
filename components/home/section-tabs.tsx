"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

type TabDef = {
  value: string;
  label: string;
};

type SectionTabsProps = {
  idPrefix: string;
  tabs: TabDef[];
  active: string;
  onChange: (value: string) => void;
  trailing?: React.ReactNode;
  className?: string;
};

export function tabPanelId(idPrefix: string, value: string) {
  return `${idPrefix}-panel-${value}`;
}

export function tabButtonId(idPrefix: string, value: string) {
  return `${idPrefix}-tab-${value}`;
}

export function SectionTabs({ idPrefix, tabs, active, onChange, trailing, className }: SectionTabsProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.value === active);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    onChange(next.value);
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[var(--color-line)] px-6",
        className,
      )}
    >
      <div ref={groupRef} role="tablist" aria-orientation="horizontal" onKeyDown={handleKeyDown} className="flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              id={tabButtonId(idPrefix, tab.value)}
              type="button"
              role="tab"
              data-value={tab.value}
              aria-selected={isActive}
              aria-controls={tabPanelId(idPrefix, tab.value)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative -mb-px border-b-2 border-transparent py-3.5 text-[12px] font-medium uppercase tracking-[0.6px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)]",
                isActive ? "border-[var(--color-red)] text-[var(--color-red)]" : "text-ink3 hover:text-ink2",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {trailing}
    </div>
  );
}
