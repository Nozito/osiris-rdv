"use client";
// OSIRIS CRM — pricing configurator

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Trash2, AlertTriangle, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import { ConfiguratorSidebar } from "./ConfiguratorSidebar";
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

const DRAFT_KEY = "osiris_rdv_draft";
const DRAFT_TTL  = 24 * 60 * 60 * 1000; // 24h

export function ConfiguratorShell({
  initialData,
  existingLeadId,
  initialStatus,
  initialStep = 0,
}: ConfiguratorShellProps) {
  const [data, setData]       = useState<ConfiguratorData>({ ...CONFIGURATOR_INITIAL_DATA, ...initialData });
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([initialStep]));
  const [leadId, setLeadId]   = useState<string | null>(existingLeadId ?? null);
  const [saving, setSaving]   = useState(false);
  const [direction, setDirection] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [phaseBanner, setPhaseBanner] = useState<string | null>(null);
  const [draftToast, setDraftToast] = useState<{ data: ConfiguratorData; leadId: string | null } | null>(null);
  const prevPhaseRef = useRef<StepPhase>(STEPS[initialStep].phase);
  const supabase = createClient();
  const router   = useRouter();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restauration brouillon localStorage — vérifie que le lead existe encore en DB
  useEffect(() => {
    if (existingLeadId) return;
    (async () => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw) as { data: ConfiguratorData; leadId: string | null; savedAt: number };
        if (!saved.data?.clientFirstName) { localStorage.removeItem(DRAFT_KEY); return; }
        if (Date.now() - saved.savedAt > DRAFT_TTL) { localStorage.removeItem(DRAFT_KEY); return; }

        // Si le draft avait été enregistré en DB, vérifier qu'il existe toujours
        if (saved.leadId) {
          const { data: exists } = await supabase
            .from("leads")
            .select("id")
            .eq("id", saved.leadId)
            .maybeSingle();
          if (!exists) {
            // Lead supprimé → on efface le localStorage silencieusement
            localStorage.removeItem(DRAFT_KEY);
            return;
          }
        }

        setDraftToast(saved);
      } catch {
        // ignore parse errors
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((patch: Partial<ConfiguratorData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ data: next, leadId, savedAt: Date.now() }));
      } catch { /* ignore */ }
      return next;
    });
  }, [leadId]);

  // OSIRIS CRM — pricing configurator: live quote recomputed via calcQuote()
  const quote = useMemo(
    () =>
      calcQuote({
        siteTypeId:        data.siteTypeId || "vitrine-simple",
        extraPages:        data.extraPages,
        selectedUpgrades:  data.selectedUpgrades,
        selectedUniversal: data.selectedUniversal,
        deadlineId:        data.deadlineId || "standard",
        discountPercent:   data.discountPercent,
        multilangCount:    data.multilangCount,
      }),
    [data.siteTypeId, data.extraPages, data.selectedUpgrades, data.selectedUniversal, data.deadlineId, data.discountPercent, data.multilangCount]
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
          discountPercent:   d.discountPercent,
          multilangCount:    d.multilangCount,
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
          multilangCount:    d.multilangCount,
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
          commercial_id:        user.id,
          client_id:            resolvedClientId,
          client_name:          [d.clientFirstName, d.clientLastName].filter(Boolean).join(" "),
          client_email:         d.clientEmail,
          client_company:       d.clientCompany,
          client_phone:         d.clientPhone,
          project_type:         d.siteTypeId,
          project_description:  d.clientNeeds,
          project_deadline:     null,
          selected_pages:       d.selectedUniversal,
          design_style:         "template",
          brand_assets:         false,
          tech_options:         [] as string[],
          budget_range:         d.clientBudgetRange,
          total_one_time:       q.totalTTC,
          total_monthly:        d.wantsUnlimited ? 20 : 0,
          adjusted_price:       null,
          notes:                d.clientBudgetNotes,
          quote_data:           quoteData,
          discount_percent:     d.discountPercent || 0,
          discount_reason:      d.discountReason || "",
          discount_conditions:  d.discountConditions || "",
          rdv_date:             d.rdvDate || null,
          rdv_notes:            d.rdvNotes || "",
        };

        // Workflow validation admin si remise > 15%
        const statusOverride = d.discountPercent > 15 ? "pending_approval" : undefined;

        if (id) {
          const updatePayload = statusOverride ? { ...payload, status: statusOverride } : payload;
          const { error } = await supabase.from("leads").update(updatePayload).eq("id", id);
          if (error) {
            console.error("[saveToSupabase] update error:", error.message, error.code, error.details);
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
          const insertStatus = statusOverride ?? "draft";
          const { data: ins, error } = await supabase
            .from("leads").insert({ ...payload, status: insertStatus }).select("id").single();
          if (error) {
            console.error("[saveToSupabase] insert error:", error.message, error.code, error.details);
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

  const showPhaseBanner = useCallback((newStep: number) => {
    const newPhase = STEPS[newStep].phase;
    if (newPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = newPhase;
      setPhaseBanner(PHASE_LABELS[newPhase]);
      setTimeout(() => setPhaseBanner(null), 1200);
    }
  }, []);

  const navigate = useCallback(
    (step: number) => {
      if (!visitedSteps.has(step)) return; // non-visité → non-cliquable
      setDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
      showPhaseBanner(step);
    },
    [currentStep, visitedSteps, showPhaseBanner]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => {
      // OSIRIS CRM — pricing configurator: skip Upgrade (idx 5) pour vitrine-premium
      const nextS = s === 4 && shouldSkipUpgrade(data.siteTypeId)
        ? 6
        : Math.min(s + 1, STEPS.length - 1);
      setVisitedSteps((v) => new Set([...v, nextS]));
      showPhaseBanner(nextS);
      return nextS;
    });
    triggerSave(data, leadId);
  }, [data, leadId, triggerSave, showPhaseBanner]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => {
      // OSIRIS CRM — pricing configurator: skip Upgrade en retour pour vitrine-premium
      const prevS = s === 6 && shouldSkipUpgrade(data.siteTypeId)
        ? 4
        : Math.max(s - 1, 0);
      return prevS;
    });
  }, [data.siteTypeId]);

  const validate = useCallback(async () => {
    if (!data.clientFirstName || !data.clientEmail) { toast.error("Prénom et email requis"); return; }
    const result = await saveToSupabase(data, leadId);
    if (result.leadId) {
      if (!leadId) setLeadId(result.leadId);
      if (data.discountPercent > 15) {
        toast.success("Devis en attente de validation admin (remise > 15%) ⏳");
      } else {
        toast.success("Devis validé ✓");
      }
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

  const progress     = ((currentStep + 1) / STEPS.length) * 100;
  const currentPhase = STEPS[currentStep].phase;

  // Phase icons / colors for the banner
  const PHASE_COLORS: Record<StepPhase, string> = {
    qual:  "text-blue-300",
    devis: "text-accent",
    envoi: "text-success",
  };

  return (
    <ConfiguratorContext.Provider
      value={{ data, update, currentStep, totalSteps: STEPS.length, navigate, next, prev, leadId, saving, quote, validate }}
    >
      <div className="flex flex-col min-h-screen">

        {/* Phase change banner — overlay 1 seconde */}
        <AnimatePresence>
          {phaseBanner && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-16 z-50 flex justify-center pointer-events-none"
            >
              <div className="flex items-center gap-3 bg-surface/90 border border-white/12 rounded-2xl px-5 py-3 shadow-xl backdrop-blur">
                <span className={`text-sm font-bold font-display ${PHASE_COLORS[currentPhase]}`}>
                  {phaseBanner}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast brouillon localStorage */}
        <AnimatePresence>
          {draftToast && (
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface border border-white/12 rounded-2xl px-4 py-3 shadow-xl"
            >
              <span className="text-xs text-textc">
                Brouillon récupéré — {draftToast.data.clientFirstName}
              </span>
              <button
                onClick={() => {
                  setData(draftToast.data);
                  if (draftToast.leadId) setLeadId(draftToast.leadId);
                  setDraftToast(null);
                  toast.success("Brouillon restauré ✓");
                }}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Restaurer
              </button>
              <button
                onClick={() => { localStorage.removeItem(DRAFT_KEY); setDraftToast(null); }}
                className="text-xs text-faint hover:text-textc"
              >
                Ignorer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-white/8">
          <div className="max-w-[1200px] mx-auto px-4 py-3">

            {/* Top row */}
            <div className="flex items-center gap-3 mb-2.5">
              <Link href="/dashboard" className="flex items-center gap-1 text-muted hover:text-textc transition-colors shrink-0">
                <ChevronLeft size={15} />
                <span className="text-[13px] font-bold font-display hidden sm:block">OSIRIS</span>
              </Link>
              <span className="hidden sm:block h-4 w-px bg-white/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="sm:hidden text-[13px] font-medium text-textc truncate">
                  {STEPS[currentStep].label}
                </p>
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

            {/* Mobile : barre de progression */}
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

            {/* Desktop : stepper horizontal (sm → lg) — scrollable */}
            <div className="hidden sm:flex lg:hidden items-center gap-1 overflow-x-auto scrollbar-none">
              {STEPS.map((step, i) => {
                const isCompleted = i < currentStep;
                const isCurrent   = i === currentStep;
                const isVisited   = visitedSteps.has(i);
                const canClick    = isVisited && i !== currentStep;
                const phaseChange = i > 0 && STEPS[i - 1].phase !== step.phase;

                return (
                  <div key={i} className="flex items-center gap-1 shrink-0">
                    {phaseChange && <div className="w-px h-4 bg-white/15 mx-0.5 shrink-0" />}
                    <button
                      disabled={!canClick}
                      onClick={() => canClick && navigate(i)}
                      className={[
                        "stepper-step",
                        isCompleted ? "done" : "",
                        isCurrent   ? "current" : "",
                        isVisited   ? "visited" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      <div className="stepper-dot" style={{ width: 22, height: 22, fontSize: "0.65rem" }}>
                        {isCompleted ? "✓" : step.short}
                      </div>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className="w-4 h-px bg-white/8 relative overflow-hidden mx-0.5 shrink-0">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-accent/50 rounded-full"
                          initial={false}
                          animate={{ width: isCompleted ? "100%" : "0%" }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* Layout principal — 3 colonnes sur lg */}
        <div className="flex-1 flex max-w-[1200px] mx-auto w-full">

          {/* Col 1 (lg only) : stepper vertical avec phases groupées */}
          <nav className="hidden lg:flex flex-col w-48 shrink-0 sticky top-[72px] self-start pt-6 pb-4 px-3 h-[calc(100vh-72px)] overflow-y-auto">
            {STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent   = i === currentStep;
              const isVisited   = visitedSteps.has(i);
              const canClick    = isVisited && i !== currentStep;
              const phaseChange = i > 0 && STEPS[i - 1].phase !== step.phase;

              return (
                <div key={i}>
                  {phaseChange && (
                    <div className="flex items-center gap-2 my-2.5">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-[9px] font-bold text-faint uppercase tracking-widest">
                        {PHASE_LABELS[step.phase]}
                      </span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>
                  )}
                  <button
                    disabled={!canClick}
                    onClick={() => canClick && navigate(i)}
                    className={[
                      "stepper-step w-full flex-row items-center justify-start gap-2.5 py-1.5 px-2 rounded-lg text-left",
                      isCompleted ? "done" : "",
                      isCurrent   ? "current" : "",
                      isVisited   ? "visited" : "",
                      isCurrent ? "bg-accent/10" : "hover:bg-white/[0.03]",
                      canClick ? "cursor-pointer" : "cursor-default",
                    ].filter(Boolean).join(" ")}
                    style={{ display: "flex", flexDirection: "row", opacity: isCurrent ? 1 : isVisited ? 0.75 : 0.35 }}
                  >
                    <div className="stepper-dot shrink-0" style={{ width: 24, height: 24, fontSize: "0.68rem" }}>
                      {isCompleted ? "✓" : step.short}
                    </div>
                    <span className={`text-[11px] truncate ${isCurrent ? "font-semibold text-textc" : "text-faint"}`}>
                      {step.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Col 2 : contenu du step */}
          <main className="flex-1 px-4 py-5 min-w-0">
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

          {/* Col 3 (lg only) : ConfiguratorSidebar */}
          <div className="hidden lg:block pt-6 pr-4">
            <ConfiguratorSidebar />
          </div>
        </div>

        {/* Footer navigation */}
        <footer className="sticky bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-white/8">
          <AnimatePresence mode="wait">
            {deleteConfirm ? (
              <motion.div key="confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-3">
                <AlertTriangle size={15} className="text-danger shrink-0" />
                <span className="text-sm text-textc flex-1">Supprimer ce lead ?</span>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Annuler</Button>
                <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete} icon={<Trash2 size={13} />}>Supprimer</Button>
              </motion.div>
            ) : (
              <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-[1200px] mx-auto px-4 py-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={prev} disabled={currentStep === 0} icon={<ChevronLeft size={15} />} className="min-h-[44px]">
                  <span className="hidden sm:inline">Précédent</span>
                </Button>

                {existingLeadId && (
                  <button onClick={() => setDeleteConfirm(true)}
                    className="min-h-[44px] px-2 rounded-[10px] text-faint hover:text-danger hover:bg-danger/8 transition-all" title="Supprimer ce lead">
                    <Trash2 size={15} />
                  </button>
                )}

                {/* Price pill sticky mobile (phase devis uniquement) */}
                {currentPhase === "devis" && quote.totalTTC > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-accent/10 border border-accent/25"
                  >
                    <Coins size={12} className="text-accent" />
                    <AnimatedPrice
                      value={quote.totalTTC}
                      suffix=" €"
                      className="text-xs font-bold text-accent"
                    />
                  </motion.div>
                )}

                <div className="flex-1" />

                <Button variant="secondary" size="sm" loading={saving} onClick={() => triggerSave(data, leadId)} icon={<Save size={13} />} className="min-h-[44px]">
                  <span className="hidden sm:inline">Sauvegarder</span>
                </Button>

                {currentStep < STEPS.length - 1 && (
                  <Button variant="primary" size="sm" onClick={next} iconRight={<ChevronRight size={15} />} className="min-h-[44px]">
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
