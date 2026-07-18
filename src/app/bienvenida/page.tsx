"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { opportunities } from "@/data/opportunities";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useProfile, useSession } from "@/lib/store";
import { ArrowRightIcon } from "@/components/icons";

export default function BienvenidaPage() {
  const router = useRouter();
  const { session, hydrated: sessionHydrated } = useSession();
  const { profile, hydrated: profileHydrated } = useProfile();
  const featured = opportunities.filter((opportunity) => opportunity.featured);

  useEffect(() => {
    if (!sessionHydrated || !profileHydrated) return;
    if (!session.loggedIn) {
      router.replace("/");
      return;
    }
    if (profile.onboarded) router.replace("/oportunidades");
  }, [sessionHydrated, profileHydrated, session.loggedIn, profile.onboarded, router]);

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center gap-2 px-6 py-6 md:px-12">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          M
        </span>
        <span className="text-lg font-bold tracking-tight text-canvas-foreground">MetaUTP</span>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-6 md:px-12">
        <p className="text-sm font-semibold text-primary">
          Hola{session.name ? `, ${session.name}` : ""} 👋
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-canvas-foreground md:text-4xl">
          Descubre qué oportunidades universitarias ya están a tu alcance y qué te falta para llegar.
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-canvas-foreground/70">
          Abajo ves una muestra de 3. Después de configurar tus datos tendrás el catálogo
          completo de {opportunities.length}, con categorías, vigencia y una jerarquización
          opcional que nunca ocultará resultados.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} locked />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-canvas-foreground">Personaliza las {opportunities.length}</p>
            <p className="mt-1 max-w-xl text-sm text-canvas-foreground/60">
              Solo necesitas ciclo, promedio y créditos. No pedimos tu contraseña de la UTP;
              luego podrás cargar cursos manualmente o revisar una captura procesada con OCR.
            </p>
          </div>
          <Link
            href="/configurar"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Configurar mis datos
            <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
