"use client"

import { useEffect, useState, useMemo } from "react"
import { Search, Bell, ChevronDown, Circle, CalendarClock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCarbonContext } from "@/lib/context"
import { hapticAudio } from "@/lib/audio"
import { MobileNav } from "@/components/mobile-nav"
import { ExportPdfButton } from "@/components/ui/export-pdf-button"
import { budgetStatus, computeScores, emissionsByActivity, totalAnnualKg } from "@/lib/dashboard-data"

type NotifSeverity = "critical" | "warning" | "info" | "success"
interface Notification {
  id: string
  severity: NotifSeverity
  title: string
  body: string
  targetId: string
  targetLabel: string
}

export function DashboardHeader() {
  const { fy, setFy, profile, userName, setUserName, userTitle, setUserTitle } = useCarbonContext()
  const [clock, setClock] = useState("--:--:--")
  const [placeholder, setPlaceholder] = useState("")
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  
  const budget = budgetStatus(profile, fy)
  const scores = computeScores(profile, fy)
  const total = totalAnnualKg(profile, fy)
  const activities = emissionsByActivity(profile, fy).sort((a, b) => b.kg - a.kg)

  // Dynamic notification engine — generates alerts based on real profile thresholds
  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = []

    // Budget overshoot
    if (budget.overshootRatio > 3) {
      notifs.push({ id: "budget-critical", severity: "critical", title: "🔴 Critical Carbon Overshoot", body: `${budget.overshootRatio.toFixed(1)}× over 1.5°C budget. Budget exhausted by day ${budget.budgetExhaustedDay}.`, targetId: "inventory", targetLabel: "Emissions Inventory" })
    } else if (budget.overshootRatio > 1) {
      notifs.push({ id: "budget-warn", severity: "warning", title: "⚠ Budget Overshoot Detected", body: `You are ${budget.overshootRatio.toFixed(1)}× over the Paris Agreement allowance.`, targetId: "inventory", targetLabel: "Emissions Inventory" })
    } else {
      notifs.push({ id: "budget-ok", severity: "success", title: "✅ Within Carbon Budget", body: "Your footprint is within the 1.5°C Paris allowance. Keep it up!", targetId: "inventory", targetLabel: "Emissions Inventory" })
    }

    // ESG grade alerts
    if (scores.composite < 40) {
      notifs.push({ id: "esg-low", severity: "critical", title: "📉 ESG Grade: " + scores.grade, body: `Score ${scores.composite}/100. Improve governance metrics to raise your rating.`, targetId: "anomalies", targetLabel: "Anomaly Detection" })
    } else if (scores.composite < 60) {
      notifs.push({ id: "esg-mid", severity: "warning", title: "📊 ESG Grade: " + scores.grade, body: `Score ${scores.composite}/100. Environmental pillar needs attention (${scores.environmental}/100).`, targetId: "anomalies", targetLabel: "Anomaly Detection" })
    } else {
      notifs.push({ id: "esg-good", severity: "info", title: "📊 ESG Grade: " + scores.grade, body: `Score ${scores.composite}/100 (E:${scores.environmental} S:${scores.social} G:${scores.governance}).`, targetId: "anomalies", targetLabel: "Anomaly Detection" })
    }

    // Renewable share
    if (profile.renewableSharePct < 20) {
      notifs.push({ id: "renew-low", severity: "warning", title: "⚡ Low Renewable Share", body: `Only ${profile.renewableSharePct}% renewable energy. India's grid average is 30%.`, targetId: "terminal", targetLabel: "Terminal Parameters" })
    }

    // High meat consumption
    if (profile.redMeatKg > 30) {
      notifs.push({ id: "meat-high", severity: "warning", title: "🥩 High Red Meat Intake", body: `${profile.redMeatKg} kg/yr — contributes ${Math.round(profile.redMeatKg * 27)} kgCO₂e. Consider reducing.`, targetId: "terminal", targetLabel: "Terminal Parameters" })
    }

    // Flight impact
    if (profile.flightLongHaulKm > 5000) {
      notifs.push({ id: "flight-high", severity: "warning", title: "✈ High Aviation Impact", body: `${profile.flightLongHaulKm.toLocaleString()} km long-haul = ${Math.round(profile.flightLongHaulKm * 0.195)} kgCO₂e.`, targetId: "terminal", targetLabel: "Terminal Parameters" })
    }

    // Low offset
    if (profile.offsetCoveragePct < 10) {
      notifs.push({ id: "offset-low", severity: "info", title: "🌿 No Carbon Offsets Active", body: `Only ${profile.offsetCoveragePct}% offset coverage. Consider verified offset programs.`, targetId: "terminal", targetLabel: "Governance Tab" })
    }

    // Top emitter alert
    const topActivity = activities[0]
    const topLabel = topActivity.key.replace(/([A-Z])/g, ' $1').replace("Kwh", "").replace("Kg", "").replace("Litre", "").replace("Km", "").trim()
    if (topActivity.kg > 500) {
      notifs.push({ id: "top-emitter", severity: "info", title: "📌 Top Emitter: " + topLabel, body: `${Math.round(topActivity.kg)} kgCO₂e/yr — your single largest emission source.`, targetId: "inventory", targetLabel: "Emissions Inventory" })
    }

    return notifs
  }, [profile, fy, budget, scores, activities])

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

  const severityColor: Record<NotifSeverity, string> = {
    critical: "border-l-red-500 bg-red-500/5",
    warning: "border-l-yellow-500 bg-yellow-500/5",
    info: "border-l-blue-400 bg-blue-400/5",
    success: "border-l-green-500 bg-green-500/5",
  }
  
  let gradeColor = "text-green-500 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
  if (scores.composite >= 85) gradeColor = "text-green-500 border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.4)]" // AAA
  else if (scores.composite >= 75) gradeColor = "text-green-400 border-green-400/40 bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.3)]" // AA
  else if (scores.composite >= 65) gradeColor = "text-yellow-400 border-yellow-400/40 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]" // A
  else if (scores.composite >= 55) gradeColor = "text-orange-400 border-orange-400/40 bg-orange-400/10 shadow-[0_0_15px_rgba(251,146,60,0.3)]" // BBB
  else if (scores.composite >= 45) gradeColor = "text-orange-500 border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.3)]" // BB
  else if (scores.composite >= 35) gradeColor = "text-red-400 border-red-400/40 bg-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.3)]" // B
  else gradeColor = "text-red-600 border-red-600/50 bg-red-600/10 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse" // CCC

  useEffect(() => {
    const prompts = [
      "Query Scope 3 logistics...",
      "Search anomalies...",
      "Locate mitigation policies...",
      "Jump to module...",
    ]
    let currentPrompt = 0
    let charIndex = 0
    let isDeleting = false

    const type = () => {
      const text = prompts[currentPrompt]
      
      if (!isDeleting && charIndex <= text.length) {
        setPlaceholder(text.slice(0, charIndex))
        charIndex++
        setTimeout(type, 50)
      } else if (isDeleting && charIndex >= 0) {
        setPlaceholder(text.slice(0, charIndex))
        charIndex--
        setTimeout(type, 25)
      } else if (!isDeleting && charIndex > text.length) {
        isDeleting = true
        setTimeout(type, 2000) // pause at end of word
      } else if (isDeleting && charIndex < 0) {
        isDeleting = false
        currentPrompt = (currentPrompt + 1) % prompts.length
        setTimeout(type, 500) // pause before new word
      }
    }
    
    setTimeout(type, 1000)
    return () => {} // Cleanup not strictly necessary for this simple timeout chain, but in prod we'd use refs to cancel
  }, [])

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="relative sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 px-4 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] md:px-6">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 shadow-[0_0_12px_var(--color-primary)] animate-[laserX_4s_ease-in-out_infinite]" style={{ backgroundSize: "200% 100%", backgroundRepeat: "no-repeat" }} />
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav />
        <div className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground text-sm font-bold font-mono">
          C
        </div>
      </div>

      <div className="relative hidden flex-1 md:block md:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={placeholder || "..."}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = e.currentTarget.value.toLowerCase()
              const map: Record<string, string> = {
                terminal: "terminal", input: "terminal",
                inventory: "inventory", footprint: "inventory",
                anomaly: "anomalies", anomalies: "anomalies", alert: "anomalies",
                scenario: "scenarios", pathway: "scenarios",
                abatement: "abatement", mac: "abatement", model: "abatement",
                ledger: "ledger", trend: "ledger"
              }
              for (const [key, id] of Object.entries(map)) {
                if (val.includes(key)) {
                  const el = document.getElementById(id)
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 120
                    window.scrollTo({ top: y, behavior: "smooth" })
                  }
                  e.currentTarget.value = ""
                  break
                }
              }
            }
          }}
          className="h-9 w-full rounded-sm border border-input bg-card pl-9 pr-3 font-mono text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3 md:gap-4">
        <div className={`hidden sm:flex items-center justify-center size-8 rounded-full border-2 font-black text-sm tracking-tighter ${gradeColor} transition-all duration-500`} title="ESG Grade">
          {scores.grade}
        </div>
        <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex">
          <div className="relative flex size-2 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            <Circle className="size-2 fill-accent text-accent" />
          </div>
          <span className="tracking-terminal">LIVE</span>
          <span className="tabular-nums tnum text-foreground/80">{clock} IST</span>
        </div>
        <div className="hidden sm:block">
          <ExportPdfButton />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <Button 
                variant="outline"
                size="sm"
                onClick={() => hapticAudio.playToggle(true)}
                className="hidden h-9 gap-2 rounded-sm bg-card font-mono text-xs font-normal text-foreground sm:flex transition-transform data-[state=open]:bg-muted/50"
              />
            }
          >
            <CalendarClock className="size-3.5 text-muted-foreground" />
            FY{fy}
            <ChevronDown className="size-3 text-muted-foreground ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 rounded-sm font-mono text-xs">
            {[2025, 2024, 2023].map((year) => (
              <DropdownMenuItem 
                key={year}
                onClick={() => {
                  hapticAudio.playTick()
                  setFy(year)
                }}
                className={`cursor-pointer rounded-sm ${fy === year ? "bg-primary/10 text-primary font-bold" : ""}`}
              >
                FY{year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => hapticAudio.playToggle(true)}
                className="relative size-9 rounded-sm text-muted-foreground hover:bg-muted/50 transition-colors"
              />
            }
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications ({unreadCount} unread)</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto rounded-sm p-0 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-terminal text-muted-foreground">
                Alerts ({notifications.length})
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}
                  className="text-[9px] text-primary/70 hover:text-primary transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.map((notif, i) => (
              <DropdownMenuItem 
                key={notif.id}
                className={`flex flex-col items-start gap-1 px-4 py-3 cursor-pointer border-l-2 transition-all hover:bg-primary/5 ${i > 0 ? "border-t border-t-border" : ""} ${severityColor[notif.severity]} ${readIds.has(notif.id) ? "opacity-60" : ""}`}
                onClick={() => {
                  setReadIds(prev => new Set([...prev, notif.id]))
                  const el = document.getElementById(notif.targetId)
                  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" })
                }}
              >
                <div className="flex w-full items-start justify-between">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  {!readIds.has(notif.id) && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{notif.body}</p>
                <p className="text-[9px] text-primary/60 mt-0.5">↗ {notif.targetLabel}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9 rounded-sm">
            <AvatarFallback className="rounded-sm bg-primary/15 text-primary font-mono text-xs font-bold">
              {userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "SP"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight lg:block cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {
            const name = window.prompt("Enter your name:", userName)
            if (name) setUserName(name)
            const title = window.prompt("Enter your title/role:", userTitle)
            if (title) setUserTitle(title)
          }}>
            <p className="text-sm font-medium">{userName}</p>
            <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
              {userTitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
