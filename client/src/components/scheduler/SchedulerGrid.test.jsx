import { test, expect } from "vitest";
import SchedulerGrid from "./SchedulerGrid";
import { render, screen } from "@testing-library/react";
import { MOCK_STAFF_SM } from '../../mocks/data.js'

const renderSchedulerGrid = () => {
  return render ( <SchedulerGrid /> )
}

test('Renders the correct number of staff columns based on the data', () => {
  renderSchedulerGrid()
  const staffColumns = screen.getAllByTestId('staff-column')
  expect(staffColumns.length).toBe(MOCK_STAFF_SM.length)
})

test('Sticky time column header is present', () => {
  renderSchedulerGrid()
  const cornerBlock = screen.getByTestId('corner-block')
  expect(cornerBlock).toBeInTheDocument()
})

test('Time column is present', () => {
  renderSchedulerGrid()
  const timeColumn = screen.getByTestId('time-column')
  expect(timeColumn).toBeInTheDocument()
})