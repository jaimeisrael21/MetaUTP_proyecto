"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AwardIcon, ExternalLinkIcon, ShieldIcon } from "@/components/icons";
import { certificationPaths, pathMatchesCareer, type CertificationKind } from "@/data/certifications";
import { useProfile, useSession } from "@/lib/store";

const KIND_LABEL: Record<CertificationKind, string> = {
  utp: "Ruta UTP",
  preparation: "Preparación",
  external: "Certificación externa",
  convalidation: "Convalidación",
};

const KIND_STYLE: Record<CertificationKind, string> = {
  utp: "bg-status-met-soft text-status-met",
  preparation: "bg-status-info-soft text-status-info",
  external: "bg-[#f1e8ff] text-[#6f2ba8]",
  convalidation: "bg-status-close-soft text-status-close",
};

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
    () => [...certificationPaths].sort((a, b) => Number(pathMatchesCareer(b, profile.career)) - Number(pathMatchesCareer(a, profile.career))),
    [profile.career]
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

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {orderedPaths.map((path) => {
            const careerMatch = pathMatchesCareer(path, profile.career);
            return (
              <article key={path.id} className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${careerMatch ? "border-primary/25" : "border-border"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${KIND_STYLE[path.kind]}`}>{KIND_LABEL[path.kind]}</span>
                  {path.careers && careerMatch && <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">Relacionada con tu carrera</span>}
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas-soft text-primary"><AwardIcon width={22} height={22} /></span>
                  <div>
                    <h2 className="text-xl font-bold leading-7 text-canvas-foreground">{path.title}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-canvas-foreground/45">Entidad: {path.issuer}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-canvas-foreground/68">{path.summary}</p>
                <ul className="mt-4 space-y-2">
                  {path.items.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-canvas-foreground/75"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{item}</li>)}
                </ul>
                <div className="mt-5 rounded-xl bg-canvas-soft p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-canvas-foreground/45">Siguiente paso</p>
                  <p className="mt-1 text-sm leading-6 text-canvas-foreground/70">{path.nextStep}</p>
                </div>
                <a href={path.sourceUrl} target="_blank" rel="noopener noreferrer" className="secondary-button mt-5 w-full">
                  Abrir fuente oficial <ExternalLinkIcon width={15} height={15} />
                </a>
                <p className="mt-3 text-center text-xs text-canvas-foreground/40">Fuente revisada: {path.verifiedAt}</p>
              </article>
            );
          })}
        </div>

        <section className="mt-7 rounded-2xl border border-border bg-white p-5 text-sm leading-6 text-canvas-foreground/65">
          ¿Tu carrera no aparece en estas rutas? Revisa su malla oficial o consulta a tu facultad. MetaUTP solo muestra nombres que pudo contrastar en una fuente pública; no completa huecos con suposiciones. También puedes volver a <Link href="/oportunidades" className="font-bold text-primary hover:underline">tus oportunidades</Link>.
        </section>
      </div>
    </AppShell>
  );
}
