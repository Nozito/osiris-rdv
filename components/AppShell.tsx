"use client";
// OSIRIS UX — global app shell: keyboard shortcuts, command palette, FAB, scroll-to-top

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

function isTyping(e: KeyboardEvent): boolean {
  const t = e.target as HTMLElement;
  return (
    t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.tagName === "SELECT" ||
    t.isContentEditable
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // OSIRIS UX — global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      // Escape → close palette
      if (e.key === "Escape") {
        setPaletteOpen(false);
        return;
      }

      // Skip remaining shortcuts when typing in a form field
      if (isTyping(e)) return;

      // N → Nouveau RDV
      if (e.key === "n" || e.key === "N") {
        router.push("/rdv/nouveau");
        return;
      }

      // 1 → Dashboard, 2 → Clients, 3 → Admin
      if (e.key === "1") { router.push("/dashboard"); return; }
      if (e.key === "2") { router.push("/clients");   return; }
      if (e.key === "3") { router.push("/admin");      return; }

      // F → open command palette (as search proxy)
      if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [router]);

  // OSIRIS UX — FAB visible on non-wizard pages only
  const isWizard =
    pathname.startsWith("/rdv/") || pathname === "/rdv/nouveau";

  return (
    <>
      {children}

      {/* OSIRIS UX — command palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      {/* OSIRIS UX — scroll to top (bottom-left) */}
      <ScrollToTop />

      {/* OSIRIS UX — FAB: Nouveau RDV (mobile only, non-wizard pages) */}
      {!isWizard && (
        <Link
          href="/rdv/nouveau"
          aria-label="Nouveau RDV"
          className="
            md:hidden fixed bottom-6 right-5 z-40
            w-14 h-14 rounded-full
            bg-accent hover:bg-accent-hover active:scale-95
            shadow-lg shadow-accent/30
            flex items-center justify-center text-white
            transition-all duration-200
          "
        >
          <Plus size={24} />
        </Link>
      )}
    </>
  );
}
