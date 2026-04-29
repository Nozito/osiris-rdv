// OSIRIS CRM — pricing configurator: envoi email devis via Resend REST API (sans dépendance npm)
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const OBJECTIVE_LABELS: Record<string, string> = {
  leads:    "Générer des leads",
  sell:     "Vendre en ligne",
  showcase: "Présenter services / portfolio",
  cred:     "Renforcer la crédibilité",
  seo:      "Améliorer le SEO",
  replace:  "Remplacer l'ancien site",
  notif:    "Informer / fidéliser",
  other:    "Autre",
};

const BUDGET_LABELS: Record<string, string> = {
  "under-1k": "Moins de 1 000 €",
  "1k-2k":    "1 000 – 2 000 €",
  "2k-5k":    "2 000 – 5 000 €",
  "5k-10k":   "5 000 – 10 000 €",
  "10k-plus": "Plus de 10 000 €",
  "flexible": "Budget flexible",
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

function buildHtml(body: SendQuoteBody, type: "client" | "directors"): string {
  const { quote, clientFirstName, clientLastName, clientCompany, clientEmail, trackingToken } = body;
  const name = [clientFirstName, clientLastName].filter(Boolean).join(" ") || "Client";
  const isClient = type === "client";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proposition commerciale Osiris</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#08081a;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:-0.5px;">OSIRIS</span><br/>
                  <span style="font-size:11px;color:#94a3b8;">Agence Web Premium</span>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#94a3b8;">${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#2563eb,#3b82f6);"></td></tr>

        <!-- Intro -->
        <tr>
          <td style="padding:32px 36px 20px;">
            ${isClient
              ? `<p style="font-size:16px;font-weight:600;color:#0f172a;margin:0 0 8px;">Bonjour ${clientFirstName || name},</p>
                 <p style="font-size:14px;color:#475569;margin:0 0 16px;line-height:1.6;">Voici votre proposition commerciale personnalisée. N'hésitez pas à nous contacter pour toute question.</p>`
              : `<p style="font-size:14px;font-weight:600;color:#0f172a;margin:0 0 4px;">Devis transmis — Usage interne</p>
                 <p style="font-size:14px;color:#475569;margin:0 0 16px;">Client : <strong>${name}</strong>${clientCompany ? ` — ${clientCompany}` : ""}</p>`
            }
          </td>
        </tr>

        ${!isClient ? `
        <!-- Pré-qual (directors only) -->
        <tr>
          <td style="padding:0 36px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;overflow:hidden;">
              <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:10px;font-weight:700;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">Pré-qualification</span>
              </td></tr>
              <tr><td style="padding:14px 18px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${quote.clientIndustry ? `<tr><td style="font-size:12px;color:#94a3b8;padding:3px 0;">Secteur</td><td style="font-size:12px;color:#0f172a;font-weight:500;text-align:right;">${quote.clientIndustry}</td></tr>` : ""}
                  ${quote.clientBudgetRange ? `<tr><td style="font-size:12px;color:#94a3b8;padding:3px 0;">Budget annoncé</td><td style="font-size:12px;color:#0f172a;font-weight:500;text-align:right;">${BUDGET_LABELS[quote.clientBudgetRange] ?? quote.clientBudgetRange}</td></tr>` : ""}
                  ${quote.clientOwnEstimate !== null ? `<tr><td style="font-size:12px;color:#94a3b8;padding:3px 0;">Son estimation</td><td style="font-size:12px;color:#0f172a;font-weight:500;text-align:right;">${fmt(quote.clientOwnEstimate)}</td></tr>` : ""}
                  ${quote.clientObjectives.length > 0 ? `<tr><td style="font-size:12px;color:#94a3b8;padding:3px 0;vertical-align:top;">Objectifs</td><td style="font-size:12px;color:#0f172a;text-align:right;">${quote.clientObjectives.map(id => OBJECTIVE_LABELS[id] ?? id).join(", ")}</td></tr>` : ""}
                  ${quote.clientNeeds ? `<tr><td style="font-size:12px;color:#94a3b8;padding:3px 0;vertical-align:top;">Besoins</td><td style="font-size:12px;color:#0f172a;text-align:right;max-width:280px;">${quote.clientNeeds.substring(0, 200)}${quote.clientNeeds.length > 200 ? "…" : ""}</td></tr>` : ""}
                </table>
              </td></tr>
            </table>
          </td>
        </tr>` : ""}

        <!-- Quote breakdown -->
        <tr>
          <td style="padding:0 36px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;overflow:hidden;">
              <tr><td style="padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                <span style="font-size:10px;font-weight:700;color:#2563eb;letter-spacing:0.08em;text-transform:uppercase;">Détail de la proposition</span>
              </td></tr>
              <tr><td style="padding:14px 18px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:12px;color:#0f172a;padding:4px 0;">${quote.siteTypeLabel}</td>
                    <td style="font-size:12px;color:#0f172a;font-weight:600;text-align:right;">${fmt(quote.basePrice)}</td>
                  </tr>
                  ${quote.extraPagesPrice > 0 ? `<tr><td style="font-size:12px;color:#475569;padding:4px 0;">Pages supplémentaires (×${quote.extraPages})</td><td style="font-size:12px;color:#475569;text-align:right;">+${fmt(quote.extraPagesPrice)}</td></tr>` : ""}
                  ${quote.upgradesPrice > 0 ? `<tr><td style="font-size:12px;color:#475569;padding:4px 0;">Upgrades</td><td style="font-size:12px;color:#475569;text-align:right;">+${fmt(quote.upgradesPrice)}</td></tr>` : ""}
                  ${quote.universalPrice > 0 ? `<tr><td style="font-size:12px;color:#475569;padding:4px 0;">Options universelles</td><td style="font-size:12px;color:#475569;text-align:right;">+${fmt(quote.universalPrice)}</td></tr>` : ""}
                  ${quote.selectedUniversal?.includes("multilang") && (quote as { multilangPrice?: number }).multilangPrice === 0 ? `<tr><td style="font-size:12px;color:#475569;padding:4px 0;">Multi-langue (1 langue incluse)</td><td style="font-size:12px;color:#475569;text-align:right;">Gratuit</td></tr>` : ""}
                  <tr><td colspan="2" style="border-top:1px solid #e2e8f0;padding-top:8px;"></td></tr>
                  <tr><td style="font-size:12px;color:#475569;padding:4px 0;">Sous-total HT</td><td style="font-size:12px;color:#0f172a;font-weight:600;text-align:right;">${fmt(quote.subtotalHT)}</td></tr>
                  ${quote.deadlineSurcharge > 0 ? `<tr><td style="font-size:12px;color:#475569;padding:4px 0;">Majoration délai (${quote.deadlineLabel})</td><td style="font-size:12px;color:#475569;text-align:right;">+${fmt(quote.deadlineSurcharge)}</td></tr>` : ""}
                  <tr><td style="font-size:12px;color:#475569;padding:4px 0;">Total HT</td><td style="font-size:12px;color:#0f172a;font-weight:600;text-align:right;">${fmt(quote.totalHT)}</td></tr>
                  ${(quote.discountAmount ?? 0) > 0 ? `<tr><td style="font-size:12px;color:#dc2626;padding:4px 0;">Remise –${quote.discountPercent}%</td><td style="font-size:12px;color:#dc2626;font-weight:600;text-align:right;">–${fmt(quote.discountAmount)}</td></tr>` : ""}
                  <tr><td style="font-size:12px;color:#475569;padding:4px 0;">TVA 20 %</td><td style="font-size:12px;color:#475569;text-align:right;">+${fmt(quote.tva)}</td></tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Total TTC -->
        <tr>
          <td style="padding:0 36px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#08081a;border-radius:8px;">
              <tr>
                <td style="padding:20px 24px;">
                  <span style="font-size:12px;color:#94a3b8;">Total TTC</span>
                </td>
                <td align="right" style="padding:20px 24px;">
                  <span style="font-size:24px;font-weight:900;color:#2563eb;">${fmt(quote.totalTTC)}</span>
                </td>
              </tr>
              ${quote.wantsUnlimited ? `<tr><td colspan="2" style="padding:0 24px 16px;font-size:11px;color:#fbbf24;">+ Maintenance &amp; Mises à jour : +39 €/mois</td></tr>` : ""}
            </table>
          </td>
        </tr>

        ${isClient ? `
        <!-- CTA client -->
        <tr>
          <td style="padding:0 36px 32px;text-align:center;">
            <p style="font-size:13px;color:#475569;margin:0 0 16px;">Vous souhaitez aller de l'avant ? Répondez simplement à cet email ou contactez-nous directement.</p>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">OSIRIS — Agence Web Premium &nbsp;·&nbsp; Ce document est confidentiel.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
  ${isClient && trackingToken
    ? `<img src="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/track/${trackingToken}" width="1" height="1" style="display:none" alt="" />`
    : ""}
</body>
</html>`;
}

interface SendQuoteBody {
  type:             "client" | "directors";
  to:               string[];
  clientFirstName:  string;
  clientLastName:   string;
  clientCompany:    string;
  clientEmail:      string;
  pdfBase64:        string | null;
  quote:            import("@/types").LeadQuote;
  trackingToken?:   string;
}

function validateBody(body: unknown): body is SendQuoteBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (b.type !== "client" && b.type !== "directors") return false;
  if (!Array.isArray(b.to) || b.to.some((e) => typeof e !== "string")) return false;
  if (typeof b.clientFirstName !== "string") return false;
  if (typeof b.clientLastName  !== "string") return false;
  if (typeof b.clientCompany   !== "string") return false;
  if (typeof b.clientEmail     !== "string") return false;
  if (b.pdfBase64 !== null && typeof b.pdfBase64 !== "string") return false;
  if (!b.quote || typeof b.quote !== "object") return false;
  const q = b.quote as Record<string, unknown>;
  if (typeof q.totalTTC !== "number") return false;
  if (typeof q.totalHT  !== "number") return false;
  if (typeof q.tva      !== "number") return false;
  if (!Array.isArray(q.clientObjectives)) return false;
  return true;
}

export async function POST(req: Request) {
  // Auth guard — session Supabase requise
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email non configuré. Ajoutez RESEND_API_KEY dans vos variables d'environnement." },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!validateBody(raw)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 422 });
  }

  const body: SendQuoteBody = raw;
  const { type, to, clientFirstName, clientLastName, pdfBase64 } = body;

  const name = [clientFirstName, clientLastName].filter(Boolean).join(" ") || "Client";
  const subject =
    type === "client"
      ? `Votre proposition commerciale Osiris — ${name}`
      : `[Osiris CRM] Devis transmis — ${name}`;

  const html = buildHtml(body, type);

  const payload: Record<string, unknown> = {
    from:    process.env.RESEND_FROM_EMAIL ?? "OSIRIS <noreply@osiris-web.com>",
    to,
    subject,
    html,
  };

  // Attacher le PDF si fourni
  if (pdfBase64) {
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
    payload.attachments = [
      {
        filename: `devis-osiris-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        content:  base64Data,
      },
    ];
  }

  // OSIRIS CRM — pricing configurator: appel REST Resend (aucun package npm supplémentaire)
  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send-quote] Resend error:", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
