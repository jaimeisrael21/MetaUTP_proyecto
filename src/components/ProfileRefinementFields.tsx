"use client";

import type {
  ProfileFacts,
  SpecialAffiliation,
  TriState,
} from "@/data/types";

interface ProfileRefinementFieldsProps {
  facts: ProfileFacts;
  onChange: (next: ProfileFacts) => void;
}

const TRI_STATE_OPTIONS: { value: TriState; label: string }[] = [
  { value: "unknown", label: "Prefiero responder después" },
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

const AFFILIATIONS: { value: SpecialAffiliation; label: string }[] = [
  { value: "coar", label: "Egresé de COAR" },
  { value: "innova", label: "Egresé de Innova Schools" },
  { value: "idat", label: "Egresé de IDAT" },
  { value: "zegel", label: "Egresé de Zegel IPAE" },
  { value: "intercorp", label: "Tengo vínculo con Grupo Intercorp" },
  { value: "partner_school", label: "Egresé de otro colegio con convenio" },
  { value: "mother_of_god", label: "Me corresponde un beneficio de Madre de Dios" },
  { value: "corporate_agreement", label: "Trabajo en una empresa con convenio UTP" },
];

function TriStateSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="field-label">{label}</span>
      <select
        id={id}
        className="field-control cursor-pointer"
        value={value}
        onChange={(event) => onChange(event.target.value as TriState)}
      >
        {TRI_STATE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProfileRefinementFields({ facts, onChange }: ProfileRefinementFieldsProps) {
  function patch(next: Partial<ProfileFacts>) {
    onChange({ ...facts, ...next });
  }

  function toggleAffiliation(value: SpecialAffiliation) {
    const selected = facts.affiliations.includes(value);
    patch({
      affiliations: selected
        ? facts.affiliations.filter((item) => item !== value)
        : [...facts.affiliations, value],
    });
  }

  return (
    <section className="mt-7 border-t border-border pt-7" aria-labelledby="refine-title">
      <div className="rounded-2xl bg-canvas-soft/75 p-5">
        <p className="eyebrow">Opcional</p>
        <h2 id="refine-title" className="mt-2 text-xl font-bold text-canvas-foreground">
          Afina tus oportunidades
        </h2>
        <p className="mt-2 text-sm leading-6 text-canvas-foreground/65">
          Estos datos evitan recomendaciones fuera de contexto. Puedes omitirlos ahora y
          editarlos después desde tu perfil académico.
        </p>
      </div>

      <details className="refinement-section mt-4" open>
        <summary>Rendimiento y situación académica</summary>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label htmlFor="academic-rank" className="block">
            <span className="field-label">¿Conoces tu posición académica?</span>
            <select
              id="academic-rank"
              className="field-control cursor-pointer"
              value={facts.academicRank}
              onChange={(event) => patch({ academicRank: event.target.value as ProfileFacts["academicRank"] })}
            >
              <option value="unknown">No la conozco</option>
              <option value="top_tenth">Décimo superior</option>
              <option value="top_fifth">Quinto superior</option>
              <option value="top_third">Tercio superior</option>
              <option value="none">Ninguna de estas</option>
            </select>
          </label>
          <TriStateSelect id="failed-last-period" label="¿Desaprobaste algún curso el periodo anterior?" value={facts.failedLastPeriod} onChange={(value) => patch({ failedLastPeriod: value })} />
          <TriStateSelect id="continuous-student" label="¿Eres estudiante continuo de Pregrado o CGT?" value={facts.continuousStudent} onChange={(value) => patch({ continuousStudent: value })} />
          <TriStateSelect id="current-enrollment" label="¿Estás matriculado en el periodo actual?" value={facts.enrolledCurrentTerm} onChange={(value) => patch({ enrolledCurrentTerm: value })} />
          <TriStateSelect id="adult" label="¿Tienes 18 años o más?" value={facts.age18Plus} onChange={(value) => patch({ age18Plus: value })} />
          <label htmlFor="student-status" className="block">
            <span className="field-label">Situación actual</span>
            <select id="student-status" className="field-control cursor-pointer" value={facts.studentStatus} onChange={(event) => patch({ studentStatus: event.target.value as ProfileFacts["studentStatus"] })}>
              <option value="unknown">Prefiero responder después</option>
              <option value="active">Estudiante activo</option>
              <option value="graduate">Egresado</option>
            </select>
          </label>
          <TriStateSelect id="disciplinary-issues" label="¿Tienes una sanción disciplinaria vigente?" value={facts.disciplinaryIssues} onChange={(value) => patch({ disciplinaryIssues: value })} />
          <TriStateSelect id="outstanding-debt" label="¿Tienes una obligación administrativa o financiera pendiente?" value={facts.outstandingDebt} onChange={(value) => patch({ outstandingDebt: value })} />
        </div>
      </details>

      <details className="refinement-section mt-3">
        <summary>Inglés, actividades y experiencia</summary>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label htmlFor="english-level" className="block">
            <span className="field-label">Nivel de inglés aproximado</span>
            <select id="english-level" className="field-control cursor-pointer" value={facts.englishLevel} onChange={(event) => patch({ englishLevel: event.target.value as ProfileFacts["englishLevel"] })}>
              <option value="unknown">No lo sé</option>
              <option value="none">Aún no tengo nivel</option>
              {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
          <TriStateSelect id="english-certificate" label="¿Tienes un certificado de inglés vigente?" value={facts.englishCertificate} onChange={(value) => patch({ englishCertificate: value })} />
          <TriStateSelect id="competitive-sport" label="¿Practicas deporte competitivo?" value={facts.competitiveSport} onChange={(value) => patch({ competitiveSport: value })} />
          <TriStateSelect id="utp-representation" label="¿Representas a la UTP en deporte o cultura?" value={facts.representsUtp} onChange={(value) => patch({ representsUtp: value })} />
          <TriStateSelect id="elite-athlete" label="¿Cuentas con acreditación deportiva DC o DECAN?" value={facts.eliteAthleteCredential} onChange={(value) => patch({ eliteAthleteCredential: value })} />
          <TriStateSelect id="cultural-ensemble" label="¿Integras un elenco cultural UTP?" value={facts.culturalEnsemble} onChange={(value) => patch({ culturalEnsemble: value })} />
          <TriStateSelect id="research-experience" label="¿Participas en investigación?" value={facts.researchExperience} onChange={(value) => patch({ researchExperience: value })} />
          <TriStateSelect id="volunteering" label="¿Realizas voluntariado?" value={facts.volunteering} onChange={(value) => patch({ volunteering: value })} />
          <TriStateSelect id="work-experience" label="¿Tienes experiencia laboral?" value={facts.workExperience} onChange={(value) => patch({ workExperience: value })} />
        </div>

        <fieldset className="mt-6">
          <legend className="field-label">Institución de procedencia o vínculo</legend>
          <p className="field-help">Marca solo lo que te corresponda.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {AFFILIATIONS.map((item) => (
              <label key={item.value} className="check-option">
                <input type="checkbox" checked={facts.affiliations.includes(item.value)} onChange={() => toggleAffiliation(item.value)} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </details>

      <details className="refinement-section mt-3">
        <summary>Situaciones personales o económicas</summary>
        <p className="mt-4 text-sm leading-6 text-canvas-foreground/65">
          Algunas oportunidades están dirigidas a situaciones personales, familiares o
          económicas específicas. ¿Deseas considerarlas?
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Considerar situaciones personales">
          {([
            ["yes", "Sí, quiero considerarlas"],
            ["not_now", "Ahora no"],
            ["prefer_not", "Prefiero no responder"],
          ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={facts.sensitiveConsent === value} onClick={() => patch({ sensitiveConsent: value })} className={`choice-chip ${facts.sensitiveConsent === value ? "choice-chip--active" : ""}`}>
              {label}
            </button>
          ))}
        </div>

        {facts.sensitiveConsent === "yes" && (
          <div className="mt-5 grid gap-5 rounded-2xl border border-primary/15 bg-primary-soft/45 p-5 sm:grid-cols-2">
            <TriStateSelect id="financial-need" label="¿Deseas considerar apoyos por necesidad económica?" value={facts.financialNeed} onChange={(value) => patch({ financialNeed: value })} />
            <TriStateSelect id="lost-guardian" label="¿Te corresponde evaluar un apoyo por pérdida del responsable económico?" value={facts.lostEconomicGuardian} onChange={(value) => patch({ lostEconomicGuardian: value })} />
            <TriStateSelect id="disability-conadis" label="¿Deseas considerar beneficios vinculados a CONADIS?" value={facts.disabilityConadis} onChange={(value) => patch({ disabilityConadis: value })} />
            <TriStateSelect id="regional-benefit" label="¿Deseas considerar un beneficio regional específico?" value={facts.regionalBenefit} onChange={(value) => patch({ regionalBenefit: value })} />
          </div>
        )}
      </details>
    </section>
  );
}

