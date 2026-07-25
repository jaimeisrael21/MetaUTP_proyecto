import type { StudentStatus } from "./types";

export type CertificationKind = "utp" | "preparation" | "external" | "convalidation";

interface CertificationRequirementBase {
  id: string;
  description: string;
}

export type CertificationRequirement =
  | (CertificationRequirementBase & { kind: "career" })
  | (CertificationRequirementBase & {
      kind: "profile_fact";
      field: "enrolledCurrentTerm" | "englishIVPassed" | "englishCertificate";
      expected: "yes" | "no";
    })
  | (CertificationRequirementBase & {
      kind: "student_status";
      allowed: StudentStatus[];
    })
  | (CertificationRequirementBase & {
      kind: "cycle";
      min: number;
      max?: number;
    })
  | (CertificationRequirementBase & {
      kind: "course";
      courseNames: string[];
    })
  | (CertificationRequirementBase & {
      kind: "official";
      note: string;
    });

export interface CertificationSource {
  label: string;
  url: string;
  note?: string;
}

export type CertificationClarificationBasis =
  | "official"
  | "orientative"
  | "pending";

export interface CertificationClarification {
  label: string;
  plainMeaning: string;
  usefulness: string;
  basis: CertificationClarificationBasis;
  sourceIndex?: number;
}

export interface CertificationPath {
  id: string;
  title: string;
  kind: CertificationKind;
  issuer: string;
  summary: string;
  whatItIs: string;
  whyItMatters: string;
  practicalUses: string[];
  careers?: string[];
  requirements: CertificationRequirement[];
  characteristics: string[];
  clarifications?: CertificationClarification[];
  nextStep: string;
  availabilityLabel: string;
  sources: CertificationSource[];
  verifiedAt: string;
  searchTerms?: string[];
}

const SOFTWARE_CAREERS = ["ingenieria de software"];
const SYSTEMS_CAREERS = ["ingenieria de sistemas e informatica", "ingenieria de sistemas"];
const SOFTWARE_AND_SYSTEMS = [...SOFTWARE_CAREERS, ...SYSTEMS_CAREERS];

const SOFTWARE_PROGRESSIVE_CLARIFICATIONS: CertificationClarification[] = [
  {
    label: "Tutor STEM - Física",
    plainMeaning: "Interpretación orientativa: el título relaciona la credencial con el dominio y apoyo entre pares en contenidos de Física. La fuente pública no define sus evaluaciones ni habilita por sí sola una función docente formal.",
    usefulness: "Puede ayudarte a evidenciar bases cuantitativas y capacidad para explicar problemas técnicos.",
    basis: "orientative",
  },
  {
    label: "Tutor STEM - Matemática",
    plainMeaning: "Interpretación orientativa: el título vincula la credencial con el manejo y apoyo en contenidos de Matemática. UTP no publica en la malla el alcance exacto de la tutoría.",
    usefulness: "Puede respaldar razonamiento lógico, resolución de problemas y apoyo académico entre estudiantes.",
    basis: "orientative",
  },
  {
    label: "Tutor STEM - Algorítmica",
    plainMeaning: "Interpretación orientativa: se relaciona con comprender y explicar lógica de programación y resolución de problemas mediante algoritmos. El temario y la evaluación deben confirmarse con la facultad.",
    usefulness: "Puede ser útil para demostrar fundamentos de programación y comunicación técnica.",
    basis: "orientative",
  },
  {
    label: "Excel Intermedio",
    plainMeaning: "El nombre indica un nivel intermedio de uso de hojas de cálculo, pero la fuente pública no detalla funciones, herramientas ni prueba de certificación.",
    usefulness: "Puede apoyar tareas de organización, análisis y presentación de datos.",
    basis: "orientative",
  },
  {
    label: "Desarrollador de Aplicaciones Móviles",
    plainMeaning: "El título se refiere al desarrollo de aplicaciones para dispositivos móviles. La malla pública no especifica plataforma, tecnología, proyecto exigido ni proceso de emisión.",
    usefulness: "Puede servir como evidencia académica para un portafolio orientado a desarrollo móvil.",
    basis: "orientative",
  },
  {
    label: "Soporte Técnico de Computadoras",
    plainMeaning: "Interpretación orientativa: se vincula con diagnóstico, configuración y solución de incidencias básicas de hardware o software. El alcance exacto no está publicado.",
    usefulness: "Puede respaldar competencias iniciales de asistencia técnica y mantenimiento.",
    basis: "orientative",
  },
];

const SYSTEMS_PROGRESSIVE_CLARIFICATIONS: CertificationClarification[] = [
  {
    label: "Asistente de Docencia en Matemática",
    plainMeaning: "Interpretación orientativa: el título sugiere dominio y apoyo académico en Matemática. No equivale automáticamente a un nombramiento docente ni define funciones laborales.",
    usefulness: "Puede evidenciar razonamiento cuantitativo y capacidad para acompañar el aprendizaje de otros.",
    basis: "orientative",
  },
  {
    label: "Asistente de Docencia en Física",
    plainMeaning: "Interpretación orientativa: el título se relaciona con dominio y apoyo académico en Física. La fuente pública no detalla responsabilidades ni evaluación.",
    usefulness: "Puede reforzar un perfil con bases científicas y capacidad de explicación.",
    basis: "orientative",
  },
  {
    label: "Asistente de Docencia en Algorítmica",
    plainMeaning: "Interpretación orientativa: se vincula con fundamentos algorítmicos y apoyo en la comprensión de lógica de programación. UTP debe confirmar el alcance.",
    usefulness: "Puede respaldar competencias de programación, análisis y comunicación técnica.",
    basis: "orientative",
  },
  {
    label: "Asesor en Excel Intermedio",
    plainMeaning: "El título sugiere capacidad para orientar el uso intermedio de hojas de cálculo, pero la malla no publica una matriz concreta de herramientas o funciones.",
    usefulness: "Puede ser útil en tareas de análisis, reportes y organización de información.",
    basis: "orientative",
  },
  {
    label: "Desarrollador de Aplicaciones Móviles",
    plainMeaning: "El título se refiere al desarrollo de aplicaciones móviles; la tecnología, el proyecto exigido y el procedimiento de emisión deben confirmarse con la facultad.",
    usefulness: "Puede aportar una evidencia académica para un portafolio de desarrollo móvil.",
    basis: "orientative",
  },
];

const CISCO_CLARIFICATIONS: CertificationClarification[] = [
  {
    label: "Proveedor tecnológico: Cisco",
    plainMeaning: "UTP publica a Cisco como proveedor o aliado tecnológico relacionado con estas carreras.",
    usefulness: "Te permite identificar el ecosistema tecnológico de la ruta antes de consultar la credencial concreta.",
    basis: "official",
  },
  {
    label: "La credencial concreta puede variar según el plan o la oferta vigente",
    plainMeaning: "La página pública de UTP no identifica el nombre exacto, nivel, curso ni convocatoria de la credencial disponible para cada estudiante.",
    usefulness: "Evita que te prepares para un examen distinto del que realmente ofrece tu facultad.",
    basis: "pending",
  },
  {
    label: "No se presenta como CCNA hasta que UTP identifique oficialmente esa ruta",
    plainMeaning: "Cisco ofrece varias certificaciones. Mencionar al proveedor no demuestra que la oportunidad publicada por UTP corresponda específicamente a CCNA.",
    usefulness: "Protege la recomendación frente a una asociación incorrecta y te indica qué preguntar a la facultad.",
    basis: "pending",
  },
];

const IBM_CLARIFICATIONS: CertificationClarification[] = [
  {
    label: "Quién ofrece esta ruta: IBM",
    plainMeaning:
      "UTP publica que los estudiantes de Ingeniería de Software pueden acceder a certificaciones de IBM. Esa mención confirma al proveedor, pero no identifica por sí sola el nombre de la credencial que corresponde a tu plan.",
    usefulness:
      "Te ayuda a distinguir la empresa que respalda la ruta de la credencial concreta que todavía debes consultar.",
    basis: "official",
  },
  {
    label: "Qué es una credencial digital de IBM",
    plainMeaning:
      "IBM SkillsBuild describe sus credenciales digitales como registros verificables en línea de habilidades y conocimientos. Según la credencial, pueden exigir actividades de aprendizaje, cuestionarios, exámenes, proyectos o revisiones.",
    usefulness:
      "Una vez obtenida, puede compartirse en el CV, LinkedIn u otros perfiles para mostrar el aprendizaje verificado.",
    basis: "official",
    sourceIndex: 1,
  },
  {
    label: "Qué debe confirmar UTP antes de inscribirte",
    plainMeaning:
      "La página de la carrera no publica qué credencial IBM está activa, ni su curso habilitante, duración o convocatoria. Esos datos deben venir de la facultad o de un enlace institucional vigente.",
    usefulness:
      "Evita que completes una ruta pública de IBM diferente de la que UTP reconoce para tu carrera.",
    basis: "pending",
  },
];

const HUAWEI_CLARIFICATIONS: CertificationClarification[] = [
  {
    label: "Quién ofrece la formación: Huawei ICT Academy",
    plainMeaning:
      "Huawei ICT Academy es un programa de cooperación con instituciones educativas para impartir formación en tecnologías Huawei y fomentar certificaciones. UTP fue nombrada miembro de esta academia en 2020.",
    usefulness:
      "Te permite entender que no es una asignatura genérica: la formación está vinculada al ecosistema tecnológico de Huawei.",
    basis: "official",
  },
  {
    label: "Cómo se organizan los niveles: HCIA, HCIP y HCIE",
    plainMeaning:
      "Huawei organiza oficialmente sus certificaciones profesionales en tres niveles: HCIA (Associate o asociado), HCIP (Professional o profesional) y HCIE (Expert o experto). Cada especialidad y nivel tiene evaluaciones propias.",
    usefulness:
      "Sirve para ubicar si la ruta disponible es inicial, profesional o experta; el nivel exacto no debe suponerse sin la convocatoria UTP.",
    basis: "official",
    sourceIndex: 1,
  },
  {
    label: "Qué especialidad y convocatoria están disponibles",
    plainMeaning:
      "UTP anunció formación en áreas como inteligencia artificial, Big Data, IoT, nube, comunicaciones y almacenamiento, pero ese anuncio no confirma cuáles siguen abiertas hoy ni para qué sede o carrera.",
    usefulness:
      "Te indica qué preguntar a la facultad antes de prepararte o pagar por un examen específico.",
    basis: "pending",
  },
];

const careerRequirement = (id: string, description: string): CertificationRequirement => ({
  id,
  description,
  kind: "career",
});

const institutionalRequirement = (
  id: string,
  description: string,
  note: string
): CertificationRequirement => ({ id, description, kind: "official", note });

export const certificationPaths: CertificationPath[] = [
  {
    id: "software-progressive",
    title: "Certificaciones progresivas de Ingeniería de Software",
    kind: "utp",
    issuer: "UTP",
    summary:
      "Credenciales asociadas a la carrera que pueden obtenerse durante el avance académico, sin esperar al bachillerato.",
    whatItIs:
      "Es un conjunto de credenciales académicas que UTP vincula al avance dentro de Ingeniería de Software. La facultad debe confirmar cuál corresponde a tu plan y cómo se emite.",
    whyItMatters:
      "Puede documentar competencias específicas antes de terminar la carrera. Solo debe presentarse como certificación obtenida cuando UTP haya confirmado y emitido la credencial.",
    practicalUses: [
      "Agregar la credencial emitida a tu CV o portafolio",
      "Reconocer qué competencias ya desarrollaste durante la carrera",
      "Consultar la emisión mientras tus cursos aprobados están actualizados",
    ],
    careers: SOFTWARE_CAREERS,
    requirements: [
      careerRequirement("software-career", "Pertenecer a Ingeniería de Software"),
      institutionalRequirement(
        "software-academic-milestone",
        "Cumplir el curso, ciclo o bloque académico habilitante",
        "La malla pública enumera las certificaciones, pero no identifica qué cursos o ciclos habilitan cada una. Confírmalo con tu facultad."
      ),
      institutionalRequirement(
        "software-issuance",
        "Cumplir el procedimiento de emisión correspondiente a tu plan de estudios",
        "La emisión y la vigencia de cada certificación dependen de la validación de la facultad."
      ),
    ],
    characteristics: [
      "Tutor STEM - Física",
      "Tutor STEM - Matemática",
      "Tutor STEM - Algorítmica",
      "Excel Intermedio",
      "Desarrollador de Aplicaciones Móviles",
      "Soporte Técnico de Computadoras",
    ],
    clarifications: SOFTWARE_PROGRESSIVE_CLARIFICATIONS,
    nextStep:
      "Consulta a tu facultad cuál corresponde a tu plan vigente y qué cursos aprobados habilitan su emisión.",
    availabilityLabel: "Disponible durante el avance de la carrera",
    sources: [
      {
        label: "Brochure oficial - Ingeniería de Software UTP",
        url: "https://utp.edu.pe/sites/default/files/brochure/UTP_Ingenieria_de_Software.pdf",
        note: "Enumera seis certificaciones progresivas, pero no publica su matriz de cursos habilitantes.",
      },
      {
        label: "Página oficial - Ingeniería de Software UTP",
        url: "https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-software",
        note: "La página vigente muestra una oferta más breve; la facultad debe confirmar qué catálogo aplica a cada plan.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "systems-progressive",
    title: "Certificaciones progresivas de Sistemas e Informática",
    kind: "utp",
    issuer: "UTP",
    summary:
      "Credenciales vinculadas al desarrollo de competencias dentro de Ingeniería de Sistemas e Informática.",
    whatItIs:
      "Es un conjunto de credenciales académicas que UTP asocia con competencias desarrolladas en Ingeniería de Sistemas e Informática.",
    whyItMatters:
      "Puede convertir parte de tu avance académico en una evidencia adicional para el CV o portafolio, siempre que la facultad confirme y emita la credencial.",
    practicalUses: [
      "Mostrar una competencia concreta además de tu avance general en la carrera",
      "Identificar fortalezas para prácticas, proyectos o tutorías",
      "Solicitar a la facultad la ruta de emisión aplicable a tu plan",
    ],
    careers: SYSTEMS_CAREERS,
    requirements: [
      careerRequirement(
        "systems-career",
        "Pertenecer a Ingeniería de Sistemas e Informática"
      ),
      institutionalRequirement(
        "systems-academic-milestone",
        "Cumplir el curso, ciclo o bloque académico habilitante",
        "La malla pública no especifica qué asignaturas habilitan la emisión de cada certificación. Confírmalo con tu facultad."
      ),
      institutionalRequirement(
        "systems-issuance",
        "Cumplir el procedimiento de emisión correspondiente a tu plan de estudios",
        "La facultad debe validar la certificación aplicable, su vigencia y el procedimiento de emisión."
      ),
    ],
    characteristics: [
      "Asistente de Docencia en Matemática",
      "Asistente de Docencia en Física",
      "Asistente de Docencia en Algorítmica",
      "Asesor en Excel Intermedio",
      "Desarrollador de Aplicaciones Móviles",
    ],
    clarifications: SYSTEMS_PROGRESSIVE_CLARIFICATIONS,
    nextStep:
      "Contrasta tu plan y tus cursos aprobados con la facultad antes de solicitar una constancia o certificación.",
    availabilityLabel: "Disponible durante el avance de la carrera",
    sources: [
      {
        label: "Malla oficial - Ingeniería de Sistemas e Informática UTP",
        url: "https://www.utp.edu.pe/sites/default/files/mallas/MALLA_Ingenieria_de_Sistemas_e_Informatica.pdf",
        note: "Publica el catálogo, pero no la matriz de cursos, ciclos o notas para emitir cada certificación.",
      },
      {
        label: "Página oficial - Ingeniería de Sistemas e Informática UTP",
        url: "https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-sistemas-e-informatica",
        note: "La página vigente muestra una oferta más breve; la facultad debe confirmar el catálogo aplicable.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "technology-cisco",
    title: "Certificaciones Cisco para tu carrera",
    kind: "external",
    issuer: "Cisco - acceso anunciado por UTP",
    summary:
      "Una ruta tecnológica que puede pasar desapercibida: UTP anuncia acceso a certificaciones Cisco para estudiantes de Software y Sistemas.",
    whatItIs:
      "Es una posible ruta hacia credenciales tecnológicas de Cisco anunciada por UTP para estas carreras. Cisco ofrece varias certificaciones, por lo que el nombre exacto debe confirmarse.",
    whyItMatters:
      "Una credencial concreta puede validar conocimientos del área tecnológica que evalúa. Mencionar a Cisco por sí solo no permite afirmar que la ruta sea CCNA ni que esté abierta ahora.",
    practicalUses: [
      "Orientar tu preparación cuando UTP confirme la credencial exacta",
      "Añadir al CV una certificación que realmente hayas obtenido",
      "Comparar el alcance de la ruta con puestos o prácticas relacionados",
    ],
    careers: SOFTWARE_AND_SYSTEMS,
    requirements: [
      careerRequirement(
        "cisco-career",
        "Pertenecer a Ingeniería de Software o Ingeniería de Sistemas e Informática"
      ),
      institutionalRequirement(
        "cisco-current-route",
        "Identificar la certificación o módulo Cisco disponible actualmente",
        "La fuente UTP menciona a Cisco, pero no publica el nombre de la credencial ni una convocatoria vigente."
      ),
      institutionalRequirement(
        "cisco-entry-rules",
        "Cumplir el ciclo, curso o condiciones de acceso de la ruta seleccionada",
        "Las condiciones dependen de la certificación concreta y deben confirmarse con la facultad; no se presume que la ruta sea CCNA."
      ),
    ],
    characteristics: [
      "Proveedor tecnológico: Cisco",
      "La credencial concreta puede variar según el plan o la oferta vigente",
      "No se presenta como CCNA hasta que UTP identifique oficialmente esa ruta",
    ],
    clarifications: CISCO_CLARIFICATIONS,
    nextStep:
      "Pregunta a tu facultad qué ruta Cisco está disponible para tu carrera, sede y ciclo, y cómo se accede.",
    availabilityLabel: "Oferta y convocatoria por confirmar",
    sources: [
      {
        label: "Página oficial - Ingeniería de Software UTP",
        url: "https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-software",
        note: "UTP anuncia acceso a certificaciones Cisco, sin identificar una credencial concreta.",
      },
      {
        label: "Certificaciones oficiales de Cisco",
        url: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/index.html",
        note: "Cada certificación de Cisco tiene su propio examen y condiciones.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "technology-ibm",
    title: "Credenciales IBM para tu carrera",
    kind: "external",
    issuer: "IBM - acceso anunciado por UTP",
    summary:
      "UTP incluye a IBM entre sus aliados tecnológicos, por lo que conviene confirmar las credenciales disponibles antes de dejar pasar la ruta.",
    whatItIs:
      "Es una posible ruta hacia credenciales tecnológicas de IBM anunciada por UTP. IBM ofrece credenciales digitales verificables, pero la página de la carrera no identifica cuál está disponible para cada estudiante.",
    whyItMatters:
      "La credencial obtenida puede demostrar habilidades verificadas y compartirse en el CV o LinkedIn. Su valor concreto depende del tema, nivel y evaluación de la insignia que UTP confirme.",
    practicalUses: [
      "Compartir una credencial obtenida en el CV o LinkedIn",
      "Demostrar aprendizaje en el tema específico de la insignia",
      "Elegir una ruta de estudio solo después de confirmar la oferta UTP",
    ],
    careers: SOFTWARE_AND_SYSTEMS,
    requirements: [
      careerRequirement(
        "ibm-career",
        "Pertenecer a Ingeniería de Software o Ingeniería de Sistemas e Informática"
      ),
      institutionalRequirement(
        "ibm-current-credential",
        "Identificar la credencial IBM disponible para tu plan y periodo",
        "La fuente UTP menciona al proveedor, pero no identifica una insignia o certificado concreto."
      ),
      institutionalRequirement(
        "ibm-completion-rules",
        "Completar las actividades y evaluaciones de la credencial seleccionada",
        "IBM define requisitos diferentes para cada credencial; deben evaluarse cuando UTP confirme el nombre exacto."
      ),
    ],
    characteristics: [
      "Quién ofrece esta ruta: IBM",
      "Qué es una credencial digital de IBM",
      "Qué debe confirmar UTP antes de inscribirte",
    ],
    clarifications: IBM_CLARIFICATIONS,
    nextStep:
      "Consulta a tu facultad cuál es la credencial IBM activa y solicita el enlace o convocatoria institucional.",
    availabilityLabel: "Oferta y credencial por confirmar",
    sources: [
      {
        label: "Página oficial - Ingeniería de Software UTP",
        url: "https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-software",
        note: "UTP anuncia acceso a certificaciones IBM, sin precisar una credencial.",
      },
      {
        label: "IBM SkillsBuild - preguntas sobre credenciales digitales",
        url: "https://skillsbuild.org/frequently-asked-questions?pageAction=openChat",
        note: "Explica qué contienen las credenciales digitales, cómo se obtienen y cómo pueden compartirse; no identifica la credencial ofrecida por UTP.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "technology-huawei",
    title: "Certificaciones Huawei para tu carrera",
    kind: "external",
    issuer: "Huawei ICT Academy - acceso anunciado por UTP",
    summary:
      "UTP anunció su incorporación a Huawei ICT Academy y rutas tecnológicas; la vigencia, el nivel y la especialidad deben confirmarse para cada convocatoria.",
    whatItIs:
      "Es una ruta de formación y certificación en tecnologías Huawei vinculada a Huawei ICT Academy. UTP anunció su incorporación a la academia, pero debe confirmar la especialidad y convocatoria vigentes.",
    whyItMatters:
      "Una certificación obtenida puede demostrar competencias de la especialidad y el nivel evaluados. No garantiza empleo y no debe suponerse un nivel HCIA, HCIP o HCIE sin la convocatoria exacta.",
    practicalUses: [
      "Seguir una ruta de aprendizaje estructurada por especialidad y nivel",
      "Presentar la certificación obtenida como evidencia verificable",
      "Explorar actividades ICT Academy cuando UTP anuncie que están activas",
    ],
    careers: SOFTWARE_AND_SYSTEMS,
    requirements: [
      careerRequirement(
        "huawei-career",
        "Pertenecer a Ingeniería de Software o Ingeniería de Sistemas e Informática"
      ),
      institutionalRequirement(
        "huawei-current-track",
        "Identificar la ruta Huawei y el nivel disponibles actualmente",
        "Huawei ofrece diferentes áreas y niveles HCIA, HCIP y HCIE; UTP no publica cuál corresponde a cada estudiante."
      ),
      institutionalRequirement(
        "huawei-track-rules",
        "Cumplir la formación y evaluación de la ruta seleccionada",
        "Los requisitos dependen del nivel y especialidad que confirme la facultad."
      ),
    ],
    characteristics: [
      "Quién ofrece la formación: Huawei ICT Academy",
      "Cómo se organizan los niveles: HCIA, HCIP y HCIE",
      "Qué especialidad y convocatoria están disponibles",
    ],
    clarifications: HUAWEI_CLARIFICATIONS,
    nextStep:
      "Solicita a tu facultad la ruta Huawei vigente para tu carrera, sede y avance académico.",
    availabilityLabel: "Ruta, nivel y convocatoria por confirmar",
    sources: [
      {
        label: "Anuncio UTP de incorporación a Huawei ICT Academy",
        url: "https://www.utp.edu.pe/noticias/utp-nombrada-miembro-huawei-ict-academy",
        note: "Antecedente institucional de la alianza; no confirma por sí solo una convocatoria vigente.",
      },
      {
        label: "Sistema oficial de certificaciones Huawei",
        url: "https://e.huawei.com/en/talent/cert/",
        note: "Presenta los niveles y campos de certificación disponibles en Huawei.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "google-associate-cloud-engineer",
    title: "Google Associate Cloud Engineer",
    kind: "external",
    issuer: "Google Cloud - preparación anunciada por UTP",
    summary:
      "Ingeniería de Software anuncia una ruta para prepararte hacia la certificación Associate Cloud Engineer de Google Cloud.",
    whatItIs:
      "Es una certificación externa de Google Cloud obtenida mediante un examen oficial. UTP anuncia una ruta de preparación para estudiantes de Ingeniería de Software.",
    whyItMatters:
      "Valida conocimientos para desplegar, proteger y operar soluciones en Google Cloud dentro del alcance publicado para el examen.",
    practicalUses: [
      "Guiar tu práctica con los objetivos oficiales del examen",
      "Añadir la certificación aprobada a tu CV o LinkedIn",
      "Sustentar conocimientos para prácticas o roles iniciales de nube",
    ],
    careers: SOFTWARE_CAREERS,
    requirements: [
      careerRequirement("google-ace-career", "Pertenecer a Ingeniería de Software"),
      institutionalRequirement(
        "google-ace-utp-route",
        "Confirmar que la ruta de preparación UTP esté disponible en tu periodo",
        "La página de la carrera anuncia la certificación, pero no publica ciclo, curso de acceso, costo ni convocatoria."
      ),
      institutionalRequirement(
        "google-ace-exam",
        "Aprobar el examen oficial Associate Cloud Engineer",
        "Google no exige prerrequisitos formales, pero la certificación solo se obtiene al aprobar su examen oficial."
      ),
    ],
    characteristics: [
      "Google recomienda seis meses o más de experiencia práctica",
      "Examen de 2 horas disponible en español",
      "Precio oficial publicado: USD 125 más impuestos",
      "Vigencia de la certificación: 3 años",
    ],
    nextStep:
      "Confirma con tu facultad la ruta UTP vigente y revisa directamente la guía oficial del examen de Google Cloud.",
    availabilityLabel: "Ruta UTP por confirmar; examen externo disponible",
    sources: [
      {
        label: "Página oficial - Ingeniería de Software UTP",
        url: "https://www.utp.edu.pe/pregrado/facultad-de-ingenieria/ingenieria-de-software",
        note: "UTP indica que sus estudiantes pueden certificarse como Associate Cloud Engineer.",
      },
      {
        label: "Google Cloud - Associate Cloud Engineer",
        url: "https://cloud.google.com/learn/certification/cloud-engineer",
        note: "Fuente oficial del examen, precio, idioma, recomendación de experiencia y vigencia.",
      },
    ],
    verifiedAt: "2026-07-25",
  },
  {
    id: "english-discoveries-toeic",
    title: "English Discoveries: preparación para TOEIC",
    kind: "preparation",
    issuer: "UTP - preparación; TOEIC - evaluación externa",
    summary:
      "Programa virtual de inglés que prepara al estudiante para rendir TOEIC y que exige matrícula e Inglés IV.",
    whatItIs:
      "Es un programa virtual de preparación en inglés ofrecido por UTP. Participar en English Discoveries no equivale a obtener automáticamente una certificación TOEIC.",
    whyItMatters:
      "Te permite practicar por niveles y prepararte para una evaluación externa de inglés con una ruta guiada de diez semanas.",
    practicalUses: [
      "Conocer tu nivel mediante el Placement Test",
      "Practicar inglés de forma estructurada y virtual",
      "Decidir posteriormente si rendir una evaluación TOEIC externa",
    ],
    requirements: [
      {
        id: "english-discoveries-enrolled",
        description: "Estar matriculado en el periodo académico actual",
        kind: "profile_fact",
        field: "enrolledCurrentTerm",
        expected: "yes",
      },
      {
        id: "english-discoveries-english-four",
        description: "Haber aprobado o convalidado Inglés IV",
        kind: "profile_fact",
        field: "englishIVPassed",
        expected: "yes",
      },
      institutionalRequirement(
        "english-discoveries-placement",
        "Rendir el Placement Test y obtener una vacante",
        "El examen es obligatorio, pero UTP no publica el puntaje de corte; la admisión y el nivel se comunican por correo institucional."
      ),
    ],
    characteristics: [
      "Modalidad online con acceso 24/7",
      "Ciclos de 10 semanas",
      "Costo publicado: S/35 por ciclo",
      "Preparación para TOEIC; participar no entrega automáticamente la certificación",
    ],
    nextStep:
      "Revisa la convocatoria, rinde el Placement Test y espera la confirmación de vacante en tu correo UTP.",
    availabilityLabel: "Próxima convocatoria publicada: agosto de 2026",
    sources: [
      {
        label: "UTP Empleabilidad - English Discoveries",
        url: "https://www.utp.edu.pe/empleabilidad/alumnos/english-discoveries",
        note: "Publica los requisitos iniciales, duración, costo y próxima convocatoria.",
      },
      {
        label: "Micrositio oficial - English Discoveries",
        url: "https://empleabilidadutp.my.canva.site/englishdiscoveries",
        note: "Detalla el Placement Test obligatorio y la asignación de vacantes por correo UTP.",
      },
    ],
    verifiedAt: "2026-07-25",
    searchTerms: [
      "inglés",
      "certificación de inglés",
      "TOEIC",
      "preparación TOEIC",
      "examen internacional",
    ],
  },
  {
    id: "english-external-convalidation",
    title: "TOEFL, Cambridge, IELTS y otros exámenes reconocidos por UTP",
    kind: "convalidation",
    issuer: "Entidad externa; convalidación evaluada por UTP",
    summary:
      "Conoce qué exámenes y puntajes acepta la UTP para solicitar la convalidación de cursos de Inglés.",
    whatItIs:
      "Es una ruta de convalidación académica para resultados externos como TOEFL, TOEIC, IELTS y los exámenes Cambridge. La UTP reconoce determinados exámenes y puntajes; no emite esas certificaciones ni garantiza la aprobación automática.",
    whyItMatters:
      "Si tu documento, puntaje y modalidad cumplen el lineamiento, la aprobación puede evitar que curses algunos niveles de Inglés del plan de estudios.",
    practicalUses: [
      "Comparar tu certificado y puntaje con el lineamiento vigente",
      "Solicitar la convalidación dentro del calendario académico",
      "Planificar los cursos de inglés que aún necesitarías completar",
    ],
    requirements: [
      {
        id: "external-english-certificate",
        description: "Contar con un certificado de inglés vigente",
        kind: "profile_fact",
        field: "englishCertificate",
        expected: "yes",
      },
      institutionalRequirement(
        "external-english-cohort",
        "Cumplir las condiciones de fecha de ingreso y submodalidad de admisión",
        "Para ingresantes desde marzo de 2025, la V02 limita la convalidación a determinadas submodalidades y a Inglés I-III."
      ),
      institutionalRequirement(
        "external-english-score",
        "Presentar un examen, institución y puntaje aceptados por el lineamiento vigente",
        "Tener un certificado genérico no confirma que la entidad, examen, nivel y puntaje sean aceptados."
      ),
      institutionalRequirement(
        "external-english-approval",
        "Obtener la aprobación oficial de la solicitud de convalidación",
        "La validación final corresponde a UTP y está sujeta al procedimiento y plazo del periodo académico."
      ),
    ],
    characteristics: [
      "TOEFL: iBT 41+, ITP 343+ o PBT 476+",
      "Cambridge: KET A2 Grade B, PET B1, FCE B2, CAE C1 o CPE C2",
      "IELTS: banda 3.5; TOEIC: 385+",
      "También se reconocen EnglishScore, ECCE, ECPE, IB English, MET, Oxford y Pearson con el nivel publicado",
      "Ingresantes hasta agosto de 2024: posible convalidación de Inglés I-IV",
      "Ingresantes desde marzo de 2025: posible convalidación de Inglés I-III según submodalidad",
    ],
    clarifications: [
      {
        label: "TOEFL: iBT 41+, ITP 343+ o PBT 476+",
        plainMeaning: "TOEFL es una familia de exámenes de ETS. La guía UTP vigente publica un puntaje mínimo distinto para cada modalidad.",
        usefulness: "El resultado puede servir para solicitar la convalidación de cursos de Inglés si también cumples las demás condiciones del lineamiento.",
        basis: "official",
        sourceIndex: 1,
      },
      {
        label: "Cambridge: KET A2 Grade B, PET B1, FCE B2, CAE C1 o CPE C2",
        plainMeaning: "Son certificaciones de Cambridge English para distintos niveles, desde A2 hasta C2. La UTP publica qué nivel mínimo reconoce en cada caso.",
        usefulness: "Un certificado aceptado puede respaldar una solicitud de convalidación; la revisión documental final corresponde a la UTP.",
        basis: "official",
        sourceIndex: 1,
      },
      {
        label: "IELTS: banda 3.5; TOEIC: 385+",
        plainMeaning: "La guía UTP incluye IELTS y TOEIC entre los exámenes internacionales aceptados y señala esos puntajes mínimos.",
        usefulness: "Permite comprobar rápidamente si tu resultado alcanza el umbral publicado antes de iniciar el trámite.",
        basis: "official",
        sourceIndex: 1,
      },
      {
        label: "También se reconocen EnglishScore, ECCE, ECPE, IB English, MET, Oxford y Pearson con el nivel publicado",
        plainMeaning: "La lista oficial no se limita a TOEFL o Cambridge: incluye otras evaluaciones y certificaciones con niveles o resultados mínimos específicos.",
        usefulness: "Puedes verificar alternativas que quizá ya rendiste sin asumir que cualquier certificado genérico será aceptado.",
        basis: "official",
        sourceIndex: 1,
      },
    ],
    nextStep:
      "Compara tu fecha de ingreso, submodalidad, entidad, examen y puntaje con el lineamiento V02 antes de solicitar la convalidación.",
    availabilityLabel: "Procedimiento sujeto al calendario académico",
    sources: [
      {
        label: "Lineamiento UTP V02 - Convalidación del curso de Inglés",
        url: "https://www.utp.edu.pe/web/sites/default/files/2025-06/DAG-LN001-Lineamientos-para-la-convalidaci%C3%B3n-del-curso-de-Ingles-en-el-plan-de-estudios-v02-PT.pdf",
        note: "Versión vigente aprobada por Resolución Rectoral 107-2025.",
      },
      {
        label: "Guía del Egresado Pregrado UTP V14 - Anexo 2",
        url: "https://www.utp.edu.pe/web/sites/default/files/2026-05/Guia_del_egresado_Pregrado_V14_PT.pdf",
        note: "Publica los exámenes internacionales y puntajes mínimos aceptados para convalidar cursos de Inglés.",
      },
    ],
    verifiedAt: "2026-07-25",
    searchTerms: [
      "inglés",
      "certificaciones de inglés",
      "exámenes internacionales",
      "TOEFL",
      "TOEFL iBT",
      "TOEFL ITP",
      "TOEFL PBT",
      "TOEIC",
      "IELTS",
      "Cambridge",
      "KET",
      "PET",
      "FCE",
      "CAE",
      "CPE",
      "EnglishScore",
      "Michigan",
      "Oxford",
      "Pearson",
      "convalidación de inglés",
    ],
  },
  {
    id: "utp-english-proficiency",
    title: "Examen de suficiencia de Inglés UTP",
    kind: "utp",
    issuer: "UTP",
    summary:
      "Alternativa institucional para acreditar niveles de Inglés del plan de estudios sin presentar un certificado externo.",
    whatItIs:
      "Es una evaluación interna de UTP para acreditar niveles de Inglés del plan de estudios. No es una certificación internacional externa.",
    whyItMatters:
      "Si alcanzas el resultado exigido y UTP lo valida, puedes acreditar niveles de inglés sin presentar un certificado de otra institución.",
    practicalUses: [
      "Elegir una alternativa a la convalidación con certificado externo",
      "Planificar qué niveles del plan podrías acreditar",
      "Conservar el resultado institucional validado por UTP",
    ],
    requirements: [
      {
        id: "utp-english-student",
        description: "Tener condición de estudiante UTP",
        kind: "student_status",
        allowed: ["active"],
      },
      institutionalRequirement(
        "utp-english-registration",
        "Registrarse según el procedimiento y cronograma vigentes",
        "La programación y los canales de solicitud deben confirmarse para el periodo académico actual."
      ),
      institutionalRequirement(
        "utp-english-level-score",
        "Alcanzar al menos 10 respuestas correctas de 15 en cada nivel",
        "Los niveles se aprueban secuencialmente y el resultado debe ser validado por UTP."
      ),
    ],
    characteristics: [
      "Evaluación 100% virtual y supervisada",
      "60 preguntas en 60 minutos",
      "Evaluación secuencial de los niveles del plan de estudios",
      "Disponible sin restricción por fecha de ingreso",
    ],
    nextStep:
      "Consulta el procedimiento vigente en UTP+INFO y solicita la evaluación mediante el canal institucional indicado.",
    availabilityLabel: "Cronograma y procedimiento por confirmar",
    sources: [
      {
        label: "Lineamiento UTP V02 - Convalidación del curso de Inglés",
        url: "https://www.utp.edu.pe/web/sites/default/files/2025-06/DAG-LN001-Lineamientos-para-la-convalidaci%C3%B3n-del-curso-de-Ingles-en-el-plan-de-estudios-v02-PT.pdf",
        note: "Regula el examen de suficiencia, sus niveles y puntajes mínimos.",
      },
    ],
    verifiedAt: "2026-07-25",
    searchTerms: [
      "inglés",
      "examen de inglés UTP",
      "suficiencia de inglés",
      "acreditar inglés",
      "convalidación de inglés",
    ],
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
