export const dynamic = "force-dynamic";

import { createServerClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import type { WizardData } from "@/types";

export default async function NouveauRdvPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  let initialData: Partial<WizardData> = {};

  if (clientId) {
    const supabase = await createServerClient();
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (client) {
      initialData = {
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientCompany: client.company,
        clientPhone: client.phone,
      };
    }
  }

  return <WizardShell initialData={initialData} />;
}
