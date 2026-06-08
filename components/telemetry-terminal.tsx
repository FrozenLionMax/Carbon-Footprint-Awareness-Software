"use client"

import { useEffect, useState } from "react"
import { useCarbonContext } from "@/lib/context"
import { ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TelemetryTerminal({ isOpen, onComplete }: { isOpen: boolean, onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([])
  const { randomizeProfile } = useCarbonContext()

  useEffect(() => {
    if (!isOpen) {
      setLogs([])
      return
    }

    const sequence = [
      "INITIATING SECURE HANDSHAKE...",
      "AUTHENTICATING VIA OAUTH2 (TOKEN_XXX)...",
      "ESTABLISHING CONNECTION TO GLOBAL ERP API...",
      "SYNCING SUPPLY CHAIN INVENTORY...",
      "PARSING SCOPE 3 EMISSION FACTORS...",
      "UPDATING SCOPE 1 RAW TELEMETRY...",
      "INGESTING 14,002 NEW DATA POINTS...",
      "CALCULATING 1.5°C OVERSHOOT DELTA...",
      "APPLYING DETERMINISTIC DECAY FUNCTIONS...",
      "RESOLVING NEW BASELINE MATRIX...",
      "SYNC COMPLETE. RE-RENDERING DOM."
    ]

    let currentIndex = 0
    let jitterInterval: NodeJS.Timeout | null = null
    let logInterval: NodeJS.Timeout | null = null

    // Start jittering the dashboard behind the terminal at a smoother, less aggressive rate
    jitterInterval = setInterval(() => {
      randomizeProfile()
    }, 500) // Changed from 150ms to 500ms to prevent browser lag/jank

    // Stream logs
    logInterval = setInterval(() => {
      if (currentIndex < sequence.length) {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] ${sequence[currentIndex]}`])
        currentIndex++
      } else {
        // Finished
        clearInterval(jitterInterval!)
        clearInterval(logInterval!)
        setTimeout(() => {
          onComplete()
        }, 800)
      }
    }, 200) // Slightly faster logs but much slower DOM jitter

    return () => {
      if (jitterInterval) clearInterval(jitterInterval)
      if (logInterval) clearInterval(logInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-xl font-mono text-[11px] md:text-[13px] text-primary p-6 md:p-12 overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6 opacity-70">
            <ShieldAlert className="size-5 animate-pulse" />
            <span className="text-sm tracking-widest uppercase">Telemetry Override Protocol Active</span>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 opacity-80">
            {logs.map((log, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                {log}
              </div>
            ))}
            {logs.length < 11 && (
              <div className="animate-pulse w-2 h-4 bg-primary mt-1" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
