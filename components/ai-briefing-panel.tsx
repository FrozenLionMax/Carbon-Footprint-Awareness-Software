"use client"

import { useState, useEffect, useRef } from "react"
import { useCarbonContext } from "@/lib/context"
import { budgetStatus, emissionsByActivity, computeScores, totalAnnualKg } from "@/lib/dashboard-data"
import { Bot, X, Loader2, Sparkles, Send } from "lucide-react"
import { hapticAudio } from "@/lib/audio"

interface Message {
  role: "assistant" | "user"
  content: string
}

/**
 * AI Chatbot Panel — a deterministic conversational assistant
 * that answers questions about the user's carbon footprint using
 * live profile data. No external API calls — all responses are
 * generated locally from the math engine.
 */
export function AIBriefingPanel() {
  const { profile, fy, levers } = useCarbonContext()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => { scrollToBottom() }, [messages, displayedResponse])

  // Auto-generate welcome message when opened for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = generateBriefing()
      typewriterAdd(welcome)
    }
  }, [isOpen])

  const generateBriefing = (): string => {
    const budget = budgetStatus(profile, fy)
    const activities = emissionsByActivity(profile, fy).sort((a, b) => b.kg - a.kg)
    const topLabel = formatActivityName(activities[0].key)
    const total = totalAnnualKg(profile, fy)

    let text = `Hello! I'm your Carbon Intelligence Assistant.\n\n`
    text += `Your annual footprint is ${(total / 1000).toFixed(1)} tCO₂e. `

    if (budget.overshootRatio <= 1) {
      text += `Great news — you're within the 1.5°C Paris budget! 🎉\n\n`
    } else {
      text += `That's ${budget.overshootRatio.toFixed(1)}× the 1.5°C budget of ${Math.round(budget.allowanceKg)} kg.\n\n`
    }

    text += `Your biggest emission source is ${topLabel} at ${Math.round(activities[0].kg)} kgCO₂e/yr.\n\n`
    text += `Ask me anything — try "how can I reduce?", "what is my ESG grade?", or "explain scope 3".`
    return text
  }

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase()
    const budget = budgetStatus(profile, fy)
    const scores = computeScores(profile, fy)
    const activities = emissionsByActivity(profile, fy).sort((a, b) => b.kg - a.kg)
    const total = totalAnnualKg(profile, fy)
    const activeLevers = Object.values(levers).filter(Boolean).length

    if (q.includes("reduce") || q.includes("lower") || q.includes("save") || q.includes("tips") || q.includes("suggestion")) {
      const top3 = activities.slice(0, 3).map(a => `• ${formatActivityName(a.key)}: ${Math.round(a.kg)} kgCO₂e/yr`).join("\n")
      return `Here are your top 3 emission sources to target:\n\n${top3}\n\nI recommend enabling the abatement levers in the Scenario Simulator below. ${activeLevers === 0 ? "You currently have 0 policies active." : `You have ${activeLevers} active — great start!`}`
    }

    if (q.includes("esg") || q.includes("grade") || q.includes("score") || q.includes("rating")) {
      return `Your ESG Composite Score: ${scores.composite}/100 (Grade: ${scores.grade})\n\n• Environmental: ${scores.environmental}/100\n• Social: ${scores.social}/100\n• Governance: ${scores.governance}/100\n\nWeighting: Environmental 55%, Social 20%, Governance 25%. To improve, increase your Renewable Share and Offset Coverage in the Governance tab.`
    }

    if (q.includes("scope 3") || q.includes("scope3")) {
      const scope3Total = activities.filter(a => ["flightShortHaulKm", "flightLongHaulKm", "redMeatKg", "dairyKg", "plantKg", "goodsSpendUsd"].includes(a.key)).reduce((s, a) => s + a.kg, 0)
      return `Scope 3 covers indirect emissions from your value chain — flights, food, and purchased goods.\n\nYour Scope 3 total: ${Math.round(scope3Total)} kgCO₂e (${Math.round(scope3Total / total * 100)}% of your footprint).\n\nThese are the hardest to reduce but often the largest contributor.`
    }

    if (q.includes("scope 1") || q.includes("scope1")) {
      return `Scope 1 = direct emissions you control: vehicle fuel and natural gas.\n\nYour Scope 1: Petrol ${Math.round(profile.petrolLitre * 2.31)} kgCO₂e + Gas ${Math.round(profile.naturalGasKwh * 0.183)} kgCO₂e.\n\nSwitch to an EV or public transport to slash this by 85%.`
    }

    if (q.includes("scope 2") || q.includes("scope2")) {
      return `Scope 2 = indirect energy emissions from electricity.\n\nYour electricity: ${profile.electricityKwh} kWh/yr → ${Math.round(profile.electricityKwh * 0.233)} kgCO₂e.\n\nSwitch to 100% renewable energy to eliminate this entirely.`
    }

    if (q.includes("budget") || q.includes("paris") || q.includes("1.5")) {
      return `The Paris Agreement 1.5°C budget gives each person ${Math.round(budget.allowanceKg)} kgCO₂e/yr.\n\nYour footprint: ${Math.round(budget.annualKg)} kg → ${budget.overshootRatio.toFixed(1)}× overshoot.\n\n${budget.budgetExhaustedDay < 365 ? `At your current rate, you exhaust your annual budget by day ${budget.budgetExhaustedDay}.` : "You're within budget — keep it up!"}`
    }

    if (q.includes("diet") || q.includes("food") || q.includes("meat") || q.includes("vegan")) {
      return `Your dietary footprint:\n\n• Red meat: ${profile.redMeatKg} kg/yr → ${Math.round(profile.redMeatKg * 27)} kgCO₂e\n• Dairy: ${profile.dairyKg} kg/yr → ${Math.round(profile.dairyKg * 13.5)} kgCO₂e\n• Plant-based: ${profile.plantKg} kg/yr → ${Math.round(profile.plantKg * 2)} kgCO₂e\n\nReducing red meat by 50% saves ~${Math.round(profile.redMeatKg * 27 * 0.5)} kgCO₂e/yr.`
    }

    if (q.includes("flight") || q.includes("travel") || q.includes("fly")) {
      return `Your aviation footprint:\n\n• Short-haul: ${profile.flightShortHaulKm} km → ${Math.round(profile.flightShortHaulKm * 0.158)} kgCO₂e\n• Long-haul: ${profile.flightLongHaulKm} km → ${Math.round(profile.flightLongHaulKm * 0.195)} kgCO₂e\n\nConsider taking trains for short routes — 70% less carbon per km.`
    }

    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hello! 👋 I'm here to help you understand and reduce your carbon footprint. Try asking me:\n\n• "How can I reduce my emissions?"\n• "What is my ESG grade?"\n• "Explain my Scope 3"\n• "Tell me about my diet impact"`
    }

    // Default fallback
    return `Your current profile summary:\n\n• Annual footprint: ${(total / 1000).toFixed(1)} tCO₂e\n• ESG Grade: ${scores.grade} (${scores.composite}/100)\n• Budget overshoot: ${budget.overshootRatio.toFixed(1)}×\n• Active policies: ${activeLevers}/4\n\nTry asking about "scope 3", "diet", "flights", "ESG grade", or "how to reduce".`
  }

  const formatActivityName = (key: string): string => {
    const map: Record<string, string> = {
      electricityKwh: "Electricity", naturalGasKwh: "Natural Gas", petrolLitre: "Petrol/Fuel",
      flightShortHaulKm: "Short Flights", flightLongHaulKm: "Long Flights",
      redMeatKg: "Red Meat", dairyKg: "Dairy", plantKg: "Plant Foods", goodsSpendUsd: "Goods & Services"
    }
    return map[key] || key
  }

  const typewriterAdd = (text: string) => {
    setIsTyping(true)
    const newIndex = messages.length
    setTypingMessageIndex(newIndex)
    
    let index = 0
    setDisplayedResponse("")
    
    const timer = setInterval(() => {
      setDisplayedResponse(text.slice(0, index))
      index++
      if (index > text.length) {
        clearInterval(timer)
        setMessages(prev => [...prev, { role: "assistant", content: text }])
        setDisplayedResponse("")
        setTypingMessageIndex(-1)
        setIsTyping(false)
      }
    }, 15)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    
    const userMsg = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    
    // Small delay to simulate "thinking"
    setTimeout(() => {
      const response = generateResponse(userMsg)
      typewriterAdd(response)
    }, 400)
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => {
          hapticAudio.playToggle(true)
          setIsOpen(true)
        }}
        aria-label="Open AI Carbon Assistant"
        className="group fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-2.5 text-sm font-semibold text-primary shadow-lg shadow-primary/30 backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-primary/30"
      >
        <span className="absolute inset-0 rounded-full animate-ping border border-primary/40 opacity-75" />
        <Sparkles className="size-4 animate-pulse group-hover:animate-spin" />
        AI Assistant
      </button>

      {/* Slide-out Chat Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-card/40 shadow-2xl backdrop-blur-2xl sm:max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex items-center gap-2.5 text-primary">
                <Bot className="size-5" />
                <div>
                  <h2 className="font-mono text-sm font-semibold tracking-wide">
                    ECO·ASSISTANT
                  </h2>
                  <p className="font-mono text-[9px] text-muted-foreground">AI-powered carbon intelligence</p>
                </div>
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
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" 
                      ? "bg-primary/20 text-primary border border-primary/20" 
                      : "bg-muted/50 text-foreground/90 border border-white/5"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Currently typing message */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-4 py-3 text-[13px] leading-relaxed bg-muted/50 text-foreground/90 border border-white/5 whitespace-pre-wrap">
                    {displayedResponse}
                    <span className="animate-pulse font-bold text-primary">▊</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
                  placeholder="Ask about your carbon footprint..."
                  disabled={isTyping}
                  className="flex-1 rounded-sm border border-white/10 bg-background/50 px-4 py-2.5 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="flex size-9 items-center justify-center rounded-sm bg-primary/20 text-primary transition-all hover:bg-primary/30 disabled:opacity-30"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <p className="mt-2 font-mono text-[9px] text-muted-foreground/60">
                Try: "how can I reduce?" · "ESG grade" · "scope 3" · "diet impact"
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
