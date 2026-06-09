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
