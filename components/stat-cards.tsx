"use client"

import { computeScores, budgetStatus, totalAnnualKg, emissionsByScope } from "@/lib/dashboard-data"
import { ArrowDownRight, ArrowUpRight, Flame, Gauge, Globe2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCarbonContext } from "@/lib/context"
import { AnimatedNumber } from "@/components/ui/animated-number"

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

export function StatCards() {
  const { profile, fy } = useCarbonContext()
  const scores = computeScores(profile, fy)
  const budget = budgetStatus(profile, fy)
  const annualT = totalAnnualKg(profile, fy) / 1000
  const scope = emissionsByScope(profile, fy)
  const totalKg = totalAnnualKg(profile, fy)
  const scope3Share = totalKg > 0 ? Math.round((scope.scope3 / totalKg) * 100) : 0

  const cards = [
    {
      label: "Annual footprint",
      value: <AnimatedNumber value={annualT} decimals={1} />,
      unit: "tCO₂e / yr",
      icon: Flame,
      delta: "−0.9% MoM",
      good: true,
      sub: `${fmt(Math.round(totalAnnualKg(profile)))} kg modelled`,
    },
    {
      label: "ESG composite",
      value: <AnimatedNumber value={scores.composite} decimals={0} />,
      unit: `grade ${scores.grade}`,
      icon: ShieldCheck,
      delta: `E ${scores.environmental} · S ${scores.social} · G ${scores.governance}`,
      good: scores.composite >= 60,
      sub: "weighted 55/20/25",
    },
    {
      label: "Budget overshoot",
      value: <AnimatedNumber value={budget.overshootRatio} decimals={2} suffix="×" />,
      unit: "vs 1.5°C allowance",
      icon: Gauge,
      delta: `+${Math.round(budget.overshootPct)}% over`,
      good: false,
      sub: `allowance ${fmt(Math.round(budget.allowanceKg))} kg`,
    },
    {
      label: "Earths required",
      value: <AnimatedNumber value={budget.earthsRequired} decimals={2} />,
      unit: "if globally scaled",
      icon: Globe2,
      delta: `budget burns day ${budget.budgetExhaustedDay}`,
      good: false,
      sub: `Scope 3 = ${scope3Share}% of total`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-white/5 bg-border/50 backdrop-blur-xl shadow-2xl shadow-black/40 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const Delta = c.good ? ArrowDownRight : ArrowUpRight
        return (
          <div key={c.label} className="group relative flex flex-col gap-3 bg-card/30 backdrop-blur-md p-5 transition-all duration-300 hover:z-10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 hover:scale-[1.02] border border-transparent hover:border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[laserX_3s_ease-in-out_infinite] pointer-events-none transform -skew-x-12" />
            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                {c.label}
              </span>
              <c.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "font-mono text-3xl font-semibold tabular-nums tnum",
                !c.good ? "bg-gradient-to-r from-primary via-destructive to-primary text-transparent bg-clip-text animate-text-gradient" : "text-foreground"
              )}>
                {c.value}
              </span>
              <span className="font-mono text-xs text-muted-foreground">{c.unit}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-[11px]",
                  c.good ? "text-accent" : "text-primary",
                )}
              >
                <Delta className="size-3" />
                {c.delta}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70">{c.sub}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
