import { render, screen } from "@testing-library/react"
import TimeColumn from "./TimeColumn"
import { beforeEach, test } from "vitest"
import { useSchedulerStore } from "../../store/useSchedulerStore"

beforeEach(() => {
  useSchedulerStore.setState({
    slotHeight: 20,
    startHour: 9,
    endHour: 11
  })
})

const renderTimeColumn = () => {
  return render( <TimeColumn /> )
}

test('renders the correct number of slots based on store hours', () => {
  renderTimeColumn()
  const slots = screen.getAllByTestId('time-slot')
  const expectedSlots = 8 // 4 slots per hour (00, 15, 30, 45) for 2 hours
  expect(slots.length).toBe(expectedSlots)
})

test('applies bold styling and text only to full hours', () => {
  renderTimeColumn()
  const slots = screen.getAllByTestId('time-slot')
  slots.forEach(slot => {
    const textElement = slot.querySelector('span')
    const timeText = textElement.textContent.trim()
    if (timeText.endsWith('00')) {
      expect(textElement).toHaveClass('font-bold')
      expect(timeText).not.toBe('')
    } else if (timeText.endsWith('30')) {
      expect(textElement).not.toHaveClass('font-bold')
      expect(timeText).not.toBe('')
    } else {
      expect(textElement).not.toHaveClass('font-bold')
      expect(timeText).toBe('')
    }
  })
})

test('applies dashed border to half-hour slots', () => {
  renderTimeColumn()
  const slots = screen.getAllByTestId('time-slot')
  slots.forEach(slot => {
    const textElement = slot.querySelector('span')
    const timeText = textElement.textContent.trim()
    if (timeText.endsWith('30')) {
      expect(slot).toHaveClass('border-dashed')
    } else {
      expect(slot).not.toHaveClass('border-dashed')
    } 
  })
})

test('slots have the correct height style based on store and calculations', () => {
  renderTimeColumn()
  const slots = screen.getAllByTestId('time-slot')
  const expectedHeight = '60px' // This should match the calculated height based on slotHeight and the logic in calculateDisplaySlotHeight
  slots.forEach(slot => {
    expect(slot).toHaveStyle(`height: ${expectedHeight}`)
  })
})

test('handles empty or invalid store hours gracefully', () => {
  useSchedulerStore.setState({ startHour: null, endHour: null })
  renderTimeColumn()
  const slots = screen.queryAllByTestId('time-slot')
  expect(slots).toHaveLength(0) // Expect no slots to be rendered when hours are invalid
})
