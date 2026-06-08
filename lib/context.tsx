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
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined)

export function CarbonProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ActivityProfile>(defaultProfile)
  const [levers, setLevers] = useState<ScenarioLevers>(DEFAULT_LEVERS)
  const [fy, setFy] = useState<number>(2025)
  const [isLoaded, setIsLoaded] = useState(false)

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
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("carbonLedgerProfile", JSON.stringify(profile))
    }
  }, [profile, isLoaded])

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

  return (
    <CarbonContext.Provider value={{ profile, updateProfile, resetProfile, randomizeProfile, levers, toggleLever, fy, setFy }}>
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
