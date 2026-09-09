const specializationRepository = require('../repositories/specializationRepository')

const getAllSpecializations = (req, res) => {
  try {
    const specializations = specializationRepository.querySpecializations()
    res.status(200).json(specializations)
  } catch (error) {
    console.error('Error fetching specializations', error?.message)
    res.status(500).json({ error: 'Failed to fetch specializations' })
  }
}

const createSpecialization = (req, res) => {
  const { name } = req.body
  try {
    const result = specializationRepository.insertSpecialization(name)
    res.status(201).json({ id: result.lastInsertRowid, name })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This specialization already exists' })
    }
    console.error('Error creating a specialization', error?.message)
    res.status(500).json({ error: 'Failed to create a specialization' })
  }
}

const updateSpecializationById = (req, res) => {
  const { id } = req.params
  const { name } = req.body
  try {
    const result = specializationRepository.updateSpecialization(id, name)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Specialization not found' })
    }
    res.status(200).json({ message: 'Specialization updated successfully', id, name })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Another specialization already has this name' })
    }
    console.error('Error updating a specialization', error?.message)
    res.status(500).json({ error: 'Failed to update a specialization' })
  }
}

const deleteSpecializationById = (req, res) => {
  const { id } = req.params
  try {
    const result = specializationRepository.deleteSpecialization(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Specialization not found' })
    }
    res.status(200).json({ message: 'Specialization deleted successfully' })
  } catch (error) {
    console.error('Error deleting a specialization', error?.message)
    res.status(500).json({ error: 'Failed to delete a specialization' })
  }
}

module.exports = {
  getAllSpecializations,
  createSpecialization,
  updateSpecializationById,
  deleteSpecializationById
}