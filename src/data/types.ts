// Tipos del modelo de datos de MetaUTP.
// No inventar datos: todo Opportunity debe originarse en un documento real
// dentro de UTP_PDFs_Oficiales/. Si algo no está confirmado por la fuente,
// se modela como requisito "non_verifiable", nunca se omite ni se inventa.

export type RequirementType =
  | "numeric_gpa" // promedio ponderado mínimo
  | "numeric_credits" // créditos aprobados mínimos
  | "numeric_cycle" // ciclo mínimo (ej. "7mo ciclo en adelante")
  | "boolean" // condición sí/no verificable con los datos que el alumno ingresa
  | "non_verifiable"; // depende de un trámite/documento oficial que la app no puede confirmar

export type RequirementMetric =
  | "current_cycle_gpa"
  | "last_period_gpa"
  | "last_two_periods_gpa"
  | "cumulative_gpa"
  | "approved_credits"
  | "current_period_credits"
  | "weekly_hours_current"
  | "weekly_hours_previous"
  | "cycle";

export interface Requirement {
  id: string;
  description: string; // texto humano, ej. "Promedio ponderado mínimo de 12"
  type: RequirementType;
  threshold?: number; // usado si type es numeric_*
  comparator?: ">=" | ">" | "<=" | "<" | "==";
  metric?: RequirementMetric;
  nonVerifiableNote?: string; // usado si type es non_verifiable o boolean sin dato del alumno
}

export type OpportunityCategory =
  | "Becas"
  | "Intercambios"
  | "Empleabilidad"
  | "Convenios";

export interface OpportunitySource {
  label: string; // ej. "UTP+ Info — Beca PRODAC"
  url: string; // URL real de la fuente. Si no hay URL pública, usar "" y explicar en sourceNote
  sourceNote?: string;
}

export interface Opportunity {
  id: string; // slug único, ej. "beca-prodac"
  title: string;
  category: OpportunityCategory;
  shortDescription: string; // 1 línea para tarjeta
  longDescription: string; // 2-4 líneas para detalle
  requirements: Requirement[];
  windowStart: string | null; // ISO "YYYY-MM-DD" o null si no aplica/permanente
  windowEnd: string | null; // ISO "YYYY-MM-DD" o null si no aplica/permanente
  cost?: string; // ej. "S/. 35 por ciclo", "Gratuito", "USD 2200"
  source: OpportunitySource;
  lastUpdated: string; // ISO "YYYY-MM-DD" — fecha en que se extrajo/confirmó el dato
  actionNote?: string; // siguiente acción concreta, ej. "Postula en Bienestar Universitario"
  actionability?: "application" | "informational"; // informational = referencia útil, sin postulación individual
  featured?: boolean; // true para las 2-3 que se muestran como teaser en Bienvenida
}

// ---- Perfil del estudiante (datos que el propio alumno ingresa manualmente) ----
// Nunca se conecta a UTPClass ni pide credenciales institucionales: decisión de
// producto, no solo técnica.

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: number | null; // 0-20; null = pendiente de confirmar
  period?: "current" | "previous" | "historical";
  weeklyHours?: number;
  source?: "manual" | "ocr" | "demo" | "institutional";
}

export interface AcademicMetrics {
  currentCycleGpa: number | null;
  lastPeriodGpa: number | null;
  lastTwoPeriodsGpa: number | null;
  currentPeriodCredits: number | null;
  weeklyHoursCurrent: number | null;
  weeklyHoursPrevious: number | null;
}

export const emptyAcademicMetrics: AcademicMetrics = {
  currentCycleGpa: null,
  lastPeriodGpa: null,
  lastTwoPeriodsGpa: null,
  currentPeriodCredits: null,
  weeklyHoursCurrent: null,
  weeklyHoursPrevious: null,
};

export interface DataProvenance {
  academicSource: "manual" | "ocr" | "demo" | "institutional" | "unknown";
  documentType: "schedule" | "grades" | "academic_summary" | "none";
  confirmedAt: string | null;
}

export const emptyDataProvenance: DataProvenance = {
  academicSource: "unknown",
  documentType: "none",
  confirmedAt: null,
};

export type TriState = "yes" | "no" | "unknown";

export type AcademicRank =
  | "top_tenth"
  | "top_fifth"
  | "top_third"
  | "none"
  | "unknown";

export type EnglishLevel = "none" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unknown";

export type StudentStatus = "active" | "graduate" | "unknown";

export type SpecialAffiliation =
  | "coar"
  | "innova"
  | "idat"
  | "zegel"
  | "intercorp"
  | "partner_school"
  | "mother_of_god"
  | "corporate_agreement";

export type StudentGoal =
  | "scholarship"
  | "study_abroad"
  | "employability"
  | "english"
  | "research"
  | "custom"
  | "undecided";

export interface ProfileFacts {
  academicRank: AcademicRank;
  failedLastPeriod: TriState;
  continuousStudent: TriState;
  enrolledCurrentTerm: TriState;
  age18Plus: TriState;
  disciplinaryIssues: TriState;
  outstandingDebt: TriState;
  studentStatus: StudentStatus;
  englishLevel: EnglishLevel;
  englishCertificate: TriState;
  englishIVPassed: TriState;
  competitiveSport: TriState;
  representsUtp: TriState;
  eliteAthleteCredential: TriState;
  culturalEnsemble: TriState;
  researchExperience: TriState;
  volunteering: TriState;
  workExperience: TriState;
  sensitiveConsent: "yes" | "not_now" | "prefer_not";
  financialNeed: TriState;
  lostEconomicGuardian: TriState;
  disabilityConadis: TriState;
  regionalBenefit: TriState;
  affiliations: SpecialAffiliation[];
}

export const emptyProfileFacts: ProfileFacts = {
  academicRank: "unknown",
  failedLastPeriod: "unknown",
  continuousStudent: "unknown",
  enrolledCurrentTerm: "unknown",
  age18Plus: "unknown",
  disciplinaryIssues: "unknown",
  outstandingDebt: "unknown",
  studentStatus: "unknown",
  englishLevel: "unknown",
  englishCertificate: "unknown",
  englishIVPassed: "unknown",
  competitiveSport: "unknown",
  representsUtp: "unknown",
  eliteAthleteCredential: "unknown",
  culturalEnsemble: "unknown",
  researchExperience: "unknown",
  volunteering: "unknown",
  workExperience: "unknown",
  sensitiveConsent: "not_now",
  financialNeed: "unknown",
  lostEconomicGuardian: "unknown",
  disabilityConadis: "unknown",
  regionalBenefit: "unknown",
  affiliations: [],
};

export interface StudentProfile {
  name: string;
  career: string;
  cycle: number; // ciclo actual, 1-10+
  cumulativeGpa: number | null; // promedio ponderado acumulado, 0-20
  approvedCredits: number | null; // créditos aprobados acumulados
  academicPeriod: string;
  academicMetrics: AcademicMetrics;
  dataProvenance: DataProvenance;
  courses: Course[]; // cursos del ciclo actual, para los simuladores
  preferredCategories: OpportunityCategory[]; // intereses opcionales usados solo para jerarquizar
  facts: ProfileFacts; // datos opcionales declarados de forma respetuosa por el estudiante
  goal: StudentGoal; // meta principal que orienta el orden del catálogo y a la guía de IA
  goalNote: string; // texto libre opcional, nunca modifica el perfil sin confirmación
  onboarded: boolean; // true tras completar los datos generales del perfil
  profileRefined: boolean; // true cuando revisó (o decidió omitir) el bloque opcional
  academicSetupComplete: boolean; // true tras revisar la carga manual/OCR de cursos
  contextConfigured: boolean;
}

export const emptyProfile: StudentProfile = {
  name: "",
  career: "",
  cycle: 1,
  cumulativeGpa: null,
  approvedCredits: null,
  academicPeriod: "2026-1",
  academicMetrics: emptyAcademicMetrics,
  dataProvenance: emptyDataProvenance,
  courses: [],
  preferredCategories: [],
  facts: emptyProfileFacts,
  goal: "undecided",
  goalNote: "",
  onboarded: false,
  profileRefined: false,
  academicSetupComplete: false,
  contextConfigured: false,
};
