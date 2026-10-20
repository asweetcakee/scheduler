import type { PoolClient } from 'pg'
import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { isCheckViolation, isInvalidTextRepresentation, isUniqueViolation } from '../../errors/pgErrorCodes.js'
import { UnprocessableEntityError } from '../../errors/UnprocessableEntityError.js'
import type { ID, ServiceName, UpdateServiceInput } from '../../schemas/serviceSchema.js'
import type { Duration, Price } from '../../schemas/appointmentSchema.js'

type ServiceRow = {
    id: number,
    name: string,
    price: string,
    duration: number
}

export const create = async(
    name: string,
    price: string,
    duration: number
): Promise<ServiceRow> => {
    try {
        const result = await pool.query<ServiceRow>(
            `
            INSERT INTO services (name, price, duration)
            VALUES ($1, $2, $3)
            RETURNING id, name, price, duration
            `, [name, price, duration]
        )
        const row = result.rows[0]
        if (!row) {
            throw new Error('Insert did not return a row')
        }
        return row
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Service with this name already exists')
        }
        if (isCheckViolation(error)) {
            throw new UnprocessableEntityError('Price must be non-negative and duration must be positive')
        }
        if (isInvalidTextRepresentation(error)) {
            throw new UnprocessableEntityError('Invalid price or duration format')
        }
        throw error
    }
}

export const findAll = async(): Promise<ServiceRow[]> => {
    const result = await pool.query<ServiceRow>(
        `
        SELECT id, name, price, duration
        FROM services
        ORDER BY id
        `
    )
    return result.rows
}

export const findById = async(id: number): Promise<ServiceRow | null> => {
    const result = await pool.query<ServiceRow>(
        `
        SELECT id, name, price, duration
        FROM services
        WHERE id = $1
        `, [id]
    )
    return result.rows[0] ?? null
}

export type ServiceForBooking = {
    name: ServiceName,
    price: Price,
    duration: Duration
}

export const findServiceByIdForBooking = async (client: PoolClient, id: ID): Promise<ServiceForBooking | null> => {
    const result = await client.query<ServiceForBooking>(
        `
        SELECT name, price, duration
        FROM services
        WHERE id = $1
        `, [id]
    )
    return result.rows[0] ?? null
}

export const update = async(
    id: number, 
    data: UpdateServiceInput
): Promise<ServiceRow | null> => {
    try {
        const fields: string[] = []
        const values: unknown[] = []

        if (data.name !== undefined) {
            fields.push(`name = $${fields.length + 1}`)
            values.push(data.name)
        }

        if (data.price !== undefined) {
            fields.push(`price = $${fields.length + 1}`)
            values.push(data.price)
        }

        if (data.duration !== undefined) {
            fields.push(`duration = $${fields.length + 1}`)
            values.push(data.duration)
        }

        values.push(id)

        const result = await pool.query<ServiceRow>(
            `
            UPDATE services
            SET ${fields.join(', ')}
            WHERE id = $${values.length}
            RETURNING id, name, price, duration
            `, values
        )
        return result.rows[0] ?? null
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Service with this name already exists')
        }
        if (isCheckViolation(error)) {
            throw new UnprocessableEntityError('Price must be non-negative and duration must be positive')
        }
        if (isInvalidTextRepresentation(error)) {
            throw new UnprocessableEntityError('Invalid price or duration format')
        }
        throw error
    }
}

export const remove = async(id: number): Promise<boolean> => {
    const result = await pool.query(
        `
        DELETE FROM services
        WHERE id = $1
        `, [id]
    )
    return (result.rowCount ?? 0) > 0
}