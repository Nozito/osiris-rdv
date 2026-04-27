export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Nouveau RDV" };

import { createServerClient } from "@/lib/supabase/server";
// OSIRIS CRM — pricing configurator
import { ConfiguratorShell } from "@/components/wizard/ConfiguratorShell";
import type { ConfiguratorData } from "@/types";

export default async function NouveauRdvPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  let initialData: Partial<ConfiguratorData> = {};

  // OSIRIS CRM — pricing configurator: pre-fill client info if coming from client page
  if (clientId) {
    const supabase = await createServerClient();
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (client) {
      const parts = (client.name as string).split(" ");
      initialData = {
        clientId:        client.id,
        clientFirstName: parts[0] ?? "",
        clientLastName:  parts.slice(1).join(" "),
        clientEmail:     client.email,
        clientPhone:     client.phone,
      };
    }
  }

  return <ConfiguratorShell initialData={initialData} />;
}
