"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { activityProfile as defaultProfile, DEFAULT_LEVERS, type ScenarioLevers, budgetStatus } from "./dashboard-data"
import { ambientDrone } from "./audio"

export type ActivityProfile = typeof defaultProfile

interface CarbonContextType {
  profile: ActivityProfile
  updateProfile: (key: keyof ActivityProfile, value: number) => void
  resetProfile: () => void
  levers: ScenarioLevers
  toggleLever: (key: keyof ScenarioLevers) => void
  fy: number
  setFy: (year: number) => void
  randomizeProfile: () => void
  fetchLiveTelemetry: () => Promise<void>
  isLive: boolean
  liveIntensity: number | null
  userName: string
  setUserName: (name: string) => void
  userTitle: string
  setUserTitle: (title: string) => void
  resetKey: number
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined)

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ActivityProfile>(defaultProfile)
  const [resetKey, setResetKey] = useState(0)
  const [levers, setLevers] = useState<ScenarioLevers>(DEFAULT_LEVERS)
  const [fy, setFy] = useState<number>(2025)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [liveIntensity, setLiveIntensity] = useState<number | null>(null)
  const [userName, setUserName] = useState("System Profile")
  const [userTitle, setUserTitle] = useState("Primary User")

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("carbonLedgerProfile")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all keys exist
        setProfile({ ...defaultProfile, ...parsed })
      } catch (e) {
        console.error("Failed to parse saved profile", e)
      }
    }
    const savedName = localStorage.getItem("carbonLedgerName_v2")
    if (savedName) setUserName(savedName)
    const savedTitle = localStorage.getItem("carbonLedgerTitle_v2")
    if (savedTitle) setUserTitle(savedTitle)
    
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("carbonLedgerProfile", JSON.stringify(profile))
      localStorage.setItem("carbonLedgerName_v2", userName)
      localStorage.setItem("carbonLedgerTitle_v2", userTitle)
    }
  }, [profile, userName, userTitle, isLoaded])

  // Bio-Feedback Theme Engine
  useEffect(() => {
    if (!isLoaded || typeof document === "undefined") return

    const budget = budgetStatus(profile, fy)
    const ratio = budget.overshootRatio

    // Update ambient tension if the drone is playing
    ambientDrone.updateTension(ratio)

    // Calibrate thresholds to make Green the dominant default state.
    // ratio <= 4.0: Green (Baseline and below)
    // ratio ~ 6.0: Yellow (Warning, pushing high)
    // ratio >= 8.0: Red (Critical Danger, extreme)
    let h, s, l;
    
    if (ratio <= 4.0) {
      // Safe zone: solid green
      h = 142; s = 70; l = 50;
    } else if (ratio < 6.0) {
      // Transition from Green (142) to Yellow (45)
      const progress = (ratio - 4.0) / 2.0;
      h = 142 - (progress * (142 - 45));
      s = 70 + (progress * (93 - 70));
      l = 50 - (progress * (50 - 47));
    } else if (ratio < 8.0) {
      // Transition from Yellow (45) to Red (0)
      const progress = (ratio - 6.0) / 2.0;
      h = 45 - (progress * 45);
      s = 93 - (progress * (93 - 84));
      l = 47 + (progress * (60 - 47));
    } else {
      // Max Danger zone: deep red/crimson
      h = 0; s = 84; l = 50;
    }

    const root = document.documentElement;
    root.style.setProperty("--primary", `hsl(${h}, ${s}%, ${l}%)`);
    root.style.setProperty("--accent", `hsl(${h}, ${s}%, ${l}%)`);
    
    // Also shift chart colors dynamically to match the theme
    root.style.setProperty("--color-chart-1", `hsl(${h}, ${s}%, ${l}%)`);
    root.style.setProperty("--color-chart-2", `hsl(${(h + 30) % 360}, ${Math.max(0, s - 10)}%, ${Math.max(0, l - 5)}%)`);
    root.style.setProperty("--color-chart-3", `hsl(${(h + 60) % 360}, ${Math.max(0, s - 20)}%, ${Math.max(0, l - 10)}%)`);
    root.style.setProperty("--color-chart-4", `hsl(${(h + 90) % 360}, ${Math.max(0, s - 30)}%, ${Math.max(0, l - 15)}%)`);
    root.style.setProperty("--color-chart-5", `hsl(${(h + 120) % 360}, ${Math.max(0, s - 40)}%, ${Math.max(0, l - 20)}%)`);

  }, [profile, fy, isLoaded])

  const updateProfile = (key: keyof ActivityProfile, value: number) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  const resetProfile = () => {
    setProfile(defaultProfile)
    setResetKey(k => k + 1)
    localStorage.removeItem("carbonLedgerProfile")
  }

  const randomizeProfile = () => {
    setProfile({
      electricityKwh: 2000 + Math.random() * 8000,
      naturalGasKwh: 4000 + Math.random() * 10000,
      petrolLitre: 100 + Math.random() * 2000,
      flightShortHaulKm: Math.random() * 8000,
      flightLongHaulKm: Math.random() * 25000,
      redMeatKg: Math.random() * 100,
      dairyKg: Math.random() * 200,
      plantKg: 100 + Math.random() * 400,
      goodsSpendUsd: 2000 + Math.random() * 20000,
      renewableSharePct: Math.random() * 100,
      wasteDiversionPct: Math.random() * 100,
      supplierTransparencyPct: Math.random() * 100,
      dataCompletenessPct: Math.random() * 100,
      offsetCoveragePct: Math.random() * 50,
    })
  }

  const toggleLever = (key: keyof ScenarioLevers) => {
    setLevers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const fetchLiveTelemetry = async () => {
    try {
      // There is no open public API for the Indian Grid like the UK has without paid API keys.
      // So we will simulate a highly realistic live telemetry feed based on the time of day in IST,
      // centered around the Central Electricity Authority (CEA) average of ~0.716 kg/kWh.
      
      const now = new Date()
      const istHour = (now.getUTCHours() + 5.5) % 24 // Convert UTC to IST hour
      
      // Solar peaks at noon (cleaner grid), Coal dominates night/peak hours (dirtier grid)
      let simulatedIntensity = 0.716 
      if (istHour >= 10 && istHour <= 16) {
        simulatedIntensity -= 0.150 // Solar generation lowers carbon
      } else if (istHour >= 18 && istHour <= 22) {
        simulatedIntensity += 0.120 // Evening peak relies heavily on coal
      }
      
      // Add minor random noise to simulate minute-by-minute fluctuations
      const noise = (Math.random() * 0.02) - 0.01
      const kgIntensity = simulatedIntensity + noise
      
      // Simulate network latency
      await new Promise(r => setTimeout(r, 600))
      
      // Dynamic import to avoid circular dependency issues and directly call the setter
      const { setEmissionFactor } = await import("./dashboard-data")
      setEmissionFactor("electricityKwh", kgIntensity)
      
      setLiveIntensity(kgIntensity)
      setIsLive(true)
      
      // Force a re-render by slightly mutating the profile
      setProfile((prev) => ({ ...prev }))
    } catch (error) {
      console.error("Failed to fetch live telemetry:", error)
      throw error
    }
  }

  return (
    <CarbonContext.Provider value={{ profile, updateProfile, resetProfile, randomizeProfile, levers, toggleLever, fy, setFy, fetchLiveTelemetry, isLive, liveIntensity, userName, setUserName, userTitle, setUserTitle, resetKey }}>
      {children}
    </CarbonContext.Provider>
  )
}

export function useCarbonContext() {
  const context = useContext(CarbonContext)
  if (context === undefined) {
    throw new Error("useCarbonContext must be used within a CarbonProvider")
  }
  return context
}
