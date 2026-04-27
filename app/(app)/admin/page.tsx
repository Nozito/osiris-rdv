export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Administration" };
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/ui/KpiCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatPrice } from "@/lib/pricing";
import type { Lead, Profile } from "@/types";
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  BarChart2,
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

  // OSIRIS CRM — pricing configurator: prefer quote_data.totalTTC for all revenue KPIs
  const dealValue = (l: Lead) =>
    l.quote_data?.totalTTC ?? l.adjusted_price ?? l.total_one_time;

  const signedLeads = allLeads.filter((l) => l.status === "signed");
  const totalRevenue = signedLeads.reduce((s, l) => s + dealValue(l), 0);
  const avgDealSize  = allLeads.length
    ? Math.round(allLeads.reduce((s, l) => s + dealValue(l), 0) / allLeads.length)
    : 0;

  const conversionRate = allLeads.length
    ? Math.round((signedLeads.length / allLeads.length) * 100)
    : 0;

  const statuses = ["draft", "sent", "signed", "lost"] as const;

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* OSIRIS UX — breadcrumb */}
        <Breadcrumb
          items={[
            { label: "OSIRIS", href: "/dashboard" },
            { label: "Administration", href: "/admin" },
            { label: "Tous les leads" },
          ]}
        />

        {/* OSIRIS UX — animated KPI cards — OSIRIS CRM — pricing configurator */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <KpiCard label="Total leads"       value={allLeads.length}    icon={<Users size={18} />}      format="number" />
          <KpiCard label="Signés"            value={signedLeads.length} icon={<TrendingUp size={18} />} format="number" />
          <KpiCard label="Taux de signature" value={conversionRate}     icon={<TrendingUp size={18} />} format="percent" />
          <KpiCard label="CA total signé"    value={totalRevenue}       icon={<DollarSign size={18} />} format="price"  glint />
        </div>
        {/* OSIRIS CRM — pricing configurator: average deal size across all leads */}
        <div className="grid grid-cols-1 mb-6">
          <KpiCard label="Panier moyen (tous leads)" value={avgDealSize} icon={<BarChart2 size={18} />} format="price" />
        </div>

        {/* Répartition par statut */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statuses.map((s, i) => {
            const count = allLeads.filter((l) => l.status === s).length;
            return (
              <div
                key={s}
                className="lead-row-enter rounded-2xl bg-surface border border-white/8 px-4 py-3 flex items-center justify-between"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <StatusBadge status={s} />
                <span className="text-lg font-bold text-textc">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Leads par commercial */}
        {Object.entries(grouped).map(([email, groupLeads]) => (
          <div
            key={email}
            className="rounded-card bg-surface border border-white/8 overflow-hidden mb-4"
          >
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between bg-surface2">
              <div>
                <p className="text-sm font-semibold text-textc">
                  {groupLeads[0]?.profiles?.full_name ?? email}
                </p>
                <p className="text-xs text-muted">{email}</p>
              </div>
              <span className="text-xs text-muted">{groupLeads.length} lead(s)</span>
            </div>

            <div className="divide-y divide-white/8">
              {groupLeads.map((lead, i) => (
                /* OSIRIS UX — staggered entrance + status-colored left border on hover */
                <Link
                  key={lead.id}
                  href={`/rdv/${lead.id}`}
                  className="lead-row-enter flex items-center gap-4 px-5 py-3.5 transition-colors group"
                  style={{ animationDelay: `${i * 40}ms` }}
                  data-lead-row
                  data-status={lead.status}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textc truncate group-hover:text-accent transition-colors">
                      {lead.client_name || "Sans nom"}
                      {lead.client_company ? ` — ${lead.client_company}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {lead.project_type?.replace(/-/g, " ") ?? "Type non défini"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* OSIRIS CRM — pricing configurator */}
                    <span className="text-sm font-semibold text-textc hidden sm:block">
                      {lead.quote_data
                        ? lead.quote_data.totalTTC.toLocaleString("fr-FR") + " €"
                        : formatPrice(lead.adjusted_price ?? lead.total_one_time)}
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
          /* OSIRIS UX — animated empty state */
          <div className="text-center py-16">
            <FileText
              size={28}
              className="text-faint mx-auto mb-3"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            <p
              className="text-muted text-sm"
              style={{ animation: "fadeInUp 0.3s ease-out 0.1s both" }}
            >
              Aucun lead dans la base
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
