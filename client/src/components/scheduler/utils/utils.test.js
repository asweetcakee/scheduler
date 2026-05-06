import { describe, expect, test } from 'vitest'
import { calculateDisplaySlotHeight, calculateGridHeight, calculateHeightForMinutes, calculateSlotsPerHour, calculateSlotTime, calculateTotalSlots, calculateTotalSlotsForDisplay, calculateTotalSlotsForGrid } from './grid-calculations'
import { generateDisplaySlots, generateSlots, getSlotTime } from './grid-helper'

describe('grid-calculations', () => {

  test('calculateSlotsPerHour returns correct number of slots for valid division', () => {
    let minutesPerSlot = 15
    let expectedSlots = 4
    let result = calculateSlotsPerHour(minutesPerSlot)
    expect(result).toBe(expectedSlots)

    minutesPerSlot = 5
    expectedSlots = 12
    result = calculateSlotsPerHour(minutesPerSlot)
    expect(result).toBe(expectedSlots)
  })

  test('calculateSlotsPerHour throws an error for invalid division', () => {
    const invalidMinutesPerSlot = 7
    const result = () => calculateSlotsPerHour(invalidMinutesPerSlot)
    expect(result).toThrowError(`Invalid slot size: ${invalidMinutesPerSlot} does not evenly divide 60`)
  })

  test('calculateTotalSlots returns correct total for a standard work day', () => {
    const startHour = 9
    const endHour = 17
    const minutesPerSlot = 15
    const expectedTotalSlots = (endHour - startHour) * (60 / minutesPerSlot) // 8 hours * 4 slots per hour = 32
    const result = calculateTotalSlots(startHour, endHour, minutesPerSlot)
    expect(result).toBe(expectedTotalSlots)
  })

  test('calculateTotalSlotsForDisplay returns correct total slots for display resolution', () => {
    const startHour = 9
    const endHour = 17
    const minutesPerSlot = 15
    const expectedTotalSlots = (endHour - startHour) * (60 / minutesPerSlot) // 8 hours * 4 slots per hour = 32
    const result = calculateTotalSlotsForDisplay(startHour, endHour)
    expect(result).toBe(expectedTotalSlots)
  })

  test('calculateTotalSlotsForGrid returns correct total slots for display resolution', () => {
    const startHour = 9
    const endHour = 17
    const minutesPerSlot = 5
    const expectedTotalSlots = (endHour - startHour) * (60 / minutesPerSlot) // 8 hours * 12 slots per hour = 96
    const result = calculateTotalSlotsForGrid(startHour, endHour)
    expect(result).toBe(expectedTotalSlots)
  })

  test('calculateGridHeight returns correct height based on total slots and slot height', () => {
    const totalSlots = 12
    const slotHeight = 20
    const expectedHeight = totalSlots * slotHeight // 12 slots * 20px per slot = 240px
    const result = calculateGridHeight(totalSlots, slotHeight)
    expect(result).toBe(expectedHeight)
  })

  test('calculateSlotTime returns correct hour and minute object for a given index', () => {
    const slotIndex = 3
    const startHour = 9
    const minutesPerSlot = 5
    const expectedTime = { hour: 9, minutes: 15 } // 3 slots * 5 minutes per slot = 15 minutes past the hour
    const result = calculateSlotTime(slotIndex, startHour, minutesPerSlot)
    expect(result).toEqual(expectedTime)
  })

  test('calculateHeightForMinutes returns correct height for a given number of minutes', () => {
    const minutes = 10
    const slotHeight = 20
    const expectedHeight = (minutes / 5) * slotHeight // (10 minutes / 5 minutes per slot) * 20px per slot = 40px
    const result = calculateHeightForMinutes(minutes, slotHeight)
    expect(result).toBe(expectedHeight)
  })

  test('calculateDisplaySlotHeight returns correct height for display slots based on grid slot height', () => {
    const slotHeight = 20
    const expectedDisplaySlotHeight = slotHeight * (15 / 5) // 20px * (15 minutes per display slot / 5 minutes per grid slot) = 60px
    const result = calculateDisplaySlotHeight(slotHeight)
    expect(result).toBe(expectedDisplaySlotHeight)
  })

})

describe('grid-helper', () => {
  test('getSlotTime formats time string with leading zeros correctly', () => {
    const slotIndex = 1
    const startHour = 9
    const expectedTime = '09:05'
    const result = getSlotTime(slotIndex, startHour)
    expect(result).toBe(expectedTime)
  })

  test('generateSlots returns correct array of time strings for given total slots, start hour, and minutes per slot', () => {
    const totalSlots = 4
    const startHour = 9
    const minutesPerSlot = 15
    const expectedSlots = ['09:00', '09:15', '09:30', '09:45']
    const result = generateSlots(totalSlots, startHour, minutesPerSlot)
    expect(result).toEqual(expectedSlots)
  })

  test('generateDisplaySlots returns an array of strings with the expected first and last values', () => {
    const totalSlots = 4
    const startHour = 9
    const expectedSlots = ['09:00', '09:15', '09:30', '09:45']
    const result = generateDisplaySlots(totalSlots, startHour)
    expect(result).toEqual(expectedSlots)
  })
})