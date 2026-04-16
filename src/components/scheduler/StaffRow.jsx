const MOCK_STAFF = [
  { id: 1, name: 'Aibar Orazaev' },
  { id: 2, name: 'Marina Nurgalieva' },
  { id: 3, name: 'Dmitry Volkov' },
  { id: 4, name: 'Svetlana Petrova' },
  { id: 5, name: 'Alexey Smirnov' },
  { id: 6, name: 'Olga Ivanova' },
  { id: 7, name: 'Sergey Kuznetsov' },
  { id: 8, name: 'Elena Sokolova' },
  { id: 9, name: 'Andrey Popov' },
  { id: 10, name: 'Natalia Morozova' },
  { id: 11, name: 'Vladimir Lebedev' },
  { id: 12, name: 'Irina Novikova' },
  { id: 13, name: 'Pavel Fedorov' },
  { id: 14, name: 'Anna Volkova' },
  { id: 15, name: 'Mikhail Orlov' },
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