"use client";
// OSIRIS UX — count-up animation (easeOutExpo, 800ms)

import { useEffect, useRef, useState } from "react";

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface CountUpProps {
  to: number;
  duration?: number;
  format?: (v: number) => string;
  className?: string;
}

export function CountUp({
  to,
  duration = 800,
  format,
  className,
}: CountUpProps) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let startTime: number | null = null;
    cancelAnimationFrame(rafRef.current);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCurrent(Math.round(easeOutExpo(progress) * to));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, duration]);

  return (
    <span className={className}>
      {format ? format(current) : current}
    </span>
  );
}
