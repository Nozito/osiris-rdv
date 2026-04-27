"use client";
// OSIRIS CRM — pricing configurator

import { Check } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { UPGRADE_BUSINESS_OPTIONS, UPGRADE_EMPIRE_OPTIONS } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

function UpgradeRow({
  id,
  label,
  price,
  selected,
  onToggle,
}: {
  id: string;
  label: string;
  price: number;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150
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
        {label}
      </span>
      <span className={`text-sm font-semibold shrink-0 ${selected ? "text-accent" : "text-textc"}`}>
        +{formatPrice(price)}
      </span>
    </button>
  );
}

export function CStep3Upgrade() {
  const { data, update } = useConfigurator();
  const { siteTypeId, selectedUpgrades } = data;

  const showBusiness = siteTypeId === "vitrine-simple";
  const showEmpire = siteTypeId === "vitrine-simple" || siteTypeId === "vitrine-standard";

  const toggle = (id: string) => {
    update({
      selectedUpgrades: selectedUpgrades.includes(id)
        ? selectedUpgrades.filter((u) => u !== id)
        : [...selectedUpgrades, id],
    });
  };

  if (!showBusiness && !showEmpire) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted text-sm">Aucun upgrade disponible pour cette offre.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Upgrades optionnels</h2>
      <p className="text-sm text-muted mb-6">Enrichissez votre offre avec des options supplémentaires.</p>

      {/* OSIRIS CRM — pricing configurator: Business upgrades (vitrine-simple only) */}
      {showBusiness && (
        <div className="mb-6">
          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-3">
            Upgrades Business
          </p>
          <div className="flex flex-col gap-2">
            {UPGRADE_BUSINESS_OPTIONS.map((opt) => (
              <UpgradeRow
                key={opt.id}
                {...opt}
                selected={selectedUpgrades.includes(opt.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* OSIRIS CRM — pricing configurator: Empire upgrades (vitrine-simple OR vitrine-standard) */}
      {showEmpire && (
        <div>
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
            Upgrades Empire
          </p>
          <div className="flex flex-col gap-2">
            {UPGRADE_EMPIRE_OPTIONS.map((opt) => (
              <UpgradeRow
                key={opt.id}
                {...opt}
                selected={selectedUpgrades.includes(opt.id)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
