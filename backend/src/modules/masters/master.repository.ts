import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { isUniqueViolation } from '../../errors/isUniqueViolation.js'

type MasterRow = {
    id: number,
    name: string,
    phone: string,
    active: boolean
}
export const create = async (
    name: string,
    phone: string,
    active?: boolean
): Promise<MasterRow> => {
    try {
        const result = await pool.query<MasterRow>(
            `
            INSERT INTO masters (name, phone, active)
            VALUES ($1, $2, COALESCE($3, true))
            RETURNING id, name, phone, active
            `, [name, phone, active]
        )
        const row = result.rows[0]
        if (!row) {
            throw new Error('Insert did not return a row')
        }
        return row
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Master with this phone already exists')
        }
        throw error
    }
}

export const findMasters = async (): Promise<MasterRow[]> => {
    try {
        const result = await pool.query<MasterRow>(
            `
            SELECT id, name, phone, active
            FROM masters
            `
        )
        return result.rows
    } catch (error) {
        throw error
    }
}