"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import { ChevronDown } from "lucide-react";
import type { LeadStatus } from "@/types";

const STATUSES: { value: LeadStatus; label: string; dot: string; text: string }[] = [
  { value: "draft",  label: "Brouillon", dot: "bg-muted",    text: "text-muted" },
  { value: "sent",   label: "Envoyé",    dot: "bg-accent",   text: "text-accent" },
  { value: "signed", label: "Signé",     dot: "bg-success",  text: "text-success" },
  { value: "lost",   label: "Perdu",     dot: "bg-danger",   text: "text-danger" },
];

interface Props {
  leadId: string;
  current: LeadStatus;
  onChange?: (next: LeadStatus) => void;
}

export function QuickStatusPicker({ leadId, current, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(current);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Sync si le parent re-render avec un nouveau statut (ex. après fetch)
  useEffect(() => { setStatus(current); }, [current]);

  const close = useCallback(() => setOpen(false), []);

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const handleSelect = async (next: LeadStatus) => {
    if (next === status) { close(); return; }
    setLoading(true);
    close();

    const supabase = createClient();
    const { error } = await supabase
      .from("leads")
      .update({ status: next })
      .eq("id", leadId);

    if (error) {
      toast.error("Erreur lors du changement de statut");
    } else {
      const label = STATUSES.find((s) => s.value === next)?.label ?? next;
      toast.success(`Statut → ${label}`);
      setStatus(next);
      onChange?.(next);
    }
    setLoading(false);
  };

  const cfg = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  return (
    <div ref={ref} className="relative shrink-0" onClick={(e) => e.preventDefault()}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        disabled={loading}
        className={`
          inline-flex items-center gap-1.5 rounded-full border font-medium
          text-xs px-2 py-0.5
          transition-all duration-200 hover:scale-[1.05]
          cursor-pointer select-none
          ${status === "draft"  ? "bg-surface2 text-muted border-white/10" : ""}
          ${status === "sent"   ? "bg-accent/15 text-accent border-accent/25" : ""}
          ${status === "signed" ? "bg-success/15 text-success border-success/25" : ""}
          ${status === "lost"   ? "bg-danger/15 text-danger border-danger/25" : ""}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {loading ? "…" : cfg.label}
        <ChevronDown size={10} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-full mt-1.5 z-50
            w-36 rounded-xl bg-surface2 border border-white/10
            shadow-2xl shadow-black/40
            overflow-hidden
            animate-[fadeInUp_0.15s_ease-out]
          "
        >
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(s.value); }}
              className={`
                w-full flex items-center gap-2 px-3 py-2
                text-xs transition-colors text-left
                ${s.value === status
                  ? `${s.text} bg-white/[0.06]`
                  : "text-muted hover:text-textc hover:bg-white/[0.04]"
                }
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
              {s.label}
              {s.value === status && <span className="ml-auto text-[10px] opacity-50">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
