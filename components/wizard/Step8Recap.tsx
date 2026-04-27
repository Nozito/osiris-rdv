"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Check,
  User,
  Briefcase,
  Palette,
  Settings2,
  MessageSquare,
  Send,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import {
  SITE_TYPES,
  DESIGN_OPTIONS,
  PAGE_OPTIONS,
  TECH_OPTIONS,
  BUDGET_RANGES,
  calcTotal,
  formatPrice,
} from "@/lib/pricing";
import { generateCommercialPdf } from "@/components/pdf/pdfCommercial";
import { generateProspectPdf } from "@/components/pdf/pdfProspect";
import { createClient } from "@/lib/supabase/client";
import { useWizard } from "./WizardShell";
import type { Lead } from "@/types";

interface Step8RecapProps {
  leadId: string | null;
}

export function Step8Recap({ leadId }: Step8RecapProps) {
  const { data, update } = useWizard();
  const [status, setStatus] = useState<string>("draft");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const supabase = createClient();

  const site = SITE_TYPES.find((s) => s.id === data.projectType);
  const design = DESIGN_OPTIONS.find((d) => d.id === data.designStyle);
  const pages = PAGE_OPTIONS.filter((p) => data.selectedPages.includes(p.id));
  const techs = TECH_OPTIONS.filter((t) => data.techOptions.includes(t.id));
  const budgetLabel = BUDGET_RANGES.find(
    (b) => b.id === data.budgetRange
  )?.label;

  const { oneTime, monthly } = calcTotal({
    siteTypeId: data.projectType,
    pageOptionIds: data.selectedPages,
    designId: data.designStyle,
    techOptionIds: data.techOptions,
  });

  const finalPrice = data.adjustedPrice ?? oneTime;

  const buildLeadObj = (): Partial<Lead> => ({
    client_name: data.clientName,
    client_email: data.clientEmail,
    client_company: data.clientCompany,
    client_phone: data.clientPhone,
    project_type: data.projectType,
    project_description: data.projectDescription,
    project_deadline: data.projectDeadline || null,
    selected_pages: data.selectedPages,
    design_style: data.designStyle,
    brand_assets: data.brandAssets,
    tech_options: data.techOptions,
    budget_range: data.budgetRange,
    total_one_time: oneTime,
    total_monthly: monthly,
    adjusted_price: data.adjustedPrice,
    notes: data.notes,
  });

  const handleDownloadCommercial = () => {
    generateCommercialPdf(data, finalPrice, monthly);
  };

  const handleDownloadProspect = () => {
    generateProspectPdf(data, finalPrice, monthly);
  };

  const handleMarkSent = async () => {
    if (!leadId) return;
    setUpdatingStatus(true);
    await supabase.from("leads").update({ status: "sent" }).eq("id", leadId);
    setStatus("sent");
    setUpdatingStatus(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <Card glow>
        <div className="flex items-start justify-between mb-5">
          <CardHeader
            title="Récapitulatif du devis"
            description={`Pour ${data.clientName || "le prospect"}${data.clientCompany ? ` — ${data.clientCompany}` : ""}`}
            icon={<FileText size={18} />}
          />
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-faint" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Client
              </span>
            </div>
            <p className="text-sm font-medium text-textc">
              {data.clientName || "—"}
            </p>
            {data.clientCompany && (
              <p className="text-xs text-muted">{data.clientCompany}</p>
            )}
            {data.clientEmail && (
              <p className="text-xs text-muted">{data.clientEmail}</p>
            )}
            {data.clientPhone && (
              <p className="text-xs text-muted">{data.clientPhone}</p>
            )}
          </div>

          {/* Projet */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={14} className="text-faint" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Projet
              </span>
            </div>
            <p className="text-sm font-medium text-textc">
              {site?.label ?? "—"}
            </p>
            {budgetLabel && (
              <p className="text-xs text-muted">Budget : {budgetLabel}</p>
            )}
            {data.projectDeadline && (
              <p className="text-xs text-muted">
                Deadline :{" "}
                {new Date(data.projectDeadline).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>

          {/* Design */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={14} className="text-faint" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Design
              </span>
            </div>
            <p className="text-sm font-medium text-textc">
              {design?.label ?? "—"}
            </p>
            <p className="text-xs text-muted">
              Charte :{" "}
              {data.brandAssets ? "existante" : "à créer"}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 size={14} className="text-faint" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                Options
              </span>
            </div>
            {pages.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {pages.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-surface2 text-muted border border-white/8"
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            )}
            {techs.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {techs.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
            {pages.length === 0 && techs.length === 0 && (
              <p className="text-xs text-faint">Aucune option</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="mt-5 pt-5 border-t border-white/8 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted">Total estimé</p>
            {monthly > 0 && (
              <p className="text-xs text-muted mt-0.5">
                + {formatPrice(monthly)}/mois
              </p>
            )}
          </div>
          <AnimatedPrice
            value={finalPrice}
            suffix=" €"
            className="text-3xl font-bold text-accent font-display"
          />
        </div>
      </Card>

      {/* Notes internes */}
      <Card>
        <CardHeader
          title="Notes internes"
          description="Visibles dans le PDF commercial uniquement"
          icon={<MessageSquare size={18} />}
        />
        <Textarea
          placeholder="Ex : Prospect hésitant sur le budget, à rappeler vendredi. Concurrent identifié : agence X. Point fort à valoriser : délai rapide de 6 semaines."
          value={data.notes}
          onChange={(e) => update({ notes: e.target.value })}
          rows={4}
        />
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader
          title="Générer les documents"
          description="Téléchargez le PDF adapté à chaque usage"
          icon={<Download size={18} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleDownloadCommercial}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-surface2 border border-white/8 hover:border-white/20 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-accent" />
              <span className="text-sm font-semibold text-textc">
                PDF Commercial
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Toutes les infos + notes internes + budget client. Usage interne
              uniquement.
            </p>
            <span className="text-xs text-accent flex items-center gap-1 mt-1">
              <Download size={12} />
              Télécharger
            </span>
          </button>

          <button
            onClick={handleDownloadProspect}
            className="flex flex-col gap-2 p-4 rounded-2xl bg-accent/8 border border-accent/20 hover:border-accent/40 transition-all text-left group"
          >
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-accent" />
              <span className="text-sm font-semibold text-textc">
                PDF Prospect
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Devis épuré sans notes ni budget. À envoyer directement au
              client.
            </p>
            <span className="text-xs text-accent flex items-center gap-1 mt-1">
              <Download size={12} />
              Télécharger
            </span>
          </button>
        </div>

        {leadId && (
          <div className="flex items-center gap-3 pt-4 border-t border-white/8">
            <Button
              variant={status === "sent" ? "secondary" : "primary"}
              loading={updatingStatus}
              onClick={handleMarkSent}
              disabled={status === "sent"}
              icon={status === "sent" ? <Check size={16} /> : <Send size={16} />}
            >
              {status === "sent" ? "Marqué comme envoyé" : "Marquer comme envoyé"}
            </Button>
            {status === "sent" && (
              <p className="text-xs text-muted">
                Ce lead est maintenant visible comme envoyé dans le dashboard
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
