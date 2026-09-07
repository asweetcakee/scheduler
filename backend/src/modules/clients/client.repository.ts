import { pool } from '../../db/pool.js'
import { ConflictError } from '../../errors/ConflictError.js'
import { isUniqueViolation } from '../../errors/isUniqueViolation.js'

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