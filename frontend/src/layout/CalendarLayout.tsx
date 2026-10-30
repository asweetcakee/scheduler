import type { CalendarResponse } from '../types/calendar'

type CalendarLayoutProps = {
    calendar: CalendarResponse
}

export const CalendarLayout = ({
    calendar,
}: CalendarLayoutProps) => {
    const { masters, time_range } = calendar

  return (
    <div className='mx-4 p-4 overflow-x-auto bg-surface rounded-lg'>
        {masters.map(master => <span>{master.name}</span>)}
    </div>
  )
}