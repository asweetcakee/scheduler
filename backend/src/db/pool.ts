import { Pool, types } from 'pg'
import { env } from '../config/env.js'

types.setTypeParser(20, (val) => Number(val)) // converts BIGINT into Number

export const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
})