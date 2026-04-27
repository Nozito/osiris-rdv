export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { createServerClient } = await import("@/lib/supabase/server");
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("leads")
    .select("client_name, client_company")
    .eq("id", id)
    .single();
  const label = data?.client_name || data?.client_company || "Lead";
  return { title: label };
}
import { createServerClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import type { Lead, WizardData, Profile } from "@/types";

function leadToWizardData(lead: Lead): Partial<WizardData> {
  return {
    clientId: lead.client_id ?? null,
    clientName: lead.client_name,
    clientEmail: lead.client_email,
    clientCompany: lead.client_company,
    clientPhone: lead.client_phone,
    projectType: lead.project_type,
    projectDescription: lead.project_description,
    projectDeadline: lead.project_deadline ?? "",
    selectedPages: lead.selected_pages ?? [],
    designStyle: lead.design_style || "template",
    brandAssets: lead.brand_assets ?? false,
    techOptions: lead.tech_options ?? [],
    budgetRange: lead.budget_range ?? "",
    notes: lead.notes ?? "",
    adjustedPrice: lead.adjusted_price ?? null,
  };
}

export default async function RdvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Vérifier le rôle pour savoir si admin peut voir tous les leads
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as Pick<Profile, "role"> | null)?.role === "admin";

  // Récupérer le lead — les admins voient tout, les commerciaux seulement leurs leads
  const baseQuery = supabase.from("leads").select("*").eq("id", id);
  const { data: lead, error } = isAdmin
    ? await baseQuery.single()
    : await baseQuery.eq("commercial_id", user.id).single();

  if (error || !lead) notFound();

  const typedLead = lead as unknown as Lead;
  const wizardData = leadToWizardData(typedLead);

  return (
    <WizardShell
      initialData={wizardData}
      existingLeadId={id}
      initialStatus={typedLead.status}
    />
  );
}
