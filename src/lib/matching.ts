// Lógica pura de cruce entre el perfil del estudiante y los requisitos reales
// de cada oportunidad. Cero llamadas de red, cero datos inventados: todo se
// calcula a partir de lo que el propio alumno ingresó y de los umbrales
// reales guardados en data/opportunities.ts.

import type { Opportunity, Requirement, StudentProfile } from "@/data/types";

export type RequirementStatus = "met" | "close" | "unmet" | "pending";

export interface RequirementEvaluation {
  requirement: Requirement;
  status: RequirementStatus;
  detail: string;
}

export type WindowStatus = "active" | "upcoming" | "closed" | "ongoing";

export interface WindowInfo {
  status: WindowStatus;
  daysUntilStart?: number;
  daysUntilEnd?: number;
  label: string;
}

const MARGIN: Record<string, number> = {
  numeric_gpa: 0.5,
  numeric_credits: 6,
  numeric_cycle: 1,
};

function compare(value: number, comparator: string, threshold: number): boolean {
  switch (comparator) {
    case ">":
      return value > threshold;
    case ">=":
      return value >= threshold;
    case "<":
      return value < threshold;
    case "<=":
      return value <= threshold;
    case "==":
      return value === threshold;
    default:
      return value >= threshold;
  }
}

function profileValueFor(type: string, profile: StudentProfile): number | null {
  if (type === "numeric_gpa") return profile.cumulativeGpa;
  if (type === "numeric_credits") return profile.approvedCredits;
  if (type === "numeric_cycle") return profile.cycle;
  return null;
}

export function evaluateRequirement(
  req: Requirement,
  profile: StudentProfile
): RequirementEvaluation {
  const isNumeric =
    req.type === "numeric_gpa" || req.type === "numeric_credits" || req.type === "numeric_cycle";

  if (isNumeric && req.threshold !== undefined) {
    const value = profileValueFor(req.type, profile);
    const comparator = req.comparator ?? ">=";
    if (value === null) {
      return { requirement: req, status: "pending", detail: req.description };
    }
    const met = compare(value, comparator, req.threshold);
    if (met) {
      return {
        requirement: req,
        status: "met",
        detail: `Cumples este requisito: tienes ${value}, se necesita ${comparator} ${req.threshold}.`,
      };
    }
    const gap = req.threshold - value;
    const margin = MARGIN[req.type] ?? 1;
    if (comparator.startsWith(">") && gap > 0 && gap <= margin) {
      return {
        requirement: req,
        status: "close",
        detail: `Estás cerca: te falta${req.type === "numeric_gpa" ? "n" : ""} ${gap.toFixed(
          req.type === "numeric_gpa" ? 1 : 0
        )} para llegar a ${req.threshold}.`,
      };
    }
    return {
      requirement: req,
      status: "unmet",
      detail: `Aún no cumples: tienes ${value}, se necesita ${comparator} ${req.threshold}.`,
    };
  }

  // boolean / non_verifiable: la app no puede confirmarlo con los datos que tiene.
  return {
    requirement: req,
    status: "pending",
    detail: req.nonVerifiableNote ?? req.description,
  };
}

export interface OpportunityEvaluation {
  evaluations: RequirementEvaluation[];
  percent: number;
  metCount: number;
  totalCount: number;
  dominantStatus: RequirementStatus;
  window: WindowInfo;
}

export function evaluateOpportunity(
  opportunity: Opportunity,
  profile: StudentProfile
): OpportunityEvaluation {
  const evaluations = opportunity.requirements.map((r) => evaluateRequirement(r, profile));
  const metCount = evaluations.filter((e) => e.status === "met").length;
  const closeCount = evaluations.filter((e) => e.status === "close").length;
  const unmetCount = evaluations.filter((e) => e.status === "unmet").length;
  const total = evaluations.length;
  const percent =
    total === 0 ? 100 : Math.round(((metCount + closeCount * 0.5) / total) * 100);

  let dominantStatus: RequirementStatus = "pending";
  if (unmetCount > 0) dominantStatus = "unmet";
  else if (closeCount > 0) dominantStatus = "close";
  else if (metCount === total && total > 0) dominantStatus = "met";

  return {
    evaluations,
    percent,
    metCount,
    totalCount: total,
    dominantStatus,
    window: evaluateWindow(opportunity.windowStart, opportunity.windowEnd),
  };
}

export function evaluateWindow(start: string | null, end: string | null): WindowInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!start && !end) {
    return { status: "ongoing", label: "Sin fecha límite fija — verifica vigencia" };
  }

  const startDate = start ? new Date(start + "T00:00:00") : null;
  const endDate = end ? new Date(end + "T00:00:00") : null;

  if (startDate && today < startDate) {
    const days = Math.ceil((startDate.getTime() - today.getTime()) / 86_400_000);
    return {
      status: "upcoming",
      daysUntilStart: days,
      label: days === 0 ? "Abre hoy" : `Abre en ${days} día${days === 1 ? "" : "s"}`,
    };
  }

  if (endDate && today > endDate) {
    return { status: "closed", label: "Convocatoria cerrada" };
  }

  if (endDate) {
    const days = Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000);
    return {
      status: "active",
      daysUntilEnd: days,
      label: days === 0 ? "Cierra hoy" : `Cierra en ${days} día${days === 1 ? "" : "s"}`,
    };
  }

  return { status: "active", label: "Convocatoria abierta" };
}

export function weightedAverage(courses: { credits: number; grade: number }[]): number {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => sum + c.credits * c.grade, 0);
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
