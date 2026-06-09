"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { hapticAudio } from "@/lib/audio"
import { useCarbonContext } from "@/lib/context"
import { PdfReportDocument } from "@/components/pdf-report-document"

export function ExportPdfButton() {
  const [isExporting, setIsExporting] = useState(false)
  const { profile, fy, isLive } = useCarbonContext()

  const handleExport = async () => {
    hapticAudio.playToggle(true)
    setIsExporting(true)
    try {
      // Dynamically import to avoid server-side rendering issues with react-pdf
      const { pdf } = await import('@react-pdf/renderer')
      
      const blob = await pdf(
        <PdfReportDocument profile={profile} fy={fy} isLive={isLive} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ESG_Compliance_Report_FY${fy}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setIsExporting(false)
    } catch (error) {
      console.error("Failed to export PDF:", error)
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="group relative overflow-hidden flex items-center gap-2.5 rounded-md bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-bold tracking-wide text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
      )}
      <span className="relative z-10">Download Executive Report</span>
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-[150%]" />
    </button>
  )
}
