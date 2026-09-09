const clientRepository = require('../../repositories/clientRepository')
const clientsController = require('../../controllers/clientsController')

jest.mock('../../repositories/clientRepository', () => ({
  queryClients: jest.fn(),
  queryClientById: jest.fn(),
  queryDiscountsByClientId: jest.fn(),
  queryClientByPhone: jest.fn(),
  insertClient: jest.fn(),
  updateClient: jest.fn(),
  deleteClient: jest.fn()
}))

describe('Clients Controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllClients', () => {
    beforeEach(() => {
      req = {},
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      },
      jest.clearAllMocks()
    })

    it('returns all clients successfully', () => {
      clientRepository.queryClients.mockReturnValue([
        {
          "id": 1,
          "name": "Алия"
        },
        {
          "id": 2,
          "name": "Мольдир"
        }
      ])

      clientsController.getAllClients(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith([
        {
          "id": 1,
          "name": "Алия"
        },
        {
          "id": 2,
          "name": "Мольдир"
        }
      ])
    })

    it('returns 500 on error', () => {
      clientRepository.queryClients.mockImplementation(() => {
        throw new Error('Database connection failed')
      })
      clientsController.getAllClients(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch clients'
      })
    })
  })
})
