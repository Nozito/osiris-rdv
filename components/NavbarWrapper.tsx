"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BottomNav } from "@/components/BottomNav";

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
      <DashboardHeader isAdmin={isAdmin} userEmail={userEmail} />
      <BottomNav isAdmin={isAdmin} userEmail={userEmail} />
    </>
  );
}
