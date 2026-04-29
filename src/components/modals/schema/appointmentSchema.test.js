import { describe, test, expect } from 'vitest'
import {
  appointmentSchema,
  createClientSchema,
  createStaffSchema
} from './appointmentSchema'

const validAppointment = {
  staffId: 1,
  date: '2026-04-29',
  startTime: '10:00',
  endTime: '10:30',

  clientId: null,
  clientName: 'Алия Аскарова',
  clientPhone: '+7 777 000 00 00',

  services: [
    {
      serviceId: 1,
      duration: 30,
      priceSnapshot: 3500,
      discountPercent: 0,
      discountValue: 0,
      total: 3500,
    }
  ],

  notificationSettings: {
    remindClient: false,
    remindStaff: false,
    remindBeforeMinutes: 60,
    requestReview: false,
    reviewAfterMinutes: 60,
  },

  appointmentStatus: 'scheduled',
  adminNotes: '',
  appointmentColor: '#60f63b',
}