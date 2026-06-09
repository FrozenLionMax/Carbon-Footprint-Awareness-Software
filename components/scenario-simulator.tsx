"use client"

import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  projectTenYears,
  type ScenarioLevers,
} from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { Sparkles, Zap, Salad, TrainFront, Car } from "lucide-react"
import { useCarbonContext } from "@/lib/context"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { hapticAudio } from "@/lib/audio"

const LEVER_META: {
  key: keyof ScenarioLevers
  label: string
  note: string
  icon: typeof Zap
}[] = [
  { key: "renewableSwitch", label: "100% renewable tariff", note: "eliminates Scope 2 grid draw", icon: Zap },
  { key: "plantForward", label: "Plant-forward diet", note: "−45% animal proteins", icon: Salad },
  { key: "groundTravel", label: "Rail over short-haul", note: "−70% short flights", icon: TrainFront },
  { key: "fleetEv", label: "Electric vehicle", note: "−85% petrol combustion", icon: Car },
]

const chartConfig = {
  baseline: { label: "Business as usual", color: "var(--color-chart-4)" },
  scenario: { label: "Your pathway", color: "var(--color-chart-2)" },
  budget: { label: "1.5°C budget", color: "var(--color-chart-1)" },
} satisfies ChartConfig

export function ScenarioSimulator() {
  const { profile, levers, toggleLever, fy } = useCarbonContext()
  const result = useMemo(() => projectTenYears(levers, profile, fy), [levers, profile, fy])

  const finalYear = result.years[result.years.length - 1]
  const withinBudget = finalYear.scenario <= finalYear.budget

  return (
    <div className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40 lg:col-span-2">
      <div className="flex flex-row items-start justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
              MODULE 005 ·
            </span>
            <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
              PATHWAY SIMULATOR
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            10-year cumulative projection · compounding levers vs. 1.5°C budget
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums tnum flex justify-end",
              withinBudget ? "text-accent" : "text-primary",
            )}
          >
            <AnimatedNumber value={-result.reductionPct} decimals={0} suffix="%" />
          </p>
          <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
            annual cut
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-white/5 lg:grid-cols-[1.5fr_1fr]">
        <div className="bg-card/0 p-4">
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={result.years} margin={{ left: -8, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="fill-scenario" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} className="font-mono text-[10px]" />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} className="font-mono text-[10px]" tickFormatter={(v) => `${v}t`} />
              <ChartTooltip cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltipContent />} />
              <Area dataKey="baseline" type="monotone" stroke="var(--color-chart-4)" strokeWidth={1.5} strokeDasharray="4 3" fill="none" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
              <Area dataKey="scenario" type="monotone" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#fill-scenario)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
              <Area dataKey="budget" type="monotone" stroke="var(--color-chart-1)" strokeWidth={1.5} fill="none" isAnimationActive={true} animationDuration={1200} animationEasing="ease-in-out" />
            </AreaChart>
          </ChartContainer>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-chart-2" /> pathway</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-chart-4" /> business-as-usual</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-chart-1" /> 1.5°C budget</span>
          </div>
        </div>

        <div className="flex flex-col bg-card/0">
          <div className="flex flex-col divide-y divide-white/10">
            {LEVER_META.map((lever) => {
              const active = levers[lever.key]
              const Icon = lever.icon
              return (
                <button
                  key={lever.key}
                  type="button"
                  onClick={() => {
                    hapticAudio.playToggle(!active)
                    toggleLever(lever.key)
                  }}
                  aria-pressed={active}
                  className={cn(
                    "group flex items-center gap-3 px-5 py-3 text-left transition-all duration-300 hover:bg-muted/60 hover:pl-6 active:scale-[0.98]",
                    active && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-sm border transition-all duration-300 group-hover:shadow-sm",
                      active
                        ? "border-primary/50 bg-primary/15 text-primary group-hover:border-primary group-hover:bg-primary/25"
                        : "border-border bg-muted text-muted-foreground group-hover:border-border/80 group-hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{lever.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{lever.note}</p>
                  </div>
                  <span
                    className={cn(
                      "relative h-4 w-7 shrink-0 rounded-full transition-colors",
                      active ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-3 rounded-full bg-card transition-all",
                        active ? "left-3.5" : "left-0.5",
                      )}
                    />
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
            <div className="bg-card/0 px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                Lifetime saved
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums tnum text-accent flex items-baseline gap-1">
                <AnimatedNumber value={result.lifetimeSaved} decimals={0} />
                <span className="text-[10px] text-muted-foreground"> tCO₂e</span>
              </p>
            </div>
            <div className="bg-card/0 px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                Residual / yr
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums tnum text-foreground flex items-baseline gap-1">
                <AnimatedNumber value={result.scenarioAnnualT} decimals={0} />
                <span className="text-[10px] text-muted-foreground"> tCO₂e</span>
              </p>
            </div>
            <div className="bg-card/0 px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                Total CapEx
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums tnum text-destructive">
                <AnimatedNumber value={result.totalCapEx} decimals={0} prefix="$" />
              </p>
            </div>
            <div className="bg-card px-5 py-3">
              <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                Annual Savings
              </p>
              <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums tnum text-accent">
                <AnimatedNumber value={result.annualSavings} decimals={0} prefix="$" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
