export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Nouveau RDV" };

import { createServerClient } from "@/lib/supabase/server";
import { NouveauRdvWrapper } from "@/components/wizard/NouveauRdvWrapper";
import type { ConfiguratorData } from "@/types";

export default async function NouveauRdvPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;

  let initialData: Partial<ConfiguratorData> = {};
  let hasPrefilledClient = false;

  // Pré-remplissage si clientId fourni depuis la fiche client
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
        clientCompany:   client.company,
      };
      hasPrefilledClient = true;
    }
  }

  return (
    <NouveauRdvWrapper
      initialData={initialData}
      hasPrefilledClient={hasPrefilledClient}
    />
  );
}
