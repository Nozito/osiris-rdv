"use client";

import { Settings2 } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { TECH_OPTIONS } from "@/lib/pricing";
import { useWizard } from "./WizardShell";

const ICONS: Record<string, string> = {
  "cms-headless": "📦",
  "seo-pack": "🔍",
  analytics: "📊",
  maintenance: "🔧",
  hosting: "🖥️",
};

export function Step5Technique() {
  const { data, update } = useWizard();

  const toggleTech = (id: string) => {
    const current = data.techOptions;
    if (current.includes(id)) {
      update({ techOptions: current.filter((t) => t !== id) });
    } else {
      update({ techOptions: [...current, id] });
    }
  };

  const oneTimeOptions = TECH_OPTIONS.filter((t) => t.price > 0);
  const monthlyOptions = TECH_OPTIONS.filter((t) => t.monthly > 0);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader
          title="Options techniques"
          description="Fonctionnalités additionnelles (one-shot)"
          icon={<Settings2 size={18} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {oneTimeOptions.map((opt) => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              sublabel={opt.sublabel}
              price={opt.price}
              selected={data.techOptions.includes(opt.id)}
              onSelect={toggleTech}
              type="checkbox"
              icon={<span className="text-base">{ICONS[opt.id] ?? "⚙️"}</span>}
            />
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Services récurrents"
          description="Abonnements mensuels facturés en continu"
          icon={<Settings2 size={18} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {monthlyOptions.map((opt) => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              sublabel={opt.sublabel}
              monthly={opt.monthly}
              selected={data.techOptions.includes(opt.id)}
              onSelect={toggleTech}
              type="checkbox"
              icon={<span className="text-base">{ICONS[opt.id] ?? "⚙️"}</span>}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
