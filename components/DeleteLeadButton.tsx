"use client";

import { useState } from "react";
import { Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle");
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setStep("loading");
    await supabase.from("leads").delete().eq("id", leadId).eq("status", "draft");
    router.refresh();
  };

  if (step === "idle") {
    return (
      <button
        onClick={(e) => { e.preventDefault(); setStep("confirm"); }}
        className="p-1.5 rounded-lg text-faint hover:text-danger hover:bg-danger/8 transition-all opacity-0 group-hover:opacity-100"
        title="Supprimer le brouillon"
      >
        <Trash2 size={14} />
      </button>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs text-muted hidden sm:block">Supprimer ?</span>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg text-danger hover:bg-danger/15 transition-all"
          title="Confirmer"
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
    <div className="p-1.5">
      <Trash2 size={14} className="text-faint animate-pulse" />
    </div>
  );
}
