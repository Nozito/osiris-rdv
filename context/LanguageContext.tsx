'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'en';

const translations = {
    fr: {
        common: {
            backToHome: 'Retour à l\'accueil',
        },
        offer: {
            offers: {
                starter: {
                    description: 'Idéal pour les indépendants et petites entreprises qui souhaitent une présence en ligne professionnelle.',
                    features: [
                        'Site vitrine jusqu\'à 5 pages',
                        'Design sur-mesure responsive',
                        'SEO de base optimisé',
                        'Formulaire de contact',
                        'Hébergement 1 an inclus',
                        'Livraison en 3-4 semaines',
                    ],
                },
                business: {
                    description: 'Pour les PME qui veulent se démarquer avec un site haute performance et des fonctionnalités avancées.',
                    features: [
                        'Site vitrine jusqu\'à 12 pages',
                        'Design premium sur-mesure',
                        'SEO avancé & performance',
                        'Blog / actualités',
                        'Animations & interactions',
                        'Hébergement 1 an inclus',
                        'Support prioritaire 3 mois',
                    ],
                },
                empire: {
                    description: 'La solution complète pour les entreprises ambitieuses qui veulent dominer leur marché en ligne.',
                    features: [
                        'Site vitrine pages illimitées',
                        'Design ultra-premium exclusif',
                        'SEO expert & audit complet',
                        'Espace client / extranet',
                        'Animations 3D & motion design',
                        'Hébergement 1 an inclus',
                        'Support dédié 6 mois',
                        'Tableau de bord analytics',
                    ],
                },
            },
        },
        pricingPage: {
            sectionLabel: 'Nos offres',
            title: 'Tarifs',
            titleHighlight: '& Offres',
            subtitle: 'Des solutions adaptées à chaque ambition. ',
            subtitleHighlight: 'Transparence totale,',
            subtitleEnd: ' sans frais cachés ni mauvaises surprises.',
            badges: {
                starter: 'Essentiel',
                business: 'Populaire',
                empire: 'Prestige',
            },
            faq: {
                label: 'FAQ',
                title: 'Questions',
                titleLine2: 'fréquentes',
                subtitle: 'Tout ce que vous devez savoir sur nos offres.',
                subtitleLine2: 'Vous ne trouvez pas la réponse ? Contactez-nous.',
                contactSupport: 'Contacter le support',
            },
            faqs: [
                {
                    question: 'Quels sont les délais de livraison ?',
                    answer: 'Les délais varient selon l\'offre choisie : 3-4 semaines pour le Starter, 4-6 semaines pour le Business, et 6-10 semaines pour l\'Empire. Des options de livraison accélérée sont disponibles en option.',
                },
                {
                    question: 'Que comprend l\'hébergement inclus ?',
                    answer: 'L\'hébergement inclus couvre la première année sur un serveur haute performance avec SSL, sauvegardes automatiques et CDN mondial. Au-delà, nous vous proposons un forfait annuel compétitif.',
                },
                {
                    question: 'Puis-je modifier mon site après la livraison ?',
                    answer: 'Oui, vous disposez d\'un accès complet à votre site. Nous proposons également des forfaits de maintenance mensuelle pour les mises à jour régulières.',
                },
                {
                    question: 'Proposez-vous des facilités de paiement ?',
                    answer: 'Oui, nous proposons un paiement en 2 ou 3 fois sans frais. Un acompte de 40% est demandé au démarrage du projet.',
                },
                {
                    question: 'Les prix incluent-ils la TVA ?',
                    answer: 'Nos tarifs sont affichés HT (hors taxes). La TVA applicable est de 20% pour les clients français.',
                },
            ],
        },
    },
    en: {
        common: {
            backToHome: 'Back to home',
        },
        offer: {
            offers: {
                starter: {
                    description: 'Ideal for freelancers and small businesses looking for a professional online presence.',
                    features: [
                        'Showcase website up to 5 pages',
                        'Custom responsive design',
                        'Basic SEO optimization',
                        'Contact form',
                        '1 year hosting included',
                        'Delivery in 3-4 weeks',
                    ],
                },
                business: {
                    description: 'For SMEs that want to stand out with a high-performance website and advanced features.',
                    features: [
                        'Showcase website up to 12 pages',
                        'Premium custom design',
                        'Advanced SEO & performance',
                        'Blog / news section',
                        'Animations & interactions',
                        '1 year hosting included',
                        'Priority support 3 months',
                    ],
                },
                empire: {
                    description: 'The complete solution for ambitious companies that want to dominate their online market.',
                    features: [
                        'Unlimited pages showcase website',
                        'Ultra-premium exclusive design',
                        'Expert SEO & full audit',
                        'Client portal / extranet',
                        '3D animations & motion design',
                        '1 year hosting included',
                        'Dedicated support 6 months',
                        'Analytics dashboard',
                    ],
                },
            },
        },
        pricingPage: {
            sectionLabel: 'Our offers',
            title: 'Pricing',
            titleHighlight: '& Plans',
            subtitle: 'Solutions tailored to every ambition. ',
            subtitleHighlight: 'Full transparency,',
            subtitleEnd: ' no hidden fees or surprises.',
            badges: {
                starter: 'Essential',
                business: 'Popular',
                empire: 'Prestige',
            },
            faq: {
                label: 'FAQ',
                title: 'Frequently',
                titleLine2: 'asked questions',
                subtitle: 'Everything you need to know about our offers.',
                subtitleLine2: 'Can\'t find an answer? Contact us.',
                contactSupport: 'Contact support',
            },
            faqs: [
                {
                    question: 'What are the delivery timelines?',
                    answer: 'Timelines vary by package: 3-4 weeks for Starter, 4-6 weeks for Business, and 6-10 weeks for Empire. Expedited delivery options are available as an add-on.',
                },
                {
                    question: 'What does the included hosting cover?',
                    answer: 'The included hosting covers the first year on a high-performance server with SSL, automatic backups, and global CDN. After that, we offer a competitive annual plan.',
                },
                {
                    question: 'Can I update my site after delivery?',
                    answer: 'Yes, you have full access to your site. We also offer monthly maintenance packages for regular updates.',
                },
                {
                    question: 'Do you offer payment plans?',
                    answer: 'Yes, we offer 2 or 3 interest-free installments. A 40% deposit is required at project start.',
                },
                {
                    question: 'Are prices VAT inclusive?',
                    answer: 'Our prices are shown excluding VAT. A 20% VAT applies to French clients.',
                },
            ],
        },
    },
};

type Translations = typeof translations.fr;

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: 'fr',
    setLanguage: () => {},
    t: translations.fr,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('fr');
    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
