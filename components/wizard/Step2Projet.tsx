"use client";

import { Briefcase, Calendar } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { Textarea, Input } from "@/components/ui/Input";
import { Card, CardHeader } from "@/components/ui/Card";
import { SITE_TYPES } from "@/lib/pricing";
import { useWizard } from "./WizardShell";

const ICONS: Record<string, string> = {
  "vitrine-simple": "🏠",
  "vitrine-standard": "🏢",
  "vitrine-premium": "✨",
  "ecommerce-starter": "🛍️",
  "ecommerce-custom": "🏪",
  "app-web": "⚡",
};

export function Step2Projet() {
  const { data, update } = useWizard();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Type de projet"
          description="Quel type de site souhaitez-vous créer ?"
          icon={<Briefcase size={18} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SITE_TYPES.map((type) => (
            <OptionCard
              key={type.id}
              id={type.id}
              label={type.label}
              sublabel={type.sublabel}
              price={type.price}
              selected={data.projectType === type.id}
              onSelect={(id) => update({ projectType: id })}
              type="radio"
              icon={
                <span className="text-base">{ICONS[type.id] ?? "🌐"}</span>
              }
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Description du projet"
          description="Contexte, objectifs, références, contraintes…"
          icon={<Briefcase size={18} />}
        />

        <div className="flex flex-col gap-4">
          <Textarea
            label="Description"
            placeholder="Ex : Nous souhaitons refaire notre site vitrine pour mettre en avant nos services de coaching. Nous avons déjà un logo et une charte graphique en bleu et blanc…"
            value={data.projectDescription}
            onChange={(e) => update({ projectDescription: e.target.value })}
            rows={5}
            hint="Plus vous êtes précis, plus l'estimation sera pertinente"
          />

          <Input
            label="Date de mise en ligne souhaitée (optionnel)"
            type="date"
            value={data.projectDeadline}
            onChange={(e) => update({ projectDeadline: e.target.value })}
            icon={<Calendar size={15} />}
          />
        </div>
      </Card>
    </div>
  );
}
