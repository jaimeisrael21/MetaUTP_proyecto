// Motor determinístico de MetaUTP. La IA puede explicar o ayudar a extraer
// datos, pero nunca decide si el alumno cumple un requisito numérico.

import type {
  Opportunity,
  OpportunityCategory,
  Requirement,
  StudentProfile,
} from "@/data/types";
import {
  evaluateOpportunityGates,
  goalRelevance,
  type GateEvaluation,
} from "@/data/opportunity-rules";

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

export type WindowStatus = "active" | "upcoming" | "closed" | "unconfirmed";

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
  gateEvaluations: GateEvaluation[];
  essentialMetCount: number;
  essentialUnknownCount: number;
  essentialUnmetCount: number;
  confirmedCount: number;
  comparisonTotal: number;
  matchState: OpportunityMatchState;
  primaryGap: string | null;
  window: WindowInfo;
}

export type OpportunityMatchState =
  | "recommended"
  | "close"
  | "needs_data"
  | "special_condition"
  | "official_validation"
  | "not_applicable"
  | "general_catalog";

const REQUIREMENT_STOP_WORDS = new Set([
  "acreditar", "alumno", "contar", "cumplir", "condicion", "estar", "haber",
  "mantener", "periodo", "requisito", "responsable", "tener", "universidad",
]);

function comparableTokens(value: string) {
  return new Set(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length >= 5 && !REQUIREMENT_STOP_WORDS.has(token))
  );
}

function gateMatchesRequirement(gate: GateEvaluation, evaluation: RequirementEvaluation) {
  if (evaluation.requirement.type !== "boolean") return false;
  const gateTokens = comparableTokens(gate.gate.label);
  const requirementTokens = comparableTokens(evaluation.requirement.description);
  if (gateTokens.size === 0 || requirementTokens.size === 0) return false;
  const overlap = [...gateTokens].filter((token) => requirementTokens.has(token)).length;
  return overlap >= 1 && overlap / Math.min(gateTokens.size, requirementTokens.size) >= 0.34;
}

function reconcileBooleanRequirements(
  evaluations: RequirementEvaluation[],
  gateEvaluations: GateEvaluation[]
) {
  const matchedGateIds = new Set<string>();
  const reconciled = evaluations.map((evaluation) => {
    const gate = gateEvaluations.find((candidate) =>
      gateMatchesRequirement(candidate, evaluation)
    );
    if (!gate) return evaluation;
    matchedGateIds.add(gate.gate.id);
    if (gate.result === "met") {
      return { ...evaluation, status: "met" as const, detail: "Confirmado con los datos que registraste." };
    }
    if (gate.result === "unmet") {
      return { ...evaluation, status: "unmet" as const, detail: "Este dato declarado no coincide con la condición." };
    }
    return { ...evaluation, status: "needs_info" as const, detail: "Completa este dato para comparar el requisito." };
  });
  return { reconciled, matchedGateIds };
}

export function evaluateOpportunity(
  opportunity: Opportunity,
  profile: StudentProfile
): OpportunityEvaluation {
  const rawEvaluations = opportunity.requirements.map((requirement) =>
    evaluateRequirement(requirement, profile)
  );
  const gateEvaluations = evaluateOpportunityGates(opportunity, profile);
  const { reconciled: evaluations, matchedGateIds } = reconcileBooleanRequirements(
    rawEvaluations,
    gateEvaluations
  );
  const count = (status: RequirementStatus) =>
    evaluations.filter((evaluation) => evaluation.status === status).length;
  const metCount = count("met");
  const closeCount = count("close");
  const needsInfoCount = count("needs_info");
  const officialCount = count("official");
  const unmetCount = count("unmet");
  const measurableCount = metCount + closeCount + unmetCount;
  const essentialMetCount = gateEvaluations.filter((item) => item.result === "met").length;
  const essentialUnknownCount = gateEvaluations.filter((item) => item.result === "unknown").length;
  const essentialUnmetCount = gateEvaluations.filter((item) => item.result === "unmet").length;
  const hasUnknownSensitiveCondition = gateEvaluations.some(
    (item) => item.result === "unknown" && "sensitive" in item.gate && item.gate.sensitive
  );
  const additionalGates = gateEvaluations.filter((item) => !matchedGateIds.has(item.gate.id));
  const confirmedCount = metCount + additionalGates.filter((item) => item.result === "met").length;
  const comparisonTotal = evaluations.length + additionalGates.length;

  let dominantStatus: RequirementStatus = "met";
  if (unmetCount > 0) dominantStatus = "unmet";
  else if (closeCount > 0) dominantStatus = "close";
  else if (needsInfoCount > 0) dominantStatus = "needs_info";
  else if (officialCount > 0) dominantStatus = "official";

  const window = evaluateWindow(opportunity.windowStart, opportunity.windowEnd);
  let matchState: OpportunityMatchState = "recommended";
  if (opportunity.actionability === "informational" || window.status === "closed") {
    matchState = "general_catalog";
  } else if (essentialUnmetCount > 0 || unmetCount > 0) {
    matchState = "not_applicable";
  } else if (hasUnknownSensitiveCondition) {
    matchState = "special_condition";
  } else if (essentialUnknownCount > 0 || needsInfoCount > 0) {
    matchState = "needs_data";
  } else if (closeCount > 0) {
    matchState = "close";
  } else if (officialCount > 0) {
    matchState = "official_validation";
  }

  const firstUnmetGate = gateEvaluations.find((item) => item.result === "unmet");
  const firstUnknownGate = gateEvaluations.find((item) => item.result === "unknown");
  const firstRequirementGap = evaluations.find((item) => item.status !== "met");
  const primaryGap =
    firstUnmetGate?.gate.label ??
    firstUnknownGate?.gate.label ??
    firstRequirementGap?.requirement.description ??
    null;

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
    gateEvaluations,
    essentialMetCount,
    essentialUnknownCount,
    essentialUnmetCount,
    confirmedCount,
    comparisonTotal,
    matchState,
    primaryGap,
    window,
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
  upcoming: 20,
  unconfirmed: -8,
  closed: -45,
};

const MATCH_SCORE: Record<OpportunityMatchState, number> = {
  recommended: 90,
  close: 72,
  official_validation: 58,
  needs_data: 38,
  special_condition: -60,
  general_catalog: 2,
  not_applicable: -80,
};

/**
 * Jerarquiza sin ocultar oportunidades. La puntuación solo sirve para ordenar;
 * nunca se presenta como una probabilidad de admisión.
 */
export function rankOpportunity(
  opportunity: Opportunity,
  evaluation: OpportunityEvaluation,
  profile?: Pick<
    StudentProfile,
    "preferredCategories" | "goal" | "goalNote"
  >
): RankingInfo {
  const preferredCategories: OpportunityCategory[] = profile?.preferredCategories ?? [];
  const preferred = preferredCategories.includes(opportunity.category);
  const actionable = opportunity.actionability !== "informational";
  let score =
    MATCH_SCORE[evaluation.matchState] +
    STATUS_SCORE[evaluation.dominantStatus] +
    WINDOW_SCORE[evaluation.window.status];

  score += evaluation.metCount * 7;
  score += evaluation.closeCount * 3;
  score -= evaluation.unmetCount * 12;
  score -= evaluation.needsInfoCount * 2;
  score -= evaluation.essentialUnknownCount * 18;
  score -= evaluation.essentialUnmetCount * 80;
  if (preferred) score += 16;
  if (!actionable) score -= 55;
  if (profile) score += goalRelevance(opportunity, profile.goal, profile.goalNote);

  if (
    evaluation.window.status === "active" &&
    evaluation.unmetCount === 0 &&
    (evaluation.window.daysUntilEnd ?? 99) <= 14
  ) {
    score += 6;
  }

  let reason = "Coincide con los datos que registraste";
  if (!actionable) reason = "Referencia útil; no tiene postulación individual";
  else if (evaluation.window.status === "closed") reason = "Convocatoria cerrada; consérvala como referencia";
  else if (evaluation.essentialUnmetCount > 0) reason = "Una condición esencial declarada no coincide";
  else if (evaluation.unmetCount > 0) reason = "Tiene un requisito medible que aún no cumples";
  else if (evaluation.matchState === "special_condition") reason = "Solo aparece en el catálogo porque requiere una condición personal específica";
  else if (evaluation.closeCount > 0) reason = "Estás cerca de completar un requisito medible";
  else if (evaluation.essentialUnknownCount > 0) reason = "Falta un dato esencial antes de recomendarla";
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
    return { status: "unconfirmed", label: "Fecha por confirmar" };
  }

  const startDate = start ? new Date(`${start}T00:00:00`) : null;
  const endDate = end ? new Date(`${end}T00:00:00`) : null;

  if (startDate && today < startDate) {
    const days = Math.ceil((startDate.getTime() - today.getTime()) / 86_400_000);
    return {
      status: "upcoming",
      daysUntilStart: days,
      label: `Abre el ${formatCompactDate(start!)}`,
    };
  }

  if (endDate && today > endDate) {
    return { status: "closed", label: `Cerró el ${formatCompactDate(end!)}` };
  }

  if (endDate) {
    const days = Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000);
    return {
      status: "active",
      daysUntilEnd: days,
      label: days === 0 ? "Cierra hoy" : `Hasta el ${formatCompactDate(end!)}`,
    };
  }

  return { status: "active", label: start ? `Vigente desde el ${formatCompactDate(start)}` : "Convocatoria vigente" };
}

function formatCompactDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
