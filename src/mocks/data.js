export const MOCK_STAFF_MD = [
  { id: 1, name: 'Aibar Orazaev' },
  { id: 2, name: 'Marina Nurgalieva' },
  { id: 3, name: 'Dmitry Volkov' },
  { id: 4, name: 'Svetlana Petrova' },
  { id: 5, name: 'Alexey Smirnov' },
  { id: 6, name: 'Olga Ivanova' },
  { id: 7, name: 'Sergey Kuznetsov' },
  { id: 8, name: 'Elena Sokolova' },
  { id: 9, name: 'Andrey Popov' },
  { id: 10, name: 'Natalia Morozova' },
  { id: 11, name: 'Vladimir Lebedev' },
  { id: 12, name: 'Irina Novikova' },
  { id: 13, name: 'Pavel Fedorov' },
  { id: 14, name: 'Anna Volkova' },
  { id: 15, name: 'Mikhail Orlov' },
]

export const MOCK_STAFF_SM = [
  { id: 1, name: 'Aibar Orazaev' },
  { id: 2, name: 'Marina Nurgalieva' },
  { id: 3, name: 'Dmitry Volkov' }
]

export const MOCK_APPOINTMENTS = []

export const MOCK_INITIAL_ZUSTAND_STATE = {
  "selectedDate": "2026-04-20T00:00:00.000Z",
  "viewMode": "day",
  "startHour": 7,
  "endHour": 24,
  "slotHeight": 20,
  "modal": {
    "isOpen": false,
    "mode": "create",
    "originalData": null,
    "seedData": {
      "id": null,
      "staffId": null,
      "date": "",
      "startTime": "",
      "endTime": "",
      "services": [
        {
          "serviceId": null,
          "duration": 0,
          "priceSnapshot": 0,
          "discountPercent": 0,
          "discountValue": 0,
          "total": 0
        }
      ],
      "clientId": null,
      "clientName": "",
      "clientPhone": "",
      "appointmentStatus": "scheduled",
      "notificationSettings": {
        "remindClient": false,
        "remindStaff": false,
        "remindBeforeMinutes": 60,
        "requestReview": false,
        "reviewAfterMinutes": 60
      },
      "adminNotes": "",
      "appointmentColor": "#60f63b"
    }
  },
  "modalRuntime": {
    "clientDiscounts": [],
    "availableSlots": [],
    "isFetchingSlots": false,
    "isFetchingDiscounts": false
  }
}

export const MOCK_APPOINTMENT = {
  id: "apt-789",
  staffId: "staff-01",
  date: "2026-04-20",
  startTime: "09:30",
  endTime: "10:30", // Calculated (60 mins total)
  services: [
    {
      serviceId: "srv-001",
      duration: 45,
      priceSnapshot: 80.00,
      discountPercent: 10,
      discountValue: 8.00,
      total: 72.00
    },
    {
      serviceId: "srv-002",
      duration: 15,
      priceSnapshot: 20.00,
      discountPercent: 0,
      discountValue: 0.00,
      total: 20.00
    }
  ],
  clientId: "client-456",
  clientName: "Jane Doe",
  clientPhone: "+7777-666-77-88",
  appointmentStatus: "scheduled",
  notificationSettings: {
    remindClient: true,
    remindStaff: false,
    remindBeforeMinutes: 120,
    requestReview: true,
    reviewAfterMinutes: 1440 // 24 hours later
  },
  adminNotes: "Client requested a window seat if possible.",
  appointmentColor: "#3b82f6"
}

export const mockSlots = Array.from({ length: 204 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 5
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const minutes = (totalMinutes % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}`
})