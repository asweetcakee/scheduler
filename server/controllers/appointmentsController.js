const db = require('../db')
const { toTiyins, toTenge } = require('../utils/currency')

const BASE_QUERY = `
  SELECT 
    a.*,
    c.name AS clientName,
    c.phone AS clientPhone,
    s.name  AS staffName
  FROM appointments a
  LEFT JOIN clients c ON a.clientId = c.id
  JOIN staff s ON a.staffId  = s.id
`

const getAppointmentsWithServices = (appointments) => {
  if (appointments.length === 0) return []
  const ids = appointments.map(a => a.id)
  const placeholders = ids.map(() => '?').join(',')

  const services = db.prepare(`SELECT * FROM appointment_services WHERE appointmentId IN (${placeholders})`).all(...ids)

  const servicesByAppointment = {}
  for (const s of services) {
    if(!servicesByAppointment[s.appointmentId]) {
      servicesByAppointment[s.appointmentId] = []
    }
    servicesByAppointment[s.appointmentId].push(s)
  }

  return appointments.map(a => ({
    ...a,
    services: servicesByAppointment[a.id] ?? []
  }))
}

const getAllAppointments = (req, res) => {
  const { date } = req.query // ?date=2026-05-07
  try {
    const appointments = date
      ? db.prepare(BASE_QUERY + ` WHERE date(date) = date(?) AND a.status != 'cancelled' ORDER BY startTime ASC`).all(date)
      : db.prepare(BASE_QUERY).all() // intentional 'cancelled' allowance - unfiltered for admin/reporting use
    res.status(200).json(getAppointmentsWithServices(appointments))
  } catch (error) {
    console.error('Error fetching appointments: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

const getAppointmentById = (req, res) => {
  const { id } = req.params
  try {
    const appointment = db.prepare(BASE_QUERY + ` WHERE a.id = ?`).get(id)
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }
    const services = db.prepare(`
      SELECT * FROM appointment_services WHERE appointmentId = ?
    `).all(id)
    res.status(200).json({ ...appointment, services })
  } catch (error) {
    console.error('Error fetching appointment: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointment' })
  }
}

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
    // staff exists and is active
    const staff = db.prepare(`SELECT * FROM staff WHERE id = ? AND isActive = 1`).get(staffId)
    if (!staff) return res.status(400).json({ error: 'Staff member not found or inactive' })

    // staff has a schedule on this date
    const schedule = db.prepare(`
      SELECT * FROM staff_schedules 
      WHERE staffId = ? AND date = ? AND isCancelled = 0
    `).get(staffId, date)
    if (!schedule) return res.status(400).json({ error: 'Staff member is not scheduled on this date' })
    
    // appointment fits within shift hours
    if (startTime < schedule.shiftStart || endTime > schedule.shiftEnd) {
      return res.status(400).json({ error: 'Appointment falls outside staff working hours' })
    }

    // no time slot conflicts
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE staffId = ? AND date = ? AND status != 'cancelled'
        AND startTime < ? AND endTime > ?
    `).get(staffId, date, endTime, startTime)
    if (conflict) return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' })
    
    // services exist and are active
    const serviceIds = services.map(s => s.serviceId)
    const placeholders = serviceIds.map(() => '?').join(',')
    const foundServices = db.prepare(`
      SELECT id FROM services WHERE id IN (${placeholders}) AND isActive = 1
    `).all(...serviceIds)
    if (foundServices.length !== serviceIds.length) {
      return res.status(400).json({ error: 'One or more services are invalid or inactive' })
    }

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
    console.error('Error creating an appointment: ', error?.message)
    res.status(500).json({ error: 'Failed to create an appointment' })
  }
}

const updateAppointment = (req, res) => {
  const { id } = req.params
  const clientId = req.body.clientId ?? null
  const { staffId, date, startTime, endTime, status, isConfirmed, adminNotes } = req.body
  const clientProvidedTotal = toTiyins(req.body.actualRevenue)

  const services = (req.body.services || []).map(s => ({
    ...s,
    catalogPrice: toTiyins(s.catalogPrice),
    actualChargedPrice: toTiyins(s.actualChargedPrice)
  }))

  const updateTransaction = db.transaction((appointmentId, appointmentData, servicesData) => {
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

    const result = db.prepare(`
      UPDATE appointments 
      SET clientId = ?, staffId = ?, date = ?, startTime = ?, endTime = ?,
          actualRevenue = ?, status = ?, isConfirmed = ?, adminNotes = ?
      WHERE id = ?
    `).run(
      appointmentData.clientId, appointmentData.staffId, appointmentData.date,
      appointmentData.startTime, appointmentData.endTime,
      runningTotal, appointmentData.status,
      appointmentData.isConfirmed ? 1 : 0, appointmentData.adminNotes,
      appointmentId
    )

    if (result.changes === 0) throw new Error('NOT_FOUND')

    // Same pattern as staff_specializations — wipe and reinsert
    db.prepare(`DELETE FROM appointment_services WHERE appointmentId = ?`).run(appointmentId)

    if (servicesData.length > 0) {
      const insertService = db.prepare(`
        INSERT INTO appointment_services 
          (appointmentId, serviceId, serviceName, catalogDuration, catalogPrice, appliedDiscount, actualChargedPrice)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      for (const s of servicesData) {
        insertService.run(appointmentId, s.serviceId, s.serviceName,
          s.catalogDuration, s.catalogPrice, s.appliedDiscount, s.actualChargedPrice)
      }
    }

    return runningTotal
  })

  try {
    // staff exists and is active
    const staff = db.prepare(`SELECT * FROM staff WHERE id = ? AND isActive = 1`).get(staffId)
    if (!staff) return res.status(400).json({ error: 'Staff member not found or inactive' })

    // staff has a schedule on this date
    const schedule = db.prepare(`
      SELECT * FROM staff_schedules 
      WHERE staffId = ? AND date = ? AND isCancelled = 0
    `).get(staffId, date)
    if (!schedule) return res.status(400).json({ error: 'Staff member is not scheduled on this date' })
    
    // appointment fits within shift hours
    if (startTime < schedule.shiftStart || endTime > schedule.shiftEnd) {
      return res.status(400).json({ error: 'Appointment falls outside staff working hours' })
    }

    // no time slot conflicts
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE staffId = ? AND date = ? AND status != 'cancelled'
        AND startTime < ? AND endTime > ?
        AND id != ?
    `).get(staffId, date, endTime, startTime)
    if (conflict) return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' })
    
    // services exist and are active
    const serviceIds = services.map(s => s.serviceId)
    const placeholders = serviceIds.map(() => '?').join(',')
    const foundServices = db.prepare(`
      SELECT id FROM services WHERE id IN (${placeholders}) AND isActive = 1
    `).all(...serviceIds)
    if (foundServices.length !== serviceIds.length) {
      return res.status(400).json({ error: 'One or more services are invalid or inactive' })
    }

    const runningTotal = updateTransaction(id, { 
      clientId, staffId, date, startTime, endTime, status, isConfirmed, adminNotes 
    }, services)

    res.status(200).json({
      ...req.body,
      id,
      actualRevenue: toTenge(runningTotal),
      actualRevenueTiyins: runningTotal,
      clientId,
      isAnonymous: clientId === null
    })
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Appointment not found' })
    }
    if (error.message === 'TOTAL_MISMATCH' || error.message === 'INCORRECT_SERVICE_PRICE') {
      return res.status(400).json({ error: 'The calculation on frontend doesn\'t match calculation on backend' })
    }
    console.error('Error updating appointment:', error?.message)
    res.status(500).json({ error: 'Failed to update appointment' })
  }
}

const deleteAppointment = (req, res) => {
  const { id } = req.params
  try {
    const result = db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id)

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' })
    }

    res.status(200).json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error?.message)
    res.status(500).json({ error: 'Failed to delete appointment' })
  }
}
module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
}