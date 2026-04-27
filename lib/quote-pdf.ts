// OSIRIS CRM — pricing configurator: génération PDF devis complet
import jsPDF from "jspdf";
import type { ConfiguratorData, LeadQuote } from "@/types";
import {
  SITE_TYPES,
  UPGRADE_BUSINESS_OPTIONS,
  UPGRADE_EMPIRE_OPTIONS,
  UNIVERSAL_OPTIONS,
  DEADLINES,
} from "@/lib/configurator-pricing";

// ── Palette (identique à pdfCommercial.ts pour cohérence DA)
type RGB = [number, number, number];
const DARK:    RGB = [8,   8,  16];
const SURFACE: RGB = [15,  15, 26];
const ACCENT:  RGB = [37,  99, 235];
const TEXT:    RGB = [248, 250, 252];
const MUTED:   RGB = [148, 163, 184];
const LINE:    RGB = [30,  30, 50];

const c    = (doc: jsPDF, rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
const fill = (doc: jsPDF, rgb: RGB) => {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
};
const rect = (doc: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB) => {
  fill(doc, rgb); doc.rect(x, y, w, h, "F");
};
const hrule = (doc: jsPDF, y: number) => {
  fill(doc, LINE); doc.rect(20, y, 170, 0.3, "F");
};

function section(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  c(doc, ACCENT);
  doc.text(text.toUpperCase(), 20, y);
}

function row(doc: jsPDF, label: string, value: string, y: number, bold = false) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text(label, 20, y);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  c(doc, TEXT);
  doc.text(value, 100, y);
}

function priceRow(doc: jsPDF, label: string, price: string, y: number, accent = false) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text(label, 24, y);
  doc.setFont("helvetica", accent ? "bold" : "normal");
  c(doc, accent ? ACCENT : TEXT);
  doc.text(price, 175, y, { align: "right" });
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

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

export function generateQuotePdf(data: ConfiguratorData, quote: LeadQuote): string {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;

  // ── Fond total
  rect(doc, 0, 0, W, 297, DARK);

  // ── Header
  rect(doc, 0, 0, W, 42, SURFACE);
  rect(doc, 0, 0, 4, 42, ACCENT);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  c(doc, TEXT);
  doc.text("OSIRIS", 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text("Proposition commerciale", 14, 23);

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  doc.setFontSize(8);
  doc.text(dateStr, 14, 30);

  // Ref en haut à droite
  const ref = `REF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  doc.setFontSize(8);
  c(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.text(ref, W - 20, 16, { align: "right" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text("N° de référence", W - 20, 22, { align: "right" });

  let y = 54;

  // ── Section client
  section(doc, "Informations client", y); y += 7;
  const name = [data.clientFirstName, data.clientLastName].filter(Boolean).join(" ") || "—";
  row(doc, "Nom",        name,                           y); y += 6;
  row(doc, "Entreprise", data.clientCompany  || "—",     y); y += 6;
  row(doc, "Email",      data.clientEmail    || "—",     y); y += 6;
  row(doc, "Téléphone",  data.clientPhone    || "—",     y); y += 6;
  row(doc, "Secteur",    data.clientIndustry || "—",     y); y += 6;
  if (data.clientCurrentSite && data.clientCurrentSite !== "no") {
    const siteLabels: Record<string, string> = {
      "yes-recent": "Oui — récent",
      "yes-old":    "Oui — obsolète",
      "refonte":    "En cours de refonte",
    };
    row(doc, "Site actuel", siteLabels[data.clientCurrentSite] ?? data.clientCurrentSite, y); y += 6;
    if (data.clientSiteUrl) {
      row(doc, "URL actuelle", data.clientSiteUrl, y); y += 6;
    }
  }
  y += 4; hrule(doc, y); y += 6;

  // ── Besoins
  section(doc, "Besoins & objectifs", y); y += 7;
  if (data.clientObjectives.length > 0) {
    doc.setFontSize(8);
    c(doc, MUTED);
    doc.text("Objectifs :", 20, y); y += 5;
    data.clientObjectives.forEach((id) => {
      c(doc, TEXT);
      doc.setFontSize(8);
      doc.text(`  • ${OBJECTIVE_LABELS[id] ?? id}`, 24, y); y += 5;
    });
  }
  if (data.clientNeeds) {
    doc.setFontSize(8);
    c(doc, MUTED);
    doc.text("Contexte :", 20, y); y += 5;
    c(doc, TEXT);
    const lines = doc.splitTextToSize(data.clientNeeds, 165);
    doc.text(lines, 24, y); y += lines.length * 5;
  }
  y += 4; hrule(doc, y); y += 6;

  // ── Budget client
  section(doc, "Budget client déclaré", y); y += 7;
  const budgetLabel = (BUDGET_LABELS[data.clientBudgetRange] ?? data.clientBudgetRange) || "—";
  row(doc, "Budget annoncé", budgetLabel, y); y += 6;
  if (data.clientOwnEstimate !== null) {
    row(doc, "Son estimation", fmt(data.clientOwnEstimate), y); y += 6;
  }
  if (data.clientBudgetNotes) {
    doc.setFontSize(8);
    c(doc, MUTED);
    doc.text("Notes :", 20, y); y += 5;
    c(doc, TEXT);
    const lines = doc.splitTextToSize(data.clientBudgetNotes, 165);
    doc.text(lines, 24, y); y += lines.length * 5;
  }
  y += 4; hrule(doc, y); y += 6;

  // ── Proposition Osiris
  section(doc, "Notre proposition", y); y += 7;

  const allUpgOpts = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];
  const siteType   = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const deadline   = DEADLINES.find((d) => d.id === data.deadlineId);

  priceRow(doc, siteType?.label ?? data.siteTypeId, fmt(quote.basePrice), y); y += 6;

  if (quote.extraPagesPrice > 0) {
    priceRow(doc, `Pages supplémentaires (×${data.extraPages})`, "+" + fmt(quote.extraPagesPrice), y); y += 6;
  }
  data.selectedUpgrades.forEach((id) => {
    const opt = allUpgOpts.find((o) => o.id === id);
    if (opt) { priceRow(doc, opt.label, "+" + fmt(opt.price), y); y += 6; }
  });
  data.selectedUniversal.forEach((id) => {
    const opt = UNIVERSAL_OPTIONS.find((o) => o.id === id);
    if (opt) { priceRow(doc, opt.label, "+" + fmt(opt.price), y); y += 6; }
  });

  y += 2; hrule(doc, y); y += 5;
  priceRow(doc, "Sous-total HT", fmt(quote.subtotalHT), y); y += 6;

  if (quote.deadlineSurcharge > 0) {
    const rate = Math.round((deadline?.rate ?? 0) * 100);
    priceRow(doc, `Délai ${deadline?.label ?? ""} (+${rate}%)`, "+" + fmt(quote.deadlineSurcharge), y); y += 6;
  }

  hrule(doc, y); y += 5;
  priceRow(doc, "Total HT",  fmt(quote.totalHT), y); y += 6;
  priceRow(doc, "TVA 20 %",  "+" + fmt(quote.tva), y); y += 6;

  // ── Box TTC
  y += 4;
  const boxH = 18;
  rect(doc, 14, y, W - 28, boxH, SURFACE);
  rect(doc, 14, y, 3, boxH, ACCENT);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text("Total TTC", 22, y + 7);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  c(doc, ACCENT);
  doc.text(fmt(quote.totalTTC), W - 20, y + 11, { align: "right" });

  if (data.wantsUnlimited) {
    y += boxH + 4;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    c(doc, [251, 191, 36]); // amber
    doc.text("+ Modifications illimitées : +19,90 €/mois (abonnement mensuel)", 14, y);
  }

  // ── Footer
  rect(doc, 0, 284, W, 13, SURFACE);
  rect(doc, 0, 284, W, 0.5, ACCENT);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  c(doc, MUTED);
  doc.text("OSIRIS — Proposition commerciale confidentielle", 14, 291);
  doc.text(dateStr, W - 14, 291, { align: "right" });

  // Retourner la data URI (base64)
  return doc.output("datauristring");
}
