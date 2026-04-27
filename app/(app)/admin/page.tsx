export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/pricing";
import type { Lead, Profile } from "@/types";
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  BookUser,
} from "lucide-react";

export default async function AdminPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if ((profile as Profile)?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  const allLeads = (leads ?? []) as (Lead & {
    profiles: { full_name: string; email: string } | null;
  })[];

  const grouped = allLeads.reduce(
    (acc, lead) => {
      const email = lead.profiles?.email ?? "unknown";
      if (!acc[email]) acc[email] = [];
      acc[email].push(lead);
      return acc;
    },
    {} as Record<string, typeof allLeads>
  );

  const totalRevenue = allLeads
    .filter((l) => l.status === "signed")
    .reduce((s, l) => s + (l.adjusted_price ?? l.total_one_time), 0);

  const statuses = ["draft", "sent", "signed", "lost"] as const;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/8 bg-surface/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-muted hover:text-textc transition-colors"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-textc font-display flex items-center gap-2">
                <Shield size={18} className="text-accent" />
                Administration
              </h1>
              <p className="text-xs text-muted">Tous les leads — vue globale</p>
            </div>
          </div>
          <Link
            href="/clients"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-textc transition-colors"
          >
            <BookUser size={14} />
            <span className="hidden sm:inline">Base clients</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats globales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total leads",
              value: allLeads.length,
              icon: <Users size={18} />,
              format: "number",
            },
            {
              label: "Signés",
              value: allLeads.filter((l) => l.status === "signed").length,
              icon: <TrendingUp size={18} />,
              format: "number",
            },
            {
              label: "Taux de signature",
              value: allLeads.length
                ? Math.round(
                    (allLeads.filter((l) => l.status === "signed").length /
                      allLeads.length) *
                      100
                  )
                : 0,
              icon: <TrendingUp size={18} />,
              format: "percent",
            },
            {
              label: "CA total signé",
              value: totalRevenue,
              icon: <DollarSign size={18} />,
              format: "price",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-card bg-surface border border-white/8 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-accent">{stat.icon}</span>
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-textc font-display">
                {stat.format === "price"
                  ? formatPrice(stat.value)
                  : stat.format === "percent"
                  ? `${stat.value}%`
                  : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Répartition par statut */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statuses.map((s) => {
            const count = allLeads.filter((l) => l.status === s).length;
            return (
              <div
                key={s}
                className="rounded-2xl bg-surface border border-white/8 px-4 py-3 flex items-center justify-between"
              >
                <StatusBadge status={s} />
                <span className="text-lg font-bold text-textc">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Leads par commercial */}
        {Object.entries(grouped).map(([email, leads]) => (
          <div
            key={email}
            className="rounded-card bg-surface border border-white/8 overflow-hidden mb-4"
          >
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between bg-surface2">
              <div>
                <p className="text-sm font-semibold text-textc">
                  {leads[0]?.profiles?.full_name ?? email}
                </p>
                <p className="text-xs text-muted">{email}</p>
              </div>
              <span className="text-xs text-muted">{leads.length} lead(s)</span>
            </div>

            <div className="divide-y divide-white/8">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/rdv/${lead.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textc truncate group-hover:text-accent transition-colors">
                      {lead.client_name || "Sans nom"}
                      {lead.client_company
                        ? ` — ${lead.client_company}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {lead.project_type?.replace(/-/g, " ") ??
                        "Type non défini"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-textc hidden sm:block">
                      {formatPrice(
                        lead.adjusted_price ?? lead.total_one_time
                      )}
                    </span>
                    <StatusBadge status={lead.status} />
                    <span className="text-xs text-faint hidden md:block">
                      {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {allLeads.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted text-sm">Aucun lead dans la base</p>
          </div>
        )}
      </main>
    </div>
  );
}
