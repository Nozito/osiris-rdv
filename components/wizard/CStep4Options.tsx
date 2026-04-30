"use client";
// OSIRIS CRM — pricing configurator

import {
  Check, Repeat, Minus, Plus,
  FileText, Calendar, Lock, ClipboardList, Calculator, MousePointer,
  Zap, ArrowRight, Box, Globe, Shield,
} from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import {
  UNIVERSAL_OPTIONS,
  OPTION_CATEGORIES,
  MAINTENANCE_LABEL,
  MAINTENANCE_SUBLABEL,
  MAINTENANCE_MONTHLY_PRICE,
} from "@/lib/configurator-pricing";
import { formatPrice } from "@/lib/pricing";
import type { ReactNode } from "react";

const ICON_MAP: Record<string, ReactNode> = {
  FileText:     <FileText     size={14} />,
  Calendar:     <Calendar     size={14} />,
  Lock:         <Lock         size={14} />,
  ClipboardList:<ClipboardList size={14} />,
  Calculator:   <Calculator   size={14} />,
  MousePointer: <MousePointer size={14} />,
  Zap:          <Zap          size={14} />,
  ArrowRight:   <ArrowRight   size={14} />,
  Box:          <Box          size={14} />,
  Globe:        <Globe        size={14} />,
  Shield:       <Shield       size={14} />,
};

const CATEGORY_COLOR: Record<string, string> = {
  blue:    "text-blue-300",
  purple:  "text-purple-300",
  emerald: "text-emerald-300",
};

export function CStep4Options() {
  const { data, update } = useConfigurator();
  const { selectedUniversal, wantsUnlimited, multilangCount } = data;

  const toggle = (id: string) => {
    const next = selectedUniversal.includes(id)
      ? selectedUniversal.filter((u) => u !== id)
      : [...selectedUniversal, id];
    const patch: Parameters<typeof update>[0] = { selectedUniversal: next };
    if (id === "multilang" && selectedUniversal.includes(id)) patch.multilangCount = 0;
    update(patch);
  };

  const setMultilangCount = (n: number) =>
    update({ multilangCount: Math.max(0, Math.min(10, n)) });

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Options universelles</h2>
      <p className="text-sm text-muted mb-6">Ces options sont disponibles pour toutes les offres.</p>

      {OPTION_CATEGORIES.map((cat) => {
        const options = UNIVERSAL_OPTIONS.filter((o) => o.category === cat.id);
        const colorClass = CATEGORY_COLOR[cat.color] ?? "text-muted";
        return (
          <div key={cat.id} className="mb-6">
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${colorClass}`}>
              {cat.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt) => {
                const selected = selectedUniversal.includes(opt.id);
                const isMultilang = opt.id === "multilang";
                const icon = ICON_MAP[opt.icon];
                const hasPrice = 'price' in opt && (opt as {price: number}).price > 0;

                return (
                  <div
                    key={opt.id}
                    className={`rounded-xl border transition-all duration-150 ${
                      selected
                        ? "border-accent/40 bg-accent/8"
                        : "border-white/8 bg-surface hover:border-white/20 hover:bg-surface2"
                    } ${isMultilang && selected ? "sm:col-span-2" : ""}`}
                  >
                    <button
                      onClick={() => toggle(opt.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform duration-100"
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${selected ? "bg-accent border-accent" : "border-white/20 bg-surface2"}`}>
                        {selected && <Check size={11} className="text-white" />}
                      </div>
                      {icon && (
                        <span className={`shrink-0 ${selected ? "text-accent" : "text-faint"}`}>
                          {icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${selected ? "text-textc" : "text-muted"}`}>
                          {opt.label}
                        </p>
                        {"sublabel" in opt && opt.sublabel && (
                          <p className="text-xs text-faint mt-0.5">{opt.sublabel}</p>
                        )}
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${selected ? "text-accent" : "text-textc"}`}>
                        {isMultilang
                          ? (selected && multilangCount > 0
                            ? `+${formatPrice(multilangCount * 25)}`
                            : "Gratuit")
                          : (hasPrice ? `+${formatPrice((opt as {price: number}).price)}` : "Gratuit")}
                      </span>
                    </button>

                    {/* Compteur langues supplémentaires */}
                    {isMultilang && selected && (
                      <div className="px-4 pb-3 flex items-center gap-3 border-t border-white/8 pt-3">
                        <p className="text-xs text-muted flex-1">
                          1 langue incluse
                          {multilangCount > 0 && (
                            <span className="text-accent ml-1">
                              + {multilangCount} langue{multilangCount > 1 ? "s" : ""} × 25 €
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMultilangCount(multilangCount - 1)}
                            disabled={multilangCount === 0}
                            className="w-7 h-7 rounded-lg border border-white/8 bg-surface2 flex items-center justify-center text-textc hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold text-textc w-4 text-center tabular-nums">
                            {multilangCount}
                          </span>
                          <button
                            onClick={() => setMultilangCount(multilangCount + 1)}
                            disabled={multilangCount === 10}
                            className="w-7 h-7 rounded-lg border border-white/8 bg-surface2 flex items-center justify-center text-textc hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Maintenance mensuelle */}
      <div className="mb-2">
        <p className="text-[10px] font-bold text-faint uppercase tracking-widest mb-3">Maintenance</p>
        <button
          onClick={() => update({ wantsUnlimited: !wantsUnlimited })}
          className={`
            w-full flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-all duration-150
            hover:scale-[1.01] active:scale-[0.99]
            ${wantsUnlimited
              ? "border-amber-400/40 bg-amber-400/8"
              : "border-white/8 bg-surface hover:border-amber-400/20 hover:bg-surface2"
            }
          `}
        >
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${wantsUnlimited ? "bg-amber-400 border-amber-400" : "border-white/20 bg-surface2"}`}>
            {wantsUnlimited && <Check size={11} className="text-black" />}
          </div>
          <Repeat size={14} className={wantsUnlimited ? "text-amber-400 shrink-0" : "text-faint shrink-0"} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${wantsUnlimited ? "text-amber-300" : "text-muted"}`}>
              {MAINTENANCE_LABEL}
            </p>
            <p className="text-xs text-faint mt-0.5">{MAINTENANCE_SUBLABEL}</p>
          </div>
          <span className={`text-sm font-bold shrink-0 ${wantsUnlimited ? "text-amber-400" : "text-textc"}`}>
            +{MAINTENANCE_MONTHLY_PRICE} €/mois
          </span>
        </button>
      </div>
    </div>
  );
}
