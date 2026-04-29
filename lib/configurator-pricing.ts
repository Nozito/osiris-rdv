// OSIRIS CRM — pricing configurator

// ─── OFFRES DE BASE ───────────────────────────────────────────────
export const SITE_TYPES = [
  {
    id:       'vitrine-simple',
    label:    'Site vitrine simple',
    sublabel: '1–3 pages / landing',
    price:    950,
    features: ["1 à 3 pages", "Responsive mobile", "Formulaire de contact de base"],
  },
  {
    id:       'vitrine-standard',
    label:    'Site vitrine standard',
    sublabel: '3–5 pages',
    price:    1650,
    features: ["3 à 5 pages", "Animations utiles incluses", "Socle SEO + sitemap"],
  },
  {
    id:       'vitrine-premium',
    label:    'Site vitrine premium',
    sublabel: '6–10 pages',
    price:    2950,
    features: ["6 à 10 pages", "Design sur-mesure avancé", "SEO avancé + support 60 j"],
  },
];

// ─── UPGRADES BUSINESS (visible si vitrine-simple seulement) ──────
export const UPGRADE_BUSINESS_OPTIONS = [
  { id: 'up-anim-useful',  label: 'Animations utiles',                      price: 200 },
  { id: 'up-seo-clean',    label: 'Socle SEO propre',                       price: 250 },
  { id: 'up-calls',        label: 'Calls réguliers durant la création',     price: 150 },
  { id: 'up-revisions-2',  label: '+2 rounds de révisions supplémentaires', price: 100 },
  { id: 'up-support-30',   label: 'Support étendu à 30 jours',              price: 100 },
];

// ─── UPGRADES EMPIRE (visible si vitrine-simple ou vitrine-standard)
export const UPGRADE_EMPIRE_OPTIONS = [
  { id: 'up-anim-adv',     label: 'Animations avancées',                         price: 350 },
  { id: 'up-seo-adv',      label: 'SEO avancé',                                  price: 450 },
  { id: 'up-revisions-ul', label: "Révisions illimitées jusqu'à mise en ligne",  price: 300 },
  { id: 'up-support-60',   label: 'Support étendu à 60 jours',                   price: 200 },
];

// ─── OPTIONS UNIVERSELLES (tous les niveaux) ──────────────────────
export const UNIVERSAL_OPTIONS = [
  { id: 'blog',         label: 'Blog / CMS',                          sublabel: 'Articles, catégories, gestion éditoriale',    price: 200 },
  { id: 'multilang',    label: 'Multi-langue',                        sublabel: '1 langue gratuite au choix, +25 €/langue supplémentaire', price: 0, pricePerUnit: 25 },
  { id: 'form-multi',   label: 'Formulaire multi-étapes',             sublabel: 'Logique conditionnelle + notifications',       price: 180 },
  { id: 'calculator',   label: 'Calculateur interactif',              sublabel: 'Outil de devis ou configurateur client',      price: 250 },
  { id: 'gsap',         label: 'Transitions de pages GSAP',           sublabel: 'Animations fluides entre les pages',          price: 250 },
  { id: 'scroll-horiz', label: 'Scroll horizontal',                   sublabel: 'Section ou page en scroll horizontal',       price: 300 },
  { id: 'hero-3d',      label: 'Hero 3D Three.js',                    sublabel: "Scène interactive en page d'accueil",         price: 500 },
  { id: 'exit-popup',   label: "Pop-up intention de sortie",          sublabel: 'Capture lead avant quitter la page',         price: 120 },
] as const;

// ─── DÉLAIS ───────────────────────────────────────────────────────
export const DEADLINES = [
  { id: 'standard', label: 'Standard', sublabel: '3 à 7 semaines',   rate: 0    },
  { id: 'express',  label: 'Express',  sublabel: '1 à 2 semaines',   rate: 0.20 },
  { id: 'urgent',   label: 'Urgent',   sublabel: 'Moins de 7 jours', rate: 0.45 },
];

// Pages supplémentaires : tarif fixe
export const EXTRA_PAGE_PRICE = 180;

// Maintenance mensuelle
export const MAINTENANCE_MONTHLY_PRICE = 39;
export const MAINTENANCE_LABEL    = "Maintenance & Mises à jour";
export const MAINTENANCE_SUBLABEL = "Suivi mensuel plafonné à 1h/mois";

// Calcul complet du devis — TOUJOURS utiliser cette fonction
export function calcQuote(params: {
  siteTypeId:        string;
  extraPages:        number;
  selectedUpgrades:  string[];
  selectedUniversal: string[];
  deadlineId:        string;
  discountPercent?:  number;
  multilangCount?:   number;
}) {
  const basePrice       = SITE_TYPES.find(s => s.id === params.siteTypeId)?.price ?? 0;
  const extraPagesPrice = params.extraPages * EXTRA_PAGE_PRICE;

  const allUpgradeOpts  = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];
  const upgradesPrice   = params.selectedUpgrades.reduce((acc, id) => {
    return acc + (allUpgradeOpts.find(o => o.id === id)?.price ?? 0);
  }, 0);

  // multilang : inclus si dans selectedUniversal, prix = multilangCount × 25€
  const multilangPrice  = params.selectedUniversal.includes('multilang')
    ? Math.max(0, params.multilangCount ?? 0) * 25
    : 0;

  const universalPrice  = params.selectedUniversal.reduce((acc, id) => {
    if (id === 'multilang') return acc + multilangPrice;
    const opt = UNIVERSAL_OPTIONS.find(o => o.id === id);
    return acc + ((opt && 'price' in opt ? (opt as { price: number }).price : 0));
  }, 0);

  const subtotalHT        = basePrice + extraPagesPrice + upgradesPrice + universalPrice;
  const deadlineRate      = DEADLINES.find(d => d.id === params.deadlineId)?.rate ?? 0;
  const deadlineSurcharge = Math.round(subtotalHT * deadlineRate);
  const totalHT           = subtotalHT + deadlineSurcharge;

  const discountPercent      = Math.max(0, Math.min(100, params.discountPercent ?? 0));
  const discountAmount       = Math.round(totalHT * (discountPercent / 100));
  const totalHT_apres_remise = totalHT - discountAmount;

  const tva      = Math.round(totalHT_apres_remise * 0.20);
  const totalTTC = totalHT_apres_remise + tva;

  return {
    basePrice,
    extraPagesPrice,
    upgradesPrice,
    universalPrice,
    multilangPrice,
    subtotalHT,
    deadlineSurcharge,
    totalHT,
    discountPercent,
    discountAmount,
    totalHT_apres_remise,
    tva,
    totalTTC,
  };
}
