"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedPriceProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedPrice({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 400,
}: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef  = useRef(value);
  const frameRef = useRef<number>(0);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = prevRef.current;
    const end   = value;
    if (start === end) return;

    // Flash couleur selon direction
    setFlash(end > start ? "up" : "down");
    if (flashRef.current) clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setFlash(null), 300);

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  const formatted = new Intl.NumberFormat("fr-FR").format(displayValue);

  const flashClass = flash === "up"
    ? "bg-green-500/10 rounded-sm"
    : flash === "down"
    ? "bg-red-500/10 rounded-sm"
    : "";

  return (
    <span className={`${className} transition-[background] duration-300 ${flashClass}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
