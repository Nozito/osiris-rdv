export const SITE_TYPES = [
  {
    id: "vitrine-simple",
    label: "Site vitrine simple",
    sublabel: "1–3 pages / landing page",
    price: 950,
  },
  {
    id: "vitrine-standard",
    label: "Site vitrine standard",
    sublabel: "4–7 pages + blog",
    price: 1900,
  },
  {
    id: "vitrine-premium",
    label: "Site vitrine premium",
    sublabel: "Design sur mesure complet",
    price: 3800,
  },
  {
    id: "ecommerce-starter",
    label: "E-commerce starter",
    sublabel: "Boutique jusqu'à 50 produits",
    price: 4500,
  },
  {
    id: "ecommerce-custom",
    label: "E-commerce custom",
    sublabel: "Boutique multi-catalogues",
    price: 8500,
  },
  {
    id: "app-web",
    label: "Application web",
    sublabel: "SaaS / outil métier sur mesure",
    price: 12000,
  },
] as const;

export const PAGE_OPTIONS = [
  {
    id: "blog",
    label: "Blog intégré",
    sublabel: "Articles + catégories + SEO",
    price: 350,
  },
  {
    id: "multilang",
    label: "Multi-langue",
    sublabel: "FR + EN (ou autre langue)",
    price: 600,
  },
  {
    id: "booking",
    label: "Réservation en ligne",
    sublabel: "Calendrier + confirmations mail",
    price: 800,
  },
  {
    id: "gallery",
    label: "Galerie média",
    sublabel: "Photos + vidéos organisées",
    price: 400,
  },
  {
    id: "chatbot",
    label: "Chatbot / FAQ",
    sublabel: "Widget IA ou FAQ dynamique",
    price: 500,
  },
  {
    id: "member-area",
    label: "Espace membre",
    sublabel: "Login + accès restreint",
    price: 900,
  },
  {
    id: "contact-forms",
    label: "Formulaires avancés",
    sublabel: "Multi-step + notifications",
    price: 300,
  },
  {
    id: "testimonials",
    label: "Avis & témoignages",
    sublabel: "Carousel + intégration Google",
    price: 200,
  },
] as const;

export const DESIGN_OPTIONS = [
  {
    id: "template",
    label: "Template personnalisé",
    sublabel: "Base premium adaptée à votre charte",
    price: 0,
  },
  {
    id: "semi-custom",
    label: "Semi-custom",
    sublabel: "Maquette Figma partielle",
    price: 600,
  },
  {
    id: "full-custom",
    label: "Design 100% sur mesure",
    sublabel: "Maquette Figma complète + UI Kit",
    price: 1800,
  },
] as const;

export const TECH_OPTIONS = [
  {
    id: "cms-headless",
    label: "CMS Headless",
    sublabel: "Sanity.io ou Contentful",
    price: 600,
    monthly: 0,
  },
  {
    id: "seo-pack",
    label: "Pack SEO avancé",
    sublabel: "Audit + structure + sitemap XML",
    price: 450,
    monthly: 0,
  },
  {
    id: "analytics",
    label: "Analytics dashboard",
    sublabel: "Plausible ou GA4 + rapport mensuel",
    price: 300,
    monthly: 0,
  },
  {
    id: "maintenance",
    label: "Maintenance mensuelle",
    sublabel: "Mises à jour + monitoring + support",
    price: 0,
    monthly: 150,
  },
  {
    id: "hosting",
    label: "Hébergement managé",
    sublabel: "VPS dédié + SSL + CDN Cloudflare",
    price: 0,
    monthly: 80,
  },
] as const;

export const BUDGET_RANGES = [
  { id: "under-2k", label: "Moins de 2 000 €" },
  { id: "2k-5k", label: "2 000 – 5 000 €" },
  { id: "5k-10k", label: "5 000 – 10 000 €" },
  { id: "10k-20k", label: "10 000 – 20 000 €" },
  { id: "over-20k", label: "Plus de 20 000 €" },
  { id: "flexible", label: "Budget flexible" },
] as const;

export function calcTotal(data: {
  siteTypeId: string;
  pageOptionIds: string[];
  designId: string;
  techOptionIds: string[];
}): { oneTime: number; monthly: number } {
  const site = SITE_TYPES.find((s) => s.id === data.siteTypeId);
  const design = DESIGN_OPTIONS.find((d) => d.id === data.designId);

  const pagesTotal = data.pageOptionIds.reduce((sum, id) => {
    const opt = PAGE_OPTIONS.find((p) => p.id === id);
    return sum + (opt?.price ?? 0);
  }, 0);

  const techOneTime = data.techOptionIds.reduce((sum, id) => {
    const opt = TECH_OPTIONS.find((t) => t.id === id);
    return sum + (opt?.price ?? 0);
  }, 0);

  const techMonthly = data.techOptionIds.reduce((sum, id) => {
    const opt = TECH_OPTIONS.find((t) => t.id === id);
    return sum + (opt?.monthly ?? 0);
  }, 0);

  return {
    oneTime:
      (site?.price ?? 0) +
      (design?.price ?? 0) +
      pagesTotal +
      techOneTime,
    monthly: techMonthly,
  };
}

export function getRecommendation(data: {
  siteTypeId: string;
  budgetRangeId: string;
}): {
  siteTypeId: string;
  designId: string;
  pageOptionIds: string[];
  techOptionIds: string[];
  reasoning: string;
} {
  const isEcommerce = data.siteTypeId.startsWith("ecommerce");
  const isApp = data.siteTypeId === "app-web";
  const isPremium = data.siteTypeId === "vitrine-premium";
  const isHighBudget = ["5k-10k", "10k-20k", "over-20k", "flexible"].includes(
    data.budgetRangeId
  );
  const isMidBudget = ["2k-5k", "5k-10k"].includes(data.budgetRangeId);

  let designId = "template";
  if (isApp || isPremium) designId = "full-custom";
  else if (isEcommerce || isHighBudget) designId = "semi-custom";
  else if (isMidBudget) designId = "semi-custom";

  const pageOptionIds: string[] = [];
  if (isEcommerce || isApp) pageOptionIds.push("member-area");
  if (isHighBudget || isEcommerce || isApp) pageOptionIds.push("blog");
  if (!data.siteTypeId.includes("simple")) pageOptionIds.push("testimonials");

  const techOptionIds: string[] = ["seo-pack"];
  if (isEcommerce || isApp) {
    techOptionIds.push("cms-headless", "analytics");
  } else if (isHighBudget) {
    techOptionIds.push("analytics");
  }
  if (isHighBudget || isApp) {
    techOptionIds.push("maintenance", "hosting");
  }

  const reasoning = isApp
    ? "Application complexe : design premium, CMS headless et maintenance recommandés pour garantir évolutivité et performance."
    : isEcommerce
    ? "E-commerce : espace membre, SEO avancé et analytics sont indispensables pour maximiser les conversions."
    : isPremium || isHighBudget
    ? "Budget et ambition élevés : design semi-custom, blog et analytics pour un impact maximum et un référencement solide."
    : "Configuration optimisée pour votre type de projet — le meilleur équilibre qualité / budget.";

  return {
    siteTypeId: data.siteTypeId,
    designId,
    pageOptionIds,
    techOptionIds,
    reasoning,
  };
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
