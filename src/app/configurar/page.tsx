"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ShieldIcon } from "@/components/icons";
import { CatalogPeriodNotice } from "@/components/CatalogPeriodNotice";
import { SetupProgress } from "@/components/SetupProgress";
import { useProfile, useSession } from "@/lib/store";

export default function ConfigurarPage() {
  const router = useRouter();
  const { session, login, hydrated: sessionHydrated } = useSession();
  const { profile, update, hydrated: profileHydrated } = useProfile();
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionHydrated && !session.loggedIn) router.replace("/");
  }, [sessionHydrated, session.loggedIn, router]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    const career = String(form.get("career") ?? "");
    const profileName = session.mode === "demo"
      ? String(form.get("name") ?? "").trim()
      : (session.name || profile.name).trim();
    const cycle = Number(form.get("cycle") ?? 1);
    const academicPeriod = String(form.get("academicPeriod") ?? "");
    if (!profileName) {
      setError("Escribe tu nombre para continuar.");
      return;
    }
    if (!career.trim()) {
      setError("Escribe el nombre de tu carrera para continuar.");
      return;
    }
    if (!/^\d{4}-[12]$/.test(academicPeriod)) {
      setError("Usa un periodo válido, por ejemplo 2026-1.");
      return;
    }
    if (session.mode === "demo") login({ name: profileName, mode: "demo" });
    update({
      name: profileName,
      career: career.trim(),
      cycle,
      academicPeriod,
      onboarded: true,
    });
    router.push(profile.academicSetupComplete ? "/configuracion?saved=profile" : "/panel?setup=1");
  }

  const firstName = (session.name || profile.name || "Estudiante").split(" ")[0];
  const editing = profile.academicSetupComplete;
  if (!profileHydrated || !sessionHydrated) return null;

  return (
    <main className="min-h-screen bg-canvas px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href={editing ? "/configuracion" : "/"} className="brand-mark">
            <span className="brand-mark__icon">M</span>
            <span>Meta<span className="text-primary">UTP</span></span>
          </Link>
          <Link href={editing ? "/configuracion" : "/"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-canvas-foreground/65 hover:text-primary">
            <ChevronLeftIcon width={17} height={17} /> Volver
          </Link>
        </div>

        {!editing && <div className="mt-8"><SetupProgress current={1} /></div>}
        {!editing && <div className="mt-5"><CatalogPeriodNotice compact /></div>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <section className="pt-2 page-enter">
            <p className="eyebrow">Tu punto de partida</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-canvas-foreground md:text-4xl">{firstName}, cuéntanos dónde estudias hoy.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-canvas-foreground/70">Aquí solo pedimos carrera, ciclo y periodo. Tus promedios se registran y revisan en el siguiente paso para no mezclar datos distintos.</p>
            <div className="mt-7 rounded-2xl border border-status-met/25 bg-status-met-soft p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-status-met text-white"><ShieldIcon width={18} height={18} /></span>
                <div>
                  <h2 className="text-base font-bold text-status-met">Tus datos siguen bajo tu control</h2>
                  <p className="mt-1 text-sm leading-6 text-canvas-foreground/70">Nunca pedimos tus credenciales de UTPClass. Puedes corregir o eliminar tus datos desde Configuración.</p>
                </div>
              </div>
            </div>
          </section>

          <form onSubmit={handleSubmit} className="page-enter rounded-3xl border border-border bg-white p-6 shadow-[0_24px_70px_rgba(39,29,18,0.09)] md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {session.mode === "demo" && (
                <label className="sm:col-span-2">
                  <span className="field-label">Nombre para esta demostración</span>
                  <input name="name" defaultValue={profile.name} placeholder="Ej. Alex Torres" className="field-control" autoFocus />
                  <span className="field-help">Solo se usará durante esta prueba y se eliminará al cerrar sesión.</span>
                </label>
              )}
              <label className="sm:col-span-2">
                <span className="field-label">Carrera</span>
                <input name="career" defaultValue={profile.career} placeholder="Ej. Ingeniería de Sistemas e Informática" className="field-control" />
                <span className="field-help">Escríbela como aparece en tu matrícula.</span>
              </label>
              <label>
                <span className="field-label">Ciclo actual</span>
                <select name="cycle" defaultValue={profile.cycle || 1} className="field-control cursor-pointer">
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}.° ciclo</option>)}
                </select>
              </label>
              <label>
                <span className="field-label">Periodo académico</span>
                <input name="academicPeriod" defaultValue={profile.academicPeriod || "2026-1"} placeholder="2026-1" className="field-control" />
                <span className="field-help">Formato: año-periodo.</span>
              </label>
            </div>
            {error && <p role="alert" className="mt-5 rounded-xl bg-status-unmet-soft px-4 py-3 text-sm font-semibold text-status-unmet">{error}</p>}
            <button type="submit" className="primary-button mt-7 w-full">{editing ? "Guardar cambios" : "Continuar con mis datos académicos"}<ArrowRightIcon width={18} height={18} /></button>
          </form>
        </div>
      </div>
    </main>
  );
}
