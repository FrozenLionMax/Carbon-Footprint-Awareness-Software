"use client"

import { computeScores, getPillarInputs } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { useCarbonContext } from "@/lib/context"

export function ReductionTargets() {
  const { profile, fy } = useCarbonContext()
  const scores = computeScores(profile, fy)
  const pillarInputs = getPillarInputs(profile, fy)

  const pillars = [
    { key: "environmental", label: "Environmental", weight: 55, value: scores.environmental },
    { key: "social", label: "Social", weight: 20, value: scores.social },
    { key: "governance", label: "Governance", weight: 25, value: scores.governance },
  ]

  const factors = [
    { label: "Renewable share", value: `${pillarInputs.renewableSharePct}%` },
    { label: "Waste diversion", value: `${pillarInputs.wasteDiversionPct}%` },
    { label: "Supplier transparency", value: `${pillarInputs.supplierTransparencyPct}%` },
    { label: "Data completeness", value: `${pillarInputs.dataCompletenessPct}%` },
    { label: "Offset coverage", value: `${pillarInputs.offsetCoveragePct}%` },
  ]

  return (
    <div className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
          ESG COMPOSITE
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Weighted pillar decomposition</p>
      </div>

      <div className="flex items-center gap-4 border-b border-border px-5 py-4">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-sm border border-primary/40 bg-primary/10">
          <div className="text-center">
            <p className="font-mono text-2xl font-semibold tabular-nums tnum text-primary">
              {scores.composite}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-terminal text-primary/70">
              {scores.grade}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Composite of {pillars.length} weighted pillars on a 0–100 scale. Grade derived from
          rating bands; AAA requires ≥85.
        </p>
      </div>

      <div className="flex flex-col gap-4 px-5 py-4">
        {pillars.map((p) => (
          <div key={p.key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-foreground">
                {p.label}
                <span className="ml-1.5 text-muted-foreground/60">·{p.weight}%</span>
              </span>
              <span className="tabular-nums tnum text-muted-foreground">{p.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  p.value >= 65 ? "bg-accent" : p.value >= 45 ? "bg-primary" : "bg-destructive",
                )}
                style={{ width: `${p.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-px border-t border-border bg-border">
        {factors.map((f, i) => (
          <div 
            key={f.label} 
            className={cn(
              "flex items-center justify-between bg-card px-5 py-2.5",
              i === factors.length - 1 && factors.length % 2 !== 0 ? "col-span-2" : ""
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {f.label}
            </span>
            <span className="font-mono text-xs tabular-nums tnum text-foreground">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
