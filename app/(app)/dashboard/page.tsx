export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { LeadListClient } from "@/components/LeadListClient";
import type { Lead } from "@/types";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";

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
    .order("updated_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

  // OSIRIS CRM — pricing configurator: prefer quote_data.totalTTC for revenue KPI
  const dealValue = (l: Lead) =>
    l.quote_data?.totalTTC ?? l.adjusted_price ?? l.total_one_time;

  const stats = {
    total:   allLeads.length,
    signed:  allLeads.filter((l) => l.status === "signed").length,
    revenue: allLeads
      .filter((l) => l.status === "signed")
      .reduce((s, l) => s + dealValue(l), 0),
    pending: allLeads.filter((l) => l.status === "sent").length,
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* OSIRIS UX — KPI cards animés */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <KpiCard label="Total leads" value={stats.total}   icon={<Users size={16} />}      format="number" />
          <KpiCard label="Envoyés"     value={stats.pending}  icon={<Clock size={16} />}       format="number" />
          <KpiCard label="Signés"      value={stats.signed}   icon={<TrendingUp size={16} />}  format="number" />
          <KpiCard label="CA signé"    value={stats.revenue}  icon={<DollarSign size={16} />}  format="price" glint />
        </div>

        {/* OSIRIS UX — liste avec search, filtres statut, changement rapide */}
        <LeadListClient initialLeads={allLeads} />
      </main>
    </div>
  );
}
