"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, ChevronLeft, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import {
  SITE_TYPES,
  DESIGN_OPTIONS,
  PAGE_OPTIONS,
  TECH_OPTIONS,
  getRecommendation,
  calcTotal,
  formatPrice,
} from "@/lib/pricing";
import { useWizard } from "./WizardShell";

export function Step7Recommandation() {
  const { data, update, prev } = useWizard();
  const [applied, setApplied] = useState(false);

  const rec = getRecommendation({
    siteTypeId: data.projectType,
    budgetRangeId: data.budgetRange,
  });

  const { oneTime: recOneTime } = calcTotal({
    siteTypeId: rec.siteTypeId,
    pageOptionIds: rec.pageOptionIds,
    designId: rec.designId,
    techOptionIds: rec.techOptionIds,
  });

  const { oneTime, monthly } = calcTotal({
    siteTypeId: data.projectType,
    pageOptionIds: data.selectedPages,
    designId: data.designStyle,
    techOptionIds: data.techOptions,
  });

  const finalPrice = data.adjustedPrice ?? oneTime;

  const site = SITE_TYPES.find((s) => s.id === data.projectType);
  const design = DESIGN_OPTIONS.find((d) => d.id === data.designStyle);
  const pages = PAGE_OPTIONS.filter((p) => data.selectedPages.includes(p.id));
  const techsOneTime = TECH_OPTIONS.filter(
    (t) => data.techOptions.includes(t.id) && t.price > 0
  );
  const techsMonthly = TECH_OPTIONS.filter(
    (t) => data.techOptions.includes(t.id) && t.monthly > 0
  );

  const applyRecommendation = () => {
    update({
      selectedPages: rec.pageOptionIds,
      designStyle: rec.designId,
      techOptions: rec.techOptionIds,
      adjustedPrice: null,
    });
    setApplied(true);
  };

  const hasCustomSelection =
    data.projectType || data.selectedPages.length > 0 || data.techOptions.length > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Recommandation IA */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-card bg-accent/8 border border-accent/20 p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-textc font-display">
              Offre recommandée par Osiris
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              {rec.reasoning}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-base font-bold text-accent">
                {formatPrice(recOneTime)}
              </span>
              <Button
                size="sm"
                variant={applied ? "secondary" : "primary"}
                onClick={applyRecommendation}
                icon={<RefreshCw size={13} />}
              >
                {applied ? "Offre appliquée ✓" : "Appliquer cette offre"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Récapitulatif de la sélection actuelle */}
      <Card>
        <CardHeader
          title="Votre sélection actuelle"
          description="Récapitulatif des choix effectués aux étapes précédentes"
          icon={<Info size={18} />}
        />

        {!hasCustomSelection ? (
          <p className="text-sm text-faint text-center py-4">
            Aucune sélection — revenez aux étapes précédentes pour configurer votre projet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">

            {/* Base */}
            {site && (
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs text-faint uppercase tracking-wider mb-0.5">Base</p>
                  <p className="text-sm font-medium text-textc">{site.label}</p>
                  <p className="text-xs text-muted">{site.sublabel}</p>
                </div>
                <span className="text-sm font-semibold text-textc shrink-0 ml-4">
                  {formatPrice(site.price)}
                </span>
              </div>
            )}

            {/* Design */}
            {design && (
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-xs text-faint uppercase tracking-wider mb-0.5">Design</p>
                  <p className="text-sm font-medium text-textc">{design.label}</p>
                  <p className="text-xs text-muted">{design.sublabel}</p>
                </div>
                <span className="text-sm font-semibold text-textc shrink-0 ml-4">
                  {design.price === 0 ? (
                    <span className="text-success text-xs">Inclus</span>
                  ) : (
                    `+${formatPrice(design.price)}`
                  )}
                </span>
              </div>
            )}

            {/* Fonctionnalités */}
            {pages.length > 0 && (
              <div className="py-2.5">
                <p className="text-xs text-faint uppercase tracking-wider mb-2">
                  Fonctionnalités
                </p>
                <div className="flex flex-col gap-1.5">
                  {pages.map((p) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <span className="text-sm text-textc">{p.label}</span>
                      <span className="text-sm text-muted">+{formatPrice(p.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Options techniques */}
            {(techsOneTime.length > 0 || techsMonthly.length > 0) && (
              <div className="py-2.5">
                <p className="text-xs text-faint uppercase tracking-wider mb-2">
                  Options techniques
                </p>
                <div className="flex flex-col gap-1.5">
                  {techsOneTime.map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                      <span className="text-sm text-textc">{t.label}</span>
                      <span className="text-sm text-muted">+{formatPrice(t.price)}</span>
                    </div>
                  ))}
                  {techsMonthly.map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                      <span className="text-sm text-textc">{t.label}</span>
                      <span className="text-sm text-muted">{formatPrice(t.monthly)}/mois</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pages.length === 0 && techsOneTime.length === 0 && techsMonthly.length === 0 && site && (
              <p className="text-xs text-faint py-2.5">
                Aucune fonctionnalité additionnelle sélectionnée.
              </p>
            )}
          </div>
        )}

        {hasCustomSelection && (
          <button
            onClick={prev}
            className="mt-4 flex items-center gap-1.5 text-xs text-muted hover:text-textc transition-colors"
          >
            <ChevronLeft size={13} />
            Modifier les options (étapes précédentes)
          </button>
        )}
      </Card>

      {/* Ajustement commercial */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-textc">Ajustement du prix</h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm border-b border-white/8 pb-3">
            <span className="text-muted">Prix calculé</span>
            <span className="font-semibold text-textc">{formatPrice(oneTime)}</span>
          </div>
          {monthly > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Récurrent</span>
              <span className="font-semibold text-textc">{formatPrice(monthly)}/mois</span>
            </div>
          )}

          <div className="pt-1">
            <label className="text-xs text-muted block mb-1.5">
              Prix affiché sur le devis — laisser vide pour utiliser le prix calculé
            </label>
            <input
              type="number"
              min={0}
              step={50}
              placeholder={String(oneTime)}
              value={data.adjustedPrice ?? ""}
              onChange={(e) =>
                update({ adjustedPrice: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full h-11 rounded-[10px] bg-surface2 border border-white/8 px-4 text-sm text-textc placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
            />
            {data.adjustedPrice !== null && (
              <button
                onClick={() => update({ adjustedPrice: null })}
                className="text-xs text-faint hover:text-muted mt-1 transition-colors"
              >
                ↺ Réinitialiser au prix calculé
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <span className="text-sm font-semibold text-textc">Prix final</span>
            <AnimatedPrice
              value={finalPrice}
              suffix=" €"
              className="text-2xl font-bold text-accent font-display"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
