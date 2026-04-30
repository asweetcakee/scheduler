import { describe, test, expect } from 'vitest'
import { format, addDays } from 'date-fns'
import {
  appointmentSchema,
  createClientSchema,
  createStaffSchema
} from './appointmentSchema'

const TODAY_PLUS_ONE = format(addDays(new Date(), 1), 'yyyy-MM-dd')

const validService = {
  serviceId: 1,
  duration: 30,
  priceSnapshot: 3500,
  discountPercent: 0,
  discountValue: 0,
  total: 3500,
}

const validAppointment = {
  staffId: 1,
  date: TODAY_PLUS_ONE,
  startTime: '10:00',
  endTime: '10:30', // must equal startTime + Σ(durations) (30 min)

  clientId: null,
  clientName: 'Алия Аскарова',
  clientPhone: '+7 777 000 00 00',

  services: [validService],

  notificationSettings: {
    remindClient: false,
    remindStaff: false,
    remindBeforeMinutes: 60,
    requestReview: false,
    reviewAfterMinutes: 60,
  },

  appointmentStatus: 'scheduled',
  adminNotes: '',
  appointmentColor: '#60f63b',
}

const getError = (result, path) => {
  return result.error?.issues.find(i => i.path.join('.') === path)?.message
}

describe('appointmentSchema - valid baseline', () => {
  test('accepts a fully valid appointment object', () => {
    const result = appointmentSchema.safeParse(validAppointment)
    expect(result.success).toBe(true)
  })

  test('accepts clientId as null (new client created mid-flow)', () => {
    const appointment = { ...validAppointment, clientId: null }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
    if(result.success) {
      expect(result.data.clientId).toBeNull()
    }
  })

  test('accepts adminNotes as undefined (optional field)', () => {
    const appointment = { ...validAppointment, adminNotes: undefined }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
    if(result.success) {
      expect(result.data.adminNotes).toBeUndefined()
    }
  })

  test('accepts appointmentColor as null (no color tag)', () => {
    const appointment = { ...validAppointment, appointmentColor: null }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
    if(result.success) {
      expect(result.data.appointmentColor).toBeNull()
    }
  })

  test('accepts appointmentColor as undefined', () => {
    const appointment = { ...validAppointment, appointmentColor: undefined }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
    if(result.success) {
      expect(result.data.appointmentColor).toBeUndefined()
    }
  })
})

describe('calendarDateString (shared primitive)', () => {
  test('rejects an empty date string', () => {
    const appointment = { ...validAppointment, date: '' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'date')).toContain('выберите дату')
  })

  test('rejects a date not in YYYY-MM-DD format', () => {
    const appointment = { ...validAppointment, date: '30/04/2026' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'date')).toContain('Неверный формат')
  })

  test('rejects an impossible calendar date like February 30', () => {
    const appointment = { ...validAppointment, date: '2026-02-30' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'date')).toContain('несуществующая дата')
  })

  test('rejects an impossible month like month 13', () => {
    const appointment = { ...validAppointment, date: '2026-13-01' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'date')).toContain('несуществующая дата')
  })

  test('accepts a valid future date in YYYY-MM-DD format', () => {
    const appointment = { ...validAppointment, date: TODAY_PLUS_ONE }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('masterDateTimeSchema - date', () => {
  test('rejects a date in the past', () => {
    const appointment = { ...validAppointment, date: '2020-01-01' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'date')).toContain('прошедшую дату')
  })

  test('accepts today as a valid date (not in the past)', () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const appointment = { ...validAppointment, date: todayStr }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('accepts a date in the future', () => {
    const appointment = { ...validAppointment, date: TODAY_PLUS_ONE }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('wallClockTimeString (shared primitive)', () => {
  test('rejects an empty startTime', () => {
    const appointment = { ...validAppointment, startTime: '' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'startTime')).toContain('выберите время начала')
  })

  test('rejects startTime not in HH:mm format', () => {
    const appointment = { ...validAppointment, startTime: '9:00' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'startTime')).toContain('должно быть в формате ЧЧ:ММ')
  })

  test('rejects an impossible hour like 25:00', () => {
    const appointment = { ...validAppointment, startTime: '25:00' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'startTime')).toContain('Недопустимое значение времени')
  })

  test('rejects an impossible minute like 10:61', () => {
    const appointment = { ...validAppointment, startTime: '10:61' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'startTime')).toContain('Недопустимое значение времени')
  })

  test('accepts boundary values 00:00 and 23:59', () => {
    const startDay = { 
      ...validAppointment, 
      startTime: '00:00', 
      endTime: '00:30'
    }
    const result1 = appointmentSchema.safeParse(startDay)
    expect(result1.success).toBe(true)

    const endDay = { 
      ...validAppointment, 
      startTime: '23:29', 
      endTime: '23:59'
    }
    const result2 = appointmentSchema.safeParse(endDay)
    expect(result2.success).toBe(true)
  })

  test('same rules apply to endTime field', () => {
    const endDay = { 
      ...validAppointment, 
      startTime: '23:00', 
      endTime: '25:30'
    }
    const result = appointmentSchema.safeParse(endDay)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Недопустимое значение времени')
  })
})

describe('masterDateTimeSchema - staffId', () => {
  test('rejects when staffId is missing', () => {
    const appointment = { ...validAppointment }
    delete appointment.staffId
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'staffId')).toContain('выберите мастера')
  })

  test('rejects staffId of 0', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, staffId: 0 })
    expect(result.success).toBe(false)
    expect(getError(result, 'staffId')).toContain('выберите мастера')
  })

  test('rejects a negative staffId', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, staffId: -2 })
    expect(result.success).toBe(false)
    expect(getError(result, 'staffId')).toContain('выберите мастера')
  })

  test('rejects a non-integer staffId like 1.5', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, staffId: 1.5 })
    expect(result.success).toBe(false)
    expect(getError(result, 'staffId')).toContain('выберите мастера')
  })
})

describe('clientInfoSchema - clientName', () => {
  test('rejects an empty clientName', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientName: '' })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientName')).toContain('указать имя клиента')
  })

  test('rejects a clientName that is only whitespace (trimmed to empty)', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientName: '   ' })
    expect(result.success).toBe(false)
  })

  test('rejects a clientName longer than 100 characters', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientName: 'А'.repeat(101) })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientName')).toContain('не может превышать')
  })
})

describe('clientInfoSchema - clientPhone (phoneString)', () => {
  test('rejects an empty phone', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '' })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientPhone')).toContain('Введите номер телефона')
  })

  test('rejects a phone longer than 20 characters', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '+7 777 000 00 00 00 000' })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientPhone')).toContain('не может превышать')
  })

  test('rejects a phone with letters or special characters', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: 'abc-def-ghij' })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientPhone')).toContain('содержит недопустимые символы')
  })

  test('rejects a phone with fewer than 7 digits', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '12345' })
    expect(result.success).toBe(false)
    expect(getError(result, 'clientPhone')).toContain('должен содержать минимум')
  })

  test('accepts +7 (777) 000-00-00 format', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '+7 (777) 000-00-00' })
    expect(result.success).toBe(true)
    expect(getError(result, 'clientPhone')).toBeUndefined()
  })

  test('accepts 87071234567 format (no separators)', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '87071234567' })
    expect(result.success).toBe(true)
    expect(getError(result, 'clientPhone')).toBeUndefined()
  })

  test('accepts +1-202-555-0125 format', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, clientPhone: '+1-202-555-0125' })
    expect(result.success).toBe(true)
    expect(getError(result, 'clientPhone')).toBeUndefined()
  })
})

describe('serviceRowSchema - individual fields', () => {
  test('rejects when serviceId is null', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, serviceId: null }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.serviceId')).toContain('выберите услугу')
  })

  test('rejects a non-integer serviceId', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, serviceId: 1.5 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.serviceId')).toContain('')
  })

  test('rejects duration below the minimum (5 minutes)', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, duration: 4 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.duration')).toContain('должна быть не менее')
  })

  test('rejects duration above the maximum (720 minutes)', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, duration: 721 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.duration')).toContain('не может превышать')
  })

  test('rejects a negative priceSnapshot', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, priceSnapshot: -1 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.priceSnapshot')).toContain('не может быть отрицательной')
  })

  test('rejects priceSnapshot above 10 000 000', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, priceSnapshot: 10_000_001 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.priceSnapshot')).toContain('не может превышать')
  })

  test('rejects discountPercent above 100', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, discountPercent: 101 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.discountPercent')).toContain('не может превышать')
  })

  test('rejects a negative discountPercent', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, discountPercent: -1 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.discountPercent')).toContain('не может быть отрицательной')
  })
})

