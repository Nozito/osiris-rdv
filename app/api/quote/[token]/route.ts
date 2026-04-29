// OSIRIS CRM — API lien de devis signable
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase   = await createServerClient();

  const { data: qt, error } = await supabase
    .from("quote_tokens")
    .select("*, leads(*)")
    .eq("token", token)
    .single();

  if (error || !qt) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  if (new Date(qt.expires_at) < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  // Marquer l'ouverture au premier accès
  if (!qt.opened_at) {
    await supabase
      .from("quote_tokens")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", qt.id);
  }

  return NextResponse.json({ token: qt, lead: qt.leads });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase   = await createServerClient();

  const { data: qt, error } = await supabase
    .from("quote_tokens")
    .select("id, lead_id, expires_at, signed_at")
    .eq("token", token)
    .single();

  if (error || !qt) {
    return NextResponse.json({ error: "Token invalide" }, { status: 404 });
  }

  if (new Date(qt.expires_at) < new Date()) {
    return NextResponse.json({ error: "Lien expiré" }, { status: 410 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (typeof body.signedByName === "string") {
    // Signature
    if (qt.signed_at) {
      return NextResponse.json({ error: "Devis déjà signé" }, { status: 409 });
    }
    await supabase
      .from("quote_tokens")
      .update({
        signed_at:     new Date().toISOString(),
        signed_by_name: body.signedByName,
      })
      .eq("id", qt.id);

    await supabase
      .from("leads")
      .update({ status: "signed" })
      .eq("id", qt.lead_id);

    return NextResponse.json({ ok: true, action: "signed" });
  }

  if (typeof body.request === "string") {
    // Demande de modification
    await supabase
      .from("quote_tokens")
      .update({ modification_request: body.request })
      .eq("id", qt.id);

    // Notifier le commercial par email si Resend est configuré
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "OSIRIS <noreply@osiris-web.com>";
    const notifyEmail = process.env.NEXT_PUBLIC_DIRECTOR_EMAILS?.split(",")[0]?.trim();

    if (apiKey && notifyEmail) {
      const { data: lead } = await supabase
        .from("leads")
        .select("client_name")
        .eq("id", qt.lead_id)
        .single();

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromEmail,
          to: [notifyEmail],
          subject: `[OSIRIS] Demande de modification — ${lead?.client_name ?? "Client"}`,
          html: `<p><strong>${lead?.client_name ?? "Un client"}</strong> demande une modification :</p><blockquote>${body.request}</blockquote>`,
        }),
      });
    }

    return NextResponse.json({ ok: true, action: "modification_requested" });
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 });
}
