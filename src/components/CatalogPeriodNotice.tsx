import { CURRENT_ACADEMIC_PERIOD } from "@/data/academic-period";

export function CatalogPeriodNotice({ compact = false }: { compact?: boolean }) {
  return (
    <aside className={`rounded-2xl border border-amber-300/45 bg-amber-50 text-canvas-foreground ${compact ? "px-4 py-3" : "p-5"}`}>
      <p className="text-sm font-bold text-amber-900">Vigencia del catálogo</p>
      <p className={`mt-1 text-sm text-amber-950/75 ${compact ? "leading-5" : "leading-6"}`}>
        Las reglas y convocatorias fueron revisadas para {CURRENT_ACADEMIC_PERIOD.label}. El periodo {CURRENT_ACADEMIC_PERIOD.nextLabel} inicia el 10 de agosto de 2026 y su actualización está en preparación. Antes de postular, confirma siempre la fecha y el requisito en la fuente oficial enlazada.
      </p>
    </aside>
  );
}
