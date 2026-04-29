"use client";
// OSIRIS CRM — pricing configurator: étape finale — récap complet + envoi

import { useState } from "react";
import { Download, Send, Users, CheckCircle, AlertCircle, Link2, Copy, Calendar } from "lucide-react";
import { useConfigurator } from "./ConfiguratorShell";
import {
  SITE_TYPES,
  UPGRADE_BUSINESS_OPTIONS,
  UPGRADE_EMPIRE_OPTIONS,
  UNIVERSAL_OPTIONS,
  DEADLINES,
} from "@/lib/configurator-pricing";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

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

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-white/[0.05] last:border-0">
      <span className="text-xs text-muted shrink-0">{label}</span>
      <span className="text-xs text-textc text-right">{value}</span>
    </div>
  );
}

function PriceRow({
  label,
  value,
  bold,
  accent,
  amber,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  amber?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 py-1.5 ${bold ? "border-t border-white/8 mt-1 pt-2" : ""}`}>
      <span className={`text-xs ${bold ? "font-semibold text-textc" : "text-muted"}`}>{label}</span>
      <span
        className={`text-xs font-semibold shrink-0 ${
          accent ? "text-accent" : amber ? "text-amber-400" : bold ? "text-textc" : "text-textc"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function FStep1Envoi() {
  const { data, quote, leadId } = useConfigurator();
  const [sendingClient,    setSendingClient]    = useState(false);
  const [sendingDirectors, setSendingDirectors] = useState(false);
  const [sentClient,       setSentClient]       = useState(false);
  const [sentDirectors,    setSentDirectors]    = useState(false);
  const [generatingLink,   setGeneratingLink]   = useState(false);
  const [quoteLink,        setQuoteLink]        = useState<string | null>(null);
  const [copied,           setCopied]           = useState(false);
  const [includeInEmail,   setIncludeInEmail]   = useState(true);

  const clientName = [data.clientFirstName, data.clientLastName].filter(Boolean).join(" ");
  const siteType   = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const deadline   = DEADLINES.find((d) => d.id === data.deadlineId);
  const allUpgOpts = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];

  // ── Génération .ics calendrier
  const downloadCalendar = async () => {
    if (!data.rdvDate) { toast.error("Aucune date de RDV renseignée"); return; }
    const { generateICS, downloadICS } = await import("@/lib/generate-ics");
    const ics = generateICS({
      clientName:    clientName || "Client",
      rdvDate:       data.rdvDate,
      siteTypeLabel: siteType?.label ?? data.siteTypeId,
      totalTTC:      quote.totalTTC,
      quoteToken:    quoteLink?.split("/").pop(),
      appUrl:        process.env.NEXT_PUBLIC_APP_URL,
    });
    downloadICS(ics, `rdv-osiris-${(clientName || "client").toLowerCase().replace(/\s+/g, "-")}.ics`);
  };

  // ── Génération lien signable
  const generateLink = async () => {
    if (!leadId) { toast.error("Sauvegardez d'abord le lead"); return; }
    setGeneratingLink(true);
    try {
      const res = await fetch("/api/quote/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ leadId }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Erreur"); return; }
      setQuoteLink(json.link);
      toast.success("Lien généré ✓");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyLink = async () => {
    if (!quoteLink) return;
    await navigator.clipboard.writeText(quoteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // ── Génération PDF client-side
  const generateAndDownload = async () => {
    const { generateQuotePdf } = await import("@/lib/quote-pdf");
    const quoteForPdf = {
      ...quote,
      clientCompany:     data.clientCompany,
      clientIndustry:    data.clientIndustry,
      clientCompanySize: data.clientCompanySize,
      clientCurrentSite: data.clientCurrentSite,
      clientSiteUrl:     data.clientSiteUrl,
      clientObjectives:  data.clientObjectives,
      clientNeeds:       data.clientNeeds,
      clientBudgetRange: data.clientBudgetRange,
      clientOwnEstimate: data.clientOwnEstimate,
      clientBudgetNotes: data.clientBudgetNotes,
      siteTypeId:        data.siteTypeId,
      siteTypeLabel:     siteType?.label ?? "",
      extraPages:        data.extraPages,
      selectedUpgrades:  data.selectedUpgrades,
      selectedUniversal: data.selectedUniversal,
      wantsUnlimited:    data.wantsUnlimited,
      deadlineId:        data.deadlineId,
      deadlineLabel:     deadline?.label ?? "",
    };
    const dataUri = generateQuotePdf(data, quoteForPdf);
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = `devis-osiris-${(clientName || "prospect").toLowerCase().replace(/\s+/g, "-")}.pdf`;
    a.click();
  };

  // ── Envoi email
  const sendEmail = async (type: "client" | "directors") => {
    const setter = type === "client" ? setSendingClient : setSendingDirectors;
    const done   = type === "client" ? setSentClient    : setSentDirectors;
    setter(true);
    try {
      // Générer PDF base64
      const { generateQuotePdf } = await import("@/lib/quote-pdf");
      const quoteForPdf = {
        ...quote,
        clientCompany:     data.clientCompany,
        clientIndustry:    data.clientIndustry,
        clientCompanySize: data.clientCompanySize,
        clientCurrentSite: data.clientCurrentSite,
        clientSiteUrl:     data.clientSiteUrl,
        clientObjectives:  data.clientObjectives,
        clientNeeds:       data.clientNeeds,
        clientBudgetRange: data.clientBudgetRange,
        clientOwnEstimate: data.clientOwnEstimate,
        clientBudgetNotes: data.clientBudgetNotes,
        siteTypeId:        data.siteTypeId,
        siteTypeLabel:     siteType?.label ?? "",
        extraPages:        data.extraPages,
        selectedUpgrades:  data.selectedUpgrades,
        selectedUniversal: data.selectedUniversal,
        wantsUnlimited:    data.wantsUnlimited,
        deadlineId:        data.deadlineId,
        deadlineLabel:     deadline?.label ?? "",
      };
      const pdfBase64 = generateQuotePdf(data, quoteForPdf);

      const to =
        type === "client"
          ? [data.clientEmail].filter(Boolean)
          : (process.env.NEXT_PUBLIC_DIRECTOR_EMAILS ?? "")
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean);

      if (to.length === 0) {
        toast.error(
          type === "client"
            ? "Email client manquant"
            : "Configurez NEXT_PUBLIC_DIRECTOR_EMAILS dans .env"
        );
        return;
      }

      const res = await fetch("/api/send-quote", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          to,
          clientFirstName:  data.clientFirstName,
          clientLastName:   data.clientLastName,
          clientCompany:    data.clientCompany,
          clientEmail:      data.clientEmail,
          pdfBase64,
          quote: quoteForPdf,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error ?? "Erreur lors de l'envoi");
        return;
      }
      done(true);
      toast.success(
        type === "client" ? "Email envoyé au client ✓" : "Email envoyé aux directeurs ✓"
      );
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setter(false);
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Récapitulatif & envoi</h2>
      <p className="text-sm text-muted mb-6">Vérifiez l'ensemble du dossier avant de transmettre.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        {/* ── Colonne gauche : client + pré-qual */}
        <div className="flex flex-col gap-3">

          {/* Identité */}
          <div className="rounded-xl border border-white/8 bg-surface p-4">
            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Client</p>
            <InfoRow label="Nom"        value={clientName}           />
            <InfoRow label="Entreprise" value={data.clientCompany}   />
            <InfoRow label="Email"      value={data.clientEmail}     />
            <InfoRow label="Téléphone"  value={data.clientPhone}     />
            <InfoRow label="Secteur"    value={data.clientIndustry}  />
          </div>

          {/* Besoins */}
          {(data.clientObjectives.length > 0 || data.clientNeeds) && (
            <div className="rounded-xl border border-white/8 bg-surface p-4">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Besoins</p>
              {data.clientObjectives.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {data.clientObjectives.map((id) => (
                    <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {OBJECTIVE_LABELS[id] ?? id}
                    </span>
                  ))}
                </div>
              )}
              {data.clientNeeds && (
                <p className="text-xs text-muted leading-relaxed line-clamp-3">{data.clientNeeds}</p>
              )}
            </div>
          )}

          {/* Budget client */}
          {(data.clientBudgetRange || data.clientOwnEstimate !== null) && (
            <div className="rounded-xl border border-white/8 bg-surface p-4">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Budget client</p>
              <InfoRow label="Budget annoncé"  value={BUDGET_LABELS[data.clientBudgetRange] ?? data.clientBudgetRange} />
              {data.clientOwnEstimate !== null && (
                <InfoRow label="Son estimation" value={fmt(data.clientOwnEstimate)} />
              )}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs text-muted">Devis Osiris HT</span>
                <span className="text-xs font-bold text-accent">{fmt(quote.totalHT)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite : devis */}
        <div className="rounded-xl border border-white/8 bg-surface p-4">
          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Devis Osiris</p>

          <PriceRow label={siteType?.label ?? data.siteTypeId} value={fmt(quote.basePrice)} />
          {quote.extraPagesPrice > 0 && (
            <PriceRow label={`Pages supplémentaires (×${data.extraPages})`} value={"+" + fmt(quote.extraPagesPrice)} />
          )}
          {data.selectedUpgrades.map((id) => {
            const opt = allUpgOpts.find((o) => o.id === id);
            return opt ? <PriceRow key={id} label={opt.label} value={"+" + fmt(opt.price)} /> : null;
          })}
          {data.selectedUniversal.map((id) => {
            const opt = UNIVERSAL_OPTIONS.find((o) => o.id === id);
            return opt ? <PriceRow key={id} label={opt.label} value={"+" + fmt(opt.price)} /> : null;
          })}

          <PriceRow label="Sous-total HT" value={fmt(quote.subtotalHT)} bold />
          {quote.deadlineSurcharge > 0 && (
            <PriceRow
              label={`Délai ${deadline?.label ?? ""} (+${Math.round((deadline?.rate ?? 0) * 100)}%)`}
              value={"+" + fmt(quote.deadlineSurcharge)}
            />
          )}
          <PriceRow label="Total HT" value={fmt(quote.totalHT)} bold />
          {quote.discountAmount > 0 && (
            <div className="flex items-center justify-between gap-4 py-1.5">
              <span className="text-xs text-red-400">Remise –{quote.discountPercent}%</span>
              <span className="text-xs font-semibold text-red-400">–{fmt(quote.discountAmount)}</span>
            </div>
          )}
          <PriceRow label="TVA 20 %" value={"+" + fmt(quote.tva)} />

          {/* TTC */}
          <div className="mt-3 rounded-xl bg-surface2 border border-white/8 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-textc">Total TTC</span>
            <span className="text-xl font-black text-accent font-display">{fmt(quote.totalTTC)}</span>
          </div>

          {data.wantsUnlimited && (
            <p className="text-[10px] text-amber-400 mt-2 text-right">
              + Modifications illimitées : +19,90 €/mois
            </p>
          )}
        </div>
      </div>

      {/* ── Actions */}
      <div className="rounded-xl border border-white/8 bg-surface p-4">
        <p className="text-xs font-semibold text-textc mb-3">Actions</p>
        <div className="flex flex-wrap gap-2">

          {/* Télécharger PDF */}
          <Button
            variant="secondary"
            size="sm"
            onClick={generateAndDownload}
            icon={<Download size={13} />}
          >
            Télécharger le PDF
          </Button>

          {/* Calendrier .ics */}
          {data.rdvDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadCalendar}
              icon={<Calendar size={13} />}
            >
              Ajouter au calendrier
            </Button>
          )}

          {/* Envoyer au client */}
          <Button
            variant={sentClient ? "ghost" : "primary"}
            size="sm"
            loading={sendingClient}
            disabled={sentClient || !data.clientEmail}
            onClick={() => sendEmail("client")}
            icon={sentClient ? <CheckCircle size={13} /> : <Send size={13} />}
          >
            {sentClient ? "Envoyé au client" : "Envoyer au client"}
          </Button>

          {/* Envoyer aux directeurs */}
          <Button
            variant={sentDirectors ? "ghost" : "secondary"}
            size="sm"
            loading={sendingDirectors}
            disabled={sentDirectors}
            onClick={() => sendEmail("directors")}
            icon={sentDirectors ? <CheckCircle size={13} /> : <Users size={13} />}
          >
            {sentDirectors ? "Envoyé aux directeurs" : "Envoyer aux directeurs"}
          </Button>
        </div>

        {/* Lien de signature */}
        <div className="mt-3 pt-3 border-t border-white/8">
          {!quoteLink ? (
            <Button
              variant="ghost"
              size="sm"
              loading={generatingLink}
              onClick={generateLink}
              icon={<Link2 size={13} />}
            >
              Générer un lien de signature
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-[10px] bg-surface2 border border-white/8 px-3 py-2">
                <span className="text-xs text-muted flex-1 truncate">{quoteLink}</span>
                <button onClick={copyLink} className="shrink-0 text-faint hover:text-accent transition-colors">
                  {copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInEmail}
                  onChange={(e) => setIncludeInEmail(e.target.checked)}
                  className="accent-accent"
                />
                Inclure le lien dans l&apos;email client
              </label>
            </div>
          )}
        </div>

        {/* Helper */}
        <div className="mt-3 flex items-start gap-2">
          <AlertCircle size={12} className="text-faint shrink-0 mt-0.5" />
          <p className="text-[10px] text-faint leading-relaxed">
            L&apos;envoi par email requiert <code className="text-faint bg-surface2 px-1 rounded">RESEND_API_KEY</code> dans vos variables d&apos;environnement.
            Les destinataires directeurs sont configurés via <code className="text-faint bg-surface2 px-1 rounded">NEXT_PUBLIC_DIRECTOR_EMAILS</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
