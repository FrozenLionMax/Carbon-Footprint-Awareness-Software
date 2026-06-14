"use client"

import {
  Activity,
  Radar,
  GitBranch,
  Layers,
  FlaskConical,
  ScrollText,
  Gauge,
  TerminalSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState, useRef } from "react"
import { useCarbonContext } from "@/lib/context"
import { budgetStatus } from "@/lib/dashboard-data"
import { motion } from "framer-motion"

export const navItems = [
  { label: "Terminal", icon: Activity, code: "001", id: "terminal" },
  { label: "Inventory / Ledger", icon: Layers, code: "002", id: "inventory" },
  { label: "Anomalies", icon: Radar, code: "004", id: "anomalies" },
  { label: "Simulations", icon: GitBranch, code: "005", id: "scenarios" },
]

export function DashboardSidebar() {
  const [activeSection, setActiveSection] = useState("terminal")
  const isClickScrolling = useRef(false)
  const clickScrollTimeout = useRef<NodeJS.Timeout | null>(null)
  
  const { profile } = useCarbonContext()
  const budget = budgetStatus(profile)

  useEffect(() => {
    // Cache the absolute positions of the sections to prevent layout thrashing during scroll
    let cachedSections: { id: string, top: number }[] = []
    
    const updateCache = () => {
      cachedSections = navItems
        .map(item => {
          const el = document.getElementById(item.id)
          return el ? { id: item.id, top: el.getBoundingClientRect().top + window.scrollY } : null
        })
        .filter(Boolean) as { id: string, top: number }[]
      cachedSections.sort((a, b) => a.top - b.top)
    }

    // Initial cache build (wait briefly for layout/animations to settle)
    setTimeout(updateCache, 100)

    const handleScroll = () => {
      if (cachedSections.length === 0) updateCache()
      
      const scrollPosition = window.scrollY + 300
      let currentId = navItems[0].id
      
      for (const section of cachedSections) {
        if (scrollPosition >= section.top) {
          currentId = section.id
        }
      }

      if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 10) {
        currentId = cachedSections[cachedSections.length - 1].id
      }

      setActiveSection(prev => prev !== currentId ? currentId : prev)
    }

    let ticking = false
    const onScroll = () => {
      // If we are programmatically scrolling via a click, wait for it to settle
      if (isClickScrolling.current) {
        if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current)
        clickScrollTimeout.current = setTimeout(() => {
          isClickScrolling.current = false
        }, 100)
        return
      }

      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", updateCache, { passive: true })
    
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", updateCache)
    }
  }, [])

  const scrollTo = (id: string) => {
      isClickScrolling.current = true
      setActiveSection(id) // Immediately update UI for instant feedback
      
      // Fallback timeout in case smooth scroll never fires onScroll (e.g. already at destination)
      if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current)
      clickScrollTimeout.current = setTimeout(() => {
        isClickScrolling.current = false
      }, 1000)

      const el = document.getElementById(id)
    if (el) {
      // Calculate exact mathematical scroll target to avoid scrollIntoView jumpiness
      // Use 120px offset to aggressively clear the sticky header and give visual breathing room
      const y = el.getBoundingClientRect().top + window.scrollY - 120
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
          <TerminalSquare className="size-5" />
        </div>
        <div className="leading-none cursor-pointer group">
          <span className="font-mono text-sm font-semibold tracking-terminal text-sidebar-accent-foreground flex items-center gap-1 group-hover:skew-x-6 group-hover:text-primary transition-all duration-100">
            CARBON·LEDGER<span className="inline-block h-3.5 w-2 bg-sidebar-primary animate-pulse group-hover:animate-none group-hover:bg-primary" />
          </span>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/50">
            ESG Terminal v3.2
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-5">
        <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/40">
          // Modules
        </p>
        {navItems.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.label}
              onClick={() => scrollTo(item.id)}
              className={cn(
                "relative group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                isActive
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-sm bg-sidebar-accent border-l-2 border-primary shadow-[inset_0_0_20px_rgba(var(--color-primary-rgb),0.1)]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 size-[18px] transition-transform duration-300 group-hover:translate-x-1",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50",
                )}
              />
              <span className="relative z-10 flex-1 text-left font-medium">{item.label}</span>
              <span className="relative z-10 font-mono text-[10px] text-sidebar-foreground/35 group-hover:text-sidebar-foreground/50">{item.code}</span>
            </button>
          )
        })}
      </nav>

      <button 
        onClick={() => {
          const el = document.getElementById("scenarios")
          if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" })
        }}
        className="m-3 rounded-sm border border-sidebar-border bg-sidebar-accent/40 p-4 text-left transition-all duration-300 hover:bg-sidebar-accent/60 hover:border-sidebar-primary/30 group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/50">
            1.5°C Pathway
          </p>
          <span className={`text-sm ${budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"} transition-colors`}>
            {budget.overshootRatio <= 1 ? "🟢" : budget.overshootRatio <= 3 ? "🟡" : "🔴"}
          </span>
        </div>

        <p className={`mt-2 font-mono text-2xl font-semibold tabular-nums tnum transition-colors duration-500 ${
          budget.budgetExhaustedDay >= 365 
            ? "text-green-400" 
            : budget.overshootRatio <= 3 
              ? "text-yellow-400" 
              : "text-red-400"
        }`}>
          {budget.budgetExhaustedDay >= 365 ? "On Track ✓" : `${Math.min(2050, 2025 + Math.ceil(budget.overshootRatio * 3.5))}`}
        </p>

        {/* Budget usage bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[9px] text-sidebar-foreground/50">
            <span>Budget Used</span>
            <span className={`font-semibold ${
              budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"
            }`}>
              {Math.min(Math.round(budget.overshootRatio * 100), 999)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-foreground/10">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                budget.overshootRatio <= 1 
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                  : budget.overshootRatio <= 3 
                    ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" 
                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              }`}
              style={{ width: `${Math.min(budget.overshootRatio * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-[3px] bg-sidebar-foreground/5 px-2 py-1.5">
            <p className="font-mono text-[8px] uppercase text-sidebar-foreground/40">Your Emissions</p>
            <p className={`font-mono text-xs font-semibold tabular-nums ${
              budget.overshootRatio <= 1 ? "text-green-400" : budget.overshootRatio <= 3 ? "text-yellow-400" : "text-red-400"
            }`}>{(budget.annualKg / 1000).toFixed(1)}t</p>
          </div>
          <div className="rounded-[3px] bg-sidebar-foreground/5 px-2 py-1.5">
            <p className="font-mono text-[8px] uppercase text-sidebar-foreground/40">Paris Budget</p>
            <p className="font-mono text-xs font-semibold tabular-nums text-sidebar-foreground/80">{(budget.allowanceKg / 1000).toFixed(1)}t</p>
          </div>
        </div>

        <p className="mt-2.5 text-[10px] text-sidebar-foreground/40 group-hover:text-sidebar-primary/70 transition-colors">
          {budget.budgetExhaustedDay >= 365 
            ? "✨ Paris-aligned — keep reducing!"
            : `⚡ Day ${budget.budgetExhaustedDay}/365 budget exhausted`}
          <span className="ml-1">↗</span>
        </p>
      </button>
    </aside>
  )
}
