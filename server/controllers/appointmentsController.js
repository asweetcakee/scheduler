const db = require('../db')

const getAllAppointments = (req, res) => {
  try{
    const appointments = db.prepare(`SELECT * FROM appointments`).all()
    res.status(200).json(appointments)
  } catch (error) {
    console.error('Error fetching appointments: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

const getAppointmentsByDate = (req, res) => {
  const { date } = req.query // ?date=2026-05-07
  try {
    if (!date) return res
      .status(400).json({ 
          error: 'Date parameter is required. Use ?date=YYYY-MM-DD'
      })
    const appointments = db.prepare(
      `SELECT * FROM appointments
      WHERE date(date) = date(?)
      ORDER BY startTime ASC`
    ).all(date)
    if (appointments.length <= 0) {
      return res.status(404).json({ message: 'Appointments not found' })
    }
    res.status(200).json(appointments)
  } catch (error) {
    console.error('Error fetching appointments: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

const getAppointmentById = (req, res) => {
  const id = Number(req.params.id)
  try {
    const appointment = db.prepare(`SELECT * FROM appointments WHERE id = ?`).get(id)
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }
    res.status(200).json(appointment)
  } catch (error) {
    console.error('Error fetching appointment: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointment' })
  }
}


// TODO: Iteration 2 - Server-side revenue validation
// Currently: actualRevenue is accepted directly from req.body (frontend sends it)
// Problem: frontend calculation could have bugs, sending wrong totals to DB
// Fix: never accept actualRevenue from req.body
//   1. Accept services array in request body instead
//   2. Compute actualRevenue = services.reduce((sum, s) => sum + s.actualChargedPrice, 0)
//   3. Insert appointment_services rows in the same transaction
// Why? backend must be the source of truth, frontend calc is for UX only
const createAppointment = (req, res) => {
  const clientId = req.body.clientId ?? null
  const { staffId, date, startTime, endTime, 
    actualRevenue, status, isConfirmed, adminNotes 
  } = req.body
  try {
    const result = db.prepare(
      `INSERT INTO appointments (clientId, staffId, date, startTime, endTime, 
        actualRevenue, status, isConfirmed, adminNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(clientId, staffId, date, startTime, endTime, 
        actualRevenue, status, isConfirmed ? 1 : 0, adminNotes)
    
    res.status(201).json({
      id: result.lastInsertRowid,
      clientId, staffId, date, startTime, endTime, actualRevenue, status, isConfirmed, adminNotes,
      isAnonymous: clientId === null
    })
  } catch (error) {
    if (error?.message.includes('endTime > startTime')) {
      return res.status(400).json({ message: 'The end time must be later than the start time' })
    } 
    if (error?.message.includes('actualRevenue >= 0')) {
      return res.status(400).json({ message: 'Actual revenue must be 0 or greater' })
    } 
    if (error?.message.includes('isConfirmed IN (0, 1)')) {
      return res.status(400).json({ message: 'isConfirmed must be 1 (true) or 0 (false)' })
    }
    if (error?.message.includes('status IN')) {
      return res.status(400).json({ message: 'Status must be \'scheduled\', \'completed\', or \'cancelled\'' })
    }
    console.error('Error creating an appointment: ', error?.message)
    res.status(500).json({ error: 'Failed to create an appointment' })
  }
}

const updateAppointment = (req, res) => {

}

module.exports = {
  getAllAppointments,
  getAppointmentsByDate,
  getAppointmentById,
  createAppointment
}