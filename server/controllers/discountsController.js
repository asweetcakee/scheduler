const db = require('../db')

const getAllDiscounts = (req, res) => {
  try {
    const discounts = db.prepare(`SELECT * FROM client_discounts`).all()
    res.status(200).json(discounts)
  } catch (error) {
    console.error('Error fetching client discounts: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client discounts' })
  }
}

const getClientDiscounts = (req, res) => {
  const clientId = Number(req.params.id)
  try {
    const discounts = db.prepare(`SELECT * FROM client_discounts WHERE clientId = ?`).all(clientId)
    res.status(200).json(discounts)
  } catch (error) {
    console.error('Error fetching client discounts: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client discounts' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const createClientDiscount = (req, res) => {
  const clientId = Number(req.params.id)
  const { serviceId } = req.body
  const discountPercent = req.body.discountPercent ?? 0

  if (!clientId || !serviceId) {
    return res.status(400).json({ error: 'clientId and serviceId are required' })
  }

  try {
    const result = db.prepare(`INSERT INTO client_discounts (clientId, serviceId, discountPercent) VALUES (?, ?, ?)`).run(
      clientId, serviceId, discountPercent
    )
    res.status(201).json({ id: result.lastInsertRowid, clientId, serviceId, discountPercent })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Same service can not be assigned to the same client' })
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ error: 'Invalid clientId or serviceId' })
    }
    console.error('Error creating a client discount: ', error?.message)
    
    res.status(500).json({ error: 'Failed to create a client discount' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const updateClientDiscount = (req, res) => {
  const clientId = Number(req.params.id)
  const serviceId = Number(req.params.serviceId)
  const { discountPercent } = req.body

  if (discountPercent === undefined || discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ error: 'Valid discountPercent (0-100) is required' })
  }

  try {
    const result = db.prepare(
      `UPDATE client_discounts 
      SET discountPercent = ? 
      WHERE clientId = ? AND serviceId = ?`
    ).run(discountPercent, clientId, serviceId)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Discount record not found this client and service' })
    }
    res.status(200).json({ message: 'Discount updated successfully' })
  } catch (error) {
    if (error.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'Discount must be between 0 and 100' })
    }
    console.error('Error updating discount percent: ', error?.message)
    res.status(500).json({ error: 'Failed to update discount percent' })
  }
}

const deleteClientDiscount = (req, res) => {
  const clientId = Number(req.params.id)
  const serviceId = Number(req.params.serviceId)
  try {
    const result = db.prepare(`DELETE FROM client_discounts WHERE clientId = ? AND serviceId = ?`).run(clientId, serviceId)
    if (result.changes === 0) return res.status(404).json({ error: 'Discount not found' })
    res.status(200).json({ message: 'Discount deleted successfully' })
  } catch (error) {
    console.error('Error deleting a row: ', error?.message)
    res.status(500).json({ error: 'Failed to delete a row' })
  }
}

module.exports = {
  getAllDiscounts,
  getClientDiscounts,
  createClientDiscount,
  updateClientDiscount,
  deleteClientDiscount
}