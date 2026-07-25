import { HelpCircleIcon } from "./icons";

interface InfoTooltipProps {
  label: string;
  children: React.ReactNode;
  sourceLabel?: string;
  sourceUrl?: string;
}

export function InfoTooltip({ label, children, sourceLabel, sourceUrl }: InfoTooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Más información: ${label}`}
        className="ml-1 inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full text-canvas-foreground/45 transition hover:bg-canvas-soft hover:text-canvas-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
      >
        <HelpCircleIcon width={16} height={16} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-30 hidden w-72 -translate-x-1/2 rounded-xl border border-border bg-sidebar p-3 text-left text-xs font-normal leading-5 text-sidebar-foreground shadow-2xl group-hover/tooltip:block group-focus-within/tooltip:block"
      >
        <span className="block">{children}</span>
        {sourceLabel && (
          <span className="mt-2 block border-t border-white/10 pt-2 text-[11px] text-sidebar-muted">
            Fuente: {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="pointer-events-auto font-semibold text-amber-200 underline underline-offset-2">
                {sourceLabel}
              </a>
            ) : sourceLabel}
          </span>
        )}
      </span>
    </span>
  );
}
