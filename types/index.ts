export type LeadStatus = "draft" | "sent" | "signed" | "lost";
export type UserRole = "admin" | "commercial";

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
