"use client";
// OSIRIS CRM — pricing configurator

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
// ── Pré-qualification
import { QStep1Profil }   from "./QStep1Profil";
import { QStep2Besoins }  from "./QStep2Besoins";
import { QStep3Budget }   from "./QStep3Budget";
// ── Configurateur (INCHANGÉS)
import { CStep1Offre }    from "./CStep1Offre";
import { CStep2Pages }    from "./CStep2Pages";
import { CStep3Upgrade }  from "./CStep3Upgrade";
import { CStep4Options }  from "./CStep4Options";
import { CStep5Delai }    from "./CStep5Delai";
import { CStep6Recap }    from "./CStep6Recap";
// ── Envoi final
import { FStep1Envoi }    from "./FStep1Envoi";
import { createClient }   from "@/lib/supabase/client";
import {
  SITE_TYPES,
  DEADLINES,
  calcQuote,
} from "@/lib/configurator-pricing";
import { toast }          from "@/components/ui/Toast";
import type { ConfiguratorData, LeadQuote, LeadStatus } from "@/types";
import { CONFIGURATOR_INITIAL_DATA } from "@/types";

// OSIRIS CRM — pricing configurator: 10 étapes — 3 pré-qual + 6 configurateur + 1 envoi
type StepPhase = "qual" | "devis" | "envoi";
const STEPS: Array<{ label: string; short: string; phase: StepPhase }> = [
  { label: "Profil",   short: "1",  phase: "qual"  },
  { label: "Besoins",  short: "2",  phase: "qual"  },
  { label: "Budget",   short: "3",  phase: "qual"  },
  { label: "Offre",    short: "4",  phase: "devis" },
  { label: "Pages",    short: "5",  phase: "devis" },
  { label: "Upgrade",  short: "6",  phase: "devis" },
  { label: "Options",  short: "7",  phase: "devis" },
  { label: "Délai",    short: "8",  phase: "devis" },
  { label: "Récap",    short: "9",  phase: "devis" },
  { label: "Envoi",    short: "10", phase: "envoi" },
];

// Indices des nouvelles phases (0-based)
const PHASE_STARTS = { qual: 0, devis: 3, envoi: 9 };
const PHASE_LABELS = { qual: "Qualification", devis: "Devis Osiris", envoi: "Envoi" };

interface ConfiguratorContextValue {
  data:       ConfiguratorData;
  update:     (patch: Partial<ConfiguratorData>) => void;
  currentStep: number;
  totalSteps:  number;
  navigate:    (step: number) => void;
  next:        () => void;
  prev:        () => void;
  leadId:      string | null;
  saving:      boolean;
  quote:       ReturnType<typeof calcQuote>;
  validate:    () => Promise<void>;
}

const ConfiguratorContext = createContext<ConfiguratorContextValue | null>(null);

export function useConfigurator() {
  const ctx = useContext(ConfiguratorContext);
  if (!ctx) throw new Error("useConfigurator must be used inside ConfiguratorShell");
  return ctx;
}

interface ConfiguratorShellProps {
  initialData?:    Partial<ConfiguratorData>;
  existingLeadId?: string;
  initialStatus?:  string;
  initialStep?:    number;
}

// OSIRIS CRM — pricing configurator: skip Upgrade (step 5) pour vitrine-premium
function shouldSkipUpgrade(siteTypeId: string) {
  return siteTypeId !== "vitrine-simple" && siteTypeId !== "vitrine-standard";
}

export function ConfiguratorShell({
  initialData,
  existingLeadId,
  initialStatus,
  initialStep = 0,
}: ConfiguratorShellProps) {
  const [data, setData]       = useState<ConfiguratorData>({ ...CONFIGURATOR_INITIAL_DATA, ...initialData });
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [leadId, setLeadId]   = useState<string | null>(existingLeadId ?? null);
  const [saving, setSaving]   = useState(false);
  const [direction, setDirection] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const router   = useRouter();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((patch: Partial<ConfiguratorData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  // OSIRIS CRM — pricing configurator: live quote recomputed via calcQuote()
  const quote = useMemo(
    () =>
      calcQuote({
        siteTypeId:        data.siteTypeId || "vitrine-simple",
        extraPages:        data.extraPages,
        selectedUpgrades:  data.selectedUpgrades,
        selectedUniversal: data.selectedUniversal,
        deadlineId:        data.deadlineId || "standard",
      }),
    [data.siteTypeId, data.extraPages, data.selectedUpgrades, data.selectedUniversal, data.deadlineId]
  );

  const upsertClient = useCallback(
    async (d: ConfiguratorData, userId: string): Promise<string | null> => {
      const name = [d.clientFirstName, d.clientLastName].filter(Boolean).join(" ");
      if (!name && !d.clientEmail) return d.clientId;
      const payload = { commercial_id: userId, name, email: d.clientEmail, company: d.clientCompany, phone: d.clientPhone };
      if (d.clientId) {
        const { error } = await supabase.from("clients").update(payload).eq("id", d.clientId);
        if (error) console.error("[upsertClient] update error:", error);
        return d.clientId;
      }
      const { data: ins, error } = await supabase.from("clients").insert(payload).select("id").single();
      if (error) console.error("[upsertClient] insert error:", error);
      return ins?.id ?? null;
    },
    [supabase]
  );

  const saveToSupabase = useCallback(
    async (d: ConfiguratorData, id: string | null): Promise<{ leadId: string | null; clientId: string | null }> => {
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { leadId: null, clientId: null };

        // OSIRIS CRM — pricing configurator: toujours via calcQuote()
        const q = calcQuote({
          siteTypeId:        d.siteTypeId || "vitrine-simple",
          extraPages:        d.extraPages,
          selectedUpgrades:  d.selectedUpgrades,
          selectedUniversal: d.selectedUniversal,
          deadlineId:        d.deadlineId || "standard",
        });

        const siteType = SITE_TYPES.find((s) => s.id === d.siteTypeId);
        const deadline = DEADLINES.find((dl) => dl.id === d.deadlineId);

        const quoteData: LeadQuote = {
          // Pré-qualification
          clientCompany:     d.clientCompany,
          clientIndustry:    d.clientIndustry,
          clientCompanySize: d.clientCompanySize,
          clientCurrentSite: d.clientCurrentSite,
          clientSiteUrl:     d.clientSiteUrl,
          clientObjectives:  d.clientObjectives,
          clientNeeds:       d.clientNeeds,
          clientBudgetRange: d.clientBudgetRange,
          clientOwnEstimate: d.clientOwnEstimate,
          clientBudgetNotes: d.clientBudgetNotes,
          // Configurateur
          siteTypeId:        d.siteTypeId,
          siteTypeLabel:     siteType?.label ?? "",
          extraPages:        d.extraPages,
          selectedUpgrades:  d.selectedUpgrades,
          selectedUniversal: d.selectedUniversal,
          wantsUnlimited:    d.wantsUnlimited,
          deadlineId:        d.deadlineId,
          deadlineLabel:     deadline?.label ?? "",
          ...q,
        };

        const resolvedClientId =
          d.clientEmail || d.clientFirstName ? await upsertClient(d, user.id) : d.clientId;

        // OSIRIS CRM — pricing configurator: total_one_time = totalTTC pour rétro-compat affichage prix
        const payload = {
          commercial_id:       user.id,
          client_id:           resolvedClientId,
          client_name:         [d.clientFirstName, d.clientLastName].filter(Boolean).join(" "),
          client_email:        d.clientEmail,
          client_company:      d.clientCompany,
          client_phone:        d.clientPhone,
          project_type:        d.siteTypeId,
          project_description: d.clientNeeds,
          project_deadline:    null,
          selected_pages:      d.selectedUniversal,
          design_style:        "template",
          brand_assets:        false,
          tech_options:        [] as string[],
          budget_range:        d.clientBudgetRange,
          total_one_time:      q.totalTTC,
          total_monthly:       d.wantsUnlimited ? 20 : 0,
          adjusted_price:      null,
          notes:               d.clientBudgetNotes,
          quote_data:          quoteData,
        };

        if (id) {
          const { error } = await supabase.from("leads").update(payload).eq("id", id);
          if (error) {
            console.error("[saveToSupabase] update error:", error);
            // Retry without quote_data if column is missing
            if (error.code === "42703" || error.message?.includes("quote_data")) {
              const { quote_data: _, ...payloadFallback } = payload;
              const { error: e2 } = await supabase.from("leads").update(payloadFallback).eq("id", id);
              if (e2) toast.error("Erreur lors de la sauvegarde");
            } else {
              toast.error("Erreur lors de la sauvegarde");
            }
          }
          return { leadId: id, clientId: resolvedClientId };
        } else {
          const { data: ins, error } = await supabase
            .from("leads").insert({ ...payload, status: "draft" }).select("id").single();
          if (error) {
            console.error("[saveToSupabase] insert error:", error);
            // Retry without quote_data if column is missing
            if (error.code === "42703" || error.message?.includes("quote_data")) {
              const { quote_data: _, ...payloadFallback } = payload;
              const { data: ins2, error: e2 } = await supabase
                .from("leads").insert({ ...payloadFallback, status: "draft" }).select("id").single();
              if (e2) {
                toast.error("Erreur lors de la création — vérifiez la console");
              } else {
                toast.success("Lead créé ✓ (migration quote_data manquante)");
              }
              return { leadId: ins2?.id ?? null, clientId: resolvedClientId };
            }
            toast.error("Erreur lors de la création — vérifiez la console");
            return { leadId: null, clientId: resolvedClientId };
          }
          toast.success("Lead créé ✓");
          return { leadId: ins?.id ?? null, clientId: resolvedClientId };
        }
      } finally {
        setSaving(false);
      }
    },
    [supabase, upsertClient]
  );

  const triggerSave = useCallback(
    (d: ConfiguratorData, id: string | null) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const { leadId: newId, clientId: newCid } = await saveToSupabase(d, id);
        if (newId && !id) setLeadId(newId);
        if (newCid && !d.clientId) update({ clientId: newCid });
      }, 800);
    },
    [saveToSupabase, update]
  );

  const navigate = useCallback(
    (step: number) => { setDirection(step > currentStep ? 1 : -1); setCurrentStep(step); },
    [currentStep]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => {
      // OSIRIS CRM — pricing configurator: skip Upgrade (idx 5) pour vitrine-premium
      if (s === 4 && shouldSkipUpgrade(data.siteTypeId)) return 6;
      return Math.min(s + 1, STEPS.length - 1);
    });
    triggerSave(data, leadId);
  }, [data, leadId, triggerSave]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => {
      // OSIRIS CRM — pricing configurator: skip Upgrade en retour pour vitrine-premium
      if (s === 6 && shouldSkipUpgrade(data.siteTypeId)) return 4;
      return Math.max(s - 1, 0);
    });
  }, [data.siteTypeId]);

  const validate = useCallback(async () => {
    if (!data.clientFirstName || !data.clientEmail) { toast.error("Prénom et email requis"); return; }
    const result = await saveToSupabase(data, leadId);
    if (result.leadId) {
      if (!leadId) setLeadId(result.leadId);
      toast.success("Devis validé ✓");
      router.push("/dashboard");
    }
  }, [data, leadId, saveToSupabase, router]);

  const handleDelete = useCallback(async () => {
    if (!leadId) { router.push("/dashboard"); return; }
    setDeleting(true);
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) { toast.error("Erreur lors de la suppression"); setDeleting(false); return; }
    toast.success("Lead supprimé");
    router.push("/dashboard");
  }, [leadId, supabase, router]);

  const stepComponents = [
    <QStep1Profil  key="q1" />,
    <QStep2Besoins key="q2" />,
    <QStep3Budget  key="q3" />,
    <CStep1Offre   key="c1" />,
    <CStep2Pages   key="c2" />,
    <CStep3Upgrade key="c3" />,
    <CStep4Options key="c4" />,
    <CStep5Delai   key="c5" />,
    <CStep6Recap   key="c6" />,
    <FStep1Envoi   key="f1" />,
  ];

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const progress    = ((currentStep + 1) / STEPS.length) * 100;
  const currentPhase = STEPS[currentStep].phase;

  return (
    <ConfiguratorContext.Provider
      value={{ data, update, currentStep, totalSteps: STEPS.length, navigate, next, prev, leadId, saving, quote, validate }}
    >
      <div className="flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-white/8">
          <div className="max-w-4xl mx-auto px-4 py-3">

            {/* Top row */}
            <div className="flex items-center gap-3 mb-2.5">
              <Link href="/dashboard" className="flex items-center gap-1 text-muted hover:text-textc transition-colors shrink-0">
                <ChevronLeft size={15} />
                <span className="text-[13px] font-bold font-display hidden sm:block">OSIRIS</span>
              </Link>
              <span className="hidden sm:block h-4 w-px bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                {/* Mobile : nom étape */}
                <p className="sm:hidden text-[13px] font-medium text-textc truncate">
                  {STEPS[currentStep].label}
                </p>
                {/* Desktop : phase active */}
                <p className="hidden sm:block text-[12px] text-muted truncate">
                  {existingLeadId ? "Modifier le lead" : "Nouveau RDV"}&nbsp;
                  <span className="text-accent font-medium">— {PHASE_LABELS[currentPhase]}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {saving && <span className="text-xs text-faint animate-pulse">Sauvegarde…</span>}
                <span className="text-xs text-faint tabular-nums">
                  {currentStep + 1}<span className="opacity-40">/{STEPS.length}</span>
                </span>
              </div>
            </div>

            {/* Mobile : barre */}
            <div className="sm:hidden">
              <div className="h-1 rounded-full bg-surface2 overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Desktop : stepper avec séparation de phases */}
            <div className="hidden sm:flex items-center gap-0.5">
              {STEPS.map((step, i) => {
                // Séparateur de phase entre les phases
                const prevPhase = i > 0 ? STEPS[i - 1].phase : step.phase;
                const phaseChange = i > 0 && step.phase !== prevPhase;
                const dotColor =
                  i < currentStep
                    ? "bg-accent text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                    : i === currentStep
                    ? "bg-accent/20 text-accent border border-accent/50"
                    : step.phase === "qual"
                    ? "bg-surface2 text-faint border border-white/8"
                    : step.phase === "envoi"
                    ? "bg-surface2 text-faint border border-white/8"
                    : "bg-surface2 text-faint border border-white/8";

                return (
                  <div key={i} className="flex items-center gap-0.5 flex-1 min-w-0">
                    {/* Séparateur de phase */}
                    {phaseChange && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 shrink-0 mx-0.5" />
                    )}
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${dotColor}`}>
                      {i < currentStep ? "✓" : step.short}
                    </div>
                    <span className={`hidden lg:block text-[10px] truncate transition-colors mr-0.5 ${i === currentStep ? "text-textc font-medium" : "text-faint"}`}>
                      {step.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <motion.div className="flex-1 h-px mx-0.5 bg-white/8 relative overflow-hidden" style={{ minWidth: 4 }}>
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-accent/50 rounded-full"
                          initial={false}
                          animate={{ width: i < currentStep ? "100%" : "0%" }}
                          transition={{ duration: 0.35 }}
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer navigation */}
        <footer className="sticky bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-white/8">
          <AnimatePresence mode="wait">
            {deleteConfirm ? (
              <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                <AlertTriangle size={15} className="text-danger shrink-0" />
                <span className="text-sm text-textc flex-1">Supprimer ce lead ?</span>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Annuler</Button>
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} icon={<Trash2 size={13} />}>Supprimer</Button>
              </motion.div>
            ) : (
              <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={prev} disabled={currentStep === 0} icon={<ChevronLeft size={15} />}>
                  <span className="hidden sm:inline">Précédent</span>
                </Button>

                {existingLeadId && (
                  <button onClick={() => setDeleteConfirm(true)}
                    className="p-2 rounded-[10px] text-faint hover:text-danger hover:bg-danger/8 transition-all" title="Supprimer ce lead">
                    <Trash2 size={15} />
                  </button>
                )}

                <div className="flex-1" />

                <Button variant="secondary" size="sm" loading={saving} onClick={() => triggerSave(data, leadId)} icon={<Save size={13} />}>
                  <span className="hidden sm:inline">Sauvegarder</span>
                </Button>

                {currentStep < STEPS.length - 1 && (
                  <Button variant="primary" size="sm" onClick={next} iconRight={<ChevronRight size={15} />}>
                    Suivant
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </ConfiguratorContext.Provider>
  );
}
