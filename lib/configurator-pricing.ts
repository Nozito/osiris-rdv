// OSIRIS CRM — pricing configurator

// ─── OFFRES DE BASE ───────────────────────────────────────────────
export const SITE_TYPES = [
  { id: 'vitrine-simple',   label: 'Site vitrine simple',   sublabel: '1–3 pages / landing', price: 950  },
  { id: 'vitrine-standard', label: 'Site vitrine standard', sublabel: '3–5 pages',            price: 1650 },
  { id: 'vitrine-premium',  label: 'Site vitrine premium',  sublabel: '6–10 pages',           price: 2950 },
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
  { id: 'form',      label: 'Formulaire de contact avancé',      price: 100 },
  { id: 'blog',      label: 'Blog / actualités',                 price: 200 },
  { id: 'gallery',   label: 'Galerie photos/vidéos',             price: 150 },
  { id: 'booking',   label: 'Système de réservation en ligne',   price: 350 },
  { id: 'account',   label: 'Espace client / connexion',         price: 500 },
  { id: 'multilang', label: 'Multi-langue (par langue ajoutée)', price: 300 },
  { id: 'whatsapp',  label: 'Widget WhatsApp / Chat',            price: 80  },
  { id: 'maps',      label: 'Intégration Google Maps + avis',    price: 100 },
  { id: 'chatbot',   label: 'Chatbot IA',                        price: 400 },
];

// ─── DÉLAIS ───────────────────────────────────────────────────────
export const DEADLINES = [
  { id: 'standard', label: 'Standard', sublabel: '3 à 7 semaines',   rate: 0    },
  { id: 'express',  label: 'Express',  sublabel: '1 à 2 semaines',   rate: 0.20 },
  { id: 'urgent',   label: 'Urgent',   sublabel: 'Moins de 7 jours', rate: 0.45 },
];

// Pages supplémentaires : paliers dégressifs
// Pages 1–3 → 100€/page | Pages 4–9 → 80€/page | Pages 10+ → 60€/page
export function calcExtraPages(n: number): number {
  let total = 0;
  const tiers = [
    { up: 3,        price: 100 },
    { up: 9,        price: 80  },
    { up: Infinity, price: 60  },
  ];
  let remaining = n, pagesSeen = 0;
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const inTier = Math.min(remaining, tier.up - pagesSeen);
    total += inTier * tier.price;
    remaining -= inTier;
    pagesSeen += inTier;
  }
  return total;
}

// Calcul complet du devis — TOUJOURS utiliser cette fonction
export function calcQuote(params: {
  siteTypeId:        string;
  extraPages:        number;
  selectedUpgrades:  string[];
  selectedUniversal: string[];
  deadlineId:        string;
  discountPercent?:  number;
}) {
  const basePrice       = SITE_TYPES.find(s => s.id === params.siteTypeId)?.price ?? 0;
  const extraPagesPrice = calcExtraPages(params.extraPages);

  const allUpgradeOpts  = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];
  const upgradesPrice   = params.selectedUpgrades.reduce((acc, id) => {
    return acc + (allUpgradeOpts.find(o => o.id === id)?.price ?? 0);
  }, 0);

  const universalPrice  = params.selectedUniversal.reduce((acc, id) => {
    return acc + (UNIVERSAL_OPTIONS.find(o => o.id === id)?.price ?? 0);
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
