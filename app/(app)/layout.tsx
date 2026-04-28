export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import type { Profile } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as Pick<Profile, "role"> | null)?.role === "admin";

  return (
    <AppShell>
      <NavbarWrapper isAdmin={isAdmin} userEmail={user.email ?? ""} />
      {/* pb-[4.5rem] sur mobile pour ne pas chevaucher la BottomNav */}
      <div className="pb-[4.5rem] sm:pb-0">
        {children}
      </div>
    </AppShell>
  );
}
