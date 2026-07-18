// Motor determinístico de MetaUTP. La IA puede explicar o ayudar a extraer
// datos, pero nunca decide si el alumno cumple un requisito numérico.

import type {
  Opportunity,
  OpportunityCategory,
  Requirement,
  StudentProfile,
} from "@/data/types";

export type RequirementStatus =
  | "met"
  | "close"
  | "needs_info"
  | "official"
  | "unmet";

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
  requirement: Requirement,
  profile: StudentProfile
): RequirementEvaluation {
  const isNumeric =
    requirement.type === "numeric_gpa" ||
    requirement.type === "numeric_credits" ||
    requirement.type === "numeric_cycle";

  if (isNumeric && requirement.threshold !== undefined) {
    const value = profileValueFor(requirement.type, profile);
    const comparator = requirement.comparator ?? ">=";
    if (value === null) {
      return { requirement, status: "needs_info", detail: requirement.description };
    }
    if (compare(value, comparator, requirement.threshold)) {
      return {
        requirement,
        status: "met",
        detail: `Cumples: tienes ${value}; el requisito indica ${comparator} ${requirement.threshold}.`,
      };
    }

    const gap = requirement.threshold - value;
    const margin = MARGIN[requirement.type] ?? 1;
    if (comparator.startsWith(">") && gap > 0 && gap <= margin) {
      return {
        requirement,
        status: "close",
        detail: `Estás cerca: te faltan ${gap.toFixed(
          requirement.type === "numeric_gpa" ? 1 : 0
        )} para llegar a ${requirement.threshold}.`,
      };
    }
    return {
      requirement,
      status: "unmet",
      detail: `Aún no cumples: tienes ${value}; el requisito indica ${comparator} ${requirement.threshold}.`,
    };
  }

  if (requirement.type === "boolean") {
    return {
      requirement,
      status: "needs_info",
      detail:
        requirement.nonVerifiableNote ??
        "Necesitamos que confirmes este dato para personalizar mejor el resultado.",
    };
  }

  return {
    requirement,
    status: "official",
    detail:
      requirement.nonVerifiableNote ??
      "Este requisito depende de una revisión o trámite oficial y MetaUTP no puede confirmarlo.",
  };
}

export interface OpportunityEvaluation {
  evaluations: RequirementEvaluation[];
  metCount: number;
  closeCount: number;
  needsInfoCount: number;
  officialCount: number;
  unmetCount: number;
  measurableCount: number;
  totalCount: number;
  dominantStatus: RequirementStatus;
  window: WindowInfo;
}

export function evaluateOpportunity(
  opportunity: Opportunity,
  profile: StudentProfile
): OpportunityEvaluation {
  const evaluations = opportunity.requirements.map((requirement) =>
    evaluateRequirement(requirement, profile)
  );
  const count = (status: RequirementStatus) =>
    evaluations.filter((evaluation) => evaluation.status === status).length;
  const metCount = count("met");
  const closeCount = count("close");
  const needsInfoCount = count("needs_info");
  const officialCount = count("official");
  const unmetCount = count("unmet");
  const measurableCount = metCount + closeCount + unmetCount;

  let dominantStatus: RequirementStatus = "met";
  if (unmetCount > 0) dominantStatus = "unmet";
  else if (closeCount > 0) dominantStatus = "close";
  else if (needsInfoCount > 0) dominantStatus = "needs_info";
  else if (officialCount > 0) dominantStatus = "official";

  return {
    evaluations,
    metCount,
    closeCount,
    needsInfoCount,
    officialCount,
    unmetCount,
    measurableCount,
    totalCount: evaluations.length,
    dominantStatus,
    window: evaluateWindow(opportunity.windowStart, opportunity.windowEnd),
  };
}

export interface RankingInfo {
  score: number;
  reason: string;
}

const STATUS_SCORE: Record<RequirementStatus, number> = {
  met: 48,
  official: 38,
  close: 28,
  needs_info: 18,
  unmet: 0,
};

const WINDOW_SCORE: Record<WindowStatus, number> = {
  active: 36,
  ongoing: 30,
  upcoming: 20,
  closed: -45,
};

/**
 * Jerarquiza sin ocultar oportunidades. La puntuación solo sirve para ordenar;
 * nunca se presenta como una probabilidad de admisión.
 */
export function rankOpportunity(
  opportunity: Opportunity,
  evaluation: OpportunityEvaluation,
  preferredCategories: OpportunityCategory[] = []
): RankingInfo {
  const preferred = preferredCategories.includes(opportunity.category);
  const actionable = opportunity.actionability !== "informational";
  let score = STATUS_SCORE[evaluation.dominantStatus] + WINDOW_SCORE[evaluation.window.status];

  score += evaluation.metCount * 7;
  score += evaluation.closeCount * 3;
  score -= evaluation.unmetCount * 12;
  score -= evaluation.needsInfoCount * 2;
  if (preferred) score += 16;
  if (!actionable) score -= 55;

  if (
    evaluation.window.status === "active" &&
    evaluation.unmetCount === 0 &&
    (evaluation.window.daysUntilEnd ?? 99) <= 14
  ) {
    score += 6;
  }

  let reason = "Coincide mejor con los datos que registraste";
  if (!actionable) reason = "Referencia útil; no tiene postulación individual";
  else if (evaluation.window.status === "closed") reason = "Convocatoria cerrada; consérvala como referencia";
  else if (evaluation.unmetCount > 0) reason = "Tiene requisitos que aún no cumples";
  else if (evaluation.closeCount > 0) reason = "Estás cerca de completar un requisito medible";
  else if (evaluation.needsInfoCount > 0) reason = "Puede subir al completar información pendiente";
  else if (evaluation.officialCount > 0) reason = "Tus datos encajan; falta validación oficial";
  else if (evaluation.measurableCount > 0) reason = "Cumples los requisitos medibles registrados";

  if (preferred && actionable && evaluation.window.status !== "closed") {
    reason = `${reason} · coincide con tus intereses`;
  }

  return { score, reason };
}

export function evaluateWindow(start: string | null, end: string | null): WindowInfo {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!start && !end) {
    return { status: "ongoing", label: "Sin fecha límite fija · verifica vigencia" };
  }

  const startDate = start ? new Date(`${start}T00:00:00`) : null;
  const endDate = end ? new Date(`${end}T00:00:00`) : null;

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
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = courses.reduce(
    (sum, course) => sum + course.credits * course.grade,
    0
  );
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
