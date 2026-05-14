const db = require('../db')

const getSchedulesByStaffId = (req, res) => {
  const staffId = Number(req.params.id)
  try {
    const schedules = db.prepare(`SELECT * FROM staff_schedules WHERE staffId = ?`).all(staffId)
    if (schedules.length === 0) {
      return res.status(404).json({ error: `Schedule for staff ID ${staffId} not found` })
    }
    res.status(200).json(schedules)
  } catch (error) {
    console.error('Error fetching schedules for a staff member: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
}

// date(date) = date(?) makes sure the date has the correct input: 2026-05-14
const getSchedulesByDate = (req, res) => {
  const { date } = req.query
  try {
    const schedules = db.prepare(
      `SELECT * FROM staff_schedules 
      WHERE date(date) = date(?)
    `).all(date)
    if (schedules.length === 0) {
      return res.status(404).json({ message: 'No schedules found for this date' })
    }
    res.status(200).json(schedules)
  } catch (error) {
    console.error('Error fetching schedules based on date: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch schedules' })
  }
}

const createScheduleForStaff = (req, res) => {
  const staffId = Number(req.params.id)
  const { date, shiftStart, shiftEnd, isCancelled, notes } = req.body
  try {
    const result = db.prepare(
      `INSERT INTO staff_schedules (staffId, date, shiftStart, shiftEnd, isCancelled, notes)
      VALUES (?, ?, ?, ?, ?, ?)`
    ).run(staffId, date, shiftStart, shiftEnd, isCancelled ?? 0, notes ?? '')
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
  const staffId = Number(req.params.id)
  const { shiftStart, shiftEnd, isCancelled, notes } = req.body
  try {
    const result = db.prepare(
      `UPDATE staff_schedules
      SET shiftStart = ?, shiftEnd = ?, isCancelled = ?, notes = ?
      WHERE staffId = ? AND date = ?`
    ).run(shiftStart, shiftEnd, isCancelled ?? 0, notes ?? '', staffId, date)
    if (info.changes === 0) {
      return res.status(404).json({ error: 'No schedule found for this staff member on this date' })
    }
    res.status(200).json({ message: 'Schedule updated successfully' })
  } catch (error ) {
    if (error?.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'The shift end time must be later than the start time' })
    }
    console.error('Error creating schedule: ', error?.message)
    res.status(500).json({ error: 'Failed to create schedule' })
  }
}

const deleteSchedule = (req, res) => {
  const staffId = Number(req.params.id)
  const { date } = req.params
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
  getSchedulesByStaffId,
  getSchedulesByDate,
  createScheduleForStaff,
  updateSchedule,
  deleteSchedule
}