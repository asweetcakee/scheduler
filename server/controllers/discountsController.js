const discountRepository = require('../repositories/discountRepository')
const clientRepository = require('../repositories/clientRepository')

const getAllDiscounts = (req, res) => {
  try {
    const discounts = discountRepository.queryDiscounts()
    res.status(200).json(discounts)
  } catch (error) {
    console.error('Error fetching client discounts: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client discounts' })
  }
}

const getClientDiscounts = (req, res) => {
  const { id: clientId } = req.params
  try {
    const client = clientRepository.queryClientById(clientId)
    if (!client) return res.status(404).json({ error: 'Client not found' })
    const discounts = discountRepository.queryDiscountsByClientId(clientId)
    res.status(200).json(discounts)
  } catch (error) {
    console.error('Error fetching client discounts: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client discounts' })
  }
}

const createClientDiscount = (req, res) => {
  const { id: clientId } = req.params
  const { serviceId, discountPercent } = req.body
  try {
    const result = discountRepository.insertDiscount(clientId, serviceId, discountPercent)
    res.status(201).json({ id: result.lastInsertRowid, clientId, serviceId, discountPercent })
  } catch (error) {
    if (error.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'Discount must be between 0 and 100' })
    }
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

const updateClientDiscount = (req, res) => {
  const { id: clientId, serviceId } = req.params
  const { discountPercent } = req.body
  try {
    const result = discountRepository.updateDiscount(clientId, serviceId, discountPercent)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Discount record not found for this client and service' })
    }
    res.status(200).json({ message: 'Discount updated successfully', clientId, serviceId, discountPercent })
  } catch (error) {
    if (error.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'Discount must be between 0 and 100' })
    }
    console.error('Error updating discount percent: ', error?.message)
    res.status(500).json({ error: 'Failed to update discount percent' })
  }
}

const deleteClientDiscount = (req, res) => {
  const { id: clientId, serviceId } = req.params
  try {
    const result = discountRepository.deleteDiscount(clientId, serviceId)
    if (result.changes === 0) return res.status(404).json({ error: 'Discount not found' })
    res.status(200).json({ message: 'Discount deleted successfully' })
  } catch (error) {
    console.error('Error deleting a discount: ', error?.message)
    res.status(500).json({ error: 'Failed to delete a discount' })
  }
}

module.exports = {
  getAllDiscounts,
  getClientDiscounts,
  createClientDiscount,
  updateClientDiscount,
  deleteClientDiscount
}