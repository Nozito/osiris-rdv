"use client";
// OSIRIS CRM — pricing configurator

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { DEADLINES } from "@/lib/configurator-pricing";

function rateLabel(rate: number): string {
  if (rate === 0) return "Inclus";
  return `+${Math.round(rate * 100)}%`;
}

export function CStep5Delai() {
  const { data, update, quote } = useConfigurator();

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Délai de réalisation</h2>
      <p className="text-sm text-muted mb-6">
        Le délai s'applique sur le sous-total HT. La TVA est calculée après.
      </p>

      <div className="flex flex-col gap-3">
        {DEADLINES.map((dl) => {
          const selected = data.deadlineId === dl.id;
          const isUrgent = dl.rate > 0;
          return (
            <button
              key={dl.id}
              onClick={() => update({ deadlineId: dl.id })}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150
                ${selected
                  ? "border-accent/50 bg-accent/8 shadow-[0_0_16px_-4px_rgba(37,99,235,0.2)]"
                  : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                }
              `}
            >
              {/* Radio dot */}
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${selected ? "border-accent" : "border-white/20"}
                `}
              >
                {selected && <div className="w-2 h-2 rounded-full bg-accent" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${selected ? "text-textc" : "text-muted"}`}>
                  {dl.label}
                </p>
                <p className="text-xs text-faint mt-0.5">{dl.sublabel}</p>
              </div>

              {/* OSIRIS CRM — pricing configurator: deadline rate display */}
              <span
                className={`
                  text-sm font-bold shrink-0 px-2.5 py-1 rounded-lg
                  ${selected
                    ? isUrgent ? "bg-orange-400/15 text-orange-300" : "bg-accent/15 text-accent"
                    : isUrgent ? "text-orange-400" : "text-muted"
                  }
                `}
              >
                {rateLabel(dl.rate)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live surcharge preview */}
      {quote.deadlineSurcharge > 0 && (
        <div className="mt-4 rounded-xl border border-orange-400/20 bg-orange-400/5 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-orange-300/80">Majoration délai</span>
          <span className="text-sm font-bold text-orange-300">
            +{quote.deadlineSurcharge.toLocaleString("fr-FR")} €
          </span>
        </div>
      )}
    </div>
  );
}
