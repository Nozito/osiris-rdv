export const dynamic = "force-dynamic";
import type { Metadata } from "next";

import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ClientDetailClient } from "@/components/ClientDetailClient";
import type { Lead } from "@/types";

export const metadata: Metadata = { title: "Fiche client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) notFound();

  const { data: rawLeads } = await supabase
    .from("leads")
    .select("id, status, total_one_time, adjusted_price, created_at, project_type, commercial_id, quote_data, profiles!commercial_id(full_name)")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const leads = (rawLeads ?? []) as unknown as (Lead & { profiles: { full_name: string } | null })[];

  return (
    <div className="min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-5">
        <div className="mb-4">
          <Breadcrumb
            items={[
              { label: "OSIRIS",  href: "/dashboard" },
              { label: "Clients", href: "/clients" },
              { label: client.name || "Client" },
            ]}
          />
        </div>
        <ClientDetailClient client={client} leads={leads} />
      </main>
    </div>
  );
}
