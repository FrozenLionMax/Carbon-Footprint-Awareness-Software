"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { monthlyTrend } from "@/lib/dashboard-data"
import { useCarbonContext } from "@/lib/context"

const chartConfig = {
  scope1: { label: "Scope 1 · Direct", color: "var(--color-chart-1)" },
  scope2: { label: "Scope 2 · Energy", color: "var(--color-chart-3)" },
  scope3: { label: "Scope 3 · Value chain", color: "var(--color-chart-2)" },
} satisfies ChartConfig

export function EmissionsTrendChart() {
  const { profile, fy } = useCarbonContext()
  const data = monthlyTrend(profile, fy)
  const first = data[0].scope1 + data[0].scope2 + data[0].scope3
  const last =
    data[data.length - 1].scope1 + data[data.length - 1].scope2 + data[data.length - 1].scope3
  const ytd = (((last - first) / first) * 100).toFixed(1)

  return (
    <div className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40 lg:col-span-2">
      <div className="flex flex-row items-start justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
              MODULE 001 ·
            </span>
            <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
              EMISSION TIMESERIES
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Monthly kgCO₂e by scope · seasonal + reduction signal modelled
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-2xl font-semibold tabular-nums tnum text-accent">{ytd}%</p>
          <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
            YTD Δ
          </p>
        </div>
      </div>
      <div className="p-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              {(
                [
                  ["scope1", "var(--color-chart-1)"],
                  ["scope2", "var(--color-chart-3)"],
                  ["scope3", "var(--color-chart-2)"],
                ] as const
              ).map(([key, color]) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="font-mono text-[10px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={44}
              className="font-mono text-[10px]"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area dataKey="scope3" type="monotone" stackId="1" stroke="var(--color-chart-2)" fill="url(#fill-scope3)" strokeWidth={1.5} isAnimationActive={true} animationDuration={2000} animationEasing="ease-in-out" />
            <Area dataKey="scope2" type="monotone" stackId="1" stroke="var(--color-chart-3)" fill="url(#fill-scope2)" strokeWidth={1.5} isAnimationActive={true} animationDuration={2000} animationEasing="ease-in-out" />
            <Area dataKey="scope1" type="monotone" stackId="1" stroke="var(--color-chart-1)" fill="url(#fill-scope1)" strokeWidth={1.5} isAnimationActive={true} animationDuration={2000} animationEasing="ease-in-out" />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
