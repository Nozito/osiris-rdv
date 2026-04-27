import jsPDF from "jspdf";
import {
  SITE_TYPES,
  DESIGN_OPTIONS,
  PAGE_OPTIONS,
  TECH_OPTIONS,
  BUDGET_RANGES,
  formatPrice,
} from "@/lib/pricing";
import type { WizardData } from "@/types";

type RGB = [number, number, number];
const ACCENT: RGB = [37, 99, 235];
const DARK: RGB = [8, 8, 16];
const SURFACE: RGB = [15, 15, 26];
const TEXT: RGB = [248, 250, 252];
const MUTED: RGB = [148, 163, 184];

const c = (doc: jsPDF, rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
const fill = (doc: jsPDF, rgb: RGB) => {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
};

function drawRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB) {
  fill(doc, rgb);
  doc.rect(x, y, w, h, "F");
}

function sectionTitle(doc: jsPDF, text: string, y: number) {
  doc.setFontSize(8);
  c(doc, MUTED);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), 20, y);
}

function row(doc: jsPDF, label: string, value: string, y: number, accent = false) {
  doc.setFontSize(9);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(label, 20, y);
  c(doc, accent ? ACCENT : TEXT);
  doc.setFont("helvetica", accent ? "bold" : "normal");
  doc.text(value, 120, y);
}

export function generateCommercialPdf(
  data: WizardData,
  finalPrice: number,
  monthly: number
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawRect(doc, 0, 0, 210, 297, DARK);
  drawRect(doc, 0, 0, 210, 45, SURFACE);
  drawRect(doc, 0, 0, 4, 45, ACCENT);

  doc.setFontSize(22);
  c(doc, TEXT);
  doc.setFont("helvetica", "bold");
  doc.text("OSIRIS", 20, 18);
  doc.setFontSize(10);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Configurateur RDV", 20, 25);

  drawRect(doc, 150, 12, 42, 8, [30, 78, 216]);
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("USAGE INTERNE UNIQUEMENT", 152, 17);

  doc.setFontSize(8);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Généré le ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    20,
    36
  );

  let y = 58;

  sectionTitle(doc, "Informations client", y);
  y += 8;
  row(doc, "Nom", data.clientName || "—", y);
  y += 6;
  row(doc, "Email", data.clientEmail || "—", y);
  y += 6;
  row(doc, "Entreprise", data.clientCompany || "—", y);
  y += 6;
  row(doc, "Téléphone", data.clientPhone || "—", y);
  y += 6;

  const budgetLabel =
    BUDGET_RANGES.find((b) => b.id === data.budgetRange)?.label ?? "—";
  row(doc, "Budget client", budgetLabel, y);
  y += 6;

  if (data.projectDeadline) {
    row(
      doc,
      "Deadline",
      new Date(data.projectDeadline).toLocaleDateString("fr-FR"),
      y
    );
    y += 6;
  }

  y += 4;

  sectionTitle(doc, "Projet", y);
  y += 8;

  const siteName =
    SITE_TYPES.find((s) => s.id === data.projectType)?.label ?? "—";
  row(doc, "Type de site", siteName, y);
  y += 6;

  const designName =
    DESIGN_OPTIONS.find((d) => d.id === data.designStyle)?.label ?? "—";
  row(doc, "Design", designName, y);
  y += 6;

  row(doc, "Charte existante", data.brandAssets ? "Oui" : "Non", y);
  y += 6;

  if (data.projectDescription) {
    doc.setFontSize(9);
    c(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.text("Description :", 20, y);
    y += 5;
    c(doc, TEXT);
    const lines = doc.splitTextToSize(data.projectDescription, 170);
    doc.text(lines, 20, y);
    y += lines.length * 5 + 2;
  }

  y += 4;

  sectionTitle(doc, "Configuration retenue", y);
  y += 8;

  const pages = PAGE_OPTIONS.filter((p) => data.selectedPages.includes(p.id));
  if (pages.length > 0) {
    doc.setFontSize(9);
    c(doc, MUTED);
    doc.text("Fonctionnalités :", 20, y);
    y += 5;
    pages.forEach((p) => {
      c(doc, TEXT);
      doc.text(`• ${p.label}`, 24, y);
      c(doc, ACCENT);
      doc.text(`+${formatPrice(p.price)}`, 150, y);
      y += 5;
    });
  }

  const techs = TECH_OPTIONS.filter((t) => data.techOptions.includes(t.id));
  if (techs.length > 0) {
    y += 2;
    doc.setFontSize(9);
    c(doc, MUTED);
    doc.text("Options techniques :", 20, y);
    y += 5;
    techs.forEach((t) => {
      c(doc, TEXT);
      doc.text(`• ${t.label}`, 24, y);
      c(doc, ACCENT);
      const priceStr =
        t.price > 0
          ? `+${formatPrice(t.price)}`
          : `${formatPrice(t.monthly)}/mois`;
      doc.text(priceStr, 150, y);
      y += 5;
    });
  }

  y += 6;

  const boxH = data.adjustedPrice !== null ? 28 : 22;
  drawRect(doc, 15, y, 180, boxH, SURFACE);

  doc.setFontSize(9);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Total one-shot", 20, y + 8);
  doc.setFontSize(16);
  c(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.text(formatPrice(finalPrice), 130, y + 9);

  if (monthly > 0) {
    doc.setFontSize(8);
    c(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(`+ ${formatPrice(monthly)}/mois`, 130, y + 15);
  }
  if (data.adjustedPrice !== null) {
    doc.setFontSize(7);
    c(doc, MUTED);
    doc.text("(Prix ajusté — base calculée)", 20, y + 22);
  }

  y += boxH + 8;

  if (data.notes) {
    sectionTitle(doc, "Notes internes", y);
    y += 8;
    doc.setFontSize(9);
    c(doc, TEXT);
    const noteLines = doc.splitTextToSize(data.notes, 170);
    doc.text(noteLines, 20, y);
    y += noteLines.length * 5;
  }

  drawRect(doc, 0, 285, 210, 12, SURFACE);
  doc.setFontSize(7);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Document interne Osiris — confidentiel", 20, 292);
  doc.text(`${data.clientName} — ${new Date().getFullYear()}`, 160, 292);

  doc.save(
    `osiris-commercial-${(data.clientName || "prospect").replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`
  );
}
