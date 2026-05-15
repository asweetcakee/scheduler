const db = require('../db')

const getSpecializationsForStaff = (staffId) => {
  return db.prepare(`
    SELECT sp.id, sp.name 
    FROM specializations sp
    JOIN staff_specializations ss ON sp.id = ss.specializationId
    WHERE ss.staffId = ?
  `).all(staffId)
}

const getAllStaff = (req, res) => {
  try {
    const staffMembers = db.prepare(`SELECT * FROM staff`).all()

    const staffWithSpecializations = staffMembers.map(m => ({
      ...m,
      specializations: getSpecializationsForStaff(m.id)
    }))

    res.status(200).json(staffWithSpecializations)
  } catch (error) {
    console.error('Error fetching staff', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff' })
  }
}

const getStaffById = (req, res) => {
  const id = Number(req.params.id)
  try {
    const staffMember = db.prepare(`SELECT * FROM staff WHERE id = ?`).get(id)
    if (!staffMember) return res.status(404).json({ error: 'Staff member not found' })
    
    staffMember.specializations = getSpecializationsForStaff(id)
    
    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const searchStaffMemberByPhone = (req, res) => {
  const { phone } = req.query // ?phone=77071234567
  
  if (!phone) return res
      .status(400).json({ 
          error: 'Phone parameter is required. Use ?phone=77071234567'
      })
  
  try {
    const staffMember = db.prepare(`SELECT * FROM staff WHERE phone = ?`).get(phone)
    if (!staffMember) return res.status(404).json({ message: "Staff member not found" })
    
    staffMember.specializations = getSpecializationsForStaff(staffMember.id)

    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const createStaffMember = (req, res) => {
  const { name, phone, isActive, specializationIds } = req.body
  const insertTransaction = db.transaction((memberData, specIds) => {
    
    const info = db.prepare(`
      INSERT INTO staff (name, phone, isActive) 
      VALUES (?, ?, ?)
    `).run(memberData.name, memberData.phone, memberData.isActive ?? 1)

    const newStaffId = info.lastInsertRowid

    if (specIds && specIds.length > 0) {
      const insertSpec = db.prepare(`
        INSERT INTO staff_specializations (staffId, specializationId) 
        VALUES (?, ?)
      `)
      for (const specId of specIds) {
        insertSpec.run(newStaffId, specId)
      }
    }

    return newStaffId
  })
  try {
    const newId = insertTransaction({ name, phone, isActive }, specializationIds)
    res.status(201).json({ id: newId, name, phone, isActive, specializationIds })
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: staff.phone')) {
      return res.status(409).json({ error: 'Phone number already registered' })
    }
    console.error('Error in createStaffMember:', error.message)
    res.status(500).json({ error: 'Failed to create staff' })
  }
}

// TODO: validate data with ZOD schema before inserting it
const updateStaffMember= (req, res) => {
  const id = Number(req.params.id)
  const { name, phone, isActive, specializationIds } = req.body
  const updateTransaction = db.transaction((staffId, memberData, specIds) => {
    
    const result = db.prepare(`
      UPDATE staff SET name = ?, phone = ?, isActive = ? WHERE id = ?
    `).run(memberData.name, memberData.phone, memberData.isActive, staffId)

    if (result.changes === 0) throw new Error('NOT_FOUND')

    db.prepare(`DELETE FROM staff_specializations WHERE staffId = ?`).run(staffId)

    if (specIds && specIds.length > 0) {
      const insertSpec = db.prepare(`
        INSERT INTO staff_specializations (staffId, specializationId) 
        VALUES (?, ?)
      `)
      for (const specId of specIds) {
        insertSpec.run(staffId, specId)
      }
    }
  })
  try {
    updateTransaction(id, { name, phone, isActive }, specializationIds)
    res.status(200).json({ message: 'Updated successfully', id, specializationIds })
  } catch (error) {
    if (error?.message === 'NOT_FOUND') return res.status(404).json({ error: 'Staff not found' })
    console.error('Error updating staff:', error.message)
    res.status(500).json({ error: 'Failed to update staff' })
  }
}

const deleteStaffMember = (req, res) => {
  const id = Number(req.params.id)
  try {
    const result = db.prepare(`DELETE FROM staff WHERE id = ?`).run(id)
    
    if(result.changes === 0) return res.status(404).json({ message: 'staff member not found' })
    
    res.status(200).json({ message: 'staff member deleted successfully' })
  } catch (error) {
    console.error('Error deleting a staff member: ', error?.message)
    res.status(500).json({ error: 'Failed to delete a staff member' })
  }
}

module.exports = {
  getAllStaff,
  getStaffById,
  searchStaffMemberByPhone,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
}