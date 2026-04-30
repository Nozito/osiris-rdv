"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookUser, Plus, Shield, LogOut } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isAdmin: boolean;
  userEmail: string;
}

export function BottomNav({ isAdmin, userEmail }: Props) {
  const pathname    = usePathname();
  const router      = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef  = useRef<HTMLDivElement>(null);

  // Masqué sur les pages wizard
  if (pathname.startsWith("/rdv/")) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  // Fermer le profil sur navigation
  useEffect(() => { setProfileOpen(false); }, [pathname]);

  const TabItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`
          flex-1 flex flex-col items-center justify-center gap-0.5 h-full
          transition-all duration-150 active:scale-90 select-none
          ${active ? "text-accent" : "text-faint hover:text-muted"}
        `}
      >
        <div className="relative">
          <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
          {/* Dot indicator */}
          {active && (
            <motion.span
              layoutId="bottomnav-dot"
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent"
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          )}
        </div>
        <span className="text-[9px] font-medium leading-none">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="
        sm:hidden fixed bottom-0 left-0 right-0 z-50
        bg-[#0a0a14]/97 backdrop-blur-xl
        border-t border-white/8
        shadow-[0_-2px_20px_rgba(0,0,0,0.4)]
      "
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Bouton + flottant — absolute, centré, au-dessus de la barre */}
      <div className="absolute -top-[26px] left-1/2 -translate-x-1/2 z-10">
        <Link
          href="/rdv/nouveau"
          className="
            w-[52px] h-[52px] rounded-full
            bg-accent hover:bg-accent-hover
            flex items-center justify-center
            shadow-[0_0_24px_rgba(37,99,235,0.65),0_4px_12px_rgba(0,0,0,0.4)]
            border-[3px] border-[#0a0a14]
            transition-all duration-150 active:scale-90
          "
        >
          <Plus size={22} className="text-white" strokeWidth={2.8} />
        </Link>
      </div>

      {/* Barre d'onglets : 2 items gauche · gap central · items droite */}
      <div className="flex h-[52px]">

        <TabItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <TabItem href="/clients"   icon={BookUser}        label="Clients"   />

        {/* Espace réservé au bouton + — proportionnel pour centrer */}
        <div className="w-[52px] shrink-0" />

        {isAdmin && <TabItem href="/admin" icon={Shield} label="Admin" />}

        {/* Profil / Déconnexion */}
        <div
          ref={profileRef}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative"
        >
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={`
              flex flex-col items-center justify-center gap-0.5 w-full h-full
              transition-all duration-150 active:scale-90 select-none
              ${profileOpen ? "text-accent" : "text-faint hover:text-muted"}
            `}
          >
            <div
              className={`
                w-[22px] h-[22px] rounded-full border flex items-center justify-center
                text-[10px] font-bold transition-all
                ${profileOpen
                  ? "border-accent/60 bg-accent/20 text-accent"
                  : "border-white/15 bg-surface2 text-muted"
                }
              `}
            >
              {initials}
            </div>
            <span className="text-[9px] font-medium leading-none">Profil</span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{  opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="
                  absolute bottom-full mb-3 right-0
                  w-44 rounded-xl bg-surface2 border border-white/10
                  shadow-2xl shadow-black/60 overflow-hidden
                "
              >
                <div className="px-3 py-2.5 border-b border-white/8">
                  <p className="text-[11px] text-faint truncate">{userEmail}</p>
                  {isAdmin && (
                    <span className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
                      <Shield size={9} />
                      Administrateur
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted hover:text-danger hover:bg-danger/8 transition-all text-left"
                >
                  <LogOut size={13} />
                  Se déconnecter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
