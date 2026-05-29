const db = require('../db')

const querySpecializations = () =>
  db.prepare(`SELECT * FROM specializations ORDER BY name ASC`).all()

const insertSpecialization = (name) =>
  db.prepare(`
    INSERT INTO specializations (name) 
    VALUES (?)
  `).run(name)

const updateSpecialization = (id, name) =>
  db.prepare(`
    UPDATE specializations 
    SET name = ? 
    WHERE id = ?
  `).run(name, id)

const deleteSpecialization = (id) =>
  db.prepare(`DELETE FROM specializations WHERE id = ?`).run(id)

module.exports = {
  querySpecializations,
  insertSpecialization,
  updateSpecialization,
  deleteSpecialization
}