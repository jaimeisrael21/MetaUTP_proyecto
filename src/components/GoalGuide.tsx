"use client";

import { useState } from "react";
import type { StudentGoal, StudentProfile } from "@/data/types";
import { ArrowRightIcon, SparklesIcon } from "./icons";

const GOALS: { value: StudentGoal; label: string }[] = [
  { value: "scholarship", label: "Conseguir una beca" },
  { value: "study_abroad", label: "Estudiar en el extranjero" },
  { value: "employability", label: "Mejorar mi empleabilidad" },
  { value: "english", label: "Certificar mi inglés" },
  { value: "research", label: "Participar en investigación" },
  { value: "custom", label: "Tengo otra meta" },
];

interface GoalGuideResult {
  summary: string;
  priorityIds: string[];
  followUpQuestions: string[];
  nextAction: string;
  counts: {
    related: number;
    matches: number;
    needsData: number;
    close: number;
    notApplicable: number;
  };
  mode: "ai" | "rules";
}

interface GoalGuideProps {
  profile: StudentProfile;
  onUpdateProfile: (patch: Partial<StudentProfile>) => void;
  onPriorities: (ids: string[]) => void;
}

export function GoalGuide({ profile, onUpdateProfile, onPriorities }: GoalGuideProps) {
  const [note, setNote] = useState(profile.goalNote);
  const [result, setResult] = useState<GoalGuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function chooseGoal(goal: StudentGoal) {
    onUpdateProfile({ goal });
    setResult(null);
    onPriorities([]);
  }

  async function orientCatalog() {
    if (profile.goal === "undecided") {
      setError("Elige primero qué quieres lograr este ciclo.");
      return;
    }
    setLoading(true);
    setError("");
    onUpdateProfile({ goalNote: note.trim() });

    try {
      const response = await fetch("/api/ai/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            career: profile.career,
            cycle: profile.cycle,
            cumulativeGpa: profile.cumulativeGpa,
            approvedCredits: profile.approvedCredits,
            preferredCategories: profile.preferredCategories,
            facts: profile.facts,
            goal: profile.goal,
            goalNote: note.trim(),
          },
        }),
      });
      const data = (await response.json()) as GoalGuideResult | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "No se pudo orientar el catálogo.");
      }
      setResult(data);
      onPriorities(data.priorityIds);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo orientar el catálogo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="goal-guide" aria-labelledby="goal-guide-title">
      <div className="goal-guide__intro">
        <span className="goal-guide__icon"><SparklesIcon width={20} height={20} /></span>
        <div>
          <p className="eyebrow">Guía con IA</p>
          <h2 id="goal-guide-title" className="mt-1 text-xl font-bold text-canvas-foreground">
            ¿Qué quieres lograr este ciclo?
          </h2>
          <p className="mt-1 text-sm leading-6 text-canvas-foreground/65">
            Cuéntale a Meta qué buscas. La IA entiende tu meta; las reglas verificables deciden qué puede recomendarse.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Meta principal">
        {GOALS.map((goal) => (
          <button key={goal.value} type="button" aria-pressed={profile.goal === goal.value} onClick={() => chooseGoal(goal.value)} className={`choice-chip ${profile.goal === goal.value ? "choice-chip--active" : ""}`}>
            {goal.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label htmlFor="goal-note" className="sr-only">Detalle opcional de tu meta</label>
        <input
          id="goal-note"
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={420}
          placeholder="Opcional: por ejemplo, quiero una experiencia internacional de bajo costo"
          className="field-control mt-0"
        />
        <button type="button" onClick={orientCatalog} disabled={loading} className="primary-button min-w-52 disabled:cursor-wait disabled:opacity-60">
          <SparklesIcon width={16} height={16} />
          {loading ? "Meta está analizando…" : "Orientar mis oportunidades"}
        </button>
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl bg-status-unmet-soft px-4 py-3 text-sm font-semibold text-status-unmet">{error}</p>}

      {result && (
        <div className="goal-guide__result" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold text-canvas-foreground">Lectura de tu meta</p>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${result.mode === "ai" ? "bg-status-met-soft text-status-met" : "bg-status-pending-soft text-status-pending"}`}>
              {result.mode === "ai" ? "IA activa" : "Orden seguro por reglas"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-canvas-foreground/72">{result.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <span className="guide-stat"><strong>{result.counts.related}</strong> relacionadas</span>
            <span className="guide-stat"><strong>{result.counts.matches}</strong> coinciden</span>
            <span className="guide-stat"><strong>{result.counts.close}</strong> cercanas</span>
            <span className="guide-stat"><strong>{result.counts.needsData}</strong> requieren datos</span>
          </div>
          {result.followUpQuestions.length > 0 && (
            <div className="mt-4 rounded-xl bg-canvas-soft p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-canvas-foreground/50">Para afinar después</p>
              {result.followUpQuestions.map((question) => <p key={question} className="mt-2 text-sm font-semibold text-canvas-foreground/72">{question}</p>)}
            </div>
          )}
          <p className="mt-4 flex items-start gap-2 text-sm font-bold text-primary">
            <ArrowRightIcon className="mt-0.5 shrink-0" width={16} height={16} />
            {result.nextAction}
          </p>
        </div>
      )}
    </section>
  );
}
