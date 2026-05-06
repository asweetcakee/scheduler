import { describe, test, expect } from 'vitest'
import {
  transformStaffForCombobox,
  transformClientsForCombobox,
  transformServicesForCombobox
} from './modal-adapters'

describe('transformStaffForCombobox', () => {
  const staffList = [
    { id: 1, name: 'Алия Аскарова', role: 'Парикмахер' },
    { id: 2, name: 'Айбар Оразаев', role: undefined },
  ]

  test('maps id and name correctly', () => {
    const transformed = transformStaffForCombobox(staffList)
    expect(transformed).toEqual([
      { id: 1, label: 'Алия Аскарова', sublabel: 'Парикмахер' },
      { id: 2, label: 'Айбар Оразаев', sublabel: undefined }
    ])
  })

  test('maps role to sublabel', () => {
    const transformed = transformStaffForCombobox(staffList)
    expect(transformed[0].sublabel).toBe('Парикмахер')
  })

  test('sets sublabel to undefined when role is missing', () => {
    const transformed = transformStaffForCombobox(staffList)
    expect(transformed[1].sublabel).toBe(undefined)
  })

  test('returns an empty array when given an empty list', () => {
    const transformed = transformStaffForCombobox([])
    expect(transformed).toHaveLength(0)
  })
})

describe('transformClientsForCombobox', () => {
  const clientsList = [
    { id: 10, name: 'Гүлім Серікова', phone: '+7 777 000 00 00' },
    { id: 11, name: 'Данияр Ахметов', phone: undefined },
  ]

  test('maps id and name correctly', () => {
    const transformed = transformClientsForCombobox(clientsList)
    expect(transformed).toEqual([
      { id: 10, label: 'Гүлім Серікова', sublabel: '+7 777 000 00 00' },
      { id: 11, label: 'Данияр Ахметов', sublabel: undefined },
    ])
  })

  test('maps phone to sublabel', () => {
    const transformed = transformClientsForCombobox(clientsList)
    expect(transformed[0].sublabel).toBe('+7 777 000 00 00')

  })

  test('sets sublabel to undefined when phone is missing', () => {
    const transformed = transformClientsForCombobox(clientsList)
    expect(transformed[1].sublabel).toBe(undefined)
  })

  test('returns an empty array when given an empty list', () => {
    const transformed = transformClientsForCombobox([])
    expect(transformed).toHaveLength(0)
  })
})

describe('transformServicesForCombobox', () => {
  const servicesList = [
    { id: 100, name: 'Стрижка', duration: 30, price: 3500 },
    { id: 101, name: 'Окрашивание', duration: 120, price: 15000 },
  ]

  const unicodeSpace = '\u00a0'

  test('maps id and name correctly', () => {
    const transformed = transformServicesForCombobox(servicesList)
    expect(transformed).toEqual([
      { id: 100, label: 'Стрижка', sublabel: `30 м · 3${unicodeSpace}500 ₸` },
      { id: 101, label: 'Окрашивание', sublabel: `120 м · 15${unicodeSpace}000 ₸` },
    ])
  })

  test('formats sublabel as "duration м · price ₸"', () => {
    const transformed = transformServicesForCombobox(servicesList)
    expect(transformed[0].sublabel).toBe(`30 м · 3${unicodeSpace}500 ₸`)
  })

  test('formats large prices with ru-RU locale thousands separator', () => {
    const transformed = transformServicesForCombobox(servicesList)
    expect(transformed[0].sublabel).toContain(`3${unicodeSpace}500 ₸`)
  })

  test('returns an empty array when given an empty list', () => {
    const transformed = transformServicesForCombobox([])
    expect(transformed).toHaveLength(0)
  })
})