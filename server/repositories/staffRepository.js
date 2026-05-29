const db = require('../db')

// TODO: remove comments after commit - prev func name: getAllSpecializations
const queryStaffSpecs = () =>
  db.prepare(`
    SELECT ss.staffId, sp.id, sp.name
      FROM staff_specializations ss
      JOIN specializations sp ON ss.specializationId = sp.id  
  `).all()

const querySpecsByStaffId = (staffId) =>
  db.prepare(`
    SELECT sp.id, sp.name
    FROM staff_specializations ss
    JOIN specializations sp ON ss.specializationId = sp.id
    WHERE ss.staffId = ?
  `).all(staffId)

// TODO: remove comments after commit - prev func name: getActiveShifts
const queryShiftsByDate = (date) => {
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

const queryStaff = () =>
  db.prepare(`SELECT * FROM staff`).all()

const queryStaffById = (id) =>
  db.prepare(`SELECT * FROM staff WHERE id = ?`).get(id)

const queryStaffByPhone = (phone) =>
  db.prepare(`SELECT * FROM staff WHERE phone = ?`).get(phone)

// inserts a new staff member THEN links them to the provided specialization IDs
const insertStaff = db.transaction((name, phone, isActive, specializationIds) => {
  const insertResult = db.prepare(`
    INSERT INTO staff (name, phone, isActive)
    VALUES (?, ?, ?)
  `).run(name, phone, isActive ? 1 : 0)

  const newStaffId = insertResult.lastInsertRowid

  if (specializationIds?.length > 0) {
    const insertSpecialization = db.prepare(`
      INSERT INTO staff_specializations (staffId, specializationId) 
      VALUES (?, ?)
    `)
    for (const specId of specializationIds) {
      insertSpecialization.run(newStaffId, specId)
    }
  }

  return newStaffId
})

// updates staff member by id, deletes all not-listed specialization ID links
// THEN links staff member to the provided new specialization IDs
const updateStaff = db.transaction((id, name, phone, isActive, specializationIds) => {
  const updateResult = db.prepare(`
    UPDATE staff 
    SET name = ?, phone = ?, isActive = ?
    WHERE id = ?
  `).run(name, phone, isActive ? 1 : 0, id)

  if (updateResult.changes === 0) throw new Error('NOT_FOUND')

  db.prepare(`DELETE FROM staff_specializations WHERE staffId = ?`).run(id)

  if (specializationIds?.length > 0) {
    const insertSpec = db.prepare(`
      INSERT INTO staff_specializations (staffId, specializationId)
      VALUES (?, ?)
    `)
    for (const specId of specializationIds) {
      insertSpec.run(id, specId)
    }
  }
})

const deleteStaff = (id) =>
  db.prepare(`DELETE FROM staff WHERE id = ?`).run(id)

module.exports = {
  queryStaffSpecs,
  querySpecsByStaffId,
  queryShiftsByDate,
  queryStaff,
  queryStaffById,
  queryStaffByPhone,
  insertStaff,
  updateStaff,
  deleteStaff
}