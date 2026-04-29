"use client";
// OSIRIS CRM — fiche client détaillée avec édition inline et timeline leads

import { useState } from "react";
import Link from "next/link";
import { Edit2, Save, X, Plus, FileText, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import type { Client, Lead } from "@/types";

type LeadWithProfile = Lead & { profiles: { full_name: string } | null };

const STATUS_COLORS: Record<string, string> = {
  draft:            "bg-surface2 text-faint border-white/10",
  sent:             "bg-blue-500/10 text-blue-400 border-blue-500/20",
  signed:           "bg-success/10 text-success border-success/20",
  lost:             "bg-danger/10 text-danger border-danger/20",
  pending_approval: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};
const STATUS_LABELS: Record<string, string> = {
  draft:            "Brouillon",
  sent:             "Envoyé",
  signed:           "Signé",
  lost:             "Perdu",
  pending_approval: "En attente",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30)  return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

interface Props {
  client: Client;
  leads:  LeadWithProfile[];
}

export function ClientDetailClient({ client: initialClient, leads }: Props) {
  const [client, setClient] = useState<Client>(initialClient);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [draft,   setDraft]     = useState<Client>(initialClient);
  const supabase = createClient();

  const startEdit = () => { setDraft({ ...client }); setEditing(true); };
  const cancelEdit = () => setEditing(false);

  const saveEdit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({
        name:    draft.name,
        email:   draft.email,
        phone:   draft.phone,
        company: draft.company,
        notes:   draft.notes,
      })
      .eq("id", client.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    setClient(draft);
    setEditing(false);
    toast.success("Client mis à jour ✓");
  };

  const field = (
    key: keyof Client,
    label: string,
    placeholder: string,
    type = "text"
  ) => (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      {editing ? (
        <input
          type={type}
          value={(draft[key] as string) ?? ""}
          onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full h-9 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
        />
      ) : (
        <p className="text-sm text-textc py-1">{(client[key] as string) || <span className="text-faint">—</span>}</p>
      )}
    </div>
  );

  const totalTTC = (l: Lead) =>
    (l.quote_data as { totalTTC?: number } | null)?.totalTTC
    ?? l.adjusted_price
    ?? l.total_one_time;

  return (
    <div className="flex flex-col gap-5">

      {/* Fiche client */}
      <div className="rounded-xl border border-white/8 bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-textc font-display">Fiche client</h2>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={startEdit} icon={<Edit2 size={13} />}>
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={cancelEdit} icon={<X size={13} />}>
                Annuler
              </Button>
              <Button variant="primary" size="sm" loading={saving} onClick={saveEdit} icon={<Save size={13} />}>
                Sauvegarder
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {field("name",    "Nom complet",  "Jean Dupont")}
          {field("company", "Entreprise",   "Acme SAS")}
          {field("email",   "Email",        "jean@acme.fr", "email")}
          {field("phone",   "Téléphone",    "+33 6 00 00 00 00", "tel")}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Notes</label>
          {editing ? (
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Notes libres…"
              rows={3}
              className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none"
            />
          ) : (
            <p className="text-sm text-textc py-1 whitespace-pre-wrap">{client.notes || <span className="text-faint">—</span>}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/rdv/nouveau?clientId=${client.id}`}
          className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all active:scale-95"
        >
          <Plus size={14} />
          Nouveau RDV →
        </Link>
      </div>

      {/* Timeline leads */}
      <div className="rounded-xl border border-white/8 bg-surface p-5">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">
          Timeline — {leads.length} lead{leads.length !== 1 ? "s" : ""}
        </p>

        {leads.length === 0 ? (
          <p className="text-sm text-faint text-center py-4">Aucun lead pour ce client</p>
        ) : (
          <div className="flex flex-col gap-3">
            {leads.map((lead) => {
              const price = totalTTC(lead);
              return (
                <Link
                  key={lead.id}
                  href={`/rdv/${lead.id}`}
                  className="flex items-center gap-3 rounded-lg bg-surface2 border border-white/[0.06] p-3 hover:border-white/15 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.draft}`}>
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                      <span className="text-[10px] text-faint">{timeAgo(lead.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted truncate">
                      {lead.project_type || "Projet web"}
                      {lead.profiles?.full_name ? ` — ${lead.profiles.full_name}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-textc group-hover:text-accent transition-colors">
                      {price > 0 ? fmt(price) : "—"}
                    </p>
                  </div>
                  <FileText size={14} className="text-faint shrink-0 group-hover:text-accent transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
