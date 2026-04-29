"use client";
// OSIRIS CRM — panneau de remise / négociation

import { AlertTriangle, Percent, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MAX_DISCOUNT = 30;

interface DiscountPanelProps {
  discountPercent:    number;
  discountReason:     string;
  discountConditions: string;
  totalHT:            number;
  onChangePercent:    (v: number) => void;
  onChangeReason:     (v: string) => void;
  onChangeConditions: (v: string) => void;
  onApply:            () => void;
  applied:            boolean;
}

export function DiscountPanel({
  discountPercent,
  discountReason,
  discountConditions,
  totalHT,
  onChangePercent,
  onChangeReason,
  onChangeConditions,
  onApply,
  applied,
}: DiscountPanelProps) {
  const discountAmount = Math.round(totalHT * (discountPercent / 100));
  const canApply       = discountReason.trim().length > 0;

  return (
    <div className="rounded-xl border border-white/8 bg-surface p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Tag size={15} className="text-accent" />
        <span className="text-sm font-semibold text-textc">Remise commerciale</span>
        {applied && discountPercent > 0 && (
          <span className="ml-auto text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            –{discountPercent}%
          </span>
        )}
      </div>

      {/* Avertissement — non supprimable */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 p-3">
        <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-300/80 leading-relaxed">
          ⚠️ Une remise accordée trop vite peut dévaloriser l'offre. Assurez-vous d'avoir une raison légitime.
        </p>
      </div>

      {/* Slider + input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted">Remise</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={MAX_DISCOUNT}
              step={0.5}
              value={discountPercent}
              onChange={(e) => onChangePercent(Math.min(MAX_DISCOUNT, Math.max(0, parseFloat(e.target.value) || 0)))}
              className="w-14 h-7 px-2 rounded-[8px] bg-surface2 border border-white/8 text-sm text-textc text-right outline-none focus:border-accent/40 transition-colors"
            />
            <Percent size={12} className="text-muted" />
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_DISCOUNT}
          step={0.5}
          value={discountPercent}
          onChange={(e) => onChangePercent(parseFloat(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-[10px] text-faint mt-1">
          <span>0%</span>
          <span className="text-accent font-medium">
            {discountPercent > 0 ? `– ${discountAmount.toLocaleString("fr-FR")} €` : "—"}
          </span>
          <span>{MAX_DISCOUNT}%</span>
        </div>
      </div>

      {/* Raison — requise */}
      <div>
        <label className="block text-xs text-muted mb-1">
          Raison de la remise <span className="text-red-400">*</span>
        </label>
        <textarea
          value={discountReason}
          onChange={(e) => onChangeReason(e.target.value)}
          placeholder="Ex : client fidèle, paiement anticipé, projet pilote…"
          rows={2}
          className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none"
        />
      </div>

      {/* Conditions — optionnel */}
      <div>
        <label className="block text-xs text-muted mb-1">Conditions (optionnel)</label>
        <textarea
          value={discountConditions}
          onChange={(e) => onChangeConditions(e.target.value)}
          placeholder="Ex : valable si signé avant le 30/04"
          rows={2}
          className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none"
        />
      </div>

      <Button
        variant={applied ? "ghost" : "primary"}
        size="sm"
        disabled={!canApply}
        onClick={onApply}
        icon={<Tag size={13} />}
      >
        {applied ? "Remise appliquée" : "Appliquer la remise"}
      </Button>
    </div>
  );
}
