import { z } from 'zod'

const masterDateTimeSchema = z.object({
  staffId: z.coerce
    .number({ required_error: 'Пожалуйста, выберите мастера' })
    .int()
    .positive('Пожалуйста, выберите мастера'),

  date: z.string()
    .min(1, 'Пожалуйста, выберите дату')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате ГГГГ-ММ-ДД'),

  startTime: z.string()
    .min(1, 'Пожалуйста, выберите время начала')
    .regex(/^\d{2}:\d{2}$/, 'Время должно быть в формате ЧЧ:ММ'),

  // read-only, calculated from startTime + services duration,
  // but we validate it here to ensure the logic in the modal is correct before submission
  // if it's empty, it means services haven't been selected yet
  endTime: z.string()
    .min(1, 'Время окончания не может быть вычеслено, пожалуйста, выберите хотя бы одну услугу')
    .regex(/^\d{2}:\d{2}$/, 'Неверный формат времени окончания, должно быть ЧЧ:ММ'),
})

const clientInfoSchema = z.object({
  // clientId is null for new clients created mid-flow, but if provided it must be a positive integer
  // nullable + optional because user may create a new client
  // and the ID arrives async after CreateClientModal resolves
  clientId: z.number().int().positive().nullable().optional(),

  clientName: z.string()
    .min(1, 'Необходимо указать имя клиента')
    .max(100),

  clientPhone: z.string()
    .min(1, 'Phone number is required')
    // Flexible — supports +7 (777) 000-00-00 and other formats
    .regex(/^[\d\s+\-()]{7,20}$/, 'Enter a valid phone number'),
})

const serviceRowSchema = z.object({
  serviceId: z.coerce
    .number({ required_error: 'Пожалуйста, выберите услугу' })
    .int()
    .positive('Пожалуйста, выберите услугу'),

  duration: z.coerce
    .number()
    .int()
    .min(1, 'Продолжительность услуги должна быть не менее 1 минуты'),

  priceSnapshot: z.coerce
    .number()
    .min(0, 'Цена не может быть отрицательной'),

  // discountPercent fetched from client pricing context, stored as snapshot
  discountPercent: z.coerce
    .number()
    .min(0)
    .max(100),

  // discountValue and total computed in modal and recomputed in backend
  // We validate them here so backend receives clean data
  discountValue: z.coerce
    .number()
    .min(0),

  total: z.coerce
    .number()
    .min(0),
})

// total must equal priceSnapshot - discountValue, we add a custom refinement for this
  .refine(
    (row) => Math.abs(row.total - (row.priceSnapshot - row.discountValue)) < 0.01,
    { message: 'Итоговая стоимость не совпадает с расчетной', path: ['total'] }
  )

  .refine(
    (row) => Math.abs(row.discountValue - (row.priceSnapshot * row.discountPercent / 100)) < 0.01,
    { message: 'Значение скидки не соответствует вычисленному проценту', path: ['discountValue'] }
  )

const serviceSchema = z.object({
  services: z.array(serviceRowSchema)
    .min(1, 'Пожалуйста, выберите хотя бы одну услугу')
})

const notificationSchema = z.object({
  notificationSettings: z.object({
    // Reminder 1 pre-appointment, sent to client and/or staff
    remindClient: z.boolean(),
    remindStaff: z.boolean(),
    remindBeforeMinutes: z.coerce
      .number()
      .int()
      .min(45, 'Напоминание должно быть установлено минимум за 45 минут до начала')
      .max(1440, 'Напоминание должно быть установлено максимум за 24 часа (1440 минут) до начала'),

    // Reminder 2 post-appointment review request, client only
    requestReview: z.boolean(),
    reviewAfterMinutes: z.coerce
      .number()
      .int()
      .min(60, 'Запрос отзыва должен быть установлен минимум через час после окончания')
      .max(10080, 'Запрос отзыва должен быть установлен максимум через неделю (10080 минут) после окончания'),
  })
    .refine(
      (n) => !n.remindClient && !n.remindStaff || n.remindBeforeMinutes >= 45,
      { message: 'Напоминание должно быть установлено минимум за 45 минут до начала', path: ['remindBeforeMinutes'] }
    )
    .refine(
      (n) => !n.requestReview || n.reviewAfterMinutes >= 60,
      { message: 'Запрос отзыва должен быть установлен минимум через час после окончания', path: ['reviewAfterMinutes'] }
    )
})

const appointmentMetaSchema = z.object({
  appointmentStatus: z.enum(
    ['scheduled', 'completed', 'canceled'],
    { errorMap: () => ({ message: 'Неверный статус записи' }) }
  ),

  adminNotes: z.string()
    .max(1000, 'Административные заметки не могут превышать 1000 символов')
    .optional(),

  appointmentColor: z.string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Цвет должен быть в формате HEX, например #ff0000')
})

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Введите имя мастера').max(100),
  role: z.string().min(5, 'Введите должность мастера').max(100)
})

export const createClientSchema = z.object({
  name: z.string().min(2, 'Введите имя клиента').max(100),
  phone: z.string()
    .min(1, 'Введите номер телефона')
    .regex(/^[\d\s+\-()]{7,20}$/, 'Введите корректный номер'),
})

export const appointmentSchema = masterDateTimeSchema
  .merge(clientInfoSchema)
  .merge(serviceSchema)
  .merge(notificationSchema)
  .merge(appointmentMetaSchema)

