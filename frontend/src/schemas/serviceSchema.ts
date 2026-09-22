import { z } from 'zod/v4'
import { minutesToSeconds } from '../components/services/duration'

const nameField = z.string()
    .trim()
    .min(1, { error: 'Необходимо указать название' })
    .max(200, { error: 'Название слишком длинное' })

const priceField = z.string()
    .trim()
    .regex(/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
        error: 'Некорректный формат цены',
    })
    .transform(val => Number(val).toFixed(2))

const durationField = z.coerce
    .number()
    .int({ error: 'Длительность должна быть целым числом' })
    .positive({ error: 'Длительность должна быть больше 0' })
    .transform(minutesToSeconds)

export const serviceSchema = z.strictObject({
    name: nameField,
    price: priceField,
    duration: durationField
})

export type ServiceFormInput = z.input<typeof serviceSchema>
export type ServiceForm = z.output<typeof serviceSchema>