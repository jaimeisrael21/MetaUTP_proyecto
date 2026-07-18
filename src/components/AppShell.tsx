"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { CompassIcon, SettingsIcon, SlidersIcon } from "./icons";

const MOBILE_NAV = [
  { href: "/oportunidades", label: "Oportunidades", icon: CompassIcon },
  { href: "/simulador", label: "Plan", icon: SlidersIcon },
  { href: "/configuracion", label: "Configuración", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-transparent text-canvas-foreground">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-white/85 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/oportunidades" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              M
            </span>
            <span className="font-bold">Meta<span className="text-primary">UTP</span></span>
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-canvas md:hidden">
          {MOBILE_NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                  active ? "text-primary" : "text-canvas-foreground/60"
                }`}
              >
                <Icon width={20} height={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
