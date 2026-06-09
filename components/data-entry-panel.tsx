"use client"

import { useState, useEffect } from "react"
import { useCarbonContext } from "@/lib/context"
import { Settings2, SlidersHorizontal, ShieldCheck } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useDebounce } from "@/hooks/use-debounce"
import { hapticAudio } from "@/lib/audio"

export function DataEntryPanel() {
  const { profile, updateProfile, resetProfile, isLive, liveIntensity } = useCarbonContext()
  const [tab, setTab] = useState<"emissions" | "esg">("emissions")

  return (
    <div id="terminal" className="flex flex-col rounded-sm border border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-5 py-3 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 text-primary" />
            <h2 className="font-mono text-sm font-semibold tracking-wide text-foreground">
              MODULE 001 · TERMINAL PARAMETERS
            </h2>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-sm">
            <button
              onClick={() => { hapticAudio.playToggle(true); setTab("emissions"); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wide transition-all duration-300 ${tab === "emissions" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <SlidersHorizontal className="size-3" />
              Activity
            </button>
            <button
              onClick={() => { hapticAudio.playToggle(true); setTab("esg"); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wide transition-all duration-300 ${tab === "esg" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <ShieldCheck className="size-3" />
              Governance
            </button>
          </div>
        </div>
        <button 
          onClick={() => {
            hapticAudio.playToggle(false);
            resetProfile();
          }}
          className="font-mono text-[10px] uppercase tracking-terminal text-muted-foreground transition-all duration-300 hover:text-primary hover:tracking-widest"
        >
          [ Reset Default ]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {tab === "emissions" ? (
          <>
            <InputField 
              label="Electricity (kWh/yr)" 
              value={profile.electricityKwh} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("electricityKwh", v)} 
              badge={isLive ? `Live: ${liveIntensity?.toFixed(3)} kg/kWh` : undefined}
            />
            <InputField 
              label="Natural Gas (kWh/yr)" 
              value={profile.naturalGasKwh} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("naturalGasKwh", v)} 
            />
            <InputField 
              label="Petrol Vehicle (L/yr)" 
              value={profile.petrolLitre} 
              min={0} max={3000} step={10}
              onChange={(v) => updateProfile("petrolLitre", v)} 
            />
            <InputField 
              label="Short Flights (km/yr)" 
              value={profile.flightShortHaulKm} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("flightShortHaulKm", v)} 
            />
            <InputField 
              label="Long Flights (km/yr)" 
              value={profile.flightLongHaulKm} 
              min={0} max={50000} step={500}
              onChange={(v) => updateProfile("flightLongHaulKm", v)} 
            />
            <InputField 
              label="Red Meat (kg/yr)" 
              value={profile.redMeatKg} 
              min={0} max={200} step={1}
              onChange={(v) => updateProfile("redMeatKg", v)} 
            />
            <InputField 
              label="Dairy (kg/yr)" 
              value={profile.dairyKg} 
              min={0} max={500} step={5}
              onChange={(v) => updateProfile("dairyKg", v)} 
            />
            <InputField 
              label="Goods Spend ($/yr)" 
              value={profile.goodsSpendUsd} 
              min={0} max={50000} step={100}
              onChange={(v) => updateProfile("goodsSpendUsd", v)} 
            />
            <InputField 
              label="Plant-based (kg/yr)" 
              value={profile.plantKg} 
              min={0} max={1000} step={10}
              onChange={(v) => updateProfile("plantKg", v)} 
            />
          </>
        ) : (
          <>
            <InputField 
              label="Renewable Share (%)" 
              value={profile.renewableSharePct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("renewableSharePct", v)} 
            />
            <InputField 
              label="Waste Diversion (%)" 
              value={profile.wasteDiversionPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("wasteDiversionPct", v)} 
            />
            <InputField 
              label="Supplier Transparency (%)" 
              value={profile.supplierTransparencyPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("supplierTransparencyPct", v)} 
            />
            <InputField 
              label="Data Completeness (%)" 
              value={profile.dataCompletenessPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("dataCompletenessPct", v)} 
            />
            <InputField 
              label="Offset Coverage (%)" 
              value={profile.offsetCoveragePct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("offsetCoveragePct", v)} 
            />
          </>
        )}
      </div>
    </div>
  )
}

function InputField({ label, value, min, max, step, onChange, badge }: { 
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; badge?: string;
}) {
  const [localValue, setLocalValue] = useState(value)
  const debouncedValue = useDebounce(localValue, 100)

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Fire onChange only when the debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, value, onChange])

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-terminal text-muted-foreground items-center">
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-[2px] bg-accent/20 text-accent border border-accent/30 text-[8px] animate-pulse">
              {badge}
            </span>
          )}
        </div>
        <span className="text-foreground font-medium tnum">{(localValue ?? 0).toLocaleString()}</span>
      </div>
      <Slider 
        value={[localValue ?? 0]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => {
          const v = Array.isArray(vals) ? vals[0] : (vals as unknown as number);
          setLocalValue(v);
          hapticAudio.playTick();
        }}
        className="w-full"
      />
    </div>
  )
}
