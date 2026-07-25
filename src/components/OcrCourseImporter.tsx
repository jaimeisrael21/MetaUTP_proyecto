"use client";

import { useState } from "react";
import type { AcademicMetrics, AcademicRank, Course, TriState } from "@/data/types";
import { AlertIcon, CheckCircleIcon, ScanTextIcon, TrashIcon, UploadIcon } from "./icons";

interface OcrCourseImporterProps {
  onImport: (courses: Course[], academic: OcrAcademicImport) => void;
}

export interface OcrAcademicImport {
  metrics: Partial<AcademicMetrics>;
  cumulativeGpa?: number;
  approvedCredits?: number;
  academicRank?: AcademicRank;
  englishIVPassed?: TriState;
  documentType: "schedule" | "grades" | "academic_summary";
}

type OcrPhase = "idle" | "processing" | "review" | "error";

interface OcrBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface OcrLayoutLine {
  text: string;
  bbox: OcrBox;
  words: Array<{ text: string; bbox: OcrBox }>;
}

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
      if (/^(?:metautp|periodo acad[eé]mico|periodo anterior|estudiante:|curso\s+cr[eé]ditos|cr[eé]ditos del|cr[eé]ditos aprobados|horas semanales|promedio|datos de prueba)/i.test(line)) return false;
      if (IGNORED_LABELS.has(key)) return false;
      if (/^(?:\d[\d\s./-]*)$/.test(line)) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

function gradeFromOcrToken(value: string | undefined) {
  if (!value) return null;
  const cleaned = value
    .replace(/[|Il]/g, "1")
    .replace(/[Oo]/g, "0")
    .replace(/[Ss]/g, "5")
    .replace(/[.,]$/, "");
  if (!/^\d{1,2}$/.test(cleaned)) return null;
  const grade = Number(cleaned);
  return Number.isInteger(grade) && grade >= 0 && grade <= 20 ? grade : null;
}

function candidatesFromText(text: string): Course[] {
  const plain = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hasWeeklyHoursColumn = /curso\s+creditos\s+horas(?:\s+semanales)?\s+(?:nota|calificacion)/i.test(plain);
  const hasGradeColumn = /curso\s+creditos(?:\s+horas(?:\s+semanales)?)?\s+(?:nota|calificacion)/i.test(plain);
  const tableRows = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\b1V\b/g, "IV").trim())
    .flatMap<Course>((line) => {
      const match = line.match(
        /^(.+?)\s+(\d{1,2}(?:[.,]\d{1,2})?)\s+(\d{1,2}(?:[.,]\d{1,2})?)(?:\s+([^\s]{1,4}))?$/
      );
      if (!match || !/[a-záéíóúñ]{3}/i.test(match[1]) || /^(?:curso|promedio|créditos|horas|estudiante|periodo)/i.test(match[1])) return [];
      const credits = Number(match[2].replace(",", "."));
      const secondValue = Number(match[3].replace(",", "."));
      const hasThirdToken = match[4] !== undefined;
      const rowIncludesWeeklyHours = hasWeeklyHoursColumn || hasThirdToken;
      const detectedGrade = rowIncludesWeeklyHours
        ? gradeFromOcrToken(match[4])
        : hasGradeColumn
          ? gradeFromOcrToken(match[3])
          : null;
      const detectedWeeklyHours = rowIncludesWeeklyHours ? secondValue : 0;
      return [{
        id: crypto.randomUUID(),
        name: match[1].trim(),
        credits,
        grade: detectedGrade,
        period: "current" as const,
        weeklyHours: detectedWeeklyHours >= 0 && detectedWeeklyHours <= 80 ? detectedWeeklyHours : 0,
        source: "ocr" as const,
      }];
    });
  if (tableRows.length > 0) return tableRows.slice(0, 10);
  return extractCandidateNames(text).map((name) => ({
    id: crypto.randomUUID(),
    name,
    credits: 0,
    grade: null,
    period: "current",
    weeklyHours: 0,
    source: "ocr",
  }));
}

function layoutLinesFromBlocks(
  blocks: Array<{
    paragraphs: Array<{
      lines: Array<{
        text: string;
        bbox: OcrBox;
        words: Array<{ text: string; bbox: OcrBox }>;
      }>;
    }>;
  }> | null
): OcrLayoutLine[] {
  return (blocks ?? []).flatMap((block) =>
    block.paragraphs.flatMap((paragraph) =>
      paragraph.lines.map((line) => ({ text: line.text, bbox: line.bbox, words: line.words }))
    )
  );
}

async function recoverMissingGrades(
  file: File,
  worker: Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>>,
  blocks: Parameters<typeof layoutLinesFromBlocks>[0],
  courses: Course[],
  segmentationMode: import("tesseract.js").PSM
) {
  const missing = courses.filter((course) => course.grade === null);
  if (missing.length === 0) return courses;

  const lines = layoutLinesFromBlocks(blocks);
  const header = lines.find((line) => {
    const key = normalized(line.text);
    return key.includes("curso") && key.includes("credito") && (key.includes("nota") || key.includes("calificacion"));
  });
  const gradeHeader = header?.words.find((word) => /^(?:nota|calificacion)$/i.test(normalized(word.text)));
  if (!header || !gradeHeader) return courses;

  await worker.setParameters({
    tessedit_pageseg_mode: segmentationMode,
    tessedit_char_whitelist: "0123456789",
  });

  const recovered = [...courses];
  for (const course of missing) {
    const courseKey = normalized(course.name);
    const row = lines.find((line) => {
      const lineKey = normalized(line.text);
      return line.bbox.y0 > header.bbox.y1 && (lineKey.startsWith(courseKey) || lineKey.includes(courseKey));
    });
    if (!row) continue;
    const detectedGradeWord = row.words.find(
      (word) => word.bbox.x0 >= gradeHeader.bbox.x0 - 30
    );
    const gradeBox = detectedGradeWord?.bbox ?? gradeHeader.bbox;
    const left = Math.max(0, gradeBox.x0 - 25);
    const top = Math.max(0, row.bbox.y0 - 15);
    const width = Math.max(70, gradeBox.x1 - left + 35);
    const height = Math.max(44, row.bbox.y1 - row.bbox.y0 + 30);
    const gradeResult = await worker.recognize(
      file,
      { rectangle: { left, top, width, height } },
      { text: true }
    );
    const grade = gradeFromOcrToken(gradeResult.data.text.trim());
    if (grade === null) continue;
    const index = recovered.findIndex((candidate) => candidate.id === course.id);
    if (index >= 0) recovered[index] = { ...recovered[index], grade };
  }
  return recovered;
}

function textWithRecoveredGrades(text: string, parsed: Course[], recovered: Course[]) {
  const repaired = new Map(
    parsed.flatMap((course) => {
      const next = recovered.find((candidate) => candidate.id === course.id);
      return course.grade === null && next?.grade !== null && next?.grade !== undefined
        ? [[normalized(course.name), next.grade] as const]
        : [];
    })
  );
  if (repaired.size === 0) return text;
  return text
    .split(/\r?\n/)
    .map((line) => {
      const key = normalized(line);
      const course = [...repaired.entries()].find(([name]) => key.startsWith(name));
      if (!course) return line;
      return line.replace(/\s+[^\s]+\s*$/, ` ${course[1]}`);
    })
    .join("\n");
}

function detectedNumber(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1].replace(",", "."));
      if (Number.isFinite(value)) return value;
    }
  }
  return undefined;
}

function extractAcademicImport(text: string): OcrAcademicImport {
  const plain = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lastPeriodGpa = detectedNumber(plain, [/promedio(?: ponderado)?(?: del)? periodo(?: anterior)?\s*[:\-]?\s*(\d{1,2}(?:[.,]\d{1,2})?)/i]);
  const cumulativeGpa = detectedNumber(plain, [/promedio(?: ponderado)? acumulado\s*[:\-]?\s*(\d{1,2}(?:[.,]\d{1,2})?)/i]);
  const approvedCredits = detectedNumber(plain, [/creditos aprobados(?: acumulados)?\s*[:\-]?\s*(\d{1,3}(?:[.,]\d)?)/i]);
  const currentPeriodCredits = detectedNumber(plain, [/creditos(?: del)? periodo actual\s*[:\-]?\s*(\d{1,2}(?:[.,]\d)?)/i]);
  const weeklyHoursCurrent = detectedNumber(plain, [/horas semanales(?: actuales)?\s*[:\-]?\s*(\d{1,2}(?:[.,]\d)?)/i]);
  const lower = plain.toLowerCase();
  const academicRank: AcademicRank | undefined = lower.includes("decimo superior") ? "top_tenth" : lower.includes("quinto superior") ? "top_fifth" : lower.includes("tercio superior") ? "top_third" : undefined;
  const englishIVPassed: TriState | undefined = /ingles (?:iv|1v)\s*(?:aprobado|convalidado)/i.test(plain) ? "yes" : undefined;
  return {
    metrics: {
      ...(lastPeriodGpa !== undefined ? { lastPeriodGpa } : {}),
      ...(currentPeriodCredits !== undefined ? { currentPeriodCredits } : {}),
      ...(weeklyHoursCurrent !== undefined ? { weeklyHoursCurrent } : {}),
    },
    cumulativeGpa,
    approvedCredits,
    academicRank,
    englishIVPassed,
    documentType: "schedule",
  };
}

export function OcrCourseImporter({ onImport }: OcrCourseImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<OcrPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [rawText, setRawText] = useState("");
  const [candidates, setCandidates] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [academicImport, setAcademicImport] = useState<OcrAcademicImport>(() => extractAcademicImport(""));

  const progressLabel = `${Math.round(progress * 100)}%`;

  function chooseFile(nextFile: File | null) {
    setError("");
    setRawText("");
    setCandidates([]);
    setAcademicImport(extractAcademicImport(""));
    setProgress(0);

    if (!nextFile) {
      setFile(null);
      setPhase("idle");
      return;
    }
    if (!nextFile.type.startsWith("image/")) {
      setFile(null);
      setPhase("error");
      setError("Por ahora el OCR acepta imágenes JPG, PNG o WEBP. Para un PDF, toma una captura de la página.");
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
      const { createWorker, PSM } = await import("tesseract.js");
      worker = await createWorker("spa", 1, {
        logger: (message) => {
          if (typeof message.progress === "number") setProgress(message.progress);
          if (message.status) setStatusText(message.status);
        },
      });
      const result = await worker.recognize(file, {}, { text: true, blocks: true });
      const detectedText = result.data.text.trim();
      const parsedCourses = candidatesFromText(detectedText);
      setStatusText("Verificando la columna de notas…");
      const detectedCourses = await recoverMissingGrades(
        file,
        worker,
        result.data.blocks,
        parsedCourses,
        PSM.SINGLE_LINE
      );
      const detectedAcademic = extractAcademicImport(detectedText);

      setRawText(textWithRecoveredGrades(detectedText, parsedCourses, detectedCourses));
      setCandidates(detectedCourses);
      setAcademicImport(detectedAcademic);
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
    setAcademicImport(extractAcademicImport(rawText));
  }

  function updateCandidate(id: string, patch: Partial<Course>) {
    setCandidates((current) => current.map((course) => (course.id === id ? { ...course, ...patch } : course)));
  }

  function removeCandidate(id: string) {
    setCandidates((current) => current.filter((course) => course.id !== id));
  }

  function confirmImport() {
    const validCourses = candidates.filter((course) => course.name.trim());
    const invalidCourse = validCourses.find(
      (course) =>
        !Number.isFinite(course.credits) ||
        course.credits <= 0 ||
        course.credits > 30 ||
        course.grade === null ||
        !Number.isInteger(course.grade) ||
        course.grade < 0 ||
        course.grade > 20
    );
    if (invalidCourse) {
      setError(
        `${invalidCourse.name}: confirma los créditos y una nota entera entre 0 y 20 antes de importar.`
      );
      return;
    }
    const hasAcademicData = Object.keys(academicImport.metrics).length > 0 || academicImport.cumulativeGpa !== undefined || academicImport.approvedCredits !== undefined || academicImport.academicRank !== undefined || academicImport.englishIVPassed !== undefined;
    if (validCourses.length === 0 && !hasAcademicData) {
      setError("No encontramos cursos ni métricas académicas. Revisa el texto antes de importarlo.");
      return;
    }
    onImport(validCourses, academicImport);
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
            MetaUTP lee la imagen en tu navegador, propone cursos, créditos y notas, y te
            pide revisar todo antes de guardar. La captura no se sube a un servidor.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-border-strong bg-canvas-soft p-4">
        <p className="mb-3 text-xs leading-5 text-canvas-foreground/60">
          Sube una sola ficha consolidada que muestre tus cursos actuales, créditos, notas y resumen académico.
        </p>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-canvas-foreground shadow-sm transition-colors hover:text-primary focus-within:ring-2 focus-within:ring-primary/30">
          <UploadIcon width={17} height={17} />
          {file ? "Cambiar captura" : "Seleccionar imagen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
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

          <div className="rounded-xl border border-status-info/20 bg-status-info-soft p-4">
            <h3 className="text-sm font-bold text-status-info">Datos académicos propuestos</h3>
            <p className="mt-1 text-xs leading-5 text-canvas-foreground/60">Se incorporarán solo después de pulsar el botón de confirmación. Puedes corregirlos luego en el resumen académico.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {academicImport.metrics.lastPeriodGpa !== undefined && <span className="rounded-full bg-white px-3 py-1.5">Periodo anterior: {academicImport.metrics.lastPeriodGpa}</span>}
              {academicImport.cumulativeGpa !== undefined && <span className="rounded-full bg-white px-3 py-1.5">Acumulado: {academicImport.cumulativeGpa}</span>}
              {academicImport.approvedCredits !== undefined && <span className="rounded-full bg-white px-3 py-1.5">Créditos aprobados: {academicImport.approvedCredits}</span>}
              {academicImport.metrics.weeklyHoursCurrent !== undefined && <span className="rounded-full bg-white px-3 py-1.5">Horas semanales: {academicImport.metrics.weeklyHoursCurrent}</span>}
              {academicImport.academicRank && <span className="rounded-full bg-white px-3 py-1.5">Posición académica detectada</span>}
              {Object.keys(academicImport.metrics).length === 0 && academicImport.cumulativeGpa === undefined && academicImport.approvedCredits === undefined && !academicImport.academicRank && <span className="text-canvas-foreground/55">No se detectaron métricas en esta captura.</span>}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-canvas-foreground">Cursos propuestos</h3>
                <p className="mt-0.5 text-xs text-canvas-foreground/50">
                  Revisa nombres, créditos y notas. Si un dato no se reconoce, quedará pendiente hasta que lo confirmes.
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
                      max={30}
                      step={1}
                      inputMode="numeric"
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
                      step={1}
                      inputMode="numeric"
                      value={course.grade ?? ""}
                      placeholder="—"
                      onChange={(event) => updateCandidate(course.id, { grade: event.target.value === "" ? null : Number(event.target.value) })}
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
