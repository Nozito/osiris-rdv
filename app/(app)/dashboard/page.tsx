export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/pricing";
import type { Lead } from "@/types";
import {
  Plus,
  FileText,
  LogOut,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BookUser,
  Trash2,
} from "lucide-react";
import { DeleteLeadButton } from "@/components/DeleteLeadButton";

async function signOut() {
  "use server";
  const { createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("commercial_id", user.id)
    .order("created_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

  const stats = {
    total: allLeads.length,
    signed: allLeads.filter((l) => l.status === "signed").length,
    revenue: allLeads
      .filter((l) => l.status === "signed")
      .reduce((s, l) => s + (l.adjusted_price ?? l.total_one_time), 0),
    pending: allLeads.filter((l) => l.status === "sent").length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/8 bg-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold text-textc font-display leading-tight">OSIRIS</h1>
            <p className="text-xs text-muted hidden sm:block">Mon espace commercial</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/clients"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-textc transition-colors"
            >
              <BookUser size={14} />
              <span className="hidden sm:inline">Clients</span>
            </Link>
            <Link
              href="/admin"
              className="text-xs text-muted hover:text-textc transition-colors hidden sm:block"
            >
              Admin →
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-textc transition-colors"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
            <Link
              href="/rdv/nouveau"
              className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-btn bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Nouveau RDV</span>
              <span className="sm:hidden">RDV</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total leads", value: stats.total,   icon: <Users size={16} />,       format: "number" },
            { label: "Envoyés",     value: stats.pending,  icon: <Clock size={16} />,        format: "number" },
            { label: "Signés",      value: stats.signed,   icon: <TrendingUp size={16} />,   format: "number" },
            { label: "CA signé",    value: stats.revenue,  icon: <DollarSign size={16} />,   format: "price"  },
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

        {/* Leads */}
        <div className="rounded-card bg-surface border border-white/8 overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-textc font-display">Mes leads</h2>
            <span className="text-xs text-muted">{allLeads.length} lead(s)</span>
          </div>

          {allLeads.length === 0 ? (
            <div className="text-center py-14">
              <FileText size={28} className="text-faint mx-auto mb-3" />
              <p className="text-muted text-sm">Aucun lead pour le moment</p>
              <p className="text-faint text-xs mt-1 mb-4">Créez votre premier RDV</p>
              <Link
                href="/rdv/nouveau"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
              >
                <Plus size={14} />
                Nouveau RDV
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {allLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] transition-colors group">
                  <Link href={`/rdv/${lead.id}`} className="flex-1 min-w-0 flex items-center gap-3">
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
                        {lead.project_type ? lead.project_type.replace(/-/g, " ") : "Projet non défini"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-textc hidden sm:block">
                        {formatPrice(lead.adjusted_price ?? lead.total_one_time)}
                      </span>
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-faint hidden md:block">
                        {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </Link>

                  {/* Supprimer brouillon */}
                  {lead.status === "draft" && (
                    <DeleteLeadButton leadId={lead.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
