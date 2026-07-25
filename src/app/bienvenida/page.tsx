"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useSession } from "@/lib/store";

export default function BienvenidaPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
    else router.replace("/oportunidades");
  }, [
    sessionHydrated,
    profileHydrated,
    session.loggedIn,
    profile.onboarded,
    profile.academicSetupComplete,
    profile.profileRefined,
    router,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex items-center gap-3 text-canvas-foreground">
        <span className="brand-mark__icon">M</span>
        <div>
          <p className="text-lg font-extrabold">MetaUTP</p>
          <p className="text-sm text-canvas-foreground/55">Preparando tu experiencia…</p>
        </div>
      </div>
    </div>
  );
}
