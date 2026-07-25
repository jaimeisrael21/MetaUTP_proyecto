"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { CertificationOpportunityCard } from "@/components/CertificationOpportunityCard";
import { ShieldIcon } from "@/components/icons";
import { certificationPaths } from "@/data/certifications";
import { evaluateCertification, rankCertification } from "@/lib/certification-matching";
import { useProfile, useSession } from "@/lib/store";

export default function CertificacionesPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, profile.academicSetupComplete, profile.profileRefined, router]);

  const orderedPaths = useMemo(
    () =>
      certificationPaths
        .map((path) => ({ path, evaluation: evaluateCertification(path, profile) }))
        .sort(
          (first, second) =>
            rankCertification(second.path, second.evaluation, profile) -
            rankCertification(first.path, first.evaluation, profile)
        ),
    [profile]
  );

  if (!profileHydrated || !profile.onboarded || !profile.academicSetupComplete || !profile.profileRefined) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
        <header className="page-enter max-w-4xl">
          <p className="eyebrow">Rutas verificables</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">Certificaciones y acreditaciones</h1>
          <p className="mt-3 text-base leading-7 text-canvas-foreground/70">
            Distingue qué emite la UTP, qué solo prepara para un examen externo y qué documento puede servir para convalidar un curso. Mostramos primero las rutas relacionadas con <strong>{profile.career}</strong>.
          </p>
        </header>

        <section className="mt-6 flex items-start gap-3 rounded-2xl border border-status-info/20 bg-status-info-soft p-5">
          <ShieldIcon width={20} height={20} className="mt-0.5 shrink-0 text-status-info" />
          <p className="text-sm leading-6 text-canvas-foreground/70">
            MetaUTP no emite certificados ni garantiza una convalidación. Organiza rutas publicadas y te lleva a la fuente oficial para confirmar convocatoria, costo, vigencia y procedimiento.
          </p>
        </section>

        <div className="opportunity-grid mt-7">
          {orderedPaths.map(({ path, evaluation }, index) => (
            <CertificationOpportunityCard
              key={path.id}
              path={path}
              evaluation={evaluation}
              animationIndex={index}
            />
          ))}
        </div>

        <section className="mt-7 rounded-2xl border border-border bg-white p-5 text-sm leading-6 text-canvas-foreground/65">
          ¿Tu carrera no aparece en estas rutas? Revisa su malla oficial o consulta a tu facultad. MetaUTP solo muestra nombres que pudo contrastar en una fuente pública; no completa huecos con suposiciones. También puedes volver a <Link href="/oportunidades" className="font-bold text-primary hover:underline">tus oportunidades</Link>.
        </section>
      </div>
    </AppShell>
  );
}
