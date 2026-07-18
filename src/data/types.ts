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

export interface Requirement {
  id: string;
  description: string; // texto humano, ej. "Promedio ponderado mínimo de 12"
  type: RequirementType;
  threshold?: number; // usado si type es numeric_*
  comparator?: ">=" | ">" | "<=" | "<" | "==";
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
  featured?: boolean; // true para las 2-3 que se muestran como teaser en Bienvenida
}

// ---- Perfil del estudiante (datos que el propio alumno ingresa manualmente) ----
// Nunca se conecta a UTPClass ni pide credenciales institucionales: decisión de
// producto, no solo técnica.

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: number; // 0-20
}

export interface StudentProfile {
  name: string;
  cycle: number; // ciclo actual, 1-10+
  cumulativeGpa: number; // promedio ponderado acumulado, 0-20
  approvedCredits: number; // créditos aprobados acumulados
  courses: Course[]; // cursos del ciclo actual, para los simuladores
  onboarded: boolean; // true tras completar "Configurar ciclo"
}

export const emptyProfile: StudentProfile = {
  name: "",
  cycle: 1,
  cumulativeGpa: 0,
  approvedCredits: 0,
  courses: [],
  onboarded: false,
};
