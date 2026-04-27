"use client";

import { X } from "lucide-react";

interface Option {
  id: string;
  label: string;
  sublabel?: string;
  price?: number;
}

interface MultiSelectProps {
  options: readonly Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  label,
}: MultiSelectProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-sm font-medium text-textc">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                border transition-all duration-150 active:scale-[0.97]
                ${
                  isSelected
                    ? "bg-accent/15 border-accent/40 text-accent"
                    : "bg-surface2 border-white/8 text-muted hover:border-white/20 hover:text-textc"
                }
              `}
            >
              {opt.label}
              {isSelected && (
                <X size={12} strokeWidth={2.5} className="opacity-70" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
