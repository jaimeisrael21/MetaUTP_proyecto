"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, getProfile, clearProfile, clearSession } from "@/lib/store";
import { CompassIcon, GaugeIcon, ShieldIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Ingresa tu nombre para crear tu cuenta.");
      return;
    }
    setError("");
    login({ name: name.trim() || email.split("@")[0], email: email.trim() });
    const profile = getProfile();
    router.push(profile.onboarded ? "/oportunidades" : "/bienvenida");
  }

  function resetDemo() {
    clearProfile();
    clearSession();
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            M
          </span>
          <span className="text-xl font-bold tracking-tight">MetaUTP</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Tus notas ya te dicen qué oportunidades puedes alcanzar.
          </h1>
          <p className="mt-4 text-sidebar-muted">
            MetaUTP cruza tu promedio ponderado y tus créditos con becas, intercambios,
            empleabilidad y convenios reales de la UTP — y te dice con honestidad qué
            cumples, qué te falta y qué debes verificar tú mismo.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-soft">
                <CompassIcon width={16} height={16} />
              </span>
              <p className="text-sm text-sidebar-muted">
                Datos reales de UTP+ Info y del Reglamento de Becas — nunca inventados.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-soft">
                <GaugeIcon width={16} height={16} />
              </span>
              <p className="text-sm text-sidebar-muted">
                Simula qué curso te acerca a la beca o el intercambio que quieres.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-soft">
                <ShieldIcon width={16} height={16} />
              </span>
              <p className="text-sm text-sidebar-muted">
                Tus notas se guardan solo en tu dispositivo. Nunca pedimos tu clave de UTP.
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-sidebar-muted">
          Bolsa de Trabajo UTP: 150,000+ ofertas publicadas en 2025 · 5,000+ empresas aliadas
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-canvas px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              M
            </span>
            <span className="text-lg font-bold tracking-tight">MetaUTP</span>
          </div>

          <h2 className="text-2xl font-bold text-canvas-foreground">
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-canvas-foreground/60">
            {mode === "login"
              ? "Ingresa con tu correo UTP para ver tus oportunidades."
              : "Crea tu cuenta con tu correo UTP en menos de un minuto."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="text-sm font-medium text-canvas-foreground">
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jaime Aramburu"
                  className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-sm font-medium text-canvas-foreground">
                Correo UTP
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="u20xxxxxxx@utp.edu.pe"
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-canvas-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && <p className="text-sm text-status-unmet">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-canvas-foreground/60">
            {mode === "login" ? (
              <>
                ¿Aún no tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-semibold text-primary hover:underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-primary hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>

          <button
            type="button"
            onClick={resetDemo}
            className="mt-10 block w-full text-center text-xs text-canvas-foreground/30 hover:text-canvas-foreground/60"
          >
            Reiniciar datos de ejemplo
          </button>
        </div>
      </div>
    </div>
  );
}
