import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { isUniqueViolation } from '../../errors/isUniqueViolation.js'

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
        throw error
    }
}