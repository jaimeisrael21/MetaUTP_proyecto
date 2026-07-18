"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  BuildingIcon,
  CompassIcon,
  GaugeIcon,
  LogOutIcon,
  SlidersIcon,
  UserIcon,
} from "./icons";

// Orden de navegación — CORRECCIÓN YA DECIDIDA a partir del feedback real del
// profesor: Oportunidades es el gancho del proyecto y va primero. Antes
// estaba enterrada como último ítem bajo un "Más" genérico; un alumno nuevo
// nunca llegaba a verla. No reordenar esto de vuelta.
const NAV_ITEMS = [
  { href: "/oportunidades", label: "Oportunidades", icon: CompassIcon },
  { href: "/panel", label: "Panel del ciclo", icon: GaugeIcon },
  { href: "/simulador", label: "Simulador", icon: SlidersIcon },
  { href: "/impacto", label: "Impacto UTP", icon: BuildingIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useSession();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-6 py-6">
        <Link href="/oportunidades" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            M
          </span>
          <span className="text-lg font-bold tracking-tight">MetaUTP</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-soft hover:text-sidebar-foreground"
              }`}
            >
              <Icon width={18} height={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-soft text-sidebar-foreground">
            <UserIcon width={16} height={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {session.name || "Estudiante UTP"}
            </p>
            <p className="truncate text-xs text-sidebar-muted">
              {session.email || "sin correo"}
            </p>
          </div>
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
            className="text-sidebar-muted hover:text-sidebar-foreground"
          >
            <LogOutIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
