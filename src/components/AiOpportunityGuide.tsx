"use client";

import { useEffect, useMemo, useState } from "react";
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
  const cacheKey = useMemo(
    () =>
      `metautp:ai:${opportunityId}:${profile.cycle}:${profile.cumulativeGpa}:${profile.approvedCredits}`,
    [opportunityId, profile.cycle, profile.cumulativeGpa, profile.approvedCredits]
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const cached = window.sessionStorage.getItem(cacheKey);
        if (!cached) return;
        const parsed = JSON.parse(cached) as GuideResult;
        if (parsed.mode === "ai" && Array.isArray(parsed.nextSteps)) setResult(parsed);
      } catch {
        // Una caché inválida no interrumpe la explicación en vivo.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [cacheKey]);

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
      if (data.mode === "ai") window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo generar la explicación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-primary/25 bg-primary-soft p-5 shadow-[0_16px_44px_rgba(197,31,70,0.08)] md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3 text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_20px_rgba(197,31,70,0.2)]">
              <SparklesIcon width={18} height={18} />
            </span>
            <h2 className="text-lg font-bold">Explicación personalizada con IA</h2>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-6 text-canvas-foreground/68">
            Convierte tus resultados en una explicación clara y próximos pasos concretos.
            Los requisitos numéricos se calculan antes con reglas verificables.
          </p>
        </div>
        <button
          type="button"
          onClick={explain}
          disabled={loading}
          className="primary-button shrink-0 disabled:cursor-wait disabled:opacity-60"
        >
          <SparklesIcon width={16} height={16} />
          {loading ? "Analizando…" : result ? "Actualizar explicación" : "Explicarme esto"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-status-unmet-soft px-4 py-3 text-sm font-semibold text-status-unmet">{error}</p>}

      {result && (
        <div className="mt-5 rounded-2xl border border-white/80 bg-white p-5 shadow-sm" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-base font-bold text-canvas-foreground">Qué significa para ti</p>
            <span className={`rounded-full px-3 py-1.5 text-[13px] font-bold ${result.mode === "ai" ? "bg-status-met-soft text-status-met" : "bg-status-pending-soft text-status-pending"}`}>
              {result.mode === "ai" ? "IA de apoyo" : "Respuesta segura por reglas"}
            </span>
          </div>
          <p className="mt-3 text-base leading-7 text-canvas-foreground/78">{result.summary}</p>
          <ol className="mt-4 space-y-3">
            {result.nextSteps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex gap-3 text-sm leading-6 text-canvas-foreground/72">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sidebar text-xs font-bold text-sidebar-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-border pt-4 text-[13px] leading-5 text-canvas-foreground/55">
            {result.caveat}
          </p>
        </div>
      )}
    </section>
  );
}
