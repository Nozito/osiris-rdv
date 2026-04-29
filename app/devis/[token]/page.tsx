export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Proposition commerciale — OSIRIS" };

import { createServerClient } from "@/lib/supabase/server";
import { QuotePublicView } from "@/components/QuotePublicView";
import type { Lead } from "@/types";

export default async function QuotePublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase  = await createServerClient();

  const { data: qt } = await supabase
    .from("quote_tokens")
    .select("*, leads(*)")
    .eq("token", token)
    .single();

  if (!qt) {
    return (
      <div className="min-h-screen bg-[#08081a] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-2">Lien invalide</p>
          <p className="text-slate-400">Ce lien de devis n'existe pas.</p>
        </div>
      </div>
    );
  }

  const expired = new Date(qt.expires_at) < new Date();

  // Marquer opened_at si premier accès (server-side)
  if (!qt.opened_at && !expired) {
    await supabase
      .from("quote_tokens")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", qt.id);
  }

  return (
    <QuotePublicView
      token={token}
      qt={qt}
      lead={qt.leads as Lead}
      expired={expired}
    />
  );
}
