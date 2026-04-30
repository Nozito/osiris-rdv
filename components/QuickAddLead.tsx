"use client";
// OSIRIS CRM — modale saisie rapide lead (1 écran, sans wizard)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { SITE_TYPES } from "@/lib/configurator-pricing";
import type { LeadStatus } from "@/types";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "draft",  label: "Brouillon" },
  { value: "sent",   label: "Envoyé"    },
  { value: "signed", label: "Signé"     },
  { value: "lost",   label: "Perdu"     },
];

interface Props {
  onCreated?: (leadId: string) => void;
}

export function QuickAddLead({ onCreated }: Props) {
  const router = useRouter();
  const [open,          setOpen]         = useState(false);
  const [saving,        setSaving]       = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [siteType,   setSiteType]   = useState(SITE_TYPES[0].id);
  const [price,      setPrice]      = useState(SITE_TYPES[0].price);
  const [status,     setStatus]     = useState<LeadStatus>("draft");
  const [notes,      setNotes]      = useState("");

  const supabase = createClient();

  const handleSiteTypeChange = (id: string) => {
    setSiteType(id);
    const st = SITE_TYPES.find((s) => s.id === id);
    if (st) setPrice(st.price);
  };

  const reset = () => {
    setClientName("");
    setClientEmail("");
    setSiteType(SITE_TYPES[0].id);
    setPrice(SITE_TYPES[0].price);
    setStatus("draft");
    setNotes("");
    setCreatedLeadId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) { toast.error("Nom client requis"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Non connecté"); return; }

      const parts = clientName.trim().split(" ");
      const firstName = parts[0] ?? "";
      const lastName  = parts.slice(1).join(" ");

      // Créer ou retrouver un client
      let clientId: string | null = null;
      if (clientEmail) {
        const { data: existing } = await supabase
          .from("clients")
          .select("id")
          .eq("email", clientEmail)
          .eq("commercial_id", user.id)
          .single();
        if (existing) {
          clientId = existing.id;
        } else {
          const { data: ins } = await supabase
            .from("clients")
            .insert({ commercial_id: user.id, name: clientName.trim(), email: clientEmail })
            .select("id")
            .single();
          clientId = ins?.id ?? null;
        }
      }

      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          commercial_id:       user.id,
          client_id:           clientId,
          client_name:         clientName.trim(),
          client_email:        clientEmail,
          client_company:      "",
          client_phone:        "",
          project_type:        siteType,
          project_description: notes,
          project_deadline:    null,
          selected_pages:      [],
          design_style:        "template",
          brand_assets:        false,
          tech_options:        [],
          budget_range:        "",
          total_one_time:      price,
          total_monthly:       0,
          adjusted_price:      null,
          notes,
          status,
        })
        .select("id")
        .single();

      if (error) { toast.error("Erreur lors de la création"); return; }

      toast.success("Lead créé ✓");
      router.refresh();
      reset();
      setOpen(false);
      if (lead?.id) {
        setCreatedLeadId(lead.id);
        onCreated?.(lead.id);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setCreatedLeadId(null); }}
        className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-surface2 border border-white/8 text-xs text-muted hover:text-textc hover:border-white/15 transition-all"
        title="Saisie rapide d'un lead"
      >
        <Zap size={12} className="text-amber-400" />
        Saisie rapide
      </button>

      {/* Follow-up banner */}
      {createdLeadId && (
        <div className="flex items-center gap-2 h-8 px-3 rounded-[10px] bg-accent/10 border border-accent/20 text-xs text-accent animate-[fadeIn_0.2s_ease-out]">
          <span>Lead créé</span>
          <a
            href={`/rdv/${createdLeadId}`}
            className="flex items-center gap-1 font-medium hover:underline"
          >
            Compléter le dossier <ArrowRight size={11} />
          </a>
          <button
            onClick={() => setCreatedLeadId(null)}
            className="ml-1 text-accent/50 hover:text-accent transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); reset(); } }}
        >
          <div className="w-full sm:max-w-md sm:mx-4 rounded-t-2xl sm:rounded-2xl bg-surface border border-white/10 shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-2">
                <Zap size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-textc">Saisie rapide</span>
              </div>
              <button
                onClick={() => { setOpen(false); reset(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-faint hover:text-textc hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form — scrollable si keyboard ouvert */}
            <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3 overflow-y-auto">
              {/* Nom + Email sur 2 cols sm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Nom client <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Jean Dupont"
                    required
                    autoComplete="name"
                    className="w-full h-11 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Email client</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="jean@example.com"
                    autoComplete="email"
                    className="w-full h-11 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
              </div>

              {/* Type de site + Prix sur 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5">Type de site</label>
                  <select
                    value={siteType}
                    onChange={(e) => handleSiteTypeChange(e.target.value)}
                    className="w-full h-11 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc outline-none focus:border-accent/40 transition-colors"
                  >
                    {SITE_TYPES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label} — {s.price.toLocaleString("fr-FR")} €</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5">Prix estimé (€)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    min={0}
                    step={50}
                    inputMode="numeric"
                    className="w-full h-11 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc outline-none focus:border-accent/40 transition-colors"
                  />
                </div>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Statut</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStatus(s.value)}
                      className={`h-9 rounded-lg text-xs border transition-all ${status === s.value ? "border-accent/50 bg-accent/10 text-accent" : "border-white/8 bg-surface2 text-muted hover:border-white/20"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contexte, observations…"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none min-h-[64px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="ghost" size="md" className="flex-1" onClick={() => { setOpen(false); reset(); }}>
                  Annuler
                </Button>
                <Button type="submit" variant="primary" size="md" loading={saving} className="flex-1">
                  Créer le lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
