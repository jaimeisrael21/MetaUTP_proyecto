import { NextRequest } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { opportunities } from "@/data/opportunities";

export const runtime = "nodejs";
export const maxDuration = 15;

const signalSchema = z.object({ requirement: z.string().min(1).max(300), status: z.enum(["met", "close", "needs_info", "official", "unmet"]), detail: z.string().min(1).max(500) });
const requestSchema = z.object({ opportunityId: z.string().min(1).max(120), signals: z.array(signalSchema).min(1).max(20), windowLabel: z.string().min(1).max(120) });
const explanationSchema = z.object({ summary: z.string().min(1).max(420), nextSteps: z.array(z.string().min(1).max(240)).min(1).max(3), caveat: z.string().min(1).max(260) });
type Explanation = z.infer<typeof explanationSchema>;

const rateLimits = new Map<string, { count: number; resetAt: number }>();
function hasCapacity(ip: string) { const now = Date.now(); const current = rateLimits.get(ip); if (!current || current.resetAt <= now) { rateLimits.set(ip, { count: 1, resetAt: now + 60_000 }); return true; } if (current.count >= 6) return false; current.count += 1; return true; }
function parseExplanation(text: string) { const clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""); const start = clean.indexOf("{"); const end = clean.lastIndexOf("}"); return explanationSchema.parse(JSON.parse(start >= 0 && end > start ? clean.slice(start, end + 1) : clean)); }

function fallback(title: string, signals: z.infer<typeof signalSchema>[], actionNote?: string): Explanation {
  const unmet = signals.filter((item) => item.status === "unmet");
  const pending = signals.filter((item) => item.status === "needs_info" || item.status === "official");
  const close = signals.filter((item) => item.status === "close");
  const summary = unmet.length ? `${title} tiene ${unmet.length} requisito${unmet.length === 1 ? "" : "s"} que aún debes alcanzar.` : close.length ? `Estás cerca de ${title}: hay ${close.length} requisito${close.length === 1 ? "" : "s"} medible${close.length === 1 ? "" : "s"} por mejorar.` : pending.length ? `Tus datos no muestran un bloqueo medible para ${title}, pero quedan puntos por confirmar.` : `Tus datos registrados coinciden con los requisitos comparables de ${title}.`;
  const nextSteps = [...unmet, ...close, ...pending].slice(0, 2).map((item) => item.detail);
  if (actionNote && nextSteps.length < 3) nextSteps.push(actionNote);
  if (nextSteps.length < 3) nextSteps.push("Si un requisito no está claro, confírmalo con el SAE o la entidad responsable.");
  return { summary, nextSteps: nextSteps.slice(0, 3), caveat: "Orientación basada en estados derivados; no reemplaza la evaluación, fuente ni confirmación oficial." };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin"); const host = request.headers.get("host");
  if (origin && host) { try { if (new URL(origin).host !== host) return Response.json({ error: "Origen no permitido." }, { status: 403 }); } catch { return Response.json({ error: "Origen no válido." }, { status: 403 }); } }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!hasCapacity(ip)) return Response.json({ error: "Espera un minuto antes de solicitar otra explicación." }, { status: 429 });
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Los datos enviados no son válidos." }, { status: 400 });
  const opportunity = opportunities.find((item) => item.id === parsed.data.opportunityId);
  if (!opportunity) return Response.json({ error: "Oportunidad no encontrada." }, { status: 404 });
  const safeFallback = fallback(opportunity.title, parsed.data.signals, opportunity.actionNote);
  try {
    const result = await generateText({
      model: process.env.AI_GATEWAY_MODEL?.replace(/^\uFEFF/, "").trim() || "alibaba/qwen3.5-flash",
      abortSignal: AbortSignal.timeout(12_000), maxRetries: 0, temperature: 0, maxOutputTokens: 420,
      providerOptions: { alibaba: { enableThinking: false }, gateway: { tags: ["feature:opportunity-explanation", "app:metautp"] } },
      system: "Eres el asistente explicativo de MetaUTP. Responde en español peruano claro. No inventes requisitos, fechas, probabilidades ni beneficios. No afirmes admisión. Los estados recibidos ya fueron calculados por reglas y son tu única base. Cuando falte confirmación, recomienda consultar al SAE; escribe exactamente 'el SAE' y no expandas ni redefinas el acrónimo. Devuelve solo JSON válido.",
      prompt: `Devuelve {"summary":"texto","nextSteps":["texto"],"caveat":"texto"}, con 1 a 3 pasos. Contexto no sensible: ${JSON.stringify({ opportunity: { title: opportunity.title, category: opportunity.category, actionNote: opportunity.actionNote, source: opportunity.source.label, window: parsed.data.windowLabel }, result: parsed.data.signals })}`,
    });
    return Response.json({ ...parseExplanation(result.text), mode: "ai" as const });
  } catch { return Response.json({ ...safeFallback, mode: "rules" as const }); }
}
