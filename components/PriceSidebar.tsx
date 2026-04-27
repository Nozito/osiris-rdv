"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import {
  SITE_TYPES,
  DESIGN_OPTIONS,
  PAGE_OPTIONS,
  TECH_OPTIONS,
  calcTotal,
  formatPrice,
} from "@/lib/pricing";
import { AnimatedPrice } from "./AnimatedPrice";
import type { WizardData } from "@/types";

interface PriceSidebarProps {
  data: WizardData;
}

export function PriceSidebar({ data }: PriceSidebarProps) {
  const site = SITE_TYPES.find((s) => s.id === data.projectType);
  const design = DESIGN_OPTIONS.find((d) => d.id === data.designStyle);
  const pages = PAGE_OPTIONS.filter((p) =>
    data.selectedPages.includes(p.id)
  );
  const techs = TECH_OPTIONS.filter((t) => data.techOptions.includes(t.id));

  const { oneTime, monthly } = calcTotal({
    siteTypeId: data.projectType,
    pageOptionIds: data.selectedPages,
    designId: data.designStyle,
    techOptionIds: data.techOptions,
  });

  const finalPrice = data.adjustedPrice ?? oneTime;

  const lineItems: { label: string; price: number }[] = [];
  if (site) lineItems.push({ label: site.label, price: site.price });
  if (design && design.price > 0)
    lineItems.push({ label: design.label, price: design.price });
  pages.forEach((p) => lineItems.push({ label: p.label, price: p.price }));
  techs
    .filter((t) => t.price > 0)
    .forEach((t) => lineItems.push({ label: t.label, price: t.price }));

  return (
    <aside className="w-72 shrink-0 hidden md:flex flex-col gap-4 sticky top-6 self-start">
      <div className="rounded-card bg-surface border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center gap-2">
          <Sparkles size={16} className="text-accent" />
          <span className="text-sm font-semibold text-textc font-display">
            Estimation live
          </span>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {lineItems.length === 0 ? (
              <p className="text-xs text-faint text-center py-4">
                Configurez votre projet pour voir le devis
              </p>
            ) : (
              lineItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ChevronRight size={12} className="text-faint shrink-0" />
                    <span className="text-xs text-muted truncate">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-textc shrink-0">
                    {formatPrice(item.price)}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {oneTime > 0 && (
          <div className="px-5 py-4 border-t border-white/8 bg-surface2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted">Total one-shot</span>
              <AnimatedPrice
                value={finalPrice}
                suffix=" €"
                className="text-xl font-bold text-textc font-display"
              />
            </div>
            {monthly > 0 && (
              <p className="text-xs text-muted mt-1 text-right">
                +{formatPrice(monthly)}/mois
              </p>
            )}
            {data.adjustedPrice !== null && data.adjustedPrice !== oneTime && (
              <p className="text-xs text-accent mt-1 text-right">
                Prix ajusté (base: {formatPrice(oneTime)})
              </p>
            )}
          </div>
        )}
      </div>

      {monthly > 0 && (
        <div className="rounded-card bg-surface border border-white/8 px-5 py-4">
          <p className="text-xs text-muted mb-2">Services récurrents</p>
          <div className="flex flex-col gap-2">
            {techs
              .filter((t) => t.monthly > 0)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-muted">{t.label}</span>
                  <span className="text-xs font-medium text-textc">
                    {formatPrice(t.monthly)}/mois
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
            <span className="text-xs font-medium text-textc">Total/mois</span>
            <AnimatedPrice
              value={monthly}
              suffix=" €/mois"
              className="text-sm font-bold text-accent"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

export function MobilePriceBar({ data }: PriceSidebarProps) {
  const { oneTime, monthly } = calcTotal({
    siteTypeId: data.projectType,
    pageOptionIds: data.selectedPages,
    designId: data.designStyle,
    techOptionIds: data.techOptions,
  });

  const finalPrice = data.adjustedPrice ?? oneTime;

  if (oneTime === 0) return null;

  return (
    <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-20 px-4">
      <div className="rounded-[14px] bg-surface2/95 backdrop-blur border border-white/8 px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs text-muted">Estimation</p>
          {monthly > 0 && (
            <p className="text-xs text-faint">+{formatPrice(monthly)}/mois</p>
          )}
        </div>
        <AnimatedPrice
          value={finalPrice}
          suffix=" €"
          className="text-lg font-bold text-textc font-display"
        />
      </div>
    </div>
  );
}
