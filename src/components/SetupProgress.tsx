import { CheckCircleIcon } from "./icons";

const STEPS = ["Perfil", "Cursos", "Oportunidades"] as const;

export function SetupProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Progreso de configuraciÃ³n">
      {STEPS.map((step, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;

        return (
          <li
            key={step}
            className={`relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "border-primary/35 bg-primary-soft text-primary"
                : complete
                  ? "border-status-met/30 bg-status-met-soft text-status-met"
                  : "border-border bg-white text-canvas-foreground/45"
            }`}
            aria-current={active ? "step" : undefined}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? "bg-primary text-white"
                  : complete
                    ? "bg-status-met text-white"
                    : "bg-canvas-soft text-canvas-foreground/55"
              }`}
            >
              {complete ? <CheckCircleIcon width={15} height={15} /> : number}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
