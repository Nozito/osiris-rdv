"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toast";
import { UserPlus, X } from "lucide-react";

const inputCls =
  "w-full h-9 px-3 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors";

export function NewClientModal() {
  const [open, setSaving_open] = useState(false);
  const [saving, setSaving]    = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", company: "", email: "", phone: "", notes: "",
  });
  const router   = useRouter();
  const firstRef = useRef<HTMLInputElement>(null);

  // Focus premier champ à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => firstRef.current?.focus(), 80);
  }, [open]);

  const patch = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const reset = () => {
    setForm({ firstName: "", lastName: "", company: "", email: "", phone: "", notes: "" });
    setSaving_open(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName && !form.email) {
      toast.error("Prénom ou email requis");
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const name = [form.firstName, form.lastName].filter(Boolean).join(" ");
    const { error } = await supabase.from("clients").insert({
      commercial_id: user.id,
      name,
      email:   form.email,
      company: form.company,
      phone:   form.phone,
      notes:   form.notes,
    });

    if (error) {
      console.error("[NewClientModal]", error);
      toast.error("Erreur lors de la création");
    } else {
      toast.success(`Client « ${name || form.email} » créé ✓`);
      reset();
      router.refresh();
    }
    setSaving(false);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    type = "text",
    ref?: React.RefObject<HTMLInputElement | null>,
  ) => (
    <div>
      <label className="block text-xs text-muted mb-1">{label}</label>
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        type={type}
        value={form[key]}
        onChange={(e) => patch(key, e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setSaving_open(true)}
        className="
          inline-flex items-center gap-2 h-9 px-4 rounded-btn
          bg-surface2 hover:bg-white/8
          text-sm text-muted hover:text-textc
          border border-white/8 hover:border-white/15
          transition-all
        "
      >
        <UserPlus size={14} />
        Nouveau client
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={reset}
          />

          {/* Panneau */}
          <div className="
            relative w-full sm:max-w-md
            bg-surface rounded-t-2xl sm:rounded-2xl
            border border-white/10 shadow-2xl z-10
            animate-[fadeInUp_0.2s_ease-out]
          ">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <h2 className="text-sm font-bold text-textc font-display">Nouveau client</h2>
                <p className="text-xs text-muted mt-0.5">Indépendant d'un RDV — vous pourrez en créer un ensuite</p>
              </div>
              <button
                onClick={reset}
                className="p-1.5 rounded-lg text-faint hover:text-textc hover:bg-white/6 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {field("firstName", "Prénom *", "Jean", "text", firstRef)}
                {field("lastName",  "Nom",      "Dupont")}
              </div>
              {field("company", "Entreprise", "Acme SAS")}
              {field("email",   "Email",      "jean@acme.fr", "email")}
              {field("phone",   "Téléphone",  "+33 6 00 00 00 00", "tel")}

              <div>
                <label className="block text-xs text-muted mb-1">Notes internes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => patch("notes", e.target.value)}
                  placeholder="Contexte, source, remarques…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-[10px] bg-surface2 border border-white/8 text-sm text-textc placeholder:text-faint outline-none focus:border-accent/40 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="flex-1 h-9 rounded-btn text-sm text-muted hover:text-textc border border-white/8 hover:bg-white/5 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-9 rounded-btn text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-50 transition-all"
                >
                  {saving ? "Création…" : "Créer le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
