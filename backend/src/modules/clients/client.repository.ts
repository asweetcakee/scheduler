import { pool } from '../../db/pool.js'

type ClientRow = {
    id: number,
    name: string,
    phone: string,
    note: string | null
}

export const findById = async (id: number): Promise<ClientRow | null> => {
    const result = await pool.query<ClientRow>(
        `
        SELECT id, name, phone, note 
        FROM clients
        WHERE id = $1
        `, [id]
    )

    const row = result.rows[0]
    if (!row) return null
    
    return {
        ...row,
        id: Number(row.id)
    }
}