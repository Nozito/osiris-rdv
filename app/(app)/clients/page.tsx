export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Clients" };

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { KpiCard } from "@/components/ui/KpiCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Profile } from "@/types";
import { TrendingUp, FileText, Users } from "lucide-react";
import { NewClientModal } from "@/components/NewClientModal";
import { ClientsListClient, type ClientRow } from "@/components/ClientsListClient";

function clientRevenue(leads: ClientRow["leads"]) {
  return leads
    .filter((l) => l.status === "signed")
    .reduce((s, l) => s + (l.adjusted_price ?? l.total_one_time), 0);
}

export default async function ClientsPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as Profile | null)?.role === "admin";

  const clientsQuery = supabase
    .from("clients")
    .select(
      `*, leads(id, status, total_one_time, adjusted_price, created_at),
       profiles!commercial_id(full_name)`
    )
    .order("name");

  const { data: rawClients } = isAdmin
    ? await clientsQuery
    : await clientsQuery.eq("commercial_id", user.id);

  const clients = (rawClients ?? []) as ClientRow[];

  const totalClients = clients.length;
  const totalLeads   = clients.reduce((s, c) => s + c.leads.length, 0);
  const totalRevenue = clients.reduce((s, c) => s + clientRevenue(c.leads), 0);

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-5">

        {/* Titre + bouton nouveau client */}
        <div className="flex items-center justify-between mb-4">
          <Breadcrumb
            items={[
              { label: "OSIRIS", href: "/dashboard" },
              { label: "Clients" },
            ]}
          />
          <NewClientModal />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <KpiCard label="Clients"     value={totalClients} icon={<Users size={16} />}      format="number" />
          <KpiCard label="Leads total" value={totalLeads}   icon={<FileText size={16} />}   format="number" />
          <KpiCard label="CA signé"    value={totalRevenue} icon={<TrendingUp size={16} />} format="price" glint />
        </div>

        {/* Liste client avec recherche + copy-to-clipboard */}
        <ClientsListClient clients={clients} isAdmin={isAdmin} />

      </main>
    </div>
  );
}
