"use client";

import { Wallet } from "lucide-react";
import { OptionCard } from "@/components/ui/OptionCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { BUDGET_RANGES } from "@/lib/pricing";
import { useWizard } from "./WizardShell";

export function Step6Budget() {
  const { data, update } = useWizard();

  return (
    <Card>
      <CardHeader
        title="Budget client"
        description="Quelle est la fourchette budgétaire envisagée par le prospect ?"
        icon={<Wallet size={18} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BUDGET_RANGES.map((range) => (
          <OptionCard
            key={range.id}
            id={range.id}
            label={range.label}
            selected={data.budgetRange === range.id}
            onSelect={(id) => update({ budgetRange: id })}
            type="radio"
          />
        ))}
      </div>

      <div className="mt-5 p-4 rounded-2xl bg-accent/5 border border-accent/15">
        <p className="text-xs text-muted leading-relaxed">
          <span className="text-accent font-medium">Info interne :</span> Cette
          information n'apparaît pas dans le PDF prospect. Elle vous permet de
          calibrer l'offre et d'anticiper les objections budgétaires.
        </p>
      </div>
    </Card>
  );
}
