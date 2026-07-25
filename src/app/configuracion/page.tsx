"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { CheckCircleIcon, PencilIcon, ScanTextIcon, ShieldIcon } from "@/components/icons";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { ProfileFacts, TriState } from "@/data/types";
import { useProfile, useSession } from "@/lib/store";

const options: { value: TriState; label: string }[] = [
  { value: "unknown", label: "No lo sé / prefiero no indicarlo" },
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

interface ContextHelp {
  text: string;
  sourceLabel: string;
  sourceUrl: string;
}

const OFFICIAL_HELP: Record<string, ContextHelp> = {
  athlete: {
    text: "DC significa Deportista Calificado y DCAN/DECAN, Deportista Calificado de Alto Nivel. La acreditación vigente la emite el IPD; MetaUTP solo registra tu respuesta y la UTP realiza la validación final.",
    sourceLabel: "Reglamento PRODAC UTP V4",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2026-01/Reglamento-Deportes-Alta-Competencia-Deportiva-PRODAC-v04%20-PT.pdf",
  },
  research: {
    text: "Se refiere a participar actualmente en un semillero o grupo estudiantil de investigación reconocido por la UTP. Una actividad externa deberá ser revisada por el área responsable antes de considerarse equivalente.",
    sourceLabel: "Reglamento de grupos estudiantiles de investigación UTP",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/transparencia/INV-RG006-REGLAMENTO-PARA-GRUPOS-ESTUDIANTILES-DE-INVESTIGACION-v1-PT.pdf",
  },
  discipline: {
    text: "Para las becas UTP se revisa que el postulante no tenga sanciones disciplinarias durante la evaluación ni en el periodo académico anterior.",
    sourceLabel: "Reglamento de Becas de Pregrado UTP V18",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2026-06/Reglamento_de_Becas_de_Pregrado_V18_PT.pdf",
  },
  debt: {
    text: "Para las becas UTP se exige no mantener deuda del periodo lectivo anterior frente a la universidad. MetaUTP no consulta tu estado de cuenta: tú declaras el dato y la UTP lo valida.",
    sourceLabel: "Reglamento de Becas de Pregrado UTP V18",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2026-06/Reglamento_de_Becas_de_Pregrado_V18_PT.pdf",
  },
  conadis: {
    text: "CONADIS es el Consejo Nacional para la Integración de la Persona con Discapacidad. Esta respuesta se usa cuando una oportunidad exige resolución o carné vigente; la entidad responsable confirma los documentos.",
    sourceLabel: "CONADIS — plataforma oficial del Estado",
    sourceUrl: "https://www.gob.pe/conadis",
  },
  regional: {
    text: "La Beca Madrediosense exige haber nacido en Madre de Dios y pertenecer como asociado hábil a la Asociación de Estudiantes Madrediosenses. No basta solo con residir en la región.",
    sourceLabel: "Reglamento de Becas de Pregrado UTP V18",
    sourceUrl: "https://www.utp.edu.pe/web/sites/default/files/2026-06/Reglamento_de_Becas_de_Pregrado_V18_PT.pdf",
  },
};

function ContextField({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
  help?: ContextHelp;
}) {
  const controlId = useId();
  return (
    <div className="min-w-0">
      <span className="field-label flex items-start sm:min-h-12">
        <label htmlFor={controlId} className="min-w-0 leading-5">{label}</label>
        {help && (
          <InfoTooltip label={label} sourceLabel={help.sourceLabel} sourceUrl={help.sourceUrl}>
            {help.text}
          </InfoTooltip>
        )}
      </span>
      <select id={controlId} value={value} onChange={(event) => onChange(event.target.value as TriState)} className="field-control cursor-pointer">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated } = useProfile();
  const facts = profile.facts;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sessionHydrated || !hydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
  }, [sessionHydrated, hydrated, session.loggedIn, profile.onboarded, router]);
  function patch(next: Partial<ProfileFacts>) { update({ facts: { ...facts, ...next } }); setSaved(false); }
  function saveContext() {
    update({ contextConfigured: true });
    router.push("/oportunidades?updated=1");
  }
  function omitSensitiveContext() {
    const next = {
      ...facts,
      sensitiveConsent: "not_now" as const,
      financialNeed: "unknown" as const,
      lostEconomicGuardian: "unknown" as const,
      disabilityConadis: "unknown" as const,
      regionalBenefit: "unknown" as const,
    };
    update({ facts: next, contextConfigured: true });
    setSaved(true);
  }

  if (!hydrated || !sessionHydrated || !session.loggedIn || !profile.onboarded) return null;
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-7 md:px-10 md:py-10">
        <header className="page-enter">
          <p className="eyebrow">Tu cuenta y tus datos</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">Configuración</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-canvas-foreground/70">Actualiza tu información cuando cambie. Las oportunidades se vuelven a evaluar con reglas transparentes después de cada guardado.</p>
        </header>

        {saved && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-status-met/25 bg-status-met-soft p-4 text-status-met" role="status"><CheckCircleIcon width={20} height={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Configuración guardada</p><p className="mt-1 text-sm text-canvas-foreground/65">Tus oportunidades se actualizaron: pueden aparecer nuevas opciones y se ocultaron las que ya no corresponden.</p></div></div>}

        <section className="mt-7 grid gap-4 md:grid-cols-2" aria-label="Accesos de configuración">
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <span className="method-card__icon"><PencilIcon width={20} height={20} /></span>
            <h2 className="mt-4 text-lg font-bold">Perfil académico general</h2>
            <p className="mt-1 text-sm leading-6 text-canvas-foreground/60">Carrera, ciclo y periodo académico.</p>
            <Link href="/configurar" className="secondary-button mt-4 w-full">Editar perfil general</Link>
          </article>
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <span className="method-card__icon"><ScanTextIcon width={20} height={20} /></span>
            <h2 className="mt-4 text-lg font-bold">Cursos y documentos</h2>
            <p className="mt-1 text-sm leading-6 text-canvas-foreground/60">Añade cursos, repite el OCR o corrige promedios y créditos.</p>
            <Link href="/panel" className="secondary-button mt-4 w-full">Editar datos académicos</Link>
          </article>
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm md:col-span-2">
            <h2 className="text-lg font-bold">Preguntas clave</h2>
            <p className="mt-1 text-sm leading-6 text-canvas-foreground/60">Matrícula, continuidad, periodo anterior, edad, inglés e instituciones vinculadas.</p>
            <Link href="/personalizar" className="secondary-button mt-4">Revisar preguntas iniciales</Link>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8" aria-labelledby="context-title">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><ShieldIcon width={21} height={21} /></span>
            <div>
              <p className="eyebrow">Opcional</p>
              <h2 id="context-title" className="mt-1 text-2xl font-bold">Oportunidades por contexto</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-canvas-foreground/65">Esta información es opcional y puede ser sensible. Solo se utiliza para evaluar oportunidades relacionadas con tu contexto. Puedes omitirla, modificarla o eliminarla cuando quieras.</p>
            </div>
          </div>

          <details className="refinement-section mt-6" open>
            <summary>Deporte, cultura y participación</summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ContextField label="¿Practicas deporte competitivo?" value={facts.competitiveSport} onChange={(value) => patch({ competitiveSport: value })} />
              <ContextField label="¿Representas a la UTP en deporte o cultura?" value={facts.representsUtp} onChange={(value) => patch({ representsUtp: value })} />
              <ContextField label="¿Cuentas con una acreditación vigente del IPD como DC o DCAN/DECAN?" help={OFFICIAL_HELP.athlete} value={facts.eliteAthleteCredential} onChange={(value) => patch({ eliteAthleteCredential: value })} />
              <ContextField label="¿Integras un elenco cultural UTP?" value={facts.culturalEnsemble} onChange={(value) => patch({ culturalEnsemble: value })} />
              <ContextField label="¿Participas en un semillero o grupo de investigación reconocido por la UTP?" help={OFFICIAL_HELP.research} value={facts.researchExperience} onChange={(value) => patch({ researchExperience: value })} />
              <ContextField label="¿Realizas voluntariado?" value={facts.volunteering} onChange={(value) => patch({ volunteering: value })} />
            </div>
          </details>

          <details className="refinement-section mt-3">
            <summary>Validaciones administrativas</summary>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ContextField label="¿Tienes una sanción disciplinaria vigente o recibiste una en el periodo anterior?" help={OFFICIAL_HELP.discipline} value={facts.disciplinaryIssues} onChange={(value) => patch({ disciplinaryIssues: value })} />
              <ContextField label="¿Mantienes una deuda del periodo lectivo anterior frente a la UTP?" help={OFFICIAL_HELP.debt} value={facts.outstandingDebt} onChange={(value) => patch({ outstandingDebt: value })} />
            </div>
          </details>

          <details className="refinement-section mt-3">
            <summary>Situaciones personales o económicas</summary>
            <p className="mt-4 text-sm leading-6 text-canvas-foreground/65">Activa este bloque solo si deseas que MetaUTP considere apoyos de este tipo.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => patch({ sensitiveConsent: "yes" })} className={`choice-chip ${facts.sensitiveConsent === "yes" ? "choice-chip--active" : ""}`}>Sí, quiero considerarlas</button>
              <button type="button" onClick={omitSensitiveContext} className={`choice-chip ${facts.sensitiveConsent !== "yes" ? "choice-chip--active" : ""}`}>Ahora no</button>
            </div>
            {facts.sensitiveConsent === "yes" && <div className="mt-5 grid gap-4 rounded-2xl border border-primary/15 bg-primary-soft/45 p-5 sm:grid-cols-2"><ContextField label="¿Deseas evaluar apoyos por necesidad económica?" value={facts.financialNeed} onChange={(value) => patch({ financialNeed: value })} /><ContextField label="¿Deseas evaluar apoyo por pérdida del responsable económico?" value={facts.lostEconomicGuardian} onChange={(value) => patch({ lostEconomicGuardian: value })} /><ContextField label="¿Cuentas con resolución y carné CONADIS vigentes?" help={OFFICIAL_HELP.conadis} value={facts.disabilityConadis} onChange={(value) => patch({ disabilityConadis: value })} /><ContextField label="¿Naciste en Madre de Dios y eres asociado hábil de la asociación indicada por la beca?" help={OFFICIAL_HELP.regional} value={facts.regionalBenefit} onChange={(value) => patch({ regionalBenefit: value })} /></div>}
          </details>

          <button type="button" onClick={saveContext} className="primary-button mt-6 w-full">Guardar y actualizar oportunidades</button>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="font-bold">Privacidad y uso de IA</h2>
          <p className="mt-2 text-sm leading-6 text-canvas-foreground/65">Los datos contextuales se usan en el motor de reglas. La guía con IA recibe únicamente estados derivados de requisitos; no recibe tus respuestas sensibles en bruto.</p>
        </section>
      </div>
    </AppShell>
  );
}
