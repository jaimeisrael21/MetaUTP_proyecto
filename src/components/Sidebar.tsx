"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  CompassIcon,
  LogOutIcon,
  SlidersIcon,
  SettingsIcon,
  UserIcon,
} from "./icons";

// Orden de navegación — CORRECCIÓN YA DECIDIDA a partir del feedback real del
// profesor: Oportunidades es el gancho del proyecto y va primero. Antes
// estaba enterrada como último ítem bajo un "Más" genérico; un alumno nuevo
// nunca llegaba a verla. No reordenar esto de vuelta.
const NAV_ITEMS = [
  { href: "/oportunidades", label: "Oportunidades", icon: CompassIcon },
  { href: "/simulador", label: "Plan de mejora", icon: SlidersIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useSession();
  const initials = (session.name || "Estudiante")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="px-5 pb-5 pt-6">
        <Link href="/oportunidades" className="sidebar-brand group flex items-center gap-3 rounded-xl px-2 py-1">
          <span className="sidebar-brand__mark flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-[0_10px_24px_rgba(197,31,70,0.25)]">
            M
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight">Meta<span className="text-primary">UTP</span></span>
            <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.13em] text-sidebar-muted">Tu mapa académico</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(197,31,70,0.2)]"
                  : "text-sidebar-muted hover:translate-x-0.5 hover:bg-sidebar-soft hover:text-sidebar-foreground"
              }`}
            >
              <Icon width={18} height={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <Link href="/configuracion" className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-all duration-200 ${pathname?.startsWith("/configuracion") ? "bg-sidebar-soft text-sidebar-foreground" : "text-sidebar-muted hover:bg-sidebar-soft hover:text-sidebar-foreground"}`}>
          <SettingsIcon width={18} height={18} /> Configuración
        </Link>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-sidebar-soft/70 p-3">
          <Link href="/configuracion" className="group flex min-w-0 flex-1 items-center gap-3" title="Abrir Configuración">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white transition group-hover:scale-105">
              {initials || <UserIcon width={17} height={17} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block break-words text-[13px] font-bold leading-4 text-sidebar-foreground" title={session.name}>
                {session.name || "Estudiante UTP"}
              </span>
              <span className="mt-0.5 block truncate text-xs font-medium text-sidebar-muted" title={session.email}>
                {session.email || "Cuenta personal"} · Perfil
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              const supabase = getSupabaseBrowserClient();
              if (supabase) await supabase.auth.signOut();
              logout();
              router.push("/");
            }}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sidebar-muted transition hover:bg-white/8 hover:text-sidebar-foreground"
          >
            <LogOutIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
