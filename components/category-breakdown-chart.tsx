"use client"

import { Pie, PieChart, Cell, Label } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { scopeLedger, totalAnnualKg, emissionsByActivity } from "@/lib/dashboard-data"
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCarbonContext } from "@/lib/context"
import { useState } from "react"

const SCOPE_COLORS: Record<string, string> = {
  scope1: "var(--color-chart-1)",
  scope2: "var(--color-chart-3)",
  scope3: "var(--color-chart-2)",
}

const chartConfig = { value: { label: "tCO₂e" } } satisfies ChartConfig

export function CategoryBreakdownChart() {
  const { profile, fy } = useCarbonContext()
  const ledger = scopeLedger(profile, fy)
  const activities = emissionsByActivity(profile, fy)
  const totalT = (totalAnnualKg(profile, fy) / 1000).toFixed(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  
  const pieData = ledger.map((r) => ({
    name: r.label,
    value: r.annualT,
    fill: SCOPE_COLORS[r.scope],
  }))

  return (
    <div className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
            MODULE 002 ·
          </span>
          <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
            SCOPE LEDGER
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">GHG Protocol classification · MoM variance</p>
      </div>

      <div className="p-4">
        <ChartContainer config={chartConfig} className="mx-auto h-[150px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
            <Pie 
              data={pieData} 
              dataKey="value" 
              nameKey="name" 
              innerRadius={48} 
              outerRadius={70} 
              strokeWidth={2} 
              stroke="var(--card)"
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground font-mono text-xl font-semibold">
                          {totalT}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground font-mono text-[10px]">
                          tCO₂e/yr
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="border-t border-white/10">
        {ledger.map((r) => {
          const up = r.variancePct > 0
          const isExpanded = expandedRow === r.scope
          const scopeActivities = activities.filter(a => a.scope === r.scope).sort((a, b) => b.kg - a.kg)
          
          return (
            <div key={r.scope} className="border-b border-white/10 last:border-b-0">
              <button 
                onClick={() => setExpandedRow(isExpanded ? null : r.scope)}
                className="group w-full flex items-center gap-3 px-5 py-3 hover:bg-primary/5 transition-all duration-300 text-left hover:px-6"
              >
                <span className="size-2.5 shrink-0 rounded-[2px] shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: SCOPE_COLORS[r.scope] }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{r.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{r.sharePct}% of inventory</p>
                </div>
                <span className="font-mono text-sm tabular-nums tnum text-foreground">{r.annualT}</span>
                <span
                  className={cn(
                    "inline-flex w-14 items-center justify-end gap-0.5 font-mono text-[11px] tabular-nums tnum",
                    up ? "text-primary" : "text-accent",
                  )}
                >
                  {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                  {Math.abs(r.variancePct)}%
                </span>
                {isExpanded ? <ChevronUp className="size-3 text-muted-foreground ml-1" /> : <ChevronDown className="size-3 text-muted-foreground ml-1" />}
              </button>
              <div 
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="bg-muted/10 border-t border-border/50 px-5 py-2">
                    {scopeActivities.map(act => {
                      const maxKg = Math.max(...scopeActivities.map(a => a.kg))
                      const pct = Math.max(2, (act.kg / maxKg) * 100)
                      return (
                        <div key={act.key} className="flex flex-col gap-1 py-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{act.key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-mono text-[11px] tabular-nums tnum text-foreground/80">{(act.kg / 1000).toFixed(2)} t</span>
                          </div>
                          <div className="h-1 w-full bg-border/40 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full animate-in slide-in-from-left duration-700" 
                              style={{ width: `${pct}%`, backgroundColor: SCOPE_COLORS[r.scope] }} 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
