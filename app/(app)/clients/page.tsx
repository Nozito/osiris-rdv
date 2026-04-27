export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/pricing";
import type { Client, Profile } from "@/types";
import {
  BookUser,
  Plus,
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  FileText,
  Users,
} from "lucide-react";

type LeadMini = {
  id: string;
  status: string;
  total_one_time: number;
  adjusted_price: number | null;
  created_at: string;
};

type ClientWithLeads = Client & {
  leads: LeadMini[];
  profiles: { full_name: string } | null;
};

function initials(name: string, company: string) {
  const src = name || company || "?";
  return src
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function clientRevenue(leads: LeadMini[]) {
  return leads
    .filter((l) => l.status === "signed")
    .reduce((s, l) => s + (l.adjusted_price ?? l.total_one_time), 0);
}

function lastActivity(leads: LeadMini[]) {
  if (!leads.length) return null;
  return leads.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0].created_at;
}

export default async function ClientsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Rôle de l'utilisateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as Profile | null)?.role === "admin";

  // Clients — admin voit tout (via RLS), commercial voit les siens
  const { data: rawClients } = await supabase
    .from("clients")
    .select(
      `*, leads(id, status, total_one_time, adjusted_price, created_at),
       profiles!commercial_id(full_name)`
    )
    .order("name");

  const clients = (rawClients ?? []) as ClientWithLeads[];

  const totalClients = clients.length;
  const totalLeads = clients.reduce((s, c) => s + c.leads.length, 0);
  const totalRevenue = clients.reduce((s, c) => s + clientRevenue(c.leads), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/8 bg-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted hover:text-textc transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-textc font-display flex items-center gap-2">
                <BookUser size={17} className="text-accent" />
                {isAdmin ? "Base clients (admin)" : "Mon carnet clients"}
              </h1>
              <p className="text-xs text-muted hidden sm:block">
                {isAdmin
                  ? "Tous les clients de l'équipe"
                  : "Vos prospects et clients"}
              </p>
            </div>
          </div>
          <Link
            href="/rdv/nouveau"
            className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nouveau RDV</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Clients",      value: totalClients, icon: <Users size={16} />,       format: "number" },
            { label: "Leads total",  value: totalLeads,   icon: <FileText size={16} />,    format: "number" },
            { label: "CA signé",     value: totalRevenue, icon: <TrendingUp size={16} />,  format: "price"  },
          ].map((stat, i) => (
            <div key={i} className="rounded-card bg-surface border border-white/8 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent">{stat.icon}</span>
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-textc font-display">
                {stat.format === "price" ? formatPrice(stat.value) : stat.value}
              </p>
            </div>
          ))}
        </div>

        {clients.length === 0 ? (
          <div className="rounded-card bg-surface border border-white/8 text-center py-16">
            <BookUser size={32} className="text-faint mx-auto mb-3" />
            <p className="text-muted text-sm">Aucun client pour le moment</p>
            <p className="text-faint text-xs mt-1 mb-4">
              Créez un RDV pour ajouter votre premier client
            </p>
            <Link
              href="/rdv/nouveau"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              Nouveau RDV
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const revenue = clientRevenue(client.leads);
              const activity = lastActivity(client.leads);
              const signed = client.leads.filter((l) => l.status === "signed").length;

              return (
                <div
                  key={client.id}
                  className="rounded-card bg-surface border border-white/8 p-5 flex flex-col gap-4 hover:border-white/15 transition-colors group"
                >
                  {/* En-tête client */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shrink-0">
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
                        <p className="text-xs text-faint mt-0.5">
                          Commercial : {client.profiles.full_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="flex flex-col gap-1.5">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Mail size={12} className="text-faint shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Phone size={12} className="text-faint shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats leads */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/8">
                    <div className="flex-1">
                      <p className="text-xs text-faint">Leads</p>
                      <p className="text-sm font-bold text-textc">{client.leads.length}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-faint">Signés</p>
                      <p className="text-sm font-bold text-success">{signed}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-faint">CA</p>
                      <p className="text-sm font-bold text-accent">
                        {revenue > 0 ? formatPrice(revenue) : "—"}
                      </p>
                    </div>
                  </div>

                  {activity && (
                    <p className="text-xs text-faint -mt-2">
                      Dernière activité :{" "}
                      {new Date(activity).toLocaleDateString("fr-FR")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/rdv/nouveau?clientId=${client.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[10px] bg-accent hover:bg-accent-hover text-white text-xs font-medium transition-colors"
                    >
                      <Plus size={12} />
                      Nouveau RDV
                    </Link>
                    {client.leads.length > 0 && (
                      <Link
                        href={`/rdv/${client.leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].id}`}
                        className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[10px] bg-surface2 hover:bg-white/8 text-muted text-xs transition-colors border border-white/8"
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
      </main>
    </div>
  );
}
