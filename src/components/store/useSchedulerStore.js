import { create } from 'zustand'
import { startOfToday, subDays, addDays } from "date-fns"

export const useSchedulerStore = create((set) => ({
  selectedDate: startOfToday(),
  viewMode: 'day', // 'day', 'week', 'list'
  startHour: 7,
  endHour: 24,
  slotHeight: 10, // height in pixels for a 5-minute slot, 120px is 1 hour

  goToNextDay: () => set((state) => ({ selectedDate: addDays(state.selectedDate, 1) })),
  goToPreviousDay: () => set((state) => ({ selectedDate: subDays(state.selectedDate, 1) })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setStartHour: (hour) => set({ startHour: hour }),
  setEndHour: (hour) => set({ endHour: hour }),
  setSlotHeight: (height) => set({ slotHeight: height }),
}))