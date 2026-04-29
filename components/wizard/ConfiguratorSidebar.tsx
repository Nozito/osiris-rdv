"use client";
// OSIRIS CRM — sidebar live configurateur (col 3 du layout desktop 3 colonnes)

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Sparkles, ChevronRight } from "lucide-react";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import {
  SITE_TYPES,
  UPGRADE_BUSINESS_OPTIONS,
  UPGRADE_EMPIRE_OPTIONS,
  UNIVERSAL_OPTIONS,
} from "@/lib/configurator-pricing";
import { useConfigurator } from "./ConfiguratorShell";

export function ConfiguratorSidebar() {
  const { data, quote } = useConfigurator();
  const [presenting, setPresenting] = useState(false);

  const siteType   = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const allUpgOpts = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];

  const lineItems: { label: string; price: number }[] = [];
  if (siteType) lineItems.push({ label: siteType.label, price: quote.basePrice });
  if (quote.extraPagesPrice > 0)
    lineItems.push({ label: `Pages supp. ×${data.extraPages}`, price: quote.extraPagesPrice });
  data.selectedUpgrades.forEach((id) => {
    const opt = allUpgOpts.find((o) => o.id === id);
    if (opt) lineItems.push({ label: opt.label, price: opt.price });
  });
  data.selectedUniversal.forEach((id) => {
    const opt = UNIVERSAL_OPTIONS.find((o) => o.id === id);
    if (!opt) return;
    if (id === "multilang") {
      const mlPrice = (data.multilangCount ?? 0) * 25;
      const mlLabel = (data.multilangCount ?? 0) > 0
        ? `Multi-langue (${data.multilangCount} supp.)`
        : "Multi-langue (1 incluse)";
      lineItems.push({ label: mlLabel, price: mlPrice });
    } else {
      lineItems.push({ label: opt.label, price: (opt as { price: number }).price });
    }
  });

  const clientName = [data.clientFirstName, data.clientLastName].filter(Boolean).join(" ");

  return (
    <>
      <aside className="w-72 shrink-0 flex flex-col gap-3 sticky top-20 self-start">
        <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8 flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-semibold text-textc font-display">Estimation live</span>
          </div>

          {clientName && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] text-faint">Client</p>
              <p className="text-sm font-semibold text-textc">{clientName}</p>
            </div>
          )}

          <div className="px-4 py-3 flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {lineItems.length === 0 ? (
                <p className="text-[11px] text-faint text-center py-2">
                  Configurez votre projet
                </p>
              ) : (
                lineItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <ChevronRight size={10} className="text-faint shrink-0" />
                      <span className="text-[11px] text-muted truncate">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-medium text-textc shrink-0">
                      {item.price.toLocaleString("fr-FR")} €
                    </span>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {quote.subtotalHT > 0 && (
            <div className="px-4 py-3 border-t border-white/8 bg-surface2 flex flex-col gap-1">
              {quote.deadlineSurcharge > 0 && (
                <div className="flex justify-between text-[11px] text-muted">
                  <span>Délai</span>
                  <span>+{quote.deadlineSurcharge.toLocaleString("fr-FR")} €</span>
                </div>
              )}
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-[11px] text-red-400">
                  <span>Remise –{quote.discountPercent}%</span>
                  <span>–{quote.discountAmount.toLocaleString("fr-FR")} €</span>
                </div>
              )}
              <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-white/8">
                <span className="text-xs text-muted">Total HT</span>
                <AnimatedPrice
                  value={quote.totalTTC}
                  suffix=" €"
                  className="text-lg font-bold text-textc font-display"
                />
              </div>
              {data.wantsUnlimited && (
                <p className="text-[10px] text-amber-400">+39 €/mois (maintenance)</p>
              )}
            </div>
          )}
        </div>

        {/* Bouton présentation client */}
        {quote.totalTTC > 0 && (
          <button
            onClick={() => setPresenting(true)}
            className="flex items-center justify-center gap-2 h-9 rounded-[10px] bg-surface border border-white/8 text-xs text-muted hover:text-textc hover:border-accent/30 transition-all"
          >
            <Eye size={13} />
            Montrer au client
          </button>
        )}
      </aside>

      {/* Mode présentation fullscreen */}
      <AnimatePresence>
        {presenting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#08081a] flex flex-col items-center justify-center px-8"
          >
            <button
              onClick={() => setPresenting(false)}
              className="absolute top-5 right-5 text-faint hover:text-textc transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center max-w-md w-full">
              <p className="text-sm text-muted mb-1 uppercase tracking-wider font-bold">
                OSIRIS — Proposition commerciale
              </p>
              {clientName && (
                <p className="text-2xl font-bold text-textc mb-6">{clientName}</p>
              )}

              {siteType && (
                <p className="text-xl font-semibold text-textc mb-1">{siteType.label}</p>
              )}

              {lineItems.length > 1 && (
                <div className="flex flex-col gap-1 mb-6 mt-3">
                  {lineItems.slice(1).map((item) => (
                    <div key={item.label} className="flex justify-between text-sm text-muted gap-4">
                      <span>{item.label}</span>
                      <span className="font-medium text-textc">+{item.price.toLocaleString("fr-FR")} €</span>
                    </div>
                  ))}
                </div>
              )}

              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-base text-red-400 mb-2">
                  <span>Remise –{quote.discountPercent}%</span>
                  <span className="font-semibold">–{quote.discountAmount.toLocaleString("fr-FR")} €</span>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-muted mb-1">Total HT</p>
                <AnimatedPrice
                  value={quote.totalTTC}
                  suffix=" €"
                  className="text-6xl font-black text-accent font-display"
                />
                {data.wantsUnlimited && (
                  <p className="text-sm text-amber-400 mt-2">+39 €/mois (maintenance)</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
