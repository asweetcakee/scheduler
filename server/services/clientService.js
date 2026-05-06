const db = require('../db')

const getAllClients = () => {
  const statement = db.prepare('SELECT * FROM clients')
  return statement.all()
}

const createClient = (name, phone) => {
  const statement = db.prepare('INSERT INTO clients (name, phone) VALUES (?, ?)')
  return statement.run(name, phone)
}

module.exports = { getAllClients, createClient }