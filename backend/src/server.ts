import app from './app.js'
import { env } from './config/env.js'
import { pool } from './db/pool.js'

const startServer = async (): Promise<void> => {
    try {
        await pool.query('SELECT 1')
        console.log('Database connection successful')
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`)
        })
    } catch (error) {
        console.error('Failed to connect to database:', error)
        process.exit(1)
    }
}

startServer()