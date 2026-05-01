import { z } from 'zod'
import { isValid, parse, isAfter, isBefore, startOfToday, addMinutes, format } from 'date-fns'

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  ROLE_MIN: 2,
  ROLE_MAX: 100,
  PHONE_MIN_DIGITS: 7,
  PHONE_MAX_CHARS: 20,
  NOTES_MAX: 1000,
  SERVICES_MAX: 10,
 
  DURATION_MIN_MINUTES: 5,
  DURATION_MAX_MINUTES: 720,
 
  PRICE_MIN: 0,
  PRICE_MAX: 10_000_000,
 
  REMIND_BEFORE_MIN: 45,         // minutes
  REMIND_BEFORE_MAX: 1440,       // 24 hours
  REVIEW_AFTER_MIN: 30,          // minutes
  REVIEW_AFTER_MAX: 10_080,      // 1 week
 
  FLOAT_TOLERANCE: 0.01,
}

// validates in yyyy-MM-dd format
// rejects impossible dates like 2026-13-99
const calendarDateString = z
  .string()
  .min(1, 'Пожалуйста, выберите дату')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты')
  .refine((val) => {
    const date = parse(val, 'yyyy-MM-dd', new Date())
    return isValid(date)
  }, 'Указана несуществующая дата (например, 30 февраля)')

// validates time in HH:MM format
// rejects impossible values like 25:99
const wallClockTimeString = (fieldLabel) =>
  z
    .string()
    .min(1, `Пожалуйста, выберите ${fieldLabel}`)
    .regex(/^\d{2}:\d{2}$/, `${fieldLabel} должно быть в формате ЧЧ:ММ`)
    .refine((val) => {
      const [h, m] = val.split(':').map(Number)
      return h >= 0 && h <= 23 && m >= 0 && m <= 59
    }, `Недопустимое значение времени для поля "${fieldLabel}"`)

// validates phone numbers with optional +, spaces, dashes, and parentheses
// ensures at least 7 digits and no more than 20 total chars 
// examples of valid formats: '+7 (777) 000-00-00', '8 800 555 35 35', '+1-202-555-0125', '87071234567'
const phoneString = z
  .string()
  .min(1, 'Введите номер телефона')
  .max(LIMITS.PHONE_MAX_CHARS, `Номер телефона не может превышать ${LIMITS.PHONE_MAX_CHARS} символов`)
  .regex(
    /^[\d\s+\-()]+$/,
    'Номер телефона содержит недопустимые символы'
  )
  .refine(
    (val) => val.replace(/\D/g, '').length >= LIMITS.PHONE_MIN_DIGITS,
    `Номер телефона должен содержать минимум ${LIMITS.PHONE_MIN_DIGITS} цифр`
  )

const moneyAmount = z
  .number({ error: 'Ожидается числовое значение' })
  .min(LIMITS.PRICE_MIN, 'Сумма не может быть отрицательной')
  .max(LIMITS.PRICE_MAX, `Сумма не может превышать ${LIMITS.PRICE_MAX.toLocaleString()}`)

const masterDateTimeSchema = z.object({
  staffId: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? 'Пожалуйста, выберите мастера'
          : 'Некорректный идентификатор мастера',
    })
    .int('Пожалуйста, выберите мастера')
    .positive('Пожалуйста, выберите мастера'),
 
  date: calendarDateString.refine((val) => {
    const selectedDate = parse(val, 'yyyy-MM-dd', new Date())
    const today = startOfToday()
    return !isBefore(selectedDate, today)
  }, 'Нельзя создать запись на прошедшую дату'),
 
  startTime: wallClockTimeString('время начала'),
 
  // endTime is read-only / computed. Still validated so the server rejects tampered payloads
  // The cross-field check that endTime === startTime + Σ(durations) lives on the merged appointmentSchema
  // midnight-crossing appointments (e.g. 23:00 + 90min = 00:30) are not supported
  endTime: wallClockTimeString('время окончания'),
})

const clientInfoSchema = z.object({
  // nullable + optional: populated async after CreateClientModal resolves for new clients 
  // existing clients always supply a valid positive integer
  clientId: z.number().int().positive().nullable().optional(),
 
  clientName: z
    .string()
    .trim()
    .min(1, 'Необходимо указать имя клиента')
    .max(LIMITS.NAME_MAX, `Имя клиента не может превышать ${LIMITS.NAME_MAX} символов`),
    
 
  clientPhone: phoneString,
})

const serviceRowSchema = z
  .object({
    serviceId: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? 'Пожалуйста, выберите услугу'
            : 'Некорректный идентификатор услуги',
      })
      .int('Пожалуйста, выберите услугу')
      .positive('Пожалуйста, выберите услугу'),
 
    duration: z
      .number({ error: 'Продолжительность должна быть числом' })
      .int()
      .min(LIMITS.DURATION_MIN_MINUTES, `Продолжительность услуги должна быть не менее ${LIMITS.DURATION_MIN_MINUTES} минуты`)
      .max(LIMITS.DURATION_MAX_MINUTES, `Продолжительность услуги не может превышать ${LIMITS.DURATION_MAX_MINUTES} минут`),
 
    priceSnapshot: moneyAmount,
 
    // Fetched from client pricing context, stored as snapshot at booking time
    discountPercent: z
      .number({ error: 'Скидка должна быть числом' })
      .min(0, 'Скидка не может быть отрицательной')
      .max(100, 'Скидка не может превышать 100%'),
 
    discountValue: moneyAmount,
 
    total: moneyAmount,
  })
  // Cross-field: discountValue must match the computed percentage
  .refine(
    (row) =>
      Math.abs(row.discountValue - (row.priceSnapshot * row.discountPercent) / 100) <
      LIMITS.FLOAT_TOLERANCE,
    { message: 'Значение скидки не соответствует вычисленному проценту', path: ['discountValue'] }
  )
  // Cross-field: total must equal price minus discount
  .refine(
    (row) =>
      Math.abs(row.total - (row.priceSnapshot - row.discountValue)) < LIMITS.FLOAT_TOLERANCE,
    { message: 'Итоговая стоимость не совпадает с расчётной', path: ['total'] }
  )

  const serviceSchema = z.object({
  services: z
    .array(serviceRowSchema)
    .min(1, 'Пожалуйста, выберите хотя бы одну услугу')
    .max(LIMITS.SERVICES_MAX, `Нельзя добавить более ${LIMITS.SERVICES_MAX} услуг в одну запись`),
})

const notificationSchema = z.object({
  notificationSettings: z
    .object({
      remindClient: z.boolean(),
      remindStaff: z.boolean(),
 
      // Validated conditionally below - field-level .min/.max would reject
      // valid values when the reminder flags are both false
      remindBeforeMinutes: z
        .number({ error: 'Укажите время напоминания в минутах' })
        .int(),
 
      requestReview: z.boolean(),
 
      reviewAfterMinutes: z
        .number({ error: 'Укажите время запроса отзыва в минутах' })
        .int(),
    })
    // remindBeforeMinutes is only meaningful when at least one remind flag is on
    .refine(
      (n) =>
        (!n.remindClient && !n.remindStaff) ||
        (n.remindBeforeMinutes >= LIMITS.REMIND_BEFORE_MIN &&
          n.remindBeforeMinutes <= LIMITS.REMIND_BEFORE_MAX),
      {
        message: `Напоминание должно быть в пределах ${LIMITS.REMIND_BEFORE_MIN}-${LIMITS.REMIND_BEFORE_MAX} минут до начала`,
        path: ['remindBeforeMinutes'],
      }
    )
    // reviewAfterMinutes is only meaningful when requestReview is on
    .refine(
      (n) =>
        !n.requestReview ||
        (n.reviewAfterMinutes >= LIMITS.REVIEW_AFTER_MIN &&
          n.reviewAfterMinutes <= LIMITS.REVIEW_AFTER_MAX),
      {
        message: `Запрос отзыва должен быть через ${LIMITS.REVIEW_AFTER_MIN}-${LIMITS.REVIEW_AFTER_MAX} минут после окончания`,
        path: ['reviewAfterMinutes'],
      }
    ),
})

const appointmentMetaSchema = z.object({
  appointmentStatus: z.enum(['scheduled', 'completed', 'canceled'], {
    error: () => 'Неверный статус записи',
  }),
 
  adminNotes: z
    .string()
    .trim()
    .max(LIMITS.NOTES_MAX, `Заметки не могут превышать ${LIMITS.NOTES_MAX} символов`)
    .optional(),
 
  // Optional - appointments may have no colour tag
  appointmentColor: z
    .string()
    .regex(
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      'Цвет должен быть в формате HEX, например #ff0000 или #f00'
    )
    .nullable()
    .optional(),
})

export const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.NAME_MIN, `Имя мастера должно содержать минимум ${LIMITS.NAME_MIN} символа`)
    .max(LIMITS.NAME_MAX),
 
  role: z
    .string()
    .trim()
    .min(LIMITS.ROLE_MIN, `Должность должна содержать минимум ${LIMITS.ROLE_MIN} символа`) // 2, not 5
    .max(LIMITS.ROLE_MAX),
})
 
export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(LIMITS.NAME_MIN, `Имя клиента должно содержать минимум ${LIMITS.NAME_MIN} символа`)
    .max(LIMITS.NAME_MAX),
 
  phone: phoneString,
})

export const appointmentSchema = masterDateTimeSchema
  .merge(clientInfoSchema)
  .merge(serviceSchema)
  .merge(notificationSchema)
  .merge(appointmentMetaSchema)
 
  // 1. endTime must be strictly after startTime (catches midnight-wrap mistakes)
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      const [sh, sm] = data.startTime.split(':').map(Number)
      const [eh, em] = data.endTime.split(':').map(Number)
      const base = new Date()
      const start = new Date(base.setHours(sh, sm, 0, 0))
      const end = new Date(new Date().setHours(eh, em, 0, 0))
      return isAfter(end, start)
    },
    { message: 'Время окончания должно быть позже времени начала', path: ['endTime'] }
  )
 
  // 2. endTime must equal startTime + Σ(service durations)
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      const totalDuration = data.services.reduce((sum, s) => sum + s.duration, 0)
      const [sh, sm] = data.startTime.split(':').map(Number)
      const startDate = new Date(new Date().setHours(sh, sm, 0, 0))
      const expectedEnd = addMinutes(startDate, totalDuration)
      const expectedEndStr = format(expectedEnd, 'HH:mm')
      return data.endTime === expectedEndStr
    },
    {
      message: 'Время окончания не совпадает с суммой продолжительностей услуг',
      path: ['endTime'],
    }
  )