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
import { useEffect, useState } from "react"
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
  const { profile } = useCarbonContext()
  const budget = budgetStatus(profile)

  useEffect(() => {
    const handleScroll = () => {
      // Deep logic: mathematically calculate exact scroll depth against absolute document positions
      const scrollPosition = window.scrollY + 150 // Account for sticky header

      const sections = navItems
        .map(item => {
          const el = document.getElementById(item.id)
          // getBoundingClientRect guarantees absolute document position regardless of relative parent offsets
          return el ? { id: item.id, top: el.getBoundingClientRect().top + window.scrollY } : null
        })
        .filter(Boolean) as { id: string, top: number }[]

      // Sort by vertical position just in case
      sections.sort((a, b) => a.top - b.top)

      // The active section is the last one we've scrolled past
      let currentId = navItems[0].id
      for (const section of sections) {
        if (scrollPosition >= section.top) {
          currentId = section.id
        }
      }

      // Handle edge case: scrolled to absolute bottom of page
      if (window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 10) {
        currentId = sections[sections.length - 1].id
      }

      setActiveSection(currentId)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    // Fire once on mount
    handleScroll()
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id: string) => {
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

      <div className="m-3 rounded-sm border border-sidebar-border bg-sidebar-accent/40 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-terminal text-sidebar-foreground/50">
            1.5°C Pathway
          </p>
          <Gauge className="size-4 text-sidebar-primary" />
        </div>
        <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-sidebar-accent-foreground tnum">
          {budget.budgetExhaustedDay >= 365 ? "Achieved" : "2040"}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/55">
          {budget.budgetExhaustedDay >= 365 
            ? "Operating within the 1.5°C Paris Agreement allowance."
            : `Net-zero target. Current trajectory overshoots allowance by ${budget.overshootRatio.toFixed(1)}×.`}
        </p>
      </div>
    </aside>
  )
}
