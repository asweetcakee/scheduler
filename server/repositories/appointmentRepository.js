const db = require('../db')

// joins client name/phone and staff name onto every appointment query, also joins anonymous clients
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

const queryServicesByAppointmentIds = (appointmentIds) => {
  const placeholders = appointmentIds.map(() => '?').join(',')
  return db.prepare(`
    SELECT * FROM appointment_services 
    WHERE appointmentId IN (${placeholders})
  `).all(...appointmentIds)
}

const queryAppointmentsByDate = (date) =>
  db.prepare(BASE_QUERY + `
    WHERE date(date) = date(?) 
    AND a.status != 'cancelled' 
    ORDER BY startTime ASC
  `).all(date)

// intentional collects 'cancelled' appointments too - for admin/reporting use
const queryAppointments = () =>
  db.prepare(BASE_QUERY).all()

const queryAppointmentById = (id) =>
  db.prepare(BASE_QUERY + ` WHERE a.id = ?`).get(id)

const insertAppointment = db.transaction((appointment, services) => {
  const result = db.prepare(`
    INSERT INTO appointments 
      (clientId, staffId, date, startTime, endTime, actualRevenue, status, isConfirmed, adminNotes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(appointment.clientId, appointment.staffId, appointment.date, appointment.startTime, appointment.endTime, 
    appointment.runningTotal, appointment.status, appointment.isConfirmed ? 1 : 0, appointment.adminNotes)
  
  const newAppointmentId = result.lastInsertRowid

  if (services?.length > 0) {
    const insertServices = db.prepare(`
      INSERT INTO appointment_services 
        (appointmentId, serviceId, serviceName, catalogDuration, catalogPrice, appliedDiscount, actualChargedPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    for (const s of services) {
      insertServices.run(newAppointmentId, s.serviceId, s.serviceName, s.catalogDuration, 
        s.catalogPrice, s.appliedDiscount, s.actualChargedPrice)
    }
  }
  return newAppointmentId
})

const queryActiveStaffById = (id) =>
  db.prepare(`
    SELECT * FROM staff 
    WHERE id = ? AND isActive = 1
  `).get(id)

const queryActiveScheduleByDate = (staffId, date) =>
  db.prepare(`
    SELECT * FROM staff_schedules 
    WHERE staffId = ? AND date = ? AND isCancelled = 0
  `).get(staffId, date)

const queryConflictingAppointment = (staffId, date, startTime, endTime, excludeId = -1) =>
  db.prepare(`
    SELECT id FROM appointments
    WHERE staffId = ? 
      AND date = ? AND status != 'cancelled'
      AND startTime < ? AND endTime > ?
      AND id != ?
  `).get(staffId, date, endTime, startTime, excludeId)

const queryActiveServices = (serviceIds) => {
  const placeholders = serviceIds.map(() => '?').join(',')
  return db.prepare(`
    SELECT id FROM services 
    WHERE id IN (${placeholders}) 
    AND isActive = 1
  `).all(...serviceIds)
}

const updateAppointment = db.transaction((appointmentId, appointment, services) => {
  const updateResult = db.prepare(`
    UPDATE appointments 
    SET clientId = ?, staffId = ?, date = ?, startTime = ?, endTime = ?,
        actualRevenue = ?, status = ?, isConfirmed = ?, adminNotes = ?
    WHERE id = ?
  `).run( appointment.clientId, appointment.staffId, appointment.date,
    appointment.startTime, appointment.endTime,
    appointment.runningTotal, appointment.status,
    appointment.isConfirmed ? 1 : 0, appointment.adminNotes,
    appointmentId
  )

  if (updateResult.changes === 0) throw new Error('NOT_FOUND')
  
  db.prepare(`DELETE FROM appointment_services WHERE appointmentId = ?`).run(appointmentId)

  if (services?.length > 0) {
    const insertServices = db.prepare(`
      INSERT INTO appointment_services 
        (appointmentId, serviceId, serviceName, catalogDuration, catalogPrice, appliedDiscount, actualChargedPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    for (const s of services) {
      insertServices.run(appointmentId, s.serviceId, s.serviceName, s.catalogDuration, 
        s.catalogPrice, s.appliedDiscount, s.actualChargedPrice)
    }
  }
})

const deleteAppointment = (id) =>
  db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id)

module.exports = {
  queryServicesByAppointmentIds,
  queryAppointmentsByDate,
  queryAppointments,
  queryAppointmentById,
  insertAppointment,
  queryActiveStaffById,
  queryActiveScheduleByDate,
  queryConflictingAppointment,
  queryActiveServices,
  updateAppointment,
  deleteAppointment
}
  