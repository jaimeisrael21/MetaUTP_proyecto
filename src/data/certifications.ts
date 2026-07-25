export type CertificationKind = "utp" | "preparation" | "external" | "convalidation";

export interface CertificationPath {
  id: string;
  title: string;
  kind: CertificationKind;
  issuer: string;
  summary: string;
  careers?: string[];
  items: string[];
  nextStep: string;
  sourceLabel: string;
  sourceUrl: string;
  verifiedAt: string;
}

export const certificationPaths: CertificationPath[] = [
  {
    id: "software-progressive",
    title: "Certificaciones progresivas de Ingeniería de Software",
    kind: "utp",
    issuer: "UTP",
    summary: "Hitos formativos que la malla oficial presenta como certificaciones progresivas de la carrera.",
    careers: ["ingenieria de software"],
    items: [
      "Tutor STEM Física",
      "Tutor STEM Matemática",
      "Tutor STEM Algorítmica",
      "Excel Intermedio",
      "Desarrollador de Aplicaciones Móviles",
      "Soporte Técnico de Computadoras",
    ],
    nextStep: "Revisa en tu malla qué cursos habilitan cada certificación y confirma la emisión con tu facultad.",
    sourceLabel: "Brochure oficial — Ingeniería de Software UTP",
    sourceUrl: "https://utp.edu.pe/sites/default/files/brochure/UTP_Ingenieria_de_Software.pdf",
    verifiedAt: "2026-07-25",
  },
  {
    id: "systems-progressive",
    title: "Certificaciones progresivas de Sistemas e Informática",
    kind: "utp",
    issuer: "UTP",
    summary: "Certificaciones asociadas al avance curricular publicadas en la malla oficial de la carrera.",
    careers: ["ingenieria de sistemas e informatica", "ingenieria de sistemas"],
    items: [
      "Asistente de Docencia Matemática",
      "Asistente de Docencia Física",
      "Asistente de Docencia Algorítmica",
      "Asesor en Excel Intermedio",
      "Desarrollador de Aplicaciones Móviles",
    ],
    nextStep: "Contrasta tus cursos aprobados con la malla y consulta a la facultad cómo solicitar el documento.",
    sourceLabel: "Malla oficial — Ingeniería de Sistemas e Informática UTP",
    sourceUrl: "https://www.utp.edu.pe/sites/default/files/mallas/MALLA_Ingenieria_de_Sistemas_e_Informatica.pdf",
    verifiedAt: "2026-07-25",
  },
  {
    id: "technology-allies",
    title: "Rutas con aliados tecnológicos",
    kind: "external",
    issuer: "Cisco, IBM, Google y Huawei",
    summary: "Las mallas de Software y Sistemas anuncian acceso a cursos y certificaciones de aliados internacionales.",
    careers: ["ingenieria de software", "ingenieria de sistemas e informatica", "ingenieria de sistemas"],
    items: [
      "Cisco",
      "IBM",
      "Google",
      "Huawei",
      "Ruta de preparación para Google Associate Cloud Engineer en Ingeniería de Software",
    ],
    nextStep: "Confirma disponibilidad, costo y convocatoria con tu facultad: el brochure no garantiza que todas las rutas estén abiertas en todo momento.",
    sourceLabel: "Brochure oficial — Ingeniería de Software UTP",
    sourceUrl: "https://utp.edu.pe/sites/default/files/brochure/UTP_Ingenieria_de_Software.pdf",
    verifiedAt: "2026-07-25",
  },
  {
    id: "english-discoveries-toeic",
    title: "English Discoveries: preparación para TOEIC",
    kind: "preparation",
    issuer: "UTP — preparación; TOEIC — evaluación externa",
    summary: "Programa virtual de práctica de inglés orientado a preparar al estudiante para una certificación internacional TOEIC.",
    items: [
      "Dirigido a estudiantes matriculados",
      "Requiere Inglés IV aprobado o convalidado",
      "Convocatoria pública indicada para agosto de 2026",
      "Costo publicado: S/35 por ciclo de 10 semanas",
    ],
    nextStep: "Revisa la convocatoria vigente en el portal de Empleabilidad. Participar en el programa no equivale a recibir automáticamente el certificado TOEIC.",
    sourceLabel: "UTP Empleabilidad — English Discoveries",
    sourceUrl: "https://www.utp.edu.pe/empleabilidad/alumnos/english-discoveries",
    verifiedAt: "2026-07-25",
  },
  {
    id: "english-external-convalidation",
    title: "Exámenes internacionales aceptados para convalidar Inglés",
    kind: "convalidation",
    issuer: "Entidades certificadoras externas; convalidación evaluada por UTP",
    summary: "TOEFL no es una certificación emitida por UTP: es uno de los exámenes externos que la universidad puede aceptar para convalidar Inglés I a IV bajo sus lineamientos.",
    items: [
      "TOEFL iBT: 41 o más",
      "TOEFL ITP: 343 o más",
      "TOEFL PBT: 476 o más",
      "TOEIC: 385 o más",
      "IELTS: 3.5 o más",
      "Cambridge: KET, PET, FCE, CAE o CPE según puntaje/nivel",
      "EnglishScore, ECCE, ECPE, IB English, MET, Oxford y Pearson según el nivel indicado",
    ],
    nextStep: "Verifica primero si tu modalidad y fecha de ingreso permiten convalidación por certificado. Los estudiantes pueden optar por el examen de suficiencia UTP conforme a los lineamientos.",
    sourceLabel: "Lineamientos UTP para convalidación del curso de Inglés",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2025-02/Lineamientos%20para%20la%20convalidacio%CC%81n%20del%20curso%20de%20Ingle%CC%81s%20en%20el%20plan%20de%20estudios_PT.pdf",
    verifiedAt: "2026-07-25",
  },
  {
    id: "utp-english-proficiency",
    title: "Examen de suficiencia de Inglés UTP",
    kind: "utp",
    issuer: "UTP",
    summary: "Alternativa institucional para acreditar los niveles de Inglés del plan de estudios, distinta de presentar un TOEFL u otro certificado externo.",
    items: [
      "Evaluación 100% virtual",
      "Disponible para estudiantes UTP conforme al procedimiento publicado",
      "60 preguntas y 60 minutos por evaluación",
      "Se aprueba cada nivel con la nota mínima indicada por el lineamiento",
    ],
    nextStep: "Revisa el procedimiento vigente y solicita la evaluación desde los canales indicados por UTP.",
    sourceLabel: "Lineamientos UTP para convalidación del curso de Inglés",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2025-02/Lineamientos%20para%20la%20convalidacio%CC%81n%20del%20curso%20de%20Ingle%CC%81s%20en%20el%20plan%20de%20estudios_PT.pdf",
    verifiedAt: "2026-07-25",
  },
];

export function normalizedCareer(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function pathMatchesCareer(path: CertificationPath, career: string) {
  if (!path.careers) return true;
  const normalized = normalizedCareer(career);
  return path.careers.some((item) => normalized.includes(item));
}
