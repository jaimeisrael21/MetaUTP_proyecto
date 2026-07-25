"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRightIcon, ShieldIcon } from "@/components/icons";
import { SetupProgress } from "@/components/SetupProgress";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { ProfileFacts, SpecialAffiliation, TriState } from "@/data/types";
import { useProfile, useSession } from "@/lib/store";

const triOptions: { value: TriState; label: string }[] = [
  { value: "unknown", label: "No lo sé / responder después" },
  { value: "yes", label: "Sí" },
  { value: "no", label: "No" },
];

const affiliations: { value: SpecialAffiliation; label: string }[] = [
  { value: "coar", label: "COAR" },
  { value: "innova", label: "Innova Schools" },
  { value: "idat", label: "IDAT" },
  { value: "zegel", label: "Zegel IPAE" },
  { value: "intercorp", label: "Grupo Intercorp" },
  { value: "partner_school", label: "Colegio con convenio" },
  { value: "corporate_agreement", label: "Empresa con convenio UTP" },
];

function TriField({ label, value, onChange }: { label: string; value: TriState; onChange: (value: TriState) => void }) {
  return <label><span className="field-label">{label}</span><select value={value} onChange={(event) => onChange(event.target.value as TriState)} className="field-control cursor-pointer">{triOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

export default function PersonalizarPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated } = useProfile();
  const facts = profile.facts;

  useEffect(() => {
    if (!sessionHydrated || !hydrated) return;
    if (!session.loggedIn) router.replace("/");
    else if (!profile.onboarded) router.replace("/configurar");
    else if (!profile.academicSetupComplete) router.replace("/panel?setup=1");
  }, [sessionHydrated, hydrated, session.loggedIn, profile.onboarded, profile.academicSetupComplete, router]);

  function patch(next: Partial<ProfileFacts>) { update({ facts: { ...facts, ...next } }); }
  function updateAcademicRank(value: ProfileFacts["academicRank"]) {
    update({
      facts: { ...facts, academicRank: value },
      dataProvenance: {
        ...profile.dataProvenance,
        academicRankSource: value === "unknown" ? "unknown" : "declared",
      },
    });
  }
  function toggleAffiliation(value: SpecialAffiliation) {
    patch({ affiliations: facts.affiliations.includes(value) ? facts.affiliations.filter((item) => item !== value) : [...facts.affiliations, value] });
  }
  function finish() {
    update({ profileRefined: true });
    router.push("/listo");
  }

  if (!hydrated || !profile.academicSetupComplete) return null;

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <SetupProgress current={3} />
        <header className="mt-8 max-w-3xl page-enter">
          <p className="eyebrow">Cinco bloques breves</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-canvas-foreground md:text-4xl">Afina tus primeras oportunidades</h1>
          <p className="mt-3 text-base leading-7 text-canvas-foreground/70">Estas respuestas evitan resultados fuera de contexto. Puedes elegir “No lo sé” y completarlas después.</p>
        </header>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <section className="refinement-section md:col-span-2">
            <h2 className="text-lg font-bold">1. Situación académica actual</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <TriField label="¿Estás matriculado en el periodo actual?" value={facts.enrolledCurrentTerm} onChange={(value) => patch({ enrolledCurrentTerm: value })} />
              <TriField label="¿Eres estudiante continuo?" value={facts.continuousStudent} onChange={(value) => patch({ continuousStudent: value })} />
              <label><span className="field-label">Situación actual</span><select value={facts.studentStatus} onChange={(event) => patch({ studentStatus: event.target.value as ProfileFacts["studentStatus"] })} className="field-control cursor-pointer"><option value="unknown">Responder después</option><option value="active">Estudiante activo</option><option value="graduate">Egresado</option></select></label>
            </div>
          </section>

          <section className="refinement-section">
            <h2 className="text-lg font-bold">2. Periodo anterior</h2>
            <div className="mt-4 grid gap-4">
              <TriField label="¿Desaprobaste algún curso?" value={facts.failedLastPeriod} onChange={(value) => patch({ failedLastPeriod: value })} />
              <div>
                <span className="field-label flex items-start">
                  <label htmlFor="academic-rank">Posición académica declarada</label>
                  <InfoTooltip
                    label="posición académica oficial"
                    sourceLabel="Reglamento de Estudios de Pregrado UTP V16"
                    sourceUrl="https://www.utp.edu.pe/web/sites/default/files/2026-06/Reglamento-de-Estudios-de-Pregrado-v16-PT.pdf"
                  >
                    La UTP calcula el orden de mérito comparando el promedio del periodo con estudiantes de la misma carrera. MetaUTP no puede deducir tercio, quinto o décimo superior solo con tus notas.
                  </InfoTooltip>
                </span>
                <select id="academic-rank" value={facts.academicRank} onChange={(event) => updateAcademicRank(event.target.value as ProfileFacts["academicRank"])} className="field-control cursor-pointer">
                  <option value="unknown">No la conozco</option>
                  <option value="top_tenth">Décimo superior</option>
                  <option value="top_fifth">Quinto superior</option>
                  <option value="top_third">Tercio superior</option>
                  <option value="none">Ninguna de estas</option>
                </select>
                <span className="field-help">
                  Elige una posición solo si aparece en una constancia o canal oficial. Procedencia actual: {profile.dataProvenance.academicRankSource === "institutional" ? "verificada por UTP" : profile.dataProvenance.academicRankSource === "demo" ? "documento de demostración" : profile.dataProvenance.academicRankSource === "ocr" ? "extraída por OCR y pendiente de sustento" : profile.dataProvenance.academicRankSource === "declared" ? "confirmada por ti" : "sin registrar"}.
                </span>
              </div>
            </div>
          </section>

          <section className="refinement-section">
            <h2 className="text-lg font-bold">3. Edad</h2>
            <div className="mt-4"><TriField label="¿Tienes 18 años o más?" value={facts.age18Plus} onChange={(value) => patch({ age18Plus: value })} /></div>
            <div className="mt-4 rounded-xl bg-canvas-soft p-4 text-sm leading-6 text-canvas-foreground/65">La edad se usa únicamente cuando una convocatoria la establece como requisito.</div>
          </section>

          <section className="refinement-section">
            <h2 className="text-lg font-bold">4. Inglés</h2>
            <div className="mt-4 grid gap-4">
              <TriField label="¿Aprobaste o convalidaste Inglés IV?" value={facts.englishIVPassed} onChange={(value) => patch({ englishIVPassed: value })} />
              <TriField label="¿Tienes certificado de inglés vigente?" value={facts.englishCertificate} onChange={(value) => patch({ englishCertificate: value })} />
            </div>
          </section>

          <section className="refinement-section">
            <h2 className="text-lg font-bold">5. Instituciones y convenios</h2>
            <p className="mt-1 text-sm text-canvas-foreground/60">Marca únicamente lo que te corresponda. Si ninguna aplica, déjalas vacías.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{affiliations.map((item) => <label key={item.value} className="check-option"><input type="checkbox" checked={facts.affiliations.includes(item.value)} onChange={() => toggleAffiliation(item.value)} /><span>{item.label}</span></label>)}</div>
          </section>
        </div>

        <section className="mt-6 flex items-start gap-3 rounded-2xl border border-status-info/20 bg-status-info-soft p-5">
          <ShieldIcon width={20} height={20} className="mt-0.5 shrink-0 text-status-info" />
          <p className="text-sm leading-6 text-canvas-foreground/70">Deporte, cultura, investigación, voluntariado y situaciones personales o económicas no se preguntan aquí. Puedes habilitarlas voluntariamente desde Configuración.</p>
        </section>
        <button type="button" onClick={finish} className="primary-button mt-6 w-full">Revisar mi perfil <ArrowRightIcon width={18} height={18} /></button>
      </div>
    </main>
  );
}
