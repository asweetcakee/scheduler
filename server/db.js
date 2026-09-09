const Database = require('better-sqlite3')
const fs = require('node:fs')
const path = require('path')

const db = new Database('scheduler-salon.db', { verbose: console.log })

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

try {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')

  db.exec(schema)
  console.log('Database initialized successfully.')
} catch (error) {
  console.error('Failed to initialize database: ', error.message)
  process.exit(1)
}

module.exports = db
