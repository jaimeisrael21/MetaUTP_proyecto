import type {
  CertificationPath,
  CertificationRequirement,
} from "@/data/certifications";
import { normalizedCareer, pathMatchesCareer } from "@/data/certifications";
import type { StudentProfile } from "@/data/types";
import type { OpportunityMatchState, RequirementStatus } from "./matching";

export interface CertificationRequirementEvaluation {
  requirement: CertificationRequirement;
  status: RequirementStatus;
  detail: string;
}

export interface CertificationEvaluation {
  evaluations: CertificationRequirementEvaluation[];
  confirmedCount: number;
  comparisonTotal: number;
  matchState: OpportunityMatchState;
  primaryGap: string | null;
}

function normalizedCourse(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function evaluateCertificationRequirement(
  path: CertificationPath,
  requirement: CertificationRequirement,
  profile: StudentProfile
): CertificationRequirementEvaluation {
  switch (requirement.kind) {
    case "career": {
      const matches = pathMatchesCareer(path, profile.career);
      return {
        requirement,
        status: matches ? "met" : "unmet",
        detail: matches
          ? `Tu carrera registrada es ${profile.career} y está incluida en esta oportunidad.`
          : `Esta oportunidad está publicada para ${path.careers?.join(" o ") ?? "otra carrera"}; tu perfil indica ${profile.career}.`,
      };
    }
    case "profile_fact": {
      const value = profile.facts[requirement.field];
      if (value === "unknown") {
        return {
          requirement,
          status: "needs_info",
          detail: "Completa este dato en tu perfil para poder compararlo.",
        };
      }
      const matches = value === requirement.expected;
      return {
        requirement,
        status: matches ? "met" : "unmet",
        detail: matches
          ? "Confirmado con los datos que registraste en tu perfil."
          : "El dato registrado en tu perfil todavía no coincide con esta condición.",
      };
    }
    case "student_status": {
      const value = profile.facts.studentStatus;
      if (value === "unknown") {
        return {
          requirement,
          status: "needs_info",
          detail: "Indica tu condición actual de estudiante para comparar este requisito.",
        };
      }
      const matches = requirement.allowed.includes(value);
      return {
        requirement,
        status: matches ? "met" : "unmet",
        detail: matches
          ? "Tu condición de estudiante registrada coincide con esta oportunidad."
          : "Tu condición académica registrada no coincide por ahora.",
      };
    }
    case "cycle": {
      const withinMaximum = requirement.max === undefined || profile.cycle <= requirement.max;
      const matches = profile.cycle >= requirement.min && withinMaximum;
      const expected = requirement.max
        ? `entre ${requirement.min}.° y ${requirement.max}.° ciclo`
        : `desde ${requirement.min}.° ciclo`;
      return {
        requirement,
        status: matches ? "met" : profile.cycle + 1 >= requirement.min ? "close" : "unmet",
        detail: matches
          ? `Tu perfil indica ${profile.cycle}.° ciclo; la condición aplica ${expected}.`
          : `Tu perfil indica ${profile.cycle}.° ciclo; la fuente exige ${expected}.`,
      };
    }
    case "course": {
      const allowed = requirement.courseNames.map(normalizedCourse);
      const course = profile.courses.find((item) => {
        const current = normalizedCourse(item.name);
        return allowed.some((name) => current === name || current.includes(name) || name.includes(current));
      });
      if (!course) {
        return {
          requirement,
          status: "needs_info",
          detail:
            "El historial cargado no permite confirmar este curso. Regístralo o contrástalo con tu récord académico.",
        };
      }
      if (course.grade === null) {
        return {
          requirement,
          status: "needs_info",
          detail: `${course.name} aparece en tu perfil, pero su resultado está pendiente de confirmar.`,
        };
      }
      return {
        requirement,
        status: course.grade >= 11 ? "met" : "unmet",
        detail:
          course.grade >= 11
            ? `${course.name} figura aprobado en tu perfil.`
            : `${course.name} todavía no figura aprobado en tu perfil.`,
      };
    }
    case "official":
      return {
        requirement,
        status: "official",
        detail: requirement.note,
      };
  }
}

export function evaluateCertification(
  path: CertificationPath,
  profile: StudentProfile
): CertificationEvaluation {
  const evaluations = path.requirements.map((requirement) =>
    evaluateCertificationRequirement(path, requirement, profile)
  );
  const confirmedCount = evaluations.filter((item) => item.status === "met").length;
  const comparisonTotal = evaluations.length;
  const careerMismatch = evaluations.some(
    (item) => item.requirement.kind === "career" && item.status === "unmet"
  );
  const hasUnmet = evaluations.some((item) => item.status === "unmet");
  const hasNeedsInfo = evaluations.some((item) => item.status === "needs_info");
  const hasOfficial = evaluations.some((item) => item.status === "official");

  let matchState: OpportunityMatchState = "recommended";
  if (careerMismatch) matchState = "not_applicable";
  else if (hasUnmet) matchState = "close";
  else if (hasNeedsInfo) matchState = "needs_data";
  else if (hasOfficial) matchState = "official_validation";

  const primaryGap =
    evaluations.find((item) => item.status !== "met")?.requirement.description ?? null;

  return {
    evaluations,
    confirmedCount,
    comparisonTotal,
    matchState,
    primaryGap,
  };
}

export function isCertificationRelevant(path: CertificationPath, profile: StudentProfile) {
  return !path.careers || pathMatchesCareer(path, profile.career);
}

const MATCH_SCORE: Partial<Record<OpportunityMatchState, number>> = {
  recommended: 90,
  close: 72,
  official_validation: 60,
  needs_data: 42,
  not_applicable: -80,
};

export function rankCertification(
  path: CertificationPath,
  evaluation: CertificationEvaluation,
  profile: StudentProfile
) {
  const careerBonus = path.careers?.some((career) =>
    normalizedCareer(profile.career).includes(career)
  )
    ? 18
    : 0;
  return (MATCH_SCORE[evaluation.matchState] ?? 0) + evaluation.confirmedCount * 7 + careerBonus;
}
