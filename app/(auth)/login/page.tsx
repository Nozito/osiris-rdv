"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.12) 0%, #080810 60%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textc font-display tracking-tight">
            OSIRIS
          </h1>
          <p className="text-muted text-sm mt-1">Configurateur RDV</p>
        </div>

        <div className="rounded-card bg-surface border border-white/8 p-6 shadow-[0_0_60px_rgba(37,99,235,0.08)]">
          <h2 className="text-lg font-semibold text-textc font-display mb-1">
            Connexion
          </h2>
          <p className="text-sm text-muted mb-5">
            Accès réservé à l'équipe commerciale
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-textc">Email</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@osiris.studio"
                  className="w-full h-11 rounded-[10px] bg-surface2 border border-white/8 pl-10 pr-4 text-sm text-textc placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-textc">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-11 rounded-[10px] bg-surface2 border border-white/8 pl-10 pr-4 text-sm text-textc placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-danger bg-danger/8 border border-danger/20 rounded-xl px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 rounded-btn bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
