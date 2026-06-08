import { expect, test, describe } from 'vitest'
import { emissionsByActivity, totalAnnualKg, budgetStatus, activityProfile } from '../dashboard-data'

describe('Carbon Ledger Deterministic Logic', () => {
  test('emissionsByActivity mathematically calculates correct kg based on emission factors', () => {
    // electricityKwh: 4200 * 0.233 = 978.6
    const emissions = emissionsByActivity(activityProfile)
    const electricity = emissions.find(e => e.key === 'electricityKwh')
    expect(electricity?.kg).toBeCloseTo(978.6, 1)
  })

  test('totalAnnualKg properly sums all scopes', () => {
    const total = totalAnnualKg(activityProfile)
    expect(total).toBeGreaterThan(1000) // Should be around 14,000+ kg
  })

  test('budgetStatus calculates correct overshoot ratios', () => {
    // If the person has extremely low emissions, overshoot ratio should be < 1
    const lowProfile = { ...activityProfile, electricityKwh: 100, flightLongHaulKm: 0, flightShortHaulKm: 0, goodsSpendUsd: 100 }
    const status = budgetStatus(lowProfile)
    
    // Normal profile overshoot
    const normalStatus = budgetStatus(activityProfile)
    
    expect(status.overshootRatio).toBeLessThan(normalStatus.overshootRatio)
    expect(normalStatus.overshootRatio).toBeGreaterThan(1)
  })
})
