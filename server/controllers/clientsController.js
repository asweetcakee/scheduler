const clientRepository = require('../repositories/clientRepository')

const getAllClients = (req, res) => {
  try {
    const clients = clientRepository.queryClients()
    res.status(200).json(clients)
  } catch (error) {
    console.error('Error fetching clients: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
}

const getClientById = (req, res) => {
  const { id } = req.params
  try {
    const client = clientRepository.queryClientById(id)
    if (!client) return res.status(404).json({ message: 'Client not found' })
    const discounts = queryDiscountsByClientId(id)
    res.status(200).json({ ...client, discounts })
  } catch (error) {
    console.error('Error fetching client: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

const searchClientByPhone = (req, res) => {
  const { phone } = req.query // ?phone=77071234567  
  try {
    const client = clientRepository.queryClientByPhone(phone)
    if (!client) return res.status(404).json({ message: 'Client not found' })
    res.status(200).json(client)
  } catch (error) {
    console.error('Error fetching client: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

// If name isn't provided generate it by adding last 4 digits of phone number: Клиент-4567
const createClient = (req, res) => {
  const { phone } = req.body
  const name = req.body.name || `Клиент-${phone.slice(-4)}`
  const isRegular = req.body.isRegular ? 1 : 0
  const isAllergic = req.body.isAllergic ? 1 : 0
  try {
    const result = clientRepository.insertClient(name, phone, isRegular, isAllergic)
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

const updateClient = (req, res) => {
  const { id } = req.params
  const { name, phone, isRegular, isAllergic } = req.body
  try {
    const result = clientRepository.updateClient(name, phone, isRegular, isAllergic, id)    
    if (result.changes === 0) return res.status(404).json({ message: 'Client not found' })
    res.status(200).json({ 
      message: 'Client updated successfully',
      id, name, phone, isRegular, isAllergic
    })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: clients.phone')) {
      return res.status(409).json({ error: 'A client with this phone number already exists' })
    }
    console.error('Error updating a client: ', error?.message)
    res.status(500).json({ error: 'Failed to update a client' })
  }
}

const deleteClient = (req, res) => {
  const { id } = req.params
  try {
    const result = clientRepository.deleteClient(id)
    if(result.changes === 0) return res.status(404).json({ message: 'Client not found' })
    res.status(200).json({ message: 'Client deleted successfully' })
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
