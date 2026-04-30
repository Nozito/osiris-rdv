"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";

interface Props {
  isAdmin: boolean;
  userEmail: string;
}

export function NavbarWrapper({ isAdmin, userEmail }: Props) {
  const pathname = usePathname();
  const isWizard = pathname.startsWith("/rdv/");
  if (isWizard) return null;
  return (
    <>
      {/* Desktop lg+ : sidebar verticale fixe */}
      <Sidebar isAdmin={isAdmin} userEmail={userEmail} />

      {/* Tablette / mobile : header horizontal (masqué sur lg+) */}
      <div className="lg:hidden">
        <DashboardHeader isAdmin={isAdmin} userEmail={userEmail} />
      </div>

      {/* Mobile seulement : navigation bas d'écran */}
      <BottomNav isAdmin={isAdmin} userEmail={userEmail} />
    </>
  );
}
