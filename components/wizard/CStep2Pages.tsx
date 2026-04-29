"use client";
// OSIRIS CRM — pricing configurator

import { Minus, Plus } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { EXTRA_PAGE_PRICE } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

const PRESETS = [0, 1, 2, 3, 5, 8, 10, 15, 20];

export function CStep2Pages() {
  const { data, update } = useConfigurator();
  const n    = data.extraPages;
  const cost = n * EXTRA_PAGE_PRICE;

  const set = (val: number) => update({ extraPages: Math.max(0, Math.min(20, val)) });

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Pages supplémentaires</h2>
      <p className="text-sm text-muted mb-6">
        Combien de pages supplémentaires souhaitez-vous ajouter au-delà de l'offre de base ?
      </p>

      {/* Tarif fixe */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
          <span className="text-xs text-muted">Tarif</span>
          <span className="text-xs font-semibold text-accent">{EXTRA_PAGE_PRICE} €/page</span>
        </div>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={() => set(n - 1)}
          disabled={n === 0}
          className="w-11 h-11 rounded-xl border border-white/8 bg-surface2 flex items-center justify-center text-textc hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus size={16} />
        </button>

        <div className="flex-1 text-center">
          <span className="text-4xl font-black text-textc font-display tabular-nums">{n}</span>
          <p className="text-xs text-muted mt-0.5">page{n > 1 ? "s" : ""}</p>
        </div>

        <button
          onClick={() => set(n + 1)}
          disabled={n === 20}
          className="w-11 h-11 rounded-xl border border-white/8 bg-surface2 flex items-center justify-center text-textc hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => set(p)}
            className={`
              h-9 px-3 rounded-lg text-xs font-medium transition-all
              ${n === p
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-surface2 text-muted border border-white/8 hover:border-white/20 hover:text-textc"
              }
            `}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Sous-total */}
      {n > 0 && (
        <div className="rounded-xl border border-white/8 bg-surface2 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted">
            {n} page{n > 1 ? "s" : ""} supplémentaire{n > 1 ? "s" : ""} × {EXTRA_PAGE_PRICE} €
          </span>
          <span className="text-sm font-bold text-textc">+{formatPrice(cost)}</span>
        </div>
      )}
    </div>
  );
}
