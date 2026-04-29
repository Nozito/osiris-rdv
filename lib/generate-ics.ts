// OSIRIS CRM — génération fichier .ics client-side (sans dépendance)

function formatICSDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateICS(params: {
  clientName:    string;
  rdvDate:       string;
  siteTypeLabel: string;
  totalTTC:      number;
  quoteToken?:   string;
  appUrl?:       string;
}): string {
  const { clientName, rdvDate, siteTypeLabel, totalTTC, quoteToken, appUrl } = params;

  const dtStart = formatICSDate(rdvDate);
  // +1h pour DTEND
  const endDate = new Date(new Date(rdvDate).getTime() + 3600000);
  const dtEnd   = formatICSDate(endDate.toISOString());

  const uid  = `osiris-${Date.now()}@osiris-web.com`;
  const desc = [
    `RDV avec ${clientName}`,
    `Projet : ${siteTypeLabel}`,
    `Devis : ${totalTTC.toLocaleString("fr-FR")} € TTC`,
    quoteToken && appUrl ? `Lien devis : ${appUrl}/devis/${quoteToken}` : "",
  ].filter(Boolean).join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OSIRIS CRM//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:RDV ${clientName} — OSIRIS`,
    `DESCRIPTION:${desc}`,
    quoteToken && appUrl ? `URL:${appUrl}/devis/${quoteToken}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
