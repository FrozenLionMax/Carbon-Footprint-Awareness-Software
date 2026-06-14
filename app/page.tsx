"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCards } from "@/components/stat-cards"
import { EmissionsTrendChart } from "@/components/emissions-trend-chart"
import { CategoryBreakdownChart } from "@/components/category-breakdown-chart"
import { ReductionTargets } from "@/components/reduction-targets"
import { ConsultantFeed } from "@/components/consultant-feed"
import { Recommendations } from "@/components/recommendations"
import { ScenarioSimulator } from "@/components/scenario-simulator"
import { DataEntryPanel } from "@/components/data-entry-panel"
import { FadeIn } from "@/components/ui/fade-in"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { AIBriefingPanel } from "@/components/ai-briefing-panel"
import { TelemetryTerminal } from "@/components/telemetry-terminal"
import { useState } from "react"

export default function Page() {
  const [isSyncing, setIsSyncing] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground relative z-0">
      {/* Skip to main content link for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>
      <AIBriefingPanel />
      <TelemetryTerminal isOpen={isSyncing} onComplete={() => setIsSyncing(false)} />
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main id="main-content" role="main" aria-label="Carbon Ledger Dashboard" className="flex-1 px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <section id="terminal" className="scroll-mt-24" aria-label="Terminal Parameters">
              <FadeIn delay={0}>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
                      <span className="text-primary">//</span>
                      <span>Terminal</span>
                      <span className="text-muted-foreground/40">/</span>
                      <span className="text-foreground/70">Overview</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsSyncing(true)}
                        className="rounded-md border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold tracking-wide text-primary backdrop-blur-md transition-all hover:bg-primary/20"
                      >
                        SYNC TELEMETRY
                      </button>
                    </div>
                  </div>
                  <h1 className="text-balance font-sans text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                    Personal ESG Intelligence — Deterministic Carbon Ledger
                  </h1>
                  <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                    Every figure below is derived from a single activity profile through
                    emission-factor cascades, composite scoring, z-score anomaly detection, and
                    compounding scenario projection. No values are hard-coded.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <DataEntryPanel />
              </FadeIn>
            </section>

            <section id="inventory" className="flex flex-col gap-4 scroll-mt-24" aria-label="Emissions Inventory">
              <FadeIn delay={0.2}>
                <ErrorBoundary>
                  <StatCards />
                </ErrorBoundary>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <ErrorBoundary>
                    <EmissionsTrendChart />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <CategoryBreakdownChart />
                  </ErrorBoundary>
                </div>
              </FadeIn>
            </section>

            <FadeIn delay={0.4}>
              <section id="anomalies" className="grid grid-cols-1 gap-4 lg:grid-cols-3 scroll-mt-24" aria-label="Anomaly Detection">
                <ErrorBoundary>
                  <ConsultantFeed />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ReductionTargets />
                </ErrorBoundary>
              </section>
            </FadeIn>

            <FadeIn delay={0.5}>
              <section id="scenarios" className="grid grid-cols-1 gap-4 lg:grid-cols-3 scroll-mt-24" aria-label="Scenario Simulation">
                <ErrorBoundary>
                  <ScenarioSimulator />
                </ErrorBoundary>
                <div id="abatement" className="scroll-mt-24">
                  <ErrorBoundary>
                    <Recommendations />
                  </ErrorBoundary>
                </div>
              </section>
            </FadeIn>

            <footer role="contentinfo" className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-terminal text-muted-foreground/60">
              <span>CARBON·LEDGER v3.2 · GHG Protocol aligned</span>
              <span>Engine: deterministic · {new Date().getFullYear()} baseline</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
