import Link from "next/link";
import type { CertificationPath } from "@/data/certifications";
import { AwardIcon, ArrowRightIcon } from "./icons";

export function CertificationOpportunityCard({
  path,
  animationIndex = 0,
}: {
  path: CertificationPath;
  animationIndex?: number;
}) {
  return (
    <article
      className="opportunity-card opportunity-card--info"
      style={{ animationDelay: `${Math.min(animationIndex, 5) * 55}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-[#f1e8ff] px-3 py-1 text-xs font-bold text-[#6f2ba8]">Certificación</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <AwardIcon width={18} height={18} />
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold leading-6 text-canvas-foreground">{path.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-canvas-foreground/62">{path.summary}</p>
      <div className="mt-4 rounded-xl border border-border bg-canvas-soft p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-canvas-foreground/45">Entidad</p>
        <p className="mt-1 text-sm font-bold text-canvas-foreground">{path.issuer}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-canvas-foreground/58">{path.nextStep}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs font-semibold text-canvas-foreground/45">Fuente revisada</span>
        <Link href={`/certificaciones#${path.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          Ver ruta <ArrowRightIcon width={14} height={14} />
        </Link>
      </div>
    </article>
  );
}
