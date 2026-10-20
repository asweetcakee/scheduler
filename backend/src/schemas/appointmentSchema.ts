import { z } from 'zod/v4'

const idField = z
    .number()
    .int()
    .positive({ error: 'ID должен быть положительным целым числом' })
export type ID = z.infer<typeof idField>

const timeStampField = z.iso
    .datetime({
        offset: true,
        error: 'Некорректный формат ISO 8601/RFC 3339, требуется offset или Z'
    })
export type TimeStampTZ = z.infer<typeof timeStampField>

const durationField = z
    .number()
    .int()
    .positive({ error: 'Длительность должна быть позитивным целым числом' })
    .max(2147483647, { error: 'Длительность превышает допустимое значение' })
export type Duration = z.infer<typeof durationField>

const priceField = z
    .string()
    .trim()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
        error: 'Цена должна быть неотрицательным числом до двух знаков после точки: 3500 или 3500.50',
    })
export type Price = z.infer<typeof priceField>

export const createAppointmentBodySchema = z.strictObject({
    client_id: idField,
    master_id: idField,
    service_id: idField,
    starts_at: timeStampField,
    duration: durationField,
    price: priceField
})
export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>