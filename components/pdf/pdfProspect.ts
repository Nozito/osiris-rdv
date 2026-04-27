import jsPDF from "jspdf";
import {
  SITE_TYPES,
  DESIGN_OPTIONS,
  PAGE_OPTIONS,
  TECH_OPTIONS,
  formatPrice,
} from "@/lib/pricing";
import type { WizardData } from "@/types";

type RGB = [number, number, number];
const ACCENT: RGB = [37, 99, 235];
const DARK: RGB = [8, 8, 16];
const SURFACE: RGB = [15, 15, 26];
const TEXT: RGB = [248, 250, 252];
const MUTED: RGB = [148, 163, 184];
const SUCCESS: RGB = [34, 197, 94];

const c = (doc: jsPDF, rgb: RGB) => doc.setTextColor(rgb[0], rgb[1], rgb[2]);
const fill = (doc: jsPDF, rgb: RGB) => {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
};

function drawRect(doc: jsPDF, x: number, y: number, w: number, h: number, rgb: RGB) {
  fill(doc, rgb);
  doc.rect(x, y, w, h, "F");
}

function lineItem(doc: jsPDF, label: string, value: string, y: number) {
  doc.setFontSize(9);
  c(doc, TEXT);
  doc.setFont("helvetica", "normal");
  doc.text(`• ${label}`, 24, y);
  c(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.text(value, 155, y);
}

export function generateProspectPdf(
  data: WizardData,
  finalPrice: number,
  monthly: number
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawRect(doc, 0, 0, 210, 297, DARK);
  drawRect(doc, 0, 0, 210, 50, SURFACE);
  drawRect(doc, 0, 0, 4, 50, ACCENT);
  drawRect(doc, 4, 0, 206, 3, ACCENT);

  doc.setFontSize(26);
  c(doc, TEXT);
  doc.setFont("helvetica", "bold");
  doc.text("OSIRIS", 20, 22);

  doc.setFontSize(10);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Studio Digital", 20, 30);

  if (data.clientName) {
    doc.setFontSize(12);
    c(doc, TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Pour : ${data.clientName}`, 20, 42);
  }

  doc.setFontSize(8);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    158,
    42
  );

  let y = 62;

  doc.setFontSize(14);
  c(doc, TEXT);
  doc.setFont("helvetica", "bold");
  doc.text("Proposition commerciale", 20, y);
  y += 5;
  doc.setFontSize(9);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Estimée le ${new Date().toLocaleDateString("fr-FR")} — Valable 30 jours`,
    20,
    y
  );
  y += 10;

  // Base projet
  doc.setFontSize(10);
  c(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.text("01 / Votre projet", 20, y);
  y += 7;

  const site = SITE_TYPES.find((s) => s.id === data.projectType);
  const design = DESIGN_OPTIONS.find((d) => d.id === data.designStyle);

  if (site) {
    doc.setFontSize(9);
    c(doc, TEXT);
    doc.setFont("helvetica", "normal");
    doc.text(`Type : ${site.label}`, 24, y);
    c(doc, ACCENT);
    doc.setFont("helvetica", "bold");
    doc.text(formatPrice(site.price), 155, y);
    y += 6;
  }

  if (design) {
    doc.setFontSize(9);
    c(doc, TEXT);
    doc.setFont("helvetica", "normal");
    doc.text(`Design : ${design.label}`, 24, y);
    if (design.price > 0) {
      c(doc, ACCENT);
      doc.setFont("helvetica", "bold");
      doc.text(`+${formatPrice(design.price)}`, 155, y);
    } else {
      c(doc, SUCCESS);
      doc.setFont("helvetica", "bold");
      doc.text("Inclus", 155, y);
    }
    y += 6;
  }

  if (data.projectDeadline) {
    doc.setFontSize(9);
    c(doc, TEXT);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Livraison estimée : ${new Date(data.projectDeadline).toLocaleDateString("fr-FR")}`,
      24,
      y
    );
    y += 6;
  }

  y += 4;

  // Fonctionnalités
  const pages = PAGE_OPTIONS.filter((p) => data.selectedPages.includes(p.id));
  if (pages.length > 0) {
    doc.setFontSize(10);
    c(doc, ACCENT);
    doc.setFont("helvetica", "bold");
    doc.text("02 / Fonctionnalités incluses", 20, y);
    y += 7;

    pages.forEach((p) => {
      lineItem(doc, `${p.label} — ${p.sublabel}`, `+${formatPrice(p.price)}`, y);
      y += 6;
    });

    y += 4;
  }

  // Options techniques
  const techs = TECH_OPTIONS.filter((t) => data.techOptions.includes(t.id));
  const techOneTime = techs.filter((t) => t.price > 0);
  const techMonthly = techs.filter((t) => t.monthly > 0);

  if (techs.length > 0) {
    doc.setFontSize(10);
    c(doc, ACCENT);
    doc.setFont("helvetica", "bold");
    doc.text("03 / Services techniques", 20, y);
    y += 7;

    techOneTime.forEach((t) => {
      lineItem(doc, t.label, `+${formatPrice(t.price)}`, y);
      y += 6;
    });

    if (techMonthly.length > 0) {
      doc.setFontSize(8);
      c(doc, MUTED);
      doc.setFont("helvetica", "italic");
      doc.text("Services mensuels :", 24, y);
      y += 5;
      techMonthly.forEach((t) => {
        lineItem(doc, t.label, `${formatPrice(t.monthly)}/mois`, y);
        y += 6;
      });
    }

    y += 4;
  }

  // Investissement total
  const boxH = monthly > 0 ? 30 : 22;
  drawRect(doc, 15, y, 180, boxH, SURFACE);
  drawRect(doc, 15, y, 4, boxH, ACCENT);

  doc.setFontSize(9);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Investissement total", 24, y + 8);

  doc.setFontSize(18);
  c(doc, ACCENT);
  doc.setFont("helvetica", "bold");
  doc.text(formatPrice(finalPrice), 130, y + 10);

  if (monthly > 0) {
    doc.setFontSize(9);
    c(doc, MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(`+ ${formatPrice(monthly)}/mois (services récurrents)`, 24, y + 22);
  }

  y += boxH + 12;

  // Conditions
  doc.setFontSize(7);
  c(doc, MUTED);
  doc.setFont("helvetica", "italic");
  const conditions = [
    "• Devis valable 30 jours à compter de la date d'émission.",
    "• Acompte de 40% à la signature, solde à la livraison.",
    "• Délai de réalisation estimé : 4 à 8 semaines selon la complexité.",
    "• Révisions incluses : 2 cycles de corrections par étape de production.",
  ];
  conditions.forEach((cond) => {
    doc.text(cond, 20, y);
    y += 5;
  });

  // Footer
  drawRect(doc, 0, 285, 210, 12, SURFACE);
  drawRect(doc, 0, 285, 210, 1, ACCENT);
  doc.setFontSize(7);
  c(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Osiris Studio Digital — contact@osiris.studio", 20, 292);
  doc.text(`© ${new Date().getFullYear()}`, 185, 292);

  doc.save(
    `osiris-devis-${(data.clientName || "prospect").replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`
  );
}
