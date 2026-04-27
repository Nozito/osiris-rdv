import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Check, ArrowRight, HelpCircle, ChevronLeft, ChevronRight, Rocket, Zap, Crown, Calculator, Sparkles, FileText, Clock, ClipboardList, Target, Layers } from 'lucide-react';
import Link from 'next/link';
import { Footer } from './Footer';
import { SEOHead } from './SEOHead';
import { useLanguage } from '../context/LanguageContext';
import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATEUR DE DEVIS INTERACTIF
// ─────────────────────────────────────────────────────────────────────────────

const SECTORS = [
    { id: 'restaurant', label: 'Restaurant / Food',  emoji: '🍽️' },
    { id: 'commerce',   label: 'Commerce / Retail',  emoji: '🛍️' },
    { id: 'services',   label: 'Services / Conseil', emoji: '💼' },
    { id: 'sante',      label: 'Santé / Bien-être',  emoji: '🏥' },
    { id: 'immobilier', label: 'Immobilier',          emoji: '🏠' },
    { id: 'creatif',    label: 'Créatif / Portfolio', emoji: '🎨' },
    { id: 'tech',       label: 'Tech / Startup',     emoji: '🚀' },
    { id: 'autre',      label: 'Autre secteur',      emoji: '✨' },
];

const PROJECT_GOALS = [
    { id: 'showcase', label: 'Présenter mon activité' },
    { id: 'leads',    label: 'Générer des prospects' },
    { id: 'sell',     label: 'Vendre en ligne' },
    { id: 'content',  label: 'Partager du contenu' },
    { id: 'other',    label: 'Autre objectif' },
];

const SITE_TYPES = [
    { id: 'vitrine-simple',   label: 'Site vitrine simple',    sublabel: '1–3 pages / landing', price: 950  },
    { id: 'vitrine-standard', label: 'Site vitrine standard',  sublabel: '3–5 pages',           price: 1650 },
    { id: 'vitrine-premium',  label: 'Site vitrine premium',   sublabel: '6–10 pages',          price: 2950 },
];

const UPGRADE_BUSINESS_OPTIONS = [
    { id: 'up-anim-useful',  label: 'Animations utiles',                        price: 200 },
    { id: 'up-seo-clean',    label: 'Socle SEO propre',                         price: 250 },
    { id: 'up-calls',        label: 'Calls réguliers durant la création',       price: 150 },
    { id: 'up-revisions-2',  label: '+2 rounds de révisions supplémentaires',   price: 100 },
    { id: 'up-support-30',   label: 'Support étendu à 30 jours',                price: 100 },
];

const UPGRADE_EMPIRE_OPTIONS = [
    { id: 'up-anim-adv',     label: 'Animations avancées',                           price: 350 },
    { id: 'up-seo-adv',      label: 'SEO avancé',                                    price: 450 },
    { id: 'up-revisions-ul', label: "Révisions illimitées jusqu'à mise en ligne",    price: 300 },
    { id: 'up-support-60',   label: 'Support étendu à 60 jours',                     price: 200 },
];

const UNIVERSAL_OPTIONS = [
    { id: 'form',        label: 'Formulaire de contact avancé',        price: 100 },
    { id: 'blog',        label: 'Blog / actualités',                   price: 200 },
    { id: 'gallery',     label: 'Galerie photos/vidéos',               price: 150 },
    { id: 'booking',     label: 'Système de réservation en ligne',     price: 350 },
    { id: 'account',     label: 'Espace client / connexion',           price: 500 },
    { id: 'multilang',   label: 'Multi-langue (par langue ajoutée)',   price: 300 },
    { id: 'whatsapp',    label: 'Widget WhatsApp / Chat',              price: 80  },
    { id: 'maps',        label: 'Intégration Google Maps + avis',      price: 100 },
    { id: 'chatbot',     label: 'Chatbot IA',                          price: 400 },
];

const DEADLINES = [
    { id: 'standard', label: 'Standard', sublabel: '3 à 7 semaines',   rate: 0    },
    { id: 'express',  label: 'Express',  sublabel: '1 à 2 semaines',   rate: 0.20 },
    { id: 'urgent',   label: 'Urgent',   sublabel: 'Moins de 7 jours', rate: 0.45 },
];

function calcExtraPages(n: number): number {
    let total = 0;
    const tiers = [ { up: 3, price: 100 }, { up: 9, price: 80 }, { up: Infinity, price: 60 } ];
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

function AnimatedPrice({ value }: { value: number }) {
    const [displayed, setDisplayed] = useState(value);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const start = displayed;
        const end = value;
        const duration = 400;
        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayed(Math.round(start + (end - start) * eased));
            if (progress < 1) rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return <>{displayed.toLocaleString('fr-FR')}</>;
}

const QuoteConfigurator: React.FC<{ initialSiteType?: string }> = ({ initialSiteType = '' }) => {
    const [step, setStep] = useState(1);

    // ── Discovery state ──────────────────────────────────────────────────────
    const [sector, setSector]               = useState<string>('');
    const [projectGoal, setProjectGoal]     = useState<string>('');
    const [hasExistingSite, setHasExistingSite] = useState<string>('');
    const [hasLogo, setHasLogo]             = useState<string>('');
    const [hasContent, setHasContent]       = useState<string>('');

    // ── Pricing state ────────────────────────────────────────────────────────
    const [siteType, setSiteType]           = useState<string>(initialSiteType);
    const [extraPages, setExtraPages]       = useState(0);
    const [selectedUpgrades, setSelectedUpgrades] = useState<Set<string>>(new Set());
    const [selectedUniversal, setSelectedUniversal] = useState<Set<string>>(new Set());
    const [wantsUnlimited, setWantsUnlimited] = useState(false);
    const [deadline, setDeadline]           = useState<string>('standard');

    const handleSiteTypeChange = (id: string) => {
        setSiteType(id);
        setSelectedUpgrades(new Set());
    };
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const basePrice       = SITE_TYPES.find(s => s.id === siteType)?.price ?? 0;
    const extraPagesPrice = calcExtraPages(extraPages);
    const upgradesPrice   = Array.from(selectedUpgrades).reduce((acc, id) => {
        const opt = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS].find(o => o.id === id);
        return acc + (opt?.price ?? 0);
    }, 0);
    const universalPrice  = Array.from(selectedUniversal).reduce((acc, id) => {
        return acc + (UNIVERSAL_OPTIONS.find(o => o.id === id)?.price ?? 0);
    }, 0);
    const subtotalHT      = basePrice + extraPagesPrice + upgradesPrice + universalPrice;
    const deadlineRate    = DEADLINES.find(d => d.id === deadline)?.rate ?? 0;
    const deadlineSurcharge = Math.round(subtotalHT * deadlineRate);
    const totalHT         = subtotalHT + deadlineSurcharge;
    const tva             = Math.round(totalHT * 0.20);
    const totalTTC        = totalHT + tva;

    // Steps 1–2: discovery / Steps 3–8: pricing (old steps 1–6)
    const navigate = useCallback((next: number) => {
        let target = next;
        // Skip step 5 (upgrades) for Empire / vitrine-premium
        if (next === 5 && siteType !== 'vitrine-simple' && siteType !== 'vitrine-standard') {
            target = next > step ? 6 : 4;
        }
        setDirection(target > step ? 'forward' : 'backward');
        setAnimating(true);
        setTimeout(() => {
            setStep(target);
            setAnimating(false);
        }, 200);
    }, [step, siteType]);

    const toggleUpgrade = (id: string) => {
        setSelectedUpgrades(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const toggleUniversal = (id: string) => {
        setSelectedUniversal(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const buildSummary = () => {
        const siteLabel      = SITE_TYPES.find(s => s.id === siteType)?.label ?? '';
        const deadlineLabel  = DEADLINES.find(d => d.id === deadline)?.label ?? '';
        const allUpgrades    = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS];
        const upgradesList   = Array.from(selectedUpgrades).map(id => allUpgrades.find(o => o.id === id)?.label).filter(Boolean).join(', ') || 'Aucun';
        const universalList  = Array.from(selectedUniversal).map(id => UNIVERSAL_OPTIONS.find(o => o.id === id)?.label).filter(Boolean).join(', ') || 'Aucune';
        const sectorLabel    = SECTORS.find(s => s.id === sector)?.label ?? '—';
        const goalLabel      = PROJECT_GOALS.find(g => g.id === projectGoal)?.label ?? '—';
        const existingSiteLabel = hasExistingSite === 'oui' ? 'Oui (refonte)' : hasExistingSite === 'non' ? 'Non (création)' : '—';
        const logoLabel      = hasLogo === 'oui' ? 'Oui' : hasLogo === 'en-cours' ? 'En cours' : hasLogo === 'non' ? 'Non' : '—';
        const contentLabel   = hasContent === 'oui' ? 'Oui, tout est prêt' : hasContent === 'partiel' ? 'En partie' : hasContent === 'non' ? "Non, besoin d'aide" : '—';
        return { siteLabel, deadlineLabel, upgradesList, universalList, sectorLabel, goalLabel, existingSiteLabel, logoLabel, contentLabel };
    };

    const generatePDF = () => {
        const { siteLabel, deadlineLabel, upgradesList, universalList, sectorLabel, goalLabel, existingSiteLabel, logoLabel, contentLabel } = buildSummary();
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = 210;
        const margin = 20;
        let y = 20;
        const lineH = 7;

        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, W, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text('OSIRIS', margin, 17);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Récapitulatif de devis', W - margin, 17, { align: 'right' });
        y = 38;

        doc.setTextColor(120, 120, 120);
        doc.setFontSize(9);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
        y += 10;

        // Client block
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(margin, y, W - margin * 2, 32, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        doc.text('INFORMATIONS CLIENT', margin + 5, y + 8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(9);
        doc.text(`${form.firstName} ${form.lastName}`, margin + 5, y + 16);
        doc.text(`Email : ${form.email}`, margin + 5, y + 22);
        doc.text(`Téléphone : ${form.phone || '—'}`, margin + 5, y + 28);
        y += 40;

        // Project context block
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        doc.text('VOTRE PROJET', margin, y);
        y += 5;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.4);
        doc.line(margin, y, W - margin, y);
        y += 6;

        const projectRows: [string, string][] = [
            ["Secteur d'activité", sectorLabel],
            ['Objectif principal', goalLabel],
            ['Site web existant',  existingSiteLabel],
            ['Logo / Charte',      logoLabel],
            ['Contenus prêts',     contentLabel],
        ];

        doc.setFontSize(9);
        projectRows.forEach(([label, val], i) => {
            if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 4, W - margin * 2, lineH, 'F'); }
            doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
            doc.text(label, margin + 3, y + 1);
            doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
            doc.text(val, W - margin - 3, y + 1, { align: 'right' });
            y += lineH;
        });
        y += 6;

        // Configuration
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        doc.text('CONFIGURATION', margin, y);
        y += 5;
        doc.line(margin, y, W - margin, y);
        y += 6;

        const configRows: [string, string][] = [
            ['Offre de base', siteLabel],
            ['Pages supplémentaires', extraPages > 0 ? `+${extraPages}` : '0'],
            ['Upgrades', upgradesList],
            ['Options', universalList],
            ['Modifications illimitées', wantsUnlimited ? 'Oui — +19,90 €/mois' : 'Non'],
            ['Délai souhaité', deadlineLabel],
        ];

        doc.setFontSize(9);
        configRows.forEach(([label, val], i) => {
            if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 4, W - margin * 2, lineH, 'F'); }
            doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
            doc.text(label, margin + 3, y + 1);
            doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
            const valLines = doc.splitTextToSize(val, 80);
            doc.text(valLines[0], W - margin - 3, y + 1, { align: 'right' });
            y += lineH;
        });
        y += 6;

        // Pricing
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        doc.text('TARIFICATION', margin, y);
        y += 5;
        doc.line(margin, y, W - margin, y);
        y += 6;

        const priceRows: [string, string][] = [
            ['Sous-total HT', `${subtotalHT.toLocaleString('fr-FR')} €`],
            ...(deadlineSurcharge > 0 ? [[`Supplément délai (${deadlineLabel})`, `+${deadlineSurcharge.toLocaleString('fr-FR')} €`] as [string, string]] : []),
            ['Total HT', `${totalHT.toLocaleString('fr-FR')} €`],
            ['TVA 20%', `${tva.toLocaleString('fr-FR')} €`],
        ];

        doc.setFontSize(9);
        priceRows.forEach(([label, val], i) => {
            if (i % 2 === 0) { doc.setFillColor(248, 248, 248); doc.rect(margin, y - 4, W - margin * 2, lineH, 'F'); }
            doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 90);
            doc.text(label, margin + 3, y + 1);
            doc.setFont('helvetica', 'bold'); doc.setTextColor(20, 20, 20);
            doc.text(val, W - margin - 3, y + 1, { align: 'right' });
            y += lineH;
        });

        y += 3;
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(margin, y - 3, W - margin * 2, 11, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL TTC ESTIMÉ', margin + 5, y + 4);
        doc.text(`${totalTTC.toLocaleString('fr-FR')} €`, W - margin - 5, y + 4, { align: 'right' });
        y += 16;

        if (form.message) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(37, 99, 235);
            doc.text('MESSAGE', margin, y);
            y += 5;
            doc.setDrawColor(37, 99, 235);
            doc.line(margin, y, W - margin, y);
            y += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50);
            const msgLines = doc.splitTextToSize(form.message, W - margin * 2 - 6);
            doc.text(msgLines, margin + 3, y);
        }

        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text('Estimation indicative — Devis personnalisé gratuit sous 24h | contact@osiris-agency.fr', W / 2, 285, { align: 'center' });

        return doc;
    };

    const handleSendQuote = async () => {
        if (sendStatus === 'sending') return;
        setSendStatus('sending');
        const { siteLabel, deadlineLabel, upgradesList, universalList, sectorLabel, goalLabel, existingSiteLabel, logoLabel, contentLabel } = buildSummary();

        try {
            const doc = generatePDF();
            doc.save(`Devis_Osiris_${form.firstName}_${form.lastName}_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (pdfErr) {
            console.error('PDF error:', pdfErr);
        }

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type:               'quote',
                    firstName:          form.firstName,
                    lastName:           form.lastName,
                    email:              form.email,
                    phone:              form.phone || '—',
                    message:            form.message || '—',
                    // Discovery
                    sectorLabel,
                    goalLabel,
                    existingSiteLabel,
                    logoLabel,
                    contentLabel,
                    // Pricing
                    siteLabel,
                    extraPages,
                    upgradesList,
                    universalList,
                    wantsUnlimited,
                    deadlineLabel,
                    subtotalHT:           subtotalHT.toLocaleString('fr-FR'),
                    deadlineSurcharge,
                    deadlineSurchargeStr: deadlineSurcharge.toLocaleString('fr-FR'),
                    totalHT:              totalHT.toLocaleString('fr-FR'),
                    tva:                  tva.toLocaleString('fr-FR'),
                    totalTTC:             totalTTC.toLocaleString('fr-FR'),
                }),
            });
            if (!res.ok) throw new Error('send failed');
            setSendStatus('success');
        } catch (err) {
            console.error('send-email error:', err);
            setSendStatus('error');
        }
    };

    // Steps 1–2: discovery / Steps 3–8: pricing
    const STEPS = [
        { label: 'Projet',    icon: Target       },
        { label: 'Situation', icon: Layers       },
        { label: 'Offre',     icon: Rocket       },
        { label: 'Pages',     icon: FileText     },
        { label: 'Upgrade',   icon: Zap          },
        { label: 'Options',   icon: Sparkles     },
        { label: 'Délai',     icon: Clock        },
        { label: 'Récap',     icon: ClipboardList },
    ];

    const canNext = () => {
        if (step === 3) return siteType !== '';
        if (step === 7) return deadline !== '';
        return true;
    };

    return (
        <div className="relative w-full">
            {/* Mobile price strip */}
            <div className="lg:hidden flex items-center justify-between bg-[#0d1117] border border-[#2563EB]/25 rounded-2xl px-4 py-3 mb-5">
                <div>
                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold leading-none mb-0.5">Total estimé</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-display text-[#2563EB]">
                            <AnimatedPrice value={totalHT} />
                        </span>
                        <span className="text-white/40 text-xs">€ HT</span>
                    </div>
                    <p className="text-white/50 text-[10px] mt-0.5">{totalTTC.toLocaleString('fr-FR')} € TTC</p>
                </div>
                <div className="text-right">
                    <p className="text-white/50 text-[9px] uppercase tracking-widest font-bold mb-1">Étape {step}/8</p>
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5,6,7,8].map(n => (
                            <div key={n} className={`h-1 w-4 rounded-full transition-all duration-300 ${n <= step ? 'bg-[#2563EB]' : 'bg-white/10'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center justify-center gap-0 mb-8">
                {STEPS.map(({ label, icon: StepIcon }, i) => {
                    const num = i + 1;
                    const isDone   = step > num;
                    const isActive = step === num;
                    return (
                        <React.Fragment key={num}>
                            <div className="flex flex-col items-center gap-1.5">
                                <button
                                    onClick={() => num < step && navigate(num)}
                                    disabled={num > step}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 border focus:outline-none
                                        ${isDone   ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.5)] cursor-pointer'
                                        : isActive ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                                                   : 'bg-transparent border-white/15 text-white/30 cursor-default'}`}
                                >
                                    {isDone ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                                </button>
                                <span className={`hidden sm:block text-[10px] uppercase tracking-widest font-bold transition-colors duration-300 ${isActive ? 'text-[#2563EB]' : isDone ? 'text-white/50' : 'text-white/20'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className="relative h-[2px] w-2 sm:w-10 mx-0.5 sm:mx-1 mb-5 bg-white/10 overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-[#2563EB] transition-all duration-500"
                                        style={{ width: step > num ? '100%' : '0%' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Main layout */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                {/* Step content */}
                <div
                    className="flex-1 min-w-0"
                    style={{
                        opacity: animating ? 0 : 1,
                        transform: animating ? `translateX(${direction === 'forward' ? '-20px' : '20px'})` : 'translateX(0)',
                        transition: animating ? 'opacity 200ms ease-in, transform 200ms ease-in' : 'opacity 300ms ease-out, transform 300ms ease-out',
                    }}
                >

                    {/* STEP 1 — Votre projet */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Votre projet
                            </h3>
                            <p className="text-white/60 text-xs mb-7 text-center">Quelques questions pour mieux comprendre votre besoin.</p>

                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Secteur d'activité</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
                                {SECTORS.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSector(s.id)}
                                        className={`p-3 rounded-xl border transition-all duration-200 text-center focus:outline-none
                                            ${sector === s.id
                                                ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]'
                                                : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}
                                    >
                                        <span className="text-xl block mb-1">{s.emoji}</span>
                                        <p className={`text-[11px] font-semibold leading-tight ${sector === s.id ? 'text-white' : 'text-white/60'}`}>{s.label}</p>
                                    </button>
                                ))}
                            </div>

                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Objectif principal du site</p>
                            <div className="flex flex-wrap gap-2">
                                {PROJECT_GOALS.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setProjectGoal(g.id)}
                                        className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none
                                            ${projectGoal === g.id
                                                ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] text-white shadow-[0_0_14px_rgba(37,99,235,0.2)]'
                                                : 'border-white/8 bg-white/[0.03] text-white/60 hover:border-white/15 hover:text-white/80 hover:bg-white/[0.06]'}`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2 — Votre situation */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Votre situation
                            </h3>
                            <p className="text-white/60 text-xs mb-7 text-center">Pour personnaliser votre accompagnement au maximum.</p>

                            {/* Q1: existing site */}
                            <div className="mb-6">
                                <p className="text-white/60 text-sm font-semibold mb-3">Avez-vous déjà un site web ?</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'non', label: 'Non',  sublabel: 'Création from scratch' },
                                        { id: 'oui', label: 'Oui',  sublabel: 'Refonte / migration' },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setHasExistingSite(opt.id)}
                                            className={`p-4 rounded-xl border text-left transition-all duration-200 focus:outline-none
                                                ${hasExistingSite === opt.id
                                                    ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]'
                                                    : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                            <p className={`font-bold text-sm ${hasExistingSite === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                            <p className="text-white/40 text-xs mt-0.5">{opt.sublabel}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2: logo */}
                            <div className="mb-6">
                                <p className="text-white/60 text-sm font-semibold mb-3">Avez-vous un logo / une charte graphique ?</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'oui',      label: 'Oui',      sublabel: 'Identité prête' },
                                        { id: 'en-cours', label: 'En cours', sublabel: 'En création'    },
                                        { id: 'non',      label: 'Non',      sublabel: 'Pas encore'     },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setHasLogo(opt.id)}
                                            className={`p-4 rounded-xl border text-center transition-all duration-200 focus:outline-none
                                                ${hasLogo === opt.id
                                                    ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]'
                                                    : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                            <p className={`font-bold text-sm ${hasLogo === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                            <p className="text-white/40 text-[11px] mt-0.5">{opt.sublabel}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q3: content ready */}
                            <div>
                                <p className="text-white/60 text-sm font-semibold mb-3">Vos contenus (textes, photos) sont-ils prêts ?</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { id: 'oui',     label: 'Oui, tout est prêt', sublabel: 'Textes & visuels dispos'  },
                                        { id: 'partiel', label: 'En partie',           sublabel: 'Partiellement disponibles' },
                                        { id: 'non',     label: 'Non',                sublabel: "J'ai besoin d'aide"        },
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setHasContent(opt.id)}
                                            className={`p-4 rounded-xl border text-center transition-all duration-200 focus:outline-none
                                                ${hasContent === opt.id
                                                    ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]'
                                                    : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                            <p className={`font-bold text-sm ${hasContent === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                            <p className="text-white/40 text-[11px] mt-0.5">{opt.sublabel}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 — Choix de l'offre (old step 1) */}
                    {step === 3 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Choix de l'offre
                            </h3>
                            <p className="text-white/60 text-xs mb-7 text-center">Sélectionnez le type de site qui correspond à votre projet.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {SITE_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleSiteTypeChange(type.id)}
                                        className={`p-5 rounded-2xl border transition-all duration-250 focus:outline-none text-center
                                            ${siteType === type.id
                                                ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                                                : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}
                                    >
                                        <p className="text-white font-bold font-display text-sm mb-1">{type.label}</p>
                                        <p className="text-white/50 text-xs mb-3">{type.sublabel}</p>
                                        <span className={`font-black text-xl font-display ${siteType === type.id ? 'text-[#60A5FA]' : 'text-white/40'}`}>
                                            {type.price.toLocaleString('fr-FR')} €
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 4 — Pages supplémentaires (old step 2) */}
                    {step === 4 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Pages supplémentaires
                            </h3>
                            <p className="text-white/60 text-xs mb-8 text-center">Pages 1–3 : 100€ · Pages 4–9 : 80€ · Pages 10+ : 60€</p>
                            <div className="flex items-center gap-6 justify-center">
                                <button
                                    onClick={() => setExtraPages(p => Math.max(0, p - 1))}
                                    className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95"
                                >−</button>
                                <div className="text-center min-w-[80px]">
                                    <span className="text-5xl font-black font-display text-white">{extraPages}</span>
                                    <p className="text-white/40 text-xs mt-1">page{extraPages > 1 ? 's' : ''}</p>
                                </div>
                                <button
                                    onClick={() => setExtraPages(p => Math.min(20, p + 1))}
                                    className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 text-white text-xl font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200 active:scale-95"
                                >+</button>
                            </div>
                            {extraPages > 0 && (
                                <p className="text-center text-[#60A5FA] text-sm font-bold mt-6">
                                    + {calcExtraPages(extraPages).toLocaleString('fr-FR')} €
                                </p>
                            )}
                            <div className="mt-8 flex flex-wrap gap-2 justify-center">
                                {[0,1,2,3,5,8,10,15,20].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setExtraPages(v)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200
                                            ${extraPages === v
                                                ? 'bg-[#2563EB]/20 border-[#2563EB]/60 text-[#60A5FA]'
                                                : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 5 — Upgrade d'offre (old step 3) */}
                    {step === 5 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Mise à niveau de l'offre
                            </h3>
                            <p className="text-white/60 text-xs mb-6 text-center">Ajoutez des fonctionnalités du niveau supérieur à la carte.</p>

                            {siteType === 'vitrine-simple' && (
                                <div className="mb-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                                        Options Business
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {UPGRADE_BUSINESS_OPTIONS.map(opt => {
                                            const checked = selectedUpgrades.has(opt.id);
                                            return (
                                                <button key={opt.id} onClick={() => toggleUpgrade(opt.id)}
                                                    className={`text-left p-4 rounded-xl border transition-all duration-250 flex items-center gap-3 focus:outline-none
                                                        ${checked ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]' : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${checked ? 'bg-[#2563EB] border-[#2563EB]' : 'border-white/20 bg-transparent'}`}>
                                                        {checked && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold truncate ${checked ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                                    </div>
                                                    <span className={`text-sm font-black font-display shrink-0 ${checked ? 'text-[#60A5FA]' : 'text-white/50'}`}>+{opt.price} €</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(siteType === 'vitrine-simple' || siteType === 'vitrine-standard') && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3 flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                                        Options Empire
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {UPGRADE_EMPIRE_OPTIONS.map(opt => {
                                            const checked = selectedUpgrades.has(opt.id);
                                            return (
                                                <button key={opt.id} onClick={() => toggleUpgrade(opt.id)}
                                                    className={`text-left p-4 rounded-xl border transition-all duration-250 flex items-center gap-3 focus:outline-none
                                                        ${checked ? 'border-purple-500/60 bg-purple-500/10 shadow-[0_0_14px_rgba(168,85,247,0.2)]' : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${checked ? 'bg-purple-500 border-purple-500' : 'border-white/20 bg-transparent'}`}>
                                                        {checked && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold truncate ${checked ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                                    </div>
                                                    <span className={`text-sm font-black font-display shrink-0 ${checked ? 'text-purple-400' : 'text-white/50'}`}>+{opt.price} €</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 6 — Fonctionnalités additionnelles (old step 4) */}
                    {step === 6 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Fonctionnalités additionnelles
                            </h3>
                            <p className="text-white/60 text-xs mb-6 text-center">Disponibles pour tous les niveaux.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {UNIVERSAL_OPTIONS.map(opt => {
                                    const checked = selectedUniversal.has(opt.id);
                                    return (
                                        <button key={opt.id} onClick={() => toggleUniversal(opt.id)}
                                            className={`text-left p-4 rounded-xl border transition-all duration-250 flex items-center gap-3 focus:outline-none
                                                ${checked ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_14px_rgba(37,99,235,0.2)]' : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${checked ? 'bg-[#2563EB] border-[#2563EB]' : 'border-white/20 bg-transparent'}`}>
                                                {checked && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${checked ? 'text-white' : 'text-white/70'}`}>{opt.label}</p>
                                            </div>
                                            <span className={`text-sm font-black font-display shrink-0 ${checked ? 'text-[#60A5FA]' : 'text-white/50'}`}>+{opt.price} €</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4">
                                <button onClick={() => setWantsUnlimited(p => !p)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-250 flex items-center gap-3 focus:outline-none
                                        ${wantsUnlimited ? 'border-amber-400/60 bg-amber-400/[0.08] shadow-[0_0_14px_rgba(251,191,36,0.15)]' : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}>
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${wantsUnlimited ? 'bg-amber-400 border-amber-400' : 'border-white/20 bg-transparent'}`}>
                                        {wantsUnlimited && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold ${wantsUnlimited ? 'text-white' : 'text-white/70'}`}>Modifications illimitées</p>
                                        <p className="text-white/50 text-xs mt-0.5">Engagement 3 mois minimum</p>
                                    </div>
                                    <span className={`text-sm font-black font-display shrink-0 ${wantsUnlimited ? 'text-amber-400' : 'text-white/50'}`}>+19,90 €/mois</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 7 — Délai (old step 5) */}
                    {step === 7 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-2 uppercase tracking-widest text-center">
                                Délai de livraison
                            </h3>
                            <p className="text-white/60 text-xs mb-7 text-center">Choisissez le délai de réalisation de votre projet.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xs sm:max-w-none mx-auto">
                                {DEADLINES.map(d => (
                                    <button
                                        key={d.id}
                                        onClick={() => setDeadline(d.id)}
                                        className={`p-5 rounded-2xl border transition-all duration-250 focus:outline-none text-center
                                            ${deadline === d.id
                                                ? 'border-[#2563EB] bg-[rgba(37,99,235,0.12)] shadow-[0_0_20px_rgba(37,99,235,0.25)]'
                                                : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]'}`}
                                    >
                                        <p className="text-white font-bold font-display text-sm mb-1">{d.label}</p>
                                        <p className="text-white/50 text-xs mb-3">{d.sublabel}</p>
                                        <span className={`text-sm font-black font-display ${deadline === d.id ? 'text-[#60A5FA]' : 'text-white/40'}`}>
                                            {d.rate === 0 ? 'Inclus' : `+${Math.round(d.rate * 100)}%`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 8 — Récapitulatif + formulaire (old step 6) */}
                    {step === 8 && (
                        <div>
                            <h3 className="text-lg font-bold text-white font-display mb-6 uppercase tracking-widest text-center">
                                Récapitulatif & Contact
                            </h3>

                            {/* Project context pill strip */}
                            {(sector || projectGoal || hasExistingSite || hasLogo || hasContent) && (
                                <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3 mb-4 flex flex-wrap gap-x-5 gap-y-1.5">
                                    {sector        && <span className="text-[11px] text-white/40">Secteur : <span className="text-white/70 font-semibold">{SECTORS.find(s => s.id === sector)?.label}</span></span>}
                                    {projectGoal   && <span className="text-[11px] text-white/40">Objectif : <span className="text-white/70 font-semibold">{PROJECT_GOALS.find(g => g.id === projectGoal)?.label}</span></span>}
                                    {hasExistingSite && <span className="text-[11px] text-white/40">Site existant : <span className="text-white/70 font-semibold">{hasExistingSite === 'oui' ? 'Oui (refonte)' : 'Non (création)'}</span></span>}
                                    {hasLogo       && <span className="text-[11px] text-white/40">Logo : <span className="text-white/70 font-semibold">{hasLogo === 'oui' ? 'Oui' : hasLogo === 'en-cours' ? 'En cours' : 'Non'}</span></span>}
                                    {hasContent    && <span className="text-[11px] text-white/40">Contenus : <span className="text-white/70 font-semibold">{hasContent === 'oui' ? 'Prêts' : hasContent === 'partiel' ? 'En partie' : 'À préparer'}</span></span>}
                                </div>
                            )}

                            {/* Recap list */}
                            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5 mb-6 space-y-2">
                                <div className="flex items-baseline justify-between gap-2 text-sm">
                                    <span className="text-white/60 shrink-0">Offre de base</span>
                                    <span className="text-white font-bold text-right">{SITE_TYPES.find(s => s.id === siteType)?.label ?? '—'} — {basePrice.toLocaleString('fr-FR')} €</span>
                                </div>
                                {extraPages > 0 && (
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="text-white/60 shrink-0">{extraPages} page{extraPages > 1 ? 's' : ''} supp.</span>
                                        <span className="text-white font-bold shrink-0">+{extraPagesPrice.toLocaleString('fr-FR')} €</span>
                                    </div>
                                )}
                                {Array.from(selectedUpgrades).map(id => {
                                    const opt = [...UPGRADE_BUSINESS_OPTIONS, ...UPGRADE_EMPIRE_OPTIONS].find(o => o.id === id);
                                    return opt ? (
                                        <div key={id} className="flex items-baseline justify-between gap-2 text-sm">
                                            <span className="text-white/60 min-w-0 truncate">{opt.label}</span>
                                            <span className="text-white font-bold shrink-0">+{opt.price} €</span>
                                        </div>
                                    ) : null;
                                })}
                                {Array.from(selectedUniversal).map(id => {
                                    const opt = UNIVERSAL_OPTIONS.find(o => o.id === id);
                                    return opt ? (
                                        <div key={id} className="flex items-baseline justify-between gap-2 text-sm">
                                            <span className="text-white/60 min-w-0 truncate">{opt.label}</span>
                                            <span className="text-white font-bold shrink-0">+{opt.price} €</span>
                                        </div>
                                    ) : null;
                                })}
                                {wantsUnlimited && (
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="text-amber-400/80 shrink-0">Modifs illimitées</span>
                                        <span className="text-amber-400 font-bold shrink-0">+19,90 €/mois</span>
                                    </div>
                                )}
                                <div className="border-t border-white/8 pt-3 mt-3 space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="text-white/60 shrink-0">Sous-total HT</span>
                                        <span className="text-white font-bold shrink-0">{subtotalHT.toLocaleString('fr-FR')} €</span>
                                    </div>
                                    {deadlineSurcharge > 0 && (
                                        <div className="flex items-baseline justify-between gap-2 text-sm">
                                            <span className="text-white/60 shrink-0">Supplément délai ({DEADLINES.find(d=>d.id===deadline)?.label})</span>
                                            <span className="text-[#60A5FA] font-bold shrink-0">+{deadlineSurcharge.toLocaleString('fr-FR')} €</span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="text-white/60 shrink-0">Total HT</span>
                                        <span className="text-white font-bold shrink-0">{totalHT.toLocaleString('fr-FR')} €</span>
                                    </div>
                                    <div className="flex items-baseline justify-between gap-2 text-sm">
                                        <span className="text-white/60 shrink-0">TVA 20%</span>
                                        <span className="text-white/60 shrink-0">{tva.toLocaleString('fr-FR')} €</span>
                                    </div>
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-white font-bold shrink-0">Total TTC estimé</span>
                                        <span className="text-[#2563EB] font-black font-display text-lg shrink-0">{totalTTC.toLocaleString('fr-FR')} €</span>
                                    </div>
                                </div>
                                <p className="text-white/50 text-[10px] pt-2">Estimation indicative — devis personnalisé gratuit sous 24h</p>
                            </div>

                            {/* Contact form */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {[
                                    { key: 'firstName', label: 'Prénom',     type: 'text'  },
                                    { key: 'lastName',  label: 'Nom',        type: 'text'  },
                                    { key: 'email',     label: 'Email',      type: 'email' },
                                    { key: 'phone',     label: 'Téléphone',  type: 'tel'   },
                                ].map(f => (
                                    <input
                                        key={f.key}
                                        type={f.type}
                                        placeholder={f.label}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all duration-200"
                                    />
                                ))}
                            </div>
                            <textarea
                                placeholder="Message libre..."
                                value={form.message}
                                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all duration-200 resize-none mb-5"
                            />
                            <a
                                href={buildSummary().siteLabel ? '#' : undefined}
                                onClick={e => { e.preventDefault(); if (form.firstName && form.email) handleSendQuote(); }}
                                className={`w-full min-h-[3rem] py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-200 ${
                                    sendStatus === 'sending'
                                        ? 'bg-[#2563EB]/60 cursor-wait'
                                        : sendStatus === 'success'
                                        ? 'bg-emerald-600 hover:bg-emerald-500'
                                        : sendStatus === 'error'
                                        ? 'bg-red-600 hover:bg-red-500'
                                        : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:brightness-110 hover:shadow-[0_0_24px_rgba(37,99,235,0.4)]'
                                }`}
                            >
                                {sendStatus === 'sending' && <><span className="animate-pulse">Envoi en cours…</span></>}
                                {sendStatus === 'success' && <><Check className="w-4 h-4" /> Envoyé — PDF téléchargé !</>}
                                {sendStatus === 'error'   && <>Erreur — réessayez</>}
                                {sendStatus === 'idle'    && <>Envoyer ma demande & télécharger le PDF<ArrowRight className="w-4 h-4" /></>}
                            </a>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-center mt-8 gap-3">
                        <button
                            onClick={() => navigate(step - 1)}
                            disabled={step === 1}
                            className={`w-36 h-12 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-200
                                ${step === 1
                                    ? 'opacity-0 pointer-events-none'
                                    : 'bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/25'}`}
                        >
                            Précédent
                        </button>
                        {step < 8 && (
                            <button
                                onClick={() => navigate(step + 1)}
                                disabled={!canNext()}
                                className={`w-36 h-12 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-200
                                    ${canNext()
                                        ? 'bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/25'
                                        : 'bg-white/[0.02] border-white/5 text-white/25 cursor-not-allowed'}`}
                            >
                                Suivant
                            </button>
                        )}
                    </div>
                </div>

                {/* Sticky price sidebar — desktop only */}
                <div className="hidden lg:block lg:sticky lg:top-28 w-full lg:w-72 shrink-0">
                    <div className="rounded-2xl border border-[#2563EB]/20 bg-[#111318] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-3">Total estimé</p>
                        <div className="flex items-baseline gap-1.5 mb-1">
                            <span className="text-4xl font-black font-display text-[#2563EB]">
                                <AnimatedPrice value={totalHT} />
                            </span>
                            <span className="text-white/40 text-sm font-light">€ HT</span>
                        </div>
                        <p className="text-white/50 text-xs mb-5">soit {totalTTC.toLocaleString('fr-FR')} € TTC (TVA 20%)</p>

                        <div className="space-y-2 text-xs border-t border-white/8 pt-4">
                            {basePrice > 0 && (
                                <div className="flex justify-between text-white/50">
                                    <span>{SITE_TYPES.find(s=>s.id===siteType)?.label}</span>
                                    <span>{basePrice.toLocaleString('fr-FR')} €</span>
                                </div>
                            )}
                            {extraPages > 0 && (
                                <div className="flex justify-between text-white/50">
                                    <span>+{extraPages} page{extraPages > 1 ? 's' : ''}</span>
                                    <span>+{extraPagesPrice.toLocaleString('fr-FR')} €</span>
                                </div>
                            )}
                            {selectedUpgrades.size > 0 && (
                                <div className="flex justify-between text-white/50">
                                    <span>{selectedUpgrades.size} upgrade{selectedUpgrades.size > 1 ? 's' : ''}</span>
                                    <span>+{upgradesPrice.toLocaleString('fr-FR')} €</span>
                                </div>
                            )}
                            {selectedUniversal.size > 0 && (
                                <div className="flex justify-between text-white/50">
                                    <span>{selectedUniversal.size} option{selectedUniversal.size > 1 ? 's' : ''}</span>
                                    <span>+{universalPrice.toLocaleString('fr-FR')} €</span>
                                </div>
                            )}
                            {wantsUnlimited && (
                                <div className="flex justify-between text-amber-400/70">
                                    <span>Modifs illimitées</span>
                                    <span>+19,90 €/mois</span>
                                </div>
                            )}
                            {deadlineSurcharge > 0 && (
                                <div className="flex justify-between text-[#60A5FA]/70">
                                    <span>Supplément délai</span>
                                    <span>+{deadlineSurcharge.toLocaleString('fr-FR')} €</span>
                                </div>
                            )}
                        </div>

                        <p className="text-white/50 text-[10px] leading-relaxed mt-4">
                            Estimation indicative — devis personnalisé gratuit
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const TiltCard = ({ children, className, highlight, color = "green" }: { key?: React.Key, children: React.ReactNode, className?: string, highlight?: boolean, color?: string }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const ref = useRef<HTMLDivElement>(null);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["3deg", "-3deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-3deg", "3deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
            x.set((e.clientX - rect.left) / rect.width - 0.5);
            y.set((e.clientY - rect.top) / rect.height - 0.5);
        }
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    const getColorRgba = (c: string) => {
        switch (c) {
            case 'blue':   return 'rgba(59, 130, 246,';
            case 'purple': return 'rgba(168, 85, 247,';
            case 'green':  return 'rgba(37, 99, 235,';
            default:       return 'rgba(37, 99, 235,';
        }
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative h-full transition-all duration-200 ease-out ${className}`}
        >
            <motion.div
                style={{
                    background: useMotionTemplate`radial-gradient(600px circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%, ${getColorRgba(color)} 0.15), transparent 80%)`,
                    opacity: 0,
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none rounded-[2.5rem] z-20"
            />
            <motion.div
                style={{
                    background: useMotionTemplate`radial-gradient(600px circle at ${mouseX.get() * 100 + 50}% ${mouseY.get() * 100 + 50}%, rgba(255,255,255,0.03), transparent 80%)`,
                }}
                className="absolute inset-0 pointer-events-none rounded-[2.5rem] z-10"
            />
            {children}
        </motion.div>
    );
};

export const PricingPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const scrollToConfigurator = useCallback((siteTypeId: string) => {
        setSelectedPlan(siteTypeId);
        setTimeout(() => {
            document.getElementById('configurateur')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }, []);

    const offers = [
        {
            title: "Starter",  price: "950",   description: t.offer.offers.starter.description,  features: t.offer.offers.starter.features,  highlight: false, icon: Rocket, color: "blue",   newFrom: 0, siteTypeId: 'vitrine-simple'
        },
        {
            title: "Business", price: "1 650", description: t.offer.offers.business.description, features: t.offer.offers.business.features, highlight: true,  icon: Zap,    color: "amber",  newFrom: 1, siteTypeId: 'vitrine-standard'
        },
        {
            title: "Empire",   price: "2 950", description: t.offer.offers.empire.description,   features: t.offer.offers.empire.features,   highlight: false, icon: Crown,  color: "purple", newFrom: 1, siteTypeId: 'vitrine-premium'
        }
    ];

    const getBadge = (title: string) => {
        switch (title) {
            case 'Starter':  return t.pricingPage.badges.starter;
            case 'Business': return t.pricingPage.badges.business;
            case 'Empire':   return t.pricingPage.badges.empire;
            default: return "";
        }
    };

    const getBorderColorClass = (color: string) => {
        switch (color) {
            case 'blue':   return 'border-blue-500/40';
            case 'amber':  return 'border-amber-400/40';
            case 'purple': return 'border-purple-500/40';
            default:       return 'border-white/10';
        }
    };

    const getGlowClass = (color: string) => {
        switch (color) {
            case 'blue':   return 'shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]';
            case 'amber':  return 'shadow-[0_20px_40px_-15px_rgba(251,191,36,0.2)]';
            case 'purple': return 'shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)]';
            default:       return '';
        }
    };

    const getTopLineClass = (color: string) => {
        switch (color) {
            case 'blue':   return 'bg-gradient-to-r from-transparent via-blue-500 to-transparent';
            case 'amber':  return 'bg-gradient-to-r from-transparent via-amber-400 to-transparent';
            case 'purple': return 'bg-gradient-to-r from-transparent via-purple-500 to-transparent';
            default:       return '';
        }
    };

    const getTopGradClass = (color: string) => {
        switch (color) {
            case 'blue':   return 'bg-gradient-to-b from-blue-500/10 to-transparent';
            case 'amber':  return 'bg-gradient-to-b from-amber-400/10 to-transparent';
            case 'purple': return 'bg-gradient-to-b from-purple-500/10 to-transparent';
            default:       return '';
        }
    };

    return (
        <div className="min-h-screen bg-transparent selection:bg-premium-green selection:text-white font-sans overflow-x-hidden">
            <SEOHead
                title={language === 'fr'
                    ? 'Tarifs & Offres - Osiris | Agence Web Premium'
                    : 'Pricing & Plans - Osiris | Premium Web Agency'}
                description={language === 'fr'
                    ? 'Découvrez nos offres de création de sites web premium. Starter à partir de 950€, Business dès 1650€, Empire dès 2950€. Sites vitrines haute performance sur-mesure.'
                    : 'Discover our premium web design packages. Starter from €950, Business from €1650, Empire from €2950. High-performance custom showcase websites.'}
                canonical="https://osiris-web.com/tarifs"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://osiris-web.com/" },
                        { "@type": "ListItem", "position": 2, "name": "Tarifs",  "item": "https://osiris-web.com/tarifs" }
                    ]
                }}
            />

            <div className="relative z-10 pt-24 sm:pt-28 pb-14 sm:pb-16">
                <div className="container mx-auto max-w-7xl px-6">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-xs font-mono uppercase tracking-widest group">
                            <span className="transform group-hover:-translate-x-1 transition-transform inline-block">
                                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                            </span>
                            {t.common.backToHome}
                        </Link>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            <span className="px-4 py-1.5 rounded-full bg-premium-green/5 text-premium-green text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] border border-premium-green/10 shadow-[0_0_25px_-5px_rgba(37,99,235,0.3)] backdrop-blur-md">
                                {t.pricingPage.sectionLabel}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display mb-8 tracking-tighter relative inline-block">
                            <span className="absolute -inset-4 blur-3xl bg-premium-green/15 animate-pulse pointer-events-none rounded-full"></span>
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-premium-green to-blue-400 animate-gradient-x">
                                {t.pricingPage.title} {t.pricingPage.titleHighlight}
                            </span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                            {t.pricingPage.subtitle}<span className="text-white font-medium">{t.pricingPage.subtitleHighlight}</span>
                            <br className="hidden md:block" />
                            {t.pricingPage.subtitleEnd}
                        </p>
                    </motion.div>

                    {/* Pricing Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14 md:items-stretch">
                        {offers.map((offer, index) => {
                            const isExpanded     = expandedCard === offer.title;
                            const compactFeatures = (offer.features as string[]).slice(0, 3);
                            const extraFeatures   = (offer.features as string[]).slice(3);
                            return (
                                <TiltCard key={index} highlight={offer.highlight} color={offer.color} className="group">
                                    <div className={`relative p-6 lg:p-7 rounded-[2rem] flex flex-col h-full bg-[#080808]/60 backdrop-blur-2xl border transition-all duration-500 overflow-hidden
                                        ${getBorderColorClass(offer.color)} ${getGlowClass(offer.color)} hover:bg-white/[0.03]`}>

                                        <div className={`absolute top-0 left-0 right-0 h-[1px] opacity-50 ${getTopLineClass(offer.color)}`} />
                                        <div className={`absolute top-0 inset-x-0 h-28 lg:h-32 opacity-40 pointer-events-none ${getTopGradClass(offer.color)}`} />

                                        <div className={`hidden lg:block absolute -right-8 -top-8 transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110 pointer-events-none opacity-0 group-hover:opacity-100
                                            ${offer.color === 'blue' ? 'text-blue-500/[0.05]' : offer.color === 'amber' ? 'text-amber-400/[0.05]' : 'text-purple-500/[0.05]'}`}>
                                            <offer.icon className="w-80 h-80" strokeWidth={0.5} />
                                        </div>

                                        <div className="flex justify-center mb-4 lg:mb-5 relative z-10">
                                            <div className={`px-4 lg:px-5 py-1.5 lg:py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border
                                                ${offer.color === 'blue'   ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                : offer.color === 'amber' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                                                                           : 'bg-purple-500/10 text-purple-400 border-purple-500/30'}`}>
                                                <offer.icon className="w-3.5 h-3.5" />
                                                {getBadge(offer.title)}
                                            </div>
                                        </div>

                                        <div className="mb-5 lg:mb-6 text-center relative z-10">
                                            <h2 className="text-xl font-black font-display uppercase tracking-widest mb-3 lg:mb-4 text-white">{offer.title}</h2>
                                            <div className="flex items-start justify-center gap-1 group-hover:scale-105 transition-transform duration-500 origin-center">
                                                <span className="text-5xl lg:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-[#c8c8c8] to-[#787878]">{offer.price}</span>
                                                <span className="text-xl lg:text-2xl mt-2 lg:mt-3 text-gray-400 font-light">€</span>
                                            </div>
                                            <p className="text-gray-400 text-xs lg:text-sm mt-3 lg:mt-5 leading-relaxed px-1 lg:px-2">{offer.description}</p>
                                        </div>

                                        <div className={`w-full h-px mb-5 lg:mb-6 relative z-10 transition-all duration-500
                                            ${offer.color === 'blue'   ? 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/50'
                                            : offer.color === 'amber' ? 'bg-gradient-to-r from-transparent via-amber-400/30 to-transparent group-hover:via-amber-400/50'
                                                                       : 'bg-gradient-to-r from-transparent via-purple-500/30 to-transparent group-hover:via-purple-500/50'}`} />

                                        {/* Mobile: compact features */}
                                        <ul className="lg:hidden space-y-2.5 relative z-10 mb-0">
                                            {compactFeatures.map((feature, i) => {
                                                const isInherited = i < (offer.newFrom ?? 0);
                                                return (
                                                    <li key={i} className="flex items-start gap-2.5">
                                                        <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center
                                                            ${isInherited ? 'bg-amber-400/15 text-amber-400'
                                                            : offer.color === 'blue'   ? 'bg-blue-500/15 text-blue-400'
                                                            : offer.color === 'amber'  ? 'bg-amber-400/15 text-amber-400'
                                                                                       : 'bg-purple-500/15 text-purple-400'}`}>
                                                            {isInherited ? <Check className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                                                        </div>
                                                        <span className={`text-xs leading-relaxed ${isInherited ? 'text-amber-400 font-semibold' : 'text-gray-300'}`}>{feature}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {isExpanded && extraFeatures.length > 0 && (
                                            <ul className="lg:hidden space-y-2.5 mt-2.5 relative z-10">
                                                {extraFeatures.map((feature, i) => {
                                                    const realIndex  = i + 3;
                                                    const isInherited = realIndex < (offer.newFrom ?? 0);
                                                    return (
                                                        <li key={i} className="flex items-start gap-2.5">
                                                            <div className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center
                                                                ${isInherited ? 'bg-amber-400/15 text-amber-400'
                                                                : offer.color === 'blue'   ? 'bg-blue-500/15 text-blue-400'
                                                                : offer.color === 'amber'  ? 'bg-amber-400/15 text-amber-400'
                                                                                           : 'bg-purple-500/15 text-purple-400'}`}>
                                                                {isInherited ? <Check className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                                                            </div>
                                                            <span className={`text-xs leading-relaxed ${isInherited ? 'text-amber-400 font-semibold' : 'text-gray-300'}`}>{feature}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}

                                        {extraFeatures.length > 0 && (
                                            <button
                                                onClick={() => setExpandedCard(isExpanded ? null : offer.title)}
                                                className={`lg:hidden relative z-10 mt-3 mb-5 text-[11px] font-bold flex items-center gap-1 transition-colors duration-200
                                                    ${offer.color === 'blue'   ? 'text-blue-400 hover:text-blue-300'
                                                    : offer.color === 'amber' ? 'text-amber-400 hover:text-amber-300'
                                                                               : 'text-purple-400 hover:text-purple-300'}`}
                                            >
                                                {isExpanded ? '− Réduire' : `+ ${extraFeatures.length} infos supplémentaires`}
                                            </button>
                                        )}
                                        {!isExpanded && <div className="lg:hidden mt-5" />}

                                        {/* Desktop: all features */}
                                        <ul className="hidden lg:block space-y-2.5 mb-6 flex-1 relative z-10">
                                            {(offer.features as string[]).map((feature, i) => {
                                                const isInherited = i < (offer.newFrom ?? 0);
                                                return (
                                                    <li key={i} className="flex items-start gap-3 group/item">
                                                        <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                                                            ${isInherited
                                                                ? 'bg-amber-400/15 text-amber-400'
                                                                : offer.color === 'blue'   ? 'bg-blue-500/15   text-blue-400   group-hover/item:bg-blue-500/30'
                                                                : offer.color === 'amber'  ? 'bg-amber-400/15  text-amber-400  group-hover/item:bg-amber-400/30'
                                                                                           : 'bg-purple-500/15 text-purple-400 group-hover/item:bg-purple-500/30'}`}>
                                                            {isInherited ? <Check className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                                                        </div>
                                                        <span className={`text-xs leading-relaxed transition-colors duration-300 ${isInherited ? 'text-amber-400 font-semibold' : 'text-gray-300 font-medium group-hover/item:text-white'}`}>{feature}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <button
                                            onClick={() => scrollToConfigurator(offer.siteTypeId)}
                                            className={`relative z-10 mt-auto w-full py-4 lg:py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 border transition-all duration-300
                                                ${offer.color === 'blue'
                                                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600 hover:text-white hover:border-transparent hover:shadow-[0_0_30px_rgba(59,130,246,0.35)]'
                                                    : offer.color === 'amber'
                                                        ? 'bg-amber-400/20 border-amber-400/40 text-amber-300 hover:bg-amber-500 hover:text-black hover:border-transparent hover:shadow-[0_0_30px_rgba(251,191,36,0.35)]'
                                                        : 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600 hover:text-white hover:border-transparent hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]'}`}
                                        >
                                            Choisir cette offre
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                                        </button>
                                    </div>
                                </TiltCard>
                            );
                        })}
                    </div>

                    {/* Configurateur */}
                    <motion.div
                        id="configurateur"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7 }}
                        className="mb-32"
                    >
                        <div className="text-center mb-12">
                            <span className="text-premium-green text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] mb-4 block">Configurateur</span>
                            <h2 className="text-3xl sm:text-5xl font-black font-display text-white mb-4 tracking-tight flex items-center justify-center gap-4">
                                <Calculator className="w-8 h-8 text-premium-green" />
                                Estimez votre projet
                            </h2>
                            <p className="text-gray-400 max-w-xl mx-auto">
                                Configurez votre site en 8 étapes et obtenez une estimation instantanée. Devis détaillé gratuit sous 24h.
                            </p>
                        </div>
                        <div className="rounded-[2.5rem] border border-white/[0.08] bg-[#080C12]/80 backdrop-blur-xl p-6 sm:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                            <QuoteConfigurator key={selectedPlan} initialSiteType={selectedPlan} />
                        </div>
                    </motion.div>

                    {/* FAQ */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                        <div className="lg:col-span-4 sticky top-32">
                            <span className="text-premium-green text-xs font-bold uppercase tracking-widest mb-4 block">{t.pricingPage.faq.label}</span>
                            <h2 className="text-4xl font-black font-display text-white mb-6">
                                {t.pricingPage.faq.title} <br /> {t.pricingPage.faq.titleLine2}
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                {t.pricingPage.faq.subtitle} <br />
                                {t.pricingPage.faq.subtitleLine2}
                            </p>
                            <Link href="/contact" className="text-white underline decoration-premium-green decoration-2 underline-offset-4 font-bold hover:text-premium-green transition-colors">
                                {t.pricingPage.faq.contactSupport}
                            </Link>
                        </div>

                        <div className="lg:col-span-8 space-y-4">
                            {t.pricingPage.faqs.map((faq: { question: string; answer: string }, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: i * 0.15, ease: "easeOut" }}
                                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-premium-green/20 transition-all duration-300 group hover:translate-x-2 backdrop-blur-md relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-premium-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <h3 className="text-white font-bold mb-3 flex items-start gap-4 text-lg relative z-10">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-premium-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-premium-green group-hover:text-white transition-colors duration-300">
                                            <HelpCircle className="w-3.5 h-3.5" />
                                        </div>
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed pl-10 relative z-10">{faq.answer}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
};
