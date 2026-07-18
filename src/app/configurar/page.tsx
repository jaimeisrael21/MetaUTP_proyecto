"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile, useSession } from "@/lib/store";
import { ArrowRightIcon, ChevronLeftIcon } from "@/components/icons";

export default function ConfigurarPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();

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
    if (profile.onboarded) {
      const frame = window.requestAnimationFrame(() => {
        setCycle(profile.cycle);
        setGpa(String(profile.cumulativeGpa));
        setCredits(String(profile.approvedCredits));
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [profileHydrated, profile.onboarded, profile.cycle, profile.cumulativeGpa, profile.approvedCredits]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const gpaNum = parseFloat(gpa.replace(",", "."));
    const creditsNum = parseInt(credits, 10);

    if (Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 20) {
      setError("Ingresa un promedio ponderado válido, entre 0 y 20.");
      return;
    }
    if (Number.isNaN(creditsNum) || creditsNum < 0) {
      setError("Ingresa tus créditos aprobados como un número.");
      return;
    }
    setError("");
    update({
      cycle,
      cumulativeGpa: Math.round(gpaNum * 100) / 100,
      approvedCredits: creditsNum,
      onboarded: true,
    });
    router.push("/oportunidades");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/bienvenida"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-canvas-foreground/60 hover:text-canvas-foreground"
        >
          <ChevronLeftIcon width={16} height={16} />
          Volver
        </Link>

        <p className="text-sm font-semibold text-primary">Último paso</p>
        <h1 className="mt-1 text-2xl font-bold text-canvas-foreground">Configura tu ciclo</h1>
        <p className="mt-2 text-sm text-canvas-foreground/60">
          Con esto calculamos, con tus datos reales, qué tan cerca estás de cada beca,
          intercambio o programa. No accedemos a UTPClass — todo lo escribes tú.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-white px-4 py-3">
          <p className="text-sm font-semibold text-canvas-foreground">Tú controlas cómo cargar tus datos</p>
          <p className="mt-1 text-xs leading-relaxed text-canvas-foreground/60">
            Empieza con estos tres datos. En el Panel del ciclo podrás escribir tus cursos
            manualmente o importar una captura del horario con OCR y revisar lo detectado.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="cycle" className="text-sm font-medium text-canvas-foreground">
              Ciclo actual
            </label>
            <select
              id="cycle"
              value={cycle}
              onChange={(e) => setCycle(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>
                  {c}° ciclo
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gpa" className="text-sm font-medium text-canvas-foreground">
              Promedio ponderado acumulado
            </label>
            <input
              id="gpa"
              type="text"
              inputMode="decimal"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="Ej. 14.5"
              className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-canvas-foreground/50">
              Lo encuentras en tu constancia de notas o en UTPClass, escala 0-20.
            </p>
          </div>

          <div>
            <label htmlFor="credits" className="text-sm font-medium text-canvas-foreground">
              Créditos aprobados acumulados
            </label>
            <input
              id="credits"
              type="text"
              inputMode="numeric"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="Ej. 96"
              className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && <p className="text-sm text-status-unmet">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Ver mis oportunidades
            <ArrowRightIcon width={16} height={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
