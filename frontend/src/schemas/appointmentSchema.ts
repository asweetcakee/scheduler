import { z } from 'zod/v4'

const idParam = z
    .coerce
    .number()
    .int()
    .positive({ error: 'ID должен быть положительным целым числом' })
export type ID = z.infer<typeof idParam>

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