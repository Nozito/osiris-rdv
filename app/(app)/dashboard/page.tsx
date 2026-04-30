export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { LeadListClient } from "@/components/LeadListClient";
import { LeadPipeline } from "@/components/LeadPipeline";
import type { Lead } from "@/types";
import { TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import { QuickAddLead } from "@/components/QuickAddLead";
import { formatPrice } from "@/lib/pricing";
import Link from "next/link";

function KpiBento({
  label,
  value,
  icon,
  format = "number",
  glint = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  format?: "number" | "price" | "percent";
  glint?: boolean;
}) {
  const display =
    format === "price"   ? formatPrice(value) :
    format === "percent" ? `${value}%`         :
    String(value);

  return (
    <div className="bento-card relative overflow-hidden">
      {glint && (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 w-12 pointer-events-none"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)",
            transform: "skewX(-12deg)",
            animation: "glint 1.8s ease-out 0.4s 1 forwards",
            left: "-48px",
          }}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-faint uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-textc tabular-nums font-display">{display}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leads } = await supabase
    .from("leads")
    .select("id,created_at,updated_at,status,client_id,client_name,client_email,client_company,client_phone,project_type,project_description,project_deadline,selected_pages,design_style,brand_assets,tech_options,budget_range,total_one_time,total_monthly,adjusted_price,notes,recommendation,quote_data,discount_percent,discount_reason,discount_conditions,discount_validated_at,discount_validated_by,rdv_date,rdv_notes,commercial_id")
    .eq("commercial_id", user.id)
    .order("updated_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

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
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-textc font-display">Dashboard</h1>
            <p className="text-xs text-faint mt-0.5">{allLeads.length} lead{allLeads.length !== 1 ? "s" : ""} au total</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAddLead />
            <Link
              href="/rdv/nouveau"
              className="flex items-center gap-1.5 h-8 px-3 rounded-[10px] bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-[0_0_16px_rgba(99,102,241,0.35)]"
            >
              + Nouveau RDV
            </Link>
          </div>
        </div>

        {/* Row 1 — 4 KPI cards */}
        <div className="bento-grid mb-4">
          <KpiBento label="Total leads"  value={stats.total}    icon={<Users size={15} />}     />
          <KpiBento label="Envoyés"      value={stats.pending}  icon={<Clock size={15} />}      />
          <KpiBento label="Signés"       value={stats.signed}   icon={<TrendingUp size={15} />} />
          <KpiBento label="CA signé"     value={stats.revenue}  icon={<DollarSign size={15} />} format="price" glint />
        </div>

        {/* Row 2 — Taux conversion + Pipeline */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bento-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-faint uppercase tracking-widest">Conversion</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Target size={14} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-textc tabular-nums font-display">{conversionRate}%</p>
            <p className="text-xs text-faint mt-2">
              {stats.signed} / {stats.total} lead{stats.total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="col-span-1 lg:col-span-3">
            <LeadPipeline {...pipeline} />
          </div>
        </div>

        {/* Liste leads */}
        <LeadListClient initialLeads={allLeads} />
      </main>
    </div>
  );
}
