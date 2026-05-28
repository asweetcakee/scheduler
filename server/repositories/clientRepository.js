const db = require('../db')

const queryClients = () => 
  db.prepare('SELECT * FROM clients').all()

const queryClientById = (id) => 
  db.prepare(`SELECT * FROM clients WHERE id = ?`).get(id)

const queryDiscountsByClientId = (id) => 
  db.prepare(`
    SELECT serviceId, discountPercent 
    FROM client_discounts 
    WHERE clientId = ?
  `).all(id)

const queryClientByPhone = (phone) => 
  db.prepare(`SELECT * FROM clients WHERE phone = ?`).get(phone)

const insertClient = (name, phone, isRegular, isAllergic) => 
  db.prepare(`
    INSERT INTO clients(name, phone, isRegular, isAllergic)
    VALUES (?, ?, ?, ?)
  `).run(name, phone, isRegular, isAllergic)

const updateClient = (name, phone, isRegular, isAllergic, id) => 
  db.prepare(`
    UPDATE clients
    SET name = ?, phone = ?, isRegular = ?, isAllergic = ?
    WHERE id = ?
  `).run(name, phone, isRegular, isAllergic, id)

const deleteClient = (id) => 
  db.prepare(`DELETE FROM clients WHERE id = ?`).run(id)

module.exports = { 
  queryClients, 
  queryClientById, 
  queryDiscountsByClientId,
  queryClientByPhone,
  insertClient,
  updateClient,
  deleteClient
}