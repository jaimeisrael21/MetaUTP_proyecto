"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ShieldIcon } from "@/components/icons";
import { SetupProgress } from "@/components/SetupProgress";
import { useProfile, useSession } from "@/lib/store";

export default function ConfigurarPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [career, setCareer] = useState("");
  const [cycle, setCycle] = useState(1);
  const [gpa, setGpa] = useState("");
  const [credits, setCredits] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionHydrated) return;
    if (!session.loggedIn) router.replace("/");
  }, [sessionHydrated, session.loggedIn, router]);

  useEffect(() => {
    if (!profileHydrated) return;
    const frame = window.requestAnimationFrame(() => {
      setCareer(profile.career ?? "");
      setCycle(profile.cycle || 1);
      setGpa(profile.cumulativeGpa ? String(profile.cumulativeGpa) : "");
      setCredits(profile.approvedCredits ? String(profile.approvedCredits) : "");
    });
    return () => window.cancelAnimationFrame(frame);
  }, [profileHydrated, profile.career, profile.cycle, profile.cumulativeGpa, profile.approvedCredits]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanCareer = career.trim();
    const gpaNumber = Number.parseFloat(gpa.replace(",", "."));
    const creditsNumber = Number.parseInt(credits, 10);

    if (!cleanCareer) {
      setError("Escribe el nombre de tu carrera para continuar.");
      return;
    }
    if (Number.isNaN(gpaNumber) || gpaNumber < 0 || gpaNumber > 20) {
      setError("Ingresa un promedio ponderado válido, entre 0 y 20.");
      return;
    }
    if (Number.isNaN(creditsNumber) || creditsNumber < 0) {
      setError("Ingresa tus créditos aprobados como un número.");
      return;
    }

    setError("");
    update({
      name: session.name || profile.name,
      career: cleanCareer,
      cycle,
      cumulativeGpa: Math.round(gpaNumber * 100) / 100,
      approvedCredits: creditsNumber,
      onboarded: true,
      academicSetupComplete: false,
    });
    router.push("/panel?setup=1");
  }

  const firstName = (session.name || profile.name || "").split(" ")[0];

  return (
    <div className="min-h-screen bg-canvas px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__icon">M</span>
            <span>MetaUTP</span>
          </Link>
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-canvas-foreground/65 transition hover:text-primary"
          >
            <ChevronLeftIcon width={17} height={17} />
            Volver
          </Link>
        </div>

        <div className="mt-8">
          <SetupProgress current={1} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <section className="pt-2 page-enter">
            <p className="eyebrow">Tu punto de partida</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-canvas-foreground md:text-4xl">
              {firstName ? `${firstName}, cuéntanos` : "Cuéntanos"} dónde estás hoy.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-canvas-foreground/70">
              Estos datos nos permiten comparar tu situación con requisitos documentados. En
              el siguiente paso registrarás tus cursos manualmente o mediante OCR.
            </p>

            <div className="mt-7 rounded-2xl border border-status-met/25 bg-status-met-soft p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-status-met text-white">
                  <ShieldIcon width={18} height={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-status-met">Tus datos siguen bajo tu control</h2>
                  <p className="mt-1 text-sm leading-6 text-canvas-foreground/70">
                    Nunca pedimos credenciales de UTPClass. Tú escribes la información y puedes
                    corregirla antes de calcular oportunidades.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="page-enter rounded-3xl border border-border bg-white p-6 shadow-[0_24px_70px_rgba(39,29,18,0.09)] md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="career" className="field-label">Carrera</label>
                <input
                  id="career"
                  type="text"
                  value={career}
                  onChange={(event) => setCareer(event.target.value)}
                  placeholder="Ej. Ingeniería de Sistemas e Informática"
                  className="field-control"
                  autoComplete="organization-title"
                />
                <p className="field-help">Escríbela como aparece en tu matrícula.</p>
              </div>

              <div>
                <label htmlFor="cycle" className="field-label">Ciclo actual</label>
                <select
                  id="cycle"
                  value={cycle}
                  onChange={(event) => setCycle(Number(event.target.value))}
                  className="field-control cursor-pointer"
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((item) => (
                    <option key={item} value={item}>{item}° ciclo</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gpa" className="field-label">Promedio acumulado</label>
                <input
                  id="gpa"
                  type="text"
                  inputMode="decimal"
                  value={gpa}
                  onChange={(event) => setGpa(event.target.value)}
                  placeholder="Ej. 14.5"
                  className="field-control"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="credits" className="field-label">Créditos aprobados acumulados</label>
                <input
                  id="credits"
                  type="text"
                  inputMode="numeric"
                  value={credits}
                  onChange={(event) => setCredits(event.target.value)}
                  placeholder="Ej. 96"
                  className="field-control"
                />
                <p className="field-help">Puedes encontrar ambos datos en tu constancia de notas.</p>
              </div>
            </div>

            {error && <p role="alert" className="mt-5 rounded-xl bg-status-unmet-soft px-4 py-3 text-sm font-semibold text-status-unmet">{error}</p>}

            <button type="submit" className="primary-button mt-7 w-full">
              Continuar con mis cursos
              <ArrowRightIcon width={18} height={18} />
            </button>
            <p className="mt-3 text-center text-[13px] leading-5 text-canvas-foreground/55">
              Paso siguiente: cursos, notas y créditos del ciclo actual.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
