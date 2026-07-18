"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearProfile,
  clearSession,
  getProfile,
  getSession,
  saveProfile,
  useSession,
} from "@/lib/store";
import { DEMO_PROFILE } from "@/data/demo-profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { CompassIcon, GaugeIcon, ShieldIcon } from "@/components/icons";

function friendlyAuthError(caught: unknown) {
  const code =
    typeof caught === "object" && caught && "code" in caught
      ? String(caught.code)
      : "";
  const detail = caught instanceof Error ? caught.message.toLowerCase() : "";

  if (code === "invalid_credentials") {
    return "El correo o la contraseña no coinciden. Revísalos e inténtalo otra vez.";
  }
  if (code === "email_not_confirmed") {
    return "Primero confirma tu correo con el enlace que te enviamos y luego inicia sesión.";
  }
  if (code === "user_already_exists" || detail.includes("already registered")) {
    return "Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo personal.";
  }
  if (code === "weak_password" || detail.includes("password should")) {
    return "Usa una contraseña de al menos 8 caracteres.";
  }
  if (code === "email_address_invalid" || detail.includes("email address")) {
    return "Ese correo no parece válido. Revísalo o usa otro correo personal.";
  }
  if (code === "over_email_send_rate_limit" || detail.includes("email rate limit")) {
    return "El servicio de correo alcanzó su límite temporal. Puedes explorar la demo y volver a intentarlo en unos minutos.";
  }
  if (
    detail.includes("failed to fetch") ||
    detail.includes("network") ||
    detail.includes("iso-8859-1") ||
    detail.includes("headers")
  ) {
    return "No pudimos conectar con el registro. Revisa tu conexión o explora la demo mientras lo intentas de nuevo.";
  }

  return "No se pudo completar el acceso. Inténtalo otra vez o explora la demo.";
}

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
    if (!profile.onboarded) router.push("/configurar");
    else if (!profile.academicSetupComplete) router.push("/panel?setup=1");
    else router.push("/oportunidades");
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
    if (mode === "signup" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (mode === "signup" && !cleanName) {
      setError("Ingresa tu nombre para crear tu cuenta.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "El registro no está disponible en este momento. Puedes explorar la demo sin crear una cuenta."
      );
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage(
            "Cuenta creada. Revisa tu correo y confirma el enlace; volverás a MetaUTP para iniciar sesión."
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
      setError(friendlyAuthError(caught));
    } finally {
      setLoading(false);
    }
  }

  function enterDemo() {
    const demoAccount = { name: DEMO_PROFILE.name, email: "demo@metautp.app" };
    const previous = getSession();
    if (previous.email !== demoAccount.email || !getProfile().onboarded) {
      clearProfile();
      saveProfile(DEMO_PROFILE);
    }
    login(demoAccount);
    router.push("/oportunidades");
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
          <span className="text-xl font-bold tracking-tight">Meta<span className="text-primary">UTP</span></span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Tus datos académicos pueden acercarte a oportunidades que hoy no ves.
          </h1>
          <p className="mt-5 text-base leading-7 text-sidebar-muted">
            MetaUTP organiza oportunidades documentadas y compara sus requisitos con la
            información que tú decides registrar: qué cumples, qué te falta y qué debe
            validar una entidad responsable.
          </p>

          <div className="mt-8 space-y-4">
            {[
              [CompassIcon, "Explora oportunidades ordenadas según tu perfil y por categoría."],
              [GaugeIcon, "Simula escenarios sin confundir una proyección con una aceptación."],
              [ShieldIcon, "Tu cuenta es independiente: nunca pedimos la contraseña institucional."],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof CompassIcon;
              return (
                <div key={String(text)} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-soft">
                    <ItemIcon width={16} height={16} />
                  </span>
                  <p className="text-base leading-6 text-sidebar-muted">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm font-medium text-sidebar-muted">
          Privacidad por diseño · Fuentes verificables · Resultados explicables
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-canvas px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </span>
            <span className="text-lg font-bold tracking-tight">Meta<span className="text-primary">UTP</span></span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-canvas-foreground">
            {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h2>
          <p className="mt-2 text-base leading-6 text-canvas-foreground/60">
            {mode === "login"
              ? "Usa la cuenta personal que creaste para MetaUTP."
              : "Usa Gmail, Outlook u otro correo personal; no tiene que ser de la UTP."}
          </p>

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3">
            <p className="text-sm font-bold text-primary">Cuenta personal y segura</p>
            <p className="mt-1 text-sm leading-6 text-canvas-foreground/70">
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
                  required
                  disabled={loading}
                  className="field-control"
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
                required
                disabled={loading}
                className="field-control"
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
                placeholder={mode === "signup" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : 1}
                required
                disabled={loading}
                className="field-control"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-status-unmet">
                {error}
              </p>
            )}
            {message && (
              <p role="status" aria-live="polite" className="text-sm text-status-met">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={enterDemo}
            className="secondary-button mt-3 w-full"
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
            Restablecer la demo de este dispositivo
          </button>
        </div>
      </div>
    </div>
  );
}
