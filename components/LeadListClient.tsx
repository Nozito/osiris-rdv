"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, FileText, Plus } from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { DeleteLeadButton } from "@/components/DeleteLeadButton";
import { QuickStatusPicker } from "@/components/QuickStatusPicker";
import type { Lead, LeadStatus } from "@/types";

const STATUS_TABS: { value: "all" | LeadStatus; label: string }[] = [
  { value: "all",    label: "Tous" },
  { value: "draft",  label: "Brouillons" },
  { value: "sent",   label: "Envoyés" },
  { value: "signed", label: "Signés" },
  { value: "lost",   label: "Perdus" },
];

// Affiche "il y a 2 jours" au lieu d'une date brute
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return "à l'instant";
  if (hours < 1)  return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7)   return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

interface Props {
  initialLeads: Lead[];
}

export function LeadListClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | LeadStatus>("all");

  const filtered = useMemo(() => {
    let list = leads;
    if (activeTab !== "all") {
      list = list.filter((l) => l.status === activeTab);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (l) =>
          (l.client_name ?? "").toLowerCase().includes(q) ||
          (l.client_company ?? "").toLowerCase().includes(q) ||
          (l.project_type ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, query, activeTab]);

  const counts = useMemo(
    () => ({
      all:    leads.length,
      draft:  leads.filter((l) => l.status === "draft").length,
      sent:   leads.filter((l) => l.status === "sent").length,
      signed: leads.filter((l) => l.status === "signed").length,
      lost:   leads.filter((l) => l.status === "lost").length,
    }),
    [leads]
  );

  const removeLead = (id: string) =>
    setLeads((prev) => prev.filter((l) => l.id !== id));

  const updateStatus = (id: string, next: LeadStatus) =>
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: next } : l))
    );

  return (
    <div className="rounded-card bg-surface border border-white/8">
      {/* Header + search */}
      <div className="px-4 sm:px-5 py-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
          <h2 className="text-sm font-semibold text-textc font-display shrink-0">
            Mes leads
          </h2>
          <span className="text-xs text-muted">{leads.length} lead(s)</span>
        </div>

        {/* Recherche */}
        {leads.length > 0 && (
          <div className="relative w-full sm:w-52">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="
                w-full h-8 pl-7 pr-7 rounded-[10px]
                bg-surface2 border border-white/8
                text-xs text-textc placeholder:text-faint
                outline-none focus:border-accent/40 transition-colors
              "
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-faint hover:text-textc"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filtres statut */}
      {leads.length > 0 && (
        <div className="flex gap-1 px-4 sm:px-5 py-2 border-b border-white/8 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab.value];
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-accent/15 text-accent border border-accent/25"
                    : "text-muted hover:text-textc hover:bg-white/[0.04] border border-transparent"
                  }
                `}
              >
                {tab.label}
                <span
                  className={`
                    text-[10px] rounded-full px-1 min-w-[16px] text-center
                    ${isActive ? "bg-accent/25 text-accent" : "bg-surface2 text-faint"}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {leads.length === 0 ? (
        /* Empty state */
        <div className="text-center py-14">
          <FileText
            size={28}
            className="text-faint mx-auto mb-3"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          <p
            className="text-muted text-sm"
            style={{ animation: "fadeInUp 0.3s ease-out 0.1s both" }}
          >
            Aucun lead pour le moment
          </p>
          <p
            className="text-faint text-xs mt-1 mb-4"
            style={{ animation: "fadeInUp 0.3s ease-out 0.2s both" }}
          >
            Créez votre premier RDV
          </p>
          <div style={{ animation: "fadeInUp 0.3s ease-out 0.3s both" }}>
            <Link
              href="/rdv/nouveau"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              Nouveau RDV
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted text-sm">Aucun résultat</p>
          <button
            onClick={() => { setQuery(""); setActiveTab("all"); }}
            className="text-xs text-accent hover:underline mt-2"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="divide-y divide-white/8">
          {filtered.map((lead, i) => (
            <div
              key={lead.id}
              className="lead-row-enter flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 group"
              style={{ animationDelay: `${i * 40}ms` }}
              data-lead-row
              data-status={lead.status}
            >
              {/* Lien principal */}
              <Link
                href={`/rdv/${lead.id}`}
                className="flex-1 min-w-0 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-textc truncate group-hover:text-accent transition-colors">
                      {lead.client_name || "Sans nom"}
                    </p>
                    {lead.client_company && (
                      <span className="text-xs text-faint truncate hidden sm:block">
                        — {lead.client_company}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">
                    {lead.project_type
                      ? lead.project_type.replace(/-/g, " ")
                      : "Projet non défini"}
                  </p>
                </div>

                {/* Prix + date — OSIRIS CRM — pricing configurator */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-sm font-semibold text-textc hidden sm:block">
                    {lead.quote_data
                      ? lead.quote_data.totalTTC.toLocaleString("fr-FR") + " €"
                      : formatPrice(lead.adjusted_price ?? lead.total_one_time)}
                  </span>
                  <span className="text-xs text-faint hidden md:block whitespace-nowrap">
                    {timeAgo(lead.updated_at ?? lead.created_at)}
                  </span>
                </div>
              </Link>

              {/* Quick status picker — cliquable sans naviguer */}
              <QuickStatusPicker
                leadId={lead.id}
                current={lead.status}
                onChange={(next) => updateStatus(lead.id, next)}
              />

              {/* Supprimer (brouillons uniquement) */}
              {lead.status === "draft" && (
                <DeleteLeadButton
                  leadId={lead.id}
                  onDeleted={() => removeLead(lead.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
