import type { Opportunity } from "./types";

// Fuente de todos los datos: UTP_PDFs_Oficiales/ (extraído de info.utp.edu.pe y del
// Reglamento de Becas de Pregrado). Catálogo revisado al 2026-07-25.
// No se inventó ninguna fecha, monto ni umbral que no estuviera en las fuentes.

export const opportunities: Opportunity[] = [
  // ========================================================================
  // BECAS — 7 con artículo individual en UTP+ Info + 6 solo del Reglamento
  // ========================================================================
  {
    id: "beca-cultura",
    title: "Beca Cultura",
    category: "Becas",
    shortDescription:
      "25% de descuento en pensiones para integrantes destacados de elencos culturales UTP.",
    longDescription:
      "Beneficio para alumnos continuos de Pregrado Regular y CGT que integran elencos culturales de la UTP y cuentan con participación y reconocimiento en competencias culturales oficiales a nivel regional, nacional o internacional representando a la universidad. Otorga 25% de descuento en las pensiones, previa evaluación.",
    requirements: [
      {
        id: "beca-cultura-req-1",
        description:
          "Ser integrante de un elenco cultural UTP con participación y reconocimiento en competencias culturales oficiales (regional, nacional o internacional) representando a la universidad.",
        type: "non_verifiable",
        nonVerifiableNote:
          "Se evalúa mediante un informe técnico del docente de la disciplina, emitido por Servicios Universitarios de la UTP; la app no puede confirmar este reconocimiento por sí sola.",
      },
      {
        id: "beca-cultura-req-2",
        description: "Ser alumno continuo de Pregrado Regular o CGT.",
        type: "boolean",
      },
      {
        id: "beca-cultura-req-3",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular anterior.",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
        metric: "last_period_gpa",
      },
    ],
    windowStart: "2026-07-17",
    windowEnd: "2026-07-31",
    cost: "Sin costo",
    source: {
      label: "UTP+ Info — Beca Cultura",
      url: "https://info.utp.edu.pe/articulo/KA-01920",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Registra tu solicitud en UTP+ Portal → Trámites → Solicitudes SAE → Beca Cultura y adjunta los documentos indicados en el Reglamento de Becas Pregrado (capítulo X). Respuesta en 5 días hábiles.",
  },
  {
    id: "beca-excelencia-deportiva",
    title: "Beca Excelencia Deportiva",
    category: "Becas",
    shortDescription:
      "25% de descuento en pensiones para deportistas UTP destacados en competencias locales, nacionales o internacionales.",
    longDescription:
      "Beneficio para alumnos continuos de Pregrado Regular y CGT que representan a la UTP como deportistas destacados en competencias deportivas locales, nacionales o internacionales. Otorga 25% de descuento en las cuotas, sujeto a evaluación del rendimiento deportivo mediante informe técnico del docente de la disciplina.",
    requirements: [
      {
        id: "beca-excelencia-deportiva-req-1",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular anterior (según el Reglamento de Becas de Pregrado).",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
      },
      {
        id: "beca-excelencia-deportiva-req-2",
        description:
          "Representar a la UTP como deportista destacado en competencias internas y externas, con rendimiento evaluado mediante informe técnico del docente de la disciplina.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La evaluación del rendimiento deportivo la realiza el área de Servicios Universitarios; la app no puede confirmarla.",
      },
      {
        id: "beca-excelencia-deportiva-req-3",
        description:
          "Ser alumno continuo de Pregrado Regular o CGT, y cumplir el resto de condiciones generales del Reglamento (sin deuda pendiente del periodo anterior, sin sanciones disciplinarias). Esta beca está exenta únicamente del requisito general de matrícula mínima de 18 horas de clase/semana.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La UTP valida esto internamente al procesar tu expediente; la app no tiene acceso a tu historial de pagos ni disciplinario.",
      },
    ],
    windowStart: "2026-07-17",
    windowEnd: "2026-07-31",
    cost: "Sin costo",
    source: {
      label: "UTP+ Info — Beca Excelencia Deportiva",
      url: "https://info.utp.edu.pe/articulo/KA-01750",
      sourceNote:
        "El umbral de promedio ponderado (12) se confirma cruzando con el Reglamento de Becas de Pregrado; el artículo individual no lo menciona explícitamente.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Registra tu solicitud en UTP+ Portal → Becas y Descuentos por Convenios, y adjunta los documentos del capítulo IX del Reglamento de Becas Pregrado. Respuesta en 5 días hábiles.",
  },
  {
    id: "beca-patronato-bcp",
    title: "Beca Patronato BCP",
    category: "Becas",
    shortDescription:
      "Cobertura completa de matrícula y pensiones durante 11 ciclos para postulantes de alto rendimiento y recursos limitados.",
    longDescription:
      "Programa externo del Patronato BCP en convenio con la UTP, dirigido a estudiantes con alto rendimiento académico y liderazgo, con recursos económicos limitados. Aplica solo a carreras presenciales definidas entre la UTP y el Patronato, según disponibilidad de cada sede. Cubre matrícula, pensiones y costos de titulación durante 11 ciclos consecutivos.",
    requirements: [
      {
        id: "beca-patronato-bcp-req-1",
        description:
          "Contar con alto rendimiento académico, habilidades de liderazgo y recursos económicos limitados, evaluados directamente por el Patronato BCP.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El proceso completo de postulación, evaluación socioeconómica y selección lo administra el Patronato BCP (concurso.postulabecasbcp.com), no la UTP; la app no tiene acceso a esos criterios de evaluación.",
      },
      {
        id: "beca-patronato-bcp-req-2",
        description:
          "Postular a una de las carreras presenciales elegibles del convenio UTP – Patronato BCP, según disponibilidad de la sede (incluye Ingeniería de Software e Ingeniería de Sistemas e Informática, entre otras).",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: "2027-01-10",
    cost: "Sin costo",
    source: {
      label: "UTP+ Info — Beca Patronato BCP",
      url: "https://info.utp.edu.pe/articulo/KA-01988",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Postula directamente en concurso.postulabecasbcp.com. Si cumples los requisitos y eliges la UTP, te programan el examen de admisión regular más próximo. Consultas: seleccion@patronatobcp.org.",
  },
  {
    id: "beca-por-discapacidad",
    title: "Beca por Discapacidad",
    category: "Becas",
    shortDescription:
      "Descuento de 10% a 50% para estudiantes con discapacidad permanente registrada en CONADIS. La ventana 2026-I cerró el 18 de julio.",
    longDescription:
      "Beneficio para alumnos continuos de Pregrado Regular y CGT con discapacidad permanente registrada en CONADIS. El descuento en cuotas varía de 10% a 50%, previa evaluación del expediente.",
    requirements: [
      {
        id: "beca-por-discapacidad-req-1",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular anterior (según el Reglamento de Becas de Pregrado).",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
      },
      {
        id: "beca-por-discapacidad-req-2",
        description:
          "Contar con discapacidad permanente registrada en CONADIS (carnet vigente).",
        type: "boolean",
      },
      {
        id: "beca-por-discapacidad-req-3",
        description:
          "Cumplir el resto de condiciones generales del Reglamento de Becas de Pregrado (sin deuda pendiente del periodo anterior, sin sanciones disciplinarias) y presentar el expediente completo dentro del cronograma. Esta beca está exenta del requisito general de matrícula mínima de 18 horas de clase/semana.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La UTP valida esto internamente al procesar tu expediente; la app no tiene acceso a tu historial de pagos ni disciplinario.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-18",
    cost: "S/. 23.00",
    source: {
      label: "UTP+ Info — Beca por Discapacidad",
      url: "https://info.utp.edu.pe/articulo/KA-01752",
      sourceNote:
        "El umbral de promedio ponderado (12) se confirma cruzando con el Reglamento de Becas de Pregrado; el artículo individual no lo menciona explícitamente.",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I cerró el 18 de julio. Revisa el próximo cronograma en UTP+ Portal y prepara con anticipación el carnet CONADIS, la Ficha de Evaluación Socioeconómica y la Declaración Jurada Beca UTP.",
  },
  {
    id: "beca-por-orfandad",
    title: "Beca por Orfandad",
    category: "Becas",
    shortDescription:
      "Descuento de 10% a 100% para estudiantes que perdieron a su padre, madre o responsable de pago. La ventana 2026-I cerró el 18 de julio.",
    longDescription:
      "Beneficio para alumnos continuos de Pregrado Regular y CGT cuando el padre, madre o tutor responsable de los pagos fallece. El descuento en cuotas varía de 10% a 100%, previa evaluación del expediente.",
    requirements: [
      {
        id: "beca-por-orfandad-req-1",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular anterior, sin cursos desaprobados, según el Reglamento de Becas de Pregrado.",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
      },
      {
        id: "beca-por-orfandad-req-2",
        description:
          "Acreditar el fallecimiento del padre, madre o responsable económico mediante partida de nacimiento y acta/partida de defunción (o documento de inhabilitación del responsable de pagos).",
        type: "non_verifiable",
        nonVerifiableNote:
          "Requiere documentos oficiales sustentatorios que la app no puede validar.",
      },
      {
        id: "beca-por-orfandad-req-3",
        description:
          "Cumplir el resto de condiciones generales del Reglamento de Becas de Pregrado (sin deuda pendiente del periodo anterior, sin sanciones disciplinarias, matrícula mínima de 18 horas de clase/semana).",
        type: "non_verifiable",
        nonVerifiableNote:
          "La UTP valida esto internamente al procesar tu expediente.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-18",
    cost: "S/. 23.00",
    source: {
      label: "UTP+ Info — Beca por Orfandad",
      url: "https://info.utp.edu.pe/articulo/KA-01754",
      sourceNote:
        "El umbral de promedio ponderado (12) se confirma cruzando con el Reglamento de Becas de Pregrado; el artículo individual no lo menciona explícitamente.",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I cerró el 18 de julio. Revisa el próximo cronograma en UTP+ Portal y prepara con anticipación los documentos sustentatorios del expediente.",
  },
  {
    id: "beca-prodac",
    title: "Beca Programa Deportivo de Alta Competencia (PRODAC)",
    category: "Becas",
    shortDescription:
      "Descuento de 50% a 100% para deportistas calificados DC/DECAN del IPD. Ventana activa hasta el 31 de julio.",
    longDescription:
      "Dirigida a deportistas registrados en el Instituto Peruano del Deporte (IPD) con denominación Deportista Calificado (DC) o Deportista Calificado de Alto Nivel (DECAN). Otorga entre 50% y 100% de descuento (beca Parcial o Total) en pensiones.",
    requirements: [
      {
        id: "beca-prodac-req-1",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular inmediato anterior.",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
      },
      {
        id: "beca-prodac-req-2",
        description:
          "Contar con denominación Deportista Calificado (DC) o Deportista Calificado de Alto Nivel (DECAN), registrada en IPD/DINADAF (Ficha SISDENA o CV deportivo actualizado, constancia DC/DECAN, carta compromiso y examen médico vigente de no más de 6 meses).",
        type: "boolean",
      },
      {
        id: "beca-prodac-req-3",
        description:
          "Cumplir el resto de condiciones generales del Reglamento de Becas de Pregrado (sin deuda pendiente del periodo anterior, sin sanciones disciplinarias). Esta beca está exenta únicamente del requisito general de matrícula mínima de 18 horas de clase/semana.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La UTP valida esto internamente al procesar tu expediente.",
      },
    ],
    windowStart: "2026-07-13",
    windowEnd: "2026-07-31",
    cost: "Sin costo",
    source: {
      label: "UTP+ Info — Beca PRODAC",
      url: "https://info.utp.edu.pe/articulo/KA-01755",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Presenta tu expediente en UTP+ Portal con Ficha SISDENA/CV deportivo, constancia DC/DECAN, carta compromiso y examen médico vigente. Respuesta en 3 días hábiles.",
    featured: true,
  },
  {
    id: "beca-socioeconomica",
    title: "Beca Socioeconómica",
    category: "Becas",
    shortDescription:
      "Descuento de 10% a 50% en pensiones para estudiantes con necesidad económica familiar imprevista. Ciclo de tramos actual ya cerrado.",
    longDescription:
      "Dirigida a alumnos continuos de Pregrado Regular y CGT en situación imprevista y temporal de necesidad económica familiar. El descuento en cuotas varía de 10% a 50%, previa evaluación. Se presenta en 5 tramos a lo largo del año, cada uno habilitando el descuento desde una cuota distinta; el tramo 5 de este ciclo cerró el 14 de julio de 2026.",
    requirements: [
      {
        id: "beca-socioeconomica-req-1",
        description:
          "Promedio ponderado mínimo de 12 en el periodo lectivo regular anterior, según el Reglamento de Becas de Pregrado.",
        type: "numeric_gpa",
        threshold: 12,
        comparator: ">=",
      },
      {
        id: "beca-socioeconomica-req-2",
        description:
          "Acreditar una situación imprevista y temporal de necesidad económica familiar, mediante evaluación socioeconómica.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La evalúa Bienestar Universitario a partir de la Ficha de Evaluación Socioeconómica y documentos sustentatorios; la app no puede confirmarla.",
      },
      {
        id: "beca-socioeconomica-req-3",
        description:
          "Cumplir el resto de condiciones generales del Reglamento de Becas de Pregrado (sin deuda pendiente, sin sanciones disciplinarias, matrícula mínima de 18 horas de clase/semana).",
        type: "non_verifiable",
        nonVerifiableNote:
          "La UTP valida esto internamente al procesar tu expediente.",
      },
    ],
    windowStart: "2026-02-16",
    windowEnd: "2026-07-14",
    cost: "S/. 23.00",
    source: {
      label: "UTP+ Info — Beca Socioeconómica",
      url: "https://info.utp.edu.pe/articulo/KA-01958",
      sourceNote:
        "El umbral de promedio ponderado (12) se confirma cruzando con el Reglamento de Becas de Pregrado. El rango de fechas mostrado agrupa los 5 tramos oficiales de presentación del expediente (16 feb-16 mar, 6-16 abr, 6-15 may, 5-12 jun, 2-14 jul); el tramo asignado depende de cuándo completes el expediente sin observaciones.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "El ciclo de tramos de este periodo ya cerró (último tramo venció el 14 de julio). Revisa UTP+ Portal → Trámites → Becas para la apertura del siguiente ciclo. Máximo 2 regularizaciones de expediente por intento.",
  },
  {
    id: "beca-excelencia-academica",
    title: "Beca Excelencia Académica",
    category: "Becas",
    shortDescription:
      "Hasta 20% de descuento automático por mérito académico, aplicado en el siguiente periodo regular.",
    longDescription:
      "Beca otorgada automáticamente por la UTP a partir del segundo periodo de permanencia. Distribuye 3,500 beneficios por orden de mérito, proporcionalmente por campus y carrera, y aplica hasta 20% de descuento en las pensiones del siguiente periodo regular.",
    requirements: [
      {
        id: "beca-excelencia-academica-req-1",
        description:
          "No tener cursos desaprobados en el periodo académico anterior.",
        type: "boolean",
      },
      {
        id: "beca-excelencia-academica-req-2",
        description:
          "Haber estado matriculado y culminado al menos 18 horas de clase semanales en el periodo regular anterior.",
        type: "numeric_hours",
        metric: "weekly_hours_previous",
        threshold: 18,
        comparator: ">=",
      },
      {
        id: "beca-excelencia-academica-req-3",
        description: "Haber completado al menos un periodo regular previo en la UTP.",
        type: "boolean",
      },
      {
        id: "beca-excelencia-academica-req-4",
        description:
          "Ubicarte dentro del grupo de mejores promedios por mérito académico de tu campus y carrera (cupo limitado a 3,500 becas por ciclo).",
        type: "non_verifiable",
        nonVerifiableNote:
          "El Reglamento no fija una nota de corte única: la UTP ordena a todos los estudiantes de tu campus y carrera por mérito y asigna el cupo disponible; la app no tiene acceso a esa comparación completa entre estudiantes.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    alwaysVisible: true,
    source: {
      label: "Reglamento de Becas de Pregrado UTP V18 — capítulo VII",
      url: "https://www.utp.edu.pe/web/sites/default/files/2026-06/Reglamento_de_Becas_de_Pregrado_V18_PT.pdf",
      sourceNote:
        "Artículos 30 al 33 de la versión 18, aprobada por Resolución Rectoral N.° 0199-2026/R-UTP. El reglamento no fija una nota de corte ni exige pertenecer literalmente al tercio superior: la asignación depende del orden de mérito por campus y carrera.",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "No requiere una postulación convencional: la UTP realiza la asignación automática con los resultados del periodo culminado. Revisa UTP+ Portal y tu correo institucional para confirmar el beneficio y el porcentaje otorgado.",
  },
  {
    id: "beca-alto-potencial-bap",
    title: "Beca Alto Potencial (BAP)",
    category: "Becas",
    shortDescription:
      "Beca para postulantes de colegios convenio (Innova Schools, COAR, entre otros) con alto rendimiento académico, y su renovación.",
    longDescription:
      "Dirigida a postulantes provenientes de colegios convenio de la UTP (como Innova Schools o COAR). Exige un promedio ponderado mínimo en cada etapa del proceso de selección para el ingreso, y un umbral distinto para la renovación en ciclos posteriores.",
    requirements: [
      {
        id: "beca-alto-potencial-bap-req-1",
        description:
          "Ingreso: promedio ponderado mínimo de 16 en cada etapa del proceso de selección (solo para postulantes de colegios convenio).",
        type: "numeric_gpa",
        threshold: 16,
        comparator: ">=",
      },
      {
        id: "beca-alto-potencial-bap-req-2",
        description:
          "Renovación: promedio ponderado mínimo de 14 y sin cursos desaprobados en el periodo anterior.",
        type: "numeric_gpa",
        threshold: 14,
        comparator: ">=",
      },
      {
        id: "beca-alto-potencial-bap-req-3",
        description:
          "Provenir de un colegio convenio de la UTP (Innova Schools, COAR u otro definido por la universidad) para la etapa de ingreso.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El resumen del Reglamento revisado no detalla la lista completa de colegios convenio; verifica en UTP+ Portal / Admisión si tu colegio de procedencia califica.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "Reglamento de Becas de Pregrado — Beca Alto Potencial (BAP)",
      url: "https://www.utp.edu.pe/web/sites/default/files/transparencia/Reglamento%20de%20Becas%20de%20pregrado%20v10_REV%20GCB%20-%20VF%20PT.pdf",
      sourceNote:
        "Esta beca no tiene artículo individual propio en UTP+ Info; los datos provienen del Reglamento de Becas de Pregrado (Código REC-RG0008, V10, aprobado por Resolución Rectoral N° 0144-2023/R-UTP). UTP publicó posteriormente una versión más reciente (V14, 2025) en utp.edu.pe.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Consulta en UTP+ Portal / Admisión si tu colegio de procedencia está afiliado al convenio y las fechas del proceso de selección vigente.",
  },
  {
    id: "beca-talento",
    title: "Beca Talento",
    category: "Becas",
    shortDescription:
      "Beca para ingresantes destacados de colegios convenio, con renovación por rendimiento académico continuo.",
    longDescription:
      "Dirigida a postulantes provenientes de colegios convenio de la UTP. Exige un promedio ponderado dentro de un rango según la etapa del proceso de admisión para el ingreso, y un umbral fijo para la renovación.",
    requirements: [
      {
        id: "beca-talento-req-1",
        description:
          "Ingreso: promedio ponderado entre 14 y 15.9, según la etapa del proceso de admisión (solo para postulantes de colegios convenio).",
        type: "numeric_gpa",
        threshold: 14,
        comparator: ">=",
      },
      {
        id: "beca-talento-req-2",
        description:
          "Renovación: promedio ponderado mínimo de 14 y sin cursos desaprobados en el periodo anterior.",
        type: "numeric_gpa",
        threshold: 14,
        comparator: ">=",
      },
      {
        id: "beca-talento-req-3",
        description:
          "Provenir de un colegio convenio de la UTP para la etapa de ingreso.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El resumen del Reglamento revisado no detalla la lista completa de colegios convenio; verifica en UTP+ Portal / Admisión si tu colegio de procedencia califica.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "Reglamento de Becas de Pregrado — Beca Talento",
      url: "https://www.utp.edu.pe/web/sites/default/files/transparencia/Reglamento%20de%20Becas%20de%20pregrado%20v10_REV%20GCB%20-%20VF%20PT.pdf",
      sourceNote:
        "Esta beca no tiene artículo individual propio en UTP+ Info; los datos provienen del Reglamento de Becas de Pregrado (Código REC-RG0008, V10, aprobado por Resolución Rectoral N° 0144-2023/R-UTP). UTP publicó posteriormente una versión más reciente (V14, 2025) en utp.edu.pe.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Consulta en UTP+ Portal / Admisión si tu colegio de procedencia está afiliado al convenio y las fechas del proceso de selección vigente.",
  },
  {
    id: "beca-mujeres-ciencia-tecnologia",
    title: "Beca Mujeres en Ciencia y Tecnología",
    category: "Becas",
    shortDescription:
      "Beca de renovación para estudiantes mujeres de carreras de ciencia y tecnología con buen rendimiento académico.",
    longDescription:
      "Beca dirigida a mujeres estudiantes de carreras de ciencia y tecnología en la UTP. El resumen del Reglamento consultado especifica el umbral de renovación; los criterios de ingreso y el listado exacto de carreras elegibles no se detallan en la fuente disponible.",
    requirements: [
      {
        id: "beca-mujeres-ciencia-tecnologia-req-1",
        description:
          "Renovación: promedio ponderado mínimo de 14 y sin cursos desaprobados en el periodo anterior.",
        type: "numeric_gpa",
        threshold: 14,
        comparator: ">=",
      },
      {
        id: "beca-mujeres-ciencia-tecnologia-req-2",
        description:
          "Cumplir el perfil específico de la beca (ser mujer matriculada en una carrera de ciencia y tecnología definida por la UTP) y, de corresponder, los criterios de ingreso.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El resumen del Reglamento consultado solo confirma el umbral de renovación (14); no detalla el umbral de ingreso ni el listado exacto de carreras elegibles. Verifica el Reglamento de Becas de Pregrado completo o consulta en Bienestar Universitario.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label:
        "Reglamento de Becas de Pregrado — Beca Mujeres en Ciencia y Tecnología",
      url: "https://www.utp.edu.pe/web/sites/default/files/transparencia/Reglamento%20de%20Becas%20de%20pregrado%20v10_REV%20GCB%20-%20VF%20PT.pdf",
      sourceNote:
        "Esta beca no tiene artículo individual propio en UTP+ Info; los datos provienen del Reglamento de Becas de Pregrado (Código REC-RG0008, V10, aprobado por Resolución Rectoral N° 0144-2023/R-UTP). UTP publicó posteriormente una versión más reciente (V14, 2025) en utp.edu.pe.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Consulta en Bienestar Universitario o UTP+ Portal el detalle completo de esta beca (carreras elegibles y proceso de ingreso).",
  },
  {
    id: "beca-talento-coar",
    title: "Beca Talento COAR",
    category: "Becas",
    shortDescription:
      "Beca para egresados de los Colegios de Alto Rendimiento (COAR) desde la promoción 2022.",
    longDescription:
      "Dirigida a egresados de los Colegios de Alto Rendimiento (COAR) del Perú, a partir de la promoción 2022.",
    requirements: [
      {
        id: "beca-talento-coar-req-1",
        description:
          "Ser egresado(a) de un Colegio de Alto Rendimiento (COAR), promoción 2022 en adelante.",
        type: "boolean",
      },
      {
        id: "beca-talento-coar-req-2",
        description: "No tener cursos desaprobados en el periodo anterior.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "Reglamento de Becas de Pregrado — Beca Talento COAR",
      url: "https://www.utp.edu.pe/web/sites/default/files/transparencia/Reglamento%20de%20Becas%20de%20pregrado%20v10_REV%20GCB%20-%20VF%20PT.pdf",
      sourceNote:
        "Esta beca no tiene artículo individual propio en UTP+ Info; los datos provienen del Reglamento de Becas de Pregrado (Código REC-RG0008, V10, aprobado por Resolución Rectoral N° 0144-2023/R-UTP). UTP publicó posteriormente una versión más reciente (V14, 2025) en utp.edu.pe.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Consulta en UTP+ Portal / Admisión el proceso vigente para postulantes egresados de un COAR.",
  },
  {
    id: "beca-madrediosense",
    title: "Beca Madrediosense",
    category: "Becas",
    shortDescription:
      "Beca para estudiantes oriundos de Madre de Dios con promedio ponderado mínimo de 17.",
    longDescription:
      "Dirigida a estudiantes oriundos del departamento de Madre de Dios. Tiene el umbral de promedio ponderado más alto entre las becas listadas en el Reglamento de Becas de Pregrado (17).",
    requirements: [
      {
        id: "beca-madrediosense-req-1",
        description: "Promedio ponderado mínimo de 17.",
        type: "numeric_gpa",
        threshold: 17,
        comparator: ">=",
      },
      {
        id: "beca-madrediosense-req-2",
        description:
          "Ser oriundo(a) del departamento de Madre de Dios y 'asociado hábil', según los criterios definidos en el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El resumen consultado no detalla el significado exacto de 'asociado hábil' ni los documentos de sustento requeridos; verifica el Reglamento completo o consulta en Bienestar Universitario.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "Reglamento de Becas de Pregrado — Beca Madrediosense",
      url: "https://www.utp.edu.pe/web/sites/default/files/transparencia/Reglamento%20de%20Becas%20de%20pregrado%20v10_REV%20GCB%20-%20VF%20PT.pdf",
      sourceNote:
        "Esta beca no tiene artículo individual propio en UTP+ Info; los datos provienen del Reglamento de Becas de Pregrado (Código REC-RG0008, V10, aprobado por Resolución Rectoral N° 0144-2023/R-UTP). UTP publicó posteriormente una versión más reciente (V14, 2025) en utp.edu.pe.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Consulta en Bienestar Universitario los documentos de sustento requeridos (acreditación de procedencia de Madre de Dios).",
  },

  // ========================================================================
  // EMPLEABILIDAD — 9 oportunidades documentadas
  // ========================================================================
  {
    id: "empleabilidad-intercorp-utp",
    title: "Experiencias Intercorp para estudiantes UTP",
    category: "Empleabilidad",
    shortDescription:
      "Mentorías, encuentros exclusivos y retos empresariales que UTP documenta por formar parte de Intercorp.",
    longDescription:
      "UTP publica tres ventajas académicas y de empleabilidad vinculadas a Intercorp: líderes del grupo participan como docentes o mentores, se realizan seminarios y conversaciones exclusivas Intercorp@UTP, y algunos cursos o programas especiales incorporan retos reales de empresas del grupo. No es una convocatoria única ni un descuento general en restaurantes o gimnasios; cada actividad debe ser anunciada por UTP.",
    requirements: [
      {
        id: "empleabilidad-intercorp-utp-req-1",
        description: "Ser estudiante o egresado(a) de la UTP.",
        type: "boolean",
      },
      {
        id: "empleabilidad-intercorp-utp-req-2",
        description:
          "Que UTP habilite una mentoría, encuentro Intercorp@UTP o reto empresarial para tu carrera, curso o periodo.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La fuente institucional describe estas experiencias, pero no publica un calendario único ni garantiza que todas estén disponibles para cada estudiante.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost: "No se publica un costo general",
    source: {
      label: "UTP — Reporte de Sostenibilidad 2024",
      url: "https://www.utp.edu.pe/sostenibilidad-ambiental/sites/sostenibilidad-ambiental/files/documentos/Reporte-de-sostenibilidad-UTP-2024-Version-18.08.pdf",
      sourceNote:
        "La página 9 documenta docentes y mentores del grupo, seminarios, Intercorp@UTP y desafíos empresariales. La disponibilidad concreta depende de cada actividad UTP.",
    },
    lastUpdated: "2026-07-25",
    actionability: "informational",
    actionNote:
      "Revisa tu correo institucional y los canales de Empleabilidad UTP para identificar una actividad vigente. No se encontró una fuente oficial que confirme descuentos generales en Bembos, gimnasios u otros comercios para todos los estudiantes UTP.",
    searchTerms: [
      "beneficios Intercorp",
      "Intercorp UTP",
      "mentoría",
      "seminarios Intercorp",
      "Intercorp@UTP",
      "retos empresariales",
      "empleabilidad Intercorp",
    ],
  },
  {
    id: "empleabilidad-feria-laboral",
    title: "Feria Laboral",
    category: "Empleabilidad",
    shortDescription:
      "Evento bianual (junio y octubre) que conecta a estudiantes y egresados UTP con empresas líderes del país.",
    longDescription:
      "Evento presencial y virtual, abierto a todas las sedes a nivel nacional, que conecta talento estudiantil UTP con empresas importantes para prácticas preprofesionales, prácticas profesionales y empleo. En la edición 2025 participaron empresas como NGR, Auna, Cineplanet, Financiera Oh!, Interbank, Zegel IPAE, Idat, Bimbo, BCP y Scotiabank, entre otras.",
    requirements: [
      {
        id: "empleabilidad-feria-laboral-req-1",
        description: "Ser estudiante o egresado(a) de la UTP.",
        type: "boolean",
      },
      {
        id: "empleabilidad-feria-laboral-req-2",
        description:
          "Mantener el CV actualizado y postular a ofertas que calcen con tu perfil profesional.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Feria Laboral",
      url: "https://info.utp.edu.pe/articulo/KA-01973",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "La feria se realiza dos veces al año (junio y octubre); revisa tu correo institucional y UTP+ Portal para la fecha exacta de la próxima edición.",
  },
  {
    id: "empleabilidad-english-discoveries",
    title: "English Discoveries",
    category: "Empleabilidad",
    shortDescription:
      "Programa online subvencionado (90%+) para preparar la certificación internacional TOEIC.",
    longDescription:
      "Programa de la UTP para mejorar habilidades en inglés y preparar al estudiante para la certificación internacional TOEIC. Ofrece más de 1,000 horas de contenido interactivo (videos, juegos, ejercicios) con acceso 24/7, en ciclos de 10 semanas por nivel.",
    requirements: [
      {
        id: "empleabilidad-english-discoveries-req-1",
        description: "Estar matriculado(a) en el ciclo académico correspondiente.",
        type: "boolean",
      },
      {
        id: "empleabilidad-english-discoveries-req-2",
        description: "Haber aprobado o convalidado el curso de Inglés IV de la UTP.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost:
      "S/. 35.00 por ciclo de 10 semanas (más del 90% subvencionado por la UTP; costo real S/. 350.00)",
    source: {
      label: "UTP+ Info — English Discoveries",
      url: "https://info.utp.edu.pe/articulo/KA-01976",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Más información e inscripción en https://empleabilidadutp.my.canva.site/englishdiscoveries",
    searchTerms: [
      "inglés",
      "certificaciones de inglés",
      "TOEIC",
      "preparación TOEIC",
      "English Discoveries",
    ],
  },
  {
    id: "empleabilidad-generacion-top",
    title: "Generación TOP (GTOP)",
    category: "Empleabilidad",
    shortDescription:
      "Programa de alto rendimiento para estudiantes destacados desde 7° ciclo, con mentoría y empleabilidad. Convocatoria 2026 ya cerrada.",
    longDescription:
      "Programa respaldado por la UTP para estudiantes destacados ('GTOP'), con más de 30 horas formativas orientadas a potenciar empleabilidad y liderazgo: acompañamiento de especialistas, workshops con consultores, entrenamiento de entrevistas y mentoría con profesionales líderes del mercado. Es un programa gratuito.",
    requirements: [
      {
        id: "empleabilidad-generacion-top-req-1",
        description: "Cursar el 7mo ciclo en adelante, de cualquier carrera.",
        type: "numeric_cycle",
        threshold: 7,
        comparator: ">=",
      },
      {
        id: "empleabilidad-generacion-top-req-2",
        description: "Promedio acumulado igual o mayor a 17.",
        type: "numeric_gpa",
        threshold: 17,
        comparator: ">=",
      },
      {
        id: "empleabilidad-generacion-top-req-3",
        description: "Pertenecer a Medalla de Oro.",
        type: "boolean",
      },
      {
        id: "empleabilidad-generacion-top-req-4",
        description:
          "Dominio de Excel a nivel intermedio y conocimiento de lenguaje de programación (deseable), evaluados en el proceso de selección (pruebas de competencias, inglés, Excel, análisis de caso y dinámica grupal).",
        type: "non_verifiable",
        nonVerifiableNote:
          "Estas competencias se evalúan mediante pruebas propias del proceso de selección (Evaluar.com); la app no puede confirmarlas de antemano.",
      },
    ],
    windowStart: "2026-05-04",
    windowEnd: "2026-06-15",
    cost: "Programa gratuito",
    source: {
      label: "UTP+ Info — Generación TOP",
      url: "https://info.utp.edu.pe/articulo/KA-01972",
      sourceNote:
        "El cronograma mostrado corresponde a la convocatoria 2026 (charlas del 4 de mayo al 15 de junio); el programa suele repetirse cada ciclo, pero la fuente no confirma la fecha de la próxima convocatoria.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Esta convocatoria (2026) ya cerró. Revisa https://empleabilidadutp.my.canva.site/generaciontop para la próxima apertura.",
  },
  {
    id: "empleabilidad-egresa-con-potencial",
    title: "Egresa con Potencial",
    category: "Empleabilidad",
    shortDescription:
      "Acompañamiento personalizado de empleabilidad para estudiantes de 9° y 10° ciclo.",
    longDescription:
      "Programa de empleabilidad con acompañamiento de un especialista que orienta y brinda herramientas para fortalecer el perfil profesional: diagnóstico express de CV, simulaciones de entrevistas, activación laboral con empresas y seguimiento continuo durante la búsqueda de empleo.",
    requirements: [
      {
        id: "empleabilidad-egresa-con-potencial-req-1",
        description: "Cursar 9° o 10° ciclo, en cualquier modalidad de estudio.",
        type: "numeric_cycle",
        threshold: 9,
        comparator: ">=",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Egresa con Potencial",
      url: "https://info.utp.edu.pe/articulo/KA-01975",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Solicita el acompañamiento a través de Empleabilidad UTP (UTP+ Portal / Servicios).",
  },
  {
    id: "empleabilidad-asesor-de-empleabilidad",
    title: "Asesor de Empleabilidad",
    category: "Empleabilidad",
    shortDescription:
      "Acompañamiento especializado para egresados durante los primeros 6 meses tras culminar la carrera.",
    longDescription:
      "Servicio para egresados que culminaron satisfactoriamente su carrera: un asesor de empleabilidad brinda orientación personalizada para fortalecer el perfil profesional y acelerar la inserción laboral (búsqueda estratégica de empleo, entrevistas, LinkedIn, marca profesional).",
    requirements: [
      {
        id: "empleabilidad-asesor-de-empleabilidad-req-1",
        description: "Haber egresado satisfactoriamente de una carrera de la UTP.",
        type: "boolean",
      },
      {
        id: "empleabilidad-asesor-de-empleabilidad-req-2",
        description: "Encontrarte dentro de los 6 meses posteriores a tu fecha de egreso.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Asesor de Empleabilidad",
      url: "https://info.utp.edu.pe/articulo/KA-01985",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Contacta a Empleabilidad UTP para que te asignen un asesor dentro de los 6 meses posteriores a tu egreso.",
  },
  {
    id: "empleabilidad-ruta-laboral-virtual",
    title: "Ruta Laboral Virtual",
    category: "Empleabilidad",
    shortDescription:
      "Curso virtual 24/7 en UTP+Class para fortalecer el perfil laboral, de 1° a 8° ciclo.",
    longDescription:
      "Curso alojado en UTP+Class, accesible las 24 horas del día, los 365 días del año, para identificar competencias laborales, capacitarse en presentaciones de impacto y fortalecer el perfil profesional (autoconocimiento y empleabilidad, competencias laborales para el futuro, estrategias de inserción laboral, marca personal).",
    requirements: [
      {
        id: "empleabilidad-ruta-laboral-virtual-req-1",
        description:
          "Estar cursando entre el 1er y 8vo ciclo, de todas las carreras y modalidades de la UTP a nivel nacional.",
        type: "numeric_cycle",
        threshold: 8,
        comparator: "<=",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Ruta Laboral Virtual",
      url: "https://info.utp.edu.pe/articulo/KA-01974",
    },
    lastUpdated: "2026-07-18",
    actionNote: "Ingresa a UTP+Class para tomar el curso, disponible en cualquier momento.",
  },
  {
    id: "empleabilidad-sesion-desarrollo-laboral",
    title: "Sesión de Desarrollo Laboral",
    category: "Empleabilidad",
    shortDescription:
      "Asesorías gratuitas y permanentes de empleabilidad (CV, entrevistas, búsqueda de empleo) para estudiantes y egresados.",
    longDescription:
      "Servicio de asesorías de empleabilidad, en formato virtual y de manera permanente: orientación en búsqueda de empleo, herramientas para mejorar el CV y preparación para entrevistas laborales. Duración promedio de 60 minutos (30 de dictado y 30 de preguntas).",
    requirements: [
      {
        id: "empleabilidad-sesion-desarrollo-laboral-req-1",
        description: "Ser estudiante activo o egresado(a) de la UTP.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost: "Sin costo",
    source: {
      label: "UTP+ Info — Sesión de Desarrollo Laboral",
      url: "https://info.utp.edu.pe/articulo/KA-01747",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Ingresa a UTP+ Portal o la app UTP+ APP → Servicios → Eventos → Conferencias → Empleabilidad, y elige una fecha disponible.",
  },
  {
    id: "empleabilidad-bolsa-de-trabajo",
    title: "Bolsa de Trabajo",
    category: "Empleabilidad",
    shortDescription:
      "Plataforma de postulación a prácticas y empleo con más de 5,000 empresas aliadas (150 mil+ ofertas publicadas en 2025).",
    longDescription:
      "Plataforma virtual que conecta al estudiante o egresado UTP con oportunidades de prácticas preprofesionales, profesionales y empleo en empresas líderes del país. En 2025 finalizó el año con más de 150,000 ofertas laborales publicadas y conexión con más de 5,000 empresas.",
    requirements: [
      {
        id: "empleabilidad-bolsa-de-trabajo-req-1",
        description: "Ser estudiante o egresado(a) de la UTP.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Bolsa de Trabajo",
      url: "https://info.utp.edu.pe/articulo/KA-01971",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Ingresa a https://utp.hiringroomcampus.com/ para crear tu perfil y postular a ofertas.",
  },

  // ========================================================================
  // INTERCAMBIOS — 11 documentos
  // ========================================================================
  {
    id: "intercambio-movilidad-presencial",
    title: "Movilidad Académica Presencial (saliente)",
    category: "Intercambios",
    shortDescription:
      "Cursa un ciclo en una universidad extranjera. Postulación activa, cierra el 30 de julio.",
    longDescription:
      "Programa para cursar asignaturas en universidades extranjeras durante un ciclo, trasladándote físicamente al país de destino. Dirigido a alumnos de pregrado, CGT y a distancia de todas las carreras a nivel nacional. La edición vigente corresponde al intercambio de Marzo 2027.",
    requirements: [
      {
        id: "intercambio-movilidad-presencial-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-presencial-req-2",
        description: "Tener matrícula del último ciclo regular.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-presencial-req-3",
        description:
          "Pertenecer al tercio, quinto o décimo superior, o contar con un promedio ponderado mínimo de 14 en los últimos dos ciclos regulares (no verano).",
        type: "numeric_gpa",
        threshold: 14,
        comparator: ">=",
      },
      {
        id: "intercambio-movilidad-presencial-req-4",
        description: "Mínimo 60 créditos aprobados a la fecha de postulación.",
        type: "numeric_credits",
        threshold: 60,
        comparator: ">=",
      },
      {
        id: "intercambio-movilidad-presencial-req-5",
        description:
          "No estar llevando un curso por tercera vez durante el periodo de postulación.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-presencial-req-6",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
    ],
    windowStart: "2026-06-15",
    windowEnd: "2026-07-30",
    source: {
      label: "UTP+ Info — Movilidad Académica Presencial",
      url: "https://info.utp.edu.pe/articulo/KA-01903",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Postula antes del 30 de julio a través de UTP+ Portal → Trámites → Solicitudes SAE → 'Postulación a Programa Movilidad Internacional'.",
  },
  {
    id: "intercambio-movilidad-virtual",
    title: "Programa Movilidad Virtual",
    category: "Intercambios",
    shortDescription:
      "Intercambio académico internacional sin viajar, con apoyo de TIC. Convocatoria 2026 ya cerrada (venció el 10 de junio).",
    longDescription:
      "Modalidad de movilidad estudiantil que facilita experiencias académicas internacionales con apoyo de las Tecnologías de la Información y la Comunicación, sin salir del país. Dirigido a alumnos de pregrado en modalidad semipresencial, presencial y virtual, de todas las carreras a nivel nacional.",
    requirements: [
      {
        id: "intercambio-movilidad-virtual-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-virtual-req-2",
        description: "Tener matrícula vigente.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-virtual-req-3",
        description:
          "Pertenecer al tercio, quinto o décimo superior en los últimos dos ciclos regulares (no verano).",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-virtual-req-4",
        description: "Mínimo 60 créditos aprobados a la fecha de postulación.",
        type: "numeric_credits",
        threshold: 60,
        comparator: ">=",
      },
      {
        id: "intercambio-movilidad-virtual-req-5",
        description:
          "No estar llevando un curso por tercera vez durante el periodo de postulación.",
        type: "boolean",
      },
      {
        id: "intercambio-movilidad-virtual-req-6",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
    ],
    windowStart: "2026-04-07",
    windowEnd: "2026-06-10",
    cost:
      "Matrícula UTP obligatoria durante el intercambio; algunas universidades de destino cobran una tasa administrativa (monto no especificado en la fuente).",
    source: {
      label: "UTP+ Info — Programa Movilidad Virtual",
      url: "https://info.utp.edu.pe/articulo/KA-01924",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Esta convocatoria ya cerró. La asignación de vacantes se define por orden estricto de promedio ponderado entre los postulantes; revisa UTP+ Portal para la próxima apertura.",
  },
  {
    id: "intercambio-clases-espejo",
    title: "Clases Espejo",
    category: "Intercambios",
    shortDescription:
      "Metodología de clases compartidas entre UTP y universidades socias — gestión interna, no postulable por el estudiante.",
    longDescription:
      "Metodología que conecta dos aulas de países diferentes mediante herramientas TIC, durante una o dos semanas de sesiones compartidas, propiciando el aprendizaje colaborativo y el intercambio cultural entre alumnos y docentes. Los estudiantes NO pueden seleccionar una clase espejo por cuenta propia: este servicio se gestiona internamente entre la Oficina Internacional y los Directores de Diseño Académico, quienes aceptan la propuesta de relacionamiento de los socios extranjeros de la UTP.",
    requirements: [
      {
        id: "intercambio-clases-espejo-req-1",
        description:
          "No existe postulación individual: la participación depende de que tu curso sea seleccionado internamente por la Oficina Internacional y los Directores de Diseño Académico.",
        type: "non_verifiable",
        nonVerifiableNote:
          "Esta 'oportunidad' es puramente informativa: no hay formulario ni proceso de postulación para el estudiante.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Clases Espejo",
      url: "https://info.utp.edu.pe/articulo/KA-01784",
    },
    lastUpdated: "2026-07-18",
    actionability: "informational",
    actionNote:
      "No requiere ni permite postulación individual. Si tu curso participa de una clase espejo, tu docente te lo comunicará directamente.",
  },
  {
    id: "intercambio-conferencias-internacionales",
    title: "Conferencias Internacionales",
    category: "Intercambios",
    shortDescription:
      "Charlas gratuitas con especialistas de universidades socias extranjeras, abiertas a todos los ciclos.",
    longDescription:
      "Eventos académicos gratuitos en los que especialistas internacionales de universidades socias ofrecen conferencias organizadas por la UTP (o donde docentes UTP disertan en eventos de universidades socias en el extranjero). Se difunden por mailing y redes sociales institucionales; la fuente muestra como ejemplo la conferencia 'Oportunidades de estudio en Torrens University – Australia', el 01 de septiembre (el año no se indica en el afiche original).",
    requirements: [
      {
        id: "intercambio-conferencias-internacionales-req-1",
        description: "Ser estudiante UTP de cualquier ciclo.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost: "Gratuito",
    source: {
      label: "UTP+ Info — Conferencias Internacionales",
      url: "https://info.utp.edu.pe/articulo/KA-01785",
      sourceNote:
        "La fuente incluye un ejemplo de conferencia con fecha (01 de septiembre) pero sin año confirmado en el afiche; no se asigna una ventana de vigencia específica para evitar inventar el año.",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Inscríbete de forma gratuita cuando se difunda la convocatoria por tu correo institucional o redes UTP.",
  },
  {
    id: "intercambio-cursos-idiomas-ingles",
    title: "Cursos de Idiomas: Inglés",
    category: "Intercambios",
    shortDescription:
      "Cursos de inglés presenciales o virtuales en instituciones de Australia, Canadá o Estados Unidos, desde el 1er ciclo.",
    longDescription:
      "Cursos de idioma inglés en instituciones internacionales de Australia, Canadá o Estados Unidos, llevados de forma presencial o virtual.",
    requirements: [
      {
        id: "intercambio-cursos-idiomas-ingles-req-1",
        description: "Estar cursando desde el 1er ciclo en adelante.",
        type: "numeric_cycle",
        threshold: 1,
        comparator: ">=",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost: "Variable según destino, duración y modalidad (monto no especificado en la fuente).",
    source: {
      label: "UTP+ Info — Cursos de Idiomas: Inglés",
      url: "https://info.utp.edu.pe/articulo/KA-01802",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Escribe a internacional@utp.edu.pe para conocer el detalle de destinos, fechas y costos disponibles.",
  },
  {
    id: "intercambio-misiones-internacionales",
    title: "Misiones Internacionales (programa general)",
    category: "Intercambios",
    shortDescription:
      "Programas académicos y culturales de corta duración en universidades extranjeras socias; España, Panamá y Buenos Aires son las misiones vigentes.",
    longDescription:
      "Programas diseñados en colaboración con universidades extranjeras, donde estudiantes UTP participan en sesiones académicas, visitas a empresas y actividades culturales en el país de destino. Los cursos llevados no se convalidan (son de extensión profesional), pero otorgan certificación internacional. Las misiones vigentes mencionadas en la fuente son España (Madrid), Panamá y Buenos Aires, cada una con su propio costo y cronograma.",
    requirements: [
      {
        id: "intercambio-misiones-internacionales-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-misiones-internacionales-req-2",
        description: "Contar con un promedio ponderado general aprobado en el ciclo anterior.",
        type: "boolean",
      },
      {
        id: "intercambio-misiones-internacionales-req-3",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
      {
        id: "intercambio-misiones-internacionales-req-4",
        description:
          "No tener ninguna obligación administrativa o financiera pendiente con la universidad.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Misiones Internacionales",
      url: "https://info.utp.edu.pe/articulo/KA-01866",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Completa el 'Registro Informativo 2026' para recibir aviso de apertura de nuevas convocatorias por país, o revisa las misiones vigentes (España, Panamá, Buenos Aires).",
  },
  {
    id: "intercambio-espana",
    title: "Misión Internacional: España (Madrid) 2026",
    category: "Intercambios",
    shortDescription:
      "Viaje académico a Madrid del 19 al 23 de octubre de 2026, USD 2200. Cronograma de cuotas en curso.",
    longDescription:
      "Programa de Misiones Internacionales de la UTP con destino Madrid, España. Incluye actividades académicas certificadas por la Universidad Europea de Madrid, visita a empresas, actividad cultural, alojamiento de domingo a sábado, seguro internacional y acompañamiento de un representante. No incluye tickets aéreos ni comidas y traslados no especificados en el programa.",
    requirements: [
      {
        id: "intercambio-espana-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-espana-req-2",
        description: "Contar con un promedio ponderado general aprobado en el ciclo anterior.",
        type: "boolean",
      },
      {
        id: "intercambio-espana-req-3",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
      {
        id: "intercambio-espana-req-4",
        description:
          "No tener ninguna obligación administrativa o financiera pendiente con la universidad.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: null,
    cost:
      "USD 2200 (cuota de inscripción USD 220 + 3 cuotas: USD 660 al 30 de junio, USD 880 al 31 de julio, USD 440 al 30 de agosto)",
    source: {
      label: "UTP+ Info / Presentación Canva — Informativo España 2026",
      url: "https://www.canva.com/design/DAG_cPgeOOA/0eLRseJoQw89UIuwyz9Eqg/edit",
      sourceNote:
        "Accedido desde el enlace 'aquí' dentro del artículo UTP+ Info KA-01866 (Misiones Internacionales).",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "La fuente no indica una fecha límite explícita de inscripción (solo el cronograma de cuotas); el viaje es del 19 al 23 de octubre de 2026. Escribe a acayotopa@utp.edu.pe o revisa utp.edu.pe/web/internacional para confirmar si aún hay cupo.",
  },
  {
    id: "intercambio-panama",
    title: "Misión Internacional: Panamá 2026",
    category: "Intercambios",
    shortDescription:
      "Viaje académico a Panamá del 2 al 8 de agosto de 2026, USD 1050. Inscripciones ya cerradas (vencieron el 30 de junio).",
    longDescription:
      "Programa de Misiones Internacionales de la UTP con destino Panamá. Incluye actividades académicas certificadas por la Universidad del Istmo, la Universidad Tecnológica de Panamá y la Universidad Nacional de Panamá, visita a empresas, actividad cultural, alojamiento de domingo a sábado, seguro internacional, transporte aeropuerto-universidad-aeropuerto y cena de cierre. No incluye tickets aéreos ni almuerzos y cenas.",
    requirements: [
      {
        id: "intercambio-panama-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-panama-req-2",
        description: "Contar con un promedio ponderado general aprobado en el ciclo anterior.",
        type: "boolean",
      },
      {
        id: "intercambio-panama-req-3",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
      {
        id: "intercambio-panama-req-4",
        description:
          "No tener ninguna obligación administrativa o financiera pendiente con la universidad.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: "2026-06-30",
    cost: "USD 1050 (cuota de inscripción USD 100 + cuota única de USD 950 al 30 de junio)",
    source: {
      label: "UTP+ Info / Presentación Canva — Misión Internacional Panamá",
      url: "https://www.canva.com/design/DAHIzeINw7k/AU9x2tW8zoZuSxSygz2s1w/edit",
      sourceNote:
        "Accedido desde el enlace 'aquí' dentro del artículo UTP+ Info KA-01866 (Misiones Internacionales).",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Las inscripciones para esta edición ya cerraron (30 de junio). Completa el 'Registro Informativo 2026' de Internacional UTP para la próxima edición.",
  },
  {
    id: "intercambio-buenos-aires",
    title: "Misión Internacional: Buenos Aires 2026",
    category: "Intercambios",
    shortDescription:
      "Viaje académico a Buenos Aires del 6 al 12 de setiembre de 2026, USD 900. Inscripción activa, cierra el 31 de julio.",
    longDescription:
      "Programa de Misiones Internacionales de la UTP con destino Buenos Aires, Argentina. Incluye actividades académicas certificadas por la Universidad Católica Argentina (UCA) y la Universidad del CEMA, visita académica a la Universidad Tecnológica Nacional, visita a empresas, actividad cultural, alojamiento de domingo a sábado, seguro internacional y cena de cierre. No incluye tickets aéreos, comidas ni traslados no especificados en el programa.",
    requirements: [
      {
        id: "intercambio-buenos-aires-req-1",
        description: "Ser mayor de 18 años.",
        type: "boolean",
      },
      {
        id: "intercambio-buenos-aires-req-2",
        description: "Contar con un promedio ponderado general aprobado en el ciclo anterior.",
        type: "boolean",
      },
      {
        id: "intercambio-buenos-aires-req-3",
        description: "No tener antecedentes disciplinarios en la UTP.",
        type: "boolean",
      },
      {
        id: "intercambio-buenos-aires-req-4",
        description:
          "No tener ninguna obligación administrativa o financiera pendiente con la universidad.",
        type: "boolean",
      },
    ],
    windowStart: null,
    windowEnd: "2026-07-31",
    cost: "USD 900",
    source: {
      label: "UTP+ Info / Presentación Canva — Misión Internacional Buenos Aires",
      url: "https://www.canva.com/design/DAHIwT7giEI/AfKBRuZ76NT2bopja0H33Q/edit",
      sourceNote:
        "Accedido desde el enlace 'aquí' dentro del artículo UTP+ Info KA-01866 (Misiones Internacionales).",
    },
    lastUpdated: "2026-07-18",
    actionNote: "Inscríbete antes del 31 de julio en https://forms.office.com/r/Ev1Ge54JAF",
    featured: true,
  },
  {
    id: "intercambio-universidades-socias",
    title: "Universidades Socias Extranjeras — Guía de Convenios Internacionales",
    category: "Intercambios",
    shortDescription:
      "Directorio interactivo de universidades socias de la UTP por facultad y carrera, para planear tu intercambio.",
    longDescription:
      "Herramienta interactiva (Genially) de la Oficina Internacional UTP para consultar con qué universidades extranjeras tiene convenio la UTP, organizada por facultad y carrera. La UTP tiene convenios en Alemania, Argentina, Australia, Brasil, Chile, China, Colombia, Corea del Sur, Cuba, Ecuador, España, Estados Unidos, México y Rusia, entre otros países.",
    requirements: [
      {
        id: "intercambio-universidades-socias-req-1",
        description:
          "Verificar si tu carrera específica tiene universidades socias asignadas en la herramienta.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La herramienta no lista todas las carreras: en la revisión realizada, Ingeniería de Software / Ingeniería de Sistemas e Informática no aparece listada dentro de la Facultad de Ingeniería, lo que podría indicar que la herramienta está desactualizada respecto a la oferta académica actual.",
      },
    ],
    windowStart: null,
    windowEnd: null,
    source: {
      label: "UTP+ Info — Universidades Socias Extranjeras",
      url: "https://info.utp.edu.pe/articulo/KA-01872",
    },
    lastUpdated: "2026-07-18",
    actionability: "informational",
    actionNote:
      "Consulta la herramienta interactiva en https://view.genially.com/61691579d0c1e70d9c38e1e7 (selecciona tu facultad y carrera) o escribe por WhatsApp al 960 252 970.",
  },
  {
    id: "intercambio-ryukyus-japon",
    title: "Convocatoria Beca Universidad de Ryukyus 2026 (Japón)",
    category: "Intercambios",
    shortDescription:
      "Intercambio académico de 11 meses en Okinawa, Japón, con cobertura integral. Postulación abre el 20 de julio y cierra el 20 de agosto de 2026.",
    longDescription:
      "Beca que brinda la oportunidad de realizar un intercambio académico de 11 meses en Okinawa, Japón (del 1 de abril de 2027 al 31 de marzo de 2028), eligiendo entre el Curso de Estudios sobre Japón y Okinawa o el Curso de Liderazgo Glocal. Incluye cobertura integral: visa, boletos aéreos, seguro internacional, alimentación y alojamiento. La selección incluye preselección de los 40 mejores promedios acumulados, ensayo/carta de motivación, entrevista personal y nominación final ante un comité de autoridades UTP, cuya decisión es inapelable.",
    requirements: [
      {
        id: "intercambio-ryukyus-japon-req-1",
        description:
          "Mínimo 110 créditos aprobados (los cursos de nivelación de matemáticas y redacción no cuentan para este cálculo).",
        type: "numeric_credits",
        threshold: 110,
        comparator: ">=",
      },
      {
        id: "intercambio-ryukyus-japon-req-2",
        description:
          "Ubicarte en el quinto o décimo superior durante todos tus ciclos en la UTP (excelencia académica).",
        type: "boolean",
      },
      {
        id: "intercambio-ryukyus-japon-req-3",
        description: "No tener antecedentes disciplinarios.",
        type: "boolean",
      },
      {
        id: "intercambio-ryukyus-japon-req-4",
        description: "Tener condición de estudiante activo en marzo de 2026 y en agosto de 2026.",
        type: "boolean",
      },
    ],
    windowStart: "2026-07-20",
    windowEnd: "2026-08-20",
    cost:
      "Cobertura integral para el becario seleccionado (visa, boletos aéreos, seguro internacional, alimentación y alojamiento); sin costo directo para el postulante.",
    source: {
      label: "UTP+ Info — Convocatoria Beca Universidad de Ryukyus 2026",
      url: "https://info.utp.edu.pe/articulo/KA-01992",
    },
    lastUpdated: "2026-07-18",
    actionNote:
      "Postula mediante el formulario disponible del 20 de julio al 20 de agosto de 2026, en la sección Internacional UTP > Convocatorias Vigentes. Si brindas información falsa, tu postulación se descarta.",
    featured: true,
  },

  // ========================================================================
  // CONVENIOS — 5 documentos
  // ========================================================================
  {
    id: "convenio-idat",
    title: "Convenio IDAT",
    category: "Convenios",
    shortDescription:
      "Hasta 25% de descuento en pensión para egresados de IDAT. La ventana 2026-I cerró el 21 de julio.",
    longDescription:
      "Beneficio para alumnos de Pregrado y CGT que egresaron de IDAT. El porcentaje de descuento (hasta 25%) depende del periodo de ingreso a la universidad. Se renueva automáticamente si se cumplen todos los requisitos y no hay cambios de carrera, campus o modalidad.",
    requirements: [
      {
        id: "convenio-idat-req-1",
        description: "Haber egresado de IDAT.",
        type: "boolean",
      },
      {
        id: "convenio-idat-req-2",
        description:
          "Cumplir los requisitos académicos del periodo regular anterior a la asignación del beneficio, según el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El artículo no especifica un promedio ponderado mínimo numérico exacto para este convenio (el resumen del Reglamento de Becas de Pregrado revisado no incluyó un umbral específico para convenios corporativos/educativos); confírmalo en UTP+ Portal.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-21",
    cost: "Sin costo de trámite",
    source: {
      label: "UTP+ Info — Convenio IDAT",
      url: "https://info.utp.edu.pe/articulo/KA-01965",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I ya cerró. Revisa el próximo cronograma en UTP+ Portal → Trámites → Becas y Convenios y ten preparada la constancia de egreso de IDAT.",
  },
  {
    id: "convenio-innova-schools",
    title: "Convenio Innova Schools",
    category: "Convenios",
    shortDescription:
      "15% de descuento para egresados de Innova Schools (desde agosto de 2018). La ventana 2026-I cerró el 21 de julio.",
    longDescription:
      "Beneficio para alumnos de Pregrado y CGT que culminaron sus estudios en Innova Schools, iniciados desde el periodo agosto 2018 en adelante. Otorga 15% de descuento en pensión y se renueva automáticamente si se cumplen todos los requisitos y no hay cambios de carrera, campus o modalidad.",
    requirements: [
      {
        id: "convenio-innova-schools-req-1",
        description:
          "Haber culminado estudios en Innova Schools, iniciados desde agosto de 2018 en adelante.",
        type: "boolean",
      },
      {
        id: "convenio-innova-schools-req-2",
        description:
          "Cumplir los requisitos académicos del periodo regular anterior a la asignación del beneficio, según el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El artículo no especifica un promedio ponderado mínimo numérico exacto para este convenio; confírmalo en UTP+ Portal.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-21",
    cost: "Sin costo de trámite",
    source: {
      label: "UTP+ Info — Convenio Innova Schools",
      url: "https://info.utp.edu.pe/articulo/KA-01967",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I ya cerró. Revisa el próximo cronograma en UTP+ Portal → Trámites → Becas y Convenios y confirma con anticipación tu condición de egresado de Innova Schools.",
  },
  {
    id: "convenio-intercorp",
    title: "Convenio Intercorp",
    category: "Convenios",
    shortDescription:
      "20% de descuento para colaboradores del Grupo Intercorp y sus cónyuges o hijos. La ventana 2026-I cerró el 21 de julio.",
    longDescription:
      "Beneficio para alumnos de Pregrado y CGT que sean colaboradores, cónyuges o hijos de colaboradores del Grupo Intercorp. Otorga 20% de descuento en pensión. A diferencia de otros convenios educativos, este NO se renueva automáticamente: debe solicitarse cada periodo.",
    requirements: [
      {
        id: "convenio-intercorp-req-1",
        description: "Ser colaborador(a), cónyuge o hijo(a) de colaborador(a) del Grupo Intercorp.",
        type: "boolean",
      },
      {
        id: "convenio-intercorp-req-2",
        description:
          "Cumplir los requisitos académicos del periodo regular anterior a la asignación del beneficio, según el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El artículo no especifica un promedio ponderado mínimo numérico exacto para este convenio; confírmalo en UTP+ Portal.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-21",
    cost: "Sin costo de trámite",
    source: {
      label: "UTP+ Info — Convenio Intercorp",
      url: "https://info.utp.edu.pe/articulo/KA-01935",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I ya cerró. Este 20% educativo corresponde a colaboradores de empresas Intercorp y a sus cónyuges o hijos; mencionar empresas como Bembos no significa que exista un descuento de consumo para todos los estudiantes. Revisa el próximo cronograma en UTP+ Portal → Trámites → Becas y Convenios y recuerda que debe solicitarse nuevamente cada periodo.",
  },
  {
    id: "convenio-zegel-ipae",
    title: "Convenio Zegel IPAE",
    category: "Convenios",
    shortDescription:
      "Hasta 25% de descuento para egresados de Zegel IPAE. La ventana 2026-I cerró el 21 de julio.",
    longDescription:
      "Beneficio para alumnos de Pregrado y CGT que egresaron de Zegel IPAE. El porcentaje de descuento (hasta 25%) depende del periodo de ingreso a la universidad. Se renueva automáticamente si se cumplen todos los requisitos y no hay cambios de carrera, campus o modalidad.",
    requirements: [
      {
        id: "convenio-zegel-ipae-req-1",
        description: "Haber egresado de Zegel IPAE.",
        type: "boolean",
      },
      {
        id: "convenio-zegel-ipae-req-2",
        description:
          "Cumplir los requisitos académicos del periodo regular anterior a la asignación del beneficio, según el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El artículo no especifica un promedio ponderado mínimo numérico exacto para este convenio; confírmalo en UTP+ Portal.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-21",
    cost: "Sin costo de trámite",
    source: {
      label: "UTP+ Info — Convenio Zegel IPAE",
      url: "https://info.utp.edu.pe/articulo/KA-01966",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I ya cerró. Revisa el próximo cronograma en UTP+ Portal → Trámites → Becas y Convenios y ten preparada la constancia de egreso de Zegel IPAE.",
  },
  {
    id: "convenio-otros-convenios",
    title: "Otros Convenios (vínculo laboral corporativo)",
    category: "Convenios",
    shortDescription:
      "Descuento variable para estudiantes con vínculo laboral en empresas de la Guía de Becas y Convenios. La ventana 2026-I cerró el 18 de julio.",
    longDescription:
      "Beneficio para alumnos continuos de Pregrado Regular y CGT que tengan un vínculo laboral con alguna de las entidades o empresas listadas en la 'Guía de Becas y Convenios' de la UTP. El porcentaje de descuento varía según el convenio específico. Esta guía no está publicada como artículo público; se referencia como documento disponible en UTP+ Portal (con sesión de estudiante) y en el Portal de Transparencia UTP.",
    requirements: [
      {
        id: "convenio-otros-convenios-req-1",
        description:
          "Tener vínculo laboral con una entidad o empresa incluida en la 'Guía de Becas y Convenios' de la UTP.",
        type: "non_verifiable",
        nonVerifiableNote:
          "La lista exacta de empresas no está disponible en fuentes públicas sin sesión de estudiante; verifica tu empresa directamente en UTP+ Portal o en el Portal de Transparencia UTP.",
      },
      {
        id: "convenio-otros-convenios-req-2",
        description:
          "Cumplir los requisitos académicos del periodo regular anterior, según el Reglamento de Becas de Pregrado.",
        type: "non_verifiable",
        nonVerifiableNote:
          "El artículo no especifica un promedio ponderado mínimo numérico exacto para este convenio; confírmalo en UTP+ Portal.",
      },
    ],
    windowStart: "2026-02-23",
    windowEnd: "2026-07-18",
    cost: "Sin costo de trámite",
    source: {
      label: "UTP+ Info — Otros Convenios",
      url: "https://info.utp.edu.pe/articulo/KA-01801",
    },
    lastUpdated: "2026-07-25",
    actionNote:
      "La ventana 2026-I cerró el 18 de julio y este beneficio no se renueva automáticamente. Revisa el próximo cronograma en UTP+ Portal → Solicitudes SAE → 'Convenio' y prepara los documentos indicados en la Guía de Becas y Convenios.",
  },
];
