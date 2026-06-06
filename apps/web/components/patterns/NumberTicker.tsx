"use client";

import * as React from "react";

export interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
}

export function NumberTicker({ value, duration = 900, className }: NumberTickerProps) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const played = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(value);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && !played.current) {
          played.current = true;
          const start = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(2, -10 * p);
            setN(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}
