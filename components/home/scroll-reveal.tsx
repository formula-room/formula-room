"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  disabled?: boolean;
  onReveal?: () => void;
};

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ScrollReveal({ children, className, delayMs = 0, disabled = false, onReveal }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const didRevealRef = useRef(false);
  const [isReady, setIsReady] = useState(() => !disabled);
  const [isVisible, setIsVisible] = useState(() => disabled);

  useIsomorphicLayoutEffect(() => {
    if (disabled) {
      setIsReady(false);
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setIsReady(false);
      setIsVisible(true);
      if (!didRevealRef.current) {
        didRevealRef.current = true;
        onReveal?.();
      }
      return;
    }

    setIsReady(true);

    const reveal = () => {
      setIsVisible(true);
      if (!didRevealRef.current) {
        didRevealRef.current = true;
        onReveal?.();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        reveal();
        observer.disconnect();
      },
      { threshold: 0.18 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [disabled, onReveal]);

  const showReadyState = !disabled && isReady;
  const showVisibleState = disabled || isVisible;

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", showReadyState && "scroll-reveal-ready", showVisibleState && "scroll-reveal-visible", className)}
      style={{ transitionDelay: showVisibleState && delayMs ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  );
}
