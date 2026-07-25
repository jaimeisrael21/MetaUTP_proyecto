"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AiOpportunityGuide } from "@/components/AiOpportunityGuide";
import { AppShell } from "@/components/AppShell";
import {
  AlertIcon,
  AwardIcon,
  ChevronLeftIcon,
  ExternalLinkIcon,
} from "@/components/icons";
import { StatusBadge } from "@/components/StatusBadge";
import { certificationPaths, type CertificationKind } from "@/data/certifications";
import { evaluateCertification } from "@/lib/certification-matching";
import type { OpportunityMatchState } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

const KIND_LABEL: Record<CertificationKind, string> = {
  utp: "Ruta UTP",
  preparation: "Preparación",
  external: "Certificación externa",
  convalidation: "Convalidación",
};

const MATCH_LABEL: Record<OpportunityMatchState, { label: string; style: string }> = {
  recommended: { label: "Coincide contigo", style: "bg-status-met-soft text-status-met" },
  close: { label: "Puedes prepararte", style: "bg-status-close-soft text-status-close" },
  needs_data: { label: "Falta un dato esencial", style: "bg-status-info-soft text-status-info" },
  special_condition: { label: "Solo si aplica", style: "bg-[#f1e8ff] text-[#6f2ba8]" },
  official_validation: {
    label: "Requiere confirmación oficial",
    style: "bg-status-pending-soft text-status-pending",
  },
  not_applicable: {
    label: "Publicada para otra carrera",
    style: "bg-status-unmet-soft text-status-unmet",
  },
  general_catalog: {
    label: "Catálogo general",
    style: "bg-canvas-soft text-canvas-foreground/62",
  },
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function CertificacionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const path = certificationPaths.find((item) => item.id === params.id);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
    else if (!profile.profileRefined) router.replace("/personalizar");
  }, [
    sessionHydrated,
    profileHydrated,
    session.loggedIn,
    profile.onboarded,
    profile.academicSetupComplete,
    profile.profileRefined,
    router,
  ]);

  if (!path) notFound();
  if (
    !profileHydrated ||
    !profile.onboarded ||
    !profile.academicSetupComplete ||
    !profile.profileRefined
  ) {
    return null;
  }

  const evaluation = evaluateCertification(path, profile);
  const match = MATCH_LABEL[evaluation.matchState];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-5 py-7 md:px-10 md:py-10">
        <Link
          href="/certificaciones"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-canvas-foreground/60 transition hover:text-primary"
        >
          <ChevronLeftIcon width={16} height={16} />
          Volver a certificaciones
        </Link>

        <div className="mt-6 grid gap-6 rounded-3xl border border-border bg-white p-6 shadow-[0_18px_55px_rgba(39,29,18,0.07)] lg:grid-cols-[1fr_auto] md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#f1e8ff] px-3 py-1.5 text-[13px] font-bold text-[#6f2ba8]">
                Certificación
              </span>
              <span className="rounded-full bg-canvas-soft px-3 py-1.5 text-[13px] font-bold text-canvas-foreground/62">
                {KIND_LABEL[path.kind]}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">
              {path.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-canvas-foreground/70">
              {path.summary}
            </p>
            <p className="mt-3 text-sm font-semibold text-canvas-foreground/52">
              Entidad: {path.issuer}
            </p>
          </div>
          <div className="flex min-w-48 flex-col justify-center rounded-2xl border border-primary/20 bg-primary-soft/55 p-6">
            <span className="text-4xl font-extrabold text-canvas-foreground">
              {evaluation.confirmedCount}/{evaluation.comparisonTotal}
            </span>
            <span className="mt-1 text-sm leading-5 text-canvas-foreground/60">
              requisitos confirmados con tus datos
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${match.style}`}>
            {match.label}
          </span>
          <span className="text-sm font-medium text-canvas-foreground/60">
            {path.availabilityLabel}
          </span>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-status-info/20 bg-status-info-soft px-5 py-4">
          <AlertIcon
            width={17}
            height={17}
            className="mt-0.5 shrink-0 text-status-pending"
          />
          <p className="text-sm leading-6 text-canvas-foreground/70">
            La oportunidad permanece visible aunque UTP no publique todavía el curso, ciclo o
            convocatoria exactos. Esos puntos aparecen como confirmación oficial y no se usan para
            inventar elegibilidad.
          </p>
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-bold text-canvas-foreground">
              Requisitos, uno por uno
            </h2>
            <span className="text-sm font-medium text-canvas-foreground/50">
              {evaluation.comparisonTotal} condiciones registradas
            </span>
          </div>
          <div className="mt-3 space-y-3">
            {evaluation.evaluations.map((item) => (
              <article
                key={item.requirement.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-border-strong hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-bold text-canvas-foreground">
                    {item.requirement.description}
                  </p>
                  <StatusBadge
                    status={item.status}
                    label={
                      item.status === "official"
                        ? "Confirmación oficial"
                        : item.status === "needs_info"
                          ? "Completa este dato"
                          : undefined
                    }
                    size="sm"
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-canvas-foreground/65">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <AwardIcon width={20} height={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-canvas-foreground">Qué incluye esta ruta</h2>
              <p className="text-sm text-canvas-foreground/55">
                Características informativas; no cuentan como requisitos.
              </p>
            </div>
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {path.characteristics.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl bg-canvas-soft px-4 py-3 text-sm leading-6 text-canvas-foreground/72"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <AiOpportunityGuide
          opportunityId={path.id}
          windowLabel={path.availabilityLabel}
          signals={evaluation.evaluations.map((item) => ({
            requirement: item.requirement.description,
            status: item.status,
            detail: item.detail,
          }))}
        />

        <section className="mt-8 rounded-2xl border border-border bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-canvas-foreground/50">
            Fuentes y vigencia del dato
          </h2>
          <div className="mt-4 space-y-4">
            {path.sources.map((source) => (
              <div
                key={source.url}
                className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-canvas-foreground">{source.label}</p>
                  {source.note && (
                    <p className="mt-1 text-xs leading-5 text-canvas-foreground/52">
                      {source.note}
                    </p>
                  )}
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-canvas-foreground hover:bg-canvas-soft"
                >
                  Abrir fuente oficial
                  <ExternalLinkIcon width={14} height={14} />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-canvas-foreground/40">
            Datos revisados: {formatDate(path.verifiedAt)}
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-primary-soft p-5">
          <h2 className="text-sm font-bold text-primary">Tu siguiente acción</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-canvas-foreground/80">
            {path.nextStep}
          </p>
        </section>
      </div>
    </AppShell>
  );
}
