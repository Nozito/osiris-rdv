"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Save, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PriceSidebar, MobilePriceBar } from "@/components/PriceSidebar";
import { Step1Client } from "./Step1Client";
import { Step2Projet } from "./Step2Projet";
import { Step3Pages } from "./Step3Pages";
import { Step4Design } from "./Step4Design";
import { Step5Technique } from "./Step5Technique";
import { Step6Budget } from "./Step6Budget";
import { Step7Recommandation } from "./Step7Recommandation";
import { Step8Recap } from "./Step8Recap";
import { createClient } from "@/lib/supabase/client";
import { calcTotal } from "@/lib/pricing";
import { toast } from "@/components/ui/Toast";
import type { WizardData } from "@/types";
import { WIZARD_INITIAL_DATA } from "@/types";

const STEPS = [
  { label: "Client",    short: "1" },
  { label: "Projet",    short: "2" },
  { label: "Pages",     short: "3" },
  { label: "Design",    short: "4" },
  { label: "Technique", short: "5" },
  { label: "Budget",    short: "6" },
  { label: "Offre",     short: "7" },
  { label: "Récap",     short: "8" },
];

interface WizardContextValue {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  currentStep: number;
  totalSteps: number;
  next: () => void;
  prev: () => void;
  leadId: string | null;
  saving: boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used inside WizardShell");
  return ctx;
}

interface WizardShellProps {
  initialData?: Partial<WizardData>;
  existingLeadId?: string;
  initialStatus?: string;
}

export function WizardShell({ initialData, existingLeadId, initialStatus }: WizardShellProps) {
  const [data, setData] = useState<WizardData>({ ...WIZARD_INITIAL_DATA, ...initialData });
  const [currentStep, setCurrentStep] = useState(0);
  const [leadId, setLeadId] = useState<string | null>(existingLeadId ?? null);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((patch: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const upsertClient = useCallback(
    async (d: WizardData, userId: string): Promise<string | null> => {
      if (!d.clientName && !d.clientEmail) return d.clientId;
      const clientPayload = {
        commercial_id: userId,
        name: d.clientName,
        email: d.clientEmail,
        company: d.clientCompany,
        phone: d.clientPhone,
      };
      if (d.clientId) {
        await supabase.from("clients").update(clientPayload).eq("id", d.clientId);
        return d.clientId;
      } else {
        const { data: inserted } = await supabase
          .from("clients")
          .insert(clientPayload)
          .select("id")
          .single();
        return inserted?.id ?? null;
      }
    },
    [supabase]
  );

  const saveToSupabase = useCallback(
    async (d: WizardData, id: string | null): Promise<{ leadId: string | null; clientId: string | null }> => {
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { leadId: null, clientId: null };

        const resolvedClientId = await upsertClient(d, user.id);
        const { oneTime, monthly } = calcTotal({
          siteTypeId: d.projectType,
          pageOptionIds: d.selectedPages,
          designId: d.designStyle,
          techOptionIds: d.techOptions,
        });

        // Champs de configuration — on n'écrase JAMAIS le statut en autosave
        const configPayload = {
          commercial_id: user.id,
          client_id: resolvedClientId,
          client_name: d.clientName,
          client_email: d.clientEmail,
          client_company: d.clientCompany,
          client_phone: d.clientPhone,
          project_type: d.projectType,
          project_description: d.projectDescription,
          project_deadline: d.projectDeadline || null,
          selected_pages: d.selectedPages,
          design_style: d.designStyle,
          brand_assets: d.brandAssets,
          tech_options: d.techOptions,
          budget_range: d.budgetRange,
          total_one_time: oneTime,
          total_monthly: monthly,
          adjusted_price: d.adjustedPrice,
          notes: d.notes,
        };

        if (id) {
          // UPDATE — on ne touche pas au statut existant
          const { error } = await supabase.from("leads").update(configPayload).eq("id", id);
          if (error) toast.error("Erreur lors de la sauvegarde");
          return { leadId: id, clientId: resolvedClientId };
        } else {
          // INSERT — nouveau lead, démarre en "draft"
          const { data: inserted, error } = await supabase
            .from("leads")
            .insert({ ...configPayload, status: "draft" })
            .select("id")
            .single();
          if (error) toast.error("Erreur lors de la création");
          else toast.success("Lead créé avec succès ✓");
          return { leadId: inserted?.id ?? null, clientId: resolvedClientId };
        }
      } finally {
        setSaving(false);
      }
    },
    [supabase, upsertClient]
  );

  const triggerSave = useCallback(
    (d: WizardData, id: string | null) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const { leadId: newLeadId, clientId: newClientId } = await saveToSupabase(d, id);
        if (newLeadId && !id) setLeadId(newLeadId);
        if (newClientId && !d.clientId) update({ clientId: newClientId });
      }, 800);
    },
    [saveToSupabase, update]
  );

  const next = useCallback(() => {
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    triggerSave(data, leadId);
  }, [data, leadId, triggerSave]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleDelete = useCallback(async () => {
    if (!leadId) { router.push("/dashboard"); return; }
    setDeleting(true);
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) { toast.error("Erreur lors de la suppression"); setDeleting(false); return; }
    toast.success("Lead supprimé");
    router.push("/dashboard");
  }, [leadId, supabase, router]);

  const stepComponents = [
    <Step1Client key="1" />,
    <Step2Projet key="2" />,
    <Step3Pages key="3" />,
    <Step4Design key="4" />,
    <Step5Technique key="5" />,
    <Step6Budget key="6" />,
    <Step7Recommandation key="7" />,
    <Step8Recap key="8" leadId={leadId} initialStatus={(initialStatus ?? "draft") as import("@/types").LeadStatus} />,
  ];

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <WizardContext.Provider
      value={{ data, update, currentStep, totalSteps: STEPS.length, next, prev, leadId, saving }}
    >
      <div className="flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-white/8">
          <div className="max-w-6xl mx-auto px-4 py-3">

            {/* Top row: brand + contexte + statut save */}
            <div className="flex items-center gap-3 mb-2.5">
              {/* Retour dashboard */}
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-muted hover:text-textc transition-colors shrink-0"
              >
                <ChevronLeft size={15} />
                <span className="text-[13px] font-bold font-display hidden sm:block">OSIRIS</span>
              </Link>

              {/* Séparateur vertical — desktop seulement */}
              <span className="hidden sm:block h-4 w-px bg-white/10 shrink-0" />

              {/* Contexte étape */}
              <div className="flex-1 min-w-0">
                {/* Mobile : nom de l'étape courante */}
                <p className="sm:hidden text-[13px] font-medium text-textc truncate">
                  {STEPS[currentStep].label}
                </p>
                {/* Desktop : sous-titre statique */}
                <p className="hidden sm:block text-[12px] text-muted truncate">
                  {existingLeadId ? "Modifier le lead" : "Nouveau RDV"}
                </p>
              </div>

              {/* Statut save + compteur */}
              <div className="flex items-center gap-2 shrink-0">
                {saving && (
                  <span className="text-xs text-faint animate-pulse">Sauvegarde…</span>
                )}
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

            {/* Desktop : stepper avec pastilles */}
            <div className="hidden sm:flex items-center gap-0.5">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-0.5 flex-1 min-w-0">
                  <div
                    className={`
                      shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                      text-[10px] font-bold transition-all duration-300
                      ${i < currentStep
                        ? "bg-accent text-white shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                        : i === currentStep
                        ? "bg-accent/20 text-accent border border-accent/50"
                        : "bg-surface2 text-faint border border-white/8"
                      }
                    `}
                  >
                    {i < currentStep ? "✓" : step.short}
                  </div>
                  <span
                    className={`
                      hidden lg:block text-[11px] truncate transition-colors mr-0.5
                      ${i === currentStep ? "text-textc font-medium" : "text-faint"}
                    `}
                  >
                    {step.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <motion.div
                      className="flex-1 h-px mx-0.5 bg-white/8 relative overflow-hidden"
                      style={{ minWidth: 4 }}
                    >
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-accent/50 rounded-full"
                        initial={false}
                        animate={{ width: i < currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.35 }}
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 flex gap-6">
          <div className="flex-1 min-w-0">
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
          </div>
          <PriceSidebar data={data} />
        </main>

        {/* Mobile price bar — au-dessus du footer */}
        <MobilePriceBar data={data} />

        {/* Footer navigation */}
        <footer className="sticky bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-white/8">
          <AnimatePresence mode="wait">
            {deleteConfirm ? (
              /* Confirmation suppression */
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3"
              >
                <AlertTriangle size={15} className="text-danger shrink-0" />
                <span className="text-sm text-textc flex-1">
                  Supprimer ce lead ?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleting}
                  onClick={handleDelete}
                  icon={<Trash2 size={13} />}
                >
                  Supprimer
                </Button>
              </motion.div>
            ) : (
              /* Navigation normale */
              <motion.div
                key="nav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prev}
                  disabled={currentStep === 0}
                  icon={<ChevronLeft size={15} />}
                >
                  <span className="hidden sm:inline">Précédent</span>
                </Button>

                {/* Supprimer — uniquement si le lead existe en DB */}
                {existingLeadId && (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="p-2 rounded-[10px] text-faint hover:text-danger hover:bg-danger/8 transition-all"
                    title="Supprimer ce lead"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <div className="flex-1" />

                <Button
                  variant="secondary"
                  size="sm"
                  loading={saving}
                  onClick={() => triggerSave(data, leadId)}
                  icon={<Save size={13} />}
                >
                  <span className="hidden sm:inline">Sauvegarder</span>
                </Button>

                {currentStep < STEPS.length - 1 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={next}
                    iconRight={<ChevronRight size={15} />}
                  >
                    Suivant
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </footer>
      </div>
    </WizardContext.Provider>
  );
}
