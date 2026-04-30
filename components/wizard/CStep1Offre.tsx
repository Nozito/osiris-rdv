"use client";
// OSIRIS CRM — pricing configurator

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { SITE_TYPES, UPGRADE_EMPIRE_OPTIONS, UPGRADE_BUSINESS_OPTIONS } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

export function CStep1Offre() {
  const { data, update } = useConfigurator();

  const handleSelect = (id: string) => {
    const upgradesToKeep = data.selectedUpgrades.filter((uid) => {
      if (id === "vitrine-premium") return false;
      if (id === "vitrine-standard") return UPGRADE_EMPIRE_OPTIONS.some((o) => o.id === uid);
      return (
        UPGRADE_BUSINESS_OPTIONS.some((o) => o.id === uid) ||
        UPGRADE_EMPIRE_OPTIONS.some((o) => o.id === uid)
      );
    });
    update({ siteTypeId: id, selectedUpgrades: upgradesToKeep });
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Choisissez votre offre</h2>
      <p className="text-sm text-muted mb-6">Sélectionnez l'offre de base qui correspond au projet.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SITE_TYPES.map((site) => {
          const selected = data.siteTypeId === site.id;
          const isPurple = site.color === "purple";

          const selectedBorder = isPurple
            ? "border-purple-400/50 bg-purple-400/8 shadow-[0_0_0_1px_rgba(192,132,252,0.3),0_4px_24px_-4px_rgba(192,132,252,0.2)]"
            : "border-accent/50 bg-accent/8 shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_4px_24px_-4px_rgba(37,99,235,0.25)]";

          return (
            <button
              key={site.id}
              onClick={() => handleSelect(site.id)}
              className={`
                relative text-left p-5 rounded-xl border transition-all duration-150
                hover:scale-[1.02] active:scale-[0.97]
                ${selected
                  ? selectedBorder
                  : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                }
              `}
            >
              {/* Badge */}
              {site.badge && (
                <span className={`
                  absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${isPurple
                    ? "bg-purple-400/15 text-purple-300 border border-purple-400/20"
                    : "bg-accent/15 text-accent border border-accent/20"
                  }
                `}>
                  {site.badge}
                </span>
              )}

              {/* Check */}
              {selected && (
                <span className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${isPurple ? "bg-purple-400" : "bg-accent"}`}>
                  <Check size={11} className="text-white" />
                </span>
              )}

              <div className={site.badge ? "mt-5" : ""}>
                <p className={`text-sm font-bold mb-0.5 ${selected ? (isPurple ? "text-purple-300" : "text-accent") : "text-textc"}`}>
                  {site.label}
                </p>
                <p className="text-xs text-muted mb-3">{site.sublabel}</p>
                <p className={`text-2xl font-black font-display ${selected ? (isPurple ? "text-purple-300" : "text-accent") : "text-textc"}`}>
                  {formatPrice(site.price)}
                </p>
                <p className="text-[10px] text-faint mt-0.5 mb-3">HT</p>

                <ul className="flex flex-col gap-1.5">
                  {site.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted">
                      <Check size={10} className={`shrink-0 ${selected ? (isPurple ? "text-purple-400" : "text-accent") : "text-emerald-500/60"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
