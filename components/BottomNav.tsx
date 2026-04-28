"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookUser, Plus, Shield, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  isAdmin: boolean;
  userEmail: string;
}

export function BottomNav({ isAdmin, userEmail }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Masqué sur les pages wizard (elles ont leur propre nav)
  if (pathname.startsWith("/rdv/")) return null;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Fermer le menu profil au clic extérieur
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

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
        className={`flex flex-col items-center gap-0.5 py-2 flex-1 transition-colors ${
          active ? "text-accent" : "text-faint hover:text-muted"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
        <span className="text-[9px] font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <nav
      className="
        sm:hidden fixed bottom-0 left-0 right-0 z-40
        bg-[#0a0a14]/95 backdrop-blur-xl
        border-t border-white/8
        shadow-[0_-4px_24px_rgba(0,0,0,0.3)]
      "
    >
      {/* Safe area support on iOS */}
      <div className="flex items-end h-[60px] pb-1 px-2">

        <TabItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <TabItem href="/clients"   icon={BookUser}        label="Clients" />

        {/* CTA central surélevé */}
        <div className="flex flex-col items-center -mt-5 flex-1">
          <Link
            href="/rdv/nouveau"
            className="
              w-12 h-12 rounded-full
              bg-accent hover:bg-accent-hover
              flex items-center justify-center
              shadow-[0_0_20px_rgba(37,99,235,0.55)]
              transition-all active:scale-90
            "
          >
            <Plus size={24} className="text-white" strokeWidth={2.5} />
          </Link>
          <span className="text-[9px] font-medium text-faint mt-0.5">Nouveau</span>
        </div>

        {isAdmin && <TabItem href="/admin" icon={Shield} label="Admin" />}

        {/* Profil / Déconnexion */}
        <div ref={profileRef} className="flex-1 flex flex-col items-center relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className={`flex flex-col items-center gap-0.5 py-2 w-full transition-colors ${
              profileOpen ? "text-accent" : "text-faint hover:text-muted"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors ${
                profileOpen
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-white/15 bg-surface2 text-muted"
              }`}
            >
              {initials}
            </div>
            <span className="text-[9px] font-medium">Profil</span>
          </button>

          {profileOpen && (
            <div
              className="
                absolute bottom-full mb-2 right-0
                w-44 rounded-xl bg-surface2 border border-white/10
                shadow-2xl shadow-black/60
                overflow-hidden animate-[fadeInUp_0.15s_ease-out]
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
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted hover:text-danger hover:bg-danger/8 transition-all"
              >
                <LogOut size={13} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
