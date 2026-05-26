const db = require('../db')

const getAllSpecializations = () => {
  return db.prepare(`
    SELECT ss.staffId, sp.id, sp.name
      FROM staff_specializations ss
      JOIN specializations sp ON ss.specializationId = sp.id  
  `).all()
}

const getActiveShifts = (date) => {
  return db.prepare(`
    SELECT 
      s.*, 
      ssd.shiftStart, 
      ssd.shiftEnd, 
      ssd.isCancelled, 
      ssd.notes
    FROM staff s
    JOIN staff_schedules ssd ON s.id = ssd.staffId
    WHERE ssd.date = ?
  `).all(date)
}

const getAllStaff = (req, res) => {
  const { date } = req.query
  try {
    const staffMembers = date 
      ? getActiveShifts(date)
      : db.prepare(`SELECT * FROM staff`).all()

    const allSpecializations = getAllSpecializations()

    const formattedStaff = staffMembers.map(m => {
      const { shiftStart, shiftEnd, isCancelled, notes, ...staffInfo } = m
      
      const mySpecs = allSpecializations
        .filter(spec => spec.staffId === m.id)
        .map(spec => ({ id: spec.id, name: spec.name }))
      
      return {
        ...staffInfo,
        specializations: mySpecs,
        schedule: shiftStart 
          ? { shiftStart, shiftEnd, isCancelled, notes }
          : null
      }
    })

    res.status(200).json(formattedStaff)
  } catch (error) {
    console.error('Error fetching staff', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff' })
  }
}

const getStaffById = (req, res) => {
  const { id } = req.params
  try {
    const staffMember = db.prepare(`SELECT * FROM staff WHERE id = ?`).get(id)
    if (!staffMember) return res.status(404).json({ error: 'Staff member not found' })
    
    const allSpecializations = getAllSpecializations()
    staffMember.specializations = allSpecializations
      .filter(spec => spec.staffId === staffMember.id)
      .map(spec => ({ id: spec.id, name: spec.name }))
    
    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

const searchStaffMemberByPhone = (req, res) => {
  const { phone } = req.query // ?phone=77071234567
  try {
    const staffMember = db.prepare(`SELECT * FROM staff WHERE phone = ?`).get(phone)
    if (!staffMember) return res.status(404).json({ message: "Staff member not found" })
    
    const allSpecializations = getAllSpecializations()
    staffMember.specializations = allSpecializations
      .filter(spec => spec.staffId === staffMember.id)
      .map(spec => ({ id: spec.id, name: spec.name }))

    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

const createStaffMember = (req, res) => {
  const { name, phone, isActive, specializationIds } = req.body
  const insertTransaction = db.transaction((memberData, specIds) => {
    
    const info = db.prepare(`
      INSERT INTO staff (name, phone, isActive) 
      VALUES (?, ?, ?)
    `).run(memberData.name, memberData.phone, memberData.isActive ? 1 : 0)

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

const updateStaffMember= (req, res) => {
  const { id } = req.params
  const { name, phone, isActive, specializationIds } = req.body
  const updateTransaction = db.transaction((staffId, memberData, specIds) => {
    
    const result = db.prepare(`
      UPDATE staff SET name = ?, phone = ?, isActive = ? WHERE id = ?
    `).run(memberData.name, memberData.phone, memberData.isActive ? 1 : 0, staffId)

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
    if (error.message.includes('UNIQUE constraint failed: staff.phone')) {
      return res.status(409).json({ error: 'Phone number already registered' })
    }
    console.error('Error updating staff:', error.message)
    res.status(500).json({ error: 'Failed to update staff' })
  }
}

const deleteStaffMember = (req, res) => {
  const { id } = req.params
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