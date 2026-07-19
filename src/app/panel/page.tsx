"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  HelpCircleIcon,
  PencilIcon,
  PlusIcon,
  ScanTextIcon,
  TrashIcon,
} from "@/components/icons";
import { OcrCourseImporter } from "@/components/OcrCourseImporter";
import type { OcrAcademicImport } from "@/components/OcrCourseImporter";
import { SetupProgress } from "@/components/SetupProgress";
import type { Course } from "@/data/types";
import { weightedAverage } from "@/lib/matching";
import { useProfile, useSession } from "@/lib/store";

function newCourse(): Course {
  return { id: crypto.randomUUID(), name: "", credits: 3, grade: 14, period: "current", weeklyHours: 0, source: "manual" };
}

export default function PanelPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [entryMethod, setEntryMethod] = useState<"manual" | "ocr" | null>(null);
  const [setupError, setSetupError] = useState("");
  const courses = profile.courses;

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  if (!profileHydrated || !profile.onboarded) return null;

  const validCourses = courses.filter((course) => course.name.trim());
  const cycleAverage = weightedAverage(validCourses);
  const totalCredits = validCourses.reduce((sum, course) => sum + (course.credits || 0), 0);

  function persist(next: Course[]) {
    const valid = next.filter((course) => course.name.trim());
    update({
      courses: next,
      academicMetrics: {
        ...profile.academicMetrics,
        currentCycleGpa: valid.length > 0 ? weightedAverage(valid) : profile.academicMetrics.currentCycleGpa,
        currentPeriodCredits: valid.length > 0 ? valid.reduce((sum, course) => sum + (course.credits || 0), 0) : profile.academicMetrics.currentPeriodCredits,
      },
    });
  }

  function updateCourse(id: string, patch: Partial<Course>) {
    persist(courses.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function removeCourse(id: string) {
    persist(courses.filter((course) => course.id !== id));
  }

  function addCourse() {
    persist([...courses, newCourse()]);
  }

  function importCourses(imported: Course[], academic: OcrAcademicImport) {
    const existing = courses.filter((course) => course.name.trim());
    const names = new Set(existing.map((course) => course.name.trim().toLocaleLowerCase("es")));
    const unique = imported.filter((course) => {
      const key = course.name.trim().toLocaleLowerCase("es");
      if (!key || names.has(key)) return false;
      names.add(key);
      return true;
    });
    const nextCourses = [...existing, ...unique];
    update({
      courses: nextCourses,
      cumulativeGpa: academic.cumulativeGpa ?? profile.cumulativeGpa,
      approvedCredits: academic.approvedCredits ?? profile.approvedCredits,
      academicMetrics: {
        ...profile.academicMetrics,
        ...academic.metrics,
        ...(nextCourses.length > 0 ? {
          currentCycleGpa: weightedAverage(nextCourses),
          currentPeriodCredits: nextCourses.reduce((sum, course) => sum + (course.credits || 0), 0),
        } : {}),
      },
      facts: {
        ...profile.facts,
        ...(academic.academicRank ? { academicRank: academic.academicRank } : {}),
        ...(academic.englishIVPassed ? { englishIVPassed: academic.englishIVPassed } : {}),
      },
      dataProvenance: {
        academicSource: "ocr",
        documentType: academic.documentType,
        confirmedAt: new Date().toISOString(),
      },
    });
    setEntryMethod("ocr");
  }

  function finishSetup() {
    const hasAcademicData = validCourses.length > 0 || profile.cumulativeGpa > 0 || profile.approvedCredits > 0 || Object.values(profile.academicMetrics).some((value) => value !== null && value > 0);
    if (!hasAcademicData) {
      setSetupError("Registra al menos un curso o una métrica académica antes de continuar.");
      return;
    }
    setSetupError("");
    update({
      academicSetupComplete: true,
      dataProvenance: {
        ...profile.dataProvenance,
        academicSource: entryMethod === "ocr" ? "ocr" : profile.dataProvenance.academicSource === "ocr" ? "ocr" : "manual",
        confirmedAt: new Date().toISOString(),
      },
    });
    router.push(profile.profileRefined ? "/configuracion?saved=academic" : "/personalizar");
  }

  function numericValue(value: string) {
    if (value.trim() === "") return null;
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function updateMetric(key: keyof typeof profile.academicMetrics, value: string) {
    update({ academicMetrics: { ...profile.academicMetrics, [key]: numericValue(value) } });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
        {!profile.academicSetupComplete && (
          <div className="max-w-2xl">
            <SetupProgress current={2} />
          </div>
        )}

        <header className={`${profile.academicSetupComplete ? "mt-1" : "mt-8"} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between page-enter`}>
          <div>
            <p className="eyebrow">Tu información académica</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">
              {profile.academicSetupComplete ? "Revisa tus cursos y notas" : "Completa tu ciclo actual"}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-canvas-foreground/70">
              {profile.academicSetupComplete
                ? "Actualiza lo que haya cambiado o importa una nueva captura. Nada se usa sin que puedas revisarlo."
                : "Añade los cursos que llevas con sus créditos y notas. Revisarás todo antes de usarlo para personalizar tus oportunidades."}
            </p>
          </div>
          <Link href={profile.academicSetupComplete ? "/configuracion" : "/configurar"} className="secondary-button shrink-0">{profile.academicSetupComplete ? "Volver a Configuración" : "Editar perfil general"}</Link>
        </header>

        <section className="mt-6 grid gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:grid-cols-3 md:p-5" aria-label="Resumen del perfil">
          <div className="summary-inline">
            <span className="summary-inline__label">Carrera</span>
            <strong className="summary-inline__value">{profile.career || "Sin registrar"}</strong>
          </div>
          <div className="summary-inline">
            <span className="summary-inline__label">Ciclo</span>
            <strong className="summary-inline__value">{profile.cycle}°</strong>
          </div>
          <div className="summary-inline">
            <span className="summary-inline__label">Periodo</span>
            <strong className="summary-inline__value">{profile.academicPeriod}</strong>
          </div>
        </section>

        <section className="mt-7" aria-labelledby="entry-method-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-canvas-foreground" id="entry-method-title">¿Cómo quieres añadirlos?</p>
              <p className="mt-1 text-sm text-canvas-foreground/60">Elige una opción para mostrar sus campos. Ninguna está preseleccionada.</p>
            </div>
            <div className="group relative">
              <button
                type="button"
                className="inline-flex cursor-help items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-[13px] font-semibold text-canvas-foreground/65 transition hover:border-status-info/40 hover:text-status-info"
                aria-describedby="ocr-help"
              >
                <HelpCircleIcon width={16} height={16} />
                ¿Qué debe mostrar mi archivo?
              </button>
              <div
                id="ocr-help"
                role="tooltip"
                className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-72 translate-y-1 rounded-xl bg-sidebar px-4 py-3 text-sm leading-6 text-sidebar-foreground opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
              >
                Usa una captura legible que muestre los nombres de tus cursos. El OCR propone
                esos nombres; tú completas y confirmas las notas y los créditos antes de guardar.
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2" role="group" aria-label="Método para registrar cursos">
            <button
              type="button"
              aria-pressed={entryMethod === "manual"}
              onClick={() => setEntryMethod("manual")}
              className={`method-card ${entryMethod === "manual" ? "method-card--active" : ""}`}
            >
              <span className="method-card__icon"><PencilIcon width={21} height={21} /></span>
              <span>
                <span className="block text-base font-bold text-canvas-foreground">Ingresar manualmente</span>
                <span className="mt-1 block text-sm leading-6 text-canvas-foreground/65">Control total sobre nombres, créditos y notas.</span>
              </span>
              {entryMethod === "manual" && <CheckCircleIcon className="ml-auto shrink-0 text-primary" width={21} height={21} />}
            </button>
            <button
              type="button"
              aria-pressed={entryMethod === "ocr"}
              onClick={() => setEntryMethod("ocr")}
              className={`method-card ${entryMethod === "ocr" ? "method-card--active" : ""}`}
            >
              <span className="method-card__icon"><ScanTextIcon width={21} height={21} /></span>
              <span>
                <span className="block text-base font-bold text-canvas-foreground">Escanear con OCR</span>
                <span className="mt-1 block text-sm leading-6 text-canvas-foreground/65">Sube una captura y revisa lo que detectamos.</span>
              </span>
              {entryMethod === "ocr" && <CheckCircleIcon className="ml-auto shrink-0 text-primary" width={21} height={21} />}
            </button>
          </div>
        </section>

        {(entryMethod !== null || profile.academicSetupComplete) && (
          <section className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm" aria-labelledby="academic-summary-title">
            <div>
              <p className="eyebrow">Resumen académico</p>
              <h2 id="academic-summary-title" className="mt-1 text-xl font-bold text-canvas-foreground">
                {entryMethod === "manual" ? "Completa los datos que figuran en tu documento" : entryMethod === "ocr" ? "Datos detectados por tus capturas" : "Datos académicos guardados"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-canvas-foreground/60">
                {entryMethod === "manual" ? "Déjalo vacío si no lo conoces. MetaUTP nunca lo calculará comparándote con otros usuarios." : entryMethod === "ocr" ? "Sube y confirma cada captura; este resumen se actualizará sin reemplazar los datos anteriores." : "Elige un método abajo para incorporar otra captura o corregirlos manualmente."}
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label><span className="field-label">Promedio periodo anterior</span><input type="number" min={0} max={20} step="0.01" value={profile.academicMetrics.lastPeriodGpa ?? ""} onChange={(event) => updateMetric("lastPeriodGpa", event.target.value)} disabled={entryMethod !== "manual"} className="field-control disabled:bg-canvas-soft disabled:text-canvas-foreground/65" placeholder="Por confirmar" /></label>
              <label><span className="field-label">Promedio acumulado según tu récord</span><input type="number" min={0} max={20} step="0.01" value={profile.cumulativeGpa || ""} onChange={(event) => update({ cumulativeGpa: numericValue(event.target.value) ?? 0 })} disabled={entryMethod !== "manual"} className="field-control disabled:bg-canvas-soft disabled:text-canvas-foreground/65" placeholder="Por confirmar" /></label>
              <label><span className="field-label">Créditos aprobados acumulados</span><input type="number" min={0} value={profile.approvedCredits || ""} onChange={(event) => update({ approvedCredits: numericValue(event.target.value) ?? 0 })} disabled={entryMethod !== "manual"} className="field-control disabled:bg-canvas-soft disabled:text-canvas-foreground/65" placeholder="Por confirmar" /></label>
              <label><span className="field-label">Horas semanales actuales</span><input type="number" min={0} max={80} step="0.5" value={profile.academicMetrics.weeklyHoursCurrent ?? ""} onChange={(event) => updateMetric("weeklyHoursCurrent", event.target.value)} disabled={entryMethod !== "manual"} className="field-control disabled:bg-canvas-soft disabled:text-canvas-foreground/65" placeholder="Por confirmar" /></label>
            </div>
            <p className="mt-3 text-xs leading-5 text-canvas-foreground/50">El promedio y los créditos del ciclo actual se calculan únicamente con los cursos que confirmes.</p>
          </section>
        )}

        {entryMethod === "ocr" && <div className="mt-5 page-enter"><OcrCourseImporter onImport={importCourses} /></div>}

        {entryMethod === "manual" && (
          <section className="mt-7 page-enter" aria-labelledby="courses-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="courses-title" className="text-xl font-bold text-canvas-foreground">Cursos registrados</h2>
                <p className="mt-1 text-sm text-canvas-foreground/60">Las notas usan la escala de 0 a 20.</p>
              </div>
              <button type="button" onClick={addCourse} className="secondary-button">
                <PlusIcon width={17} height={17} />
                Agregar curso
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {courses.length === 0 && (
                <button type="button" onClick={addCourse} className="empty-course-state">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary"><PlusIcon width={20} height={20} /></span>
                  <span>
                    <strong className="block text-base text-canvas-foreground">Añade tu primer curso</strong>
                    <span className="mt-1 block text-sm text-canvas-foreground/60">Nombre, créditos y nota del ciclo actual.</span>
                  </span>
                </button>
              )}

              {courses.map((course) => (
                <div key={course.id} className="course-row">
                  <label className="min-w-0 flex-1">
                    <span className="course-row__label">Curso</span>
                    <input
                      type="text"
                      value={course.name}
                      onChange={(event) => updateCourse(course.id, { name: event.target.value })}
                      placeholder="Nombre del curso"
                      className="field-control mt-1"
                    />
                  </label>
                  <label className="w-[112px]">
                    <span className="course-row__label">Créditos</span>
                    <input
                      type="number"
                      min={0}
                      value={course.credits}
                      onChange={(event) => updateCourse(course.id, { credits: Number(event.target.value) })}
                      className="field-control mt-1"
                    />
                  </label>
                  <label className="w-[112px]">
                    <span className="course-row__label">Nota</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={course.grade}
                      onChange={(event) => updateCourse(course.id, { grade: Number(event.target.value) })}
                      className="field-control mt-1"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    aria-label={`Eliminar ${course.name || "curso"}`}
                    className="mb-1 mt-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-canvas-foreground/40 transition hover:bg-status-unmet-soft hover:text-status-unmet"
                  >
                    <TrashIcon width={18} height={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {entryMethod === null && courses.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-canvas-foreground">{courses.length} cursos guardados</h2>
                <p className="mt-1 text-sm text-canvas-foreground/60">Elige “Ingresar manualmente” para revisarlos o usa OCR para importar otra captura.</p>
              </div>
              <button type="button" onClick={() => setEntryMethod("manual")} className="secondary-button">Revisar cursos</button>
            </div>
          </section>
        )}

        {setupError && <p role="alert" className="mt-6 rounded-xl bg-status-unmet-soft px-4 py-3 text-sm font-semibold text-status-unmet">{setupError}</p>}
        <section className="mt-8 grid gap-4 rounded-3xl bg-sidebar p-5 text-sidebar-foreground shadow-xl md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <p className="text-lg font-bold">Tu perfil ya puede empezar a trabajar por ti</p>
            <p className="mt-1 text-sm leading-6 text-sidebar-muted">
              {validCourses.length > 0
                ? `${validCourses.length} curso${validCourses.length === 1 ? "" : "s"} · promedio del ciclo ${cycleAverage || "por calcular"} · ${totalCredits} créditos`
                : "Puedes agregar cursos ahora o continuar con tu ciclo, promedio y créditos acumulados."}
            </p>
          </div>
          <button type="button" onClick={finishSetup} className="primary-button min-w-64">
            {profile.academicSetupComplete ? "Guardar cambios académicos" : "Continuar con preguntas clave"}
            <ArrowRightIcon width={18} height={18} />
          </button>
        </section>
      </div>
    </AppShell>
  );
}
