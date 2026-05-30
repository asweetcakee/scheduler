const appointmentRepository = require('../repositories/appointmentRepository')
const { toTiyins, toTenge } = require('../utils/currency')

const getAppointmentsWithServices = (appointments) => {
  if (appointments.length === 0) return [] 
  const ids = appointments.map(a => a.id)
  const services = appointmentRepository.queryServicesByAppointmentIds(ids)
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
      ? appointmentRepository.queryAppointmentsByDate(date)
      : appointmentRepository.queryAppointments() // intentional 'cancelled' allowance - unfiltered for admin/reporting use
    res.status(200).json(getAppointmentsWithServices(appointments))
  } catch (error) {
    console.error('Error fetching appointments: ', error?.message)
    res.status(500).json({ error: 'Failed to fetch appointments' })
  }
}

const getAppointmentById = (req, res) => {
  const { id } = req.params
  try {
    const appointment = appointmentRepository.queryAppointmentById(id)
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' })
    }
    const result = getAppointmentsWithServices([appointment])
    res.status(200).json(result[0])
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
  try {
    // Here I'm making sure in the backend that actualRevenue and actualChargedPrice are calculated correctly
    // actualRevenue is sum of actualChargedPrice
    // actualChargedPrice is result of catalogPrice * appliedDiscount
    const runningTotal = services.reduce((sum, service) => {
      const expectedPrice = Math.round(service.catalogPrice * (1 - service.appliedDiscount / 100))
      if (expectedPrice !== service.actualChargedPrice) throw new Error('INCORRECT_SERVICE_PRICE')
        return sum + expectedPrice
    }, 0)

    if (runningTotal !== clientProvidedTotal) throw new Error('TOTAL_MISMATCH')

    // staff exists and is active
    const staff = appointmentRepository.queryActiveStaffById(staffId)
    if (!staff) return res.status(400).json({ error: 'Staff member not found or inactive' })

    // staff has a schedule on this date
    const schedule = appointmentRepository.queryActiveScheduleByDate(staffId, date)
    if (!schedule) return res.status(400).json({ error: 'Staff member is not scheduled on this date' })
    
    // appointment fits within shift hours
    if (startTime < schedule.shiftStart || endTime > schedule.shiftEnd) {
      return res.status(400).json({ error: 'Appointment falls outside staff working hours' })
    }

    // no time slot conflicts
    const conflict = appointmentRepository.queryConflictingAppointment(staffId, date, startTime, endTime)
    if (conflict) return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' })
    
    // services exist and are active
    const serviceIds = services.map(s => s.serviceId)
    const foundServices = appointmentRepository.queryActiveServices(serviceIds)
    if (foundServices.length !== serviceIds.length) {
      return res.status(400).json({ error: 'One or more services are invalid or inactive' })
    }

    const newAppointmentId = appointmentRepository.insertAppointment({ 
      clientId, staffId, date, startTime, endTime, 
      runningTotal, status, isConfirmed, adminNotes
    }, services)
    
    const appointment = {
      id: newAppointmentId,
      clientId, staffId, date, startTime, endTime,
      status, isConfirmed, adminNotes,
      actualRevenue: toTenge(runningTotal), // for UX (Float)
      actualRevenueTiyins: runningTotal, // how it was written into DB (Integer)
      isAnonymous: clientId === null
    }

    const [result] = getAppointmentsWithServices([appointment])
    result.services = result.services.map(s => ({
      ...s,
      catalogPrice: toTenge(s.catalogPrice),
      actualChargedPrice: toTenge(s.actualChargedPrice)
    }))

    res.status(201).json(result)
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
  try {
    // Here I'm making sure in the backend that actualRevenue and actualChargedPrice are calculated correctly
    // actualRevenue is sum of actualChargedPrice
    // actualChargedPrice is result of catalogPrice * appliedDiscount
    const runningTotal = services.reduce((sum, service) => {
      const expectedPrice = Math.round(service.catalogPrice * (1 - service.appliedDiscount / 100))
      if (expectedPrice !== service.actualChargedPrice) throw new Error('INCORRECT_SERVICE_PRICE')
        return sum + expectedPrice
    }, 0)

    if (runningTotal !== clientProvidedTotal) throw new Error('TOTAL_MISMATCH')

    // staff exists and is active
    const staff = appointmentRepository.queryActiveStaffById(staffId)
    if (!staff) return res.status(400).json({ error: 'Staff member not found or inactive' })

    // staff has a schedule on this date
    const schedule = appointmentRepository.queryActiveScheduleByDate(staffId, date)
    if (!schedule) return res.status(400).json({ error: 'Staff member is not scheduled on this date' })
    
    // appointment fits within shift hours
    if (startTime < schedule.shiftStart || endTime > schedule.shiftEnd) {
      return res.status(400).json({ error: 'Appointment falls outside staff working hours' })
    }

    // no time slot conflicts
    const conflict = appointmentRepository.queryConflictingAppointment(staffId, date, startTime, endTime, id)
    if (conflict) return res.status(409).json({ error: 'Time slot conflicts with an existing appointment' })
    
    // services exist and are active
    const serviceIds = services.map(s => s.serviceId)
    const foundServices = appointmentRepository.queryActiveServices(serviceIds)
    if (foundServices.length !== serviceIds.length) {
      return res.status(400).json({ error: 'One or more services are invalid or inactive' })
    }

    appointmentRepository.updateAppointment(id, { 
        clientId, staffId, date, startTime, endTime,
        runningTotal, status, isConfirmed, adminNotes
      }, services)
    
    const appointment = {
      id,
      clientId, staffId, date, startTime, endTime,
      status, isConfirmed, adminNotes,
      actualRevenue: toTenge(runningTotal),
      actualRevenueTiyins: runningTotal,
      isAnonymous: clientId === null
    }

    const [result] = getAppointmentsWithServices([appointment])
    result.services = result.services.map(s => ({
      ...s,
      catalogPrice: toTenge(s.catalogPrice),
      actualChargedPrice: toTenge(s.actualChargedPrice)
    }))

    res.status(200).json({ message: 'Appointment updated successfully', ...result })
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
    const result = appointmentRepository.deleteAppointment(id)
    if (result.changes === 0) return res.status(404).json({ error: 'Appointment not found' })
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