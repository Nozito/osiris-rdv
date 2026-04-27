"use client";
// OSIRIS CRM — pricing configurator

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { SITE_TYPES, UPGRADE_EMPIRE_OPTIONS, UPGRADE_BUSINESS_OPTIONS } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

export function CStep1Offre() {
  const { data, update } = useConfigurator();

  const handleSelect = (id: string) => {
    // OSIRIS CRM — pricing configurator: clear incompatible upgrades on site type change
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
      <p className="text-sm text-muted mb-6">Sélectionnez l'offre de base qui correspond à votre projet.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SITE_TYPES.map((site) => {
          const selected = data.siteTypeId === site.id;
          return (
            <button
              key={site.id}
              onClick={() => handleSelect(site.id)}
              className={`
                relative text-left p-5 rounded-xl border transition-all duration-150
                ${selected
                  ? "border-accent/50 bg-accent/8 shadow-[0_0_20px_-4px_rgba(37,99,235,0.2)]"
                  : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                }
              `}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </span>
              )}
              <p className={`text-sm font-bold mb-1 ${selected ? "text-accent" : "text-textc"}`}>
                {site.label}
              </p>
              <p className="text-xs text-muted mb-3">{site.sublabel}</p>
              <p className={`text-2xl font-black font-display ${selected ? "text-accent" : "text-textc"}`}>
                {formatPrice(site.price)}
              </p>
              <p className="text-[10px] text-faint mt-0.5">HT</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
