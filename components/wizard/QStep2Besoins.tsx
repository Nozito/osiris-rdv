"use client";
// OSIRIS CRM — pricing configurator: pré-qualification — besoins & objectifs

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";

const OBJECTIVES = [
  { id: "leads",     label: "Générer des leads / contacts"  },
  { id: "sell",      label: "Vendre en ligne"               },
  { id: "showcase",  label: "Présenter services / portfolio"},
  { id: "cred",      label: "Renforcer la crédibilité"      },
  { id: "seo",       label: "Améliorer le référencement"    },
  { id: "replace",   label: "Remplacer l'ancien site"       },
  { id: "notif",     label: "Informer / fidéliser"          },
  { id: "other",     label: "Autre"                         },
];

export function QStep2Besoins() {
  const { data, update } = useConfigurator();

  const toggleObjective = (id: string) => {
    const current = data.clientObjectives;
    update({
      clientObjectives: current.includes(id)
        ? current.filter((o) => o !== id)
        : [...current, id],
    });
  };

  return (
    <div className="py-4 max-w-2xl">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Besoins & objectifs</h2>
      <p className="text-sm text-muted mb-6">Qu'est-ce que le client cherche à accomplir avec ce projet ?</p>

      {/* Objectifs multi-select */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Objectifs principaux</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {OBJECTIVES.map((obj) => {
            const selected = data.clientObjectives.includes(obj.id);
            return (
              <button
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all
                  ${selected
                    ? "border-accent/40 bg-accent/8"
                    : "border-white/8 bg-surface2 hover:border-white/20"
                  }
                `}
              >
                <div
                  className={`
                    w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all
                    ${selected ? "bg-accent border-accent" : "border-white/20 bg-surface"}
                  `}
                >
                  {selected && <Check size={11} className="text-white" />}
                </div>
                <span className={`text-sm ${selected ? "text-textc font-medium" : "text-muted"}`}>
                  {obj.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description libre */}
      <div className="rounded-xl border border-white/8 bg-surface p-5">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
          Description des besoins
        </p>
        <p className="text-xs text-faint mb-2">
          Problème principal, contexte, contraintes spécifiques, délai souhaité…
        </p>
        <textarea
          value={data.clientNeeds}
          onChange={(e) => update({ clientNeeds: e.target.value })}
          placeholder="Ex : Notre site actuel est lent, peu mobile-friendly, et on perd des clients. On veut refondre avec une galerie, un formulaire de contact et du SEO local avant l'été."
          rows={5}
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
