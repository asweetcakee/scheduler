const StaffColumn = ({ staff }) => {
  // Depending on the number of staff in MOCK_STAFF, the column width in StaffColumn (currently set to min-w-[200px]) may need to be adjusted to fit the layout properly.
  // Write here an adaptive calculation for column width
  return (
    <div className="flex flex-col flex-1 min-w-[200px] border-r border-slate-200">

      {/* Header cell — sticks to top */}
      <div className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200
                      flex items-center justify-center font-medium">
        {staff.name}
      </div>

      {/* Body cell — appointments go here later */}
      <div className="h-[1920px] relative">
        {/* AppointmentBlock components will be absolutely positioned here */}
      </div>

    </div>
  );
};

export default StaffColumn;