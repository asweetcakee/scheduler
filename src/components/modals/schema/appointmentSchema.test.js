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

  test('accepts adminNotes as omitted key', () => {
    const { adminNotes, ...rest } = validAppointment
    const result = appointmentSchema.safeParse(rest)
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
    const { staffId, ...rest } = validAppointment
    const result = appointmentSchema.safeParse(rest)
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
    expect(getError(result, 'services.0.serviceId')).toContain('Некорректный идентификатор услуги')
  })

  test('rejects a non-integer serviceId', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, serviceId: 1.5 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.serviceId')).toContain('выберите услугу')
  })

  test('rejects duration of 0', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, services: [{ ...validService, duration: 0 }]})
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.duration')).toContain('должна быть не менее')
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

describe('serviceRowSchema - cross-field refinements', () => {
  test('rejects when discountValue does not match priceSnapshot × discountPercent / 100', () => {
    const appointment = { 
      ...validAppointment,
      services: [{ 
        ...validService,
        priceSnapshot: 3500,
        discountPercent: 10,
        discountValue: 999 
      }]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.discountValue')).toContain('не соответствует вычисленному проценту')
  })

  test('accepts discountValue within floating-point tolerance (< 0.01 difference)', () => {
    const appointment = {
      ...validAppointment,
      services: [{
        ...validService,
        priceSnapshot: 100,
        discountPercent: 33.33,
        discountValue: 33.33,
        total: 66.67
      }]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('rejects when total does not equal priceSnapshot minus discountValue', () => {
    const appointment = {
      ...validAppointment,
      services: [{
        ...validService,
        priceSnapshot: 3500,
        discountValue: 0,
        total: 9999
      }]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'services.0.total')).toContain('не совпадает с расчётной')
  })

  test('accepts a consistent row with a non-zero discount', () => {
    const appointment = {
      ...validAppointment,
      services: [{
        ...validService,
        priceSnapshot: 3500,
        discountPercent: 10,
        discountValue: 350,
        total: 3150
      }]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('serviceSchema - array constraints', () => {
  test('rejects an empty services array', () => {
    const appointment = { ...validAppointment, services: [] }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'services')).toContain('выберите хотя бы одну услугу')
  })

  test('rejects more than 10 services', () => {
    const appointment = { 
      ...validAppointment, 
      services: Array(11).fill({
        ...validService
      })
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'services')).toContain('Нельзя добавить более 10 услуг')
  })

  test('accepts an array with multiple valid service rows', () => {
    const appointment = {
      ...validAppointment,
      startTime: '10:00',
      endTime: '11:15', // 30 + 45 = 75 min total duration
      services: [
        { ...validService, serviceId: 1, duration: 30, priceSnapshot: 3500, discountPercent: 0, discountValue: 0, total: 3500 },
        { ...validService, serviceId: 2, duration: 45, priceSnapshot: 5000, discountPercent: 20, discountValue: 1000, total: 4000 },
      ]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('notificationSchema - remindBeforeMinutes', () => {
  test('refinement fires when remindClient is true and remindBeforeMinutes is below 45', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: true, remindStaff: false, remindBeforeMinutes: 30, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'notificationSettings.remindBeforeMinutes')).toContain('должно быть в пределах 45-1440 минут')
  })

  test('refinement fires when remindStaff is true and remindBeforeMinutes is below 45', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: true, remindBeforeMinutes: 30, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'notificationSettings.remindBeforeMinutes')).toContain('должно быть в пределах 45-1440 минут')
  })

  test('refinement does NOT fire when both remind flags are false, even with remindBeforeMinutes below 45', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 1, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('refinement fires when remindBeforeMinutes exceeds 1440', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: true, remindStaff: false, remindBeforeMinutes: 1441, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'notificationSettings.remindBeforeMinutes')).toContain('должно быть в пределах 45-1440 минут')
  })

  test('accepts remindBeforeMinutes of exactly 45 when a remind flag is on', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: true, remindStaff: false, remindBeforeMinutes: 45, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('accepts remindBeforeMinutes of exactly 1440 when a remind flag is on', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: true, remindStaff: false, remindBeforeMinutes: 1440, requestReview: false, reviewAfterMinutes: 60 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('notificationSchema - reviewAfterMinutes', () => {
  test('refinement fires when requestReview is true and reviewAfterMinutes is below 30', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 60, requestReview: true, reviewAfterMinutes: 29 } 
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'notificationSettings.reviewAfterMinutes')).toContain('должен быть через 30-10080 минут после окончания')
  })

  test('refinement does NOT fire when requestReview is false, even with reviewAfterMinutes below 30', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 60, requestReview: false, reviewAfterMinutes: 1 } 
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('refinement fires when reviewAfterMinutes exceeds 10080', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 60, requestReview: true, reviewAfterMinutes: 10081 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'notificationSettings.reviewAfterMinutes')).toContain('должен быть через 30-10080 минут после окончания')
  })

  test('accepts reviewAfterMinutes of exactly 30 when requestReview is true', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 60, requestReview: true, reviewAfterMinutes: 30 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('accepts reviewAfterMinutes of exactly 10080 when requestReview is true', () => {
    const appointment = {
      ...validAppointment,
      notificationSettings: { remindClient: false, remindStaff: false, remindBeforeMinutes: 60, requestReview: true, reviewAfterMinutes: 10080 }
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })
})

describe('appointmentMetaSchema', () => {
  test('rejects an unrecognised appointmentStatus', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentStatus: 'pending' })
    expect(result.success).toBe(false)
    expect(getError(result, 'appointmentStatus')).toContain('Неверный статус записи')
  })

  test('accepts all three valid statuses', () => {
    const validStatuses = ['scheduled', 'completed', 'canceled']
    validStatuses.forEach(status => {
      const result = appointmentSchema.safeParse({ ...validAppointment, appointmentStatus: status })
      expect(result.success).toBe(true)
    })
  })

  test('rejects adminNotes longer than 1000 characters', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, adminNotes: 'А'.repeat(1001) })
    expect(result.success).toBe(false)
    expect(getError(result, 'adminNotes')).toContain('не могут превышать')
  })

  test('accepts adminNotes that is only whitespace - trimmed it becomes empty, which is allowed', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, adminNotes: '   ' })
    expect(result.success).toBe(true)
  })

  test('rejects an appointmentColor that is not a valid HEX string', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentColor: 'red' })
    expect(result.success).toBe(false)
    expect(getError(result, 'appointmentColor')).toContain('должен быть в формате HEX')
  })

  test('accepts a 3-character HEX color', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentColor: '#fff' })
    expect(result.success).toBe(true)
  })

  test('accepts a 6-character HEX color', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentColor: '#ff0000' })
    expect(result.success).toBe(true)
  })

  test('accepts appointmentColor as null', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentColor: null })
    expect(result.success).toBe(true)
  })

  test('accepts appointmentColor as undefined', () => {
    const result = appointmentSchema.safeParse({ ...validAppointment, appointmentColor: undefined })
    expect(result.success).toBe(true)
  })
})

describe('appointmentSchema - endTime vs startTime cross-field check', () => {
  test('rejects when endTime is not after startTime (same time)', () => {
    const appointment = { ...validAppointment, startTime: '10:00', endTime: '10:00' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Время окончания должно быть позже времени начала')
  })

  test('rejects when endTime is before startTime', () => {
    const appointment = { ...validAppointment, startTime: '11:00', endTime: '10:00' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Время окончания должно быть позже времени начала')
  })

  // this refinement uses wall-clock comparison and does NOT handle
  // midnight wrap-around (e.g. 23:00 start + 90 min = 00:30 would fail here)
  test('documents that midnight-crossing endTime fails the isAfter wall-clock check', () => {
    const appointment = { ...validAppointment, startTime: '23:00', endTime: '00:30' }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Время окончания должно быть позже времени начала')
  })
})

describe('appointmentSchema - endTime must equal startTime + Σdurations', () => {
  test('rejects when endTime does not match startTime + total duration', () => {
    const appointment = { 
      ...validAppointment, 
      startTime: '10:00',
      endTime: '10:45',
      services: [
        { ...validService, serviceId: 1, duration: 30, priceSnapshot: 3500, discountPercent: 0, discountValue: 0, total: 3500 }
      ]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Время окончания не совпадает с суммой продолжительностей услуг')
  })

  test('accepts when endTime exactly equals startTime + total duration', () => {
    const appointment = { 
      ...validAppointment, 
      startTime: '10:00',
      endTime: '10:30',
      services: [
        { ...validService, serviceId: 1, duration: 30, priceSnapshot: 3500, discountPercent: 0, discountValue: 0, total: 3500 }
      ]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('accepts when endTime matches the sum of multiple service durations', () => {
    const appointment = {
      ...validAppointment,
      startTime: '10:00',
      endTime: '11:15',
      services: [
        { ...validService, serviceId: 1, duration: 30, priceSnapshot: 3500, discountPercent: 0, discountValue: 0, total: 3500 },
        { ...validService, serviceId: 2, duration: 45, priceSnapshot: 5000, discountPercent: 20, discountValue: 1000, total: 4000 },
      ]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(true)
  })

  test('rejects when endTime is correct for one service but a second was added', () => {
    const appointment = {
      ...validAppointment,
      startTime: '10:00',
      endTime: '10:30',
      services: [
        { ...validService, serviceId: 1, duration: 30, priceSnapshot: 3500, discountPercent: 0, discountValue: 0, total: 3500 },
        { ...validService, serviceId: 2, duration: 30, priceSnapshot: 4000, discountPercent: 0, discountValue: 0, total: 4000 },
      ]
    }
    const result = appointmentSchema.safeParse(appointment)
    expect(result.success).toBe(false)
    expect(getError(result, 'endTime')).toContain('Время окончания не совпадает с суммой продолжительностей услуг')
  })
})

describe('createClientSchema', () => {
  test('accepts a valid name and phone', () => {
    const result = createClientSchema.safeParse({ name: 'Алия Аскарова', phone: '+7 777 000 00 00' })
    expect(result.success).toBe(true)
  })

  test('rejects name shorter than 2 characters', () => {
    const result = createClientSchema.safeParse({ name: 'А', phone: '+7 777 000 00 00' })
    expect(result.success).toBe(false)
    expect(getError(result, 'name')).toContain('должно содержать минимум 2 символа')
  })

  test('rejects name that is only whitespace', () => {
    const result = createClientSchema.safeParse({ name: '  ', phone: '+7 777 000 00 00' })
    expect(result.success).toBe(false)
    expect(getError(result, 'name')).toContain('должно содержать минимум 2 символа')
  })

  test('rejects an empty phone', () => {
    const result = createClientSchema.safeParse({ name: 'Алия Аскарова', phone: '' })
    expect(result.success).toBe(false)
    expect(getError(result, 'phone')).toContain('Введите номер телефона')
  })

  test('rejects a phone with fewer than 7 digits', () => {
    const result = createClientSchema.safeParse({ name: 'Алия Аскарова', phone: '12345' })
    expect(result.success).toBe(false)
    expect(getError(result, 'phone')).toContain('должен содержать минимум 7 цифр')
  })

  test('rejects a phone with invalid characters', () => {
    const result = createClientSchema.safeParse({ name: 'Алия Аскарова', phone: 'abc-def-ghij' })
    expect(result.success).toBe(false)
    expect(getError(result, 'phone')).toContain('содержит недопустимые символы')
  })
})

describe('createStaffSchema', () => {
  test('accepts a valid name and role', () => {
    const result = createStaffSchema.safeParse({ name: 'Алия Аскарова', role: 'парикмахер' })
    expect(result.success).toBe(true)
  })

  test('rejects name shorter than 2 characters', () => {
    const result = createStaffSchema.safeParse({ name: 'А', role: 'парикмахер' })
    expect(result.success).toBe(false)
    expect(getError(result, 'name')).toContain('должно содержать минимум 2 символа')
  })

  test('rejects role shorter than 2 characters', () => {
    const result = createStaffSchema.safeParse({ name: 'Алия Аскарова', role: 'a' })
    expect(result.success).toBe(false)
    expect(getError(result, 'role')).toContain('должна содержать минимум 2 символа')
  })

  test('rejects role that is only whitespace', () => {
    const result = createStaffSchema.safeParse({ name: 'Алия Аскарова', role: '  ' })
    expect(result.success).toBe(false)
    expect(getError(result, 'role')).toContain('должна содержать минимум 2 символа')
  })

  test('accepts a role that is exactly 2 characters', () => {
    const result = createStaffSchema.safeParse({ name: 'Алия Аскарова', role: 'ИП' })
    expect(result.success).toBe(true)
  })
})