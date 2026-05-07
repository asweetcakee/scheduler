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

const getTodayAppointments = (req, res) => {
  const { date } = req.query // ?date=2026-05-07

  try {
    if (!date) return res
      .status(400).json({ 
          error: 'Date parameter is required. Use ?date=YYYY-MM-DD'
      })

    const appointments = db.prepare(
      `SELECT * FROM appointments
      WHERE date = ?
      ORDER BY startTime ASC`
    ).all(date)

    if (appointments.length > 0) {
      res.status(200).json(appointments)
    } else {
      res.status(404).json({ message: 'Appointments not found' })
    }
  } catch (error) {
    console.error('Error fetching appointments: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

module.exports = {
  getAllAppointments
}