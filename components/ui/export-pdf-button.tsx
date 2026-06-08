"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { hapticAudio } from "@/lib/audio"

export function ExportPdfButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    hapticAudio.playToggle(true)
    setIsExporting(true)
    try {
      // Use the browser's native print engine to perfectly render modern CSS (oklch, color-mix, blur)
      // which html2canvas fundamentally does not support.
      setTimeout(() => {
        window.print()
        setIsExporting(false)
      }, 500)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold tracking-wide text-muted-foreground backdrop-blur-md transition-all hover:bg-white/10 hover:text-foreground hover:shadow-[0_0_15px_var(--color-primary-alpha-20)] disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      <span>Download Executive Report</span>
    </button>
  )
}
