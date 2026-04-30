// OSIRIS CRM — pricing configurator

// ─── OFFRES DE BASE ───────────────────────────────────────────────
export const SITE_TYPES = [
  {
    id:       'vitrine-simple',
    label:    'Starter',
    sublabel: 'Landing page ou site 1–3 pages',
    price:    950,
    badge:    null as string | null,
    features: ["Jusqu'à 3 pages", "Responsive mobile/tablette", "Formulaire de contact", "Hébergement guidé", "Mise en ligne incluse"],
    color:    'blue' as const,
  },
  {
    id:       'vitrine-standard',
    label:    'Pro',
    sublabel: '4–7 pages + animations modernes',
    price:    1650,
    badge:    'Populaire' as string | null,
    features: ["Jusqu'à 7 pages", "Animations scroll modernes", "Blog/CMS inclus", "SEO de base inclus", "Révisions illimitées 14j"],
    color:    'blue' as const,
  },
  {
    id:       'vitrine-premium',
    label:    'Elite',
    sublabel: 'Site sur mesure 8–15 pages',
    price:    2950,
    badge:    'Sur mesure' as string | null,
    features: ["Jusqu'à 15 pages", "Design UI 100% custom", "Animations avancées incluses", "SEO technique avancé inclus", "Support prioritaire 30j"],
    color:    'purple' as const,
  },
];

// ─── UPGRADES BUSINESS (visible si vitrine-simple seulement) ──────
export const UPGRADE_BUSINESS_OPTIONS = [
  { id: 'up-animations',  label: 'Animations scroll & hover',    sublabel: "Effets d'entrée, parallaxe légère",      price: 150 },
  { id: 'up-seo-base',    label: 'Socle SEO propre',             sublabel: 'Balises, metas, sitemap, schema.org',    price: 200 },
  { id: 'up-calls',       label: 'Suivi projet ×3 appels',       sublabel: "Points d'avancement en visio",           price: 120 },
  { id: 'up-revisions-2', label: '+2 rounds de révisions',       sublabel: 'En plus du round standard inclus',       price: 100 },
  { id: 'up-support-30',  label: 'Support étendu 30 jours',      sublabel: 'Après mise en ligne',                    price: 100 },
];

// ─── UPGRADES EMPIRE (visible si vitrine-simple ou vitrine-standard)
export const UPGRADE_EMPIRE_OPTIONS = [
  { id: 'up-anim-adv',     label: 'Animations avancées GSAP',             sublabel: 'Timelines, scroll-triggered, morphing',          price: 300 },
  { id: 'up-seo-adv',      label: 'SEO avancé + audit complet',           sublabel: 'Audit technique + netlinking strategy',          price: 400 },
  { id: 'up-revisions-ul', label: "Révisions illimitées jusqu'à livraison", sublabel: 'Sans restriction jusqu\'à validation finale',  price: 250 },
  { id: 'up-support-60',   label: 'Support étendu 60 jours',              sublabel: 'Maintenance réactive après livraison',           price: 180 },
];

// ─── CATÉGORIES D'OPTIONS ─────────────────────────────────────────
export const OPTION_CATEGORIES = [
  { id: 'feature', label: 'Fonctionnalités',     color: 'blue'    },
  { id: 'visual',  label: 'Expérience visuelle',  color: 'purple'  },
  { id: 'lang',    label: 'Langue & conformité',  color: 'emerald' },
] as const;

// ─── OPTIONS UNIVERSELLES (tous les niveaux) ──────────────────────
export const UNIVERSAL_OPTIONS = [
  // Fonctionnalités métier
  { id: 'blog',        label: 'Blog / CMS',                 sublabel: 'Articles, catégories, gestion éditoriale',        price: 200, category: 'feature' as const, icon: 'FileText'     },
  { id: 'booking',     label: 'Réservation en ligne',       sublabel: 'Calendrier, créneaux, confirmation mail',          price: 350, category: 'feature' as const, icon: 'Calendar'     },
  { id: 'member-area', label: 'Espace client / membre',     sublabel: 'Login, tableau de bord, accès restreint',          price: 500, category: 'feature' as const, icon: 'Lock'         },
  { id: 'form-multi',  label: 'Formulaire multi-étapes',    sublabel: 'Logique conditionnelle + notifications email',     price: 180, category: 'feature' as const, icon: 'ClipboardList'},
  { id: 'calculator',  label: 'Calculateur interactif',     sublabel: 'Simulateur devis, configurateur client',           price: 250, category: 'feature' as const, icon: 'Calculator'   },
  { id: 'exit-popup',  label: "Pop-up intention de sortie", sublabel: "Capture lead avant abandon de page",              price: 120, category: 'feature' as const, icon: 'MousePointer' },
  // Expérience visuelle
  { id: 'gsap',        label: 'Transitions de pages fluides', sublabel: 'Animations GSAP entre pages, effet cinéma',      price: 250, category: 'visual'  as const, icon: 'Zap'          },
  { id: 'scroll-horiz',label: 'Section scroll horizontal',  sublabel: 'Galerie ou timeline en scroll horizontal',         price: 300, category: 'visual'  as const, icon: 'ArrowRight'   },
  { id: 'hero-3d',     label: 'Hero 3D Three.js',           sublabel: "Scène 3D interactive en page d'accueil",           price: 500, category: 'visual'  as const, icon: 'Box'          },
  // Langue & conformité
  { id: 'multilang',   label: 'Multi-langue',               sublabel: '1 langue gratuite, +25€/langue supp.',            price: 0,   category: 'lang'    as const, icon: 'Globe', pricePerUnit: 25 },
  { id: 'rgpd',        label: 'Cookie banner RGPD',         sublabel: 'Consentement conforme CNIL + politique confidentialité', price: 80, category: 'lang' as const, icon: 'Shield' },
] as const;

// ─── DÉLAIS ───────────────────────────────────────────────────────
export const DEADLINES = [
  { id: 'standard', label: 'Standard', sublabel: '3 à 7 semaines',   rate: 0    },
  { id: 'express',  label: 'Express',  sublabel: '1 à 2 semaines',   rate: 0.20 },
  { id: 'urgent',   label: 'Urgent',   sublabel: 'Moins de 7 jours', rate: 0.45 },
];

// Pages supplémentaires : tarif fixe
export const EXTRA_PAGE_PRICE = 100;

// Maintenance mensuelle
export const MAINTENANCE_MONTHLY_PRICE = 39;
export const MAINTENANCE_LABEL    = "Maintenance & Mises à jour";
export const MAINTENANCE_SUBLABEL = "Suivi mensuel plafonné à 1h/mois — mises à jour CMS, sécurité, monitoring";

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

  const tva      = 0;
  const totalTTC = totalHT_apres_remise;

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
