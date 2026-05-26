const db = require('../db')

// date(date) = date(?) makes sure the date has the correct input: 2026-05-14
const getNextScheduleForStaff = (req, res) => {
  const { id } = req.params
  const { from } = req.query // ?from=YYYY-MM-DD  
  try {
    const schedule = db.prepare(`
      SELECT * FROM staff_schedules
      WHERE staffId = ?
        AND date(date) >= date(?)
        AND isCancelled = 0
      ORDER BY date ASC
      LIMIT 1
    `).get(id, from)

    if (!schedule) return res.status(404).json({ message: 'No upcoming schedules found for this staff member' })
    res.status(200).json(schedule)
  } catch (error) {
    console.error('Error fetching schedules based on date: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
}

const createScheduleForStaff = (req, res) => {
  const { id: staffId } = req.params
  const { date, shiftStart, shiftEnd, isCancelled, notes } = req.body
  try {
    const result = db.prepare(
      `INSERT INTO staff_schedules (staffId, date, shiftStart, shiftEnd, isCancelled, notes)
      VALUES (?, ?, ?, ?, ?, ?)`
    ).run(staffId, date, shiftStart, shiftEnd, isCancelled ? 1 : 0, notes ?? '')
    res.status(201).json({
      id: result.lastInsertRowid,
      staffId, date, shiftStart, shiftEnd, isCancelled, notes
    })
  } catch (error) {
    if (error?.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A staffId with this date already exists' })
    }
    if (error?.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'The shift end time must be later than the start time' })
    }
    console.error('Error creating schedule: ', error?.message)
    res.status(500).json({ error: 'Failed to create schedule' })
  }
}

const updateSchedule = (req, res) => {
  const { id: staffId, date } = req.params
  const { shiftStart, shiftEnd, isCancelled, notes } = req.body
  try {
    const result = db.prepare(
      `UPDATE staff_schedules
      SET shiftStart = ?, shiftEnd = ?, isCancelled = ?, notes = ?
      WHERE staffId = ? AND date = ?`
    ).run(shiftStart, shiftEnd, isCancelled ? 1 : 0, notes ?? '', staffId, date)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'No schedule found for this staff member on this date' })
    }
    res.status(200).json({ message: 'Schedule updated successfully' })
  } catch (error ) {
    if (error?.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'The shift end time must be later than the start time' })
    }
    console.error('Error updating schedule: ', error?.message)
    res.status(500).json({ error: 'Failed to update schedule' })
  }
}

const deleteSchedule = (req, res) => {
  const { id: staffId, date } = req.params
  try {
    const result = db.prepare(`DELETE FROM staff_schedules WHERE staffId = ? AND date = ?`).run(staffId, date)
    if (result.changes <= 0) {
      return res.status(404).json({ message: 'Schedule not found' })
    }
    res.status(200).json({ message: 'Schedule deleted successfully' })
  } catch (error) {
    console.error('Error deleting schedule: ', error?.message)
    res.status(500).json({ error: 'Failed to delete schedule' })
  }
}

module.exports = {
  getNextScheduleForStaff,
  createScheduleForStaff,
  updateSchedule,
  deleteSchedule
}