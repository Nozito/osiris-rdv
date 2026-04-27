export const dynamic = "force-dynamic";
import { use } from "react";
import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import type { Lead, WizardData } from "@/types";

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

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !lead) notFound();

  const wizardData = leadToWizardData(lead as Lead);

  return <WizardShell initialData={wizardData} existingLeadId={id} />;
}
