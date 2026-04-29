// OSIRIS CRM — génération devis PDF format classique professionnel
import jsPDF from "jspdf";
import type { ConfiguratorData, LeadQuote } from "@/types";
import {
  SITE_TYPES,
  UPGRADE_BUSINESS_OPTIONS,
  UPGRADE_EMPIRE_OPTIONS,
  UNIVERSAL_OPTIONS,
  DEADLINES,
} from "@/lib/configurator-pricing";

// ── Palette neutre (fond blanc, texte sombre)
type RGB = [number, number, number];
const WHITE:    RGB = [255, 255, 255];
const NEAR_BLK: RGB = [15,  23,  42];   // slate-900
const SLATE:    RGB = [71,  85, 105];   // slate-600
const SLATE_LT: RGB = [148, 163, 184];  // slate-400
const LIGHT:    RGB = [241, 245, 249];  // slate-100
const LIGHTER:  RGB = [248, 250, 252];  // slate-50
const BLUE:     RGB = [37,  99, 235];   // accent
const BLUE_LT:  RGB = [219, 234, 254];  // blue-100
const GREEN:    RGB = [21, 128,  61];   // green-700
const LINE:     RGB = [226, 232, 240];  // slate-200

function c(doc: jsPDF, rgb: RGB)    { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function bg(doc: jsPDF, rgb: RGB)   { doc.setFillColor(rgb[0], rgb[1], rgb[2]); doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
function hline(doc: jsPDF, x: number, y: number, w: number, rgb: RGB, lw = 0.25) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  doc.setLineWidth(lw);
  doc.line(x, y, x + w, y);
}

function fmt(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function generateQuotePdf(data: ConfiguratorData, quote: LeadQuote): string {
  const doc  = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W    = 210;
  const ML   = 18;   // margin left
  const MR   = 18;   // margin right
  const CW   = W - ML - MR; // content width

  // Fond blanc
  bg(doc, WHITE);
  doc.rect(0, 0, W, 297, "F");

  const ref     = `DEV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const siteType = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const deadline = DEADLINES.find((d) => d.id === data.deadlineId);
  const allUpgOpts = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];

  // ══════════════════════════════════════════════════════════
  // HEADER — bande bleue en haut
  // ══════════════════════════════════════════════════════════
  bg(doc, BLUE);
  doc.rect(0, 0, W, 28, "F");

  // OSIRIS (blanc)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  c(doc, WHITE);
  doc.text("OSIRIS", ML, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  c(doc, BLUE_LT);
  doc.text("Agence Web Premium", ML, 20);

  // "DEVIS" à droite (blanc)
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  c(doc, WHITE);
  doc.text("DEVIS", W - MR, 14, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  c(doc, BLUE_LT);
  doc.text(`N° ${ref}`, W - MR, 20, { align: "right" });

  // ══════════════════════════════════════════════════════════
  // INFOS — émetteur (gauche) + destinataire (droite)
  // ══════════════════════════════════════════════════════════
  let y = 38;

  // Émetteur
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  c(doc, BLUE);
  doc.text("ÉMETTEUR", ML, y); y += 4.5;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  c(doc, NEAR_BLK);
  doc.text("OSIRIS — Agence Web Premium", ML, y); y += 4.5;
  c(doc, SLATE);
  doc.setFontSize(8);
  doc.text("contact@osiris-web.com", ML, y); y += 4;
  doc.text("osiris-web.com", ML, y);

  // Destinataire
  const clientName = [data.clientFirstName, data.clientLastName].filter(Boolean).join(" ") || "—";
  let dy = 38;
  const midX = ML + CW / 2 + 6;

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  c(doc, BLUE);
  doc.text("DESTINATAIRE", midX, dy); dy += 4.5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  c(doc, NEAR_BLK);
  doc.text(clientName, midX, dy); dy += 4.5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  c(doc, SLATE);
  if (data.clientCompany) { doc.text(data.clientCompany, midX, dy); dy += 4; }
  if (data.clientEmail)   { doc.text(data.clientEmail,   midX, dy); dy += 4; }
  if (data.clientPhone)   { doc.text(data.clientPhone,   midX, dy); dy += 4; }

  // Ligne de séparation
  y = 70;
  hline(doc, ML, y, CW, LINE, 0.4);

  // Meta : date + validité (à droite du milieu)
  y += 5;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  c(doc, SLATE);
  doc.text(`Date d'émission : ${dateStr}`, midX, y);
  doc.text("Validité : 30 jours", W - MR, y, { align: "right" });

  // ══════════════════════════════════════════════════════════
  // OBJET
  // ══════════════════════════════════════════════════════════
  y += 8;
  bg(doc, LIGHTER);
  doc.rect(ML, y - 3, CW, 9, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  c(doc, NEAR_BLK);
  doc.text(
    `Objet : Création ${siteType?.label ?? "de site web"} — Proposition commerciale personnalisée`,
    ML + 3, y + 3
  );

  // ══════════════════════════════════════════════════════════
  // TABLEAU DES PRESTATIONS
  // ══════════════════════════════════════════════════════════
  y += 14;

  // En-tête colonnes
  const COL = {
    desc: ML + 3,
    qty:  ML + CW * 0.58,
    pu:   ML + CW * 0.74,
    tot:  W - MR - 2,
  };

  bg(doc, NEAR_BLK);
  doc.rect(ML, y, CW, 7.5, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  c(doc, WHITE);
  doc.text("DÉSIGNATION",  COL.desc, y + 5);
  doc.text("QTÉ",          COL.qty,  y + 5, { align: "center" });
  doc.text("P.U. HT",      COL.pu,   y + 5, { align: "center" });
  doc.text("TOTAL HT",     COL.tot,  y + 5, { align: "right" });
  y += 7.5;

  // Lignes
  type LineItem = { label: string; qty: number; pu: number; total: number };
  const items: LineItem[] = [];

  items.push({ label: siteType?.label ?? data.siteTypeId, qty: 1, pu: quote.basePrice, total: quote.basePrice });

  if (quote.extraPagesPrice > 0 && data.extraPages > 0) {
    items.push({ label: "Pages supplémentaires", qty: data.extraPages, pu: 180, total: quote.extraPagesPrice });
  }

  data.selectedUpgrades.forEach((id) => {
    const opt = allUpgOpts.find((o) => o.id === id);
    if (opt) items.push({ label: opt.label, qty: 1, pu: opt.price, total: opt.price });
  });

  data.selectedUniversal.forEach((id) => {
    if (id === "multilang") {
      const count = (data as import("@/types").ConfiguratorData).multilangCount ?? 0;
      const total = count * 25;
      if (count > 0) {
        items.push({ label: `Multi-langue (${count} langue${count > 1 ? "s" : ""} supplémentaire${count > 1 ? "s" : ""})`, qty: count, pu: 25, total });
      } else {
        items.push({ label: "Multi-langue (1 langue incluse)", qty: 1, pu: 0, total: 0 });
      }
      return;
    }
    const opt = UNIVERSAL_OPTIONS.find((o) => o.id === id);
    if (opt && "price" in opt) items.push({ label: opt.label, qty: 1, pu: (opt as { price: number }).price, total: (opt as { price: number }).price });
  });

  const ROW_H = 8;

  items.forEach((item, i) => {
    // Alterner les fonds
    if (i % 2 === 0) {
      bg(doc, LIGHTER);
      doc.rect(ML, y, CW, ROW_H, "F");
    }

    hline(doc, ML, y + ROW_H, CW, LINE);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    c(doc, NEAR_BLK);
    doc.text(item.label, COL.desc, y + 5.3);

    c(doc, SLATE);
    doc.text(String(item.qty), COL.qty, y + 5.3, { align: "center" });
    doc.text(fmt(item.pu),     COL.pu,  y + 5.3, { align: "center" });

    doc.setFont("helvetica", "bold");
    c(doc, NEAR_BLK);
    doc.text(fmt(item.total), COL.tot, y + 5.3, { align: "right" });

    y += ROW_H;
  });

  // Ligne "Modifications illimitées" en option (ambre)
  if (data.wantsUnlimited) {
    bg(doc, [255, 251, 235]); // amber-50
    doc.rect(ML, y, CW, ROW_H, "F");
    hline(doc, ML, y + ROW_H, CW, [253, 230, 138]);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    c(doc, [146, 64, 14]);
    doc.text("Maintenance & Mises à jour (abonnement mensuel)", COL.desc, y + 5.3);
    doc.text("1",          COL.qty, y + 5.3, { align: "center" });
    doc.text("39 €/mois",  COL.pu,  y + 5.3, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("+ 39 €/mois", COL.tot, y + 5.3, { align: "right" });
    y += ROW_H;
  }

  y += 5;

  // ══════════════════════════════════════════════════════════
  // TOTAUX (alignés à droite)
  // ══════════════════════════════════════════════════════════
  const TOT_W = 88;
  const totX  = W - MR - TOT_W;

  const totRow = (
    label: string,
    val: string,
    opts: { bold?: boolean; accent?: boolean; big?: boolean } = {}
  ) => {
    const h = opts.big ? 10 : 7;
    if (opts.accent) {
      bg(doc, BLUE);
      doc.rect(totX - 4, y, TOT_W + 4, h, "F");
    } else if (opts.bold) {
      bg(doc, LIGHT);
      doc.rect(totX - 4, y, TOT_W + 4, h, "F");
    }

    const textY = y + (opts.big ? 7 : 5);
    doc.setFontSize(opts.big ? 10 : 8.5);
    doc.setFont("helvetica", opts.bold || opts.accent ? "bold" : "normal");
    c(doc, opts.accent ? WHITE : opts.bold ? NEAR_BLK : SLATE);
    doc.text(label, totX, textY);
    c(doc, opts.accent ? WHITE : opts.bold ? NEAR_BLK : SLATE);
    doc.text(val, W - MR, textY, { align: "right" });
    y += h;
  };

  hline(doc, totX - 4, y - 1, TOT_W + 4, LINE, 0.4);

  totRow("Sous-total HT", fmt(quote.subtotalHT));

  if (quote.deadlineSurcharge > 0) {
    const rate = Math.round((deadline?.rate ?? 0) * 100);
    totRow(
      `Majoration délai « ${deadline?.label ?? ""} » (+${rate}%)`,
      `+ ${fmt(quote.deadlineSurcharge)}`
    );
  }

  totRow("Total HT", fmt(quote.totalHT), { bold: true });

  if (quote.discountAmount > 0) {
    // Ligne remise en rouge
    const discY = y;
    bg(doc, [254, 242, 242]); // red-50
    doc.rect(totX - 4, discY, TOT_W + 4, 7, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(185, 28, 28); // red-700
    doc.text(`Remise –${quote.discountPercent}%`, totX, discY + 5);
    doc.text(`– ${fmt(quote.discountAmount)}`, W - MR, discY + 5, { align: "right" });
    y += 7;
  }

  hline(doc, totX - 4, y, TOT_W + 4, BLUE, 1);
  y += 2;
  totRow("TOTAL HT", fmt(quote.totalTTC), { big: true, accent: true });

  y += 8;

  // ══════════════════════════════════════════════════════════
  // CONDITIONS DE RÈGLEMENT
  // ══════════════════════════════════════════════════════════
  if (y < 235) {
    bg(doc, LIGHTER);
    doc.rect(ML, y, CW, data.wantsUnlimited ? 26 : 20, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    c(doc, BLUE);
    doc.text("CONDITIONS DE RÈGLEMENT", ML + 4, y + 6);

    doc.setFont("helvetica", "normal");
    c(doc, SLATE);
    doc.setFontSize(8);
    let cy = y + 12;
    doc.text("• 30 % à la signature du devis (acompte)", ML + 4, cy); cy += 5;
    doc.text("• 70 % à la livraison finale du projet",   ML + 4, cy); cy += 5;
    if (data.wantsUnlimited) {
      c(doc, [146, 64, 14]);
      doc.text("• Maintenance & Mises à jour : 39 €/mois (résiliable à tout moment)", ML + 4, cy);
    }

    y += (data.wantsUnlimited ? 26 : 20) + 6;
  }

  // Validité
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "italic");
  c(doc, SLATE_LT);
  doc.text("Ce devis est valable 30 jours à compter de la date d'émission.", ML, y);

  // ══════════════════════════════════════════════════════════
  // BON POUR ACCORD
  // ══════════════════════════════════════════════════════════
  const sigY = 248;
  if (y + 20 < sigY) {
    // Zone signature client
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.4);
    bg(doc, WHITE);
    doc.rect(ML, sigY, (CW / 2) - 6, 26, "FD");

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    c(doc, NEAR_BLK);
    doc.text("Bon pour accord", ML + 4, sigY + 6);
    doc.setFont("helvetica", "normal");
    c(doc, SLATE_LT);
    doc.text("Date et signature du client :", ML + 4, sigY + 11);
    doc.text("(précédé de « Lu et approuvé »)", ML + 4, sigY + 16);
  }

  // ══════════════════════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════════════════════
  hline(doc, ML, 282, CW, LINE, 0.3);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  c(doc, SLATE_LT);
  doc.text(
    "OSIRIS — Agence Web Premium  ·  contact@osiris-web.com  ·  osiris-web.com",
    ML, 287
  );
  c(doc, BLUE);
  doc.text(ref, W - MR, 287, { align: "right" });

  return doc.output("datauristring");
}
