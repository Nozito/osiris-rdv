"use client";
// OSIRIS CRM — wrapper de la page nouveau RDV : sélecteur client → configurateur

import { useState } from "react";
import { ConfiguratorShell } from "./ConfiguratorShell";
import { ClientSelectorStep } from "./ClientSelectorStep";
import type { Client, ConfiguratorData } from "@/types";

interface Props {
  initialData:    Partial<ConfiguratorData>;
  hasPrefilledClient: boolean;
}

export function NouveauRdvWrapper({ initialData, hasPrefilledClient }: Props) {
  // Si un client est pré-rempli via searchParams, skip directement le configurateur
  const [clientSelected, setClientSelected] = useState(hasPrefilledClient);
  const [data, setData] = useState<Partial<ConfiguratorData>>(initialData);

  const handleClientSelect = (client: Client) => {
    const parts = (client.name ?? "").split(" ");
    setData({
      clientId:        client.id,
      clientFirstName: parts[0] ?? "",
      clientLastName:  parts.slice(1).join(" "),
      clientEmail:     client.email ?? "",
      clientPhone:     client.phone ?? "",
      clientCompany:   client.company ?? "",
    });
    setClientSelected(true);
  };

  if (!clientSelected) {
    return (
      <ClientSelectorStep
        onSelect={handleClientSelect}
        onSkip={() => setClientSelected(true)}
      />
    );
  }

  return <ConfiguratorShell initialData={data} />;
}
