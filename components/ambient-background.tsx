"use client"

import { useEffect, useRef } from "react"
import { useCarbonContext } from "@/lib/context"
import { budgetStatus } from "@/lib/dashboard-data"

export function AmbientBackground() {
  const blobRef = useRef<HTMLDivElement>(null)
  const { profile, fy } = useCarbonContext()
  const budget = budgetStatus(profile, fy)
  const ratio = budget.overshootRatio

  // Determine ambient glow color based on ESG health
  let glowColor = "rgba(34, 197, 94, 0.15)" // Green
  if (ratio > 2.5) glowColor = "rgba(250, 204, 21, 0.15)" // Yellow
  if (ratio > 4.0) glowColor = "rgba(251, 146, 60, 0.15)" // Orange
  if (ratio > 6.0) glowColor = "rgba(239, 68, 68, 0.15)" // Red

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const blob = blobRef.current
      if (blob) {
        blob.animate(
          {
            left: `${e.clientX}px`,
            top: `${e.clientY}px`,
          },
          { duration: 3000, fill: "forwards" }
        )
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-background">
      <div
        ref={blobRef}
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-colors duration-1000"
        style={{ backgroundColor: glowColor }}
      />
    </div>
  )
}
