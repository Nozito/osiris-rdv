export type LeadStatus = "draft" | "sent" | "signed" | "lost" | "pending_approval";
export type UserRole = "admin" | "commercial";

// OSIRIS CRM — pricing configurator
export interface LeadQuote {
  // ── Pré-qualification (stocké pour le PDF et l'envoi)
  clientCompany:     string;
  clientIndustry:    string;
  clientCompanySize: string;
  clientCurrentSite: string;
  clientSiteUrl:     string;
  clientObjectives:  string[];
  clientNeeds:       string;
  clientBudgetRange: string;
  clientOwnEstimate: number | null;
  clientBudgetNotes: string;

  // ── Configurateur
  siteTypeId:        string;
  siteTypeLabel:     string;
  extraPages:        number;
  selectedUpgrades:  string[];
  selectedUniversal: string[];
  wantsUnlimited:    boolean;
  deadlineId:        string;
  deadlineLabel:     string;

  // ── Prix calculés via calcQuote() — jamais hardcodés
  basePrice:         number;
  extraPagesPrice:   number;
  upgradesPrice:     number;
  universalPrice:    number;
  subtotalHT:        number;
  deadlineSurcharge: number;
  totalHT:           number;
  // Remise
  discountPercent:   number;
  discountAmount:    number;
  totalHT_apres_remise: number;
  tva:               number;
  totalTTC:          number;
}

// OSIRIS CRM — pricing configurator: internal state for the full wizard (pre-qual + configurator + envoi)
export interface ConfiguratorData {
  // ── Contact client (collecté en pré-qual step 1)
  clientId:          string | null;
  clientFirstName:   string;
  clientLastName:    string;
  clientEmail:       string;
  clientPhone:       string;
  clientCompany:     string;

  // ── Pré-qualification step 1 — Profil
  clientIndustry:    string;
  clientCompanySize: string;
  clientCurrentSite: string;   // 'yes-recent' | 'yes-old' | 'no' | 'refonte'
  clientSiteUrl:     string;   // URL du site actuel si existant

  // ── Pré-qualification step 2 — Besoins
  clientObjectives:  string[]; // multi-select
  clientNeeds:       string;   // texte libre

  // ── Pré-qualification step 3 — Budget client
  clientBudgetRange: string;
  clientOwnEstimate: number | null;
  clientBudgetNotes: string;

  // ── Remise / Négociation
  discountPercent:    number;
  discountReason:     string;
  discountConditions: string;

  // ── Date RDV
  rdvDate:  string;
  rdvNotes: string;

  // ── Configurateur (steps 4–9, INCHANGÉS)
  siteTypeId:        string;
  extraPages:        number;
  selectedUpgrades:  string[];
  selectedUniversal: string[];
  wantsUnlimited:    boolean;
  deadlineId:        string;
}

export const CONFIGURATOR_INITIAL_DATA: ConfiguratorData = {
  clientId:           null,
  clientFirstName:    "",
  clientLastName:     "",
  clientEmail:        "",
  clientPhone:        "",
  clientCompany:      "",
  clientIndustry:     "",
  clientCompanySize:  "",
  clientCurrentSite:  "",
  clientSiteUrl:      "",
  clientObjectives:   [],
  clientNeeds:        "",
  clientBudgetRange:  "",
  clientOwnEstimate:  null,
  clientBudgetNotes:  "",
  discountPercent:    0,
  discountReason:     "",
  discountConditions: "",
  rdvDate:            "",
  rdvNotes:           "",
  siteTypeId:         "",
  extraPages:         0,
  selectedUpgrades:   [],
  selectedUniversal:  [],
  wantsUnlimited:     false,
  deadlineId:         "standard",
};

/** Utilisateur de l'application (table `profiles`) */
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

/** Client / prospect (table `clients`) */
export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  commercial_id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
}

/** Devis / lead (table `leads`) */
export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  commercial_id: string;
  status: LeadStatus;

  // Lien client normalisé
  client_id: string | null;

  // Champs dénormalisés (conservés pour rétro-compatibilité + PDF)
  client_name: string;
  client_email: string;
  client_company: string;
  client_phone: string;

  project_type: string;
  project_description: string;
  project_deadline: string | null;

  selected_pages: string[];
  design_style: string;
  brand_assets: boolean;
  tech_options: string[];

  budget_range: string;

  total_one_time: number;
  total_monthly: number;
  adjusted_price: number | null;

  notes: string;
  recommendation: RecommendedOffer | null;

  // OSIRIS CRM — pricing configurator
  quote_data: LeadQuote | null;

  // Remise / Négociation
  discount_percent:     number | null;
  discount_reason:      string | null;
  discount_conditions:  string | null;
  discount_validated_at: string | null;
  discount_validated_by: string | null;

  // Date RDV
  rdv_date:  string | null;
  rdv_notes: string | null;
}

export interface WizardData {
  // Référence client (null = nouveau client à créer)
  clientId: string | null;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientPhone: string;

  projectType: string;
  projectDescription: string;
  projectDeadline: string;

  selectedPages: string[];

  designStyle: string;
  brandAssets: boolean;

  techOptions: string[];

  budgetRange: string;

  notes: string;
  adjustedPrice: number | null;
}

export interface RecommendedOffer {
  siteTypeId: string;
  designId: string;
  pageOptionIds: string[];
  techOptionIds: string[];
  reasoning: string;
}

export const WIZARD_INITIAL_DATA: WizardData = {
  clientId: null,
  clientName: "",
  clientEmail: "",
  clientCompany: "",
  clientPhone: "",
  projectType: "",
  projectDescription: "",
  projectDeadline: "",
  selectedPages: [],
  designStyle: "template",
  brandAssets: false,
  techOptions: [],
  budgetRange: "",
  notes: "",
  adjustedPrice: null,
};
