import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { isUniqueViolation } from '../../errors/isUniqueViolation.js'
import type { UpdateMasterInput } from '../../schemas/masterSchema.js'

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
    const result = await pool.query<MasterRow>(
        `
        SELECT id, name, phone, active
        FROM masters
        `
    )
    return result.rows
}

export const findMasterById = async (id: number): Promise<MasterRow | null> => {
    const result = await pool.query<MasterRow>(
        `
        SELECT id, name, phone, active
        FROM masters
        WHERE id = $1
        `, [id]
    )
    return result.rows[0] ?? null
}

export const update = async (
    id: number,
    data: UpdateMasterInput
): Promise<MasterRow | null> => {
    try {
        const fields: string[] = []
        const values: unknown[] = []
        
        if (data.name !== undefined) {
            fields.push(`name = $${fields.length + 1}`)
            values.push(data.name)
        }

        if (data.phone !== undefined) {
            fields.push(`phone = $${fields.length + 1}`)
            values.push(data.phone)
        }

        if (data.active !== undefined) {
            fields.push(`active = $${fields.length + 1}`)
            values.push(data.active)
        }

        values.push(id)

        const result = await pool.query<MasterRow>(
            `
            UPDATE masters
            SET ${fields.join(', ')}
            WHERE id = $${values.length}
            RETURNING id, name, phone, active
            `, values
        )
        return result.rows[0] ?? null
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Master with this phone already exists')
        }
        throw error
    }
}

export const remove = async (id: number): Promise<boolean> => {
    const result = await pool.query<MasterRow>(
        `
        DELETE FROM masters
        WHERE id = $1
        `, [id]
    )
    return (result.rowCount ?? 0) > 0
}