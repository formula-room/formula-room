"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { Popover } from "radix-ui";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import type { DriverProfile } from "@/lib/head-to-head-data";
import { cn } from "@/lib/utils";

/** So "raikkonen", "belso" and "jean eric" find Räikkönen, Belsø and Jean-Éric. */
function searchKey(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/'/g, "")
    .replace(/-/g, " ");
}

function DriverSearchList({
  drivers,
  value,
  onSelect,
}: {
  drivers: DriverProfile[];
  value: string;
  onSelect: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(() => Math.max(drivers.findIndex((driver) => driver.slug === value), 0));
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const searchable = useMemo(() => drivers.map((driver) => ({ driver, key: searchKey(driver.name) })), [drivers]);

  const matches = useMemo(() => {
    const words = searchKey(query).split(/\s+/).filter(Boolean);
    return searchable.filter(({ key }) => words.every((word) => key.includes(word))).map(({ driver }) => driver);
  }, [query, searchable]);

  // Scrolls the list by hand: scrollIntoView could also move the page behind the popover.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !item) return;

    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [activeIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (matches.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + step + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const driver = matches[activeIndex];
      if (driver) onSelect(driver.slug);
    }
  }

  return (
    <>
      <div className="relative border-b border-[var(--color-line)]">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink2" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search drivers"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={matches[activeIndex] ? `${listId}-${matches[activeIndex].slug}` : undefined}
          placeholder="Search drivers"
          autoComplete="off"
          spellCheck={false}
          // Below 16px, iOS zooms the whole page when the field takes focus.
          className="h-11 w-full bg-transparent pl-10 pr-4 text-base text-ink outline-none placeholder:text-ink2 sm:text-sm"
        />
      </div>

      <ul ref={listRef} id={listId} role="listbox" aria-label="Drivers" className="relative max-h-[264px] overflow-y-auto p-1">
        {matches.map((driver, index) => {
          const selected = driver.slug === value;

          return (
            <li
              key={driver.slug}
              id={`${listId}-${driver.slug}`}
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(driver.slug)}
              onMouseMove={() => setActiveIndex(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-[5px] px-3 py-2 text-sm text-ink",
                index === activeIndex && "bg-[var(--color-bg)]",
                selected && "font-semibold",
              )}
            >
              <span className="min-w-0 truncate">{driver.name}</span>
              {selected ? <Check aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-[var(--color-red)]" /> : null}
            </li>
          );
        })}
      </ul>

      {matches.length === 0 ? (
        <p role="status" className="px-4 pb-5 pt-3 text-center text-sm text-ink2">
          No drivers match &quot;{query.trim()}&quot;.
        </p>
      ) : null}
    </>
  );
}

export function DriverPicker({
  label,
  value,
  drivers,
  loading,
  accentBorder,
  onChange,
}: {
  label: string;
  value: string;
  drivers: DriverProfile[];
  loading: boolean;
  /** Border colour once a driver is chosen. */
  accentBorder: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = drivers.find((driver) => driver.slug === value);
  const placeholder = loading ? "Loading drivers..." : "Select driver";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        disabled={loading}
        aria-label={`${label}: ${selected?.name ?? placeholder}`}
        style={selected ? { borderColor: accentBorder } : undefined}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-[8px] border border-[var(--color-line2)] bg-white px-4 text-sm text-ink outline-none transition-colors hover:border-[var(--color-line3)] focus-visible:ring-2 focus-visible:ring-[var(--color-red-border)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("min-w-0 truncate", !selected && "text-ink2")}>{selected?.name ?? placeholder}</span>
        <ChevronDown aria-hidden="true" className={cn("h-4 w-4 flex-shrink-0 text-ink2 transition-transform", open && "rotate-180")} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[8px] border border-[var(--color-line2)] bg-white text-ink shadow-[0_12px_32px_rgba(23,20,15,0.10)]"
        >
          <DriverSearchList
            drivers={drivers}
            value={value}
            onSelect={(slug) => {
              onChange(slug);
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
