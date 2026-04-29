"use client";
// OSIRIS CRM — étape 0 : sélection client avant le wizard configurateur

import { useState, useEffect, useRef } from "react";
import { Search, X, UserX, Clock, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Client } from "@/types";

interface ClientResult extends Client {
  lastActivity?: string;
}

interface Props {
  onSelect:      (client: Client) => void;
  onSkip:        () => void;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30)  return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

function initials(name: string, company: string) {
  const src = name || company || "?";
  return src.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function ClientSelectorStep({ onSelect, onSkip }: Props) {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<ClientResult[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (!query.trim()) {
      // Charge les derniers clients récents
      debounce.current = setTimeout(async () => {
        setLoading(true);
        const { data } = await supabase
          .from("clients")
          .select("*, leads(created_at)")
          .order("updated_at", { ascending: false })
          .limit(8);
        setLoading(false);
        setResults(
          (data ?? []).map((c) => ({
            ...c,
            lastActivity: c.leads?.sort(
              (a: { created_at: string }, b: { created_at: string }) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]?.created_at,
          }))
        );
      }, 0);
      return;
    }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("clients")
        .select("*, leads(created_at)")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
        .limit(8);
      setLoading(false);
      setResults(
        (data ?? []).map((c) => ({
          ...c,
          lastActivity: c.leads?.sort(
            (a: { created_at: string }, b: { created_at: string }) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]?.created_at,
        }))
      );
    }, 280);
  }, [query, supabase]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-white/8">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-[13px] font-bold font-display text-textc">OSIRIS</span>
          <span className="h-4 w-px bg-white/10" />
          <span className="text-[12px] text-muted">Nouveau RDV — Sélection client</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <h2 className="text-lg font-bold text-textc font-display mb-1">Qui est votre client ?</h2>
        <p className="text-sm text-muted mb-6">Recherchez un client existant ou démarrez en saisie manuelle.</p>

        {/* Barre de recherche */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, email ou entreprise…"
            className="w-full h-10 pl-9 pr-9 rounded-[12px] bg-surface border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-textc"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="text-xs text-faint animate-pulse">Recherche…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {results.length === 0 && query.trim() ? (
              <p className="text-sm text-faint text-center py-8">Aucun client trouvé pour « {query} »</p>
            ) : (
              results.map((client) => (
                <button
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className="w-full flex items-center gap-3 rounded-xl bg-surface border border-white/8 p-3.5 hover:border-accent/30 hover:bg-accent/5 transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0 group-hover:border-accent/40 transition-colors">
                    {initials(client.name, client.company)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textc truncate">{client.name || "—"}</p>
                    <p className="text-xs text-muted truncate">
                      {[client.company, client.email].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {client.lastActivity && (
                    <div className="flex items-center gap-1 text-[10px] text-faint shrink-0">
                      <Clock size={10} />
                      {timeAgo(client.lastActivity)}
                    </div>
                  )}
                  <ChevronRight size={15} className="text-faint group-hover:text-accent transition-colors shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* CTA saisie manuelle */}
        <div className="border-t border-white/8 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            icon={<UserX size={14} />}
          >
            Client inconnu — Saisie manuelle
          </Button>
        </div>
      </main>
    </div>
  );
}
