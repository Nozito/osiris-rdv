"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";

interface Props {
  isAdmin: boolean;
  userEmail: string;
}

export function NavbarWrapper({ isAdmin, userEmail }: Props) {
  const pathname = usePathname();
  // Le wizard (/rdv/*) a son propre header — on masque la navbar globale
  if (pathname.startsWith("/rdv/")) return null;
  return <DashboardHeader isAdmin={isAdmin} userEmail={userEmail} />;
}
