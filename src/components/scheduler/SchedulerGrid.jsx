import StaffRow from "./StaffRow";
import TimeColumn from "./TimeColumn";

const SchedulerGrid = () => {
  return (
    <div className="relative h-full w-full overflow-auto">
      <div className="sticky top-0 z-30 flex min-w-max bg-white">
        {/* The Anchor: Sticks to top AND left */}
        <div className="sticky left-0 z-40 w-20 h-16 border-slate-100 border-b border-r bg-white" />
        
        <StaffRow />
      </div>

      <div className="flex min-w-max">
        {/* 3. The Time Column - Sticky Left */}
        <div className="sticky left-0 z-20 bg-blue-500">
          <TimeColumn />
        </div>

        {/* 4. The Grid Body (Cells go here in Stage 3) */}
        <div className="flex-1 bg-purple-500 min-w-max">
          {/* This is where StaffColumns will go later */}
          <div className="h-[1920px] w-max repeating-grid-background" />
        </div>
      </div>
      
    </div>
  )
}

export default SchedulerGrid;