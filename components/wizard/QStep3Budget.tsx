"use client";
// OSIRIS CRM — pricing configurator: pré-qualification — budget client

import { useConfigurator } from "./ConfiguratorShell";

const CLIENT_BUDGET_RANGES = [
  { id: "under-1k",  label: "Moins de 1 000 €"      },
  { id: "1k-2k",     label: "1 000 – 2 000 €"       },
  { id: "2k-5k",     label: "2 000 – 5 000 €"       },
  { id: "5k-10k",    label: "5 000 – 10 000 €"      },
  { id: "10k-plus",  label: "Plus de 10 000 €"      },
  { id: "flexible",  label: "Budget flexible / open" },
];

export function QStep3Budget() {
  const { data, update, quote } = useConfigurator();

  return (
    <div className="py-4 max-w-2xl">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Budget du client</h2>
      <p className="text-sm text-muted mb-6">
        Ce que le client annonce et ce qu'il imagine payer — avant de voir votre devis.
      </p>

      {/* Budget range client */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
          Budget global annoncé
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CLIENT_BUDGET_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => update({ clientBudgetRange: r.id })}
              className={`
                px-3 py-3 rounded-xl border text-sm text-left transition-all
                ${data.clientBudgetRange === r.id
                  ? "border-accent/50 bg-accent/8 text-accent font-semibold"
                  : "border-white/8 bg-surface2 text-muted hover:border-white/20 hover:text-textc"
                }
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Devis propre client */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">
          Son propre chiffrage (optionnel)
        </p>
        <p className="text-xs text-faint mb-3">
          Ce que le client pense que ça devrait coûter — utile pour cadrer les attentes.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            step={100}
            value={data.clientOwnEstimate ?? ""}
            onChange={(e) =>
              update({ clientOwnEstimate: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="Ex : 1500"
            className="
              flex-1 h-10 px-3 rounded-[10px]
              bg-surface2 border border-white/8
              text-sm text-textc placeholder:text-faint
              outline-none focus:border-accent/40 transition-colors
            "
          />
          <span className="text-sm text-muted shrink-0">€ HT</span>
        </div>

        {/* Comparatif live avec le devis Osiris */}
        {data.clientOwnEstimate !== null && quote.totalHT > 0 && (
          <div className="mt-3 rounded-lg bg-surface2 border border-white/8 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">Son estimation</span>
              <span className="text-textc font-semibold">
                {data.clientOwnEstimate.toLocaleString("fr-FR")} €
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted">Devis Osiris HT</span>
              <span className="text-accent font-semibold">
                {quote.totalHT.toLocaleString("fr-FR")} €
              </span>
            </div>
            {data.clientOwnEstimate > 0 && (
              <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-white/8">
                <span className="text-muted">Écart</span>
                <span
                  className={`font-bold ${
                    quote.totalHT > data.clientOwnEstimate
                      ? "text-orange-400"
                      : "text-emerald-400"
                  }`}
                >
                  {quote.totalHT > data.clientOwnEstimate ? "+" : ""}
                  {(quote.totalHT - data.clientOwnEstimate).toLocaleString("fr-FR")} €
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes additionnelles */}
      <div className="rounded-xl border border-white/8 bg-surface p-5">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
          Contexte budgétaire (optionnel)
        </p>
        <textarea
          value={data.clientBudgetNotes}
          onChange={(e) => update({ clientBudgetNotes: e.target.value })}
          placeholder="Ex : Le client cherche à financer via un prêt. Il veut du paiement en 3 fois. Il attend la validation de son subside région."
          rows={3}
          className="
            w-full px-3 py-2.5 rounded-[10px]
            bg-surface2 border border-white/8
            text-sm text-textc placeholder:text-faint
            outline-none focus:border-accent/40 transition-colors resize-none
          "
        />
      </div>
    </div>
  );
}
