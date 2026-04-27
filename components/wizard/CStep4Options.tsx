"use client";
// OSIRIS CRM — pricing configurator

import { Check, Repeat } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { UNIVERSAL_OPTIONS } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

export function CStep4Options() {
  const { data, update } = useConfigurator();
  const { selectedUniversal, wantsUnlimited } = data;

  const toggle = (id: string) => {
    update({
      selectedUniversal: selectedUniversal.includes(id)
        ? selectedUniversal.filter((u) => u !== id)
        : [...selectedUniversal, id],
    });
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Options universelles</h2>
      <p className="text-sm text-muted mb-6">Ces options sont disponibles pour toutes les offres.</p>

      {/* 9 universal options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
        {UNIVERSAL_OPTIONS.map((opt) => {
          const selected = selectedUniversal.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150
                ${selected
                  ? "border-accent/40 bg-accent/8"
                  : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                }
              `}
            >
              <div
                className={`
                  w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all
                  ${selected ? "bg-accent border-accent" : "border-white/20 bg-surface2"}
                `}
              >
                {selected && <Check size={11} className="text-white" />}
              </div>
              <span className={`flex-1 text-sm ${selected ? "text-textc font-medium" : "text-muted"}`}>
                {opt.label}
              </span>
              <span className={`text-sm font-semibold shrink-0 ${selected ? "text-accent" : "text-textc"}`}>
                +{formatPrice(opt.price)}
              </span>
            </button>
          );
        })}
      </div>

      {/* OSIRIS CRM — pricing configurator: Modifications illimitées — NOT in calcQuote, displayed separately in amber */}
      <button
        onClick={() => update({ wantsUnlimited: !wantsUnlimited })}
        className={`
          w-full flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-all duration-150
          ${wantsUnlimited
            ? "border-amber-400/40 bg-amber-400/8"
            : "border-white/8 bg-surface hover:border-amber-400/20 hover:bg-surface2"
          }
        `}
      >
        <div
          className={`
            w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all
            ${wantsUnlimited ? "bg-amber-400 border-amber-400" : "border-white/20 bg-surface2"}
          `}
        >
          {wantsUnlimited && <Check size={11} className="text-black" />}
        </div>
        <Repeat size={14} className={wantsUnlimited ? "text-amber-400 shrink-0" : "text-faint shrink-0"} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${wantsUnlimited ? "text-amber-300" : "text-muted"}`}>
            Modifications illimitées
          </p>
          <p className="text-xs text-faint mt-0.5">Jusqu'à mise en ligne — abonnement mensuel</p>
        </div>
        <span className={`text-sm font-bold shrink-0 ${wantsUnlimited ? "text-amber-400" : "text-textc"}`}>
          +19,90 €/mois
        </span>
      </button>
    </div>
  );
}
