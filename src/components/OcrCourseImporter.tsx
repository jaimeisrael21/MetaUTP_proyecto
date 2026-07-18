"use client";

import { useState } from "react";
import type { Course } from "@/data/types";
import { AlertIcon, CheckCircleIcon, ScanTextIcon, TrashIcon, UploadIcon } from "./icons";

interface OcrCourseImporterProps {
  onImport: (courses: Course[]) => void;
}

type OcrPhase = "idle" | "processing" | "review" | "error";

const IGNORED_LABELS = new Set([
  "aula",
  "campus",
  "ciclo",
  "curso",
  "docente",
  "fin",
  "hora",
  "horario",
  "inicio",
  "modalidad",
  "seccion",
  "turno",
]);

function normalized(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function extractCandidateNames(text: string): string[] {
  const seen = new Set<string>();

  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\b(?:lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/gi, " ")
        .replace(/\b\d{1,2}:\d{2}\s*(?:a\.?\s*m\.?|p\.?\s*m\.?)?\b/gi, " ")
        .replace(/\b1V\b/g, "IV")
        .replace(/[|•·]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => {
      const key = normalized(line);
      if (line.length < 4 || line.length > 80) return false;
      if (!/[a-záéíóúñ]{3}/i.test(line)) return false;
      if (/https?:\/\/|@/.test(line)) return false;
      if (/\b(?:horario|r[eé]cord|malla)\b/i.test(line)) return false;
      if (IGNORED_LABELS.has(key)) return false;
      if (/^(?:\d[\d\s./-]*)$/.test(line)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function candidatesFromText(text: string): Course[] {
  return extractCandidateNames(text).map((name) => ({
    id: crypto.randomUUID(),
    name,
    credits: 0,
    grade: 0,
  }));
}

export function OcrCourseImporter({ onImport }: OcrCourseImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<OcrPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [rawText, setRawText] = useState("");
  const [candidates, setCandidates] = useState<Course[]>([]);
  const [error, setError] = useState("");

  const progressLabel = `${Math.round(progress * 100)}%`;

  function chooseFile(nextFile: File | null) {
    setError("");
    setRawText("");
    setCandidates([]);
    setProgress(0);

    if (!nextFile) {
      setFile(null);
      setPhase("idle");
      return;
    }
    if (!nextFile.type.startsWith("image/")) {
      setFile(null);
      setPhase("error");
      setError("Por ahora el OCR acepta capturas JPG, PNG o WEBP. Para un PDF, toma una captura de la página del horario.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setPhase("error");
      setError("La imagen supera 10 MB. Usa una captura más ligera para evitar que el navegador se quede sin memoria.");
      return;
    }

    setFile(nextFile);
    setPhase("idle");
  }

  async function analyzeImage() {
    if (!file || phase === "processing") return;

    setPhase("processing");
    setError("");
    setProgress(0);
    setStatusText("Preparando el lector OCR…");

    let worker: Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>> | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker("spa", 1, {
        logger: (message) => {
          if (typeof message.progress === "number") setProgress(message.progress);
          if (message.status) setStatusText(message.status);
        },
      });
      const result = await worker.recognize(file);
      const detectedText = result.data.text.trim();
      const detectedCourses = candidatesFromText(detectedText);

      setRawText(detectedText);
      setCandidates(detectedCourses);
      setProgress(1);
      setPhase("review");
      setStatusText("Lectura terminada");
    } catch {
      setPhase("error");
      setError(
        "No pudimos leer esta captura. Revisa tu conexión —la primera lectura descarga el modelo de idioma— o continúa con el registro manual."
      );
    } finally {
      await worker?.terminate();
    }
  }

  function detectAgain() {
    setCandidates(candidatesFromText(rawText));
  }

  function updateCandidate(id: string, patch: Partial<Course>) {
    setCandidates((current) => current.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function removeCandidate(id: string) {
    setCandidates((current) => current.filter((course) => course.id !== id));
  }

  function confirmImport() {
    const validCourses = candidates.filter((course) => course.name.trim());
    if (validCourses.length === 0) {
      setError("Revisa el texto detectado y deja al menos un curso antes de importarlo.");
      return;
    }
    onImport(validCourses);
    setFile(null);
    setRawText("");
    setCandidates([]);
    setProgress(0);
    setPhase("idle");
    setStatusText("");
    setError("");
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5" aria-labelledby="ocr-title">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ScanTextIcon width={20} height={20} />
        </span>
        <div>
          <h2 id="ocr-title" className="font-bold text-canvas-foreground">
            Importar una captura con OCR
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-canvas-foreground/60">
            MetaUTP lee la imagen en tu navegador, propone nombres de cursos y te pide
            revisar todo antes de guardar. La captura no se sube a un servidor.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-border-strong bg-canvas-soft p-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-canvas-foreground shadow-sm transition-colors hover:text-primary focus-within:ring-2 focus-within:ring-primary/30">
          <UploadIcon width={17} height={17} />
          {file ? "Cambiar captura" : "Seleccionar captura del horario"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {file && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-canvas-foreground">{file.name}</p>
              <p className="text-xs text-canvas-foreground/50">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button
              type="button"
              onClick={analyzeImage}
              disabled={phase === "processing"}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
              {phase === "processing" ? "Analizando…" : "Analizar imagen"}
            </button>
          </div>
        )}
      </div>

      {phase === "processing" && (
        <div className="mt-4" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-xs text-canvas-foreground/60">
            <span>{statusText}</span>
            <span className="font-semibold text-primary">{progressLabel}</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-soft"
            role="progressbar"
            aria-label="Progreso del análisis OCR"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: progressLabel }} />
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="mt-5 space-y-5">
          <div className="flex items-start gap-2 rounded-xl bg-status-met-soft px-4 py-3 text-status-met">
            <CheckCircleIcon width={17} height={17} className="mt-0.5 shrink-0" />
            <p className="text-xs font-medium">
              Lectura terminada. El OCR puede confundirse con docentes, aulas o encabezados: revisa los resultados antes de incorporarlos.
            </p>
          </div>

          <div>
            <label htmlFor="ocr-text" className="text-sm font-semibold text-canvas-foreground">
              Texto reconocido
            </label>
            <textarea
              id="ocr-text"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-xl border border-border-strong bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={detectAgain}
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Volver a detectar cursos desde este texto
            </button>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-canvas-foreground">Cursos propuestos</h3>
                <p className="mt-0.5 text-xs text-canvas-foreground/50">
                  Corrige nombres y completa créditos y notas. Empiezan en 0 para no presentarlos como si el OCR los hubiera confirmado.
                </p>
              </div>
              <span className="text-xs font-semibold text-primary">{candidates.length} detectados</span>
            </div>

            <div className="mt-3 space-y-3">
              {candidates.map((course) => (
                <div key={course.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-canvas-soft p-3">
                  <input
                    type="text"
                    value={course.name}
                    aria-label="Nombre del curso detectado"
                    onChange={(event) => updateCandidate(course.id, { name: event.target.value })}
                    className="min-w-[12rem] flex-1 rounded-lg border border-border-strong bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <label className="flex items-center gap-1 text-xs text-canvas-foreground/50">
                    Créditos
                    <input
                      type="number"
                      min={0}
                      value={course.credits}
                      onChange={(event) => updateCandidate(course.id, { credits: Number(event.target.value) })}
                      className="w-14 rounded-lg border border-border-strong bg-white px-2 py-2 text-sm text-canvas-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-canvas-foreground/50">
                    Nota
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={course.grade}
                      onChange={(event) => updateCandidate(course.id, { grade: Number(event.target.value) })}
                      className="w-14 rounded-lg border border-border-strong bg-white px-2 py-2 text-sm text-canvas-foreground outline-none focus:border-primary"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeCandidate(course.id)}
                    aria-label={`Descartar ${course.name}`}
                    className="text-canvas-foreground/40 hover:text-status-unmet"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
              ))}
            </div>

            {candidates.length === 0 && (
              <p className="mt-3 rounded-xl bg-canvas-soft px-4 py-3 text-sm text-canvas-foreground/60">
                No encontramos nombres claros. Corrige el texto reconocido y vuelve a detectar, o usa la carga manual.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={confirmImport}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Agregar cursos revisados al panel
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-status-unmet-soft px-4 py-3 text-status-unmet" role="alert">
          <AlertIcon width={16} height={16} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </section>
  );
}
