export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { LeadListClient } from "@/components/LeadListClient";
import { LeadPipeline } from "@/components/LeadPipeline";
import type { Lead } from "@/types";
import { TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import { QuickAddLead } from "@/components/QuickAddLead";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("id,created_at,updated_at,status,client_id,client_name,client_email,client_company,client_phone,project_type,project_description,project_deadline,selected_pages,design_style,brand_assets,tech_options,budget_range,total_one_time,total_monthly,adjusted_price,notes,recommendation,quote_data,discount_percent,discount_reason,discount_conditions,discount_validated_at,discount_validated_by,rdv_date,rdv_notes,commercial_id")
    .eq("commercial_id", user.id)
    .order("updated_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

  // OSIRIS CRM — pricing configurator: prefer quote_data.totalTTC for revenue KPI
  const dealValue = (l: Lead) =>
    l.quote_data?.totalTTC ?? l.adjusted_price ?? l.total_one_time;

  const byStatus = (status: string) => allLeads.filter((l) => l.status === status);
  const sumValue  = (arr: Lead[]) => arr.reduce((s, l) => s + dealValue(l), 0);

  const conversionRate = allLeads.length > 0
    ? Math.round((byStatus("signed").length / allLeads.length) * 100)
    : 0;

  const stats = {
    total:      allLeads.length,
    signed:     byStatus("signed").length,
    revenue:    sumValue(byStatus("signed")),
    pending:    byStatus("sent").length,
    conversion: conversionRate,
  };

  const pipeline = {
    draft:  { count: byStatus("draft").length,  value: sumValue(byStatus("draft"))  },
    sent:   { count: byStatus("sent").length,   value: sumValue(byStatus("sent"))   },
    signed: { count: byStatus("signed").length, value: sumValue(byStatus("signed")) },
    lost:   { count: byStatus("lost").length,   value: sumValue(byStatus("lost"))   },
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-base font-semibold text-textc">Dashboard</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAddLead />
            <Link
              href="/rdv/nouveau"
              className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
            >
              + Nouveau RDV
            </Link>
          </div>
        </div>

        {/* OSIRIS UX — KPI cards animés */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          <KpiCard label="Total leads"        value={stats.total}      icon={<Users size={16} />}      format="number" />
          <KpiCard label="Envoyés"            value={stats.pending}    icon={<Clock size={16} />}       format="number" />
          <KpiCard label="Signés"             value={stats.signed}     icon={<TrendingUp size={16} />}  format="number" />
          <KpiCard label="CA signé"           value={stats.revenue}    icon={<DollarSign size={16} />}  format="price" glint />
          <div className="hidden lg:block">
            <KpiCard label="Taux conversion"  value={stats.conversion} icon={<Target size={16} />}      format="percent" />
          </div>
        </div>

        {/* Pipeline funnel */}
        <LeadPipeline {...pipeline} />

        {/* Liste leads avec search, filtres statut, changement rapide */}
        <LeadListClient initialLeads={allLeads} />
      </main>
    </div>
  );
}
