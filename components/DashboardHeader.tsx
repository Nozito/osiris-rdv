"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Plus, LogOut, Shield, LayoutDashboard, BookUser } from "lucide-react";

interface Props {
  isAdmin?: boolean;
  userEmail?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
}

const BASE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, shortcut: "1" },
  { href: "/clients",   label: "Clients",   icon: BookUser,        shortcut: "2" },
];

export function DashboardHeader({ isAdmin = false, userEmail = "" }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();

  // Fermer le menu sur navigation
  useEffect(() => { setProfileOpen(false); }, [pathname]);

  // Fermer le dropdown profil au clic extérieur
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navItems: NavItem[] = [
    ...BASE_NAV,
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield, shortcut: "3" }] : []),
  ];

  // Initiales depuis l'email
  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="
      border-b border-white/8
      bg-[#0a0a14]/80 backdrop-blur-xl
      sticky top-0 z-20
      shadow-[0_1px_0_rgba(37,99,235,0.12)]
    ">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-5">

        {/* ── Brand ── */}
        <Link href="/dashboard" className="flex items-baseline gap-1.5 group shrink-0 mr-2">
          <span className="text-[17px] font-bold text-textc font-display leading-none group-hover:text-accent transition-colors duration-150">
            OSIRIS
          </span>
          <span className="text-[9px] font-semibold text-faint/70 tracking-[0.18em] uppercase hidden sm:block">
            RDV
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden sm:flex items-center gap-0.5 flex-1">
          {navItems.map(({ href, label, icon: Icon, shortcut }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg
                  transition-all duration-150 select-none
                  ${active
                    ? "text-textc bg-white/[0.08]"
                    : "text-muted hover:text-textc hover:bg-white/[0.05]"
                  }
                `}
              >
                <Icon size={14} className={active ? "text-accent" : ""} />
                {label}
                {/* Dot indicateur sous le lien actif */}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
                <kbd className="ml-0.5 text-[9px] text-faint/40 font-mono hidden lg:block">
                  [{shortcut}]
                </kbd>
              </Link>
            );
          })}
        </nav>

        {/* ── Desktop right ── */}
        <div className="hidden sm:flex items-center gap-2 ml-auto">
          {/* CTA Nouveau RDV */}
          <Link
            href="/rdv/nouveau"
            className="
              flex items-center gap-2 h-8 px-3.5 rounded-btn
              bg-accent hover:bg-accent-hover
              text-white text-[13px] font-semibold
              shadow-[0_0_16px_rgba(37,99,235,0.35)]
              hover:shadow-[0_0_24px_rgba(37,99,235,0.5)]
              transition-all duration-200
            "
          >
            <Plus size={14} />
            Nouveau RDV
            <kbd className="text-[9px] text-white/40 font-mono hidden lg:block ml-0.5">[N]</kbd>
          </Link>

          {/* Avatar + dropdown profil */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="
                w-8 h-8 rounded-full
                bg-accent/15 border border-accent/25
                flex items-center justify-center
                text-accent text-[11px] font-bold
                hover:bg-accent/25 hover:border-accent/40
                transition-all duration-150
                select-none
              "
              title={userEmail}
            >
              {initials}
            </button>

            {profileOpen && (
              <div className="
                absolute right-0 top-full mt-2 w-52
                rounded-xl bg-surface2 border border-white/10
                shadow-2xl shadow-black/50
                overflow-hidden
                animate-[fadeInUp_0.15s_ease-out]
                z-50
              ">
                {/* Identité */}
                <div className="px-3.5 py-3 border-b border-white/8">
                  <p className="text-[11px] text-faint truncate">{userEmail || "—"}</p>
                  {isAdmin && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-accent font-medium">
                      <Shield size={9} />
                      Administrateur
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-2.5 px-3.5 py-2.5
                    text-sm text-muted hover:text-textc hover:bg-white/[0.05]
                    transition-all text-left
                  "
                >
                  <LogOut size={14} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile : avatar profil seul (la nav est dans BottomNav) ── */}
        <div ref={profileRef} className="sm:hidden ml-auto relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="
              w-8 h-8 rounded-full
              bg-accent/15 border border-accent/25
              flex items-center justify-center
              text-accent text-[11px] font-bold
              hover:bg-accent/25 transition-all
            "
            title={userEmail}
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  );
}
