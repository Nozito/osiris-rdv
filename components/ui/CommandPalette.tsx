"use client";
// OSIRIS UX — command palette (Cmd+K / Ctrl+K)

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  Plus,
  LayoutDashboard,
  BookUser,
  Shield,
  FileText,
  Loader2,
} from "lucide-react";

interface Result {
  id: string;
  type: "action" | "lead";
  label: string;
  sub?: string;
  status?: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: Result[] = [
  {
    id: "new-rdv",
    type: "action",
    label: "Nouveau RDV",
    sub: "N",
    href: "/rdv/nouveau",
    icon: <Plus size={14} />,
  },
  {
    id: "dashboard",
    type: "action",
    label: "Dashboard",
    sub: "1",
    href: "/dashboard",
    icon: <LayoutDashboard size={14} />,
  },
  {
    id: "clients",
    type: "action",
    label: "Base clients",
    sub: "2",
    href: "/clients",
    icon: <BookUser size={14} />,
  },
  {
    id: "admin",
    type: "action",
    label: "Administration",
    sub: "3",
    href: "/admin",
    icon: <Shield size={14} />,
  },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  signed: "Signé",
  lost: "Perdu",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "text-muted",
  sent: "text-accent",
  signed: "text-success",
  lost: "text-danger",
};

function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = (target ?? "").toLowerCase();
  return t.includes(q);
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* ── Fetch leads when palette opens ────────────────────── */
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);
    setLoading(true);

    const supabase = createClient();
    supabase
      .from("leads")
      .select("id, client_name, client_company, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setLeads(
          (data ?? []).map((l) => ({
            id: l.id,
            type: "lead" as const,
            label: l.client_name || "Sans nom",
            sub: l.client_company || undefined,
            status: l.status,
            href: `/rdv/${l.id}`,
            icon: <FileText size={14} />,
          }))
        );
        setLoading(false);
      });
  }, [open]);

  /* ── Focus input when opened ────────────────────────────── */
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ── Lock body scroll when open ─────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* ── Filtered results ───────────────────────────────────── */
  const filteredLeads = leads.filter(
    (l) => fuzzyMatch(query, l.label) || fuzzyMatch(query, l.sub ?? "")
  );

  const results: Result[] = query
    ? filteredLeads.slice(0, 8)
    : [...QUICK_ACTIONS, ...filteredLeads.slice(0, 5)];

  /* ── Keyboard navigation ────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = results[selectedIndex];
        if (hit) { router.push(hit.href); onClose(); }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, results, selectedIndex, router, onClose]);

  /* ── Reset selection when results change ────────────────── */
  useEffect(() => { setSelectedIndex(0); }, [query]);

  const go = useCallback(
    (href: string) => { router.push(href); onClose(); },
    [router, onClose]
  );

  if (!open) return null;

  return (
    /* OSIRIS UX — frosted glass overlay */
    <div
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "rgba(8,8,16,0.75)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-[20px] bg-surface border border-white/10 shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/8">
          <Search size={16} className="text-faint shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un lead, client, action…"
            className="flex-1 bg-transparent text-sm text-textc placeholder:text-faint outline-none"
          />
          {loading && <Loader2 size={14} className="text-faint animate-spin shrink-0" />}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-surface2 border border-white/8 text-[10px] text-faint font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {results.length === 0 && !loading && (
            <p className="text-center text-xs text-faint py-10">
              Aucun résultat pour «&nbsp;{query}&nbsp;»
            </p>
          )}

          {!query && (
            <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-faint uppercase tracking-wider">
              Actions rapides
            </p>
          )}

          {results.map((item, i) => {
            const isLead = item.type === "lead";
            const isSelected = i === selectedIndex;

            return (
              <button
                key={item.id}
                type="button"
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"}
                `}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => go(item.href)}
              >
                <span className="text-faint shrink-0">{item.icon}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-sm text-textc block truncate">
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="text-xs text-faint truncate block">
                      {item.sub}
                    </span>
                  )}
                </span>
                {isLead && item.status && (
                  <span className={`text-xs shrink-0 ${STATUS_COLOR[item.status] ?? "text-muted"}`}>
                    {STATUS_LABELS[item.status] ?? item.status}
                  </span>
                )}
                {!isLead && item.sub && (
                  <kbd className="shrink-0 px-1.5 py-0.5 rounded bg-surface2 border border-white/8 text-[10px] text-faint font-mono">
                    {item.sub}
                  </kbd>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-white/8 flex items-center gap-4 text-[10px] text-faint">
          <span><kbd className="font-mono">↑↓</kbd> naviguer</span>
          <span><kbd className="font-mono">↵</kbd> ouvrir</span>
          <span><kbd className="font-mono">esc</kbd> fermer</span>
          <span className="ml-auto">N = Nouveau RDV · 1 2 3 = Vues</span>
        </div>
      </div>
    </div>
  );
}
