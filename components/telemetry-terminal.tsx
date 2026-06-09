"use client"

import { useEffect, useState } from "react"
import { useCarbonContext } from "@/lib/context"
import { ShieldAlert } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function TelemetryTerminal({ isOpen, onComplete }: { isOpen: boolean, onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([])
  const { fetchLiveTelemetry } = useCarbonContext()

  useEffect(() => {
    if (!isOpen) {
      setLogs([])
      return
    }

    const startSync = async () => {
      setLogs([`[${new Date().toISOString()}] INITIATING SECURE HANDSHAKE...`])
      await new Promise((r) => setTimeout(r, 600))
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ESTABLISHING CONNECTION TO UK NATIONAL GRID API...`])
      await new Promise((r) => setTimeout(r, 800))

      try {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] FETCHING LIVE CARBON INTENSITY TELEMETRY...`])
        
        await fetchLiveTelemetry()
        
        setLogs(prev => [...prev, `[${new Date().toISOString()}] DATA ACQUIRED. INJECTING LIVE MULTIPLIERS INTO DETERMINISTIC ENGINE...`])
        await new Promise((r) => setTimeout(r, 600))
        
        setLogs(prev => [...prev, `[${new Date().toISOString()}] RECALCULATING SCOPE 2 BASELINE...`])
        await new Promise((r) => setTimeout(r, 600))

        setLogs(prev => [...prev, `[${new Date().toISOString()}] SYNC COMPLETE. RE-RENDERING DOM.`])
      } catch (e) {
        setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR: FAILED TO FETCH LIVE TELEMETRY. REVERTING TO STATIC.`])
      }

      setTimeout(() => {
        onComplete()
      }, 1000)
    }

    startSync()

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
