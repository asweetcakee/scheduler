const MOCK_STAFF = [
  { id: 1, name: 'Aibar Orazaev' },
  { id: 2, name: 'Marina Nurgalieva' },
  { id: 3, name: 'Dmitry Volkov' },
  { id: 4, name: 'Svetlana Petrova' },
  { id: 5, name: 'Alexey Smirnov' },
];

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