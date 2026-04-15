import { create } from 'zustand'
import { startOfToday, subDays, addDays } from "date-fns"

export const useSchedulerStore = create((set) => ({
  selectedDate: startOfToday(),
  viewMode: 'day', // 'day', 'week', 'list'

  goToNextDay: () => set((state) => ({ selectedDate: addDays(state.selectedDate, 1) })),
  goToPreviousDay: () => set((state) => ({ selectedDate: subDays(state.selectedDate, 1) })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
}))