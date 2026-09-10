import 'dotenv/config'

const PORT = Number(process.env.PORT ?? 3000)

const DB_HOST = process.env.DB_HOST ?? 'localhost'
const DB_PORT = Number(process.env.DB_PORT ?? 5432)
const DB_NAME = process.env.DB_NAME ?? 'salon_crm'
const DB_USER = process.env.DB_USER ?? 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD ?? ''

export const env = {
    PORT,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
}
