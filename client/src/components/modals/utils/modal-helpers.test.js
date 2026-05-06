import { describe, test, expect } from 'vitest'
import {
  resetStartTimeOnMasterChange,
  generateDurationOptions
} from './modal-helpers'

describe('resetStartTimeOnMasterChange', () => {
  const seedData = { staffId: 3, startTime: '10:30' }

  test('returns the seed startTime when the selected id matches seedData.staffId', () => {
    const startTime = resetStartTimeOnMasterChange(3, seedData)
    expect(startTime).toBe(seedData.startTime)
  })

  test('returns empty string when the selected id does not match seedData.staffId', () => {
    const startTime = resetStartTimeOnMasterChange(1, seedData)
    expect(startTime).toBe('')
  })

  test('returns empty string when seedData is null', () => {
    const startTime = resetStartTimeOnMasterChange(3, null)
    expect(startTime).toBe('')
  })

  test('returns empty string when seedData has no startTime', () => {
    const startTime = resetStartTimeOnMasterChange(3, {
      staffId: 3
    })
    expect(startTime).toBe('')
  })
})

describe('generateDurationOptions', () => {
  const totalSlots = 13
  const mappedDurations = generateDurationOptions(totalSlots)

  test('returns an array with length equal to totalSlots', () => {
    expect(mappedDurations).toHaveLength(totalSlots)
  })

  test('first option has value 5 (first 5-minute slot)', () => {
    expect(mappedDurations[0].value).toBe(5)
  })

  test('twelfth option has value 60 and label "1 ч"', () => {
    expect(mappedDurations[11].value).toBe(60)
    expect(mappedDurations[11].label).toBe('1 ч')
  })

  test('thirteenth option has value 65 and label "1 ч 5 м"', () => {
    expect(mappedDurations[12].value).toBe(65)
    expect(mappedDurations[12].label).toBe('1 ч 5 м')
  })

  test('an option with only minutes (no full hour) has label in "X м" format', () => {
    expect(mappedDurations[0].label).toBe('5 м')
  })

  test('an option with only hours (zero remainder minutes) has label in "X ч" format', () => {
    expect(mappedDurations[11].label).toBe('1 ч')

  })

  test('an option with both hours and minutes has label in "X ч Y м" format', () => {
    expect(mappedDurations[12].label).toBe('1 ч 5 м')
  })
})