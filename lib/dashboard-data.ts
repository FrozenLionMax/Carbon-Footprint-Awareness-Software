// ============================================================================
// CARBON·LEDGER — Deterministic Sustainability Logic Engine
// All figures are derived, not hard-coded. Numbers cascade from a single
// baseline activity profile so the dashboard behaves like a real model.
// Units: kgCO2e unless noted. tCO2e = kg / 1000.
// ============================================================================

export type Scope = "scope1" | "scope2" | "scope3"

// --- Emission factors (kgCO2e per activity unit) --------------------------
export let EMISSION_FACTORS = {
  electricityKwh: 0.233, // grid electricity, kg/kWh
  naturalGasKwh: 0.183, // heating, kg/kWh
  petrolLitre: 2.31, // private vehicle, kg/L
  flightShortHaulKm: 0.158, // kg/passenger-km
  flightLongHaulKm: 0.195, // kg/passenger-km
  redMeatKg: 27.0, // kg/kg
  dairyKg: 13.5, // kg/kg
  plantKg: 2.0, // kg/kg
  goodsSpendUsd: 0.45, // embodied carbon per $ of goods
}

export function setEmissionFactor(key: keyof typeof EMISSION_FACTORS, value: number) {
  EMISSION_FACTORS[key] = value
}

export const ACTIVITY_SCOPE: Record<keyof typeof EMISSION_FACTORS, Scope> = {
  petrolLitre: "scope1",
  naturalGasKwh: "scope1",
  electricityKwh: "scope2",
  flightShortHaulKm: "scope3",
  flightLongHaulKm: "scope3",
  redMeatKg: "scope3",
  dairyKg: "scope3",
  plantKg: "scope3",
  goodsSpendUsd: "scope3",
}

export const FACTOR_KEY: Record<keyof typeof EMISSION_FACTORS, keyof typeof EMISSION_FACTORS> = {
  electricityKwh: "electricityKwh",
  naturalGasKwh: "naturalGasKwh",
  petrolLitre: "petrolLitre",
  flightShortHaulKm: "flightShortHaulKm",
  flightLongHaulKm: "flightLongHaulKm",
  redMeatKg: "redMeatKg",
  dairyKg: "dairyKg",
  plantKg: "plantKg",
  goodsSpendUsd: "goodsSpendUsd",
}

// --- Baseline annual activity profile (the single source of truth) --------
export const activityProfile = {
  // Emissions Activity
  electricityKwh: 4200,
  naturalGasKwh: 9800,
  petrolLitre: 920,
  flightShortHaulKm: 3400,
  flightLongHaulKm: 11200,
  redMeatKg: 38,
  dairyKg: 110,
  plantKg: 240,
  goodsSpendUsd: 9600,
  // ESG Governance Metrics
  renewableSharePct: 64,
  wasteDiversionPct: 78,
  supplierTransparencyPct: 52,
  dataCompletenessPct: 91,
  offsetCoveragePct: 18,
}

// Utilities
export const safeNumber = (v: any) => (typeof v === "number" && !isNaN(v) ? v : 0)
export const round = (v: number, decimals = 0) => Number(Math.round(Number(`${safeNumber(v)}e${decimals}`)) + `e-${decimals}`)
export const avg = (arr: number[]) => arr.reduce((a, b) => safeNumber(a) + safeNumber(b), 0) / (arr.length || 1)
export const stdev = (arr: number[]) => {
  const m = avg(arr);
  return Math.sqrt(arr.map(x => Math.pow(safeNumber(x) - m, 2)).reduce((a, b) => a + b, 0) / (arr.length || 1));
}
export const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(safeNumber(v), min), max)
export const scopeLabel = (s: string) => s.replace("scope", "Scope ")
export const pct = (part: number, total: number) => (total > 0 ? round((safeNumber(part) / safeNumber(total)) * 100, 1) : 0)

// --- Core derivation: activity -> emissions --------------------------------
export function getScaledProfile(profile = activityProfile, fy = 2025) {
  // Apply historical scaling factors. e.g. FY23 had worse renewable share and higher intensity.
  const scale = fy === 2024 ? 1.08 : fy === 2023 ? 1.15 : 1.0;
  const p = { ...profile }
  // Only scale raw activities, keep ESG percentages mostly static but slightly worse in past
  p.electricityKwh *= scale;
  p.naturalGasKwh *= scale;
  p.petrolLitre *= scale;
  p.flightShortHaulKm *= scale;
  p.flightLongHaulKm *= scale;
  p.goodsSpendUsd *= scale;
  
  if (fy < 2025) {
    p.renewableSharePct = Math.max(0, p.renewableSharePct - (2025 - fy) * 10);
    p.wasteDiversionPct = Math.max(0, p.wasteDiversionPct - (2025 - fy) * 5);
  }
  return p;
}

export function emissionsByActivity(baseProfile = activityProfile, fy = 2025) {
  const profile = getScaledProfile(baseProfile, fy);
  const keys: (keyof typeof EMISSION_FACTORS)[] = [
    "electricityKwh", "naturalGasKwh", "petrolLitre", "flightShortHaulKm",
    "flightLongHaulKm", "redMeatKg", "dairyKg", "plantKg", "goodsSpendUsd"
  ]
  return keys.map((k) => ({
    key: k,
    scope: ACTIVITY_SCOPE[k] as Scope,
    kg: safeNumber(profile[k]) * EMISSION_FACTORS[FACTOR_KEY[k]],
  }))
}

export function emissionsByScope(profile = activityProfile, fy = 2025) {
  const rows = emissionsByActivity(profile, fy)
  const acc: Record<Scope, number> = { scope1: 0, scope2: 0, scope3: 0 }
  rows.forEach((r) => (acc[r.scope] += r.kg))
  return acc
}

export function totalAnnualKg(profile = activityProfile, fy = 2025) {
  const s = emissionsByScope(profile, fy)
  return s.scope1 + s.scope2 + s.scope3
}

// --- Carbon budget logic (1.5C aligned personal budget) --------------------
// Paris-aligned personal allowance trends from ~2.3 tCO2e/yr toward 0 by 2050.
export const PARIS_BUDGET_2025_KG = 2300
export function budgetForYear(year: number) {
  const start = 2025
  const end = 2050
  const t = Math.min(1, Math.max(0, (year - start) / (end - start)))
  return PARIS_BUDGET_2025_KG * (1 - t) // linear glide path to ~0
}

export function budgetStatus(profile = activityProfile, fy = 2025) {
  const annual = totalAnnualKg(profile, fy)
  const allowance = budgetForYear(2025)
  const overshootRatio = annual / allowance
  // Days into the year before the personal budget is exhausted
  const burnDay = Math.round((allowance / annual) * 365)
  return {
    annualKg: annual,
    allowanceKg: allowance,
    overshootRatio,
    overshootPct: (overshootRatio - 1) * 100,
    budgetExhaustedDay: burnDay,
    earthsRequired: overshootRatio, // if everyone lived like this
  }
}

// --- Composite ESG score (weighted, deterministic) -------------------------
// Each pillar 0-100. Weighted into a single grade. Lower emissions intensity,
// higher renewable share, higher diversion => higher score.
const SCORE_WEIGHTS = { environmental: 0.55, social: 0.2, governance: 0.25 }

export function getPillarInputs(profile = activityProfile, fy = 2025) {
  const scaled = getScaledProfile(profile, fy)
  return {
    renewableSharePct: scaled.renewableSharePct,
    emissionsIntensity: totalAnnualKg(profile, fy) / 1000, // tCO2e/yr (lower better)
    wasteDiversionPct: scaled.wasteDiversionPct,
    supplierTransparencyPct: scaled.supplierTransparencyPct,
    dataCompletenessPct: scaled.dataCompletenessPct,
    offsetCoveragePct: scaled.offsetCoveragePct,
  }
}

export function computeScores(profile = activityProfile, fy = 2025) {
  const p = getPillarInputs(profile, fy)
  // Environmental: blend of intensity (benchmark 12 tCO2e), renewables, offsets
  const intensityScore = clamp(100 - ((p.emissionsIntensity - 4) / (16 - 4)) * 100)
  const environmental = clamp(
    intensityScore * 0.5 + p.renewableSharePct * 0.3 + p.offsetCoveragePct * 0.2,
  )
  const social = clamp(p.wasteDiversionPct * 0.6 + p.supplierTransparencyPct * 0.4)
  const governance = clamp(p.dataCompletenessPct * 0.6 + p.supplierTransparencyPct * 0.4)
  const composite =
    environmental * SCORE_WEIGHTS.environmental +
    social * SCORE_WEIGHTS.social +
    governance * SCORE_WEIGHTS.governance
  return {
    environmental: round(environmental),
    social: round(social),
    governance: round(governance),
    composite: round(composite),
    grade: toGrade(composite),
  }
}

function toGrade(v: number) {
  if (v >= 85) return "AAA"
  if (v >= 75) return "AA"
  if (v >= 65) return "A"
  if (v >= 55) return "BBB"
  if (v >= 45) return "BB"
  if (v >= 35) return "B"
  return "CCC"
}

// --- 12-month trend, derived with seasonal + reduction signal -------------
export function monthlyTrend(profile = activityProfile, fy = 2025) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const base = emissionsByScope(profile, fy)
  
  // Create deterministic pseudo-random variations based on the profile seed
  const seed = (totalAnnualKg(profile, fy) % 100) / 100
  
  return months.map((m, i) => {
    // Heating peaks in winter (months 0,1,10,11), travel peaks in summer (months 5,6,7)
    const heatingFactor = 1 + 0.3 * Math.cos(((i + 0.5) / 12) * Math.PI * 2) 
    const coolingFactor = 1 + 0.2 * Math.sin(((i - 2.5) / 12) * Math.PI * 2)
    const travelFactor = 1 + 0.25 * Math.sin(((i - 3) / 12) * Math.PI * 2)
    
    // Add deterministic noise
    const noise = 0.95 + (Math.sin(i * seed * 10) * 0.1)
    
    const scope1 = (base.scope1 / 12) * heatingFactor * noise
    const scope2 = (base.scope2 / 12) * coolingFactor * noise
    const scope3 = (base.scope3 / 12) * travelFactor * noise

    return {
      month: m,
      scope1: round(scope1),
      scope2: round(scope2),
      scope3: round(scope3),
    }
  })
}

// --- Anomaly detection (z-score vs trailing mean) --------------------------
export type Anomaly = {
  severity: "critical" | "elevated" | "info"
  scope: Scope | "all"
  title: string
  detail: string
  delta: string
  recommendation: string
  actionLever?: keyof ScenarioLevers
}

export function detectAnomalies(profile = activityProfile, fy = 2025): Anomaly[] {
  const t = monthlyTrend(profile, fy)
  const out: Anomaly[] = []
  ;(["scope1", "scope2", "scope3"] as Scope[]).forEach((sc) => {
    const series = t.map((r) => r[sc])
    for (let i = 3; i < series.length; i++) {
      const window = series.slice(i - 3, i)
      const mean = avg(window)
      const sd = stdev(window) || 1
      const z = (series[i] - mean) / sd
      if (Math.abs(z) >= 1.6) {
        const up = z > 0
        const actionLever = up 
          ? (sc === "scope3" ? "groundTravel" : sc === "scope1" ? "fleetEv" : "renewableSwitch") 
          : undefined
        
        out.push({
          severity: Math.abs(z) >= 2.2 ? "critical" : "elevated",
          scope: sc,
          title: `${scopeLabel(sc)} ${up ? "spike" : "drop"} detected — ${t[i].month}`,
          detail: `${t[i].month} reading deviates ${z.toFixed(2)}σ from the trailing 3-month mean (${round(mean)} kg).`,
          delta: `${up ? "+" : ""}${round(series[i] - mean)} kg`,
          recommendation: up
            ? sc === "scope3"
              ? "Audit business travel + procurement bookings for the period."
              : "Inspect facility metering for an unscheduled load event."
            : "Lock in the reduction: document the driver and set it as the new baseline.",
          actionLever: actionLever as keyof ScenarioLevers,
        })
      }
    }
  })
  // Always surface the structural insight
  out.unshift({
    severity: "info",
    scope: "scope3",
    title: "Scope 3 dominates total inventory",
    detail: `Indirect value-chain emissions represent ${pct(emissionsByScope(profile, fy).scope3, totalAnnualKg(profile, fy))}% of footprint — the single largest reduction lever.`,
    delta: `${round(emissionsByScope(profile, fy).scope3 / 1000)} tCO₂e`,
    recommendation: "Prioritise diet, aviation, and procurement interventions over operational tweaks.",
    actionLever: "plantForward"
  })
  return out.slice(0, 5)
}

// --- 10-year "Butterfly Effect" projection with scenario levers -----------
export type ScenarioLevers = {
  renewableSwitch: boolean // -100% scope2
  plantForward: boolean // -45% diet emissions
  groundTravel: boolean // -70% short-haul flights
  fleetEv: boolean // -85% petrol
}

export const DEFAULT_LEVERS: ScenarioLevers = {
  renewableSwitch: false,
  plantForward: false,
  groundTravel: false,
  fleetEv: false,
}

export function applyLevers(levers: ScenarioLevers, profile = activityProfile) {
  const p = { ...profile }
  if (levers.renewableSwitch) p.electricityKwh *= 0.0
  if (levers.fleetEv) p.petrolLitre *= 0.15
  if (levers.plantForward) {
    p.redMeatKg *= 0.55
    p.dairyKg *= 0.7
    p.plantKg *= 1.3
  }
  if (levers.groundTravel) p.flightShortHaulKm *= 0.3
  return p
}

export function projectTenYears(levers: ScenarioLevers = DEFAULT_LEVERS, profile = activityProfile, fy = 2025) {
  const baselineAnnual = totalAnnualKg(profile, fy)
  const scenarioAnnual = totalAnnualKg(applyLevers(levers, profile), fy)
  
  // Calculate CapEx and ROI based on active levers
  const initiatives = getInitiatives(profile, fy);
  let totalCapEx = 0;
  let annualSavings = 0;
  
  initiatives.forEach(i => {
    if (levers[i.lever as keyof ScenarioLevers]) {
      // Cost = abatementT * costPerT
      const cost = i.abatementT * i.costPerT;
      // Negative MAC means net savings (negative cost)
      if (cost > 0) totalCapEx += cost;
      else annualSavings += Math.abs(cost);
    }
  });
  const years: { year: number; baseline: number; scenario: number; budget: number }[] = []
  let bCum = 0
  let sCum = 0
  for (let i = 0; i <= 10; i++) {
    const year = 2025 + i
    bCum += baselineAnnual
    sCum += scenarioAnnual
    years.push({
      year,
      baseline: round(bCum / 1000),
      scenario: round(sCum / 1000),
      budget: round((Array.from({ length: i + 1 }, (_, k) => budgetForYear(2025 + k)).reduce((a, b) => a + b, 0)) / 1000),
    })
  }
  const lifetimeSaved = round((baselineAnnual - scenarioAnnual) * 10 / 1000)
  const reductionPct = round(((baselineAnnual - scenarioAnnual) / baselineAnnual) * 100)
  return { 
    years, 
    lifetimeSaved, 
    reductionPct, 
    scenarioAnnualT: round(scenarioAnnual / 1000),
    totalCapEx: round(totalCapEx),
    annualSavings: round(annualSavings),
  }
}

// --- Reduction initiatives, ranked by marginal abatement cost --------------
export function getInitiatives(profile = activityProfile, fy = 2025) {
  return [
    { id: "renew", label: "100% renewable electricity tariff", lever: "renewableSwitch", abatementKg: emissionsByScope(profile, fy).scope2, costPerT: 18, effort: "Low", scope: "scope2" as Scope },
    { id: "diet", label: "Plant-forward diet (−45% animal proteins)", lever: "plantForward", abatementKg: 0.45 * (safeNumber(profile.redMeatKg) * EMISSION_FACTORS.redMeatKg + safeNumber(profile.dairyKg) * EMISSION_FACTORS.dairyKg), costPerT: -12, effort: "Medium", scope: "scope3" as Scope },
    { id: "ground", label: "Replace short-haul flights with rail", lever: "groundTravel", abatementKg: 0.7 * safeNumber(profile.flightShortHaulKm) * EMISSION_FACTORS.flightShortHaulKm, costPerT: 45, effort: "Medium", scope: "scope3" as Scope },
    { id: "ev", label: "Transition to electric vehicle", lever: "fleetEv", abatementKg: 0.85 * safeNumber(profile.petrolLitre) * EMISSION_FACTORS.petrolLitre, costPerT: 120, effort: "High", scope: "scope1" as Scope },
  ]
    .map((i) => ({ ...i, abatementT: round(i.abatementKg / 1000, 2) }))
    .sort((a, b) => a.costPerT - b.costPerT)
}

// --- Scope ledger table with variance vs prior period ----------------------
export function scopeLedger(profile = activityProfile, fy = 2025) {
  const t = monthlyTrend(profile, fy)
  const last = t[t.length - 1]
  const prev = t[t.length - 2]
  return (["scope1", "scope2", "scope3"] as Scope[]).map((sc) => {
    const current = last[sc]
    const previous = prev[sc]
    const variance = ((current - previous) / previous) * 100
    return {
      scope: sc,
      label: scopeLabel(sc),
      currentKg: current,
      annualT: round(emissionsByScope(profile, fy)[sc] / 1000, 1),
      sharePct: pct(emissionsByScope(profile, fy)[sc], totalAnnualKg(profile, fy)),
      variancePct: round(variance, 1),
    }
  })
}
