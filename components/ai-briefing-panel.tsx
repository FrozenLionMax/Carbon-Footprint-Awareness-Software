"use client"

import { useState, useEffect, useRef } from "react"
import { useCarbonContext } from "@/lib/context"
import { budgetStatus, emissionsByActivity } from "@/lib/dashboard-data"
import { Bot, X, Loader2, Sparkles } from "lucide-react"
import { hapticAudio } from "@/lib/audio"
import { cn } from "@/lib/utils"

export function AIBriefingPanel() {
  const { profile, fy, levers } = useCarbonContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [fullText, setFullText] = useState("")

  // Generate the deterministic "AI" text based on the live profile
  const generateBriefing = () => {
    const budget = budgetStatus(profile, fy)
    const activities = emissionsByActivity(profile, fy).sort((a, b) => b.kg - a.kg)
    const topActivity = activities[0]
    const topActivityLabel = topActivity.key.replace("Kwh", " Electricity").replace("Litre", " Fuel").replace("Km", " Flights").replace("Kg", "").replace(/([A-Z])/g, ' $1').trim()
    
    const activeLeversCount = Object.values(levers).filter(Boolean).length

    let text = `Executive Briefing — ${new Date().toLocaleDateString()}\n\n`
    
    // Status assessment
    if (budget.overshootRatio <= 1) {
      text += `Status: EXCELLENT. Your current trajectory is fully aligned with the 1.5°C Paris Agreement. By achieving Net-Zero parameters, your profile demonstrates top-tier ESG compliance.\n\n`
    } else if (budget.overshootRatio < 3) {
      text += `Status: ELEVATED. You are overshooting the 1.5°C global budget by ${budget.overshootRatio.toFixed(1)}x. Immediate structural optimizations are recommended to curve emissions downward.\n\n`
    } else {
      text += `Status: CRITICAL. Carbon overshoot detected at ${budget.overshootRatio.toFixed(1)}x the sustainable baseline. The personal allowance of ${Math.round(budget.allowanceKg)}kg will be exhausted by day ${budget.budgetExhaustedDay} of the year.\n\n`
    }

    // Identify the main culprit
    text += `Primary Driver Analysis:\nThe largest contributor to your inventory is currently [${topActivityLabel}] at ${Math.round(topActivity.kg)} kgCO₂e. Mitigating this single activity yields the highest mathematical leverage for decarbonization.\n\n`

    // Policy Assessment
    if (activeLeversCount === 0) {
      text += `Policy Audit: No active abatement policies detected. I strongly recommend navigating to the Marginal Abatement Cost Curve module and engaging the recommended levers.\n`
    } else {
      text += `Policy Audit: ${activeLeversCount} active abatement policies detected. Your 10-year projection successfully integrates these structural interventions, drastically lowering cumulative CapEx and carbon yield.\n`
    }

    return text
  }

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("")
      return
    }

    setIsGenerating(true)
    const targetText = generateBriefing()
    setFullText(targetText)
    
    // Brief loading pause before typing
    const startDelay = setTimeout(() => {
      setIsGenerating(false)
      let index = 0
      const interval = setInterval(() => {
        setDisplayedText(targetText.slice(0, index))
        
        // Only tick on non-whitespace to avoid buzzing
        if (targetText[index] && targetText[index].trim() !== "") {
          hapticAudio.playTick()
        }
        
        index++
        if (index > targetText.length) {
          clearInterval(interval)
        }
      }, 25) // Typing speed

      return () => clearInterval(interval)
    }, 1200)

    return () => clearTimeout(startDelay)
  }, [isOpen, profile, levers])

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          hapticAudio.playToggle(true)
          setIsOpen(true)
        }}
        className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-2.5 text-sm font-semibold text-primary shadow-lg shadow-primary/30 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-primary/30"
      >
        <span className="absolute inset-0 rounded-full animate-ping border border-primary/40 opacity-75" />
        <Sparkles className="size-4 animate-pulse group-hover:animate-spin" />
        AI Assistant
      </button>

      {/* Slide-out Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-card/40 shadow-2xl backdrop-blur-2xl transition-transform sm:max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2.5 text-primary">
                <Bot className="size-5" />
                <h2 className="font-mono text-sm font-semibold tracking-wide">
                  ECO·ASSISTANT TERMINAL
                </h2>
              </div>
              <button 
                onClick={() => {
                  hapticAudio.playToggle(false)
                  setIsOpen(false)
                }}
                className="rounded-sm p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[13px] leading-relaxed text-foreground/90">
              {isGenerating ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Processing real-time inventory matrix...
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {displayedText}
                  <span className="animate-pulse font-bold text-primary">_</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
