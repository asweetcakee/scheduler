import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { isUniqueViolation } from '../../errors/pgErrorCodes.js'
import type { UpdateClientInput } from '../../schemas/clientSchema.js'

type ClientRow = {
    id: number,
    name: string,
    phone: string,
    note: string | null
}

export const create = async (
    name: string,
    phone: string,
    note: string | null
): Promise<ClientRow> => {
    try {
        const result = await pool.query<ClientRow>(
            `
            INSERT INTO clients (name, phone, note)
            VALUES ($1, $2, $3)
            RETURNING id, name, phone, note
            `, [name, phone, note]
        )

        const row = result.rows[0]
        if (!row) {
            throw new Error ('Insert did not return a row')
        }
        return row
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Client with this phone already exists')
        }
        throw error
    }
}

export const findById = async (id: number): Promise<ClientRow | null> => {
    const result = await pool.query<ClientRow>(
        `
        SELECT id, name, phone, note 
        FROM clients
        WHERE id = $1
        `, [id]
    )

    return result.rows[0] ?? null
}

export const findByPhone = async (phone: string): Promise<ClientRow | null> => {
    const result = await pool.query<ClientRow>(
        `
        SELECT id, name, phone, note
        FROM clients
        WHERE phone = $1
        `, [phone]
    )

    return result.rows[0] ?? null
}

export const findClients = async (): Promise<ClientRow[]> => {
    const result = await pool.query<ClientRow>(
        `
        SELECT id, name, phone, note
        FROM clients
        `
    )

    return result.rows
}

export const update = async (
    id: number,
    data: UpdateClientInput
): Promise<ClientRow | null> => {
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

        if (data.note !== undefined) {
            fields.push(`note = $${fields.length + 1}`)
            values.push(data.note)
        }

        values.push(id)

        const idPlaceholder = values.length
        const result = await pool.query<ClientRow>(
            `
            UPDATE clients
            SET ${fields.join(', ')}
            WHERE id = $${idPlaceholder}
            RETURNING id, name, phone, note
            `, values
        )

        return result.rows[0] ?? null
    } catch (error) {
        if (isUniqueViolation(error)) {
            throw new ConflictError('Client with this phone already exists')
        }
        throw error
    }
}

export const remove = async (id: number): Promise<boolean> => {
    const result = await pool.query(
        `
        DELETE FROM clients
        WHERE id = $1
        `,
        [id]
    )
    return (result.rowCount ?? 0) > 0
}