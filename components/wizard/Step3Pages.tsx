"use client";

import { LayoutGrid } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { PAGE_OPTIONS } from "@/lib/pricing";
import { useWizard } from "./WizardShell";

const ICONS: Record<string, string> = {
  blog: "📝",
  multilang: "🌍",
  booking: "📅",
  gallery: "🖼️",
  chatbot: "🤖",
  "member-area": "🔐",
  "contact-forms": "📋",
  testimonials: "⭐",
};

export function Step3Pages() {
  const { data, update } = useWizard();

  const togglePage = (id: string) => {
    const current = data.selectedPages;
    if (current.includes(id)) {
      update({ selectedPages: current.filter((p) => p !== id) });
    } else {
      update({ selectedPages: [...current, id] });
    }
  };

  return (
    <Card>
      <CardHeader
        title="Fonctionnalités & pages"
        description="Sélectionnez toutes les fonctionnalités souhaitées (multi-sélection)"
        icon={<LayoutGrid size={18} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAGE_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            sublabel={opt.sublabel}
            price={opt.price}
            selected={data.selectedPages.includes(opt.id)}
            onSelect={togglePage}
            type="checkbox"
            icon={
              <span className="text-base">{ICONS[opt.id] ?? "🔧"}</span>
            }
          />
        ))}
      </div>

      {data.selectedPages.length === 0 && (
        <p className="text-xs text-faint text-center mt-4">
          Vous pouvez passer cette étape si aucune fonctionnalité additionnelle n'est nécessaire
        </p>
      )}
    </Card>
  );
}
