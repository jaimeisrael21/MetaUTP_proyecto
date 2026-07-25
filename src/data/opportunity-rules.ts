import type {
  AcademicRank,
  Opportunity,
  ProfileFacts,
  SpecialAffiliation,
  StudentGoal,
  StudentProfile,
  StudentStatus,
  TriState,
} from "./types";

export type GateResult = "met" | "unmet" | "unknown";

type TriStateField = {
  [Key in keyof ProfileFacts]: ProfileFacts[Key] extends TriState ? Key : never;
}[keyof ProfileFacts];

export type ProfileGate =
  | {
      id: string;
      label: string;
      kind: "tri_state";
      field: TriStateField;
      expected: "yes" | "no";
      sensitive?: boolean;
    }
  | {
      id: string;
      label: string;
      kind: "academic_rank";
      allowed: AcademicRank[];
    }
  | {
      id: string;
      label: string;
      kind: "affiliation";
      allowed: SpecialAffiliation[];
    }
  | {
      id: string;
      label: string;
      kind: "student_status";
      allowed: StudentStatus[];
    }
  | {
      id: string;
      label: string;
      kind: "cycle_range";
      min: number;
      max: number;
    }
  | {
      id: string;
      label: string;
      kind: "unprofiled";
      sensitive?: boolean;
    };

const yes = (
  id: string,
  label: string,
  field: TriStateField,
  sensitive = false
): ProfileGate => ({ id, label, kind: "tri_state", field, expected: "yes", sensitive });

const no = (id: string, label: string, field: TriStateField): ProfileGate => ({
  id,
  label,
  kind: "tri_state",
  field,
  expected: "no",
});

// El Reglamento de Becas de Pregrado V18 establece estas dos condiciones
// generales para toda modalidad de beca. Se agregan como reglas compartidas
// para que una sanción o deuda declarada no siga mostrando becas incompatibles.
const GENERAL_SCHOLARSHIP_GATES: ProfileGate[] = [
  no(
    "scholarship-no-prior-debt",
    "No tener deuda del periodo lectivo anterior frente a la UTP",
    "outstandingDebt"
  ),
  no(
    "scholarship-no-disciplinary-sanction",
    "No tener sanción disciplinaria vigente ni en el periodo anterior",
    "disciplinaryIssues"
  ),
];

const OPPORTUNITY_GATES: Record<string, ProfileGate[]> = {
  "beca-cultura": [
    yes("cultural-ensemble", "Integrar un elenco cultural UTP", "culturalEnsemble"),
    yes("represents-utp-cultural", "Representar a la UTP", "representsUtp"),
    yes("continuous-cultural", "Ser estudiante continuo", "continuousStudent"),
  ],
  "beca-excelencia-deportiva": [
    yes("competitive-sport", "Practicar deporte competitivo", "competitiveSport"),
    yes("represents-utp-sport", "Representar a la UTP como deportista", "representsUtp"),
    yes("continuous-sport", "Ser estudiante continuo", "continuousStudent"),
  ],
  "beca-patronato-bcp": [
    yes("financial-need-bcp", "Tener recursos económicos limitados", "financialNeed", true),
    { id: "eligible-bcp-career", label: "Postular a una carrera y sede elegibles", kind: "unprofiled" },
  ],
  "beca-por-discapacidad": [
    yes("conadis", "Contar con discapacidad permanente registrada en CONADIS", "disabilityConadis", true),
    yes("continuous-disability", "Ser estudiante continuo", "continuousStudent"),
  ],
  "beca-por-orfandad": [
    yes("lost-guardian", "Acreditar la pérdida del responsable económico", "lostEconomicGuardian", true),
    no("no-failed-orphan", "No tener cursos desaprobados en el periodo anterior", "failedLastPeriod"),
  ],
  "beca-prodac": [
    yes("dc-decan", "Contar con acreditación DC o DECAN vigente", "eliteAthleteCredential"),
  ],
  "beca-socioeconomica": [
    yes("financial-need", "Acreditar una necesidad económica familiar imprevista", "financialNeed", true),
  ],
  "beca-excelencia-academica": [
    no("no-failed-excellence", "No tener cursos desaprobados en el periodo anterior", "failedLastPeriod"),
    yes(
      "second-period-excellence",
      "Haber completado al menos un periodo regular previo en la UTP",
      "continuousStudent"
    ),
  ],
  "beca-alto-potencial-bap": [
    {
      id: "bap-school",
      label: "Provenir de un colegio con convenio BAP",
      kind: "affiliation",
      allowed: ["coar", "innova", "partner_school"],
    },
    no("no-failed-bap", "No tener cursos desaprobados para renovar", "failedLastPeriod"),
  ],
  "beca-talento": [
    {
      id: "talent-school",
      label: "Provenir de un colegio incluido en el convenio",
      kind: "affiliation",
      allowed: ["coar", "innova", "partner_school"],
    },
    no("no-failed-talent", "No tener cursos desaprobados para renovar", "failedLastPeriod"),
  ],
  "beca-mujeres-ciencia-tecnologia": [
    { id: "women-stem", label: "Cumplir la condición de ingreso de la convocatoria Mujeres en Ciencia y Tecnología", kind: "unprofiled", sensitive: true },
    no("no-failed-women-stem", "No tener cursos desaprobados para renovar", "failedLastPeriod"),
  ],
  "beca-talento-coar": [
    { id: "coar", label: "Ser egresado de COAR desde la promoción indicada", kind: "affiliation", allowed: ["coar"] },
    no("no-failed-coar", "No tener cursos desaprobados", "failedLastPeriod"),
  ],
  "beca-madrediosense": [
    yes("mother-of-god", "Cumplir la condición regional y asociativa de Madre de Dios", "regionalBenefit", true),
  ],
  "empleabilidad-feria-laboral": [
    { id: "student-or-graduate-fair", label: "Ser estudiante o egresado UTP", kind: "student_status", allowed: ["active", "graduate"] },
  ],
  "empleabilidad-intercorp-utp": [
    { id: "student-or-graduate-intercorp", label: "Ser estudiante o egresado UTP", kind: "student_status", allowed: ["active", "graduate"] },
  ],
  "empleabilidad-english-discoveries": [
    yes("enrolled-english", "Estar matriculado en el periodo", "enrolledCurrentTerm"),
    yes("english-four", "Haber aprobado o convalidado Inglés IV", "englishIVPassed"),
  ],
  "empleabilidad-generacion-top": [
    { id: "medalla-oro", label: "Pertenecer a Medalla de Oro", kind: "unprofiled" },
  ],
  "empleabilidad-egresa-con-potencial": [
    { id: "cycle-nine-ten", label: "Estar cursando 9.° o 10.° ciclo", kind: "cycle_range", min: 9, max: 10 },
  ],
  "empleabilidad-asesor-de-empleabilidad": [
    { id: "graduate-adviser", label: "Ser egresado UTP dentro de los últimos seis meses", kind: "student_status", allowed: ["graduate"] },
  ],
  "empleabilidad-sesion-desarrollo-laboral": [
    { id: "student-or-graduate-session", label: "Ser estudiante o egresado UTP", kind: "student_status", allowed: ["active", "graduate"] },
  ],
  "empleabilidad-bolsa-de-trabajo": [
    { id: "student-or-graduate-jobs", label: "Ser estudiante o egresado UTP", kind: "student_status", allowed: ["active", "graduate"] },
  ],
  "intercambio-movilidad-presencial": [
    yes("adult-mobility", "Ser mayor de 18 años", "age18Plus"),
    yes("enrolled-mobility", "Tener matrícula vigente", "enrolledCurrentTerm"),
    {
      id: "rank-mobility",
      label: "Pertenecer al tercio, quinto o décimo superior",
      kind: "academic_rank",
      allowed: ["top_tenth", "top_fifth", "top_third"],
    },
    no("discipline-mobility", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
  ],
  "intercambio-movilidad-virtual": [
    yes("adult-virtual", "Ser mayor de 18 años", "age18Plus"),
    yes("enrolled-virtual", "Tener matrícula vigente", "enrolledCurrentTerm"),
    {
      id: "rank-virtual",
      label: "Pertenecer al tercio, quinto o décimo superior",
      kind: "academic_rank",
      allowed: ["top_tenth", "top_fifth", "top_third"],
    },
    no("discipline-virtual", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
  ],
  "intercambio-conferencias-internacionales": [
    { id: "active-conferences", label: "Ser estudiante UTP", kind: "student_status", allowed: ["active"] },
  ],
  "intercambio-misiones-internacionales": [
    yes("adult-missions", "Ser mayor de 18 años", "age18Plus"),
    no("discipline-missions", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
    no("debt-missions", "No tener obligaciones administrativas o financieras pendientes", "outstandingDebt"),
  ],
  "intercambio-espana": [
    yes("adult-spain", "Ser mayor de 18 años", "age18Plus"),
    no("discipline-spain", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
    no("debt-spain", "No tener obligaciones pendientes", "outstandingDebt"),
  ],
  "intercambio-panama": [
    yes("adult-panama", "Ser mayor de 18 años", "age18Plus"),
    no("discipline-panama", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
    no("debt-panama", "No tener obligaciones pendientes", "outstandingDebt"),
  ],
  "intercambio-buenos-aires": [
    yes("adult-buenos-aires", "Ser mayor de 18 años", "age18Plus"),
    no("discipline-buenos-aires", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
    no("debt-buenos-aires", "No tener obligaciones pendientes", "outstandingDebt"),
  ],
  "intercambio-ryukyus-japon": [
    {
      id: "rank-ryukyus",
      label: "Pertenecer al quinto o décimo superior en todos los ciclos",
      kind: "academic_rank",
      allowed: ["top_tenth", "top_fifth"],
    },
    no("discipline-ryukyus", "No tener antecedentes disciplinarios", "disciplinaryIssues"),
    yes("enrolled-ryukyus", "Mantener condición de estudiante activo", "enrolledCurrentTerm"),
  ],
  "convenio-idat": [
    { id: "idat", label: "Ser egresado de IDAT", kind: "affiliation", allowed: ["idat"] },
  ],
  "convenio-innova-schools": [
    { id: "innova", label: "Ser egresado de Innova Schools desde el periodo indicado", kind: "affiliation", allowed: ["innova"] },
  ],
  "convenio-intercorp": [
    { id: "intercorp", label: "Ser colaborador o familiar directo de un colaborador Intercorp", kind: "affiliation", allowed: ["intercorp"] },
  ],
  "convenio-zegel-ipae": [
    { id: "zegel", label: "Ser egresado de Zegel IPAE", kind: "affiliation", allowed: ["zegel"] },
  ],
  "convenio-otros-convenios": [
    { id: "corporate-agreement", label: "Tener vínculo laboral con una empresa de la guía oficial", kind: "affiliation", allowed: ["corporate_agreement"] },
  ],
};

export interface GateEvaluation {
  gate: ProfileGate;
  result: GateResult;
}

export function opportunityGates(opportunity: Opportunity): ProfileGate[] {
  const specific = OPPORTUNITY_GATES[opportunity.id] ?? [];
  if (opportunity.category !== "Becas") return specific;
  return [...specific, ...GENERAL_SCHOLARSHIP_GATES];
}

export function evaluateProfileGate(gate: ProfileGate, profile: StudentProfile): GateResult {
  switch (gate.kind) {
    case "tri_state": {
      const value = profile.facts[gate.field] as TriState;
      if (value === "unknown") return "unknown";
      return value === gate.expected ? "met" : "unmet";
    }
    case "academic_rank":
      // La movilidad presencial admite también el umbral de promedio que
      // figura en su convocatoria. La movilidad virtual sí exige posición
      // académica oficial: no debe inferirse comparando solo las notas propias.
      if (gate.id === "rank-mobility") {
        if (gate.allowed.includes(profile.facts.academicRank)) return "met";
        if ((profile.academicMetrics.lastTwoPeriodsGpa ?? 0) >= 14) return "met";
      }
      if (profile.facts.academicRank === "unknown") return "unknown";
      return gate.allowed.includes(profile.facts.academicRank) ? "met" : "unmet";
    case "affiliation":
      if (!profile.profileRefined) return "unknown";
      return profile.facts.affiliations.some((item) => gate.allowed.includes(item)) ? "met" : "unmet";
    case "student_status":
      if (profile.facts.studentStatus === "unknown") return "unknown";
      return gate.allowed.includes(profile.facts.studentStatus) ? "met" : "unmet";
    case "cycle_range":
      return profile.cycle >= gate.min && profile.cycle <= gate.max ? "met" : "unmet";
    case "unprofiled":
      return "unknown";
  }
}

export function evaluateOpportunityGates(
  opportunity: Opportunity,
  profile: StudentProfile
): GateEvaluation[] {
  return opportunityGates(opportunity).map((gate) => ({
    gate,
    result: evaluateProfileGate(gate, profile),
  }));
}

const CONTEXTUAL_TRI_STATE_FIELDS = new Set<TriStateField>([
  "competitiveSport",
  "representsUtp",
  "eliteAthleteCredential",
  "culturalEnsemble",
  "researchExperience",
  "volunteering",
  "financialNeed",
  "lostEconomicGuardian",
  "disabilityConadis",
  "regionalBenefit",
]);

export function gateRequiresContext(gate: ProfileGate) {
  if (gate.kind === "tri_state") return CONTEXTUAL_TRI_STATE_FIELDS.has(gate.field);
  if (gate.kind === "unprofiled") return Boolean(gate.sensitive);
  return false;
}

const GOAL_CATEGORY: Partial<Record<StudentGoal, Opportunity["category"]>> = {
  scholarship: "Becas",
  study_abroad: "Intercambios",
  employability: "Empleabilidad",
  english: "Empleabilidad",
};

const GOAL_TERMS: Partial<Record<StudentGoal, string[]>> = {
  scholarship: ["beca", "descuento", "pensión"],
  study_abroad: ["movilidad", "intercambio", "internacional", "misión", "idiomas"],
  employability: ["laboral", "empleabilidad", "trabajo", "egresa"],
  english: ["inglés", "english", "idioma", "toeic"],
  research: ["investigación", "semillero"],
};

export function goalRelevance(opportunity: Opportunity, goal: StudentGoal, note = ""): number {
  if (goal === "undecided") return 0;
  let score = GOAL_CATEGORY[goal] === opportunity.category ? 18 : 0;
  const haystack = `${opportunity.title} ${opportunity.shortDescription}`.toLocaleLowerCase("es");
  const terms = [...(GOAL_TERMS[goal] ?? []), ...note.toLocaleLowerCase("es").split(/\s+/).filter((term) => term.length > 4)];
  if (terms.some((term) => haystack.includes(term))) score += 16;
  return score;
}

