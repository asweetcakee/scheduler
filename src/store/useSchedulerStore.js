import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { startOfToday, subDays, addDays } from "date-fns"

const DEFAULT_FORM_DATA = {
  id: null,
  staffId: null,
  date: '',
  startTime: '',
  endTime: '',
  services: [
    {
      serviceId: null,
      duration: 0,
      price: 0.00,
      discountPercent: 0,
      discountValue: 0.00,
      total: 0.00
    }
  ],
  clientId: null,
  clientName: '',
  clientPhone: '',
  appointmentStatus: 'scheduled', // 'scheduled', 'completed', 'canceled'
  
  // For future use when we implement notifications
  notificationSettings: {
    remind: false,  // whether to send a reminder to the client
    requestedReview: false, // remind to ask for review after appointment
  },

  adminNotes: '', // for internal use, not visible to clients,
  appointmentColor: '#60f63b'
}

export const useSchedulerStore = create(devtools((set, get) => ({
  // Global state for the scheduler app
  selectedDate: startOfToday(),
  viewMode: 'day', // 'day', 'week', 'list'
  
  allServices: [], // This will hold the list of all available services for easy access in modals
  
  // Time range and slot settings for TimeColumn and StaffColumn
  startHour: 7,
  endHour: 24,
  slotHeight: 20, // height in pixels for a 5-minute slot, 120px is 1 hour

  // Modal state for appointment creation/editing
  modal : {
    isOpen: false,
    mode: 'create', // 'create' or 'edit',
    originalData: null, // to hold original appointment data when editing
    formData: structuredClone(DEFAULT_FORM_DATA)
  },

  // Navigation and view mode actions
  goToNextDay: () => set((state) => ({ selectedDate: addDays(state.selectedDate, 1) })),
  goToPreviousDay: () => set((state) => ({ selectedDate: subDays(state.selectedDate, 1) })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Service management actions
  setAllServices: (services) => set({ allServices: services }),

  // Modal actions
  openCreateModalFromGrid: (initialData = {}) => set({
    modal: {
      isOpen: true,
      mode: 'create',
      originalData: null,
      formData: { ...structuredClone(DEFAULT_FORM_DATA), ...initialData }
    }
  }),
  openEditModal: (appointment) => set((state) => ({
    modal: {
      isOpen: true,
      mode: 'edit',
      originalData: { ...appointment }, // keep a copy of original data for comparison
      formData: {
        ...appointment, // pre-fill form with appointment data
        services: appointment.services || [
          {
            serviceId: appointment.serviceId || null,
            duration: appointment.duration || 0,
            price: appointment.price || 0.00,
            discountPercent: appointment.discountPercent || 0,
            discountValue: appointment.discountValue || 0.00,
            total: appointment.total || appointment.price || 0.00
          }
        ]
      }
    }
  })),
  closeModal: () => set((state) => ({
    modal: {
      ...state.modal,
      isOpen: false,
      mode: 'create',
      originalData: null,
      formData: structuredClone(DEFAULT_FORM_DATA)
    }
  })),
  
  // TimeColumn and StaffColumn settings
  setStartHour: (hour) => set({ startHour: hour }),
  setEndHour: (hour) => set({ endHour: hour }),
  setSlotHeight: (height) => set({ slotHeight: height }),
})))