import StaffRow from "./StaffRow";
import TimeColumn from "./TimeColumn";

const SchedulerGrid = () => {
  return (
    <div className="relative h-full w-full overflow-auto">
      {/* 1. The "Corner Block" - Z-30 to stay on top of everything */}
      <div className="sticky top-0 left-0 z-30 w-20 h-16 bg-red-500 border-b border-r border-slate-200">
        {/* Top left empty corner */}
      </div>

      {/* 2. The Staff Row - Sticky Top */}
      <div className="absolute top-0 left-20 right-0 z-20 bg-green-500">
        <StaffRow />
      </div>

      <div className="flex">
        {/* 3. The Time Column - Sticky Left */}
        <div className="sticky left-0 z-10 bg-blue-500">
          <TimeColumn />
        </div>

        {/* 4. The Grid Body (Cells go here in Stage 3) */}
        <div className="flex-1 bg-purple-500 min-w-max">
          {/* This is where StaffColumns will go later */}
          <div className="h-[1500px] w-[1000px] repeating-grid-background" />
        </div>
      </div>
      
    </div>
  )
}

export default SchedulerGrid;