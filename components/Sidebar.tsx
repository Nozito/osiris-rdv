"use client";
// OSIRIS UX — vertical sidebar desktop (lg+), hidden on mobile (BottomNav takes over)

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookUser, Plus, Shield, LogOut,
  ChevronRight, Menu,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  isAdmin: boolean;
  userEmail: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export function Sidebar({ isAdmin, userEmail }: Props) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const initials = userEmail
    ? userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "?";

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients",   label: "Clients",   icon: BookUser },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const w = expanded ? "w-52" : "w-14";

  return (
    <aside
      className={`
        hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40
        bg-surface border-r border-white/7 transition-all duration-200 overflow-hidden
        ${w}
      `}
    >
      {/* Toggle collapse/expand */}
      <div className={`flex items-center h-14 border-b border-white/7 shrink-0 ${expanded ? "px-4 justify-between" : "justify-center"}`}>
        {expanded && (
          <Link href="/dashboard" className="font-display font-black text-lg text-accent tracking-tight">
            OSIRIS
          </Link>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:text-textc hover:bg-white/5 transition-all"
        >
          {expanded ? <ChevronRight size={14} /> : <Menu size={15} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1 py-3 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={`
                flex items-center gap-3 h-9 rounded-lg px-2 transition-all duration-150
                ${active
                  ? "bg-accent/12 text-accent"
                  : "text-faint hover:text-textc hover:bg-white/5"
                }
                ${!expanded ? "justify-center" : ""}
              `}
            >
              <Icon size={16} className="shrink-0" />
              {expanded && (
                <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>
              )}
            </Link>
          );
        })}

        {/* Nouveau RDV */}
        <Link
          href="/rdv/nouveau"
          title={!expanded ? "Nouveau RDV" : undefined}
          className={`
            flex items-center gap-3 h-9 rounded-lg px-2 mt-2 transition-all duration-150
            bg-accent text-white hover:bg-accent-hover
            ${!expanded ? "justify-center" : ""}
          `}
        >
          <Plus size={16} className="shrink-0" />
          {expanded && (
            <span className="text-[13px] font-semibold whitespace-nowrap">Nouveau RDV</span>
          )}
        </Link>
      </nav>

      {/* Avatar + logout */}
      <div className={`border-t border-white/7 py-3 px-2 ${expanded ? "flex items-center gap-3" : "flex flex-col items-center gap-2"}`}>
        <div
          className={`
            w-8 h-8 rounded-full bg-accent/15 border border-accent/25 shrink-0
            flex items-center justify-center text-accent text-[11px] font-bold
          `}
          title={userEmail}
        >
          {initials}
        </div>
        {expanded && (
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-faint truncate">{userEmail}</p>
            {isAdmin && <p className="text-[10px] text-accent">Admin</p>}
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-faint hover:text-danger hover:bg-danger/8 transition-all shrink-0"
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
}
