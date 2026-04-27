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
// OSIRIS CRM — pricing configurator
import { ConfiguratorShell } from "@/components/wizard/ConfiguratorShell";
import type { Lead, WizardData, ConfiguratorData, Profile } from "@/types";

function leadToWizardData(lead: Lead): Partial<WizardData> {
  return {
    clientId:          lead.client_id ?? null,
    clientName:        lead.client_name,
    clientEmail:       lead.client_email,
    clientCompany:     lead.client_company,
    clientPhone:       lead.client_phone,
    projectType:       lead.project_type,
    projectDescription: lead.project_description,
    projectDeadline:   lead.project_deadline ?? "",
    selectedPages:     lead.selected_pages ?? [],
    designStyle:       lead.design_style || "template",
    brandAssets:       lead.brand_assets ?? false,
    techOptions:       lead.tech_options ?? [],
    budgetRange:       lead.budget_range ?? "",
    notes:             lead.notes ?? "",
    adjustedPrice:     lead.adjusted_price ?? null,
  };
}

// OSIRIS CRM — pricing configurator: map lead.quote_data back to ConfiguratorData
function leadToConfiguratorData(lead: Lead): Partial<ConfiguratorData> {
  const qd = lead.quote_data;
  const parts = (lead.client_name ?? "").split(" ");
  const base: Partial<ConfiguratorData> = {
    clientId:        lead.client_id ?? null,
    clientFirstName: parts[0] ?? "",
    clientLastName:  parts.slice(1).join(" "),
    clientEmail:     lead.client_email,
    clientPhone:     lead.client_phone,
  };
  if (qd) {
    return {
      ...base,
      // Pré-qualification
      clientCompany:     qd.clientCompany     ?? "",
      clientIndustry:    qd.clientIndustry    ?? "",
      clientCompanySize: qd.clientCompanySize ?? "",
      clientCurrentSite: qd.clientCurrentSite ?? "",
      clientSiteUrl:     qd.clientSiteUrl     ?? "",
      clientObjectives:  qd.clientObjectives  ?? [],
      clientNeeds:       qd.clientNeeds       ?? "",
      clientBudgetRange: qd.clientBudgetRange ?? "",
      clientOwnEstimate: qd.clientOwnEstimate ?? null,
      clientBudgetNotes: qd.clientBudgetNotes ?? "",
      // Configurateur
      siteTypeId:        qd.siteTypeId,
      extraPages:        qd.extraPages,
      selectedUpgrades:  qd.selectedUpgrades,
      selectedUniversal: qd.selectedUniversal,
      wantsUnlimited:    qd.wantsUnlimited,
      deadlineId:        qd.deadlineId,
    };
  }
  // Graceful fallback for leads created before the configurator
  return {
    ...base,
    siteTypeId: ["vitrine-simple", "vitrine-standard", "vitrine-premium"].includes(lead.project_type)
      ? lead.project_type
      : "vitrine-simple",
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as Pick<Profile, "role"> | null)?.role === "admin";

  const baseQuery = supabase.from("leads").select("*").eq("id", id);
  const { data: lead, error } = isAdmin
    ? await baseQuery.single()
    : await baseQuery.eq("commercial_id", user.id).single();

  if (error || !lead) notFound();

  const typedLead = lead as unknown as Lead;

  // OSIRIS CRM — pricing configurator: use ConfiguratorShell for leads with quote_data,
  // preserve WizardShell for older leads without it
  if (typedLead.quote_data) {
    const configData = leadToConfiguratorData(typedLead);
    return (
      <ConfiguratorShell
        initialData={configData}
        existingLeadId={id}
        initialStatus={typedLead.status}
        initialStep={8}
      />
    );
  }

  return (
    <WizardShell
      initialData={leadToWizardData(typedLead)}
      existingLeadId={id}
      initialStatus={typedLead.status}
    />
  );
}
