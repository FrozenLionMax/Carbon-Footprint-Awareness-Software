"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, FlaskConical } from "lucide-react"
import { getInitiatives, scopeLabel } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { useCarbonContext } from "@/lib/context"

const effortStyles: Record<string, string> = {
  Low: "bg-accent/15 text-accent",
  Medium: "bg-primary/15 text-primary",
  High: "bg-destructive/15 text-destructive",
}

export function Recommendations() {
  const { profile, levers, toggleLever, fy } = useCarbonContext()
  const initiatives = getInitiatives(profile, fy)
  const maxAbatement = Math.max(...initiatives.map((i) => i.abatementT))

  return (
    <div className="flex h-full flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40 lg:col-span-2">
      <div className="flex flex-row items-start justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
              MODULE 006 ·
            </span>
            <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
              MARGINAL ABATEMENT STRATEGY
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Interventions ranked by $/tCO₂e · negative cost = net savings
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1 rounded-sm text-primary hover:text-primary"
          onClick={() => {
            document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth", block: "start" })
          }}
        >
          Model
          <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-border bg-muted/40 px-5 py-2 font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
        <span>Intervention</span>
        <span className="text-right">Abatement</span>
        <span className="text-right">MAC</span>
        <span className="text-right">Effort</span>
      </div>

      <div>
        {initiatives.map((i, idx) => (
          <button
            key={i.id}
            onClick={() => toggleLever(i.lever as keyof typeof levers)}
            className={cn(
              "grid w-full grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-border px-5 py-3.5 transition-colors last:border-b-0 hover:bg-muted/30 text-left cursor-pointer",
              levers[i.lever as keyof typeof levers] && "bg-primary/5"
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="truncate text-sm font-medium text-foreground">{i.label}</p>
              </div>
              <div className="mt-1.5 ml-6 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${(i.abatementT / maxAbatement) * 100}%` }}
                />
              </div>
              <p className="ml-6 mt-1 font-mono text-[10px] text-muted-foreground">{scopeLabel(i.scope)}</p>
            </div>
            <span className="text-right font-mono text-sm tabular-nums tnum text-foreground">
              {i.abatementT}
              <span className="text-[10px] text-muted-foreground"> t</span>
            </span>
            <span
              className={cn(
                "text-right font-mono text-sm tabular-nums tnum",
                i.costPerT < 0 ? "text-accent" : "text-foreground",
              )}
            >
              {i.costPerT < 0 ? "−" : ""}${Math.abs(i.costPerT)}
            </span>
            <span
              className={cn(
                "justify-self-end rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide",
                effortStyles[i.effort],
              )}
            >
              {i.effort}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
