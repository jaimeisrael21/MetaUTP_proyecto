"use client";

import { useState } from "react";
import type { StudentProfile } from "@/data/types";
import { SparklesIcon } from "./icons";

interface GuideResult {
  summary: string;
  nextSteps: string[];
  caveat: string;
  mode: "ai" | "rules";
}

export function AiOpportunityGuide({
  opportunityId,
  profile,
}: {
  opportunityId: string;
  profile: Pick<StudentProfile, "cycle" | "cumulativeGpa" | "approvedCredits">;
}) {
  const [result, setResult] = useState<GuideResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explain() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, profile }),
      });
      const data = (await response.json()) as GuideResult | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "No se pudo generar la explicación.");
      }
      setResult(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo generar la explicación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <SparklesIcon width={18} height={18} />
            <h2 className="text-sm font-bold">Explicación personalizada</h2>
          </div>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-canvas-foreground/65">
            La IA traduce el resultado a lenguaje sencillo. El cumplimiento fue calculado
            antes por reglas verificables y no puede ser cambiado por el modelo.
          </p>
        </div>
        <button
          type="button"
          onClick={explain}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:cursor-wait disabled:opacity-60"
        >
          <SparklesIcon width={16} height={16} />
          {loading ? "Analizando…" : result ? "Actualizar explicación" : "Explicarme esto"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-status-unmet">{error}</p>}

      {result && (
        <div className="mt-5 rounded-xl bg-white p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-canvas-foreground">Qué significa para ti</p>
            <span className="rounded-full bg-canvas-soft px-2.5 py-1 text-[11px] font-semibold text-canvas-foreground/60">
              {result.mode === "ai" ? "IA de apoyo" : "Respuesta segura por reglas"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-canvas-foreground/75">{result.summary}</p>
          <ol className="mt-3 space-y-2">
            {result.nextSteps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-2 text-sm text-canvas-foreground/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar text-[11px] font-bold text-sidebar-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-canvas-foreground/50">
            {result.caveat}
          </p>
        </div>
      )}
    </section>
  );
}
