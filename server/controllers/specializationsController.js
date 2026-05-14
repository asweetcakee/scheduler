const db = require('../db')

const getAllSpecializations = (req, res) => {
  try {
    const specializations = db.prepare(`SELECT * FROM specializations ORDER BY name ASC`).all()
    res.status(200).json(specializations)
  } catch (error) {
    console.error('Error fetching specializations', error?.message)
    res.status(500).json({ error: 'Failed to fetch specializations' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const createSpecialization = (req, res) => {
  const { name } = req.body

  if (!name) return res.status(400).json({ error: 'Name is required' })

  try {
    const result = db.prepare(`INSERT INTO specializations (name) VALUES (?)`).run(name)
    res.status(201).json({ id: result.lastInsertRowid, name })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This specialization already exists' })
    }
    console.error('Error creating a specialization', error?.message)
    res.status(500).json({ error: 'Failed to create a specialization' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const updateSpecializationById = (req, res) => {
  const id = Number(req.params.id)
  const { name } = req.body
  try {
    const result = db.prepare(`UPDATE specializations SET name = ? WHERE id = ?`).run(name, id)
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Specialization not found' })
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
  const id = Number(req.params.id)
  try {
    const result = db.prepare(`DELETE FROM specializations WHERE id = ?`).run(id)
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Specialization not found' })
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