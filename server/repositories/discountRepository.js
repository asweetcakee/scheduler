const db = require('../db')

const queryDiscounts = () =>
  db.prepare(`SELECT * FROM client_discounts`).all()

const queryDiscountsByClientId = (clientId) =>
  db.prepare(`SELECT * FROM client_discounts WHERE clientId = ?`).all(clientId)

const insertDiscount = (clientId, serviceId, discountPercent) =>
  db.prepare(`
    INSERT INTO client_discounts (clientId, serviceId, discountPercent)
    VALUES (?, ?, ?)
  `).run(clientId, serviceId, discountPercent)

const updateDiscount = (clientId, serviceId, discountPercent) =>
  db.prepare(`
    UPDATE client_discounts 
    SET discountPercent = ? 
    WHERE clientId = ? AND serviceId = ?
  `).run(discountPercent, clientId, serviceId)

const deleteDiscount = (clientId, serviceId) =>
  db.prepare(`DELETE FROM client_discounts WHERE clientId = ? AND serviceId = ?`).run(clientId, serviceId)

module.exports = {
  queryDiscounts,
  queryDiscountsByClientId,
  insertDiscount,
  updateDiscount,
  deleteDiscount
}