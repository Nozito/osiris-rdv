"use client";
// OSIRIS CRM — pricing configurator

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { DEADLINES } from "@/lib/configurator-pricing";

function rateLabel(rate: number): string {
  if (rate === 0) return "Inclus";
  return `+${Math.round(rate * 100)}%`;
}

const DEADLINE_NOTES: Record<string, { text: string; color: string }> = {
  standard: { text: "Délai confortable — qualité optimale garantie",              color: "text-emerald-400" },
  express:  { text: "⚡ Production accélérée — quelques compromis possibles",      color: "text-amber-400"  },
  urgent:   { text: "🔥 Mode urgence — équipe dédiée, tarif majoré",              color: "text-orange-400" },
};

export function CStep5Delai() {
  const { data, update, quote } = useConfigurator();
  const selectedDeadline = DEADLINES.find((d) => d.id === data.deadlineId);

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Délai de réalisation</h2>
      <p className="text-sm text-muted mb-6">
        La majoration s'applique sur le sous-total HT.
      </p>

      <div className="flex flex-col gap-3 mb-5">
        {DEADLINES.map((dl) => {
          const selected = data.deadlineId === dl.id;
          const isUrgent = dl.rate > 0;
          return (
            <button
              key={dl.id}
              onClick={() => update({ deadlineId: dl.id })}
              className={`
                flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-100
                hover:scale-[1.02] active:scale-[0.97]
                ${selected
                  ? "border-accent/50 bg-accent/8 shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_4px_24px_-4px_rgba(37,99,235,0.25)]"
                  : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                }
              `}
            >
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

      {/* Impact block */}
      {selectedDeadline && (
        <div className="rounded-xl border border-white/8 bg-surface p-4">
          <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-3">Impact sur votre devis</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Sous-total HT</span>
              <span className="text-textc font-medium">{quote.subtotalHT.toLocaleString("fr-FR")} €</span>
            </div>
            {quote.deadlineSurcharge > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-400/80">
                  Majoration {selectedDeadline.label} (+{Math.round(selectedDeadline.rate * 100)}%)
                </span>
                <span className="text-orange-400 font-semibold">
                  +{quote.deadlineSurcharge.toLocaleString("fr-FR")} €
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm pt-2 mt-1 border-t border-white/8">
              <span className="font-semibold text-textc">Total HT</span>
              <span className="font-black text-textc">{quote.totalHT.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
          {selectedDeadline.id in DEADLINE_NOTES && (
            <p className={`text-xs mt-3 pt-3 border-t border-white/8 ${DEADLINE_NOTES[selectedDeadline.id].color}`}>
              {DEADLINE_NOTES[selectedDeadline.id].text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
