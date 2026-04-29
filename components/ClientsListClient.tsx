"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, X, Mail, Phone, FileText, Plus, BookUser, Check } from "lucide-react";
import { formatPrice } from "@/lib/pricing";

type LeadMini = {
  id: string;
  status: string;
  total_one_time: number;
  adjusted_price: number | null;
  created_at: string;
};

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  leads: LeadMini[];
  profiles: { full_name: string } | null;
};

interface Props {
  clients: ClientRow[];
  isAdmin: boolean;
}

function initials(name: string, company: string) {
  const src = name || company || "?";
  return src.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function clientRevenue(leads: LeadMini[]) {
  return leads
    .filter((l) => l.status === "signed")
    .reduce((s, l) => s + (l.adjusted_price ?? l.total_one_time), 0);
}

function lastActivity(leads: LeadMini[]) {
  if (!leads.length) return null;
  return [...leads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0].created_at;
}

// Bouton copier-dans-le-presse-papier avec feedback visuel
function CopyButton({
  text,
  icon: Icon,
}: {
  text: string;
  icon: React.ElementType;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // ignore
      }
    },
    [text]
  );

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copié !" : `Copier ${text}`}
      className={`
        flex items-center gap-2 text-xs group transition-colors duration-150
        ${copied ? "text-success" : "text-muted hover:text-accent"}
      `}
    >
      {copied ? (
        <Check size={12} className="text-success shrink-0" />
      ) : (
        <Icon size={12} className="text-faint shrink-0 group-hover:text-accent transition-colors" />
      )}
      <span className="truncate">{text}</span>
    </button>
  );
}

export function ClientsListClient({ clients, isAdmin }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, query]);

  return (
    <>
      {/* Barre de recherche */}
      {clients.length > 0 && (
        <div className="relative mb-4 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client…"
            className="
              w-full h-9 pl-8 pr-8 rounded-[10px]
              bg-surface border border-white/8
              text-sm text-textc placeholder:text-faint
              outline-none focus:border-accent/40 transition-colors
            "
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-textc transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="rounded-card bg-surface border border-white/8 text-center py-16">
          <BookUser
            size={32}
            className="text-faint mx-auto mb-3"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          <p className="text-muted text-sm" style={{ animation: "fadeInUp 0.3s ease-out 0.1s both" }}>
            Aucun client pour le moment
          </p>
          <p className="text-faint text-xs mt-1 mb-4" style={{ animation: "fadeInUp 0.3s ease-out 0.2s both" }}>
            Créez un client ou démarrez par un RDV
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card bg-surface border border-white/8 text-center py-12">
          <p className="text-muted text-sm">Aucun résultat pour « {query} »</p>
          <button
            onClick={() => setQuery("")}
            className="text-xs text-accent hover:underline mt-2"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client, i) => {
            const revenue  = clientRevenue(client.leads);
            const activity = lastActivity(client.leads);
            const signed   = client.leads.filter((l) => l.status === "signed").length;
            const lastLead = [...client.leads].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            return (
              <div
                key={client.id}
                className="
                  lead-row-enter rounded-card bg-surface border border-white/8 p-5
                  flex flex-col gap-4
                  hover:border-white/[0.15] hover:-translate-y-0.5
                  hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]
                  transition-all duration-200 group
                "
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* En-tête */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0 group-hover:border-accent/35 transition-colors">
                    {initials(client.name, client.company)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textc truncate">
                      {client.name || "—"}
                    </p>
                    {client.company && (
                      <p className="text-xs text-muted truncate">{client.company}</p>
                    )}
                    {isAdmin && client.profiles?.full_name && (
                      <p className="text-[10px] text-faint mt-0.5">
                        {client.profiles.full_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Coordonnées cliquables + copy */}
                {(client.email || client.phone) && (
                  <div className="flex flex-col gap-1.5">
                    {client.email && (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`mailto:${client.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors min-w-0"
                        >
                          <Mail size={12} className="text-faint shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </a>
                        <CopyButton text={client.email} icon={Mail} />
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${client.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-colors"
                        >
                          <Phone size={12} className="text-faint shrink-0" />
                          <span>{client.phone}</span>
                        </a>
                        <CopyButton text={client.phone} icon={Phone} />
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                  <div className="flex-1">
                    <p className="text-[10px] text-faint">Leads</p>
                    <p className="text-sm font-bold text-textc">{client.leads.length}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-faint">Signés</p>
                    <p className={`text-sm font-bold ${signed > 0 ? "text-success" : "text-faint"}`}>
                      {signed}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-faint">CA</p>
                    <p className={`text-sm font-bold ${revenue > 0 ? "text-accent" : "text-faint"}`}>
                      {revenue > 0 ? formatPrice(revenue) : "—"}
                    </p>
                  </div>
                </div>

                {activity && (
                  <p className="text-[10px] text-faint -mt-2">
                    Dernière activité :{" "}
                    {new Date(activity).toLocaleDateString("fr-FR")}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/rdv/nouveau?clientId=${client.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-all active:scale-95"
                  >
                    <Plus size={12} />
                    Nouveau RDV
                  </Link>
                  <Link
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[10px] bg-surface2 hover:bg-white/8 text-muted hover:text-textc text-xs transition-all active:scale-95 border border-white/8"
                    title="Fiche client"
                  >
                    <BookUser size={12} />
                  </Link>
                  {lastLead && (
                    <Link
                      href={`/rdv/${lastLead.id}`}
                      className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[10px] bg-surface2 hover:bg-white/8 text-muted hover:text-textc text-xs transition-all active:scale-95 border border-white/8"
                      title="Voir le dernier lead"
                    >
                      <FileText size={12} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
