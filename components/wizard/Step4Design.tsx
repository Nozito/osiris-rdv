"use client";

import { Palette, Image as ImageIcon } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { DESIGN_OPTIONS } from "@/lib/pricing";
import { useWizard } from "./WizardShell";

const ICONS: Record<string, React.ReactNode> = {
  template: <span className="text-base">🎨</span>,
  "semi-custom": <span className="text-base">✏️</span>,
  "full-custom": <span className="text-base">💎</span>,
};

export function Step4Design() {
  const { data, update } = useWizard();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Niveau de design"
          description="Choisissez le degré de personnalisation visuelle"
          icon={<Palette size={18} />}
        />

        <div className="flex flex-col gap-3">
          {DESIGN_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              sublabel={opt.sublabel}
              price={opt.price}
              selected={data.designStyle === opt.id}
              onSelect={(id) => update({ designStyle: id })}
              type="radio"
              icon={ICONS[opt.id]}
              badge={
                opt.id === "full-custom" ? "Recommandé premium" : undefined
              }
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Charte graphique"
          description="Le client dispose-t-il déjà de ressources de marque ?"
          icon={<ImageIcon size={18} />}
        />

        <div className="flex flex-col gap-3">
          <OptionCard
            id="yes"
            label="Oui, il a une charte existante"
            sublabel="Logo, couleurs, typographie définis — on s'adapte"
            selected={data.brandAssets === true}
            onSelect={() => update({ brandAssets: true })}
            type="radio"
            icon={<span className="text-base">✅</span>}
          />
          <OptionCard
            id="no"
            label="Non, à créer ou définir"
            sublabel="On peut l'accompagner sur la charte de base"
            selected={data.brandAssets === false}
            onSelect={() => update({ brandAssets: false })}
            type="radio"
            icon={<span className="text-base">🆕</span>}
          />
        </div>
      </Card>
    </div>
  );
}
