"use client";
// OSIRIS CRM — pricing configurator: pré-qualification — profil client

import { useConfigurator } from "./ConfiguratorShell";
import { FloatingInput } from "@/components/ui/FloatingInput";

const INDUSTRIES = [
  "Artisanat / BTP",
  "Commerce / Retail",
  "Santé / Bien-être",
  "Restauration / Hôtellerie",
  "Services aux entreprises",
  "Tech / Startup",
  "Immobilier",
  "Sport / Loisirs",
  "Éducation / Formation",
  "Art / Culture / Médias",
  "Autre",
];

const COMPANY_SIZES = [
  { id: "solo",   label: "Solo / indépendant" },
  { id: "2-10",   label: "2 – 10 personnes"   },
  { id: "11-50",  label: "11 – 50 personnes"  },
  { id: "51-200", label: "51 – 200 personnes" },
  { id: "200+",   label: "+ 200 personnes"    },
];

const CURRENT_SITE_OPTIONS = [
  { id: "yes-recent", label: "Oui, récent et fonctionnel"  },
  { id: "yes-old",    label: "Oui, mais obsolète / à refaire" },
  { id: "refonte",    label: "En cours de refonte"         },
  { id: "no",         label: "Non, premier site"           },
];

export function QStep1Profil() {
  const { data, update } = useConfigurator();

  const field = (key: keyof typeof data, label: string, placeholder: string, type = "text") => (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        type={type}
        value={(data[key] as string) ?? ""}
        onChange={(e) => update({ [key]: e.target.value } as Parameters<typeof update>[0])}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
      />
    </div>
  );

  const hasSite = data.clientCurrentSite === "yes-recent" || data.clientCurrentSite === "yes-old";

  return (
    <div className="py-4 max-w-2xl">
      <h2 className="text-lg font-bold text-textc font-display mb-1">Profil du client</h2>
      <p className="text-sm text-muted mb-6">Informations de contact et contexte de l'entreprise.</p>

      {/* Contact */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field("clientFirstName", "Prénom",    "Jean"     )}
          {field("clientLastName",  "Nom",       "Dupont"   )}
          {field("clientCompany",   "Entreprise","Acme SAS" )}
          <FloatingInput
            label="Téléphone"
            type="tel"
            value={data.clientPhone}
            onChange={(v) => update({ clientPhone: v })}
            placeholder="+33 6 00 00 00 00"
          />
          <div className="sm:col-span-2">
            <FloatingInput
              label="Email"
              type="email"
              value={data.clientEmail}
              onChange={(v) => update({ clientEmail: v })}
              placeholder="jean@acme.fr"
            />
          </div>
        </div>
      </div>

      {/* Secteur */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Secteur d'activité</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => update({ clientIndustry: ind })}
              className={`
                text-left px-3 py-2 rounded-lg border text-xs transition-all
                ${data.clientIndustry === ind
                  ? "border-accent/50 bg-accent/8 text-accent font-medium shadow-[0_0_0_1px_rgba(37,99,235,0.3)]"
                  : "border-white/8 bg-surface2 text-muted hover:border-white/20 hover:text-textc"
                }
                hover:scale-[1.02] active:scale-[0.97]
              `}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Taille */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mb-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Taille de l'entreprise</p>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => update({ clientCompanySize: s.id })}
              className={`
                px-3 py-2 rounded-lg border text-xs transition-all
                ${data.clientCompanySize === s.id
                  ? "border-accent/50 bg-accent/8 text-accent font-medium shadow-[0_0_0_1px_rgba(37,99,235,0.3)]"
                  : "border-white/8 bg-surface2 text-muted hover:border-white/20 hover:text-textc"
                }
                hover:scale-[1.02] active:scale-[0.97]
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Site actuel */}
      <div className="rounded-xl border border-white/8 bg-surface p-5">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Site web actuel</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {CURRENT_SITE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => update({ clientCurrentSite: opt.id, clientSiteUrl: opt.id === "no" ? "" : data.clientSiteUrl })}
              className={`
                text-left px-4 py-3 rounded-xl border text-sm transition-all
                ${data.clientCurrentSite === opt.id
                  ? "border-accent/50 bg-accent/8 text-accent font-medium shadow-[0_0_0_1px_rgba(37,99,235,0.3)]"
                  : "border-white/8 bg-surface2 text-muted hover:border-white/20 hover:text-textc"
                }
                hover:scale-[1.02] active:scale-[0.97]
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {hasSite && (
          <div>
            <label className="block text-xs text-muted mb-1">URL du site actuel</label>
            <input
              type="url"
              value={data.clientSiteUrl}
              onChange={(e) => update({ clientSiteUrl: e.target.value })}
              placeholder="https://www.monsite.fr"
              className="w-full h-9 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Date & heure du RDV */}
      <div className="rounded-xl border border-white/8 bg-surface p-5 mt-4">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Date & heure du RDV</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Date et heure</label>
            <input
              type="datetime-local"
              value={data.rdvDate}
              onChange={(e) => update({ rdvDate: e.target.value })}
              className="w-full h-9 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Notes pré-RDV</label>
            <textarea
              value={data.rdvNotes}
              onChange={(e) => update({ rdvNotes: e.target.value })}
              placeholder="Points à aborder, contexte…"
              rows={3}
              className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
