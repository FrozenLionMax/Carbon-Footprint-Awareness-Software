import { describe, it, expect } from 'vitest'
import {
  EMISSION_FACTORS,
  ACTIVITY_SCOPE,
  activityProfile,
  safeNumber,
  round,
  avg,
  stdev,
  clamp,
  pct,
  scopeLabel,
  emissionsByActivity,
  emissionsByScope,
  totalAnnualKg,
  budgetForYear,
  budgetStatus,
  getScaledProfile,
  getPillarInputs,
  computeScores,
  monthlyTrend,
  detectAnomalies,
  applyLevers,
  projectTenYears,
  getInitiatives,
  scopeLedger,
  DEFAULT_LEVERS,
  PARIS_BUDGET_2025_KG,
} from '../dashboard-data'

// ============================================================================
// 1. UTILITY FUNCTIONS
// ============================================================================
describe('Utility Functions', () => {
  describe('safeNumber', () => {
    it('returns valid numbers unchanged', () => {
      expect(safeNumber(42)).toBe(42)
      expect(safeNumber(0)).toBe(0)
      expect(safeNumber(-5)).toBe(-5)
    })
    it('returns 0 for NaN', () => {
      expect(safeNumber(NaN)).toBe(0)
    })
    it('returns 0 for undefined/null/string', () => {
      expect(safeNumber(undefined)).toBe(0)
      expect(safeNumber(null)).toBe(0)
      expect(safeNumber('abc')).toBe(0)
    })
  })

  describe('round', () => {
    it('rounds to 0 decimals by default', () => {
      expect(round(3.7)).toBe(4)
      expect(round(3.2)).toBe(3)
    })
    it('rounds to specified decimals', () => {
      expect(round(3.456, 2)).toBe(3.46)
      expect(round(3.454, 2)).toBe(3.45)
    })
    it('handles zero safely', () => {
      expect(round(0)).toBe(0)
    })
  })

  describe('avg', () => {
    it('calculates the arithmetic mean', () => {
      expect(avg([10, 20, 30])).toBe(20)
    })
    it('returns 0 for an empty array', () => {
      expect(avg([])).toBe(0)
    })
    it('handles single-element arrays', () => {
      expect(avg([5])).toBe(5)
    })
  })

  describe('stdev', () => {
    it('returns 0 for uniform arrays', () => {
      expect(stdev([5, 5, 5])).toBe(0)
    })
    it('calculates population standard deviation', () => {
      const result = stdev([2, 4, 4, 4, 5, 5, 7, 9])
      expect(result).toBeGreaterThan(1.5)
      expect(result).toBeLessThan(2.5)
    })
  })

  describe('clamp', () => {
    it('clamps values within 0–100 by default', () => {
      expect(clamp(50)).toBe(50)
      expect(clamp(-10)).toBe(0)
      expect(clamp(150)).toBe(100)
    })
    it('accepts custom min/max', () => {
      expect(clamp(5, 10, 20)).toBe(10)
      expect(clamp(25, 10, 20)).toBe(20)
    })
  })

  describe('pct', () => {
    it('calculates percentage correctly', () => {
      expect(pct(25, 100)).toBe(25)
      expect(pct(1, 3)).toBeCloseTo(33.3, 0)
    })
    it('returns 0 when total is 0 (no division by zero)', () => {
      expect(pct(10, 0)).toBe(0)
    })
  })

  describe('scopeLabel', () => {
    it('formats scope strings', () => {
      expect(scopeLabel('scope1')).toBe('Scope 1')
      expect(scopeLabel('scope3')).toBe('Scope 3')
    })
  })
})

// ============================================================================
// 2. EMISSION FACTOR SCOPE CLASSIFICATION
// ============================================================================
describe('Scope Classification (GHG Protocol)', () => {
  it('classifies petrol and gas as Scope 1 (direct)', () => {
    expect(ACTIVITY_SCOPE.petrolLitre).toBe('scope1')
    expect(ACTIVITY_SCOPE.naturalGasKwh).toBe('scope1')
  })
  it('classifies electricity as Scope 2 (indirect energy)', () => {
    expect(ACTIVITY_SCOPE.electricityKwh).toBe('scope2')
  })
  it('classifies flights, diet, and goods as Scope 3 (value chain)', () => {
    expect(ACTIVITY_SCOPE.flightShortHaulKm).toBe('scope3')
    expect(ACTIVITY_SCOPE.flightLongHaulKm).toBe('scope3')
    expect(ACTIVITY_SCOPE.redMeatKg).toBe('scope3')
    expect(ACTIVITY_SCOPE.dairyKg).toBe('scope3')
    expect(ACTIVITY_SCOPE.plantKg).toBe('scope3')
    expect(ACTIVITY_SCOPE.goodsSpendUsd).toBe('scope3')
  })
})

// ============================================================================
// 3. EMISSION CALCULATIONS
// ============================================================================
describe('Emission Calculations', () => {
  describe('emissionsByActivity', () => {
    it('returns an array of emission rows for the default profile', () => {
      const rows = emissionsByActivity()
      expect(rows.length).toBe(9) // 9 activity types
      rows.forEach(r => {
        expect(r.kg).toBeGreaterThanOrEqual(0)
        expect(['scope1', 'scope2', 'scope3']).toContain(r.scope)
      })
    })
    it('returns zero emissions for a zeroed-out profile', () => {
      const zeroProfile = { ...activityProfile }
      Object.keys(zeroProfile).forEach(k => {
        if (!k.endsWith('Pct')) (zeroProfile as any)[k] = 0
      })
      const rows = emissionsByActivity(zeroProfile)
      rows.forEach(r => expect(r.kg).toBe(0))
    })
  })

  describe('emissionsByScope', () => {
    it('returns an object with scope1, scope2, scope3', () => {
      const scopes = emissionsByScope()
      expect(scopes).toHaveProperty('scope1')
      expect(scopes).toHaveProperty('scope2')
      expect(scopes).toHaveProperty('scope3')
    })
    it('scope totals are non-negative', () => {
      const scopes = emissionsByScope()
      expect(scopes.scope1).toBeGreaterThanOrEqual(0)
      expect(scopes.scope2).toBeGreaterThanOrEqual(0)
      expect(scopes.scope3).toBeGreaterThanOrEqual(0)
    })
  })

  describe('totalAnnualKg', () => {
    it('equals the sum of all three scopes', () => {
      const scopes = emissionsByScope()
      const total = totalAnnualKg()
      expect(total).toBeCloseTo(scopes.scope1 + scopes.scope2 + scopes.scope3, 1)
    })
    it('returns 0 for a zeroed profile', () => {
      const zeroProfile = { ...activityProfile }
      Object.keys(zeroProfile).forEach(k => {
        if (!k.endsWith('Pct')) (zeroProfile as any)[k] = 0
      })
      expect(totalAnnualKg(zeroProfile)).toBe(0)
    })
    it('is positive for the default profile', () => {
      expect(totalAnnualKg()).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// 4. CARBON BUDGET LOGIC (Paris Agreement)
// ============================================================================
describe('Carbon Budget Logic', () => {
  describe('budgetForYear', () => {
    it('returns the full 2300 kg allowance for 2025', () => {
      expect(budgetForYear(2025)).toBe(PARIS_BUDGET_2025_KG)
    })
    it('returns 0 for 2050 (net-zero deadline)', () => {
      expect(budgetForYear(2050)).toBe(0)
    })
    it('decreases linearly between 2025 and 2050', () => {
      const y2030 = budgetForYear(2030)
      const y2040 = budgetForYear(2040)
      expect(y2030).toBeGreaterThan(y2040)
      expect(y2030).toBeLessThan(PARIS_BUDGET_2025_KG)
    })
  })

  describe('budgetStatus', () => {
    it('calculates overshoot ratio > 1 for the default profile', () => {
      const status = budgetStatus()
      expect(status.overshootRatio).toBeGreaterThan(1)
    })
    it('returns annualKg matching totalAnnualKg', () => {
      const status = budgetStatus()
      expect(status.annualKg).toBeCloseTo(totalAnnualKg(), 1)
    })
    it('budget exhaustion day is less than 365 for a high emitter', () => {
      const status = budgetStatus()
      expect(status.budgetExhaustedDay).toBeLessThan(365)
    })
    it('has earthsRequired equal to overshootRatio', () => {
      const status = budgetStatus()
      expect(status.earthsRequired).toBe(status.overshootRatio)
    })
  })
})

// ============================================================================
// 5. HISTORICAL FISCAL YEAR SCALING
// ============================================================================
describe('Historical Scaling (getScaledProfile)', () => {
  it('returns unscaled profile for FY 2025', () => {
    const scaled = getScaledProfile(activityProfile, 2025)
    expect(scaled.electricityKwh).toBe(activityProfile.electricityKwh)
  })
  it('scales up emissions for FY 2024 (factor 1.08)', () => {
    const scaled = getScaledProfile(activityProfile, 2024)
    expect(scaled.electricityKwh).toBeCloseTo(activityProfile.electricityKwh * 1.08)
  })
  it('scales up emissions for FY 2023 (factor 1.15)', () => {
    const scaled = getScaledProfile(activityProfile, 2023)
    expect(scaled.electricityKwh).toBeCloseTo(activityProfile.electricityKwh * 1.15)
  })
  it('reduces renewable share for past years', () => {
    const scaled2023 = getScaledProfile(activityProfile, 2023)
    expect(scaled2023.renewableSharePct).toBeLessThan(activityProfile.renewableSharePct)
  })
})

// ============================================================================
// 6. ESG COMPOSITE SCORING
// ============================================================================
describe('ESG Composite Scoring', () => {
  it('returns scores within 0–100 range', () => {
    const scores = computeScores()
    expect(scores.environmental).toBeGreaterThanOrEqual(0)
    expect(scores.environmental).toBeLessThanOrEqual(100)
    expect(scores.social).toBeGreaterThanOrEqual(0)
    expect(scores.social).toBeLessThanOrEqual(100)
    expect(scores.governance).toBeGreaterThanOrEqual(0)
    expect(scores.governance).toBeLessThanOrEqual(100)
    expect(scores.composite).toBeGreaterThanOrEqual(0)
    expect(scores.composite).toBeLessThanOrEqual(100)
  })
  it('returns a valid grade string', () => {
    const validGrades = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC']
    const scores = computeScores()
    expect(validGrades).toContain(scores.grade)
  })
  it('composite is a weighted average of the three pillars (55/20/25)', () => {
    const scores = computeScores()
    const expected = scores.environmental * 0.55 + scores.social * 0.2 + scores.governance * 0.25
    expect(scores.composite).toBeCloseTo(expected, 0)
  })
  it('produces consistent results for the same inputs (deterministic)', () => {
    const a = computeScores()
    const b = computeScores()
    expect(a.composite).toBe(b.composite)
    expect(a.grade).toBe(b.grade)
  })
})

// ============================================================================
// 7. MONTHLY TREND
// ============================================================================
describe('Monthly Trend', () => {
  it('returns exactly 12 months of data', () => {
    const trend = monthlyTrend()
    expect(trend).toHaveLength(12)
  })
  it('each month has scope1, scope2, scope3 fields', () => {
    const trend = monthlyTrend()
    trend.forEach(m => {
      expect(m).toHaveProperty('month')
      expect(m).toHaveProperty('scope1')
      expect(m).toHaveProperty('scope2')
      expect(m).toHaveProperty('scope3')
    })
  })
  it('all values are non-negative', () => {
    const trend = monthlyTrend()
    trend.forEach(m => {
      expect(m.scope1).toBeGreaterThanOrEqual(0)
      expect(m.scope2).toBeGreaterThanOrEqual(0)
      expect(m.scope3).toBeGreaterThanOrEqual(0)
    })
  })
})

// ============================================================================
// 8. ANOMALY DETECTION
// ============================================================================
describe('Anomaly Detection (Z-Score)', () => {
  it('returns an array of anomalies', () => {
    const anomalies = detectAnomalies()
    expect(Array.isArray(anomalies)).toBe(true)
  })
  it('anomalies have required fields', () => {
    const anomalies = detectAnomalies()
    anomalies.forEach(a => {
      expect(['critical', 'elevated', 'info']).toContain(a.severity)
      expect(a).toHaveProperty('title')
      expect(a).toHaveProperty('detail')
      expect(a).toHaveProperty('delta')
      expect(a).toHaveProperty('recommendation')
    })
  })
  it('returns at most 5 anomalies', () => {
    const anomalies = detectAnomalies()
    expect(anomalies.length).toBeLessThanOrEqual(5)
  })
  it('always includes the structural Scope 3 insight', () => {
    const anomalies = detectAnomalies()
    const structural = anomalies.find(a => a.title.includes('Scope 3'))
    expect(structural).toBeDefined()
  })
})

// ============================================================================
// 9. SCENARIO LEVERS & PROJECTION
// ============================================================================
describe('Scenario Levers', () => {
  it('applyLevers with no levers returns the original profile', () => {
    const p = applyLevers(DEFAULT_LEVERS)
    expect(p.electricityKwh).toBe(activityProfile.electricityKwh)
    expect(p.petrolLitre).toBe(activityProfile.petrolLitre)
  })
  it('renewableSwitch zeroes out electricity', () => {
    const p = applyLevers({ ...DEFAULT_LEVERS, renewableSwitch: true })
    expect(p.electricityKwh).toBe(0)
  })
  it('fleetEv reduces petrol by 85%', () => {
    const p = applyLevers({ ...DEFAULT_LEVERS, fleetEv: true })
    expect(p.petrolLitre).toBeCloseTo(activityProfile.petrolLitre * 0.15)
  })
  it('plantForward reduces red meat by 45%', () => {
    const p = applyLevers({ ...DEFAULT_LEVERS, plantForward: true })
    expect(p.redMeatKg).toBeCloseTo(activityProfile.redMeatKg * 0.55)
  })
  it('groundTravel reduces short-haul flights by 70%', () => {
    const p = applyLevers({ ...DEFAULT_LEVERS, groundTravel: true })
    expect(p.flightShortHaulKm).toBeCloseTo(activityProfile.flightShortHaulKm * 0.3)
  })
})

describe('10-Year Projection', () => {
  it('returns 11 data points (year 0 through 10)', () => {
    const result = projectTenYears()
    expect(result.years).toHaveLength(11)
  })
  it('baseline is always >= scenario when levers are active', () => {
    const result = projectTenYears({ ...DEFAULT_LEVERS, renewableSwitch: true, fleetEv: true })
    result.years.forEach(y => {
      expect(y.baseline).toBeGreaterThanOrEqual(y.scenario)
    })
  })
  it('lifetimeSaved is 0 when no levers are active', () => {
    const result = projectTenYears(DEFAULT_LEVERS)
    expect(result.lifetimeSaved).toBe(0)
  })
  it('lifetimeSaved is positive when levers are active', () => {
    const result = projectTenYears({ ...DEFAULT_LEVERS, renewableSwitch: true })
    expect(result.lifetimeSaved).toBeGreaterThan(0)
  })
  it('reductionPct is between 0 and 100', () => {
    const result = projectTenYears({ ...DEFAULT_LEVERS, renewableSwitch: true, fleetEv: true, plantForward: true, groundTravel: true })
    expect(result.reductionPct).toBeGreaterThanOrEqual(0)
    expect(result.reductionPct).toBeLessThanOrEqual(100)
  })
})

// ============================================================================
// 10. INITIATIVES (MAC CURVE)
// ============================================================================
describe('Marginal Abatement Initiatives', () => {
  it('returns exactly 4 initiatives', () => {
    const initiatives = getInitiatives()
    expect(initiatives).toHaveLength(4)
  })
  it('initiatives are sorted by costPerT ascending (cheapest first)', () => {
    const initiatives = getInitiatives()
    for (let i = 1; i < initiatives.length; i++) {
      expect(initiatives[i].costPerT).toBeGreaterThanOrEqual(initiatives[i - 1].costPerT)
    }
  })
  it('abatement values are non-negative', () => {
    const initiatives = getInitiatives()
    initiatives.forEach(i => {
      expect(i.abatementT).toBeGreaterThanOrEqual(0)
      expect(i.abatementKg).toBeGreaterThanOrEqual(0)
    })
  })
})

// ============================================================================
// 11. SCOPE LEDGER
// ============================================================================
describe('Scope Ledger', () => {
  it('returns exactly 3 scope rows', () => {
    const ledger = scopeLedger()
    expect(ledger).toHaveLength(3)
  })
  it('scope shares sum to approximately 100%', () => {
    const ledger = scopeLedger()
    const totalShare = ledger.reduce((acc, r) => acc + r.sharePct, 0)
    expect(totalShare).toBeCloseTo(100, 0)
  })
  it('each row has the required fields', () => {
    const ledger = scopeLedger()
    ledger.forEach(r => {
      expect(r).toHaveProperty('scope')
      expect(r).toHaveProperty('label')
      expect(r).toHaveProperty('currentKg')
      expect(r).toHaveProperty('annualT')
      expect(r).toHaveProperty('sharePct')
      expect(r).toHaveProperty('variancePct')
    })
  })
})

// ============================================================================
// 12. EDGE CASES & SAFETY
// ============================================================================
describe('Edge Cases & Zero-Division Safety', () => {
  const zeroProfile = {
    electricityKwh: 0, naturalGasKwh: 0, petrolLitre: 0,
    flightShortHaulKm: 0, flightLongHaulKm: 0,
    redMeatKg: 0, dairyKg: 0, plantKg: 0, goodsSpendUsd: 0,
    renewableSharePct: 0, wasteDiversionPct: 0,
    supplierTransparencyPct: 0, dataCompletenessPct: 0, offsetCoveragePct: 0,
  }

  it('totalAnnualKg returns 0 for zeroed profile (no NaN)', () => {
    expect(totalAnnualKg(zeroProfile)).toBe(0)
    expect(Number.isNaN(totalAnnualKg(zeroProfile))).toBe(false)
  })

  it('budgetStatus does not NaN for zeroed profile', () => {
    const status = budgetStatus(zeroProfile)
    expect(Number.isNaN(status.overshootRatio)).toBe(false)
    expect(Number.isNaN(status.budgetExhaustedDay)).toBe(false)
  })

  it('computeScores returns valid numbers for zeroed profile', () => {
    const scores = computeScores(zeroProfile)
    expect(Number.isNaN(scores.composite)).toBe(false)
    expect(Number.isNaN(scores.environmental)).toBe(false)
    expect(scores.composite).toBeGreaterThanOrEqual(0)
  })

  it('monthlyTrend returns valid data for zeroed profile (no NaN)', () => {
    const trend = monthlyTrend(zeroProfile)
    trend.forEach(m => {
      expect(Number.isNaN(m.scope1)).toBe(false)
      expect(Number.isNaN(m.scope2)).toBe(false)
      expect(Number.isNaN(m.scope3)).toBe(false)
    })
  })

  it('projectTenYears handles zeroed profile gracefully', () => {
    const result = projectTenYears(DEFAULT_LEVERS, zeroProfile)
    expect(Number.isNaN(result.lifetimeSaved)).toBe(false)
    expect(Number.isNaN(result.reductionPct)).toBe(false)
  })

  it('scopeLedger handles zeroed profile without NaN', () => {
    const ledger = scopeLedger(zeroProfile)
    ledger.forEach(r => {
      expect(Number.isNaN(r.variancePct)).toBe(false)
      expect(Number.isNaN(r.sharePct)).toBe(false)
    })
  })
})
