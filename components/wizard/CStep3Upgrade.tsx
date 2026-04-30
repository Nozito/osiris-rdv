"use client";
// OSIRIS CRM — pricing configurator

import { Check, CheckCircle2 } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { UPGRADE_BUSINESS_OPTIONS, UPGRADE_EMPIRE_OPTIONS } from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";

function UpgradeRow({
  id,
  label,
  sublabel,
  price,
  selected,
  onToggle,
}: {
  id: string;
  label: string;
  sublabel?: string;
  price: number;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-100
        hover:scale-[1.02] active:scale-[0.97]
        ${selected
          ? "border-accent/40 bg-accent/8 shadow-[0_0_0_1px_rgba(37,99,235,0.4),0_4px_24px_-4px_rgba(37,99,235,0.25)]"
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
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${selected ? "text-textc font-medium" : "text-muted"}`}>
          {label}
        </span>
        {sublabel && <p className="text-xs text-faint mt-0.5">{sublabel}</p>}
      </div>
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
      <div className="py-4">
        <h2 className="text-lg font-bold text-textc font-display mb-1">Upgrades optionnels</h2>
        <p className="text-sm text-muted mb-6">Enrichissez votre offre avec des options supplémentaires.</p>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-6 flex items-start gap-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-300 mb-1">
              Toutes les fonctionnalités premium sont incluses
            </p>
            <p className="text-xs text-emerald-400/70">
              L'offre Elite intègre déjà les animations avancées, le SEO technique et le support prioritaire. Aucun upgrade nécessaire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Upgrades optionnels</h2>
      <p className="text-sm text-muted mb-6">Enrichissez votre offre avec des options supplémentaires.</p>

      {/* Business tier */}
      {showBusiness && (
        <div className="mb-6">
          <div className="rounded-t-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 flex items-center gap-2">
            <span className="text-sm">🚀</span>
            <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Business</span>
            <span className="text-xs text-blue-400/60 ml-1">— Pour les sites Starter</span>
          </div>
          <div className="flex flex-col gap-2 border border-t-0 border-blue-500/20 rounded-b-xl p-3">
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

      {/* Empire tier */}
      {showEmpire && (
        <div>
          <div className="rounded-t-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 flex items-center gap-2">
            <span className="text-sm">👑</span>
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Empire</span>
            <span className="text-xs text-purple-400/60 ml-1">— Starter & Pro</span>
          </div>
          <div className="flex flex-col gap-2 border border-t-0 border-purple-500/20 rounded-b-xl p-3">
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
