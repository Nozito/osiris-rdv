"use client";

import { useState } from "react";
import { Trash2, Check, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";

interface Props {
  leadId: string;
  onDeleted?: () => void;
}

export function DeleteLeadButton({ leadId, onDeleted }: Props) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");

  const handleDelete = async () => {
    setStep("loading");
    const supabase = createClient();

    // Supprimer les quote_tokens liés avant le lead (FK sans CASCADE en production)
    await supabase.from("quote_tokens").delete().eq("lead_id", leadId);

    const { error } = await supabase.from("leads").delete().eq("id", leadId);

    if (error) {
      console.error("[DeleteLeadButton]", error.code, error.message);
      toast.error("Suppression échouée — " + (error.message ?? error.code));
      setStep("idle");
      return;
    }

    toast.success("Lead supprimé");
    onDeleted?.();
  };

  if (step === "idle") {
    return (
      <button
        onClick={(e) => { e.preventDefault(); setStep("confirm"); }}
        className="p-1.5 rounded-lg text-faint/40 hover:text-danger hover:bg-danger/8 transition-all duration-150 group-hover:text-faint min-w-[28px] flex items-center justify-center"
        title="Supprimer le brouillon"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-muted pr-1 hidden sm:inline">Supprimer ?</span>
        <button
          onClick={(e) => { e.preventDefault(); handleDelete(); }}
          className="p-1.5 rounded-lg text-danger hover:bg-danger/15 transition-all"
          title="Confirmer la suppression"
        >
          <Check size={14} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); setStep("idle"); }}
          className="p-1.5 rounded-lg text-faint hover:text-textc transition-all"
          title="Annuler"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="p-1.5 min-w-[28px] flex items-center justify-center">
      <Loader2 size={14} className="text-faint animate-spin" />
    </div>
  );
}
