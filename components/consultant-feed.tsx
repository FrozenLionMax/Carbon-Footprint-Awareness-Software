"use client"

import { detectAnomalies } from "@/lib/dashboard-data"
import { AlertTriangle, Info, TrendingDown, Cpu, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCarbonContext } from "@/lib/context"

const severityMeta = {
  critical: { icon: AlertTriangle, badge: "CRIT", className: "text-destructive border-destructive shadow-[0_0_10px_var(--color-destructive)] bg-destructive/10 animate-pulse" },
  elevated: { icon: TrendingDown, badge: "WARN", className: "text-primary border-primary/40 bg-primary/10" },
  info: { icon: Info, badge: "INFO", className: "text-accent border-accent/40 bg-accent/10" },
} as const

export function ConsultantFeed() {
  const { profile, fy, toggleLever, levers } = useCarbonContext()
  const anomalies = detectAnomalies(profile, fy)

  return (
    <div className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40 lg:col-span-2">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Cpu className="size-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
            ECO·ASSISTANT — ANOMALY ENGINE
          </h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
          z-score · 3mo window
        </span>
      </div>

      <div className="flex flex-col">
        {anomalies.map((a, i) => {
          const meta = severityMeta[a.severity]
          const isResolved = a.actionLever && levers[a.actionLever]
          const Icon = meta.icon
          return (
            <div key={i} className={cn("flex gap-4 border-b border-white/10 p-5 last:border-b-0 transition-all duration-500", isResolved && "opacity-40 grayscale")}>
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  isResolved ? "text-accent border-accent/40 bg-accent/10" : meta.className,
                )}
              >
                {isResolved ? (
                    <CheckCircle2 className="size-5 animate-in zoom-in spin-in-90 duration-500" />
                ) : (
                    <Icon className="size-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-[2px] border px-1 py-px font-mono text-[9px] tracking-wide transition-colors",
                      isResolved ? "text-accent border-accent/40 bg-accent/10" : meta.className,
                    )}
                  >
                    {isResolved ? "RSLV" : meta.badge}
                  </span>
                  <p className={cn("truncate text-sm font-medium text-foreground transition-all", isResolved && "line-through text-muted-foreground")}>{a.title}</p>
                  <span className={cn("ml-auto shrink-0 font-mono text-xs tabular-nums tnum transition-colors", isResolved ? "text-muted-foreground/50 line-through" : "text-muted-foreground")}>
                    {a.delta}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
                <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-foreground/80">
                  <span className="font-mono text-[10px] uppercase tracking-terminal text-primary">
                    rec→
                  </span>
                  {a.recommendation}
                </p>
                {a.actionLever && (
                  <button
                    onClick={() => {
                      if (!levers[a.actionLever!]) {
                        toggleLever(a.actionLever!)
                      }
                      document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }}
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-primary transition-colors hover:bg-primary/20",
                      levers[a.actionLever!] && "opacity-50 pointer-events-none"
                    )}
                  >
                    {levers[a.actionLever!] ? "Policy Applied ✓" : "Apply Policy →"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
