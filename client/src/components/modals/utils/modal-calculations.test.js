import { describe, expect, test } from 'vitest'
import {
  roundToCents,
  clamp,
  calculatePricing,
  calculatePercentFromValue,
  calculateSlotTime
} from './modal-calculations'

describe('roundToCents', () => {
  test('rounds down when third decimal is below 5', () => {
    expect(roundToCents(10.123)).toBe(10.12)
  })

  test('rounds up when third decimal is 5 or above', () => {
    expect(roundToCents(10.127)).toBe(10.13)
  })

  test('leaves an already clean two-decimal number unchanged', () => {
    expect(roundToCents(10.00)).toBe(10.00)
  })

  test('handles zero', () => {
    expect(roundToCents(0)).toBe(0)
  })
})

describe('clamp', () => {
  test('returns the value when it is within range', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  test('returns min when value is below the lower bound', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  test('returns max when value is above the upper bound', () => {
    expect(clamp(110, 0, 100)).toBe(100)
  })

  test('returns min when value equals min exactly', () => {
    expect(clamp(0, 0, 100)).toBe(0)
  })

  test('returns max when value equals max exactly', () => {
    expect(clamp(100, 0, 100)).toBe(100)
  })
})

describe('calculatePricing', () => {
  test('returns zero discountValue and full price as total when discount is 0', () => {
    const { discountValue, total } = calculatePricing(5000, 0)
    expect(discountValue).toBe(0)
    expect(total).toBe(5000)
  })

  test('calculates correct discountValue and total for a whole-number percent', () => {
    const { discountValue, total } = calculatePricing(5000, 10)
    expect(discountValue).toBe(500) // 5000 * 0.1 = 500
    expect(total).toBe(4500) // 5000 - 500 = 4500
  })

  test('calculates correctly for a fractional percent like 33.33%', () => {
    const { discountValue, total } = calculatePricing(100, 33.33)
    expect(discountValue).toBe(33.33) // 100 * 0.3333 = 33.33
    expect(total).toBe(66.67) // 100 - 33.33 = 66.67
  })

  test('returns zero total when discount is 100%', () => {
    const { discountValue, total } = calculatePricing(5000, 100)
    expect(discountValue).toBe(5000)
    expect(total).toBe(0)
  })

  test('returns zero discountValue and full price as total when percent is negative', () => {
    const { discountValue, total } = calculatePricing(5000, -100)
    expect(discountValue).toBe(0)
    expect(total).toBe(5000)
  })

  test('rounds discountValue and total to two decimal places', () => {
    const { discountValue, total } = calculatePricing(3333, 15)
    expect(discountValue).toBe(499.95)
    expect(total).toBe(2833.05)
  })
})

describe('calculatePercentFromValue', () => {
  test('calculates correct percent from a discount value', () => {
    expect(calculatePercentFromValue(5000, 500)).toBe(10)
  })

  test('returns 0 when price is 0 to avoid division by zero', () => {
    expect(calculatePercentFromValue(0, 0)).toBe(0)
  })

  test('returns 100 when discountValue equals price', () => {
    expect(calculatePercentFromValue(5000, 5000)).toBe(100)
  })

  test('rounds result to two decimal places', () => {
    expect(calculatePercentFromValue(100, 66.67)).toBe(66.67)
  })
})

describe('calculateSlotTime', () => {
  test('index 0 with 5-minute slots gives totalMinutes=5, hours=0, minutes=5', () => {
    const { 
      totalMinutes, 
      minutesToFormat: minutes, 
      hoursToFormat: hours 
    } = calculateSlotTime(0, 5)

    expect(totalMinutes).toBe(5)
    expect(minutes).toBe(5)
    expect(hours).toBe(0)
  })

  test('index 11 with 5-minute slots gives totalMinutes=60, hours=1, minutes=0', () => {
    const { 
      totalMinutes, 
      minutesToFormat: minutes, 
      hoursToFormat: hours 
    } = calculateSlotTime(11, 5)
    
    expect(totalMinutes).toBe(60)
    expect(minutes).toBe(0)
    expect(hours).toBe(1)
  })

  test('index 12 with 5-minute slots gives totalMinutes=65, hours=1, minutes=5', () => {
    const { 
      totalMinutes, 
      minutesToFormat: minutes, 
      hoursToFormat: hours 
    } = calculateSlotTime(12, 5)
    
    expect(totalMinutes).toBe(65)
    expect(minutes).toBe(5)
    expect(hours).toBe(1)
  })

  test('works correctly with a different minutesPerSlot value like 15', () => {
    const { 
      totalMinutes, 
      minutesToFormat: minutes, 
      hoursToFormat: hours 
    } = calculateSlotTime(0, 15)
    
    expect(totalMinutes).toBe(15)
    expect(minutes).toBe(15)
    expect(hours).toBe(0)
  })
})