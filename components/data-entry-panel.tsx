"use client"

import { useState, useEffect } from "react"
import { useCarbonContext } from "@/lib/context"
import { Settings2, SlidersHorizontal, ShieldCheck } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useDebounce } from "@/hooks/use-debounce"
import { hapticAudio } from "@/lib/audio"

export function DataEntryPanel() {
  const { profile, updateProfile, resetProfile, isLive, liveIntensity, resetKey } = useCarbonContext()
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
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-sm" role="tablist" aria-label="Parameter category">
            <button
              role="tab"
              aria-selected={tab === "emissions"}
              onClick={() => { hapticAudio.playToggle(true); setTab("emissions"); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-[10px] uppercase tracking-wide transition-all duration-300 ${tab === "emissions" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >
              <SlidersHorizontal className="size-3" />
              Activity
            </button>
            <button
              role="tab"
              aria-selected={tab === "esg"}
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
          className="rounded-sm border border-destructive/20 bg-destructive/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-terminal text-destructive/80 transition-all duration-300 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/40 hover:shadow-sm hover:shadow-destructive/20 active:scale-95"
        >
          ↺ Reset Default
        </button>
      </div>

      <div key={`${resetKey}-${tab}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {tab === "emissions" ? (
          <>
            <InputField 
              key="electricityKwh"
              label="Electricity (kWh/yr)" 
              value={profile.electricityKwh} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("electricityKwh", v)} 
              badge={isLive ? `Live: ${liveIntensity?.toFixed(3)} kg/kWh` : undefined}
              badgeType={isLive ? (liveIntensity! > 0.7 ? "red" : liveIntensity! > 0.6 ? "yellow" : "green") : "default"}
            />
            <InputField 
              key="naturalGasKwh"
              label="Natural Gas (kWh/yr)" 
              value={profile.naturalGasKwh} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("naturalGasKwh", v)} 
            />
            <InputField 
              key="petrolLitre"
              label="Petrol Vehicle (L/yr)" 
              value={profile.petrolLitre} 
              min={0} max={3000} step={10}
              onChange={(v) => updateProfile("petrolLitre", v)} 
            />
            <InputField 
              key="flightShortHaulKm"
              label="Short Flights (km/yr)" 
              value={profile.flightShortHaulKm} 
              min={0} max={20000} step={100}
              onChange={(v) => updateProfile("flightShortHaulKm", v)} 
            />
            <InputField 
              key="flightLongHaulKm"
              label="Long Flights (km/yr)" 
              value={profile.flightLongHaulKm} 
              min={0} max={50000} step={500}
              onChange={(v) => updateProfile("flightLongHaulKm", v)} 
            />
            <InputField 
              key="redMeatKg"
              label="Red Meat (kg/yr)" 
              value={profile.redMeatKg} 
              min={0} max={200} step={1}
              onChange={(v) => updateProfile("redMeatKg", v)} 
            />
            <InputField 
              key="dairyKg"
              label="Dairy (kg/yr)" 
              value={profile.dairyKg} 
              min={0} max={500} step={5}
              onChange={(v) => updateProfile("dairyKg", v)} 
            />
            <InputField 
              key="goodsSpendUsd"
              label="Goods Spend ($/yr)" 
              value={profile.goodsSpendUsd} 
              min={0} max={50000} step={100}
              onChange={(v) => updateProfile("goodsSpendUsd", v)} 
            />
            <InputField 
              key="plantKg"
              label="Plant-based (kg/yr)" 
              value={profile.plantKg} 
              min={0} max={1000} step={10}
              onChange={(v) => updateProfile("plantKg", v)} 
            />
          </>
        ) : (
          <>
            <InputField 
              key="renewableSharePct"
              label="Renewable Share (%)" 
              value={profile.renewableSharePct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("renewableSharePct", v)} 
            />
            <InputField 
              key="wasteDiversionPct"
              label="Waste Diversion (%)" 
              value={profile.wasteDiversionPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("wasteDiversionPct", v)} 
            />
            <InputField 
              key="supplierTransparencyPct"
              label="Supplier Transparency (%)" 
              value={profile.supplierTransparencyPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("supplierTransparencyPct", v)} 
            />
            <InputField 
              key="dataCompletenessPct"
              label="Data Completeness (%)" 
              value={profile.dataCompletenessPct} 
              min={0} max={100} step={1}
              onChange={(v) => updateProfile("dataCompletenessPct", v)} 
            />
            <InputField 
              key="offsetCoveragePct"
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

function InputField({ label, value, min, max, step, onChange, badge, badgeType = "default" }: { 
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; badge?: string; badgeType?: "default" | "green" | "yellow" | "red"
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
            <span className={`px-1.5 py-0.5 rounded-[2px] border text-[8px] animate-pulse ${
              badgeType === "green" ? "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
              badgeType === "yellow" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.4)]" :
              badgeType === "red" ? "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
              "bg-accent/20 text-accent border-accent/30"
            }`}>
              {badge}
            </span>
          )}
        </div>
        <input
          type="number"
          aria-label={label}
          value={localValue === 0 ? "0" : localValue || ""}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = e.target.value === "" ? 0 : Number(e.target.value);
            setLocalValue(val);
          }}
          onBlur={(e) => {
            // Clamp value on blur to ensure it stays within bounds
            const val = e.target.value === "" ? 0 : Number(e.target.value);
            const clamped = Math.min(Math.max(val, min), max);
            setLocalValue(clamped);
            if (clamped !== val) {
              onChange(clamped);
            }
          }}
          className="w-20 bg-transparent text-right text-foreground font-medium tnum outline-none border-b border-transparent focus:border-primary/50 transition-colors [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <Slider 
        aria-label={label}
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
