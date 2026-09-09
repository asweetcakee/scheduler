const db = require('../db')

const queryServices = () => 
  db.prepare('SELECT * FROM services').all()

const queryServiceById = (id) =>
  db.prepare('SELECT * FROM services WHERE id = ?').get(id)

const insertService = (name, duration, price) =>
  db.prepare(`
    INSERT INTO services(name, duration, price)
    VALUES (?, ?, ?)
  `).run(name, duration, price)

const updateService = (name, duration, price, id) =>
  db.prepare(`
    UPDATE services 
    SET name = ?, duration = ?, price = ?
    WHERE id = ?
  `).run(name, duration, price, id)

const deleteService = (id) =>
  db.prepare(`DELETE FROM services WHERE id = ?`).run(id)

module.exports = {
  queryServices,
  queryServiceById,
  insertService,
  updateService,
  deleteService
}