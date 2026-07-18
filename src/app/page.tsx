"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearProfile,
  clearSession,
  getProfile,
  getSession,
  useSession,
} from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { CompassIcon, GaugeIcon, ShieldIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function enterProduct(account: { name: string; email: string }) {
    const previous = getSession();
    if (previous.email && previous.email !== account.email) clearProfile();
    login(account);
    const profile = getProfile();
    router.push(profile.onboarded ? "/oportunidades" : "/bienvenida");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (mode === "signup" && !cleanName) {
      setError("Ingresa tu nombre para crear tu cuenta.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      enterProduct({ name: cleanName || cleanEmail.split("@")[0], email: cleanEmail });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: cleanName } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage(
            "Cuenta creada. Revisa tu correo y confirma el enlace; luego vuelve para iniciar sesión."
          );
          return;
        }
        enterProduct({ name: cleanName, email: cleanEmail });
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (authError) throw authError;
      enterProduct({
        name:
          (data.user.user_metadata.full_name as string | undefined) ??
          cleanEmail.split("@")[0],
        email: cleanEmail,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo completar el acceso. Inténtalo otra vez."
      );
    } finally {
      setLoading(false);
    }
  }

  function enterDemo() {
    enterProduct({ name: "Jaime", email: "demo@metautp.app" });
  }

  async function resetDemo() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    clearProfile();
    clearSession();
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setMessage("");
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  return (
    <div className="flex min-h-screen w-full">
      <div className="relative hidden w-1/2 flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            M
          </span>
          <span className="text-xl font-bold tracking-tight">MetaUTP</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-tight">
            Tus datos académicos pueden acercarte a oportunidades que hoy no ves.
          </h1>
          <p className="mt-4 leading-relaxed text-sidebar-muted">
            MetaUTP organiza oportunidades documentadas y compara sus requisitos con la
            información que tú decides registrar: qué cumples, qué te falta y qué debe
            validar una entidad responsable.
          </p>

          <div className="mt-8 space-y-4">
            {[
              [CompassIcon, "Explora las 37 oportunidades por categoría o jerarquízalas para ti."],
              [GaugeIcon, "Simula escenarios sin confundir una proyección con una aceptación."],
              [ShieldIcon, "Tu cuenta es independiente: nunca pedimos la contraseña institucional."],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof CompassIcon;
              return (
                <div key={String(text)} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-soft">
                    <ItemIcon width={16} height={16} />
                  </span>
                  <p className="text-sm leading-relaxed text-sidebar-muted">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-sidebar-muted">
          Proyecto independiente · Fuentes visibles · Resultados explicables
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-canvas px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <span className="text-lg font-bold tracking-tight">MetaUTP</span>
          </div>

          <h2 className="text-2xl font-bold text-canvas-foreground">
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-canvas-foreground/60">
            {mode === "login"
              ? "Usa la cuenta personal que creaste para MetaUTP."
              : "Usa Gmail, Outlook u otro correo personal; no tiene que ser de la UTP."}
          </p>

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3">
            <p className="text-xs font-semibold text-primary">Cuenta independiente</p>
            <p className="mt-1 text-xs leading-relaxed text-canvas-foreground/70">
              No ingreses credenciales de UTP+ Portal o UTPClass. La contraseña de MetaUTP
              se procesa con autenticación segura de Supabase y no se guarda en el navegador.
            </p>
          </div>

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
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jaime Aramburu"
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-sm font-medium text-canvas-foreground">
                Correo personal
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@gmail.com"
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-canvas-foreground">
                Contraseña de MetaUTP
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1.5 w-full rounded-lg border border-border-strong bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && <p className="text-sm text-status-unmet">{error}</p>}
            {message && <p className="text-sm text-status-met">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={enterDemo}
            className="mt-3 w-full rounded-lg border border-border-strong bg-white px-4 py-2.5 text-sm font-semibold text-canvas-foreground hover:bg-canvas-soft"
          >
            Explorar demo sin crear cuenta
          </button>

          <p className="mt-6 text-center text-sm text-canvas-foreground/60">
            {mode === "login" ? (
              <>
                ¿Aún no tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
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
                  onClick={() => switchMode("login")}
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
            className="mt-10 block w-full text-center text-xs text-canvas-foreground/35 hover:text-canvas-foreground/60"
          >
            Cerrar sesión y reiniciar este dispositivo
          </button>
        </div>
      </div>
    </div>
  );
}
