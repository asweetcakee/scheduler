const staffRepository = require('../repositories/staffRepository')

const getAllStaff = (req, res) => {
  const { date } = req.query
  try {
    const staffMembers = date 
      ? staffRepository.queryShiftsByDate(date)
      : staffRepository.queryStaff()

    const allSpecializations = staffRepository.queryStaffSpecs()

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
    const staffMember = staffRepository.queryStaffById(id)
    if (!staffMember) return res.status(404).json({ error: 'Staff member not found' })
    staffMember.specializations = staffRepository.querySpecsByStaffId(id)
    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

const searchStaffMemberByPhone = (req, res) => {
  const { phone } = req.query // ?phone=77071234567
  try {
    const staffMember = staffRepository.queryStaffByPhone(phone)
    if (!staffMember) return res.status(404).json({ error: "Staff member not found" })
    staffMember.specializations = staffRepository.querySpecsByStaffId(staffMember.id)
    res.status(200).json(staffMember)
  } catch (error) {
    console.error('Error fetching staff member: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch staff member' })
  }
}

const createStaffMember = (req, res) => {
  const { name, phone, isActive, specializationIds } = req.body
  try {
    const newId = staffRepository.insertStaff(name, phone, isActive, specializationIds)
    const newStaff = {
      id: newId, 
      name, phone, isActive
    }
    newStaff.specializations = staffRepository.querySpecsByStaffId(newId)
    res.status(201).json(newStaff)
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: staff.phone')) {
      return res.status(409).json({ error: 'Phone number already registered' })
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return res.status(400).json({ error: 'One or more specialization IDs are invalid' })
    }
    console.error('Error in createStaffMember:', error.message)
    res.status(500).json({ error: 'Failed to create staff' })
  }
}

const updateStaffMember= (req, res) => {
  const { id } = req.params
  const { name, phone, isActive, specializationIds } = req.body
  try {
    staffRepository.updateStaff(id, name, phone, isActive, specializationIds)
    const updatedStaff = { id, name, phone, isActive }
    updatedStaff.specializations = staffRepository.querySpecsByStaffId(id)
    res.status(200).json({ message: 'Updated successfully', updatedStaff })
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
    const result = staffRepository.deleteStaff(id)
    if(result.changes === 0) return res.status(404).json({ error: 'staff member not found' })
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