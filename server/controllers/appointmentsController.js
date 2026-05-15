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

const toTiyins = (tenge) => Math.round(tenge * 100)
const toTenge = (tiyins) => (tiyins / 100).toFixed(2)

// Prices from frontend arrive as tenge floats - converted to tiyins (integers) before any math or DB writes
// actualRevenue is never trusted from frontend - backend recomputes it from services as the source of truth
// Two-step validation inside the transaction:
//   1. Each service: expectedPrice (catalogPrice * discount) must match actualChargedPrice sent by frontend
//   2. Sum of all expectedPrices must match clientProvidedTotal (actualRevenue)
// If either check fails, the whole transaction is aborted
// On success, runningTotal (backend-computed) is written to DB as actualRevenue
// Response returns tenge floats for UX, tiyins for any frontend that needs the raw integer
const createAppointment = (req, res) => {
  const clientId = req.body.clientId ?? null
  const { staffId, date, startTime, endTime, status, isConfirmed, adminNotes } = req.body
  const clientProvidedTotal = toTiyins(req.body.actualRevenue)
  
  // Here I clean the services list from floats and convert to tiyins (Integer)
  const services = (req.body.services || []).map(s => ({
    ...s,
    catalogPrice: toTiyins(s.catalogPrice),
    actualChargedPrice: toTiyins(s.actualChargedPrice)
  }))

  const insertTransaction = db.transaction((appointmentData, servicesData) => {
    // Here I'm making sure in the backend that actualRevenue and actualChargedPrice are calculated correctly
    // actualRevenue is sum of actualChargedPrice
    // actualChargedPrice is result of catalogPrice * appliedDiscount
    const runningTotal = servicesData.reduce((sum, service) => {
      const expectedPrice = Math.round(service.catalogPrice * (1 - service.appliedDiscount / 100))
      if (expectedPrice !== service.actualChargedPrice) {
        throw new Error('INCORRECT_SERVICE_PRICE')
      }
      return sum + expectedPrice
    }, 0)
    
    if (runningTotal !== clientProvidedTotal) {
      throw new Error('TOTAL_MISMATCH')
    }
    
    const result = db.prepare(
      `INSERT INTO appointments (clientId, staffId, date, startTime, endTime,
        actualRevenue, status, isConfirmed, adminNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(appointmentData.clientId, appointmentData.staffId, appointmentData.date,
        appointmentData.startTime, appointmentData.endTime,
        runningTotal, appointmentData.status,
        appointmentData.isConfirmed ? 1 : 0, appointmentData.adminNotes)
    
    const newAppointmentId = result.lastInsertRowid

    if (servicesData && servicesData.length > 0){
      const insertServices = db.prepare(
        `INSERT INTO appointment_services (appointmentId, serviceId, serviceName, catalogDuration, catalogPrice, appliedDiscount, actualChargedPrice)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      for (const s of servicesData) {
        insertServices.run(newAppointmentId, s.serviceId, s.serviceName, 
          s.catalogDuration, s.catalogPrice, s.appliedDiscount, s.actualChargedPrice
        )
      }
    }

    return { newAppointmentId, runningTotal }
  })
  try {
    const { newAppointmentId, runningTotal } = insertTransaction({ 
      clientId, staffId, date, startTime, endTime, 
      clientProvidedTotal, status, isConfirmed, adminNotes 
    }, services)
    
    res.status(201).json({
      ...req.body,
      id: newAppointmentId,
      actualRevenue: toTenge(runningTotal), // for UX (Float)
      actualRevenueTiyins: runningTotal, // how it was written into DB (Integer)
      clientId,
      isAnonymous: clientId === null
    })
  } catch (error) {
    if (error.message === 'TOTAL_MISMATCH' || error.message === 'INCORRECT_SERVICE_PRICE') {
      return res.status(400).json({ error: 'The calculation on frontend doesn\'t match calculation on backend' })
    }
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

const deleteAppointment = (req, res) => {

}

module.exports = {
  getAllAppointments,
  getAppointmentsByDate,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
}