"use client";

import { Check } from "lucide-react";
import { formatPrice } from "@/lib/pricing";

interface OptionCardProps {
  id: string;
  label: string;
  sublabel?: string;
  price?: number;
  monthly?: number;
  selected: boolean;
  onSelect: (id: string) => void;
  type?: "radio" | "checkbox";
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export function OptionCard({
  id,
  label,
  sublabel,
  price,
  monthly,
  selected,
  onSelect,
  type = "radio",
  icon,
  badge,
  disabled = false,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className={`
        relative w-full text-left rounded-card border p-4 transition-all duration-150
        ${
          selected
            ? "border-accent bg-accent/8 shadow-[0_0_20px_var(--glow)]"
            : "border-white/8 bg-surface hover:border-white/15 hover:bg-surface2"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"}
      `}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors
            ${selected ? "bg-accent/20 text-accent" : "bg-white/5 text-muted"}`}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${selected ? "text-textc" : "text-textc"}`}
            >
              {label}
            </span>
            {badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/25">
                {badge}
              </span>
            )}
          </div>
          {sublabel && (
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              {sublabel}
            </p>
          )}
          {(price !== undefined || monthly !== undefined) && (
            <div className="flex items-center gap-2 mt-2">
              {price !== undefined && price > 0 && (
                <span
                  className={`text-xs font-semibold ${selected ? "text-accent" : "text-muted"}`}
                >
                  +{formatPrice(price)}
                </span>
              )}
              {price === 0 && (
                <span
                  className={`text-xs font-semibold ${selected ? "text-success" : "text-muted"}`}
                >
                  Inclus
                </span>
              )}
              {monthly !== undefined && monthly > 0 && (
                <span
                  className={`text-xs ${selected ? "text-accent/70" : "text-faint"}`}
                >
                  +{formatPrice(monthly)}/mois
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={`
            flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all
            ${type === "radio" ? "rounded-full" : "rounded-md"}
            ${
              selected
                ? "bg-accent border-accent"
                : "border-2 border-white/20 bg-transparent"
            }
          `}
        >
          {selected && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
      </div>
    </button>
  );
}
