"use client";
// OSIRIS CRM — pricing configurator

import { useState } from "react";
import { PenSquare } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import { DiscountPanel } from "@/components/DiscountPanel";
import {
  SITE_TYPES,
  UPGRADE_BUSINESS_OPTIONS,
  UPGRADE_EMPIRE_OPTIONS,
  UNIVERSAL_OPTIONS,
  DEADLINES,
} from "@/lib/configurator-pricing";
import { Button } from "@/components/ui/Button";

function Line({
  label,
  value,
  bold,
  accent,
  amber,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  amber?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${bold ? "pt-2 mt-1 border-t border-white/8" : ""}`}>
      <span className={`text-sm ${bold ? "font-semibold text-textc" : "text-muted"}`}>{label}</span>
      <span
        className={`text-sm font-semibold shrink-0 ${
          accent ? "text-accent" : amber ? "text-amber-400" : bold ? "text-textc" : "text-textc"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function CStep6Recap() {
  const { data, update, quote, navigate, validate, saving, leadId } = useConfigurator();
  const [discountApplied, setDiscountApplied] = useState(data.discountPercent > 0);

  const siteType   = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const deadline   = DEADLINES.find((d) => d.id === data.deadlineId);
  const allUpgOpts = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];

  const fmt = (n: number) => n.toLocaleString("fr-FR") + " €";

  return (
    <div className="py-4 max-w-2xl">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Récapitulatif du devis</h2>
      <p className="text-sm text-muted mb-6">Vérifiez votre configuration avant de valider.</p>

      {/* ── Price breakdown ─────────────────────────────────── */}
      {/* OSIRIS CRM — pricing configurator: full line-by-line breakdown */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 flex flex-col gap-2 mb-5">
        <Line label={siteType?.label ?? "Offre"} value={fmt(quote.basePrice)} />

        {quote.extraPagesPrice > 0 && (
          <Line
            label={`Pages supplémentaires (×${data.extraPages})`}
            value={`+${fmt(quote.extraPagesPrice)}`}
          />
        )}

        {quote.upgradesPrice > 0 && (
          <>
            {data.selectedUpgrades.map((id) => {
              const opt = allUpgOpts.find((o) => o.id === id);
              if (!opt) return null;
              return <Line key={id} label={opt.label} value={`+${fmt(opt.price)}`} />;
            })}
          </>
        )}

        {quote.universalPrice > 0 && (
          <>
            {data.selectedUniversal.map((id) => {
              const opt = UNIVERSAL_OPTIONS.find((o) => o.id === id);
              if (!opt) return null;
              return <Line key={id} label={opt.label} value={`+${fmt(opt.price)}`} />;
            })}
          </>
        )}

        <Line label="Sous-total HT" value={fmt(quote.subtotalHT)} bold />

        {quote.deadlineSurcharge > 0 && (
          <Line
            label={`Délai ${deadline?.label ?? ""} (+${Math.round((deadline?.rate ?? 0) * 100)}%)`}
            value={`+${fmt(quote.deadlineSurcharge)}`}
          />
        )}

        <Line label="Total HT" value={fmt(quote.totalHT)} bold />

        {quote.discountAmount > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-red-400">Remise –{quote.discountPercent}%</span>
            <span className="text-sm font-semibold text-red-400">–{fmt(quote.discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-3 mt-1 border-t border-white/8">
          <span className="text-base font-bold text-textc">Total HT</span>
          <span className="text-2xl font-black text-textc font-display">
            {fmt(quote.totalTTC)}
          </span>
        </div>

        {/* Maintenance mensuelle — hors totalTTC */}
        {data.wantsUnlimited && (
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-sm text-amber-400/80">+ Maintenance & Mises à jour</span>
            <span className="text-sm font-bold text-amber-400">+39 €/mois</span>
          </div>
        )}
      </div>

      {/* ── Client info form ─────────────────────────────────── */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-6">
        <p className="text-sm font-semibold text-textc mb-4">Informations client</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              { key: "clientFirstName", label: "Prénom",    placeholder: "Jean",              type: "text"  },
              { key: "clientLastName",  label: "Nom",       placeholder: "Dupont",            type: "text"  },
              { key: "clientEmail",     label: "Email",     placeholder: "jean@example.com",  type: "email" },
              { key: "clientPhone",     label: "Téléphone", placeholder: "+33 6 00 00 00 00", type: "tel"   },
            ] as const
          ).map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1">{label}</label>
              <input
                type={type}
                value={data[key]}
                onChange={(e) => update({ [key]: e.target.value })}
                placeholder={placeholder}
                className="
                  w-full h-9 px-3 rounded-[10px]
                  bg-surface2 border border-white/8
                  text-sm text-textc placeholder:text-faint
                  outline-none focus:border-accent/40 transition-colors
                "
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Remise ──────────────────────────────────────────── */}
      <DiscountPanel
        discountPercent={data.discountPercent}
        discountReason={data.discountReason}
        discountConditions={data.discountConditions}
        totalHT={quote.totalHT}
        onChangePercent={(v) => update({ discountPercent: v })}
        onChangeReason={(v) => update({ discountReason: v })}
        onChangeConditions={(v) => update({ discountConditions: v })}
        onApply={() => setDiscountApplied(true)}
        applied={discountApplied}
      />

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(0)}
          icon={<PenSquare size={13} />}
        >
          Modifier le devis
        </Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={validate}
        >
          {leadId ? "Mettre à jour" : "Valider le devis"}
        </Button>
      </div>
    </div>
  );
}
