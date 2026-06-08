"use client"

import { useEffect, useState } from "react"
import { Search, Bell, ChevronDown, Circle, CalendarClock, Headphones } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useCarbonContext } from "@/lib/context"
import { ambientDrone, hapticAudio } from "@/lib/audio"

export function DashboardHeader() {
  const { fy, setFy, profile } = useCarbonContext()
  const [clock, setClock] = useState("--:--:--")
  const [droneEnabled, setDroneEnabled] = useState(false)
  const [placeholder, setPlaceholder] = useState("")

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
          timeZone: "UTC",
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
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
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
        <div className="hidden items-center gap-2 font-mono text-xs text-muted-foreground sm:flex">
          <div className="relative flex size-2 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-75" />
            <Circle className="size-2 fill-accent text-accent" />
          </div>
          <span className="tracking-terminal">LIVE</span>
          <span className="tabular-nums tnum text-foreground/80">{clock} UTC</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            ambientDrone.toggle()
            setDroneEnabled(!droneEnabled)
          }}
          className={`hidden h-9 gap-2 rounded-sm font-mono text-xs font-normal transition-colors sm:flex ${droneEnabled ? 'bg-primary/20 text-primary border-primary/40' : 'bg-card text-foreground'}`}
        >
          <Headphones className="size-3.5" />
          {droneEnabled ? 'DRONE: ON' : 'DRONE: OFF'}
        </Button>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => {
            hapticAudio.playToggle(true)
            if (fy === 2025) setFy(2024)
            else if (fy === 2024) setFy(2023)
            else setFy(2025)
          }}
          className="hidden h-9 gap-2 rounded-sm bg-card font-mono text-xs font-normal text-foreground sm:flex active:scale-95 transition-transform"
        >
          <CalendarClock className="size-3.5 text-muted-foreground" />
          FY{fy}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            hapticAudio.playToggle(true)
            document.getElementById("anomalies")?.scrollIntoView({ behavior: "smooth", block: "center" })
          }}
          className="relative size-9 rounded-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary animate-pulse" />
          <span className="sr-only">Notifications</span>
        </Button>
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9 rounded-sm">
            <AvatarImage src="/professional-headshot.png" alt="Maya Okafor" className="rounded-sm" />
            <AvatarFallback className="rounded-sm">MO</AvatarFallback>
          </Avatar>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium">Maya Okafor</p>
            <p className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground">
              Analyst · L3
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
