// OSIRIS CRM — pixel tracking email (1x1 transparent PNG)
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Image 1×1 pixel PNG transparente (base64)
const PIXEL_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const supabase = await createServerClient();

    // Marquer opened_at uniquement au premier accès
    const { data: qt } = await supabase
      .from("quote_tokens")
      .select("id, lead_id, opened_at")
      .eq("token", token)
      .single();

    if (qt && !qt.opened_at) {
      await supabase
        .from("quote_tokens")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", qt.id);

      // Notifier le commercial par email
      const apiKey     = process.env.RESEND_API_KEY;
      const fromEmail  = process.env.RESEND_FROM_EMAIL ?? "OSIRIS <noreply@osiris-web.com>";
      const notifyEmail = process.env.NEXT_PUBLIC_DIRECTOR_EMAILS?.split(",")[0]?.trim();

      if (apiKey && notifyEmail) {
        const { data: lead } = await supabase
          .from("leads")
          .select("client_name, client_email")
          .eq("id", qt.lead_id)
          .single();

        await fetch("https://api.resend.com/emails", {
          method:  "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from:    fromEmail,
            to:      [notifyEmail],
            subject: `📬 ${lead?.client_name ?? "Un client"} a ouvert son devis — appelez maintenant !`,
            html:    `<p><strong>${lead?.client_name ?? "Un client"}</strong> (${lead?.client_email ?? ""}) vient d'ouvrir son devis. C'est le bon moment pour l'appeler !</p>`,
          }),
        });
      }
    }
  } catch {
    // On ne bloque jamais l'affichage de l'email à cause du tracking
  }

  const buf = Buffer.from(PIXEL_B64, "base64");

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":  "image/png",
      "Cache-Control": "no-store, no-cache",
      "Pragma":        "no-cache",
    },
  });
}
