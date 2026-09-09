const db = require('../db')

const queryNextShift = (id, date) =>
  db.prepare(`
    SELECT * FROM staff_schedules
    WHERE staffId = ?
      AND date(date) >= date(?)
      AND isCancelled = 0
    ORDER BY date ASC
    LIMIT 1
  `).get(id, date)

const insertSchedule = (staffId, date, shiftStart, shiftEnd, isCancelled, notes) =>
  db.prepare(`
    INSERT INTO staff_schedules (staffId, date, shiftStart, shiftEnd, isCancelled, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(staffId, date, shiftStart, shiftEnd, isCancelled ? 1 : 0, notes ?? null)

const updateSchedule = (staffId, date, shiftStart, shiftEnd, isCancelled, notes) =>
  db.prepare(`
    UPDATE staff_schedules
    SET shiftStart = ?, shiftEnd = ?, isCancelled = ?, notes = ?
    WHERE staffId = ? AND date = ?
  `).run(shiftStart, shiftEnd, isCancelled ? 1 : 0, notes ?? null, staffId, date)

const deleteSchedule = (staffId, date) =>
  db.prepare(`
    DELETE FROM staff_schedules 
    WHERE staffId = ? AND date = ?
  `).run(staffId, date)

module.exports = {
  queryNextShift,
  insertSchedule,
  updateSchedule,
  deleteSchedule
}