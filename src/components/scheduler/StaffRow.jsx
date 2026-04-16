const StaffRow = () => {
  return (
    <div className="flex bg-white h-16 border-b border-slate-200 sticky top-0">
      {MOCK_STAFF.map(staff => (
        <div
          key={staff.id}
          className="flex-1 min-w-[200px] flex items-center justify-center border-r border-slate-200 font-medium"
        >
          {staff.name}
        </div>
      ))}
    </div>
  )
}

export default StaffRow