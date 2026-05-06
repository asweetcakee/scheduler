import { render, screen } from "@testing-library/react"
import { beforeEach, test, expect, vi } from "vitest"
import StaffColumn from "./StaffColumn"
import { useSchedulerStore } from '../../store/useSchedulerStore'
import userEvent from "@testing-library/user-event"

let staff

beforeEach(() => {
  staff = {
    id: 1,
    name: 'Bekezhan Murat'
  }

  useSchedulerStore.setState({
    startHour: 9,
    endHour: 11,
    slotHeight: 20,
    openCreateModal: vi.fn(),
    selectedDate: new Date('2026-04-26')
  })
})

const renderStaffColumn = (overrides = {}) => {
  return render(
    <StaffColumn 
      staff={staff}
      {...overrides}
    />
  )
}

test('renders staff name in header', () => {
  renderStaffColumn()
  const staffName = screen.getByText(staff.name)
  expect(staffName.textContent).toBe('Bekezhan Murat')
})

test('renders correct height for grid based on store values', () => {
  renderStaffColumn()
  const column = screen.getByTestId('staff-column')
  expect(column).toHaveStyle({ height: '480px' }) // 2 hours * 60 minutes/hour / 5 minutes per slot * 20px per slot = 480px
})

test('renders correct number of slots based on store values', () => {
  renderStaffColumn()
  const totalHours = 2
  const expectedSlots = 24
  const slotElements = screen.getAllByTitle(/Add appointment at slot/i)
  expect(slotElements.length).toBe(expectedSlots)
})

test('background lines are calculated correctly based on hour and half-hour heights', () => {
  renderStaffColumn()
  const column = screen.getByTestId('staff-column')
  const { backgroundImage, backgroundSize }= column.style

  expect(backgroundImage).toContain('rgb(226, 232, 240)') // #e2e8f0 in rgb format
  expect(backgroundImage).toContain('rgb(241, 245, 249)') // #f1f5f9 in rgb format

  expect(backgroundSize).toBe('100% 240px, 100% 120px') // hourHeight = 240px, halfHourHeight = 120px
})

test('opens create modal with correct time when clicking the first slot', async () => {
  renderStaffColumn()
  const openModalSpy = useSchedulerStore.getState().openCreateModal
  
  const firstSlot = screen.getAllByTitle(/Add appointment at slot/i)[0]
  await userEvent.click(firstSlot)

  expect(openModalSpy).toHaveBeenCalledWith({
    staffId: staff.id,
    date: '2026-04-26',
    startTime: '09:00'
  })
})

test('opens create modal with correct time for a mid-day slot', async () => {
  renderStaffColumn()
  const openModalSpy = useSchedulerStore.getState().openCreateModal
  
  const midSlotIndex = 7 // 09:35 slot (9:00 + 7*5 min = 09:35)
  const midSlot = screen.getAllByTitle(/Add appointment at slot/i)[midSlotIndex]
  await userEvent.click(midSlot)

  expect(openModalSpy).toHaveBeenCalledWith({
    staffId: staff.id,
    date: '2026-04-26',
    startTime: '09:35'
  })
})

test('handles empty or same start/end hours gracefully', () => {
  useSchedulerStore.setState({ startHour: 9, endHour: 9 })
  renderStaffColumn()
  const column = screen.getByTestId('staff-column')
  expect(column).toHaveStyle({ height: '0px' })
})



