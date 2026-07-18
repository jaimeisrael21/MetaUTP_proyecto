import { NextRequest } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { opportunities } from "@/data/opportunities";
import type { StudentProfile } from "@/data/types";
import { evaluateOpportunity } from "@/lib/matching";

export const runtime = "nodejs";
export const maxDuration = 10;

const requestSchema = z.object({
  opportunityId: z.string().min(1).max(120),
  profile: z.object({
    cycle: z.number().int().min(1).max(20),
    cumulativeGpa: z.number().min(0).max(20),
    approvedCredits: z.number().int().min(0).max(400),
  }),
});

const explanationSchema = z.object({
  summary: z.string().min(1).max(420),
  nextSteps: z.array(z.string().min(1).max(240)).min(1).max(3),
  caveat: z.string().min(1).max(260),
});

type Explanation = z.infer<typeof explanationSchema>;

const rateLimits = new Map<string, { count: number; resetAt: number }>();

function hasCapacity(ip: string) {
  const now = Date.now();
  const current = rateLimits.get(ip);
  if (!current || current.resetAt <= now) {
    rateLimits.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 6) return false;
  current.count += 1;
  return true;
}

function deterministicExplanation(
  opportunityTitle: string,
  evaluation: ReturnType<typeof evaluateOpportunity>,
  actionNote?: string
): Explanation {
  let summary = `${opportunityTitle} requiere revisar tu información y la fuente oficial.`;
  if (evaluation.unmetCount > 0) {
    summary = `Todavía hay ${evaluation.unmetCount} requisito${evaluation.unmetCount === 1 ? "" : "s"} medible${evaluation.unmetCount === 1 ? "" : "s"} que no cumples.`;
  } else if (evaluation.closeCount > 0) {
    summary = `Estás cerca: ${evaluation.closeCount} requisito${evaluation.closeCount === 1 ? "" : "s"} medible${evaluation.closeCount === 1 ? "" : "s"} está${evaluation.closeCount === 1 ? "" : "n"} dentro del margen de mejora.`;
  } else if (evaluation.needsInfoCount > 0) {
    summary = `Tus datos no muestran un bloqueo numérico, pero faltan ${evaluation.needsInfoCount} dato${evaluation.needsInfoCount === 1 ? "" : "s"} que debes confirmar.`;
  } else if (evaluation.officialCount > 0) {
    summary = "Cumples los requisitos medibles registrados; quedan condiciones que solo la entidad responsable puede validar.";
  } else if (evaluation.measurableCount > 0) {
    summary = "Cumples todos los requisitos medibles registrados para esta oportunidad.";
  }

  const nextSteps = evaluation.evaluations
    .filter((item) => item.status !== "met")
    .slice(0, 2)
    .map((item) => item.detail);
  if (actionNote && nextSteps.length < 3) nextSteps.push(actionNote);
  if (nextSteps.length === 0) nextSteps.push("Revisa la fuente y confirma la vigencia antes de postular.");

  return {
    summary,
    nextSteps,
    caveat: "Es una orientación basada en tus datos declarados; no reemplaza la evaluación ni la confirmación oficial.",
  };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("host");
  if (origin && requestHost) {
    try {
      if (new URL(origin).host !== requestHost) {
        return Response.json({ error: "Origen no permitido." }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Origen no válido." }, { status: 403 });
    }
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!hasCapacity(ip)) {
    return Response.json(
      { error: "Espera un minuto antes de solicitar otra explicación." },
      { status: 429 }
    );
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
  }

  const opportunity = opportunities.find(
    (item) => item.id === parsed.data.opportunityId
  );
  if (!opportunity) {
    return Response.json({ error: "Oportunidad no encontrada." }, { status: 404 });
  }

  const profile: StudentProfile = {
    name: "",
    cycle: parsed.data.profile.cycle,
    cumulativeGpa: parsed.data.profile.cumulativeGpa,
    approvedCredits: parsed.data.profile.approvedCredits,
    courses: [],
    preferredCategories: [],
    onboarded: true,
  };
  const evaluation = evaluateOpportunity(opportunity, profile);
  const fallback = deterministicExplanation(
    opportunity.title,
    evaluation,
    opportunity.actionNote
  );

  try {
    const model = process.env.AI_GATEWAY_MODEL ?? "google/gemini-3-flash";
    const result = await generateText({
      model,
      abortSignal: AbortSignal.timeout(4_500),
      maxRetries: 0,
      output: Output.object({
        schema: explanationSchema,
        name: "opportunity_explanation",
        description: "Explicación breve y accionable para un estudiante universitario.",
      }),
      system:
        "Eres el asistente explicativo de MetaUTP. Responde en español peruano claro. No inventes requisitos, fechas, probabilidades ni beneficios. No afirmes que el estudiante fue admitido. Las reglas recibidas son la única base de verdad. Prioriza próximos pasos concretos.",
      prompt: JSON.stringify({
        opportunity: {
          title: opportunity.title,
          category: opportunity.category,
          description: opportunity.shortDescription,
          actionNote: opportunity.actionNote,
          window: evaluation.window.label,
        },
        result: evaluation.evaluations.map((item) => ({
          requirement: item.requirement.description,
          status: item.status,
          detail: item.detail,
        })),
      }),
    });

    if (!result.output) throw new Error("El modelo no devolvió una estructura válida.");
    return Response.json({ ...result.output, mode: "ai" as const });
  } catch {
    console.warn("AI Gateway no disponible; se usó la explicación determinística.");
    return Response.json({ ...fallback, mode: "rules" as const });
  }
}
