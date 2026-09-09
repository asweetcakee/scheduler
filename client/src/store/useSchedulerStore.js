import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { startOfToday, subDays, addDays } from 'date-fns'

const DEFAULT_SEED = {
  id: null,
  staffId: null,
  date: '',
  startTime: '',
  endTime: '',  // read-only calculated from startTime + services duration
  services: [
    {
      serviceId: null,
      duration: 0,
      priceSnapshot: 0.00, // price at the time of booking
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
    // Reminder 1 pre-appointment, sent to client and/or staff
    remindClient: false,
    remindStaff: false,
    remindBeforeMinutes: 60,

    // Reminder 2 post-appointment review request, client only
    requestReview: false,
    reviewAfterMinutes: 60,
  },

  adminNotes: '', // for internal use, not visible to clients,
  appointmentColor: '#60f63b'
}

export const useSchedulerStore = create(devtools((set, get) => ({
  // Global state for the scheduler app
  selectedDate: startOfToday(),
  viewMode: 'day', // 'day', 'week', 'list'

  // Time range and slot settings for TimeColumn and StaffColumn
  startHour: 7,
  endHour: 24,
  slotHeight: 20, // height in pixels for a 5-minute slot, 120px is 1 hour

  // Modal state for appointment creation/editing
  modal : {
    isOpen: false,
    mode: 'create', // 'create' or 'edit',
    originalData: null, // copy of appointment before edits
    seedData: structuredClone(DEFAULT_SEED)
  },

  // fetched during session, cleared on close
  modalRuntime: {
    clientDiscounts: [], // [{ serviceId, discountPercent }]
    availableSlots: [], // ['07:00', '07:05', ...]
    isFetchingSlots: false,
    isFetchingDiscounts: false
  },

  // Navigation and view mode actions
  goToNextDay: () => set((state) => ({ selectedDate: addDays(state.selectedDate, 1) })),
  goToPreviousDay: () => set((state) => ({ selectedDate: subDays(state.selectedDate, 1) })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // Modal actions
  openCreateModal: (initialData = {}) => set({
    modal: {
      isOpen: true,
      mode: 'create',
      originalData: null,
      seedData: { ...structuredClone(DEFAULT_SEED), ...initialData }
    },
    modalRuntime: {
      clientDiscounts: [],
      availableSlots: [],
      isFetchingSlots: false,
      isFetchingDiscounts: false
    }
  }),
  openEditModal: (appointment) => set({
    modal: {
      isOpen: true,
      mode: 'edit',
      originalData: structuredClone(appointment),
      seedData: {
        ...structuredClone(DEFAULT_SEED),
        ...appointment,
        services: appointment.services?.length
          ? appointment.services
          : structuredClone(DEFAULT_SEED.services),
      },
    },
    modalRuntime: {
      clientDiscounts: [],
      availableSlots: [],
      isFetchingSlots: false,
      isFetchingDiscounts: false,
    },
  }),
  closeModal: () => set({
    modal: {
      isOpen: false,
      mode: 'create',
      originalData: null,
      seedData: structuredClone(DEFAULT_SEED),
    },
    modalRuntime: {
      clientDiscounts: [],
      availableSlots: [],
      isFetchingSlots: false,
      isFetchingDiscounts: false,
    },
  }),

  // Runtime setters (called by modal internals during session)
  setAvailableSlots: (slots) => set(s => ({ modalRuntime: { ...s.modalRuntime, availableSlots: slots } })),
  setIsFetchingSlots: (bool) => set(s => ({ modalRuntime: { ...s.modalRuntime, isFetchingSlots: bool } })),
  setClientDiscounts: (discounts) => set(s => ({ modalRuntime: { ...s.modalRuntime, clientDiscounts: discounts } })),
  setIsFetchingDiscounts: (bool) => set(s => ({ modalRuntime: { ...s.modalRuntime, isFetchingDiscounts: bool } })),

  // TimeColumn and StaffColumn settings
  setStartHour: (hour) => set({ startHour: hour }),
  setEndHour: (hour) => set({ endHour: hour }),
  setSlotHeight: (height) => set({ slotHeight: height }),
})))