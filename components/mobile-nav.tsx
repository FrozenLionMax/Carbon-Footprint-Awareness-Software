"use client"

import { useState } from "react"
import { Menu, TerminalSquare, Gauge } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { navItems } from "@/components/dashboard-sidebar"
import { useCarbonContext } from "@/lib/context"
import { budgetStatus } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { profile } = useCarbonContext()
  const budget = budgetStatus(profile)

  const scrollTo = (id: string) => {
    setOpen(false)
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120
        window.scrollTo({ top: y, behavior: "smooth" })
      }
    }, 150) // small delay to let the sheet close
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden shrink-0" />}>
        <Menu className="size-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-[350px] flex flex-col bg-sidebar border-sidebar-border p-0 gap-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
            <TerminalSquare className="size-5" />
          </div>
          <div className="leading-none group">
            <span className="font-mono text-sm font-semibold tracking-terminal text-sidebar-accent-foreground flex items-center gap-1">
              CARBON·LEDGER<span className="inline-block h-3.5 w-2 bg-primary animate-pulse" />
            </span>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/50">
              ESG Terminal v3.2
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-5 overflow-y-auto">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/40">
            // Modules
          </p>
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.id)}
              className="group flex items-center gap-3 rounded-sm px-3 py-3 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="size-[18px] text-sidebar-foreground/50 group-hover:text-sidebar-primary transition-colors" />
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <span className="font-mono text-[10px] text-sidebar-foreground/35">{item.code}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => {
            const el = document.getElementById("scenarios")
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" })
          }}
          className="m-3 rounded-sm border border-sidebar-border bg-sidebar-accent/40 p-4 text-left transition-all hover:bg-sidebar-accent/60 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/50">
              1.5°C Pathway
            </p>
            <span className={`text-sm ${budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"}`}>
              {budget.overshootRatio <= 1 ? "🟢" : budget.overshootRatio <= 3 ? "🟡" : "🔴"}
            </span>
          </div>
          <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums tnum ${
            budget.budgetExhaustedDay >= 365 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"
          }`}>
            {budget.budgetExhaustedDay >= 365 ? "On Track ✓" : `${Math.min(2050, 2025 + Math.ceil(budget.overshootRatio * 3.5))}`}
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9px] text-sidebar-foreground/50">
              <span>Budget Used</span>
              <span className={`font-semibold ${budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"}`}>
                {Math.min(Math.round(budget.overshootRatio * 100), 999)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-foreground/10">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  budget.overshootRatio <= 1 ? "bg-green-500" : budget.overshootRatio <= 3 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(budget.overshootRatio * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[3px] bg-sidebar-foreground/5 px-2 py-1.5">
              <p className="font-mono text-[8px] uppercase text-sidebar-foreground/40">Emissions</p>
              <p className={`font-mono text-xs font-semibold tabular-nums ${budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"}`}>{(budget.annualKg / 1000).toFixed(1)}t</p>
            </div>
            <div className="rounded-[3px] bg-sidebar-foreground/5 px-2 py-1.5">
              <p className="font-mono text-[8px] uppercase text-sidebar-foreground/40">Budget</p>
              <p className="font-mono text-xs font-semibold tabular-nums text-sidebar-foreground/80">{(budget.allowanceKg / 1000).toFixed(1)}t</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-sidebar-foreground/40">
            {budget.budgetExhaustedDay >= 365 ? "✨ Paris-aligned!" : `⚡ Day ${budget.budgetExhaustedDay}/365 exhausted`} ↗
          </p>
        </button>
      </SheetContent>
    </Sheet>
  )
}
