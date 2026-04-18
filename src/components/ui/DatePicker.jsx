import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSchedulerStore } from '../../store/useSchedulerStore'
import { format } from 'date-fns'

const DatePicker = () => {
  const { selectedDate, goToNextDay, goToPreviousDay } = useSchedulerStore()
  
  return(
    <div className="flex items-center gap-4">
      <button onClick={goToPreviousDay} className="p-2 hover:bg-slate-100 rounded">
        <ChevronLeft size={20}/>
      </button>

      <span className='font-bold'>
        { format(selectedDate, 'EEE, d MMMM') }
      </span>

      <button onClick={goToNextDay} className="p-2 hover:bg-slate-100 rounded">
        <ChevronRight size={20}/>
      </button>
    </div>
  )
}

export default DatePicker