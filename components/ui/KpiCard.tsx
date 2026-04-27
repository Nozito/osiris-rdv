"use client";
// OSIRIS UX — animated KPI card with count-up, hover glow, optional glint

import { CountUp } from "./CountUp";
import { formatPrice } from "@/lib/pricing";

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  format?: "number" | "price" | "percent";
  glint?: boolean;
}

export function KpiCard({
  label,
  value,
  icon,
  format = "number",
  glint = false,
}: KpiCardProps) {
  const fmt = (v: number) => {
    if (format === "price") return formatPrice(v);
    if (format === "percent") return `${v}%`;
    return String(v);
  };

  return (
    <div
      className="
        relative overflow-hidden
        rounded-card bg-surface border border-white/8 p-4
        transition-all duration-200 ease-out cursor-default
        hover:-translate-y-0.5
        hover:border-white/[0.14]
        hover:shadow-[0_8px_32px_-8px_rgba(37,99,235,0.22)]
      "
    >
      {/* OSIRIS UX — glint sweep (CA card only) */}
      {glint && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 w-12 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)",
            transform: "skewX(-12deg)",
            animation: "glint 1.8s ease-out 0.4s 1 forwards",
            left: "-48px",
          }}
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent">{icon}</span>
        <span className="text-xs text-muted">{label}</span>
      </div>

      <p className="kpi-value font-bold text-textc font-display">
        <CountUp to={value} format={fmt} />
      </p>
    </div>
  );
}
