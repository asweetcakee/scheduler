const db = require('../db')

const getAllClients = (req, res) => {
  try {
    const clients = db.prepare(`SELECT * FROM clients`).all()
    res.status(200).json(clients)
  } catch (error) {
    console.error('Error fetching clients: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
}

const getClientById = (req, res) => {
  const { id } = req.params
  try {
    const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(id)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  } catch (error) {
    console.error('Error fetching client: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const searchClientByPhone = (req, res) => {
  const { phone } = req.query // ?phone=77071234567
  
  if (!phone) return res
      .status(400).json({ 
          error: 'Phone parameter is required. Use ?phone=77071234567'
      })
  
  try {
    const client = db.prepare(`SELECT * FROM clients WHERE phone = ?`).get(phone)
    if (client) {
      res.status(200).json(client)
    } else {
      res.status(404).json({ message: "Client not found" })
    }
  } catch (error) {
    console.error('Error fetching client: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

// TODO: validate data with ZOD schema before inserting it
// If name isn't provided generate it by adding last 4 digits of phone number: Клиент-4567
const createClient = (req, res) => {
  const { phone } = req.body
  const name = req.body.name || `Клиент-${phone.slice(-4)}`

  if (!phone || phone.length < 7 || phone.length > 15) {
    return res.status(400).json({ error: 'Phone is required and must be between 7 and 15 digits' })
  }

  const isRegular = req.body.isRegular ? 1 : 0
  const isAllergic = req.body.isAllergic ? 1 : 0
  try {
    const result = db.prepare(
      `INSERT INTO clients(name, phone, isRegular, isAllergic) VALUES (?, ?, ?, ?)`
    ).run(name, phone, isRegular, isAllergic)

    res.status(201).json({
      id: result.lastInsertRowid,
      name, phone, isRegular, isAllergic
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: clients.phone')) {
      return res.status(409).json({ error: 'A client with this phone number already exists' })
    }
    console.error('Error creating a client: ', error?.message)
    res.status(500).json({ error: 'Failed to create a client' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const updateClient = (req, res) => {
  const { id } = req.params
  const { name, phone, isRegular, isAllergic } = req.body
  try {
    const result = db.prepare(
      `UPDATE clients
      SET name = ?, phone = ?, isRegular = ?, isAllergic = ?
      WHERE id = ?`
    ).run(name, phone, isRegular, isAllergic, id)
    
    if (result.changes > 0) {
      res.status(200).json({ 
        message: 'Client updated successfully',
        id, name, phone, isRegular, isAllergic
      })
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  } catch (error) {
    console.error('Error updating a client: ', error?.message)
    res.status(500).json({ error: 'Failed to update a client' })
  }
}

const deleteClient = (req, res) => {
  const { id } = req.params
  try {
    const result = db.prepare(`DELETE FROM clients WHERE id = ?`).run(id)
    if(result.changes > 0) {
      res.status(200).json({ message: 'Client deleted successfully' })
    } else {
      res.status(404).json({ message: 'Client not found' })
    }
  } catch (error) {
    console.error('Error deleting a client: ', error?.message)
    res.status(500).json({ error: 'Failed to delete a client' })
  }
}

module.exports = {
  getAllClients,
  getClientById,
  searchClientByPhone,
  createClient,
  updateClient,
  deleteClient
}
