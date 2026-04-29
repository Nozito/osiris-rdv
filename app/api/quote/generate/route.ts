// OSIRIS CRM — génération d'un token de devis signable
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (typeof body.leadId !== "string" || !body.leadId) {
    return NextResponse.json({ error: "leadId requis" }, { status: 422 });
  }

  // Vérifier que le lead appartient bien à cet utilisateur (ou est admin)
  const { data: lead } = await supabase
    .from("leads")
    .select("id, commercial_id")
    .eq("id", body.leadId)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead introuvable" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as { role: string } | null)?.role === "admin";
  if (!isAdmin && lead.commercial_id !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Créer le token
  const { data: qt, error } = await supabase
    .from("quote_tokens")
    .insert({ lead_id: body.leadId })
    .select("token, expires_at")
    .single();

  if (error || !qt) {
    return NextResponse.json({ error: "Erreur lors de la création du token" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link   = `${appUrl}/devis/${qt.token}`;

  return NextResponse.json({ token: qt.token, link, expiresAt: qt.expires_at });
}
