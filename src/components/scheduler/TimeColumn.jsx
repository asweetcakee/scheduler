import { Fragment } from "react";

const TimeColumn = () => {
  const hours = Array.from({ length: 17 }, (_, i) => i + 7); // 7 AM to 11 PM

  // Logic: 1 hour = 120px total height
  // 30 mins = 60px
  // 15 mins = 30px
  // 5 mins = 10px (minimum placement unit)

  return (
    <div className="w-20 border-r border-slate-200 bg-slate-50 select-none">
      {hours.map((hour) => (
        <Fragment key={hour}>
          {/* HOUR BLOCK (00 to 30) */}
          <div className="relative h-[60px] border-b border-slate-300">
            {/* Hour Label */}
            <span className="absolute top-0 left-0 right-0 text-center text-[10px] font-bold text-slate-500 bg-white px-1 z-10">
              {`${hour}:00`}
            </span>
            
            {/* 15-minute subtle line */}
            <div className="absolute top-[30px] w-full border-t border-red-500 border-dashed" />
          </div>

          {/* HALF-HOUR BLOCK (30 to 00) */}
          <div className="relative h-[60px] border-b border-slate-300 ">
             {/* 30-min Label */}
             <span className="absolute top-0 left-0 right-0 transform -translate-y-1/2 text-center text-[10px] text-slate-400 bg-white px-1">
              {`${hour}:30`}
            </span>

            {/* 45-minute subtle line */}
            <div className="absolute top-[30px] w-full border-t border-slate-100 border-dashed" />
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export default TimeColumn