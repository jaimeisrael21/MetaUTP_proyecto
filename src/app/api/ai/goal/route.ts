import { NextRequest } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { opportunities } from "@/data/opportunities";
import {
  emptyProfile,
  emptyProfileFacts,
  type StudentProfile,
} from "@/data/types";
import { goalRelevance } from "@/data/opportunity-rules";
import { evaluateOpportunity, rankOpportunity } from "@/lib/matching";

export const runtime = "nodejs";
export const maxDuration = 18;

const triState = z.enum(["yes", "no", "unknown"]);
const factsSchema = z.object({
  academicRank: z.enum(["top_tenth", "top_fifth", "top_third", "none", "unknown"]),
  failedLastPeriod: triState,
  continuousStudent: triState,
  enrolledCurrentTerm: triState,
  age18Plus: triState,
  disciplinaryIssues: triState,
  outstandingDebt: triState,
  studentStatus: z.enum(["active", "graduate", "unknown"]),
  englishLevel: z.enum(["none", "A1", "A2", "B1", "B2", "C1", "C2", "unknown"]),
  englishCertificate: triState,
  competitiveSport: triState,
  representsUtp: triState,
  eliteAthleteCredential: triState,
  culturalEnsemble: triState,
  researchExperience: triState,
  volunteering: triState,
  workExperience: triState,
  sensitiveConsent: z.enum(["yes", "not_now", "prefer_not"]),
  financialNeed: triState,
  lostEconomicGuardian: triState,
  disabilityConadis: triState,
  regionalBenefit: triState,
  affiliations: z.array(z.enum([
    "coar",
    "innova",
    "idat",
    "zegel",
    "intercorp",
    "partner_school",
    "mother_of_god",
    "corporate_agreement",
  ])).max(8),
});

const requestSchema = z.object({
  profile: z.object({
    name: z.string().max(120).optional().default(""),
    career: z.string().max(160),
    cycle: z.number().int().min(1).max(20),
    cumulativeGpa: z.number().min(0).max(20),
    approvedCredits: z.number().int().min(0).max(400),
    preferredCategories: z.array(z.enum(["Becas", "Intercambios", "Empleabilidad", "Convenios"])).max(4),
    facts: factsSchema,
    goal: z.enum(["scholarship", "study_abroad", "employability", "english", "research", "custom", "undecided"]),
    goalNote: z.string().max(420),
  }),
});

const guideSchema = z.object({
  summary: z.string().min(1).max(420).optional(),
  guia_breve: z.string().min(1).max(420).optional(),
  priorityIds: z.array(z.string().min(1).max(120)).max(10).optional(),
  followUpQuestions: z.array(z.string().min(1).max(180)).max(2).optional(),
  preguntas_faltantes: z.array(z.string().min(1).max(180)).max(2).optional(),
  nextAction: z.string().min(1).max(240).optional(),
  accion_siguiente: z.string().min(1).max(240).optional(),
});

const DEFAULT_AI_MODEL = "alibaba/qwen3.5-flash";

function configuredModel() {
  return process.env.AI_GATEWAY_MODEL?.replace(/^\uFEFF/, "").trim() || DEFAULT_AI_MODEL;
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("host");
  if (!origin || !requestHost) return true;
  try {
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

const requests = new Map<string, { count: number; resetAt: number }>();

function hasCapacity(ip: string) {
  const now = Date.now();
  const current = requests.get(ip);
  if (!current || current.resetAt <= now) {
    requests.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
}

function humanizeModelText(value: string) {
  return value
    .replace(/['"]?needs_data['"]?/gi, "requieren datos")
    .replace(/['"]?official_validation['"]?/gi, "requieren validación oficial")
    .replace(/['"]?not_applicable['"]?/gi, "no aplican por ahora")
    .replace(/['"]?general_catalog['"]?/gi, "catálogo general");
}

function safeFollowUpQuestions(profile: StudentProfile, questions: string[]) {
  const sensitive = /fallec|orfand|discap|pobre|padre|madre|apoderad|econ[oó]mic/i;
  return questions.map(humanizeModelText).filter((question) => {
    if (sensitive.test(question)) return false;
    if (profile.facts.age18Plus !== "unknown" && /edad|18 a[nñ]os/i.test(question)) return false;
    if (
      profile.facts.englishLevel !== "unknown" &&
      profile.facts.englishCertificate !== "unknown" &&
      /ingl[eé]s|idioma|certific/i.test(question)
    ) return false;
    if (profile.facts.competitiveSport !== "unknown" && /deport/i.test(question)) return false;
    if (profile.facts.failedLastPeriod !== "unknown" && /desaprobad|reprobad/i.test(question)) return false;
    if (/promedio/i.test(question) && !/(ciclo anterior|[uú]ltimo ciclo)/i.test(question)) return false;
    return true;
  }).slice(0, 2);
}

function safeSummary(profile: StudentProfile, summary: string) {
  const clearSummary = humanizeModelText(summary);
  if (profile.facts.age18Plus === "yes") {
    return clearSummary.replace(
      /si cumples[^,.]*requisito[^,.]*edad/gi,
      "porque ya registraste que cumples el requisito de edad"
    );
  }
  return clearSummary;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!hasCapacity(ip)) {
    return Response.json({ error: "Espera un minuto antes de volver a orientar el catálogo." }, { status: 429 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Los datos del perfil no son válidos." }, { status: 400 });
  }

  const profile: StudentProfile = {
    ...emptyProfile,
    ...parsed.data.profile,
    facts: { ...emptyProfileFacts, ...parsed.data.profile.facts },
    courses: [],
    onboarded: true,
    profileRefined: true,
    academicSetupComplete: true,
  };

  const evaluated = opportunities.map((opportunity, catalogIndex) => {
    const evaluation = evaluateOpportunity(opportunity, profile);
    const ranking = rankOpportunity(opportunity, evaluation, profile);
    const relevance = goalRelevance(opportunity, profile.goal, profile.goalNote);
    return { opportunity, evaluation, ranking, relevance, catalogIndex };
  });

  const relatedToGoal = evaluated.filter(({ relevance }) => relevance > 0);
  const eligibleForGoal = relatedToGoal
    .filter(({ evaluation, opportunity }) =>
      opportunity.actionability !== "informational" &&
      evaluation.window.status !== "closed" &&
      evaluation.matchState !== "not_applicable" &&
      evaluation.matchState !== "special_condition"
    )
    .sort((a, b) => b.ranking.score - a.ranking.score || a.catalogIndex - b.catalogIndex);

  const counts = {
    related: relatedToGoal.length,
    matches: relatedToGoal.filter(({ evaluation }) => evaluation.matchState === "recommended" || evaluation.matchState === "official_validation").length,
    needsData: relatedToGoal.filter(({ evaluation }) => evaluation.matchState === "needs_data" || evaluation.matchState === "special_condition").length,
    close: relatedToGoal.filter(({ evaluation }) => evaluation.matchState === "close").length,
    notApplicable: relatedToGoal.filter(({ evaluation }) => evaluation.matchState === "not_applicable").length,
  };

  const fallbackPriorityIds = eligibleForGoal.slice(0, 10).map(({ opportunity }) => opportunity.id);
  const fallback = {
    summary: profile.goal === "research" && relatedToGoal.length === 0
      ? "No encontré una convocatoria de investigación publicada en las fuentes oficiales revisadas. Mantengo el catálogo completo y no invento una recomendación para llenar este espacio."
      : "Organicé el catálogo con tu meta, tus datos declarados y los requisitos verificables. Las condiciones sensibles o todavía desconocidas no se tratan como cumplidas.",
    priorityIds: fallbackPriorityIds,
    followUpQuestions: [],
    nextAction: profile.goal === "research" && relatedToGoal.length === 0
      ? "Puedes explorar el catálogo actual o cambiar tu meta cuando aparezca una convocatoria oficial de investigación."
      : "Revisa primero las oportunidades que coinciden y completa solo los datos esenciales que aún falten.",
    counts,
    mode: "rules" as const,
  };

  if (profile.goal === "research" && relatedToGoal.length === 0) {
    return Response.json(fallback);
  }

  try {
    const { output } = await generateText({
      model: configuredModel(),
      output: Output.object({ schema: guideSchema }),
      abortSignal: AbortSignal.timeout(14_000),
      maxRetries: 0,
      temperature: 0.15,
      maxOutputTokens: 700,
      providerOptions: {
        alibaba: { enableThinking: false },
        gateway: { tags: ["feature:goal-guide", "app:metautp"] },
      },
      system:
        "Eres Meta, la guía de oportunidades de MetaUTP. Interpretas la meta del estudiante y priorizas únicamente dentro de candidatos ya filtrados por reglas determinísticas. No decides elegibilidad, no inventas fechas, no infieres datos sensibles y no prometes admisión. Escribe español peruano claro, breve y profesional. Responde exclusivamente como un objeto JSON válido que cumpla el esquema solicitado.",
      prompt: `Meta declarada: ${profile.goal}. Detalle libre: ${profile.goalNote || "sin detalle"}. Carrera: ${profile.career}. Datos académicos ya registrados: ciclo ${profile.cycle}, promedio acumulado ${profile.cumulativeGpa} y ${profile.approvedCredits} créditos aprobados; no vuelvas a pedir esos tres datos. Devuelve JSON con exactamente estas claves: summary, priorityIds, followUpQuestions y nextAction. Escribe una guía breve y hasta 10 priorityIds, usando exclusivamente IDs de esta lista. Si hace falta un dato para entender la meta, incluye máximo 2 preguntas respetuosas; nunca preguntes directamente por fallecimiento, discapacidad o pobreza. Candidatos ordenados por reglas: ${JSON.stringify(
        eligibleForGoal.map(({ opportunity, evaluation }) => ({
          id: opportunity.id,
          title: opportunity.title,
          category: opportunity.category,
          state: evaluation.matchState,
          missing: evaluation.primaryGap,
          date: evaluation.window.label,
        }))
      )}`,
    });

    const allowed = new Set(eligibleForGoal.map(({ opportunity }) => opportunity.id));
    const priorityIds = [...new Set(output.priorityIds ?? [])].filter((id) => allowed.has(id)).slice(0, 10);
    const summary = safeSummary(profile, output.summary ?? output.guia_breve ?? fallback.summary);
    const followUpQuestions = safeFollowUpQuestions(
      profile,
      output.followUpQuestions ?? output.preguntas_faltantes ?? []
    );
    const suggestedNextAction = humanizeModelText(output.nextAction ?? output.accion_siguiente ?? fallback.nextAction);
    const repeatsKnownData =
      (profile.facts.age18Plus !== "unknown" && /edad|18 a[nñ]os/i.test(suggestedNextAction)) ||
      (profile.facts.failedLastPeriod !== "unknown" && /desaprobad|reprobad/i.test(suggestedNextAction)) ||
      (/promedio/i.test(suggestedNextAction) && !/(ciclo anterior|[uú]ltimo ciclo)/i.test(suggestedNextAction));
    const nextAction = repeatsKnownData ? fallback.nextAction : suggestedNextAction;

    return Response.json({
      summary,
      priorityIds: priorityIds.length > 0 ? priorityIds : fallbackPriorityIds,
      followUpQuestions,
      nextAction,
      counts,
      mode: "ai" as const,
    });
  } catch (error) {
    console.warn("La guía de meta usó el orden seguro por reglas.", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : undefined,
    });
    return Response.json(fallback);
  }
}
