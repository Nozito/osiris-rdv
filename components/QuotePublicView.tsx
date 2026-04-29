"use client";
// OSIRIS CRM — vue publique d'un devis signable (sans layout auth)

import { useState } from "react";
import { CheckCircle, AlertTriangle, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AnimatedPrice } from "@/components/AnimatedPrice";
import type { Lead } from "@/types";

interface QuoteToken {
  id:         string;
  token:      string;
  expires_at: string;
  signed_at:  string | null;
  signed_by_name: string | null;
  modification_request: string | null;
}

interface Props {
  token:   string;
  qt:      QuoteToken;
  lead:    Lead;
  expired: boolean;
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

export function QuotePublicView({ token, qt, lead, expired }: Props) {
  const [signName,    setSignName]    = useState("");
  const [accepted,    setAccepted]    = useState(false);
  const [signing,     setSigning]     = useState(false);
  const [signed,      setSigned]      = useState(!!qt.signed_at);
  const [modRequest,  setModRequest]  = useState("");
  const [showMod,     setShowMod]     = useState(false);
  const [modSent,     setModSent]     = useState(false);
  const [modSending,  setModSending]  = useState(false);

  const quote = lead.quote_data;
  const clientName = lead.client_name || "Client";

  if (expired) {
    return (
      <div className="min-h-screen bg-[#08081a] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle size={40} className="text-amber-400 mx-auto mb-4" />
          <p className="text-xl font-bold text-white mb-2">Lien expiré</p>
          <p className="text-slate-400">
            Ce devis n&apos;est plus disponible. Contactez votre conseiller OSIRIS pour en obtenir un nouveau.
          </p>
        </div>
      </div>
    );
  }

  const handleSign = async () => {
    if (!signName.trim() || !accepted) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/quote/${token}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ signedByName: signName.trim() }),
      });
      if (res.ok) setSigned(true);
    } finally {
      setSigning(false);
    }
  };

  const handleModRequest = async () => {
    if (!modRequest.trim()) return;
    setModSending(true);
    try {
      await fetch(`/api/quote/${token}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ request: modRequest.trim() }),
      });
      setModSent(true);
    } finally {
      setModSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08081a] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-lg font-black text-white tracking-tight font-display">OSIRIS</span>
          <span className="text-xs text-slate-400">Proposition commerciale</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {signed ? (
          <div className="text-center py-12">
            <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-white mb-2">Proposition acceptée</p>
            <p className="text-slate-400">
              Signée par <strong>{qt.signed_by_name}</strong> le{" "}
              {qt.signed_at ? new Date(qt.signed_at).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric"
              }) : "aujourd'hui"}.
            </p>
            <p className="text-slate-500 text-sm mt-4">Notre équipe vous contactera très prochainement.</p>
          </div>
        ) : (
          <>
            {/* Titre */}
            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-1">Bonjour,</p>
              <h1 className="text-2xl font-bold text-white">{clientName}</h1>
              {lead.client_company && (
                <p className="text-slate-400">{lead.client_company}</p>
              )}
            </div>

            {/* Récap devis */}
            {quote && (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 mb-6">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">
                  Votre proposition
                </p>

                <div className="flex flex-col gap-2 mb-4">
                  {quote.siteTypeLabel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-semibold">{quote.siteTypeLabel}</span>
                      <span className="text-white font-semibold">{fmt(quote.basePrice)}</span>
                    </div>
                  )}
                  {quote.extraPagesPrice > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Pages supplémentaires ×{quote.extraPages}</span>
                      <span>+{fmt(quote.extraPagesPrice)}</span>
                    </div>
                  )}
                  {quote.upgradesPrice > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Upgrades</span>
                      <span>+{fmt(quote.upgradesPrice)}</span>
                    </div>
                  )}
                  {quote.universalPrice > 0 && (
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Options</span>
                      <span>+{fmt(quote.universalPrice)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/8 my-1 pt-2">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Sous-total HT</span>
                      <span>{fmt(quote.subtotalHT)}</span>
                    </div>
                    {quote.deadlineSurcharge > 0 && (
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Majoration délai ({quote.deadlineLabel})</span>
                        <span>+{fmt(quote.deadlineSurcharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Total HT</span>
                      <span>{fmt(quote.totalHT)}</span>
                    </div>
                    {(quote.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-red-400">
                        <span>Remise –{quote.discountPercent}%</span>
                        <span>–{fmt(quote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>TVA 20 %</span>
                      <span>+{fmt(quote.tva)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-600/15 border border-blue-500/20 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Total TTC</span>
                  <AnimatedPrice
                    value={quote.totalTTC}
                    suffix=" €"
                    className="text-2xl font-black text-blue-400 font-display"
                  />
                </div>

                {quote.wantsUnlimited && (
                  <p className="text-xs text-amber-400 mt-2">+ Modifications illimitées : +19,90 €/mois</p>
                )}
              </div>
            )}

            {/* Bloc signature */}
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6 mb-4">
              <p className="text-sm font-bold text-white mb-4">Accepter la proposition</p>

              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1">Votre nom complet</label>
                <input
                  type="text"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full h-10 px-3 rounded-[10px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <label className="flex items-start gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 accent-blue-500"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  J&apos;accepte les termes de cette proposition commerciale et autorise OSIRIS à démarrer le projet.
                </span>
              </label>

              <Button
                variant="primary"
                size="sm"
                loading={signing}
                disabled={!signName.trim() || !accepted}
                onClick={handleSign}
                icon={<CheckCircle size={14} />}
              >
                Signer et accepter
              </Button>
            </div>

            {/* Bloc modification */}
            {!modSent ? (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
                {!showMod ? (
                  <button
                    onClick={() => setShowMod(true)}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit2 size={13} />
                    Demander une modification
                  </button>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-white mb-2">Votre demande de modification</p>
                    <textarea
                      value={modRequest}
                      onChange={(e) => setModRequest(e.target.value)}
                      placeholder="Décrivez les modifications souhaitées…"
                      rows={3}
                      className="w-full px-3 py-2 rounded-[10px] bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-colors resize-none mb-2"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={modSending}
                      disabled={!modRequest.trim()}
                      onClick={handleModRequest}
                    >
                      Envoyer la demande
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-center">
                <p className="text-xs text-green-400">
                  ✓ Votre demande a été envoyée. Notre équipe vous recontactera.
                </p>
              </div>
            )}
          </>
        )}

        <p className="text-[11px] text-slate-600 text-center mt-8">
          Ce devis est valable jusqu&apos;au {new Date(qt.expires_at).toLocaleDateString("fr-FR")} — OSIRIS Agence Web Premium
        </p>
      </main>
    </div>
  );
}
