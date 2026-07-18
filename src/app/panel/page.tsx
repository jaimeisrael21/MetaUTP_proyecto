"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useProfile, useSession } from "@/lib/store";
import { weightedAverage } from "@/lib/matching";
import type { Course } from "@/data/types";
import { OcrCourseImporter } from "@/components/OcrCourseImporter";
import { PencilIcon, PlusIcon, ScanTextIcon, SlidersIcon, TrashIcon } from "@/components/icons";

function newCourse(): Course {
  return { id: crypto.randomUUID(), name: "", credits: 3, grade: 14 };
}

export default function PanelPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [entryMethod, setEntryMethod] = useState<"manual" | "ocr">("manual");
  const courses = profile.courses;

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/bienvenida");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  if (!profileHydrated || !profile.onboarded) return null;

  const cycleAverage = weightedAverage(courses.filter((c) => c.name.trim()));
  const totalCredits = courses.reduce((s, c) => s + (c.credits || 0), 0);

  function persist(next: Course[]) {
    update({ courses: next });
  }

  function updateCourse(id: string, patch: Partial<Course>) {
    persist(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCourse(id: string) {
    persist(courses.filter((c) => c.id !== id));
  }

  function addCourse() {
    persist([...courses, newCourse()]);
  }

  function importCourses(imported: Course[]) {
    const existing = courses.filter((course) => course.name.trim());
    const existingNames = new Set(existing.map((course) => course.name.trim().toLocaleLowerCase("es")));
    const uniqueImported = imported.filter((course) => {
      const key = course.name.trim().toLocaleLowerCase("es");
      if (!key || existingNames.has(key)) return false;
      existingNames.add(key);
      return true;
    });
    persist([...existing, ...uniqueImported]);
    setEntryMethod("manual");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-8 md:px-10">
        <p className="text-sm font-semibold text-primary">Panel del ciclo</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground md:text-3xl">
          Tus cursos del {profile.cycle}° ciclo
        </h1>
        <p className="mt-2 max-w-xl text-sm text-canvas-foreground/60">
          Elige si quieres escribir tus cursos o partir de una captura del horario. En
          ambos casos podrás revisar y corregir la información antes de usarla.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2" role="group" aria-label="Método para registrar cursos">
          <button
            type="button"
            aria-pressed={entryMethod === "manual"}
            onClick={() => setEntryMethod("manual")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
              entryMethod === "manual"
                ? "border-primary bg-primary-soft"
                : "border-border bg-white hover:border-border-strong"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${entryMethod === "manual" ? "bg-primary text-white" : "bg-canvas-soft text-canvas-foreground/60"}`}>
              <PencilIcon width={18} height={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-canvas-foreground">Ingresar manualmente</span>
              <span className="mt-1 block text-xs leading-relaxed text-canvas-foreground/60">
                Escribe nombres, créditos y notas con control total.
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={entryMethod === "ocr"}
            onClick={() => setEntryMethod("ocr")}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
              entryMethod === "ocr"
                ? "border-primary bg-primary-soft"
                : "border-border bg-white hover:border-border-strong"
            }`}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${entryMethod === "ocr" ? "bg-primary text-white" : "bg-canvas-soft text-canvas-foreground/60"}`}>
              <ScanTextIcon width={18} height={18} />
            </span>
            <span>
              <span className="block text-sm font-bold text-canvas-foreground">Escanear con OCR</span>
              <span className="mt-1 block text-xs leading-relaxed text-canvas-foreground/60">
                Lee una captura local y propone cursos para revisar.
              </span>
            </span>
          </button>
        </div>

        {entryMethod === "ocr" && (
          <div className="mt-5">
            <OcrCourseImporter onImport={importCourses} />
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-canvas-foreground/50">Promedio del ciclo</p>
            <p className="mt-1 text-2xl font-bold text-canvas-foreground">
              {cycleAverage || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-canvas-foreground/50">Créditos este ciclo</p>
            <p className="mt-1 text-2xl font-bold text-canvas-foreground">{totalCredits}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-4">
            <p className="text-xs font-medium text-canvas-foreground/50">Promedio acumulado</p>
            <p className="mt-1 text-2xl font-bold text-canvas-foreground">
              {profile.cumulativeGpa}
            </p>
          </div>
        </div>

        {entryMethod === "manual" && (
          <>
            <div className="mt-8 space-y-3">
              {courses.length === 0 && (
                <p className="rounded-xl border border-dashed border-border-strong bg-white px-4 py-5 text-center text-sm text-canvas-foreground/60">
                  Aún no registraste cursos. Agrégalos uno por uno o cambia a “Escanear con OCR”.
                </p>
              )}
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4"
                >
                  <input
                    type="text"
                    value={course.name}
                    aria-label="Nombre del curso"
                    onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                    placeholder="Nombre del curso"
                    className="min-w-[10rem] flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <label className="flex items-center gap-2 text-xs text-canvas-foreground/50">
                    Créditos
                    <input
                      type="number"
                      min={0}
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, { credits: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-border-strong bg-white px-2 py-2 text-sm text-canvas-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-canvas-foreground/50">
                    Nota
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, { grade: Number(e.target.value) })}
                      className="w-16 rounded-lg border border-border-strong bg-white px-2 py-2 text-sm text-canvas-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    aria-label={`Eliminar ${course.name || "curso"}`}
                    className="ml-auto text-canvas-foreground/40 hover:text-status-unmet"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCourse}
              className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-2.5 text-sm font-medium text-canvas-foreground/70 hover:border-primary hover:text-primary"
            >
              <PlusIcon width={16} height={16} />
              Agregar curso
            </button>
          </>
        )}

        <Link
          href="/simulador"
          className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-sidebar px-5 py-4 text-sidebar-foreground transition-opacity hover:opacity-90"
        >
          <span className="flex items-center gap-3 text-sm font-medium">
            <SlidersIcon width={18} height={18} />
            Simula qué necesitas para llegar a una oportunidad concreta
          </span>
          <span className="text-sm font-semibold text-primary">Ir al simulador →</span>
        </Link>
      </div>
    </AppShell>
  );
}
