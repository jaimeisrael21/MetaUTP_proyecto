"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRightIcon, CheckCircleIcon, HelpCircleIcon } from "@/components/icons";
import { SetupProgress } from "@/components/SetupProgress";
import { useProfile, useSession } from "@/lib/store";

export default function ListoPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated } = useProfile();
  useEffect(() => {
    if (!sessionHydrated || !hydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.profileRefined) router.replace("/personalizar");
  }, [sessionHydrated, hydrated, session.loggedIn, profile.profileRefined, router]);
  if (!hydrated || !profile.profileRefined) return null;

  const knownMetrics = [profile.academicMetrics.lastPeriodGpa, profile.cumulativeGpa, profile.approvedCredits, profile.academicMetrics.weeklyHoursCurrent].filter((value) => value !== null).length;
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-4xl">
        <SetupProgress current={4} />
        <section className="mt-10 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_24px_70px_rgba(39,29,18,0.09)] page-enter">
          <div className="bg-status-met-soft px-6 py-8 text-center md:px-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-status-met text-white shadow-[0_14px_34px_rgba(0,142,72,0.25)]"><CheckCircleIcon width={32} height={32} /></span>
            <p className="eyebrow mt-5">Perfil listo</p>
            <h1 className="mt-2 text-3xl font-bold text-canvas-foreground">Ya podemos personalizar tus oportunidades</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-canvas-foreground/70">Mostraremos solo opciones coherentes con lo que registraste. Un dato faltante aparecerá como pendiente, nunca como un supuesto.</p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-2 md:p-8">
            <div className="summary-inline"><span className="summary-inline__label">Carrera y ciclo</span><strong className="summary-inline__value">{profile.career} · {profile.cycle}.°</strong></div>
            <div className="summary-inline"><span className="summary-inline__label">Periodo</span><strong className="summary-inline__value">{profile.academicPeriod}</strong></div>
            <div className="summary-inline"><span className="summary-inline__label">Cursos confirmados</span><strong className="summary-inline__value">{profile.courses.filter((course) => course.name.trim() && course.grade !== null).length}</strong></div>
            <div className="summary-inline"><span className="summary-inline__label">Métricas disponibles</span><strong className="summary-inline__value">{knownMetrics} de 4 esenciales</strong></div>
          </div>
          <div className="border-t border-border p-6 md:px-8">
            <div className="flex items-start gap-2 text-sm leading-6 text-canvas-foreground/65"><HelpCircleIcon width={18} height={18} className="mt-0.5 shrink-0" /><p>MetaUTP orienta y explica requisitos; la decisión y validación final siempre pertenecen a la entidad responsable.</p></div>
            <button type="button" onClick={() => router.push("/oportunidades")} className="primary-button mt-5 w-full">Ver mis oportunidades <ArrowRightIcon width={18} height={18} /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
