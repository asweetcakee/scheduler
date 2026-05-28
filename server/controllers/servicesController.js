const serviceRepository = require('../repositories/serviceRepository')
const { toTiyins } = require('../utils/currency')

const getAllServices = (req, res) => {
  try {
    const services = serviceRepository.queryServices()
    res.status(200).json(services)
  } catch (error) {
    console.error('Error fetching services: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch services' })
  }
}

const getServiceById = (req, res) => {
  const { id } = req.params
  try {
    const service = serviceRepository.queryServiceById(id)
    if(!service) return res.status(404).json({ message: 'Service not found' })
    res.status(200).json(service)
  } catch(error) {
    console.error('Error fetching service: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch service' })
  }
}

// DB stores prices in INT so the price must be converted from FLOAT to INT
const createService = (req, res) => {
  const { name, duration, price } = req.body
  const convertedPrice = toTiyins(price)
  try {
    const result = serviceRepository.insertService(name, duration, convertedPrice)
    res.status(201).json({ 
      id: result.lastInsertRowid, 
      name, 
      duration, 
      price 
    })
  } catch(error) {
    if (error.message.includes('UNIQUE constraint failed: services.name')) {
      return res.status(409).json({ error: 'Service with this name already exists' })
    }
    console.error('Error creating a service: ', error?.message)
    res.status(500).json({ error: 'Failed to create a service' })
  }
}

// DB stores prices in INT so the price must be converted from FLOAT to INT
const updateService = (req, res) => {
  const { id } = req.params
  const { name, duration, price } = req.body
  const convertedPrice = toTiyins(price)
  try {
    const result = serviceRepository.updateService(name, duration, convertedPrice, id)
    if (result.changes === 0) return res.status(404).json({ message: 'Service not found' })
    res.status(200).json({
      message: 'Service updated successfully',
      id, name, duration, price
    })
  } catch(error) {
    if (error.message.includes('UNIQUE constraint failed: services.name')) {
      return res.status(409).json({ error: 'Service with this name already exists' })
    }
    console.error('Error updating a service: ', error?.message)
    res.status(500).json({ error: 'Failed to update a service' })
  }
}

const deleteService = (req, res) => {
  const { id } = req.params
  try {
    const result = serviceRepository.deleteService(id)
    if(result.changes === 0) return res.status(404).json({ message: 'Service not found' })
    res.status(200).json({ message: `Successfully deleted service under id: ${id}` })
  } catch(error) {
    console.error('Error deleting a service: ', error?.message)
    res.status(500).json({ error: 'Failed to delete a service' })
  }
}

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
}